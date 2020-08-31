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
    this.cursorY = 0
  }

  draw() {
    this.cursorY = 0
    this.text(`level ${this.game.level}/3`)
    this.cursorY += 1
    this.drawHero()
    this.cursorY += 1
    this.monsters.forEach((m) => {
      this.drawMonster(m)
      this.cursorY += 1
    })
    this.items.forEach((m) => {
      this.drawItem(m)
      this.cursorY += 1
    })
  }

  drawHero() {
    const p = this.game.player
    this.text('Dr. Lewis')
    this.text(this.bar("XP", p.xp, p.nextLevel, Util.colors.water))
    this.text(this.bar("HP", p.hp, p.maxHp, Util.colors.blood))
    this.text(`Attack: ${p.attack} ${this.modifier(p.weapon)}`)
    this.text(`Defense: ${p.defense} ${this.modifier(p.armor)}`)
    this.text(`Body: ${p.body}`)
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
    this.game.display.drawText(0, this.cursorY, text, this.width)
    this.cursorY += 1
  }

  bar(text, value, max, color) {
    return `${text}: %b{${color}}${value}/${max}%b{}`
  }
}
