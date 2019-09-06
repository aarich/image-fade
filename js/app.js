import ImagePicker from './imagePicker.js';
import { IterativeTransitioner } from './transitioners.js';

customElements.define('image-picker', ImagePicker);

let im1Selected = false;
let im2Selected = false;
const im1 = document.getElementById('im1');
const im2 = document.getElementById('im2');

const currentImageElement = document.getElementById('currentImage');
const messageElement = document.getElementById('message');

const cb = (currentImage, currentIteration, totalIterations) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    ctx.putImageData(currentImage.imageData, 0, 0);
    currentImageElement.src = canvas.toDataURL();

    messageElement.textContent = `Iteration ${currentIteration} out of ${totalIterations}`;
};

const run = () => {
    const transitioner = new IterativeTransitioner(im1.getImage(), im2.getImage());
    transitioner.run(cb);
};

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
