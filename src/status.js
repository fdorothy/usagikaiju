let Story = require('inkjs').Story;
import { Text } from 'rot-js/lib/index';
import { Util } from './util'

export class Status {
  constructor(game, height) {
    this.game = game;
    this.monsters = []
    this.items = []
    this.rect = [0, 0, this.game.width, height]
    this.width = this.rect[2] - this.rect[0]
    this.height = this.rect[3] - this.rect[1]
    this.cursorY = 1
    this.cursorX = 1
    this.spinnerToken = '-'
    this.animFrame = 0
    this.interval = 0.1
    this.timeTokenTimer = this.interval
    this.spinnerFrames = ['-', '\\', '|', '/']
    this.rainbow = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
  }

  draw() {
    this.cursorY = 1
    const p = this.game.player
    this.bar('Nap Time: ', this.game.countdown, this.game.maxTime, Util.colors.blood)
    this.bar('Food:     ', p.points, p.upgrade_size_pts, Util.colors.water)
    this.bar('Size:     ', p.size, this.game.maxSize, Util.colors.water, true)
  }

  drawItem(item) {
    this.text(item.colored(item.token) + ': ' + item.name)
  }

  drawMonster(m) {
    this.text(m.colored(m.token) + ': ' + m.name)
    this.text(this.bar("HP", m.hp, m.maxHp, Util.colors.blood))
  }

  modifier(value) {
    const color = Util.colors.important
    if (value == 0) return ''
    if (value < 0) return `(%c{${color}}${value}%c{}`
    return `(${value})`
  }

  text(text) {
    this.game.display.drawText(this.cursorX, this.cursorY, text, this.width)
    this.cursorY += 1
  }

  bar(text, value, max, color, restrictSize = false) {
    this.game.display.drawText(1, this.cursorY, text)

    const offset = text.length + 2
    let w = this.width - offset - 1
    if (restrictSize)
      w = max
    for (let x=0; x<w; x++) {
      const t = x / (w-1)
      const c = color
      if (t >= value / max) {
        c = Util.colors.gray
      }
      const jitter = [0.1, 0.1]
      if (x % 2 == 0)
        this.game.display.draw(x+offset, this.cursorY-jitter[1], 'o', c)
      else
        this.game.display.draw(x+offset, this.cursorY+jitter[1], 'o', c)
    }
    this.cursorY += 1
  }
}
