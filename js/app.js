import ImagePicker from './imagePicker.js';
import Controls from './controls.js';
import { IterativeTransitioner, Properties } from './transitioners.js';

customElements.define('image-picker', ImagePicker);
customElements.define('fade-controls', Controls);

let transitioner;

let im1Selected = false;
let im2Selected = false;
const im1 = document.getElementById('im1');
const im2 = document.getElementById('im2');

const currentImageElement = document.getElementById('currentImage');
const gifMessageElement = document.getElementById('gifMessage');

const controls = document.getElementById('controls');
controls.iterations = new Properties().iterations;
controls.setTransitioners([
    { name: 'Iterative', maker: (...args) => new IterativeTransitioner(...args) },
]);

let gif;

currentImageElement.addEventListener('load', () => {
    gif.addFrame(currentImageElement, { copy: true, delay: 5 });
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

    controls.message = `Iteration ${currentIteration} out of ${controls.iterations}`;

    if (currentIteration === controls.iterations) {
        finalize();
    }
};

const run = () => {
    gifMessageElement.textContent = '';

    if (!im1Selected || !im2Selected) {
        // eslint-disable-next-line no-alert
        alert('Both images must be selected!');
        return;
    }

    const properties = new Properties();
    properties.numIterations(controls.iterations);

    transitioner = transitioner
        || controls.makeTransitioner(im1.getImage(), im2.getImage(), properties);

    // eslint-disable-next-line no-undef
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

controls.addEventListener('button', (e) => {
    switch (e.detail.action) {
    case Controls.STOP:
        if (transitioner) {
            transitioner.stop();
        }
        return;
    case Controls.GO:
        run();
        return;
    case Controls.RESET:
        if (transitioner) {
            transitioner.stop();
        }
        transitioner = null;
        return;
    case Controls.SAMPLE:
        controls.iterations = 125;
        im1.setImage('./images/t1.jpg');
        im2.setImage('./images/t2.jpg');
        im1Selected = true;
        im2Selected = true;
        return;
    default:
        // eslint-disable-next-line no-alert
        alert(`Unknown action: ${e.detail.action}`);
        break;
    }
});

im1.addEventListener('change', () => {
    im1Selected = true;
});

im2.addEventListener('change', () => {
    im2Selected = true;
});
