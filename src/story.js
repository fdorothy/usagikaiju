let Story = require('inkjs').Story;
import { Text } from 'rot-js/lib/index';
import { Util } from './util'

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
    this.game.pushVariables()
    this.story.ChoosePathString(knot);
    this.showing = true;
    this.callback = cb
    this.resetText()
    this.continue()
    this.waitForEvent = null
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
    const text = this.text.join('\n\n')
    this.game.display.drawText(xy[0], xy[1], text, this.textWidth())
  }

  pushText(text) {
    this.text.push(text)
  }

  resetText() {
    this.text = []
  }

  act() {
    if (this.showing) {
      this.draw()
      const handleEvent = this.handleEvent
      return new Promise(function(resolve) {
        window.addEventListener("keydown", (e) => {
          handleEvent(e, resolve)
        }, {once: true})
      })
    }
    return Promise.resolve(true)
  }

  handleEvent = (e, resolve) => {
    e.preventDefault()
    let choices = this.story.currentChoices
    if (choices.length > 0) {
      let i = event.key
      if (i >= 1 && i < choices.length+1) {
        this.story.ChooseChoiceIndex(i-1)
        this.resetText()
        this.continue()
      }
    }
    if (event.keyCode == 13) {
      if (this.story.canContinue) {
        this.resetText()
        this.continue()
        resolve(true)
        return
      }
      else if (!this.story.canContinue && choices.length < 1) {
        this.showing = false
        if (this.callback) {
          this.callback()
          this.callback = null
        }
        resolve(true)
        return
      }
    }
    resolve(true)
    this.draw()
  }

  continue() {
    console.log('calling continue')
    const color = Util.colors.important
    if (this.story.canContinue) {
      let events = []
      let br = false
      while (this.story.canContinue && !br) {
        const text = this.fetchText(events)
        console.log(text)
        if (text != null && text != ":br") {
          this.pushText(text)
        } else if (text == ":br") {
          br = true
        }
      }
      let choices = this.story.currentChoices
      for (let i=0; i<choices.length; i++) {
        let choice = choices[i];
        this.pushText(`%c{${color}}` + (i+1) + "%c{}: " + choice.text)
      }

      if (choices.length == 0) {
        this.pushText(`Push %c{${color}}enter%c{} to continue`)
      }
      this.handleStoryEvents(events)
    }
  }

  handleStoryEvents(events) {
    events.forEach((e) => { this.game.handleStoryEvent(e) })
  }

  fetchText(events) {
    const text = this.story.Continue()
    if (text.trim() == ":br") {
       return ":br"
    } else if (text[0] == ":") {
      events.push(text.trim().split(","))
      return null
    } else {
      return text.trim()
    }
  }

  textWidth() {
    return this.game.width - this.padding * 2 - 1
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
