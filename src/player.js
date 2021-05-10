import { DIRS } from 'rot-js/lib/index';
import { Util } from './util'
import { Combat } from './combat'
import { Actor } from './actor'
import { Game } from './game'

export class Player extends Actor {
  constructor(x, y, game) {
    super(x, y, game)
    this.setToken('ベ', '#ffffff')
    this.xp = 0
    this.nextLevel = 10
    this.size = 1
    this.promise = null
    this.maxTime = 10
    this.name = 'player'
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
