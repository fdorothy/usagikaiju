import { DIRS, Path } from 'rot-js/lib/index';
import { Util } from './util'
import { Combat } from './combat'
import { Actor } from './actor'

export class Item extends Actor {
  constructor(x, y, game) {
    super(x, y, game)
    this.setToken('i', 'red')
    this.onPickup = null
    this.pickedUp = false
    this.story = null
  }

  pickup(player) {
    this.pickedUp = true
    if (this.onPickup != null) {
      this.onPickup(player)
    }
    if (this.story) {
      this.game.dialogue.play(this.story)
    }
  }

  setToken(token, color) {
    this.token = token
    this.color = color
  }
}
