import { Color } from 'rot-js/lib/index';


export class Util {
  static colors = {
    'bright': '#f5efeb',
    'blood': '#d3473d',
    'water': '#316a96',
    'important': '#f6ad0f',
    'dark': '#2e243f',
    'gray': '#bebebe',
    'black': '#000000'
  }

  static minGray = Color.fromString(Util.colors.dark);
  static maxGray = Color.fromString(Util.colors.bright);

  static key(x, y) {
    return x + "," + y
  }

  static parseKey(key) {
    let parts = key.split(",");
    let x = parseInt(parts[0]);
    let y = parseInt(parts[1]);
    return [x, y]
  }

  static grayscale(value) {
    if (value > 1.0)
      value = 1.0
    if (value < 0.0)
      value = 0.0
    return Color.toHex(Color.interpolate(Util.minGray, Util.maxGray, value))
  }
}
