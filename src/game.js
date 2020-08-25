import { Map, Display, Scheduler, Engine, KEYS, RNG } from 'rot-js/lib/index';
import { Player } from './player'

export class Game {
  constructor() {
    console.log("hello, world");
    this.map = {};
    this.engine = null;
    this.player = null;

    this.display = new Display();
    document.body.appendChild(this.display.getContainer());
    this._generateMap();

    let scheduler = new Scheduler.Simple();
    scheduler.add(this.player, true);
    this.engine = new Engine(scheduler);
    this.engine.start();
  }

  _generateMap() {
    let digger = new Map.Digger();
    let freeCells = [];

    let digCallback = function(x, y, value) {
      if (value) {return;} /* do not store walls */

      let key = x + "," + y;
      freeCells.push(key);
      this.map[key] = ".";
    }

    digger.create(digCallback.bind(this));

    this._generateBoxes(freeCells);
    this._createPlayer(freeCells);

    this._drawWholeMap();
  }

  _createPlayer(freeCells) {
    let index = Math.floor(RNG.getUniform() * freeCells.length);
    let key = freeCells.splice(index, 1)[0];
    let parts = key.split(",");
    let x = parseInt(parts[0]);
    let y = parseInt(parts[1]);
    this.player = new Player(x, y, this);
  }

  _drawWholeMap() {
    for (let key in this.map) {
      let parts = key.split(",");
      let x = parseInt(parts[0]);
      let y = parseInt(parts[1]);
      this.display.draw(x, y, this.map[key]);
    }
    this.player.draw()
  }

  _generateBoxes(freeCells) {
    for (let i=0; i<10; i++) {
      let index = Math.floor(RNG.getUniform() * freeCells.length);
      let key = freeCells.splice(index, 1)[0];
      this.map[key] = "*";
    }
  }
}
