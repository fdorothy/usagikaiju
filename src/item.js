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

  getToken() {
    if (this.game.player.size < this.size) {
      return this.game.rainbow.getSpriteAnim([this.token, 'ミ'], 0, 0.1)
    } else {
      return this.token
    }
  }

  getColor() {
    if (this.game.player.size < this.size) {
      return this.game.rainbow.getSpriteAnim([this.color, Util.colors.blood], 0, 0.1)
    } else {
      return this.color
    }
  }

  setToken(token, color) {
    this.token = token
    this.color = color
  }
}
