import ImagePicker from './imagePicker.js';
import { UseOrLoseTransitioner } from './transitioners.js';

customElements.define('image-picker', ImagePicker);

let im1Selected = false;
let im2Selected = false;
const im1 = document.getElementById('im1');
const im2 = document.getElementById('im2');

const run = () => {
    const transitioner = new UseOrLoseTransitioner(im1.getImage(), im2.getImage());
    transitioner.run();
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
