import Properties from './properties.js';

export default class Transitioner {
    constructor(image1, image2, properties) {
        if (image1.width !== image2.width) {
            throw `widths are not equal: ${image1.width} vs ${image2.width}`;
        }

        if (image1.height !== image2.height) {
            throw `heights are not equal: ${image1.height} vs ${image2.height}`;
        }

        this.input = image1;
        this.output = image2;
        this.width = this.input.width;
        this.height = this.input.height;

        this.properties = properties ? properties : new Properties();
    }

    iterate(fn) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                fn(x, y);
            }
        }
    }

    run() {;
        console.log(`
            =====================================
            Running with the following arguments:
            width: ${this.width}
            height: ${this.height}
            =====================================`);
        throw "run method not implemented";
    }
}