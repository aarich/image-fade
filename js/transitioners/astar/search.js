import Node from './node.js';
import PriorityQueue from './priorityQueue.js';

export default class AStarSearch {
    constructor(inputImage, outputImage) {
        this.input = inputImage;
        this.output = outputImage;
        this.open = new PriorityQueue();
        this.closed = [];
        const firstNode = new Node(0, 0, 0, null);
        firstNode.h = this.initialH();
        this.open.add(firstNode, 0);
        this.scale = 1;
    }

    run(callback) {
        let counter = 0;
        while (this.open.length > 0) {
            // eslint-disable-next-line no-plusplus
            counter++;
            if (counter > 100) {
                setTimeout(() => {
                    const path = this.run(callback);
                    if (path) {
                        this.executeCallback(path, callback);
                    } else {
                        // eslint-disable-next-line no-console
                        console.log('nothing found');
                    }
                }, 5);
                break;
            }
            const q = this.open.getAndRemoveLowest();
            const finalNode = this.makeChildrenAddToOpenList(q);
            if (finalNode) {
                // finalNode only set if it's the final node (the goal)
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
        // TODO if all the children diffs are 1, 0, or -1 then you can do no better than that
        // for the rest of the transition. So simply add that number to g and mark it as a result
        // in the node so that when it is popped off the open list it can be identified as a goal
        // node.
        const possibleChildren = [];
        this.input.iterate((x, y) => {
            if (x % this.scale !== 0 || y % this.scale !== 0) {
                // Only look at some pixels.
                return;
            }
            const diff = this.getDiff(node, x, y);
            if (diff !== 0) {
                possibleChildren.push(new Node(x, y, diff, node));
            }
        });

        const goal = possibleChildren.find(
            (n) => n.equalsImage(this.input, this.output, this.scale),
        );

        return goal || possibleChildren;
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

        if (diff === 0) {
            diff = desiredPixel.minus(currentPixel);
            diff = diff !== 0 ? (diff / Math.abs(diff)) : 0; // convert to 1 / -1
        }

        return diff;
    }

    /**
     * Return a list of all possible neigbors in one dimension but not exceeding the bounds
     * @param {number} n the central number to look at
     * @param {number} min lower bound (probably 0)
     * @param {number} max upper bound (probably width or height)
     */
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
        if (node.diff === 0) {
            return true;
        }

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
     * Executes the app callback to update the UI and output renderers.
     * @param {Array<Node>} path array of nodes to traverse
     * @param {function} callback app callback function
     */
    executeCallback(path, callback) {
        const image = this.input;
        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            for (let j = 0; j < this.scale && node.x + j < this.input.width; j++) {
                for (let k = 0; k < this.scale && node.y + k < this.input.height; k++) {
                    const lastPixel = image.get(node.x + j, node.y + k);
                    image.setP(node.x + j, node.y + k, lastPixel.add(node.diff));
                }
            }

            callback(image, i);
        }
    }

    initialH() {
        let h = 0;
        this.input.iterate((x, y) => {
            // TODO move the iterate by scale method to image class
            if (x % this.scale === 0 && y % this.scale === 0) {
                h += Math.abs(this.input.get(x, y).minus(this.output.get(x, y)));
            }
        });
        return h;
    }
}
