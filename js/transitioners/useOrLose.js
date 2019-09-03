import Transitioner from './transitioner.js';

export default class UseOrLoseTransitioner extends Transitioner {
    run() {
        this.current = this.input.clone();

        for (let i = 0; i < this.properties.iterations; i++) {
            let temp = this.current.clone();
            this.iterate((x, y) => {
                const pixel = this.getNextPixel(x, y);
                temp.setP(x, y, pixel);
            });

            this.current = temp;
        }
    }

    getNextPixel(x, y) {
        const currentPixel = this.current.get(x, y);
        const desiredPixel = this.output.get(x, y);

        let diff = desiredPixel.minus(currentPixel);
        let nextPixel = currentPixel.add(diff > 0 ? -1 : 1);

        const isBetterOption = p => {
            const newDiff = desiredPixel.minus(p);
            return Math.abs(newDiff) <= Math.abs(diff);
        }

        if (x > 0 && isBetterOption(this.current.get(x - 1, y))) {
            nextPixel = this.current.get(x - 1, y);
            diff = desiredPixel.minus(nextPixel);
        }

        if (x < this.width - 1 && isBetterOption(this.current.get(x + 1, y))) {
            nextPixel = this.current.get(x + 1, y);
            diff = desiredPixel.minus(nextPixel);
        }

        if (y > 0 && isBetterOption(this.current.get(x, y - 1))) {
            nextPixel = this.current.get(x, y - 1);
            diff = desiredPixel.minus(nextPixel);
        }

        if (y < this.height - 1 && isBetterOption(this.current.get(x, y + 1))) {
            nextPixel = this.current.get(x, y + 1);
        }

        return nextPixel;
    }
}