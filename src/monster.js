import { DIRS, Path } from 'rot-js/lib/index';
import { Util } from './util'
import { Combat } from './combat'
import { Actor } from './actor'

export class Monster extends Actor {
  constructor(x, y, game) {
    super(x, y, game)
    this.setStats(3, 1, 1, 2, 0)
    this.xp = 6
    this.setToken('m', Util.colors.blood)
    this.name = 'Monster'
    this.chasing = false
  }

  act() {
    if (this.game.dialogue.showing) {
      return;
    }
    const key = Util.key(this.x, this.y)
    if (key in this.game.fov) {
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
  }

  onCombat(damage, other) {
    const name = this.coloredName()
    const otherName = other.colored('you')
    if (damage) {
      const blood = Util.colors.blood
      let dmg = `%c{${blood}}${damage}%c{}`
      this.game.messages.push(`The ${name} hits ${otherName} for %c{${blood}}${dmg}%c{} damage.`)
    } else {
      this.game.messages.push(`${name} missed ${otherName}.`)
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
