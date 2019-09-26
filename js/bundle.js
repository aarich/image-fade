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

    /*
      GIFEncoder.js

      Authors
      Kevin Weiner (original Java version - kweiner@fmsware.com)
      Thibault Imbert (AS3 version - bytearray.org)
      Johan Nordberg (JS version - code@johan-nordberg.com)
      Eugene Ware (node.js streaming version - eugene@noblesmaurai.com)
    */

    var stream = require('stream');
    var NeuQuant = require('./TypedNeuQuant.js');
    var LZWEncoder = require('./LZWEncoder.js');

    function ByteArray() {
      this.data = [];
    }

    ByteArray.prototype.getData = function() {
      return new Buffer.from(this.data);
    };

    ByteArray.prototype.writeByte = function(val) {
      this.data.push(val);
    };

    ByteArray.prototype.writeUTFBytes = function(string) {
      for (var l = string.length, i = 0; i < l; i++)
        this.writeByte(string.charCodeAt(i));
    };

    ByteArray.prototype.writeBytes = function(array, offset, length) {
      for (var l = length || array.length, i = offset || 0; i < l; i++)
        this.writeByte(array[i]);
    };

    function GIFEncoder(width, height) {
      // image size
      this.width = ~~width;
      this.height = ~~height;

      // transparent color if given
      this.transparent = null;

      // transparent index in color table
      this.transIndex = 0;

      // -1 = no repeat, 0 = forever. anything else is repeat count
      this.repeat = -1;

      // frame delay (hundredths)
      this.delay = 0;

      this.image = null; // current frame
      this.pixels = null; // BGR byte array from frame
      this.indexedPixels = null; // converted frame indexed to palette
      this.colorDepth = null; // number of bit planes
      this.colorTab = null; // RGB palette
      this.usedEntry = new Array(); // active palette entries
      this.palSize = 7; // color table size (bits-1)
      this.dispose = -1; // disposal code (-1 = use default)
      this.firstFrame = true;
      this.sample = 10; // default sample interval for quantizer

      this.started = false; // started encoding

      this.readStreams = [];

      this.out = new ByteArray();
    }

    GIFEncoder.prototype.createReadStream = function (rs) {
      if (!rs) {
        rs = new stream.Readable();
        rs._read = function () {};
      }
      this.readStreams.push(rs);
      return rs;
    };

    GIFEncoder.prototype.createWriteStream = function (options) {
      var self = this;
      if (options) {
        Object.keys(options).forEach(function (option) {
          var fn = 'set' + option[0].toUpperCase() + option.substr(1);
          if (~['setDelay', 'setFrameRate', 'setDispose', 'setRepeat',
               'setTransparent', 'setQuality'].indexOf(fn)) {
            self[fn].call(self, options[option]);
          }
        });
      }

      var ws = new stream.Duplex({ objectMode: true });
      ws._read = function () {};
      this.createReadStream(ws);

      var self = this;
      ws._write = function (data, enc, next) {
        if (!self.started) self.start();
        self.addFrame(data);
        next();
      };
      var end = ws.end;
      ws.end = function () {
        end.apply(ws, [].slice.call(arguments));
        self.finish();
      };
      return ws;
    };

    GIFEncoder.prototype.emit = function() {
      var self = this;
      if (this.readStreams.length === 0) return;
      if (this.out.data.length) {
        this.readStreams.forEach(function (rs) {
          rs.push(Buffer.from(self.out.data));
        });
        this.out.data = [];
      }
    };

    GIFEncoder.prototype.end = function() {
      if (this.readStreams.length === null) return;
      this.emit();
      this.readStreams.forEach(function (rs) {
        rs.push(null);
      });
      this.readStreams = [];
    };

    /*
      Sets the delay time between each frame, or changes it for subsequent frames
      (applies to the next frame added)
    */
    GIFEncoder.prototype.setDelay = function(milliseconds) {
      this.delay = Math.round(milliseconds / 10);
    };

    /*
      Sets frame rate in frames per second.
    */
    GIFEncoder.prototype.setFrameRate = function(fps) {
      this.delay = Math.round(100 / fps);
    };

    /*
      Sets the GIF frame disposal code for the last added frame and any
      subsequent frames.

      Default is 0 if no transparent color has been set, otherwise 2.
    */
    GIFEncoder.prototype.setDispose = function(disposalCode) {
      if (disposalCode >= 0) this.dispose = disposalCode;
    };

    /*
      Sets the number of times the set of GIF frames should be played.

      -1 = play once
      0 = repeat indefinitely

      Default is -1

      Must be invoked before the first image is added
    */

    GIFEncoder.prototype.setRepeat = function(repeat) {
      this.repeat = repeat;
    };

    /*
      Sets the transparent color for the last added frame and any subsequent
      frames. Since all colors are subject to modification in the quantization
      process, the color in the final palette for each frame closest to the given
      color becomes the transparent color for that frame. May be set to null to
      indicate no transparent color.
    */
    GIFEncoder.prototype.setTransparent = function(color) {
      this.transparent = color;
    };

    /*
      Adds next GIF frame. The frame is not written immediately, but is
      actually deferred until the next frame is received so that timing
      data can be inserted.  Invoking finish() flushes all frames.
    */
    GIFEncoder.prototype.addFrame = function(imageData) {
      // HTML Canvas 2D Context Passed In
      if (imageData && imageData.getImageData) {
        this.image = imageData.getImageData(0, 0, this.width, this.height).data;
      } else {
        this.image = imageData;
      }

      this.getImagePixels(); // convert to correct format if necessary
      this.analyzePixels(); // build color table & map pixels

      if (this.firstFrame) {
        this.writeLSD(); // logical screen descriptior
        this.writePalette(); // global color table
        if (this.repeat >= 0) {
          // use NS app extension to indicate reps
          this.writeNetscapeExt();
        }
      }

      this.writeGraphicCtrlExt(); // write graphic control extension
      this.writeImageDesc(); // image descriptor
      if (!this.firstFrame) this.writePalette(); // local color table
      this.writePixels(); // encode and write pixel data

      this.firstFrame = false;
      this.emit();
    };

    /*
      Adds final trailer to the GIF stream, if you don't call the finish method
      the GIF stream will not be valid.
    */
    GIFEncoder.prototype.finish = function() {
      this.out.writeByte(0x3b); // gif trailer
      this.end();
    };

    /*
      Sets quality of color quantization (conversion of images to the maximum 256
      colors allowed by the GIF specification). Lower values (minimum = 1)
      produce better colors, but slow processing significantly. 10 is the
      default, and produces good color mapping at reasonable speeds. Values
      greater than 20 do not yield significant improvements in speed.
    */
    GIFEncoder.prototype.setQuality = function(quality) {
      if (quality < 1) quality = 1;
      this.sample = quality;
    };

    /*
      Writes GIF file header
    */
    GIFEncoder.prototype.start = function() {
      this.out.writeUTFBytes("GIF89a");
      this.started = true;
      this.emit();
    };

    /*
      Analyzes current frame colors and creates color map.
    */
    GIFEncoder.prototype.analyzePixels = function() {
      var len = this.pixels.length;
      var nPix = len / 3;

      this.indexedPixels = new Uint8Array(nPix);

      var imgq = new NeuQuant(this.pixels, this.sample);
      imgq.buildColormap(); // create reduced palette
      this.colorTab = imgq.getColormap();

      // map image pixels to new palette
      var k = 0;
      for (var j = 0; j < nPix; j++) {
        var index = imgq.lookupRGB(
          this.pixels[k++] & 0xff,
          this.pixels[k++] & 0xff,
          this.pixels[k++] & 0xff
        );
        this.usedEntry[index] = true;
        this.indexedPixels[j] = index;
      }

      this.pixels = null;
      this.colorDepth = 8;
      this.palSize = 7;

      // get closest match to transparent color if specified
      if (this.transparent !== null) {
        this.transIndex = this.findClosest(this.transparent);

        // ensure that pixels with full transparency in the RGBA image are using the selected transparent color index in the indexed image.
        for (var pixelIndex = 0; pixelIndex < nPix; pixelIndex++) {
          if (this.image[pixelIndex * 4 + 3] == 0) {
            this.indexedPixels[pixelIndex] = this.transIndex;
          }
        }
      }
    };

    /*
      Returns index of palette color closest to c
    */
    GIFEncoder.prototype.findClosest = function(c) {
      if (this.colorTab === null) return -1;

      var r = (c & 0xFF0000) >> 16;
      var g = (c & 0x00FF00) >> 8;
      var b = (c & 0x0000FF);
      var minpos = 0;
      var dmin = 256 * 256 * 256;
      var len = this.colorTab.length;

      for (var i = 0; i < len;) {
        var index = i / 3;
        var dr = r - (this.colorTab[i++] & 0xff);
        var dg = g - (this.colorTab[i++] & 0xff);
        var db = b - (this.colorTab[i++] & 0xff);
        var d = dr * dr + dg * dg + db * db;
        if (this.usedEntry[index] && (d < dmin)) {
          dmin = d;
          minpos = index;
        }
      }

      return minpos;
    };

    /*
      Extracts image pixels into byte array pixels
      (removes alphachannel from canvas imagedata)
    */
    GIFEncoder.prototype.getImagePixels = function() {
      var w = this.width;
      var h = this.height;
      this.pixels = new Uint8Array(w * h * 3);

      var data = this.image;
      var count = 0;

      for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
          var b = (i * w * 4) + j * 4;
          this.pixels[count++] = data[b];
          this.pixels[count++] = data[b+1];
          this.pixels[count++] = data[b+2];
        }
      }
    };

    /*
      Writes Graphic Control Extension
    */
    GIFEncoder.prototype.writeGraphicCtrlExt = function() {
      this.out.writeByte(0x21); // extension introducer
      this.out.writeByte(0xf9); // GCE label
      this.out.writeByte(4); // data block size

      var transp, disp;
      if (this.transparent === null) {
        transp = 0;
        disp = 0; // dispose = no action
      } else {
        transp = 1;
        disp = 2; // force clear if using transparent color
      }

      if (this.dispose >= 0) {
        disp = this.dispose & 7; // user override
      }
      disp <<= 2;

      // packed fields
      this.out.writeByte(
        0 | // 1:3 reserved
        disp | // 4:6 disposal
        0 | // 7 user input - 0 = none
        transp // 8 transparency flag
      );

      this.writeShort(this.delay); // delay x 1/100 sec
      this.out.writeByte(this.transIndex); // transparent color index
      this.out.writeByte(0); // block terminator
    };

    /*
      Writes Image Descriptor
    */
    GIFEncoder.prototype.writeImageDesc = function() {
      this.out.writeByte(0x2c); // image separator
      this.writeShort(0); // image position x,y = 0,0
      this.writeShort(0);
      this.writeShort(this.width); // image size
      this.writeShort(this.height);

      // packed fields
      if (this.firstFrame) {
        // no LCT - GCT is used for first (or only) frame
        this.out.writeByte(0);
      } else {
        // specify normal LCT
        this.out.writeByte(
          0x80 | // 1 local color table 1=yes
          0 | // 2 interlace - 0=no
          0 | // 3 sorted - 0=no
          0 | // 4-5 reserved
          this.palSize // 6-8 size of color table
        );
      }
    };

    /*
      Writes Logical Screen Descriptor
    */
    GIFEncoder.prototype.writeLSD = function() {
      // logical screen size
      this.writeShort(this.width);
      this.writeShort(this.height);

      // packed fields
      this.out.writeByte(
        0x80 | // 1 : global color table flag = 1 (gct used)
        0x70 | // 2-4 : color resolution = 7
        0x00 | // 5 : gct sort flag = 0
        this.palSize // 6-8 : gct size
      );

      this.out.writeByte(0); // background color index
      this.out.writeByte(0); // pixel aspect ratio - assume 1:1
    };

    /*
      Writes Netscape application extension to define repeat count.
    */
    GIFEncoder.prototype.writeNetscapeExt = function() {
      this.out.writeByte(0x21); // extension introducer
      this.out.writeByte(0xff); // app extension label
      this.out.writeByte(11); // block size
      this.out.writeUTFBytes('NETSCAPE2.0'); // app id + auth code
      this.out.writeByte(3); // sub-block size
      this.out.writeByte(1); // loop sub-block id
      this.writeShort(this.repeat); // loop count (extra iterations, 0=repeat forever)
      this.out.writeByte(0); // block terminator
    };

    /*
      Writes color table
    */
    GIFEncoder.prototype.writePalette = function() {
      this.out.writeBytes(this.colorTab);
      var n = (3 * 256) - this.colorTab.length;
      for (var i = 0; i < n; i++)
        this.out.writeByte(0);
    };

    GIFEncoder.prototype.writeShort = function(pValue) {
      this.out.writeByte(pValue & 0xFF);
      this.out.writeByte((pValue >> 8) & 0xFF);
    };

    /*
      Encodes and writes pixel data
    */
    GIFEncoder.prototype.writePixels = function() {
      var enc = new LZWEncoder(this.width, this.height, this.indexedPixels, this.colorDepth);
      enc.encode(this.out);
    };

    module.exports = GIFEncoder;

    var GIFEncoder$1 = /*#__PURE__*/Object.freeze({

    });

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

        gif = new GIFEncoder$1(im1.width, im2.height);

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
