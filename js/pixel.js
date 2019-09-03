export default class Pixel {
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
