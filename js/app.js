import ImagePicker from './imagePicker.js';
import Controls from './controls.js';
import { IterativeTransitioner, Properties } from './transitioners.js';

customElements.define('image-picker', ImagePicker);
customElements.define('fade-controls', Controls);

let transitioner;

const im1 = document.getElementById('im1');
const im2 = document.getElementById('im2');

const currentImageElement = document.getElementById('currentImage');

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
    controls.message = 'Rendering Gif Now. Please Wait.';
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
    controls.message = '';

    if (!im1.selected || !im2.selected) {
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
        controls.message = 'Gif rendering complete. See Below.';
    });

    transitioner.run(cb);
};

const getTwoRand = (max) => {
    const n1 = Math.ceil(Math.random() * Math.floor(max));
    let n2 = n1;
    while (n1 === n2) {
        n2 = Math.ceil(Math.random() * Math.floor(max));
    }
    return { n1, n2 };
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
        case Controls.SAMPLE: {
            controls.iterations = 125;
            const { n1, n2 } = getTwoRand(9);
            im1.setImage(`./images/t${n1}.jpg`);
            im2.setImage(`./images/t${n2}.jpg`);
            return;
        } case Controls.SWAP: {
            const n1 = im1.url;
            im1.setImage(im2.url);
            im2.setImage(n1);
            return;
        } default:
            // eslint-disable-next-line no-alert
            alert(`Unknown action: ${e.detail.action}`);
            break;
    }
});
