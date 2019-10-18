import Transitioner from './transitioner.js';

const DIRECTION = {
    FORWARD: 'f',
    BACKWARD: 'b',
};

/** @module BidirectionalIterativeTransitioner */
export default class BidirectionalIterativeTransitioner extends Transitioner {
    run(callback) {
        this.input.convertToGrayScale();
        this.output.convertToGrayScale();
        // The forward moving image
        this.current1 = this.input.clone();
        // The backward moving image
        this.current2 = this.output.clone();

        // Skip ahead when 10% of the image is moving!
        this.movementPercentage = 0.15;

        this.backwardImages = [];
        this.appCallback = callback;

        this._runInner(0);
    }

    /**
     * @param {number} iteration current iteration
     */
    _runInner(iteration) {
        if (iteration >= this.properties.iterations) {
            this.finishUp(iteration);
            return; // Done.
        }

        // Do the forward step.
        let temp = this.current1.clone();
        let changes = false;
        let moving = 0;
        this.iterate((x, y) => {
            const result = this.getNextPixel(x, y, DIRECTION.FORWARD);
            if (!result) {
                // No change needed
                return;
            }
            changes = true;
            moving = Math.abs(result.diff) <= 1 ? moving : moving + 1;
            temp.setP(x, y, result.nextPixel);
        });

        this.current1 = temp;

        if (!changes) {
            this.finishUp(iteration);
            return;
        }

        // Call the callback because we can for the forward step
        if (this.appCallback) {
            this.appCallback(this.current1, iteration + 1, this.properties.iterations * 2);
        }

        // Do the backward step.
        temp = this.current2.clone();
        this.iterate((x, y) => {
            const pixel = this.getNextPixel(x, y, DIRECTION.BACKWARD);
            if (pixel) {
                temp.setP(x, y, pixel.nextPixel);
            }
        });

        this.current2 = temp;

        // Since we can't call the callback, push it onto the stack.
        this.backwardImages.push(temp);

        if ((moving / (this.width * this.height)) < this.movementPercentage) {
            // We're just fading. Jump to the end!
            this.iterate((x, y) => {
                const pixel = this.current2.get(x, y);
                this.current1.setP(x, y, pixel);
            });

            this.appCallback(this.current1, iteration + 1, this.properties.iterations * 2);

            this.finishUp(iteration + 1);
            return;
        }

        if (!this.shouldStop) {
            setTimeout(() => {
                this._runInner(iteration + 1);
            }, 1);
        } else {
            // Stopping now, so reset this
            this.shouldStop = false;
        }
    }

    /**
     * Returns the best out of choosing the nearby pixels and just fading by +/-1
     * @param {number} x x position
     * @param {number} y y position
     * @param {string} direction the direction to go
     */
    getNextPixel(x, y, direction) {
        let current;
        let goal;
        switch (direction) {
            case DIRECTION.FORWARD:
                current = this.current1;
                goal = this.current2;
                break;
            case DIRECTION.BACKWARD:
                current = this.current2;
                goal = this.current1;
                break;
            default:
                throw new Error(`Unknown direction: ${direction}`);
        }

        const currentPixel = current.get(x, y);
        const desiredPixel = goal.get(x, y);

        let diff = desiredPixel.minus(currentPixel);
        let nextPixel = currentPixel.add(diff > 0 ? -1 : 1);

        const isBetterOption = (p) => {
            const newDiff = desiredPixel.minus(p);
            return Math.abs(newDiff) <= Math.abs(diff);
        };

        if (x > 0 && isBetterOption(current.get(x - 1, y))) {
            nextPixel = current.get(x - 1, y);
            diff = desiredPixel.minus(nextPixel);
        }

        if (x < this.width - 1 && isBetterOption(current.get(x + 1, y))) {
            nextPixel = current.get(x + 1, y);
            diff = desiredPixel.minus(nextPixel);
        }

        if (y > 0 && isBetterOption(current.get(x, y - 1))) {
            nextPixel = current.get(x, y - 1);
            diff = desiredPixel.minus(nextPixel);
        }

        if (y < this.height - 1 && isBetterOption(current.get(x, y + 1))) {
            nextPixel = current.get(x, y + 1);
            diff = desiredPixel.minus(nextPixel);
        }

        if (diff === 0) {
            return null;
        }

        return { nextPixel, diff };
    }

    finishUp(lastIteration, iteration = 1) {
        if (iteration > this.backwardImages.length) {
            return;
        }
        const currentIteration = lastIteration + iteration;
        const image = this.backwardImages[this.backwardImages.length - iteration];
        this.appCallback(image, currentIteration, lastIteration + this.backwardImages.length);
        setTimeout(() => {
            this.finishUp(lastIteration, iteration + 1);
        }, 1);
    }
}
