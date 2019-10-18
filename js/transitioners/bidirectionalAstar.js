import Transitioner from './transitioner.js';
import AStarSearch from './astar/search.js';
import executeCallback from './astar/utils.js';

/** @module BidirectionalAStarTransitioner */
export default class BidirectionalAStarTransitioner extends Transitioner {
    run(callback) {
        this.scale = 10;

        this.input.convertToGrayScale();
        this.output.convertToGrayScale();

        this.search1 = new AStarSearch(this.input, this.output, this.scale);
        this.search2 = new AStarSearch(this.output, this.input, this.scale);
        this.search1.otherClosed = this.search2.closed;
        this.search2.otherClosed = this.search1.closed;

        this.callback = callback;

        this._runOnce();
    }

    _runOnce() {
        for (let counter = 0; counter < 50; counter++) {
            const numTimes = 1;

            let winning = this.search1.run(this.callback, numTimes, false);
            if (winning) {
                executeCallback(BidirectionalAStarTransitioner.makePath(winning, 1),
                    this.callback, this.input, this.scale);
                return;
            }

            winning = this.search2.run(this.callback, numTimes, false);

            if (winning) {
                executeCallback(BidirectionalAStarTransitioner.makePath(winning, 2),
                    this.callback, this.input, this.scale);
                return;
            }
        }

        // eslint-disable-next-line no-console
        console.table(this.search1.stats);
        // eslint-disable-next-line no-console
        console.table(this.search2.stats);

        setTimeout(() => {
            this._runOnce();
        }, 1);
    }

    static makePath(winningNodes, direction) {
        const { winningChild, winningOtherNode } = winningNodes;
        const win1 = direction === 1 ? winningChild : winningOtherNode;
        const win2 = direction === 1 ? winningOtherNode : winningChild;

        const path = AStarSearch.makePath(win1);

        // Don't reverse win2 nodes since they come from the goal
        let currentNode = win2;
        while (currentNode) {
            currentNode.diff *= 1;
            path.push(currentNode);
            currentNode = currentNode.parent;
        }

        return path;
    }

    stop() {
        super.stop();
        this.search.stop = true;
    }
}
