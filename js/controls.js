export default class Controls extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');


        const titleSpan = document.createElement('span');
        titleSpan.setAttribute('title', 'Or, at least, the illusion of control');
        titleSpan.textContent = 'Controls:';

        const iterations = document.createElement('input');
        iterations.setAttribute('type', 'number');
        this._iterations = iterations;
        this._defaultIterations = 100;

        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(titleSpan);
        wrapper.appendChild(iterations);

        wrapper.appendChild(this._makeButton(Controls.GO));
        wrapper.appendChild(this._makeButton(Controls.STOP));
        wrapper.appendChild(this._makeButton(Controls.RESET));
        wrapper.appendChild(this._makeButton(Controls.SAMPLE));

        this._selector = document.createElement('select');
        wrapper.appendChild(this._selector);

        this._message = document.createElement('p');
        wrapper.appendChild(this._message);

        shadow.appendChild(wrapper);
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
     * @param {string} m
     */
    set message(m) {
        this._message.textContent = m;
    }

    /**
     * @param {number} i
     */
    set iterations(i) {
        this._defaultIterations = i;
        this._iterations.setAttribute('placeholder', `Iterations (${i})`);
    }

    get iterations() {
        return this._iterations.value ? parseInt(this._iterations.value) : this._defaultIterations;
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
}
