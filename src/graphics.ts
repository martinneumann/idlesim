import P5 from "p5";

export default class MyCircle {
	_p5: P5;
	_pos: P5.Vector;
	_size: number;
	_color: P5.Color;
	_name: string | undefined;
	alpha: number;

	constructor(p5: P5, atPosition: P5.Vector, size: number, rgb: number[], name?: string, alpha?: number) {
		this._p5 = p5;
		this._pos = atPosition;
		this._size = size;
		this._color = p5.color(rgb[0], rgb[1], rgb[2], alpha);
		this._name = name || undefined;
		this.alpha = alpha || 255;
	}

	draw() {
		const p5 = this._p5; // just for convenience

		p5.push();

		p5.noStroke();
		this._color.setAlpha(this.alpha);
		if (this._name !== undefined) {
			const text = p5.text(this._name, this._pos.x, this._pos.y);
		}
		p5.fill(this._color);
		p5.ellipse(this._pos.x + 30, this._pos.y - 15, this._size);

		p5.pop();
	}
}
