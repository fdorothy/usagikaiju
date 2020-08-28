import { DIRS, Path } from 'rot-js/lib/index';
import { Util } from './util'

export class Monster {
  constructor(x, y, game) {
    this.x = x
    this.y = y
    this.game = game
    this.hp = 10
    this.maxHp = 10
    this.str = 10
    this.dex = 10
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
      this.attack()
    } else {
      path.shift()
      this.x = path[0][0]
      this.y = path[0][1]
    }
  }

  attack() {
    console.log('monster attacks')
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
