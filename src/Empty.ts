import Context from './Context';
export default class Tooltip {
    private ctx: Context;
    private emptyEl: HTMLDivElement;
    constructor(ctx: Context) {
        this.ctx = ctx;
        const { EMPTY_TEXT, EMPTY_CUSTOM, EMPTY_CUSTOM_STYLE, CSS_PREFIX } = this.ctx.config;
        this.emptyEl = document.createElement('div');
        this.emptyEl.className = `${CSS_PREFIX}-empty`;
        this.emptyEl.style.display = 'none';
        this.emptyEl.innerText = EMPTY_TEXT;
        this.ctx.containerElement.appendChild(this.emptyEl);
        this.ctx.on('emptyChange', ({ type, headerHeight, bodyHeight, footerHeight }) => {
            // 如果开启了自定义内容，则不显示默认内容
            if (EMPTY_CUSTOM) {
                return;
            }
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
