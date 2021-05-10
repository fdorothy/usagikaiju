export class Draw {
  constructor(display) {
	  this.display = display;
  }

  drawBox(rect, v) {
	  for (let x=rect[0]; x<=rect[2]; x++) {
	    for (let y=rect[1]; y<=rect[3]; y++) {
		    this.display.draw(x, y, v)
	    }
	  }
  }

  drawBorder(rect, vx, vy, vc) {
	  let x = 0, y = 0;
	  for (x=rect[0]; x<=rect[2]; x++) {
	    this.display.draw(x, rect[1], vx)
	  }
	  for (x=rect[0]; x<=rect[2]; x++) {
	    this.display.draw(x, rect[3], vx)
	  }
	  for (y=rect[1]; y<=rect[3]; y++) {
	    this.display.draw(rect[0], y, vy)
	  }
	  for (y=rect[1]; y<=rect[3]; y++) {
	    this.display.draw(rect[2], y, vy)
	  }
	  this.display.draw(rect[0], rect[1], vc)
	  this.display.draw(rect[0], rect[3], vc)
	  this.display.draw(rect[2], rect[1], vc)
	  this.display.draw(rect[2], rect[3], vc)
  }

  drawLine(x0, y0, x1, y1, v, vc) {
	  let x = x0, y = y0;
	  let dx = x0 > x1 ? -1 : 1;
	  let dy = y0 > y1 ? -1 : 1;
	  while (x != x1 || y != y1) {
	    if (x != x1)
		    x += dx;
	    if (y != y1)
		    y += dy;
	    this.display.draw(x, y, v)
	  }
	  this.display.draw(x0, y0, vc)
	  this.display.draw(x1, y1, vc)
  }
}
