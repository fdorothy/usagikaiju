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
import { Rainbow } from './rainbow'

export class Game {
  constructor() {
    this.engine = null;
    this.player = null;
    this.width = 70
    this.height = 25
    this.inputDiff = [0, 0]
    this.display = new Display({width: this.width, height: this.height, fg: Util.colors.bright, bg: 'black', fontSize: 20});
    document.getElementById("container").appendChild(this.display.getContainer());
    document.getElementById("container")
    this.drawer = new Draw(this.display)
    this.statusWidth = 17
    this.mapWidth = this.width - this.statusWidth - 1
    this.mapHeight = this.height
    this.messages = new Messages(this, 3)
    this.dialogue = new Dialogue(inkStoryJson, this);
    this.status = new Status(this, this.statusWidth)
    this.countdown = 10
    this.lastTime = this.ms()
    this.fps = 20
    this.deltaTime = 0.0
    this.rainbow = new Rainbow(this)

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

  pushOptions(options, cb) {
    const oldOptions = this.game.display.getOptions()
    this.game.display.setOptions(options)
    cb()
    this.game.display.setOptions(oldOptions)
  }

  screenShake() {
    this.display.getContainer().className = "shake";
    setTimeout(() => { this.display.getContainer().className = "" }, 100)
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
      'toddler': {token: 'ピ', size: 3, xp: 3}
    }
  }

  placeItem(itemName, x, y) {
    const itemType = this.itemTypes[itemName]
    const item = new Item(x, y, this)
    item.setToken(itemType.token, Util.colors.blood)
    item.name = itemName
    item.size = itemType.size
    item.color = Util.colors.important
    item.xp = itemType.xp
    item.onPickup = (player) => {
      if (this.player.size >= item.size) {
        this.messages.push(item.name + ', yum +' + item.xp)
        this.player.points += item.xp
        this.countdown += 2
      } else {
        this.messages.push(item.name + ' is too big to eat')
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

  generateLevel1(freeCells) {
    const items = {
      'pellet': 20,
      'rabbit poop': 10,
      'peach': 5,
      'sake': 2,
      'toddler': 1
    }

    // spread a few rabbit pellets in each room
    for (const [v, n] of Object.entries(items)) {
      console.log([v, n])
      for (let i=0; i<n; i++) {
        const [x, y] = this.randomFreeCell(freeCells)
        this.placeItem(v, x, y)
      }
    }
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
    if (this.inputDiff[0] == 0 && this.inputDiff[1] == 0)
      return false
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
    return true
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
        const moved = this.checkPlayerMovement()
        if (moved)
          this.checkItems()
        this.removeDeadMonsters()
        for (let i=0; i<this.monsters.length; i++) {
          await this.monsters[i].act()
        }
        this.checkGameOver()
        this.draw()
        this.rainbow.update()
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
        this.screenShake()
        this.items = this.items.filter(m => !m.pickedUp)
      } else {
        this.messages.push(item.name + ' is too big to eat')
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
    //this.fillDungeon()
    this.generateLevel1(freeCells)
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
      if (v == 'ロ') {
        const brightness = Util.grayscale(1.0 / 10.0)
        const color = this.rainbow.getSpriteAnim([brightness, Math.clamp(brightness-0.5, 0.0, 1.0)], 0, 0.1)
        this.display.draw(x, y, v, color)
      }
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
      let color2 = Color.toHex(Util.minGray)
      let bg = 'black'
      let v = this.map[key]
      if (v == '#')
        v = 'コ'
      if (key in this.fov) {
        const flicker = this.rainbow.getSpriteAnim([1.0, 1.0-RNG.getUniform() / 10.0], 0, 1)
        color = Util.grayscale((1.0 - this.fov[key] / 10.0)*flicker)
        color2 = Util.grayscale((1.0 - this.fov[key] / 10.0)*flicker * 0.5)
      }
      if (v != '') {
        const offset = [0.05, 0.2]
        this.display.draw(x-offset[0], y-offset[1], v, color, bg)
        this.display.draw(x+offset[0], y+offset[1], v, color2, bg)
      }
    }
  }

  draw() {
    this.display.clear()
    this.drawMapFieldOfView()
    //this.drawWholeMap()
    this.drawCompositeMap()
    this.items.forEach((m) => m.draw(this.fov))
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
  }

  worldToScreen([x, y]) {
    return [x + this.statusWidth + 1, y]
  }

  pushVariables() {
    this.dialogue.story.variablesState["points"] = this.player.points
    this.dialogue.story.variablesState["size"] = this.player.size
    this.dialogue.story.variablesState["time"] = this.player.maxTime
    this.dialogue.story.variablesState["size_cost"] = this.player.upgrade_size_pts
    this.dialogue.story.variablesState["time_cost"] = this.player.upgrade_time_pts
  }
}
