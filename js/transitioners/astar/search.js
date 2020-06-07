import Node from './node.js';
import PriorityQueue from './priorityQueue.js';
import AStarImage from './astarImage.js';
import executeCallback from './utils.js';
import NodeSet from './nodeSet.js';

/** @module AStarSearch */
export default class AStarSearch {
    /**
     * @param {MyImage} inputImage source image
     * @param {MyImage} outputImage goal image
     * @param {number} scale sampling scale (1/scale pixels per side, 1 is 100%, 10 is 1/100 pixels)
     */
    constructor(inputImage, outputImage, scale) {
        this.originalInputImage = inputImage;
        this.input = new AStarImage(inputImage);
        this.output = new AStarImage(outputImage);
        this.scale = scale;
        this.stats = { numProcessed: 0 };

        this.initData();
    }

    initData() {
        this.open = new PriorityQueue();
        const firstNode = new Node(0, 0, 0, null);
        firstNode.h = this.initialH();
        this.open.add(firstNode);

        this.closed = new NodeSet();
    }

    /**
     * Run the search algorithm
     * @param {function} callback the app callback function to call when finished
     * @param {number} numTimes how many times to iterate before calling self again or returning
     * @param {boolean} callSelf should this search call itself after performing the iterations?
     */
    run(callback, numTimes, callSelf) {
        if (this.stop) {
            return null;
        }

        for (let i = 0; i < numTimes && this.open.length > 0; i++) {
            const q = this.open.getAndRemoveLowest();
            const finalNode = q.endInSight ? q : this.makeChildrenAddToOpenList(q);
            if (finalNode) {
                // finalNode only set if it's the final node (the goal)
                return AStarSearch.makePath(finalNode);
            }
            this.closed.add(q);
        }

        this.open.cull();

        this.stats.numProcessed += numTimes;
        this.stats.currentOpenLength = this.open.length;
        const next = this.open.peek();
        this.stats.nextGValue = next.g;
        this.stats.nextHValue = next.h;
        if (callSelf) {
            setTimeout(() => {
                // eslint-disable-next-line no-console
                console.table(this.stats);
                const path = this.run(callback, numTimes, callSelf);
                if (path) {
                    executeCallback(path, callback, this.originalInputImage, this.scale);
                }
            }, 5);
        }

        return null;
    }

    /**
     * Recurses back up the node tree to find the path to the start.
     * @param {Node} node the winning node
     */
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
     * Returns all valid children of a given image instance
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
                this.open.add(successor);
            }
        });
        return null;
    }

    /**
     * Makes all possible children of a given node.
     * @param {Node} node the parent
     */
    makePossibleChildren(node, branchingFactor) {
        const possibleChildren = [];

        this.input.iterate((x, y) => {
            const diffs = this.getPossibleDiffs(node, x, y);
            const pixelChildren = [];
            diffs.forEach((diff) => {
                const newNode = new Node(x, y, diff.diff, node);
                newNode.h = node.h + diff.deltaH;
                pixelChildren.push(newNode);
            });

            // For speed, just choose the top branches.
            if (pixelChildren.length > (branchingFactor || 3)) {
                pixelChildren.sort((a, b) => a.h - b.h);
                pixelChildren.splice(branchingFactor || 3);
            }

            Array.prototype.push.apply(possibleChildren, pixelChildren);
        }, this.scale);

        // If otherClosed is set, then check agains the opposite search nodes
        // Otherwise, just check for reaching the goal.
        const goal = this.otherClosed
            ? this.checkForConvergence(possibleChildren)
            : possibleChildren.find(
                (n) => n.diff !== 0 && n.equalsImage(this.input, this.output, this.scale),
            );

        return goal || possibleChildren;
    }

    /**
     * Return a winning node if any of the children match the any of the
     * opposite search's closed nodes.
     * @param {Node[]} children the new possible children
     */
    checkForConvergence(children) {
        let winningOtherNode = null;
        const winningChild = children.find((child) => {
            winningOtherNode = this.otherClosed.find((otherNode) => {
                return otherNode.equalsOppositeNode(child, this.input, this.output);
            });
            return winningOtherNode;
        });

        return winningChild ? { winningChild, winningOtherNode } : null;
    }

    // /**
    //  * Makes all possible children of a given node.
    //  * @param {Node} node the parent
    //  */
    // makePossibleChildren(node) {
    //     const possibleChildren = [];
    //     const endInSight = this.input.iterate((x, y, tinyDiffs) => {
    //         const diff = this.getDiff(node, x, y);
    //         if (diff > 1 || diff < -1) {
    //             possibleChildren.push(new Node(x, y, diff, node));
    //         }

    //         return tinyDiffs && (diff >= -1 && diff <= 1);
    //     }, this.scale, true);

    //     if (endInSight) {
    //         // Create a dummy node representing the end.
    //         const endingNode = new Node(0, 0, 0, node);
    //         endingNode.endInSight = true;
    //         return [endingNode];
    //     }

    //     const goal = possibleChildren.find(
    //         (n) => n.equalsImage(this.input, this.output, this.scale),
    //     );

    //     if (goal) {
    //         return goal;
    //     }

    //     return possibleChildren;
    // }

    /**
     * Returns numeric values for all possible diffs from the current pixel
     * @param {Node} parent the parent node
     * @param {number} x
     * @param {number} y
     * @returns {number[]} an array of possible diffs.
     */
    getPossibleDiffs(parent, x, y) {
        const currentPixel = parent.getPixelValue(x, y, this.input);
        const desiredPixel = this.output.get(x, y);
        const currentDiff = desiredPixel - currentPixel;

        const posX = AStarSearch.getPossibleValues(x, 0, this.input.width - 1);
        const posY = AStarSearch.getPossibleValues(y, 0, this.input.height - 1);

        const diffs = [];

        const addIfNeeded = (diff) => {
            if (!diffs.find((d) => d.diff === diff)) {
                const newDiff = desiredPixel - (currentPixel + diff);
                const deltaH = Math.abs(newDiff) - Math.abs(currentDiff);

                diffs.push({ diff, deltaH });
            }
        };

        for (let i = 0; i < posX.length; i++) {
            for (let j = 0; j < posY.length; j++) {
                let option;
                if (posX[i] === x && posY[j] === y) {
                    // No need to recalculate
                    option = currentPixel;
                } else {
                    option = parent.getPixelValue(posX[i], posY[j], this.input);
                }
                const diff = option - currentPixel;

                addIfNeeded(diff);
            }
        }

        // Add the options for just fading.
        [-1, 1].forEach((diff) => {
            if (currentPixel + diff >= 0 && currentPixel + diff <= 255) {
                addIfNeeded(diff);
            }
        });

        return diffs;
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
        let diff = 0;
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

        return this.open.doesAllSeenHaveThisNode(node);
    }

    /**
     * Calculte the H for the first node.
     */
    initialH() {
        let h = 0;
        this.input.iterate((x, y) => {
            h += Math.abs(this.input.get(x, y) - this.output.get(x, y));
        }, this.scale);
        return h;
    }
}
