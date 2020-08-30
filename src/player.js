import { DIRS } from 'rot-js/lib/index';
import { Util } from './util'
import { Combat } from './combat'
import { Actor } from './actor'

export class Player extends Actor {
  constructor(x, y, game) {
    super(x, y, game)
    this.setToken('@', '#ff0')
    this.xp = 0
    this.nextLevel = 20
    this.hp = 10
    this.maxHp = 10
    this.attack = 1
    this.defense = 1
    this.body = 1
    this.armor = 0
    this.weapon = 0
    this.promise = null
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

  onCombat(damage, other) {
    const name = this.colored('You')
    const otherName = other.coloredName()
    if (damage) {
      let dmg = `%c{red}${damage}%c{}`
      this.game.messages.push(`${name} hit ${otherName} for ${dmg} damage.`)
    } else {
      this.game.messages.push(`${name} missed ${otherName}.`)
    }
  }

  addXP(xp) {
    this.xp += xp
    if (this.xp > this.nextLevel) {
      this.xp = this.xp - this.nextLevel
      this.nextLevel = Math.trunc(this.nextLevel * 1.5)
      this.hp = this.maxHp
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

    let code = e.keyCode;

    if (!(code in keyMap)) {
      resolve(false)
      return;
    }
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
