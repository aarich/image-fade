import Properties from './properties.js';

export default class Transitioner {
    constructor(image1, image2, properties) {
        if (image1.width !== image2.width) {
            throw new Error(`widths are not equal: ${image1.width} vs ${image2.width}`);
        }

        if (image1.height !== image2.height) {
            throw new Error(`heights are not equal: ${image1.height} vs ${image2.height}`);
        }

        this.input = image1;
        this.output = image2;
        this.width = this.input.width;
        this.height = this.input.height;

        this.properties = properties || new Properties();

        this.shouldStop = false;
    }

    /**
     * Applies the function fn at each pixel location
     * @param {function} fn
     */
    iterate(fn) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                fn(x, y);
            }
        }
    }

    run() {
        throw new Error(`run method not implemented for ${this.constructor.name}`);
    }

    stop() {
        this.shouldStop = true;
    }
}
