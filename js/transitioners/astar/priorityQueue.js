import NodeSet from './nodeSet.js';

/** @module PriorityQueue Implemented with a min heap and tree */
export default class PriorityQueue {
    constructor() {
        this.arr = [];
        this.nodeSet = new NodeSet();
    }

    /**
     * Add a node to the heap
     * @param {Node} node the new node to add
     */
    add(node) {
        this.arr.push(node);
        this._bubbleUp();
        this.nodeSet.add(node);
    }

    _bubbleUp() {
        // Bubbling up the last added element
        let index = this.arr.length - 1;
        while (index > 0) {
            const element = this.arr[index];
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.arr[parentIndex];
            if (parent.h <= element.h) {
                // We're good because the parent is less than the element
                break;
            }

            // Swap
            this.arr[index] = parent;
            this.arr[parentIndex] = element;
            index = parentIndex;
        }
    }

    getAndRemoveLowest() {
        if (this.arr.length === 1) {
            return this.arr.pop();
        }

        const element = this.arr[0];
        this.arr[0] = this.arr.pop();
        this._bubbleDown(0);
        return element;
    }

    _bubbleDown(index) {
        const left = 2 * index + 1;
        const right = left + 1;
        let smallest = index;

        if (left < this.length && this.arr[left].h < this.arr[smallest].h) {
            smallest = left;
        }

        if (right < this.length && this.arr[right].h < this.arr[smallest].h) {
            smallest = right;
        }

        // Swap if needed
        if (smallest !== index) {
            [this.arr[smallest], this.arr[index]] = [this.arr[index], this.arr[smallest]];
            this._bubbleDown(smallest);
        }
    }

    /**
     * Look at next (lowest) element (but don't remove it)
     * @returns {Node} the next node
     */
    peek() {
        return this.arr[0];
    }

    /**
     * The length of the open list
     */
    get length() {
        return this.arr.length;
    }

    get closedLength() {
        return this.nodeSet.size - this.arr.length;
    }

    /**
     * Checks in the open and closed lists to see if
     * the node has been seen before
     * @param {Node} node the node to check
     */
    doesAllSeenHaveThisNode(node) {
        return this.nodeSet.has(node);
    }

    /**
     * Space saving operation. We will probably never reach these elements...
     */
    cull() {
        const nextH = this.peek().h;
        // Use nextH to decide how many more nodes to keep
        this.arr.splice(Math.max(nextH * 5, 500));
    }
}
