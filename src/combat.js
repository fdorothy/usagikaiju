export class Combat {
  static attack(p1, p2) {
    const att = Combat.getAttackValue(p1)
    const def = Combat.getDefenseValue(p2)
    const dmg = (att / def) * (10 / 5)
    return Math.trunc(dmg)
  }

  static getAttackValue(p) {
    return p.attack + p.weapon
  }

  static getDefenseValue(p) {
    return p.defense + p.armor
  }
}
