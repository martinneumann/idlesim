import p5 from "p5";
import P5 from "p5";

export default class MyCircle {
	_p5: P5;
	_pos: P5.Vector;
	_size: number;
	_color: p5.Color;
	alpha: number;

	constructor(p5: P5, atPosition: P5.Vector, size: number, r: number, g: number, b: number, alpha?: number) {
		this._p5 = p5;
		this._pos = atPosition;
		this._size = size;
		this._color = p5.color(r, g, b, alpha);
		this.alpha = alpha || 255;
	}

	draw() {
		const p5 = this._p5; // just for convenience

		p5.push();

		p5.translate(this._pos);
		p5.noStroke();
		this._color.setAlpha(this.alpha);
		p5.fill(this._color);
		p5.ellipse(0, 0, this._size);

		p5.pop();
	}
}
