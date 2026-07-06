import Context from './Context';
import { html, render } from 'lit-html';

export default class Loading {
    private ctx: Context;
    private loadingEl: HTMLDivElement;

    constructor(ctx: Context) {
        this.ctx = ctx;

        if (this.ctx.loadingElement) {
            this.loadingEl = this.ctx.loadingElement;
        } else {
            this.loadingEl = document.createElement('div');
            this.ctx.containerElement.appendChild(this.loadingEl);
        }
        this.loadingEl.className = 'e-virt-table-loading';
        this.loadingEl.style.display = 'none';
        this.renderLoading();
    }

    private getText() {
        return this.ctx.config.LOADING_TEXT || this.ctx.locale.getText('loadingText');
    }

    private getLoadingSvg() {
        const loadingSvg = this.ctx.icons.getSvg('loading');
        return loadingSvg?.svg || '';
    }

    private renderLoading() {
        if (this.ctx.loadingElement) {
            return;
        }
        render(
            html`<div class="e-virt-table-loading-spinner">
                <span class="e-virt-table-loading-icon"></span>
                <p class="e-virt-table-loading-text">${this.getText()}</p>
            </div>`,
            this.loadingEl,
        );
        const spinnerEl = this.loadingEl.querySelector('.e-virt-table-loading-icon') as HTMLSpanElement;
        if (spinnerEl) {
            spinnerEl.innerHTML = this.getLoadingSvg();
        }
    }

    show() {
        this.loadingEl.style.display = 'flex';
    }

    hide() {
        this.loadingEl.style.display = 'none';
    }

    draw() {
        this.renderLoading();
    }

    destroy() {
        this.loadingEl.remove();
    }
}
