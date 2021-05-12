let Story = require('inkjs').Story;
import { Text } from 'rot-js/lib/index';

export class Messages {
  constructor(game, height) {
    this.game = game;
    this.reset()
    this.textLife = 5
    this.height = height
    this.text = []
  }

  draw() {
    for (let i=0; i<this.text.length; i++) {
      if (this.text[i][1] > 0.0) {
        const len = this.text[i][0].length
        const [x, y] = this.game.worldToScreen([this.game.player.x-len/2, this.game.player.y-3-i])
        this.game.rainbow.rainbowText(x, y, this.text[i][0])
        this.text[i][1] -= this.game.deltaTime
      }
    }
  }

  push(text) {
    this.text = [[text,this.textLife]].concat(this.text).slice(0,this.height+1)
  }

  reset() {
    this.text = []
  }

  act() {
    this.draw()
  }
}
