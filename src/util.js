export class Util {
  static key(x, y) {
    return x + "," + y
  }

  static parseKey(key) {
    let parts = key.split(",");
    let x = parseInt(parts[0]);
    let y = parseInt(parts[1]);
    return [x, y]
  }
}
