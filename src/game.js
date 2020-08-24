let Game = {
  display: null,

  init: function() {
    this.display = new ROT.Display();
    document.body.appendChild(this.display.getContainer());
    this._generateMap();
  }
}

Game.map = {};

Game._generateMap = function() {
  let digger = new ROT.Map.Digger();

  let digCallback = function(x, y, value) {
    if (value) {return;} /* do not store walls */

    let key = x + "," + y;
    this.map[key] = ".";
  }

  digger.create(digCallback.bind(this));
  this._drawWholeMap();
}

Game._drawWholeMap = function() {
  for (let key in this.map) {
    let parts = key.split(",");
    let x = parseInt(parts[0]);
    let y = parseInt(parts[1]);
    this.display.draw(x, y, this.map[key]);
  }
}
