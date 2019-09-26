(function () {
    'use strict';

    class Pixel {
        /**
         *
         * @param {number} r
         * @param {number} g
         * @param {number} b
         * @param {number} a
         */
        constructor(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }

        /**
         * Returns true if this pixel is greater than p.
         * Checks only red value so assumes grey scale.
         * @param {Pixel} p
         */
        isGreaterThan(p) {
            return this.r > p.r;
        }

        /**
         * Returns the difference in the R value (p - this)
         * @param {Pixel} p
         */
        minus(p) {
            return this.r - p.r;
        }

        /**
         * returns a new pixel with the value v added to it
         * @param {number} v the amount to add to this pixel
         */
        add(v) {
            return new Pixel(this.r + v, this.g + v, this.b + v, this.a);
        }

        convertToGrayScale() {
            const newValue = (this.r + this.g + this.b) / 3;
            this.r = newValue;
            this.g = newValue;
            this.b = newValue;
        }
    }

    class MyImage {
        constructor(imageData) {
            this.imageData = imageData;
        }

        get width() {
            return this.imageData.width;
        }

        get height() {
            return this.imageData.height;
        }

        convertToGrayScale() {
            this.iterate((x, y) => {
                const p = this.get(x, y);
                p.convertToGrayScale();
                this.setP(x, y, p);
            });
        }

        iterate(fn) {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    fn(x, y);
                }
            }
        }

        get(x, y) {
            const redIndex = this._getRedIndex(x, y);
            const r = this.imageData.data[redIndex];
            const g = this.imageData.data[redIndex + 1];
            const b = this.imageData.data[redIndex + 2];
            const a = this.imageData.data[redIndex + 3];
            return new Pixel(r, g, b, a);
        }

        /**
         * set GrayScale
         * sets the RGB value at (x, y) to v.
         */
        setG(x, y, v) {
            this.set(x, y, v, v, v);
        }

        /**
         * set Pixel
         * Set's the pixel at (x, y) to p
         */
        setP(x, y, p) {
            this.set(x, y, p.r, p.g, p.b, p.a);
        }

        set(x, y, r, g, b, a) {
            const redIndex = this._getRedIndex(x, y);
            this.imageData.data[redIndex] = r;
            this.imageData.data[redIndex + 1] = g;
            this.imageData.data[redIndex + 2] = b;
            if (a) {
                this.imageData.data[redIndex + 3] = a;
            }
        }

        /**
         * gets the index for the red value at x, y
         * g, b, and a are +1, 2, & 3 respectively
         */
        _getRedIndex(x, y) {
            return y * (this.width * 4) + x * 4;
        }

        clone() {
            const newImageData = new ImageData(new Uint8ClampedArray(this.imageData.data),
                this.imageData.width, this.imageData.height);
            return new MyImage(newImageData);
        }
    }

    class ImagePicker extends HTMLElement {
        constructor() {
            super();

            const shadow = this.attachShadow({ mode: 'open' });

            const wrapper = document.createElement('span');
            wrapper.setAttribute('class', 'wrapper');

            const label = document.createElement('label');
            label.textContent = `${this.getAttribute('label')} `;

            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('id', 'imageLoader');
            input.setAttribute('name', 'imageLoader');

            const cmp = this;
            input.addEventListener('change', (e) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        cmp.canvas.width = img.width;
                        cmp.canvas.height = img.height;
                        cmp.ctx.drawImage(img, 0, 0);
                        cmp.image = new MyImage(cmp.ctx.getImageData(0, 0, img.width, img.height));
                        cmp.dispatchEvent(new Event('change'));
                    };
                    img.src = event.target.result;
                    cmp.url = img.src;
                };
                reader.readAsDataURL(e.target.files[0]);
            }, false);

            shadow.appendChild(wrapper);

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            if (this.hasAttribute('showImage')) {
                const div = document.createElement('div');
                div.appendChild(this.canvas);
                wrapper.appendChild(div);
            }

            const inputDiv = document.createElement('div');
            inputDiv.appendChild(label);
            inputDiv.appendChild(input);
            wrapper.appendChild(inputDiv);
        }

        setImage(url) {
            const img = new Image();
            img.onload = () => {
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx.drawImage(img, 0, 0);
                this.image = new MyImage(this.ctx.getImageData(0, 0, img.width, img.height));
                this.dispatchEvent(new Event('change'));
            };
            img.src = url;
        }

        getImage() {
            return this.image;
        }

        getUrl() {
            return this.url;
        }
    }

    class Properties {
        constructor() {
            this._numIterations = 300;
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

    class Transitioner {
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

    class IterativeTransitioner extends Transitioner {
        run(callback) {
            this.input.convertToGrayScale();
            this.output.convertToGrayScale();
            this.current = this.input.clone();
            this._runInner(0, callback);
        }

        /**
         * @param {number} iteration current iteration
         * @param {function} callback the function to call after each iteration
         */
        _runInner(iteration, callback) {
            if (iteration >= this.properties.iterations) {
                return; // Done.
            }

            const temp = this.current.clone();
            this.iterate((x, y) => {
                const pixel = this.getNextPixel(x, y);
                temp.setP(x, y, pixel);
            });

            this.current = temp;

            if (callback) {
                callback(this.current, iteration + 1, this.properties.iterations);
            }

            if (!this.shouldStop) {
                setTimeout(() => {
                    this._runInner(iteration + 1, callback);
                }, 1);
            } else {
                // Stopping now, so reset this
                this.shouldStop = false;
            }
        }

        getNextPixel(x, y) {
            const currentPixel = this.current.get(x, y);
            const desiredPixel = this.output.get(x, y);

            let diff = desiredPixel.minus(currentPixel);
            let nextPixel = currentPixel.add(diff > 0 ? -1 : 1);

            const isBetterOption = (p) => {
                const newDiff = desiredPixel.minus(p);
                return Math.abs(newDiff) <= Math.abs(diff);
            };

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

    const GIFEncoder = require('../node_modules/gifencoder/lib/GIFEncoder.js');

    customElements.define('image-picker', ImagePicker);

    let transitioner;

    let im1Selected = false;
    let im2Selected = false;
    const im1 = document.getElementById('im1');
    const im2 = document.getElementById('im2');

    const currentImageElement = document.getElementById('currentImage');
    const messageElement = document.getElementById('message');
    const iterationsElement = document.getElementById('iterations');
    iterationsElement.setAttribute('placeholder', `Iterations (${new Properties().iterations})`);
    const transitionerSelect = document.getElementById('transitionerSelect');
    const transitionerOptions = [
        { name: 'Iterative', maker: (...args) => new IterativeTransitioner(...args) },
    ];

    let gif;

    transitionerOptions.forEach((option) => {
        const optionEl = document.createElement('option');
        optionEl.textContent = option.name;
        transitionerSelect.appendChild(optionEl);
    });

    const finalize = () => {
        gif.finish();
    };

    const cb = (currentImage, currentIteration, totalIterations) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        ctx.putImageData(currentImage.imageData, 0, 0);
        currentImageElement.src = canvas.toDataURL();

        messageElement.textContent = `Iteration ${currentIteration} out of ${totalIterations}`;

        gif.addFrame(ctx, { copy: true, delay: (1000 / totalIterations) });

        if (currentIteration === totalIterations) {
            finalize();
        }
    };

    const run = () => {
        let properties;
        if (iterationsElement.value) {
            properties = new Properties();
            properties.numIterations(iterationsElement.value);
        }

        const Fn = transitionerOptions[transitionerSelect.selectedIndex].maker;

        transitioner = transitioner
            || Fn(im1.getImage(), im2.getImage(), properties);

        gif = new GIFEncoder(im1.width, im2.height);

        gif.start();
        gif.setRepeat(0); // 0 for repeat, -1 for no-repeat
        gif.setDelay(1000 / properties.iterations); // frame delay in ms
        gif.setQuality(10);

        gif.on('finished', (blob) => {
            window.open(URL.createObjectURL(blob));
        });

        transitioner.run(cb);
    };

    document.getElementById('stop').addEventListener('click', () => {
        if (transitioner) {
            transitioner.stop();
        }
    });

    document.getElementById('go').addEventListener('click', () => {
        run();
    });

    document.getElementById('reset').addEventListener('click', () => {
        if (transitioner) {
            transitioner.stop();
        }

        transitioner = null;
    });

    document.getElementById('sample').addEventListener('click', () => {
        iterationsElement.value = 150;
        im1.setImage('./images/t1.jpg');
        im2.setImage('./images/t2.jpg');
    });

    im1.addEventListener('change', () => {
        im1Selected = true;
        if (im2Selected) {
            run();
        }
    });

    im2.addEventListener('change', () => {
        im2Selected = true;
        if (im1Selected) {
            run();
        }
    });

}());
