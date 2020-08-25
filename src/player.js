import { DIRS } from 'rot-js/lib/index';

export class Player {
  constructor(x, y, game) {
    this._x = x
    this._y = y
    this.game = game
  }

  draw () {
    this.game.display.draw(this._x, this._y, "@", "#ff0");
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
    let newX = this._x + diff[0];
    let newY = this._y + diff[1];

    let newKey = newX + "," + newY;
    if (!(newKey in this.game.map)) {return;}

    this.game.display.draw(this._x, this._y, this.game.map[this._x+","+this._y]);
    this._x = newX;
    this._y = newY;
    this.draw();
    window.removeEventListener("keydown", this);
    this.game.engine.unlock();
  }
}
