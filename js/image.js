export class MyImage {
    constructor(imageData) {
        this.imageData = imageData;
    }

    get width() {
        return this.imageData.width;
    }

    get height() {
        return this.imageData.height;
    }

    get(x, y) {
        const redIndex = _getRedIndex(x, y);
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
        set(x, y, v, v, v)
    }

    /**
     * set Pixel
     * Set's the pixel at (x, y) to p
     */
    setP(x, y, p) {
        this.set(x, y, p.r, p.g, p.b, p.a);
    }

    set(x, y, r, g, b, a) {
        const redIndex = _getRedIndex(x, y);
        this.imageData.data[redIndex]     = r;
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
        const newImageData = new Uint8ClampedArray(this.imageData.data);
        newImageData.data.set(this.imageData.data);
        return new MyImage(newImageData);
    }
}

export class Pixel {
    /**
     * 
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     * @param {number} a 
     */
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * Returns true if this pixel is greater than p. 
     * Checks only red value so assumes grey scale.
     * @param {Pixel} p 
     */
    isGreaterThan(p) {
        return this.r > p.r;
    }

    /**
     * Returns the difference in the R value (p - this)
     * @param {Pixel} p 
     */
    minus(p) {
        return this.r - p.r;
    }

    /**
     * returns a new pixel with the value v added to it
     * @param {number} v the amount to add to this pixel
     */
    add(v) {
        return new Pixel(this.r + v, this.g + v, this.b + v, this.a);
    }
}