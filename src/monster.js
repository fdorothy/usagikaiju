import { DIRS, Path } from 'rot-js/lib/index';
import { Util } from './util'
import { Combat } from './combat'
import { Actor } from './actor'

export class Monster extends Actor {
  constructor(x, y, game) {
    super(x, y, game)
    this.setStats(10, 1, 1, 0, 0)
    this.setToken('m', 'red')
    this.name = 'Monster'
  }

  act() {
    if (this.game.dialogue.showing) {
      return;
    }
    let path = this.pathToPlayer()
    if (path.length == 0) {
      // no path to player
    }
    else if (path.length <= 2) {
      this.combat(this.game.player)
    } else {
      path.shift()
      this.x = path[0][0]
      this.y = path[0][1]
    }
  }

  onCombat(damage, other) {
    const name = this.coloredName()
    const otherName = other.colored('you')
    if (damage) {
      let dmg = `%c{red}${damage}%c{}`
      this.game.messages.push(`The ${name} hits ${otherName} for ${dmg} damage.`)
    } else {
      this.game.messages.push(`${name()} missed ${otherName}.`)
    }
  }

  pathToPlayer() {
    const [x, y] = [this.game.player.x, this.game.player.y]
    const game = this.game
    const mx = this.x, my = this.y
    var passableCallback = function(x, y) {
      if (mx == x && my == y)
        return true
      else
        return game.canMonsterMove(x, y)
    }
    var astar = new Path.AStar(x, y, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
      path.push([x, y]);
    }
    astar.compute(this.x, this.y, pathCallback);
    return path
  }
}
