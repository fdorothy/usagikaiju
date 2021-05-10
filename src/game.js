import { DIRS } from 'rot-js/lib/index';
import { Map, Display, Engine, KEYS, RNG, FOV, Color } from 'rot-js/lib/index';
import { Player } from './player'
import { Util } from './util'
import { Dialogue } from './story'
let inkStoryJson = require('../story.ink.json');
import { Messages } from './messages'
import { Status } from './status'
import { Item } from './item'
import { Draw } from './draw'

export class Game {
  constructor() {
    this.engine = null;
    this.player = null;
    this.width = 120
    this.height = 40
    this.inputDiff = [0, 0]
    this.display = new Display({width: this.width, height: this.height, fg: Util.colors.bright, bg: 'black'});
    document.body.appendChild(this.display.getContainer());
    this.drawer = new Draw(this.display)
    this.statusWidth = 17
    this.messageHeight = 4
    this.mapWidth = this.width - this.statusWidth - 1
    this.mapHeight = this.height - this.messageHeight - 1
    this.dialogue = new Dialogue(inkStoryJson, this);
    this.messages = new Messages(this, this.statusWidth+2, this.messageHeight-1);
    this.status = new Status(this, this.statusWidth)
    this.countdown = 10
    this.lastTime = this.ms()
    this.fps = 30
    this.deltaTime = 0.0

    // handle keyboard events here
    const handleEvent = this.handleEvent
    window.addEventListener("keydown", (e) => handleEvent(e))

    this.restart()
    this.mainLoop()
  }

  static debug = false

  restart() {
    this.createItemTypes()
    this.player = new Player(0, 0, this)
    this.monsters = []
    this.items = []
    this.visible = []
    this.level = 1
    this.hasMap = false
    this.startLevel()
    this.dialogue.play("title")
  }

  timestamp() {
    return new Date().getTime() / 1000;
  }

  ms() {
    const d = new Date();
    const seconds = d.getTime();
    return seconds;
  }

  createItemTypes() {
    this.itemTypes = {
      'pellet': {token: '・', size: 1, xp: 1},
      'peach': {token: 'の', size: 2, xp: 2},
      'rabbit poop': {token: '゛', size: 1, xp: 1},
      'sake': {token: 'S', size: 3, xp: 2},
      'toddler': {token: 'ピ', size: 3, xp: 5}
    }
  }

  placeItem(itemName, x, y) {
    const itemType = this.itemTypes[itemName]
    const item = new Item(x, y, this)
    item.setToken(itemType.token, Util.colors.blood)
    item.name = itemName
    item.size = itemType.size
    item.xp = itemType.xp
    item.onPickup = (player) => {
      if (this.player.size >= item.size) {
        this.messages.push('You ate a ' + item.name + ', yum')
        this.player.points += item.xp
      }
    }
    this.items.push(item)
  }

  onExit() {
    this.level++
    this.hasMap = false
    this.startLevel()
  }

  newGame() {
    this.startLevel()
  }

  startLevel() {
    this.countdown = this.player.maxTime
    this.lastTime = this.ms()
    this.startTime = this.timestamp()
    this.generateMap();
    //this.dialogue.play(`level${this.level}`, () => {
    this.messages.push("Use the arrow keys to move")
    this.messages.push("Eat what you can")
    //})
  }

  handleEvent = (e) => {
    let keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    if (Game.debug) {
      if (e.keyCode == 77) { // m
        this.game.hasMap = true
      }
      if (e.keyCode == 78) { // n
        this.game.onExit()
      }
    }

    let code = e.keyCode;

    if (!(code in keyMap)) {
      return;
    }
    e.preventDefault()
    let diff = DIRS[8][keyMap[code]];
    this.inputDiff = diff
  }

  checkPlayerMovement() {
    let newX = this.player.x + this.inputDiff[0];
    let newY = this.player.y + this.inputDiff[1];
    this.inputDiff = [0,0]

    let newKey = newX + "," + newY;

    let key = Util.key(this.player.x, this.player.y)
    if (this.canPlayerMove(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
    } else {
      const m = this.getMonster(newX, newY);
      if (m) {
        this.combat(m)
      } else {
        //this.messages.push(`The stone wall is cold.`)
      }
    }
  }

  handleStoryEvent(event) {
    const name = event[0].trim()
    switch (name) {
    case ':newgame':
      this.newGame();
      break;
    case ':restart':
      this.restart()
      break;
    case ':continue':
      this.startLevel()
      break;
    case ':upgrade_size':
      if (this.player.upgrade_size())
        this.dialogue.play("valid_selection")
      else
        this.dialogue.play("invalid_selection")
      break;
    case ':upgrade_time':
      if (this.player.upgrade_time())
        this.dialogue.play("valid_selection")
      else
        this.dialogue.play("invalid_selection")
      break;
    default: break;
    }
  }

  sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  async mainLoop() {
    while (1) {
      if (this.dialogue.showing) {
        this.display.clear()
        this.pushVariables()
        await this.dialogue.act()
      } else {
        this.draw()
        this.checkPlayerMovement()
        this.checkItems()
        this.removeDeadMonsters()
        for (let i=0; i<this.monsters.length; i++) {
          await this.monsters[i].act()
        }
        this.checkGameOver()
        this.draw()
        const ts = this.ms()
        const sleepTime = 1000 / this.fps - (ts - this.lastTime)
        if (sleepTime > 0) {
          await this.sleep(sleepTime)
          this.deltaTime = 1 / this.fps
        } else {
          await this.sleep(10)
          this.deltaTime = 1 / this.fps
        }
        this.lastTime = ts
      }
    }
  }

  removeDeadMonsters() {
    this.monsters.forEach((m) => {
      if (m.dead) {
        this.player.addXP(m.xp)
      }
    })

    this.monsters = this.monsters.filter(m => !m.dead)
  }

  checkItems() {
    const item = this.getItem(this.player.x, this.player.y)
    if (item) {
      if (this.player.size >= item.size) {
        item.pickup(this.player)
        this.items = this.items.filter(m => !m.pickedUp)
      }
    }
  }

  checkGameOver() {
    if (this.player.dead) {
      this.dialogue.play("upgrade")
    }

    this.countdown -= this.deltaTime
    if (this.countdown <= 0) {
      this.dialogue.play("upgrade")
      this.countdown = 0.0
    }
  }

  canMonsterMove(x, y) {
    if (this.getMonster(x, y))
      return false
    const key = Util.key(x,y)
    return ((key in this.map && this.map[key] != '#'))
  }

  canPlayerMove(x, y) {
    if (this.getMonster(x, y))
      return false
    const key = Util.key(x,y)
    return ((key in this.map && this.map[key] != '#'))
  }

  getMonster(x, y) {
    for (let i=0; i<this.monsters.length; i++) {
      let m = this.monsters[i];
      if (m.x == x && m.y == y)
        return m;
    }
    return null;
  }

  getItem(x, y) {
    for (let i=0; i<this.items.length; i++) {
      let m = this.items[i];
      if (m.x == x && m.y == y)
        return m;
    }
    return null;
  }

  generateMap() {
    this.map = {};
    this.knownMap = {};
    this.items = []
    this.monsters = []
    let digger = new Map.Digger(this.mapWidth, this.mapHeight, {roomWidth: [10,15], roomHeight: [10,15], dugPercentage: 0.6});
    let freeCells = [];

    let digCallback = function(x, y, value) {
      let key = Util.key(x, y);
      if (value) {
        this.map[key] = "#";
      } else {
        this.map[key] = " ";
        freeCells.push(key);
      }
    }

    digger.create(digCallback.bind(this));

    this.freeRooms = RNG.shuffle(digger.getRooms())

    this.setPlayerPositionRandom();
    this.fillDungeon()
  }

  fillDungeon() {
    let contents = {}
    for (var key in this.itemTypes) {
      contents[key] = 1
    }
    this.placeMonstersAndItemsInRooms(contents)
  }

  nextRoom() {
    return this.freeRooms.pop()
  }

  roomCenter(room) {
    return [Math.trunc((room.getLeft() + room.getRight()) / 2.0),
            Math.trunc((room.getTop() + room.getBottom()) / 2.0)]
  }

  setPlayerPositionRandom() {
    const room = this.nextRoom()
    const center = this.roomCenter(room)
    this.player.x = center[0]
    this.player.y = center[1]
  }

  placeMonstersAndItemsInRooms(contents) {
    let room
    while (room = this.nextRoom()) {
      const v = RNG.getWeightedValue(contents)
      const center = this.roomCenter(room)
      this.placeAround(v, center, 2)
    }
  }

  placeAround(itemName, xy, size = 1) {
    for (let x=xy[0]-size; x<xy[0]+size; x++) {
      for (let y=xy[1]-size; y<xy[1]+size; y++) {
        this.placeItem(itemName, x, y)
      }
    }
  }

  randomFreeCell(freeCells) {
    const index = Math.floor(RNG.getUniform() * freeCells.length);
    const key = freeCells.splice(index, 1)[0];
    const [x, y] = Util.parseKey(key)
    return [x, y]
  }

  drawWholeMap() {
    for (let key in this.map) {
      const [x, y] = this.worldToScreen(Util.parseKey(key))
      const v = this.map[key];
      this.display.draw(x, y, v)
    }
  }

  drawMapFieldOfView() {
    const game = this
    let fov = new FOV.PreciseShadowcasting((x, y) => {
      var key = x+","+y;
      if (key in game.map) { return (game.map[key] === ' '); }
      return false;
    });

    /* output callback */
    this.fov = {}
    fov.compute(this.player.x, this.player.y, 10, function(x, y, r, visibility) {
      const key = Util.key(x,y)
      const [sx, sy] = game.worldToScreen([x, y])
      game.fov[key] = r
      game.knownMap[key] = 1
    });
  }

  drawCompositeMap() {
    const map = this.hasMap ? this.map : this.knownMap
    for (let key in map) {
      const [x, y] = this.worldToScreen(Util.parseKey(key))
      let color = Color.toHex(Util.minGray)
      let bg = 'black'
      let v = this.map[key]
      if (key in this.fov) {
        const light = this.fov[key]
        if (v == '#') {
          color = Util.grayscale(1.0 - this.fov[key] / 10.0)
        } else {
          color = Util.grayscale(1.0 - this.fov[key] / 10.0)
        }
      }
      this.display.draw(x, y, this.map[key], color, bg)
    }
  }

  draw() {
    this.display.clear()
    this.drawMapFieldOfView()
    this.drawCompositeMap()
    this.items.forEach((m) => m.draw(this.hasMap ? this.map : this.knownMap))
    this.player.draw()
    this.monsters.forEach((m) => m.draw(this.fov))

    // figure out who is visible
    this.status.monsters = this.monsters.filter((m) => m.isVisible(this.fov))

    const items = this.items.filter((m) => m.isVisible(this.fov))
    const uniqueItemsMap = items.reduce((map, obj) => (map[obj.name] = obj, map), {})
    const keys = Object.keys(uniqueItemsMap).sort()
    this.status.items = keys.map(key => uniqueItemsMap[key])

    if (this.dialogue)
      this.dialogue.draw()
    if (this.messages)
      this.messages.draw()
    if (this.status)
      this.status.draw()
    this.drawer.drawLine(this.statusWidth, 0, this.statusWidth, this.height, '|', '|')
    this.drawer.drawLine(this.statusWidth, this.messageHeight, this.width, this.messageHeight, '-', '+')
  }

  worldToScreen([x, y]) {
    return [x + this.statusWidth + 1, y + this.messageHeight + 1]
  }

  pushVariables() {
    this.dialogue.story.variablesState["points"] = this.player.points
    this.dialogue.story.variablesState["size"] = this.player.size
    this.dialogue.story.variablesState["time"] = this.player.maxTime
    this.dialogue.story.variablesState["size_cost"] = this.player.upgrade_size_pts
    this.dialogue.story.variablesState["time_cost"] = this.player.upgrade_time_pts
  }
}
