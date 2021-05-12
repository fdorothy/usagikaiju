export class Rainbow {
  constructor(game) {
    this.game = game
    this.rainbow = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
    this.animFrame = 0
    this.interval = 0.1
    this.timeTokenTimer = this.interval
  }

  rainbowText(x, y, txt) {
    for (let i=0; i<txt.length; i++) {
      this.game.display.draw(i+x, y+this.getSpriteAnim([0.0, 0.05], i, .2), txt[i], this.getSpriteAnim(this.rainbow, i, 0.2), '#444444')
    }
  }

  update() {
    if (this.timeTokenTimer <= 0.0) {
      this.animFrame += 1
      this.timeTokenTimer += this.interval
    }
    this.timeTokenTimer -= this.game.deltaTime
  }

  getSpriteAnim(frames, offset = 0, scalar = 1) {
    return frames[(offset + Math.floor(this.animFrame * scalar)) % frames.length]
  }
}
