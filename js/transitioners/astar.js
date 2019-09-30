import Transitioner from './transitioner.js';
import AStarSearch from './astar/search.js';

export default class AStarTransitioner extends Transitioner {
    run(callback) {
        this.input.convertToGrayScale();
        this.output.convertToGrayScale();

        const search = new AStarSearch(this.input, this.output);
        const path = search.run();
        if (path) {
            AStarTransitioner.executeCallback(path, callback);
        } else {
            throw new Error('Did not find the goal!');
        }
    }

    /**
     * Executes the app callback to update the UI and output renderers.
     * @param {Array} path array of nodes to traverse
     * @param {function} callback app callback function
     */
    static executeCallback(path, callback) {
        for (let i = 0; i < path.length; i++) {
            callback(path[i].image, i);
        }
    }
}
