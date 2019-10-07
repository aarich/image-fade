/** @module AStarImage */
export default class AStarImage {
    /**
     * Converts a MyImage to a lightweight single value array
     * @param {MyImage} image the input image to convert from
     */
    constructor(image) {
        this.width = image.width;
        this.height = image.height;
        this.arr = new Uint8ClampedArray(this.width * this.height);
        image.iterate((x, y) => {
            this.arr[this._getIndex(x, y)] = image.get(x, y).r; // should be gray scale already
        });
    }

    _getIndex(x, y) {
        return this.width * y + x;
    }

    /**
     * Iterate over the pixels in the image
     * @param {function} fn the function to apply at each (x, y)
     * @param {number} s the scale. E.g. grid the image with grid-width s and
     *                   only call fn at those locations.
     * @param acc initial accumulator
     * @returns The last thing returned by the function.
     */
    iterate(fn, s, acc) {
        const scale = s || 1;
        let result = acc;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (x % scale === 0 && y % scale === 0) {
                    result = fn(x, y, result);
                }
            }
        }

        return result;
    }

    get(x, y) {
        return this.arr[this._getIndex(x, y)];
    }
}
