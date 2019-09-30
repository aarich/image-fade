export default class Node {
    /**
     * @param {number} x position x
     * @param {number} y position y
     * @param {number} diff change to pixel at position
     * @param {Node} parent parent to this node
     */
    constructor(x, y, diff, parent) {
        this.g = parent ? parent.g + 1 : 0;
        this.x = x;
        this.y = y;
        this.diff = diff;
        this.h = 0;
        this.parent = parent || null;
    }

    get f() {
        return this.g + this.h;
    }

    /**
     * Returns true if the other node has the same image as this one.
     * @param {Node} other the node to compare
     */
    equals(other, startImage) {
        const BreakException = {};
        try {
            startImage.iterate((x, y) => {
                if (this.getPixelValue(x, y, startImage)
                    .equals(other.getPixelValue(x, y, startImage))) {
                    throw BreakException;
                }
            });
        } catch (e) {
            if (e !== BreakException) {
                throw e;
            }

            return false;
        }
        return true;
    }

    /**
     * Return the pixel value at a given node, taking into account all
     * the parent diffs.
     * @param {number} x
     * @param {number} y
     * @param {MyImage} startingImage
     */
    getPixelValue(x, y, startingImage) {
        let currentNode = this;
        let diff = 0;
        while (currentNode) {
            if (currentNode.x === x && currentNode.y === y) {
                diff += currentNode.diff;
            }

            currentNode = currentNode.parent;
        }

        return startingImage.get(x, y).add(diff);
    }
}
