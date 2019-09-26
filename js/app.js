import ImagePicker from './imagePicker.js';
import { IterativeTransitioner, Properties } from './transitioners.js';

customElements.define('image-picker', ImagePicker);

let transitioner;
let totalIterations = 150;

let im1Selected = false;
let im2Selected = false;
const im1 = document.getElementById('im1');
const im2 = document.getElementById('im2');

const currentImageElement = document.getElementById('currentImage');
const messageElement = document.getElementById('message');
const gifMessageElement = document.getElementById('gifMessage');
const iterationsElement = document.getElementById('iterations');
iterationsElement.setAttribute('placeholder', `Iterations (${new Properties().iterations})`);
const transitionerSelect = document.getElementById('transitionerSelect');
const transitionerOptions = [
    { name: 'Iterative', maker: (...args) => new IterativeTransitioner(...args) },
];

let gif;

currentImageElement.addEventListener('load', () => {
    gif.addFrame(currentImageElement, { copy: true, delay: 5 });
});

transitionerOptions.forEach((option) => {
    const optionEl = document.createElement('option');
    optionEl.textContent = option.name;
    transitionerSelect.appendChild(optionEl);
});

const finalize = () => {
    gifMessageElement.textContent = 'Rendering Gif Now. Please Wait.';
    gif.render();
};

const cb = (currentImage, currentIteration) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    ctx.putImageData(currentImage.imageData, 0, 0);
    currentImageElement.src = canvas.toDataURL();

    messageElement.textContent = `Iteration ${currentIteration} out of ${totalIterations}`;

    if (currentIteration === totalIterations) {
        finalize();
    }
};

const run = () => {
    gifMessageElement.textContent = '';

    let properties;
    if (iterationsElement.value) {
        totalIterations = parseInt(iterationsElement.value);
        properties = new Properties();
        properties.numIterations(totalIterations);
    }

    const Fn = transitionerOptions[transitionerSelect.selectedIndex].maker;

    transitioner = transitioner
        || Fn(im1.getImage(), im2.getImage(), properties);

    gif = new GIF({
        workers: 8,
        quality: 10,
        width: im1.width,
        height: im2.height,
        workerScript: 'js/gif.worker.js',
    });

    gif.on('finished', (blob) => {
        document.getElementById('outputGif').src = URL.createObjectURL(blob);
        gifMessageElement.textContent = 'Gif rendering complete:';
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
