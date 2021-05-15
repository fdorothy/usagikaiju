import { DIRS, Path } from 'rot-js/lib/index';
import { Util } from './util'
import { Combat } from './combat'
import { Actor } from './actor'

export class Item extends Actor {
  constructor(x, y, game) {
    super(x, y, game)
    this.setToken('i', Util.colors.blood)
    this.onPickup = null
    this.pickedUp = false
    this.story = null
    this.xp = 1
    this.moves = false
    this.path = []
    this.interval = 0.75
    this.maxRange = 10
    this.lastMove = this.interval
  }

  pickup(player) {
    this.pickedUp = true
    if (this.onPickup != null) {
      this.onPickup(player, this)
    }
    if (this.story) {
      this.game.dialogue.play(this.story)
    }
  }

  act() {
    if (this.moves) {
      this.lastMove -= this.game.deltaTime
      if (this.lastMove <= 0.0) {
        this.lastMove += this.interval
        if (this.path.length > 1 && this.path.length <= this.maxRange) {
          if (this.size > this.game.player.size) {
            const [x, y] = this.path.shift()
            this.x = x
            this.y = y
          } else {
            this.wander()
          }
        } else {
          if (this.path.length == 1) {
            this.game.countdown -= this.xp / 10.0
            this.game.screenShake()
            this.game.messages.push("Ouch!")
          } else {
            this.wander()
          }
        }
      }
    }
  }

  wander() {
    const dir = Math.floor(4.0 * Math.random())
    switch (dir) {
    case 0:
      this.move(1, 0)
      break;
    case 1:
      this.move(-1, 0)
      break;
    case 2:
      this.move(0, 1)
      break;
    case 3:
      this.move(0, -1)
      break;
    default:
      break;
    }
  }

  move(dx, dy) {
    if (this.game.canMonsterMove(this.x+dx, this.y+dy)) {
      this.x += dx
      this.y += dy
    }
  }

  calculatePath() {
    if (this.moves) {
      this.path = this.game.pathToPlayer(this.x, this.y)
    }
  }

  getToken() {
    if (this.game.player.size < this.size) {
      return this.token
    } else {
      return this.token
    }
  }

  getColor() {
    if (this.game.player.size < this.size) {
      return this.game.rainbow.getSpriteAnim([this.color, Util.colors.blood], 0, 0.5)
    } else {
      return this.color
    }
  }

  setToken(token, color) {
    this.token = token
    this.color = color
  }
}
