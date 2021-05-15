let Story = require('inkjs').Story;
import { Text } from 'rot-js/lib/index';

export class Messages {
  constructor(game, height) {
    this.game = game;
    this.reset()
    this.textLife = 2
    this.height = height
    this.text = []
  }

  draw() {
    if (this.text.length > 0) {
      if (this.text[0][1] > 0.0) {
        const len = this.text[0][0].length
        const [x, y] = [this.game.width/2-len/2, this.game.statusHeight-1]
        //this.game.rainbow.rainbowText(x, y, this.text[0][0])
        this.game.display.drawText(x, y, this.text[0][0])
        this.text[0][1] -= this.game.deltaTime
      } else {
        this.text.shift()
      }
    } else {
      const item = this.findItem()
      let txt = ""
      if (item != null) {
        txt = "Hmm, " + item.name + " (" + item.token + "), it looks " + (item.size <= this.game.player.size ? "tasty" : "too big")
      } else {
        txt = "La la la, I love carrots..."
      }
      const [x, y] = [this.game.width/2-txt.length/2, this.game.statusHeight-1]
      this.game.display.drawText(x, y, txt)
    }
  }

  findItem() {
    for (let x=this.game.player.x-1; x<this.game.player.x+2; x++) {
      for (let y=this.game.player.y-1; y<this.game.player.y+2; y++) {
        const item = this.game.getItem(x, y)
        if (item != null)
          return item
      }
    }
    return null
  }

  push(text) {
    this.text = [[text,this.textLife]].concat(this.text).slice(0,this.height+1)
    if (this.text.length > 2)
      this.text.shift()
  }

  reset() {
    this.text = []
  }

  act() {
    this.draw()
  }
}
