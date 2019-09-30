import Node from './node.js';
import PriorityQueue from './priorityQueue.js';

export default class AStarSearch {
    constructor(inputImage, outputImage) {
        this.input = inputImage;
        this.output = outputImage;
        this.open = new PriorityQueue();
        this.closed = [];
        this.open.add(new Node(0, 0, 0), 0);
    }

    run() {
        let counter = 0;
        while (this.open.length > 0) {
            // eslint-disable-next-line no-plusplus
            counter++;
            if (counter > 100) {
                setTimeout(() => {
                    this.run();
                }, 5);
                break;
            }
            const q = this.open.getAndRemoveLowest();
            const finalNode = this.makeChildrenAddToOpenList(q);
            if (finalNode) {
                // Value only set if it's the final node (the goal)
                console.log("FOUND THE END");
                return AStarSearch.makePath(finalNode);
            }
            this.closed.push(q);
        }

        return null;
    }

    static makePath(node) {
        const result = [];
        let currentNode = node;
        while (currentNode) {
            result.unshift(currentNode);
            currentNode = currentNode.parent;
        }
        return result;
    }

    /**
     * returns all valid children of a given image instance
     * @param {Node} node the parent
     */
    makeChildrenAddToOpenList(node) {
        const possibleChildren = this.makePossibleChildren(node);
        if (!Array.isArray(possibleChildren)) {
            // This means we found the goal.
            return possibleChildren;
        }
        possibleChildren.forEach((successor) => {
            if (!this.shouldSkip(successor)) {
                this.open.add(successor, successor.f);
            }
        });
        return null;
    }

    /**
     * Makes all possible children of a given node.
     * @param {Node} node the parent
     */
    makePossibleChildren(node) {
        const possibleChildren = [];
        this.input.iterate((x, y) => {
            const diff = this.getDiff(node, x, y);
            possibleChildren.push(this.makeNode(x, y, diff, node));
        });

        return possibleChildren;
    }

    /**
     * Calculate a good diff for a child node at this location, comparing it against
     * its neighbors.
     * @param {Node} parent the parent node
     * @param {number} x
     * @param {number} y
     */
    getDiff(parent, x, y) {
        const desiredPixel = this.output.get(x, y);
        const currentPixel = parent.getPixelValue(x, y, this.input);

        const posX = AStarSearch.getPossibleValues(x, 0, this.input.width);
        const posY = AStarSearch.getPossibleValues(y, 0, this.input.height);

        let bestDiff = 255;
        let diff = 255;
        for (let i = 0; i < posX.length; i++) {
            for (let j = 0; j < posY.length; j++) {
                let option;
                if (posX[i] === x && posY[j] === y) {
                    // No need to recalculate
                    option = currentPixel;
                } else {
                    option = parent.getPixelValue(posX[i], posY[j], this.input);
                }
                const optionDiff = option.minus(desiredPixel);
                if (Math.abs(optionDiff) < Math.abs(bestDiff)) {
                    bestDiff = optionDiff;
                    diff = option.minus(currentPixel);
                }
            }
        }

        return diff;
    }

    static getPossibleValues(n, min, max) {
        const options = [];
        if (n > min) {
            options.push(n - 1);
        }
        options.push(n);
        if (n < max) {
            options.push(n + 1);
        }

        return options;
    }

    /**
     * returns true if the node is present with a smaller f value in
     * either the closed or open list.
     * @param {Node} node a successor
     */
    shouldSkip(node) {
        for (let i = 0; i < this.open.length; i++) {
            if (this.open.get(i).equals(node, this.input)) {
                return true;
            }
        }

        for (let i = 0; i < this.closed.length; i++) {
            if (this.closed[i].equals(node, this.input)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Make a node with the parameters
     * @param {number} x
     * @param {number} y
     * @param {number} diff the change in pixel value at (x, y)
     * @param {Node} parent the parent of the node to create
     */
    makeNode(x, y, diff, parent) {
        const node = new Node(x, y, diff, parent);
        node.h = this.calculateH(node);
        return node;
    }

    /**
     * Calculates the distance to the goal image
     * @param {Node} node The node on which to calculate h
     */
    calculateH(node) {
        let h = node.parent ? node.parent.h : 0;
        const desiredPixel = this.output.get(node.x, node.y);
        const currentPixel = node.getPixelValue(node.x, node.y, this.input);
        h += Math.abs(desiredPixel.r - currentPixel.r);

        return h;
    }
}
