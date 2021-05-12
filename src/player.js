import { DIRS } from 'rot-js/lib/index';
import { Util } from './util'
import { Combat } from './combat'
import { Actor } from './actor'
import { Game } from './game'

export class Player extends Actor {
  constructor(x, y, game) {
    super(x, y, game)
    this.setToken('ベ', '#ffffff')
    this.points = 0
    this.upgrade_size_pts = 20
    this.upgrade_time_pts = 20
    this.size = 1
    this.promise = null
    this.maxTime = 15
    this.name = 'player'
  }

  upgrade_size() {
    if (this.points >= this.upgrade_size_pts) {
      this.points -= this.upgrade_size_pts
      this.size++
      this.upgrade_size_pts *= 2
      return true
    }
    return false
  }

  upgrade_time() {
    if (this.points >= this.upgrade_time_pts) {
      this.points -= this.upgrade_time_pts
      this.maxTime += 5
      this.upgrade_time_pts *= 2
      return true
    }
    return false
  }

  act() {
    if (this.game.dialogue.showing) {
      return Promise.resolve(true);
    }

    const handleEvent = this.handleEvent
    return new Promise(function(resolve) {
      /* wait for user input; do stuff when user hits a key */
      window.addEventListener("keydown", (e) => {
        handleEvent(e, resolve)
      }, {once: true})
    })
  }

  addXP(xp) {
    this.xp += xp
    if (this.xp > this.nextLevel) {
      this.xp = this.xp - this.nextLevel
      this.nextLevel = Math.trunc(this.nextLevel * 1.5)
      this.hp = this.maxHp
      this.game.dialogue.play('levelup')
    }
  }

  handleEvent = (e, resolve) => {
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
      resolve(false)
      return;
    }
    e.preventDefault()
    let diff = DIRS[8][keyMap[code]];
    let newX = this.x + diff[0];
    let newY = this.y + diff[1];

    let newKey = newX + "," + newY;

    let key = Util.key(this.x, this.y)
    if (this.game.canPlayerMove(newX, newY)) {
      this.x = newX;
      this.y = newY;
    } else {
      const m = this.game.getMonster(newX, newY);
      if (m) {
        this.combat(m)
      } else {
        this.game.messages.push(`The stone wall is cold.`)
      }
    }
    resolve(true)
  }
}
