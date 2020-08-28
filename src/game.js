import { Map, Display, Scheduler, Engine, KEYS, RNG } from 'rot-js/lib/index';
import { Player } from './player'
import { Util } from './util'
import { Dialogue } from './story'
let inkStoryJson = require('../story.ink.json');
import { Messages } from './messages'
import { Status } from './status'
import { Monster } from './monster'

export class Game {
  constructor() {
    this.map = {};
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

    this.scheduler = new Scheduler.Simple();
    this.player = new Player(0, 0, this)
    this.monsters = []
    this.scheduler.add(this.player, true)
    this.scheduler.add(this.dialogue, true);
    this.dialogue.play("title")
    this.engine = new Engine(this.scheduler);
    this.engine.start();
  }

  newGame() {
    this.startLevel()
  }

  startLevel() {
    this.generateMap();
    this.monsters.forEach((m) => this.scheduler.add(m, true));
    this.dialogue.play("intro", () => {
      this.messages.push("Use the arrow keys to move")
    })
  }

  setupGamePlayScheduler() {
  }

  handleStoryEvent(event) {
    const name = event[0]
    switch (name) {
    case ':newgame':
      this.newGame()
      break;
    default: break;
    }
  }

  canMonsterMove(x, y) {
    if (this.getMonster(x, y))
      return false
    return ((x+","+y in this.map))
  }

  canPlayerMove(x, y) {
    if (this.getMonster(x, y))
      return false
    return ((x+","+y in this.map))
  }

  getMonster(x, y) {
    for (let i=0; i<this.monsters.length; i++) {
      let m = this.monsters[i];
      if (m.x == x && m.y == y)
        return m;
    }
    return null;
  }

  generateMap() {
    let digger = new Map.Digger(this.mapWidth, this.mapHeight);
    let freeCells = [];

    let digCallback = function(x, y, value) {
      if (value) {return;} /* do not store walls */

      let key = Util.key(x, y);
      freeCells.push(key);
      this.map[key] = ".";
    }

    digger.create(digCallback.bind(this));

    this.setPlayerPositionRandom(freeCells);
    this.generateMonsters(freeCells);
    this.drawWholeMap();
  }

  setPlayerPositionRandom(freeCells) {
    let index = Math.floor(RNG.getUniform() * freeCells.length);
    let key = freeCells.splice(index, 1)[0];
    let [x, y] = Util.parseKey(key)
    this.player.x = x
    this.player.y = y
  }

  drawWholeMap() {
    this.display.clear()
    for (let key in this.map) {
      const [x, y] = this.worldToScreen(Util.parseKey(key))
      this.display.draw(x, y, this.map[key]);
    }
    this.player.draw()
    this.monsters.forEach((m) => m.draw())
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

  generateMonsters(freeCells) {
    this.monsters = []
    for (let i=0; i<10; i++) {
      let index = Math.floor(RNG.getUniform() * freeCells.length);
      let key = freeCells.splice(index, 1)[0];
      const [x, y] = Util.parseKey(key)
      this.monsters.push(new Monster(x, y, this))
    }
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
