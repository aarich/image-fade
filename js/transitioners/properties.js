export default class Properties {
    constructor() {
        this._numIterations = 10;
    }

    /**
     * @param {number} x how many iterations to run (default 10)
     */
    numIterations(x) {
        this._numIterations = x;
        return this;
    }

    get iterations() {
        return this._numIterations;
    }
}
