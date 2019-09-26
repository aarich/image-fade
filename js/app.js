import ImagePicker from './imagePicker.js';
import { IterativeTransitioner, Properties } from './transitioners.js';

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
