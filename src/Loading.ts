import Context from './Context';
export default class Tooltip {
    private ctx: Context;
    private loadingEl: HTMLDivElement;
    private textEl: HTMLParagraphElement = document.createElement('p');
    constructor(ctx: Context) {
        this.ctx = ctx;

        if (this.ctx.loadingElement) {
            this.loadingEl = this.ctx.loadingElement;
        } else {
            this.loadingEl = document.createElement('div');
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'e-virt-table-loading-spinner';
            const loadingSvg = this.ctx.icons.getSvg('loading');
            if (loadingSvg) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(loadingSvg.svg, 'image/svg+xml');
                const svgEl = doc.documentElement;
                loadingSpinner.appendChild(svgEl);
            }
            this.textEl.className = 'e-virt-table-loading-text';
            this.textEl.innerText = this.getText();
            loadingSpinner.appendChild(this.textEl);
            this.loadingEl.appendChild(loadingSpinner);
        }
        this.loadingEl.className = 'e-virt-table-loading';
        this.loadingEl.style.display = 'none';
        this.ctx.containerElement.appendChild(this.loadingEl);
    }
    private getText() {
        return this.ctx.config.LOADING_TEXT || this.ctx.locale.getText('loadingText');
    }
    show() {
        this.loadingEl.style.display = 'flex';
    }
    hide() {
        this.loadingEl.style.display = 'none';
    }
    draw() {
        if (this.ctx.loadingElement) {
            return;
        }
        this.textEl.innerText = this.getText();
    }
    destroy() {
        this.loadingEl.remove();
    }
}
