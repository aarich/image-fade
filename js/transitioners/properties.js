export default class Properties {
    constructor() {
        this._numIterations = 150;
    }

    /**
     * @param {number} x how many iterations to run
     */
    numIterations(x) {
        this._numIterations = x;
        return this;
    }

    get iterations() {
        return this._numIterations;
    }
}
