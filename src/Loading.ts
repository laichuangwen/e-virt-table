import Context from './Context';
export default class Tooltip {
    private ctx: Context;
    private loadingEl: HTMLDivElement;
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
            const loadingText = document.createElement('p');
            loadingText.className = 'e-virt-table-loading-text';
            loadingText.innerText = this.ctx.config.LOADING_TEXT;
            loadingSpinner.appendChild(loadingText);
            this.loadingEl.appendChild(loadingSpinner);
        }
        this.loadingEl.className = 'e-virt-table-loading';
        this.loadingEl.style.display = 'none';
        this.ctx.containerElement.appendChild(this.loadingEl);
    }
    show() {
        this.loadingEl.style.display = 'flex';
    }
    hide() {
        this.loadingEl.style.display = 'none';
    }
    destroy() {
        this.loadingEl.remove();
    }
}
