let Story = require('inkjs').Story;
import { Text } from 'rot-js/lib/index';
import { Util } from './util'

export class Status {
  constructor(game, width) {
    this.game = game;
    this.monsters = []
    this.items = []
    this.rect = [0, 0, width, this.game.height]
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
    this.drawHero()
    this.cursorY += 2
    this.text('Visible:')
    this.cursorY += 1
    this.monsters.forEach((m) => {
      this.drawMonster(m)
      this.cursorY += 1
    })
    this.items.forEach((m) => {
      this.drawItem(m)
      this.cursorY += 1
    })
    this.update()
  }

  drawHero() {
    const p = this.game.player
    this.text('Usagi Kaiju ベ')
    this.text('Points: ' + p.points)
    this.text('Size: ' + p.size)
    this.text('Nap Time: ' + Math.floor(this.game.countdown) + ' ' + this.getSpriteAnim(this.spinnerFrames, 0, 0.5))
  }

  update() {
    if (this.timeTokenTimer <= 0.0) {
      this.animFrame += 1
      this.timeTokenTimer += this.interval
    }
    this.timeTokenTimer -= this.game.deltaTime
  }

  getSpriteAnim(frames, offset = 0, scalar = 1) {
    return frames[(offset + Math.floor(this.animFrame * scalar)) % frames.length]
  }

  drawRainbow(width) {
    for (let x=0; x<width; x++) {
      const c = '='
      if (x == 0)
        c = this.getSpriteAnim(['@', 'o'], 0, 0.2)
      if (x == width-1)
        c = this.getSpriteAnim(['<', '-'], 0, 0.2)
      this.game.display.draw(this.cursorX+x, this.cursorY, c, this.getSpriteAnim(this.rainbow, x, 0.2))
    }
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

  bar(text, value, max, color) {
    return `${text}: %b{${color}}${value}/${max}%b{}`
  }
}
