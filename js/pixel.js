/** @module Pixel */
export default class Pixel {
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

    /**
     * Converts the pixel to gray scale by taking the average.
     * TODO - improve this.
     */
    convertToGrayScale() {
        const newValue = (this.r + this.g + this.b) / 3;
        this.r = newValue;
        this.g = newValue;
        this.b = newValue;
    }

    /**
     * Returns true if both pixels have the same RGBA values
     * @param {Pixel} other the pixel to compare
     */
    equals(other) {
        return this.r === other.r
            && this.g === other.g
            && this.b === other.b
            && this.a === other.a;
    }
}
