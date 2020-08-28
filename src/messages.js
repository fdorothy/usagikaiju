let Story = require('inkjs').Story;
import { Text } from 'rot-js/lib/index';

export class Messages {
  constructor(game, offsetX, height) {
    this.game = game;
    this.rect = [offsetX, 0, this.game.width, height]
    this.width = this.rect[2] - this.rect[0]
    this.height = this.rect[3] - this.rect[1]
    this.reset()
  }

  draw() {
    let y = this.rect[3]
    for (let i=0; i<this.text.length; i++) {
      this.game.display.drawText(this.rect[0], y, this.text[i], this.width)
      y--;
    }
  }

  push(text) {
    this.text = [text].concat(this.text).slice(0,this.height+1)
  }

  reset() {
    this.text = []
  }

  act() {
    this.draw()
  }
}
