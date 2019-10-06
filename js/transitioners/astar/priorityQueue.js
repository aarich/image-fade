/** @module PriorityQueue */
export default class PriorityQueue {
    constructor() {
        // TODO use a skiplist or something.
        this.arr = [];
    }

    /**
     * Add an object to the queue
     * @param {object} value the value to store
     * @param {number} weight the weight associated with the value
     */
    add(value, weight) {
        const node = { weight, value };

        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i].weight < node.weight) {
                // Insert it before current node
                this.arr.splice(i, 0, node);
                return;
            }
        }

        // It's the smallest one.
        this.arr.push(node);
    }

    /**
     * Look at next (lowest) element (but don't remove it)
     */
    peek() {
        return this.arr[this.arr.length - 1].value;
    }

    /**
     * Removes and returns the lowest weighted element
     */
    getAndRemoveLowest() {
        return this.arr.pop().value;
    }

    get length() {
        return this.arr.length;
    }

    /**
     * Returns the element at index i
     * @param {number} i the index
     */
    get(i) {
        return this.arr[i].value;
    }
}
