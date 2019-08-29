export class Transitioner {
    constructor(image1, image2) {
        if (image1.getWidth() !== image2.getWidth()) {
            throw "widths are not equal";
        }

        if (image1.getHeight() !== image2.getHeight()) {
            throw "heights are not equal";
        }

        this.input = image1;
        this.output = image2;
        this.width = this.input.getWidth();
        this.height = this.input.getHeight();
    }

    run() {
        // TODO...
        console.log(`
            =====================================
            Running with the following arguments:
            width: ${this.width}
            height: ${this.height}
            =====================================`);
    }
}