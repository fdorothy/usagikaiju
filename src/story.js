let Story = require('inkjs').Story;
import { Text } from 'rot-js/lib/index';

export class Dialogue {
  constructor(json, game) {
    this.game = game;
    this.story = new Story(json);
    this.padding = 10
    this.resetText()
    this.showing = false
    this.callback = null
  }

  play(knot, cb) {
    this.story.ChoosePathString(knot);
    this.showing = true;
    this.callback = cb
    this.resetText()
    this.continue()
  }

  draw() {
    if (!this.showing) {
      return;
    }
    let x0 = this.padding
    let y0 = this.padding
    let x1 = this.game.width-this.padding
    let y1 = this.game.height-this.padding
    this.drawBox(x0-1, y0-1, x1+1, y1+1)
    this.drawBorder(x0, y0, x1, y1, '-', '|', '+')
    this.drawText()
  }

  drawText() {
    let xy = [this.padding+1, this.padding+1]
    for (let i=0; i<this.text.length; i++) {
      this.game.display.drawText(xy[0], xy[1], this.text[i], this.textWidth())
      let {width, height} = Text.measure(this.text[i])
      xy[1] += height
    }
  }

  pushText(text) {
    this.text.push(text)
  }

  resetText() {
    this.text = []
  }

  act() {
    if (this.showing) {
      this.game.engine.lock();
      /* wait for user input; do stuff when user hits a key */
      window.addEventListener("keydown", this);
      this.draw()
    }
  }

  handleEvent = (e) => {
    let choices = this.story.currentChoices
    if (choices.length > 0) {
      let i = event.key
      if (i >= 1 && i < choices.length+1) {
        this.story.ChooseChoiceIndex(i-1)
        this.resetText()
      }
    }
    if (event.keyCode == 13) {
      if (!this.story.canContinue && choices.length < 1) {
        this.showing = false
        if (this.callback) {
          this.callback()
          this.callback = null
        }
        this.game.drawWholeMap()
        this.game.engine.unlock()
        return
      }
    }
    this.continue()
    this.draw()
  }

  continue() {
    if (this.story.canContinue) {
      let events = []
      while (this.story.canContinue) {
        const text = this.fetchText(events)
        if (text != null)
          this.pushText(text)
      }
      let choices = this.story.currentChoices
      for (let i=0; i<choices.length; i++) {
        let choice = choices[i];
        this.pushText("%c{red}" + (i+1) + "%c{}: " + choice.text)
      }

      if (choices.length == 0) {
        this.pushText("\nPush %c{red}enter%c{} to continue")
      }
      this.handleStoryEvents(events)
    }
  }

  handleStoryEvents(events) {
    events.forEach((e) => { this.game.handleStoryEvent(e) })
  }

  fetchText(events) {
    const text = this.story.Continue()
    if (text[0] == ":") {
      events.push(text.trim().split(", "))
      return null
    } else {
      return text
    }
  }

  textWidth() {
    return this.game.width - this.padding * 2
  }

  drawBox(x0, y0, x1, y1, v) {
    for (let x=x0; x<=x1; x++) {
      for (let y=y0; y<=y1; y++) {
        this.game.display.draw(x, y, v)
      }
    }
  }

  drawBorder(x0, y0, x1, y1, vx, vy, vc) {
    let x = 0, y = 0;
    for (x=x0; x<=x1; x++) {
      this.game.display.draw(x, y0, vx)
    }
    for (x=x0; x<=x1; x++) {
      this.game.display.draw(x, y1, vx)
    }
    for (y=y0; y<=y1; y++) {
      this.game.display.draw(x0, y, vy)
    }
    for (y=y0; y<=y1; y++) {
      this.game.display.draw(x1, y, vy)
    }
    this.game.display.draw(x0, y0, vc)
    this.game.display.draw(x0, y1, vc)
    this.game.display.draw(x1, y0, vc)
    this.game.display.draw(x1, y1, vc)
  }
}
