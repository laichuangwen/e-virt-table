import Context from './Context';
import { html, render } from 'lit-html';
import { toStyleStr } from './util';

export default class Empty {
    private ctx: Context;
    private emptyEl: HTMLDivElement;
    private visible = false;
    private top = '0px';

    constructor(ctx: Context) {
        this.ctx = ctx;
        if (this.ctx.emptyElement) {
            this.emptyEl = this.ctx.emptyElement;
        } else {
            this.emptyEl = document.createElement('div');
            this.ctx.containerElement.appendChild(this.emptyEl);
        }
        this.emptyEl.className = 'e-virt-table-empty';
        this.ctx.on('emptyChange', ({ type, headerHeight, bodyHeight, footerHeight }) => {
            const top = headerHeight + (bodyHeight + footerHeight) / 2;
            this.visible = type === 'empty';
            this.top = this.ctx.toVisualPx(top);
            this.renderEmpty();
        });
        this.renderEmpty();
    }

    private getText() {
        return this.ctx.config.EMPTY_TEXT || this.ctx.locale.getText('emptyText');
    }

    private renderEmpty() {
        if (this.ctx.emptyElement) {
            return;
        }
        const { EMPTY_CUSTOM_STYLE } = this.ctx.config;
        const style = toStyleStr({
            display: this.visible ? 'block' : 'none',
            top: this.top,
            ...(EMPTY_CUSTOM_STYLE as Record<string, string | number>),
        });
        render(
            html`<div style="${style}">
                ${this.getText()}
            </div>`,
            this.emptyEl,
        );
    }

    draw() {
        this.renderEmpty();
    }

    destroy() {
        this.emptyEl.remove();
    }
}
