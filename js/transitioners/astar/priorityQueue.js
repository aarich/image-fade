export default class PriorityQueue {
    constructor() {
        this.arr = [];
    }

    /**
     * add an object to the queue
     * @param {object} value the value to store
     * @param {number} weight the weight associated with the value
     */
    add(value, weight) {
        const node = { weight, value };
        if (this.arr.length === 0) {
            this.arr.push(node);
            return;
        }

        for (let i = 0; i < this.arr.length; i++) {
            const currentNode = this.arr[i];
            if (currentNode.weight > node.weight) {
                // Insert it before current node
                this.arr.splice(i, 0, node);
                return;
            }
        }

        // It's the smallest one.
        this.arr.push(node);
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

    get(i) {
        return this.arr[i].value;
    }
}
