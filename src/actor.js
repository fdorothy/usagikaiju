import { Util } from './util'
import { Combat } from './combat'

export class Actor {
  constructor(x, y, game) {
    this.x = x
    this.y = y
    this.game = game
    this.setStats(10, 1, 1, 0, 0)
    this.token = 'x'
    this.color = 'white'
    this.name = 'Monster'
    this.dead = false
    this.lastHit = null
  }

  setToken(token, color) {
    this.token = token
    this.color = color
  }

  draw () {
    const [x, y] = this.game.worldToScreen([this.x, this.y])
    this.game.display.draw(x, y, this.token, this.color);
  }

  combat(other) {
    if (this.dead) return
    const dmg = Combat.attack(this, other)
    other.hp -= dmg
    other.checkDeath()
    this.lastHit = other
    this.onCombat(dmg, other)
  }

  checkDeath() {
    if (this.hp <= 0) {
      this.dead = true
    }
  }

  onCombat(damage, other) {
    const name = this.coloredName()
    const otherName = other.coloredName()
    if (damage) {
      let dmg = `%c{red}${damage}%c{}`
      this.game.messages.push(`${name} hit ${otherName} for ${dmg} damage.`)
    } else {
      this.game.messages.push(`${name} missed ${otherName}.`)
    }
  }

  colored(text) {
    return `%c{${this.color}}${text}%c{}`
  }

  coloredName() {
    return `%c{${this.color}}${this.name}%c{}`
  }

  setStats(hp, attack, defense, weapon, armor) {
    this.hp = hp
    this.maxHp = hp
    this.attack = attack
    this.defense = defense
    this.weapon = weapon
    this.armor = armor
  }
}
