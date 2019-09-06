import Pixel from './pixel.js';

export default class MyImage {
    constructor(imageData) {
        this.imageData = imageData;
    }

    get width() {
        return this.imageData.width;
    }

    get height() {
        return this.imageData.height;
    }

    convertToGrayScale() {
        this.iterate((x, y) => {
            const p = this.get(x, y);
            p.convertToGrayScale();
            this.setP(x, y, p);
        });
    }

    iterate(fn) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                fn(x, y);
            }
        }
    }

    get(x, y) {
        const redIndex = this._getRedIndex(x, y);
        const r = this.imageData.data[redIndex];
        const g = this.imageData.data[redIndex + 1];
        const b = this.imageData.data[redIndex + 2];
        const a = this.imageData.data[redIndex + 3];
        return new Pixel(r, g, b, a);
    }

    /**
     * set GrayScale
     * sets the RGB value at (x, y) to v.
     */
    setG(x, y, v) {
        this.set(x, y, v, v, v);
    }

    /**
     * set Pixel
     * Set's the pixel at (x, y) to p
     */
    setP(x, y, p) {
        this.set(x, y, p.r, p.g, p.b, p.a);
    }

    set(x, y, r, g, b, a) {
        const redIndex = this._getRedIndex(x, y);
        this.imageData.data[redIndex] = r;
        this.imageData.data[redIndex + 1] = g;
        this.imageData.data[redIndex + 2] = b;
        if (a) {
            this.imageData.data[redIndex + 3] = a;
        }
    }

    /**
     * gets the index for the red value at x, y
     * g, b, and a are +1, 2, & 3 respectively
     */
    _getRedIndex(x, y) {
        return y * (this.width * 4) + x * 4;
    }

    clone() {
        const newImageData = new ImageData(new Uint8ClampedArray(this.imageData.data),
            this.imageData.width, this.imageData.height);
        return new MyImage(newImageData);
    }
}
