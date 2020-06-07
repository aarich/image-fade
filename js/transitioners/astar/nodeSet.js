/* eslint-disable no-param-reassign */
/** @module NodeSet Implemented with a min heap and tree */
export default class NodeSet {
    constructor() {
        this.nodes = new Map();
        this._size = 0;
    }

    add(node) {
        this._size += 1;
        if (this.nodes.has(node.h)) {
            this.nodes.get(node.h).push(node);
        } else {
            this.nodes.set(node.h, [node]);
        }
    }

    get size() {
        return this._size;
    }

    has(node) {
        const arr = this.nodes.get(node.h);
        if (!arr) {
            return false;
        }

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].equals(node)) {
                return true;
            }
        }
        return false;
    }

    find(fn) {
        // eslint-disable-next-line no-restricted-syntax
        for (const nodeList of this.nodes.values()) {
            const found = nodeList.find(fn);
            if (found) {
                return found
            }
        }
        return null;
    }
}
