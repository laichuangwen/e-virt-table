import Context from './Context';
export default class Tooltip {
    private ctx: Context;
    private emptyEl: HTMLDivElement;
    constructor(ctx: Context) {
        this.ctx = ctx;
        const { EMPTY_TEXT, EMPTY_CUSTOM_STYLE } = this.ctx.config;
        if (this.ctx.emptyElement) {
            this.emptyEl = this.ctx.emptyElement;
        } else {
            this.emptyEl = document.createElement('div');
            this.emptyEl.innerText = EMPTY_TEXT;
        }
        this.emptyEl.className = 'e-virt-table-empty';
        this.emptyEl.style.display = 'none';
        this.ctx.containerElement.appendChild(this.emptyEl);
        this.ctx.on('emptyChange', ({ type, headerHeight, bodyHeight, footerHeight }) => {
            const top = headerHeight + (bodyHeight + footerHeight) / 2;
            const contentStyle = {
                display: type === 'empty' ? 'block' : 'none',
                position: 'absolute',
                fontSize: '14px',
                color: '#666',
                left: '50%',
                top: `${top}px`,
                transform: 'translate(-50%, -50%)',
                ...EMPTY_CUSTOM_STYLE,
            };
            Object.assign(this.emptyEl.style, contentStyle);
        });
    }
    destroy() {
        this.emptyEl.remove();
    }
}
