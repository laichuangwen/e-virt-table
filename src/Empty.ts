import Context from './Context';
export default class Tooltip {
    private ctx: Context;
    private emptyEl: HTMLDivElement;
    constructor(ctx: Context) {
        this.ctx = ctx;
        const { EMPTY_CUSTOM_STYLE } = this.ctx.config;
        if (this.ctx.emptyElement) {
            this.emptyEl = this.ctx.emptyElement;
        } else {
            this.emptyEl = document.createElement('div');
            this.emptyEl.innerText = this.getText();
        }
        this.emptyEl.className = 'e-virt-table-empty';
        this.emptyEl.style.display = 'none';
        this.ctx.containerElement.appendChild(this.emptyEl);
        this.ctx.on('emptyChange', ({ type, headerHeight, bodyHeight, footerHeight }) => {
            const top = headerHeight + (bodyHeight + footerHeight) / 2;
            const contentStyle = {
                display: type === 'empty' ? 'block' : 'none',
                top: `${top}px`,
                ...EMPTY_CUSTOM_STYLE,
            };
            Object.assign(this.emptyEl.style, contentStyle);
        });
    }
    private getText() {
        return this.ctx.config.EMPTY_TEXT || this.ctx.locale.getText('emptyText');
    }
    draw() {
        if (this.ctx.emptyElement) {
            return;
        }
        this.emptyEl.innerText = this.getText();
    }
    destroy() {
        this.emptyEl.remove();
    }
}
