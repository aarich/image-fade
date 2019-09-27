import MyImage from './image.js';

export default class ImagePicker extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'wrapper');
        wrapper.style.display = 'inline-block';

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
        };
        img.src = url;
    }

    getImage() {
        return this.image;
    }

    getUrl() {
        return this.url;
    }

    get selected() {
        return this.image != null;
    }
}
