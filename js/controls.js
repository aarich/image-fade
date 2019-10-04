/** @module Controls */
export default class Controls extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');


        const titleSpan = document.createElement('span');
        titleSpan.setAttribute('title', 'Or, at least, the illusion of control');
        titleSpan.textContent = 'Controls: ';

        const iterations = document.createElement('input');
        iterations.setAttribute('type', 'number');
        this._iterations = iterations;
        this._defaultIterations = 100;

        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(titleSpan);
        wrapper.appendChild(document.createTextNode(' '));
        wrapper.appendChild(iterations);

        Controls.getAllOptions().forEach((opt) => wrapper.appendChild(this._makeButton(opt)));

        this._selector = document.createElement('select');
        wrapper.appendChild(this._selector);

        wrapper.appendChild(document.createTextNode(' '));
        this._gif = Controls._makeCheckBox('gif', wrapper);
        wrapper.appendChild(document.createTextNode(' '));
        this._webm = Controls._makeCheckBox('webm', wrapper);
        this._webm.checked = true;

        this._message = document.createElement('p');
        wrapper.appendChild(this._message);

        shadow.appendChild(wrapper);
    }

    static _makeCheckBox(val, wrapper) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.setAttribute('id', val);

        const label = document.createElement('Label');
        label.setAttribute('for', `${val} `);
        label.innerHTML = val;
        wrapper.appendChild(cb);
        wrapper.appendChild(label);

        return cb;
    }

    _makeButton(action) {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.addEventListener('click', () => {
            this._sendEvent({ action });
        });
        button.textContent = action;

        return button;
    }

    _sendEvent(params) {
        this.dispatchEvent(new CustomEvent('button', { detail: params }));
    }

    /**
     * @param {array} transitioners
     */
    setTransitioners(transitioners) {
        transitioners.forEach((option) => {
            const optionEl = document.createElement('option');
            optionEl.textContent = option.name;
            this._selector.appendChild(optionEl);
        });
        this._transitioners = transitioners;
    }

    makeTransitioner(image1, image2, properties) {
        return this._transitioners[this._selector.selectedIndex]
            .maker(image1, image2, properties);
    }

    /**
     * @param {number} i the index to select
     */
    set transitioner(i) {
        this._selector.selectedIndex = i;
    }

    /**
     * A message to display below the controls
     * @param {string} m
     */
    set message(m) {
        this._message.textContent = m;
    }

    /**
     * Number of iterations to run
     * @param {number} i
     */
    set iterations(i) {
        this._defaultIterations = i;
        this._iterations.setAttribute('placeholder', `Iterations (${i})`);
    }

    get iterations() {
        return this._iterations.value ? parseInt(this._iterations.value) : this._defaultIterations;
    }

    get gif() {
        return this._gif.checked;
    }

    get webm() {
        return this._webm.checked;
    }

    static getAllOptions() {
        return [Controls.GO, Controls.STOP, Controls.RESET,
            Controls.SAMPLE, Controls.LOWRES, Controls.SWAP];
    }

    static get STOP() {
        return 'Stop';
    }

    static get GO() {
        return 'Go';
    }

    static get RESET() {
        return 'Reset';
    }

    static get SAMPLE() {
        return 'Sample';
    }

    static get SWAP() {
        return 'Swap';
    }

    static get LOWRES() {
        return 'LowRes A* Sample';
    }
}
