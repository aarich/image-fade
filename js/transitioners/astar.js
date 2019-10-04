import Transitioner from './transitioner.js';
import AStarSearch from './astar/search.js';

/** @module AStarTransitioner */
export default class AStarTransitioner extends Transitioner {
    run(callback) {
        this.input.convertToGrayScale();
        this.output.convertToGrayScale();

        const search = new AStarSearch(this.input, this.output);
        search.scale = 10;
        search.run(callback);
    }
}
