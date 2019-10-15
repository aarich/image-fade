/** @module Node */
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
        this.parent = parent || null;
        this.h = parent ? parent.h - Math.abs(diff) : 0;

        // This is true if the remaining changes are just +1, 0, or -1 changes.
        // Remaining nodes can be extrapolated.
        this.isEndInSight = false;
    }

    get f() {
        return this.g + this.h;
    }

    /**
     * Returns true if the other node has the same image as this one.
     * @param {Node} other the node to compare
     */
    equals(other) {
        if (this.isEndInSight) {
            // Not really true equality but should work
            return other.isEndInSight && this.g === other.g;
        }

        // Check to see if we have all the same diffs.
        const thisDiffs = this.diffDictionary;
        const otherDiffs = other.diffDictionary;
        if (thisDiffs.size !== otherDiffs.size) {
            // Can't be the same. Unlikely once all pixels are modified though
            return false;
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const key of thisDiffs.keys()) {
            if (thisDiffs.get(key) !== otherDiffs.get(key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @returns {Map<string, number>} map of keys containing x,y positions to the
     * diff at that location
     */
    get diffDictionary() {
        if (this._diffDictionary) {
            return this._diffDictionary;
        }

        this._diffDictionary = new Map(this.parent ? this.parent.diffDictionary : []);
        const key = Node.makeDiffKey(this.x, this.y);
        const value = this._diffDictionary.get(key);
        this._diffDictionary.set(key, value ? value + this.diff : this.diff);

        return this._diffDictionary;
    }

    static makeDiffKey(x, y) {
        return `${x},${y}`;
    }

    /**
     * Return the pixel value at a given node, taking into account all
     * the parent diffs.
     * @param {number} x
     * @param {number} y
     * @param {MyImage} startingImage
     * @returns {number} pixel value at this position
     */
    getPixelValue(x, y, startingImage) {
        const diff = this.diffDictionary.get(Node.makeDiffKey(x, y));
        return startingImage.get(x, y) + (diff || 0);
    }

    /**
     * determine if this node equals
     * @param {MyImage} startingImage starting image
     * @param {MyImage} goalImage goal image to check
     * @param {number} scale integer scale
     */
    equalsImage(startingImage, goalImage, scale) {
        const BreakException = {};
        try {
            startingImage.iterate((x, y) => {
                if (goalImage.get(x, y) !== this.getPixelValue(x, y, startingImage)) {
                    throw BreakException;
                }
            }, scale);
        } catch (error) {
            if (error === BreakException) {
                return false;
            }
            throw error;
        }

        return true;
    }

    /**
     * Return true if this node is equivalent to the otherNode originating
     * from the opposite search
     * @param {Node} otherNode the opposite node to compare against
     * @param {AStarImage} inputImage the input image to this search
     * @param {AStarImage} outputImage the output image to this search
     * @param {number} scale the scale of the search
     */
    equalsOppositeNode(otherNode, inputImage, outputImage, scale) {
        const totalDiffDictionary = new Map(this.diffDictionary);
        otherNode.diffDictionary.forEach((value, key) => {
            const total = totalDiffDictionary.get(key);
            // The subtraction is because one comes from the start
            // while the opposite comes from the goal
            totalDiffDictionary.set(key, total - value);
        });

        const fakeNode = new Node(0, 0, 0, null);
        fakeNode._diffDictionary = totalDiffDictionary;
        return fakeNode.equalsImage(inputImage, outputImage, scale);
    }
}
