import { Map, Display, Engine, KEYS, RNG, FOV, Color } from 'rot-js/lib/index';
import { Player } from './player'
import { Util } from './util'
import { Dialogue } from './story'
let inkStoryJson = require('../story.ink.json');
import { Messages } from './messages'
import { Status } from './status'
import { Monster } from './monster'
import { Item } from './item'

export class Game {
  constructor() {
    this.engine = null;
    this.player = null;
    this.width = 100
    this.height = 40
    this.display = new Display({width: this.width, height: this.height});
    document.body.appendChild(this.display.getContainer());
    this.statusWidth = 15
    this.messageHeight = 4
    this.mapWidth = this.width - this.statusWidth - 1
    this.mapHeight = this.height - this.messageHeight - 1
    this.dialogue = new Dialogue(inkStoryJson, this);
    this.messages = new Messages(this, this.statusWidth+2, this.messageHeight-1);
    this.status = new Status(this, this.statusWidth)

    this.restart()
    this.mainLoop()
  }

  static debug = true

  restart() {
    this.player = new Player(0, 0, this)
    this.monsters = []
    this.items = []
    this.createSpecialRooms()
    this.level = 1
    this.hasMap = false
    this.dialogue.play("title")
  }

  createSpecialRooms() {
    this.specialRooms = [
      this.createSpecialRoom('Old Printing Press', 'printing_press'),
      this.createSpecialRoom('Dinosaur Skeleton', 'dinosaur_skeleton')
    ]
  }

  createSpecialRoom(name, story) {
    let item = new Item(0, 0, this)
    item.name = name
    item.setToken('?', 'white')
    item.story = story
    return item
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
    this.generateMap();
    this.dialogue.play(`level${this.level}`, () => {
      this.messages.push("Use the arrow keys to move")
    })
  }

  handleStoryEvent(event) {
    const name = event[0].trim()
    switch (name) {
    case ':newgame':
      this.newGame()
      break;
    case ':restart':
      this.restart()
      break;
    case ':levelup':
      switch (event[1].trim()) {
      case 'hp':
        this.player.hp += 5
        this.player.maxHp += 5
        this.messages.push("Hitpoints increased by 5")
        break;
      case 'attack':
        this.player.attack += 1
        this.messages.push("Attack increased by 1")
        break;
      case 'defense':
        this.player.defense += 1
        this.messages.push("Defense increased by 1")
        break;
      case 'weapon':
        this.player.weapon += parseInt(event[2].trim())
        this.messages.push("You pickup a new weapon.")
        break;
      default: break
      }
      break;
    case ':map':
      this.hasMap = true
      break;
    case ':boy':
      this.hasBoy = true
    default: break;
    }
  }

  async mainLoop() {
    while (1) {
      if (this.dialogue.showing) {
        console.log('dialogue turn')
        await this.dialogue.act()
      } else {
        console.log('start of turn')
        this.draw()
        const result = await this.player.act()
        if (result) {
          this.checkItems()
          this.removeDeadMonsters()
          for (let i=0; i<this.monsters.length; i++) {
            await this.monsters[i].act()
          }
          this.checkGameOver()
        }
        this.draw()
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
      item.pickup(this.player)
      this.items = this.items.filter(m => !m.pickedUp)
    }
  }

  checkGameOver() {
    if (this.player.dead) {
      this.dialogue.play("gameover")
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
    let digger = new Map.Digger(this.mapWidth, this.mapHeight);
    let freeCells = [];

    let digCallback = function(x, y, value) {
      let key = Util.key(x, y);
      if (value) {
        this.map[key] = "#";
      } else {
        this.map[key] = ".";
        freeCells.push(key);
      }
    }

    digger.create(digCallback.bind(this));

    this.freeRooms = RNG.shuffle(digger.getRooms())

    this.setPlayerPositionRandom();
    this.fillDungeon()
  }

  fillDungeon() {
    switch (this.level) {
    case 1:
      this.placeExit()
      this.placeSpecialRoom()
      this.placeMonstersAndItemsInRooms()
      break;
    case 2:
      this.placeExit()
      this.placeSpecialRoom()
      this.placeMonstersAndItemsInRooms()
      break;
    case 3:
      this.placeFinalExit()
      this.placeBoy()
      this.placeMonstersAndItemsInRooms()
      break;
    default: break;
    }
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

  placeExit() {
    const room = this.nextRoom()
    const [x, y] = this.roomCenter(room)
    const exit = new Item(x, y, this)
    exit.name = 'exit'
    exit.token = '~'
    exit.color = 'blue'
    exit.onPickup = (player) => {
      this.onExit()
    }
    this.items.push(exit)
  }

  placeFinalExit() {
    const room = this.nextRoom()
    const [x, y] = this.roomCenter(room)
    const exit = new Item(x, y, this)
    exit.name = 'exit'
    exit.token = '~'
    exit.color = 'blue'
    exit.onPickup = (player, item) => {
      if (this.hasBoy) {
        this.onExit()
      } else {
        this.dialogue.play('missing_boy')
        item.pickedUp = false
      }
    }
    this.items.push(exit)
  }

  placeSpecialRoom() {
    let specialRoom = this.specialRooms.pop()
    if (specialRoom) {
      let room = this.nextRoom()
      this.placeItem(room, specialRoom)
    }
  }

  placeBoy() {
    let item = new Item(0, 0, this)
    item.name = "The Missing Boy"
    item.setToken('b', 'white')
    item.story = 'boy'
    let room = this.nextRoom()
    this.placeItem(room, item)
  }

  placeMonstersAndItemsInRooms() {
    let room
    const contents = {
      "empty": 1,
      "potion": 1,
      "monster": 2
    }
    while (room = this.nextRoom()) {
      const v = RNG.getWeightedValue(contents)
      switch (v) {
      case "empty": break;
      case "potion":
        this.placePotion(room)
        break;
      case "monster":
        this.placeMonster(room)
        break;
      }
    }
  }

  placeItem(room, item) {
    const [x, y] = this.roomCenter(room)
    item.x = x
    item.y = y
    this.items.push(item)
  }

  placePotion(room) {
    const [x, y] = this.roomCenter(room)
    const item = new Item(x, y, this)
    item.name = 'potion'
    item.token = 'p'
    item.color = 'green'
    item.onPickup = (player) => {
      this.messages.push('You found a tonic. Health increases by 5')
      this.player.heal(5)
    }
    this.items.push(item)
  }

  placeMonster(room) {
    const [x, y] = this.roomCenter(room)
    this.monsters.push(new Monster(x, y, this))
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
      if (key in game.map) { return (game.map[key] === '.'); }
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
    if (this.dialogue)
      this.dialogue.draw()
    if (this.messages)
      this.messages.draw()
    if (this.status)
      this.status.draw()
    this.drawLine(this.statusWidth, 0, this.statusWidth, this.height, '|', '|')
    this.drawLine(this.statusWidth, this.messageHeight, this.width, this.messageHeight, '-', '+')
  }

  worldToScreen([x, y]) {
    return [x + this.statusWidth + 1, y + this.messageHeight + 1]
  }

  drawBox(rect, v) {
    for (let x=rect[0]; x<=rect[2]; x++) {
      for (let y=rect[1]; y<=rect[3]; y++) {
        this.display.draw(x, y, v)
      }
    }
  }

  drawBorder(rect, vx, vy, vc) {
    let x = 0, y = 0;
    for (x=rect[0]; x<=rect[2]; x++) {
      this.display.draw(x, rect[1], vx)
    }
    for (x=rect[0]; x<=rect[2]; x++) {
      this.display.draw(x, rect[3], vx)
    }
    for (y=rect[1]; y<=rect[3]; y++) {
      this.display.draw(rect[0], y, vy)
    }
    for (y=rect[1]; y<=rect[3]; y++) {
      this.display.draw(rect[2], y, vy)
    }
    this.display.draw(rect[0], rect[1], vc)
    this.display.draw(rect[0], rect[3], vc)
    this.display.draw(rect[2], rect[1], vc)
    this.display.draw(rect[2], rect[3], vc)
  }

  drawLine(x0, y0, x1, y1, v, vc) {
    let x = x0, y = y0;
    let dx = x0 > x1 ? -1 : 1;
    let dy = y0 > y1 ? -1 : 1;
    while (x != x1 || y != y1) {
      if (x != x1)
        x += dx;
      if (y != y1)
        y += dy;
      this.display.draw(x, y, v)
    }
    this.display.draw(x0, y0, vc)
    this.display.draw(x1, y1, vc)
  }
}
