import { DIRS } from 'rot-js/lib/index';
import { Map, Display, Engine, KEYS, RNG, FOV, Color, Path } from 'rot-js/lib/index';
import { Room } from 'rot-js/lib/map/features';
import { Player } from './player'
import { Util } from './util'
import { Dialogue } from './story'
let inkStoryJson = require('../story.ink.json');
import { Messages } from './messages'
import { Status } from './status'
import { Item } from './item'
import { Draw } from './draw'
import { Rainbow } from './rainbow'
let Pizzicato = require('pizzicato')

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
    this.statusHeight = 5
    this.mapWidth = this.width
    this.mapHeight = this.height - this.statusHeight - 1
    this.messages = new Messages(this, 3)
    this.dialogue = new Dialogue(inkStoryJson, this);
    this.status = new Status(this, this.statusHeight)
    this.countdown = 10
    this.pointGoal = 50
    this.lastTime = this.ms()
    this.fps = 20
    this.deltaTime = 0.0
    this.rainbow = new Rainbow(this)
    this.blinking = false
    this.ignoreItemId = -1
    this.music = null

    // load our little sound effects
    this.sfx = {}
    const sfx_names = ['coin', 'bling', 'hit', 'achieved', 'arrow_hit'].map((item) => this.load_sfx(item))
    this.sfx['nearly_dead'] =
      new Pizzicato.Sound({ 
        source: 'file',
        options: { path: './sounds/nearly_dead.ogg', loop: true }
      })

    // handle keyboard events here
    const handleEvent = this.handleEvent
    window.addEventListener("keydown", (e) => handleEvent(e))

    this.restart()
    this.mainLoop()
  }

  playMusic() {
    this.music.attack = 0.9
    this.music.volume = 0.6
    this.music.play()
  }

  load_sfx(name) {
    this.sfx[name] =
      new Pizzicato.Sound({ 
        source: 'file',
        options: { path: './sounds/' + name + '.ogg' }
      })
  }

  play_sfx(name) {
    this.sfx[name].clone().play()
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
    this.play_sfx('hit')
    setTimeout(() => { this.display.getContainer().className = "" }, 100)
  }

  blinkScreen(value) {
    if (value && !this.blinking) {
      document.getElementById("body").className = "blink_slow"
      this.sfx['nearly_dead'].play()
    }
    if (!value && this.blinking) {
      document.getElementById("body").className = ""
      this.sfx['nearly_dead'].stop()
    }
    this.blinking = value
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
      'pellet': {token: '.', size: 1, xp: 1, moves: false},
      'peach': {token: '@', size: 2, xp: 2, moves: false},
      'rabbit poop': {token: ':', size: 1, xp: 1, moves: false},
      'sake': {token: 'S', size: 3, xp: 2, moves: false},
      'toddler': {token: 'T', size: 3, xp: 3, moves: true, interval: 0.75, slowInterval: 1.5},
      'parent': {token: 'P', size: 4, xp: 10, moves: true, interval: 0.5, slowInterval: 1.0}
    }
  }

  placeItem(itemName, x, y, onPickup = null) {
    const itemType = this.itemTypes[itemName]
    const item = new Item(x, y, this)
    item.setToken(itemType.token, Util.colors.blood)
    item.name = itemName
    item.size = itemType.size
    item.color = Util.colors.important
    item.xp = itemType.xp
    item.moves = itemType.moves
    item.onPickup = (player) => {
      if (this.player.size >= item.size) {
        this.messages.push(item.name + ', yum +' + item.xp)
        this.player.points += item.xp
        this.countdown += 2
        this.play_sfx('bling')
        this.placeItemRandomly(itemName)
        if (this.onPickupItem != null) {
          this.onPickupItem(itemName)
        }
        if (this.countdown > this.maxTime)
          this.countdown = this.maxTime
      } else {
        this.messages.push(item.name + ' is too big to eat')
      }
    }
    this.items.push(item)
  }

  onExit() {
    this.level++
    this.hasMap = false
    this.restart()
  }

  level1() {
    this.player = new Player(0, 0, this)
    this.messages.quickTip = "Eat enough food to grow big before nap time"
    this.maxTime = 25
    this.maxSize = 2
    this.countdown = 20
    this.lastTime = this.ms()
    this.startTime = this.timestamp()
    this.generateSingleRoom(Math.floor(this.width/2)-10, Math.floor(this.height/2)-10, 15, 15);
    this.resetMonsterPathFinder()

    const items = {
      'pellet': 5,
      'rabbit poop': 3,
    }
    for (const [v, n] of Object.entries(items)) {
      for (let i=0; i<n; i++) {
        this.placeItemRandomly(v)
      }
    }
    this.onUpdate = () => {
      if (this.player.size == 2) {
        this.dialogue.play("level2")
      }
    }
  }

  level2() {
    this.player = new Player(0, 0, this)
    this.messages.quickTip = "Eat enough food to grow big and take out the toddler (T)"
    this.maxTime = 50
    this.maxSize = 3
    this.countdown = 45
    this.lastTime = this.ms()
    this.startTime = this.timestamp()
    this.generateMap();
    this.resetMonsterPathFinder()

    const items = {
      'pellet': 20,
      'rabbit poop': 10,
      'peach': 5,
      'sake': 2,
      'toddler': 1
    }
    for (const [v, n] of Object.entries(items)) {
      for (let i=0; i<n; i++) {
        this.placeItemRandomly(v)
      }
    }
    this.onUpdate = () => {
    }
    this.onPickupItem = (itemName) => {
      if (itemName == 'toddler') {
        this.dialogue.play("level3")
      }
    }
  }

  level3() {
    this.player = new Player(0, 0, this)
    this.messages.quickTip = "Eat enough food to grow big and take out the parents (P)"
    this.player.size = 3
    this.maxTime = 65
    this.maxSize = 4
    this.countdown = 45
    this.lastTime = this.ms()
    this.startTime = this.timestamp()
    this.generateMap();
    this.resetMonsterPathFinder()

    const items = {
      'pellet': 20,
      'rabbit poop': 10,
      'peach': 5,
      'sake': 2,
      'parent': 2
    }
    for (const [v, n] of Object.entries(items)) {
      for (let i=0; i<n; i++) {
        this.placeItemRandomly(v)
      }
    }
    this.onUpdate = () => {
    }
    this.parents = 2
    this.onPickupItem = (itemName) => {
      if (itemName == 'parent') {
        this.parents--
        if (this.parents == 0)
          this.dialogue.play("level4")
      }
    }
  }

  resetMonsterPathFinder() {
    this.monsterPathFinder = new Path.AStar(this.player.x, this.player.y, (x, y) => this.canMonsterMove(x,y))
  }

  placeItemRandomly(itemName) {
    const [x, y] = this.randomFreeCell(this.freeCells)
    const cb = this.placeItemsRandomly
    this.placeItem(itemName, x, y, cb)
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
      const item = this.getItem(newX, newY)
      if (item != null && item.size > this.player.size) {
        if (!item.moves)
          this.player.hurtSelf(1)
      } else {
        this.player.x = newX;
        this.player.y = newY;
      }
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
    case ':level1':
      this.lastLevel = ':level1'
      this.level1();
      break;
    case ':level2':
      this.lastLevel = ':level2'
      this.level2();
      break;
    case ':level3':
      this.lastLevel = ':level3'
      this.level3();
      break;
    case ':level4':
      this.level4();
      break;
    case ':restart':
      this.restart()
      break;
    case ':music':
      this.music = new Pizzicato.Sound({
        source: 'file',
        options: { path: './sounds/8bitninja.mp3', loop: true }
      }, () => this.playMusic())
      break;
    case ':stopmusic':
      this.music.stop()
      break;
    case ':continue':
      this.handleStoryEvent([this.lastLevel])
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
        await this.mainDialogue()
      } else {
        await this.mainDungeon()
      }
    }
  }

  async mainDialogue() {
    if (this.music)
      this.music.volume = 0.6
    this.blinkScreen(false)
    this.display.clear()
    this.pushVariables()
    await this.dialogue.act()
  }

  async mainDungeon() {
    if (this.music)
      this.music.volume = 0.9

    // update the player's position
    const moved = this.checkPlayerMovement()

    // reset pathfinding if we moved
    if (moved)
      this.resetMonsterPathFinder()
    for (let i in this.items) {
      if (moved) {
        this.items[i].calculatePath()
      }
      this.items[i].act()
    }

    // check for item pickup if we moved anywhere
    if (moved)
      this.checkItems()

    // update everything
    this.rainbow.update()
    this.player.update()
    if (this.onUpdate)
      this.onUpdate()

    // see if we lost...
    this.checkGameOver()

    // are we low on time? if so, blink the background
    this.blinkScreen(this.countdown < 10)

    // finally draw
    this.draw()

    // update our timers
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
      } else {
        this.messages.push(item.name + ' is too big to eat')
      }
    }
  }

  checkGameOver() {
    if (this.player.dead) {
      this.dialogue.play("gameover")
    }

    this.countdown -= this.deltaTime
    if (this.countdown <= 0) {
      this.dialogue.play("gameover")
      this.countdown = 0.0
    }
  }

  canMonsterMove(x, y) {
    const key = Util.key(x,y)
    const item = this.getItem(x, y)
    if (item && item.id != this.ignoreItemId && item.moves)
      return false
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

  generateSingleRoom(x, y, w, h) {
    this.map = {};
    this.knownMap = {};
    this.items = []
    this.monsters = []
    this.freeCells = [];

    for (let i=x-1; i<x+w+1; i++) {
      for (let j=y-1; j<y+h+1; j++) {
        let key = Util.key(i, j);
        if (i == x-1 || i == x+w || j == y-1 || j == y+h) {
          this.map[key] = "#";
        } else {
          this.map[key] = " ";
          this.freeCells.push(key)
        }
      }
    }

    this.freeRooms = [new Room(x, y, x+w, y+h, undefined, undefined)]

    this.setPlayerPositionRandom();
    return this.freeCells
  }

  generateMap() {
    this.map = {};
    this.knownMap = {};
    this.items = []
    this.monsters = []
    let digger = new Map.Digger(this.mapWidth, this.mapHeight, {roomWidth: [10,15], roomHeight: [10,15], dugPercentage: 0.6});
    this.freeCells = [];

    let digCallback = function(x, y, value) {
      let key = Util.key(x, y);
      if (value) {
        this.map[key] = "#";
      } else {
        this.map[key] = " ";
        this.freeCells.push(key);
      }
    }

    digger.create(digCallback.bind(this));

    this.freeRooms = RNG.shuffle(digger.getRooms())

    this.setPlayerPositionRandom();
    return this.freeCells
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
      if (v == '#') {
        if (key in this.fov) {
          const flicker = this.rainbow.getSpriteAnim([1.0, 1.0-RNG.getUniform() / 10.0], 0, 1)
          color = Util.grayscale((1.0 - this.fov[key] / 10.0)*flicker)
          color2 = Util.grayscale((1.0 - this.fov[key] / 10.0)*flicker * 0.5)
        }
        const offset = [0.2, 0.1]
        this.display.draw(x-offset[0], y-offset[1], '.', color, bg)
        this.display.draw(x+offset[0], y+offset[1], ';', color2, bg)
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
    this.drawer.drawLine(0, this.statusHeight, this.width, this.statusHeight, '-', '-')
  }

  worldToScreen([x, y]) {
    return [x, y + this.statusHeight + 1]
  }

  pushVariables() {
    this.dialogue.story.variablesState["points"] = this.player.points
    this.dialogue.story.variablesState["size"] = this.player.size
    this.dialogue.story.variablesState["time"] = this.maxTime
    this.dialogue.story.variablesState["size_cost"] = this.player.upgrade_size_pts
  }

  pathToPlayer(x, y, ignoreItemId) {
    let path = []
    this.ignoreItemId = ignoreItemId
    this.monsterPathFinder.compute(x, y, (x,y) => path.push([x,y]))
    this.ignoreItemId = -1

    // we do not care about the first position which is the same as x,y
    path.shift()

    return path
  }
}
