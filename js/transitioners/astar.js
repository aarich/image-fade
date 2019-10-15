import Transitioner from './transitioner.js';
import AStarSearch from './astar/search.js';

/** @module AStarTransitioner */
export default class AStarTransitioner extends Transitioner {
    run(callback) {
        this.input.convertToGrayScale();
        this.output.convertToGrayScale();

        this.search = new AStarSearch(this.input, this.output, 5);
        this.search.run(callback, 100, true);
    }

    stop() {
        super.stop();
        this.search.stop = true;
    }
}
