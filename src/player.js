import { DIRS } from 'rot-js/lib/index';
import { Util } from './util'

export class Player {
  constructor(x, y, game) {
    this.x = x
    this.y = y
    this.game = game
    this.hp = 10
    this.maxHp = 10
    this.xp = 0
    this.nextLevel = 20
    this.str = 10
    this.dex = 10
    this.armor = 0
  }

  draw () {
    const [x, y] = this.game.worldToScreen([this.x, this.y])
    this.game.display.draw(x, y, "@", "#ff0");
  }

  act() {
    if (this.game.dialogue.showing) {
      return;
    }

    this.game.engine.lock();
    /* wait for user input; do stuff when user hits a key */
    window.addEventListener("keydown", this);
  }

  handleEvent = (e) => {
    let keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    let code = e.keyCode;

    if (!(code in keyMap)) {return;}
    let diff = DIRS[8][keyMap[code]];
    let newX = this.x + diff[0];
    let newY = this.y + diff[1];

    let newKey = newX + "," + newY;

    let key = Util.key(this.x, this.y)
    this.game.display.draw(this.x, this.y, this.game.map[key]);
    if (this.game.canPlayerMove(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }
    this.game.drawWholeMap();
    window.removeEventListener("keydown", this);
    this.game.engine.unlock();
  }
}
