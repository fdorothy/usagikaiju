import { DIRS } from 'rot-js/lib/index';
import { Util } from './util'

export class Player {
  constructor(x, y, game) {
    this.x = x
    this.y = y
    this.game = game
  }

  draw () {
    this.game.display.draw(this.x, this.y, "@", "#ff0");
  }

  act() {
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
    if (!(newKey in this.game.map)) {return;}

    let key = Util.key(this.x, this.y)
    this.game.display.draw(this.x, this.y, this.game.map[key]);
    this.x = newX;
    this.y = newY;
    this.draw();
    window.removeEventListener("keydown", this);
    this.game.engine.unlock();
  }
}
