import ImagePicker from './imagePicker.js';
import Controls from './controls.js';
import { Properties, IterativeTransitioner, AStarTransitioner } from './transitioners.js';

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
    { name: 'A*', maker: (...args) => new AStarTransitioner(...args) },
]);

let gif;
let webm;
const hideProcessingImage = () => {
    currentImageElement.style.display = 'none';
};

const gifCallBack = (blob) => {
    document.getElementById('outputGif').src = URL.createObjectURL(blob);
    controls.message = 'Gif rendering complete.';
    hideProcessingImage();
};
const webmCallBack = (blob) => {
    controls.message = 'WebM rendering complete.';
    const url = (window.webkitURL || window.URL).createObjectURL(blob);
    const webmEl = document.getElementById('webm');
    webmEl.src = url;
    webmEl.style.display = '';
    webmEl.width = im1.image.width;
    webmEl.height = im1.image.height;
    hideProcessingImage();
};

currentImageElement.addEventListener('load', () => {
    if (gif) {
        gif.addFrame(currentImageElement, { copy: true, delay: 5 });
    }
});

const finalize = () => {
    if (gif) {
        gif.render();
    }
    if (webm) {
        webm.compile(false, webmCallBack);
    }

    if (!gif && !webm) {
        controls.message = 'Select gif and/or webm to save the fade or watch again';
    } else {
        controls.message = 'Rendering Gif and/or WebM Now. Please Wait.';
    }
};

const cb = (currentImage, currentIteration) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    ctx.putImageData(currentImage.imageData, 0, 0);
    currentImageElement.src = canvas.toDataURL();

    if (webm) {
        webm.add(ctx, parseInt(3000 / controls.iterations));
    }

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
        || controls.makeTransitioner(im1.image, im2.image, properties);

    if (controls.gif) {
        // eslint-disable-next-line no-undef
        gif = new GIF({
            workers: 6,
            quality: 10,
            workerScript: 'js/vendor/gif.worker.js',
        });
        gif.on('finished', gifCallBack);
    } else {
        gif = null;
    }

    // eslint-disable-next-line no-undef
    webm = controls.webm ? new Whammy.Video() : null;

    currentImageElement.style.display = '';

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
