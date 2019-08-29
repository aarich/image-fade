import { MyImage } from './image.js';

export class ImagePicker extends HTMLElement {

    constructor() {
        super();

        const shadow = this.attachShadow({mode: 'open'});

        const wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'wrapper');

        const label = document.createElement('label');
        label.textContent = this.getAttribute('label');

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('id', 'imageLoader');
        input.setAttribute('name', 'imageLoader');

        let cmp = this;
        input.addEventListener('change', e => {
            let reader = new FileReader();
            reader.onload = (event) => {
                let img = new Image();
                img.onload = () => {
                    cmp.canvas.width = img.width;
                    cmp.canvas.height = img.height;
                    cmp.ctx.drawImage(img,0,0);
                    cmp.image = new MyImage(cmp.ctx.getImageData(0, 0, img.width, img.height));
                    cmp.dispatchEvent(new Event('change'));
                }
                img.src = event.target.result;
                cmp.url = img.src;
            }
            reader.readAsDataURL(e.target.files[0]);
        }, false);

        shadow.appendChild(wrapper);
        wrapper.appendChild(label);
        wrapper.appendChild(input);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        if (this.hasAttribute('showImage')) {
            wrapper.appendChild(this.canvas);
        }   
    }

    getImage() {
        return this.image;
    }

    getUrl() {
        return this.url;
    }
}