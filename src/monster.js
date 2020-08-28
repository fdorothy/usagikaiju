import { DIRS, Path } from 'rot-js/lib/index';
import { Util } from './util'
import { Combat } from './combat'

export class Monster {
  constructor(x, y, game) {
    this.x = x
    this.y = y
    this.game = game
    this.hp = 10
    this.maxHp = 10
    this.attack = 1
    this.defense = 1
    this.weapon = 0
    this.armor = 0
    this.token = 'm'
    this.color = 'red'
  }

  draw () {
    const [x, y] = this.game.worldToScreen([this.x, this.y])
    this.game.display.draw(x, y, this.token, this.color);
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
      this.combat()
    } else {
      path.shift()
      this.x = path[0][0]
      this.y = path[0][1]
    }
  }

  combat() {
    const dmg = Combat.attack(this, this.game.player)
    this.game.messages.push(`The monster attacks for ${dmg} damage.`)
    this.game.player.hp -= dmg
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
