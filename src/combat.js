export class Combat {
  static roll(sides) {
    return Math.floor(sides * Math.random() + 1)
  }

  static attack(p1, p2) {
    const att = Combat.getAttackValue(p1)
    const def = Combat.getDefenseValue(p2)
    const tohit = att - def + 10
    const value = this.roll(20)
    if (value == 1) {
      return 0
    } else if (value >= tohit || value == 20) {
      let dmg = this.roll(p1.weapon) - p2.armor
      if (dmg < 1)
        return 1
      return dmg
    } else {
      return 0
    }
  }

  static getAttackValue(p) {
    return p.attack + p.weapon
  }

  static getDefenseValue(p) {
    return p.defense + p.armor
  }
}
