import { Map, Display, Scheduler, Engine, KEYS, RNG } from 'rot-js/lib/index';
import { Player } from './player'
import { Util } from './util'
import { Dialogue } from './story'
let inkStoryJson = require('../story.ink.json');

export class Game {
  constructor() {
    this.map = {};
    this.engine = null;
    this.player = null;
    this.width = 100
    this.height = 40
    this.dialogue = new Dialogue(inkStoryJson, this);

    this.display = new Display({width: this.width, height: this.height});
    document.body.appendChild(this.display.getContainer());
    this.generateMap();

    let scheduler = new Scheduler.Simple();
    scheduler.add(this.player, true);
    scheduler.add(this.dialogue, true);

    this.engine = new Engine(scheduler);
    this.engine.start();
  }

  generateMap() {
    let digger = new Map.Digger(this.width, this.height);
    let freeCells = [];

    let digCallback = function(x, y, value) {
      if (value) {return;} /* do not store walls */

      let key = Util.key(x, y);
      freeCells.push(key);
      this.map[key] = ".";
    }

    digger.create(digCallback.bind(this));

    this.generateBoxes(freeCells);
    this.createPlayer(freeCells);

    this.drawWholeMap();
  }

  createPlayer(freeCells) {
    let index = Math.floor(RNG.getUniform() * freeCells.length);
    let key = freeCells.splice(index, 1)[0];
    let [x, y] = Util.parseKey(key)
    this.player = new Player(x, y, this);
  }

  drawWholeMap() {
    this.display.clear()
    for (let key in this.map) {
      let [x, y] = Util.parseKey(key)
      this.display.draw(x, y, this.map[key]);
    }
    this.player.draw()
    if (this.dialogue)
      this.dialogue.draw()
  }

  generateBoxes(freeCells) {
    for (let i=0; i<10; i++) {
      let index = Math.floor(RNG.getUniform() * freeCells.length);
      let key = freeCells.splice(index, 1)[0];
      this.map[key] = "*";
    }
  }
}
