import Cell from './Cell';
import Context from './Context';
import { computePosition, offset, arrow, flip, shift } from '@floating-ui/dom';
export default class Tooltip {
    private ctx: Context;
    private enable = false;
    private contentEl: HTMLDivElement;
    private floatingEl: HTMLDivElement;
    private arrowEl: HTMLDivElement;
    constructor(ctx: Context) {
        this.ctx = ctx;
        const { TOOLTIP_BG_COLOR, TOOLTIP_TEXT_COLOR, TOOLTIP_ZINDEX, TOOLTIP_CUSTOM_STYLE, CSS_PREFIX } =
            this.ctx.config;
        this.contentEl = document.createElement('div');
        this.arrowEl = document.createElement('div');
        this.floatingEl = document.createElement('div');
        this.floatingEl.className = `${CSS_PREFIX}-tooltip`;
        this.contentEl.className = `${CSS_PREFIX}-tooltip-content`;
        this.arrowEl.className = `${CSS_PREFIX}-tooltip-arrow`;
        const floatingStyle = {
            display: 'none',
            position: 'absolute',
            background: TOOLTIP_BG_COLOR,
            color: TOOLTIP_TEXT_COLOR,
            boxSizing: 'border-box',
            zIndex: TOOLTIP_ZINDEX,
            padding: '8px',
            borderRadius: `4px`,
            fontSize: `12px`,
            ...TOOLTIP_CUSTOM_STYLE,
        };
        const arrowStyle = {
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: floatingStyle.background,
            backgroundColor: floatingStyle.backgroundColor,
            transform: 'rotate(45deg)',
            zIndex: floatingStyle.zIndex,
        };
        Object.assign(this.arrowEl.style, arrowStyle);
        Object.assign(this.floatingEl.style, floatingStyle);
        this.floatingEl.appendChild(this.contentEl);
        this.floatingEl.appendChild(this.arrowEl);
        this.ctx.containerElement.appendChild(this.floatingEl);
        this.init();
    }
    private init() {
        this.ctx.on('mousemove', (e) => {
            // 鼠标移动时，判断是否在target上，不在则隐藏
            if (!this.ctx.isTarget(e)) {
              return;
            }
            const targetRect = this.ctx.containerElement.getBoundingClientRect();
            if (!targetRect) {
                return;
            }
            if (
                e.clientX < targetRect.x ||
                e.clientX > targetRect.x + targetRect.width ||
                e.clientY < targetRect.y ||
                e.clientY > targetRect.y + targetRect.height
            ) {
                this.hide();
            }
        });
        // 开始编辑时隐藏
        this.ctx.on('startEdit', () => {
            this.hide();
        });
        this.ctx.on('visibleCellHoverChange', (cell,e) => {
            const contains = this.floatingEl.contains(e.target);;
            if (contains) {
                return;
            }
            // 有移除或者有错误message时显示
            if (cell.ellipsis || cell.message) {
                this.show(cell);
            }
        });
        this.ctx.on('visibleCellMouseleave', (_,e) => {
            const contains = this.floatingEl.contains(e.target);;
            if (contains) {
                return;
            }
            this.hide();
        });
    }
    private show(cell: Cell) {
        // 如果没有设置overflowTooltipShow=true，则不显示
        if (!cell.overflowTooltipShow) {
            return;
        }
        // 如果是鼠标按下状态，则不显示
        if (this.ctx.mousedown) {
            return;
        }
        this.floatingEl.style.display = 'block';
        let text = cell.getText();
        // 如果有message，则显示message
        if (cell.message) {
            text = cell.message;
        }
        const targetRect = this.ctx.containerElement.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        this.enable = true;
        // 设置最大宽度
        this.contentEl.style.maxWidth = `${cell.overflowTooltipMaxWidth || 500}px`;
        this.contentEl.style.minWidth = '100px';
        this.contentEl.style.width = '100%';
        this.contentEl.style.display = 'inline-block';
        this.contentEl.style.wordBreak = 'break-all';
        this.contentEl.style.lineHeight = '1.5';
        this.contentEl.innerText = text;
        const cellX = cell.drawX + targetRect.x;
        const cellY = cell.drawY + targetRect.y;
        // 这个是相对于视口的位置
        const virtualEl = {
            getBoundingClientRect() {
                return {
                    width: cell.visibleWidth,
                    height: cell.visibleHeight,
                    x: cellX,
                    y: cellY,
                    left: cellX,
                    right: cellX + cell.visibleWidth,
                    top: cellY,
                    bottom: cellY + cell.visibleHeight,
                };
            },
        };

        computePosition(virtualEl, this.floatingEl, {
            placement: cell.overflowTooltipPlacement,
            middleware: [shift(), flip(), offset(6), arrow({ element: this.arrowEl })],
        }).then((val) => {
            const { x, y, placement, middlewareData } = val;
            Object.assign(this.floatingEl.style, {
                top: `${y}px`,
                left: `${x}px`,
            });
            if (middlewareData.arrow) {
                const arrow = middlewareData.arrow;
                if (['left', 'left-start', 'left-end'].includes(placement)) {
                    Object.assign(this.arrowEl.style, {
                        top: `${arrow.y}px`,
                        bottom: '',
                        left: '',
                        right: `-5px`,
                    });
                } else if (['right', 'right-start', 'right-end'].includes(placement)) {
                    Object.assign(this.arrowEl.style, {
                        top: `${arrow.y}px`,
                        bottom: '',
                        left: `-5px`,
                        right: '',
                    });
                } else if (['bottom', 'bottom-start', 'bottom-end'].includes(placement)) {
                    Object.assign(this.arrowEl.style, {
                        top: `-5px`,
                        bottom: '',
                        left: `${arrow.x}px`,
                        right: '',
                    });
                } else if (['top', 'top-start', 'top-end'].includes(placement)) {
                    Object.assign(this.arrowEl.style, {
                        top: '',
                        bottom: `-5px`,
                        left: `${arrow.x}px`,
                        right: '',
                    });
                }
            }
        });
    }
    private hide() {
        if (!this.enable) {
            return;
        }
        this.enable = false;
        this.floatingEl.style.display = 'none';
    }
    destroy() {
        this.contentEl.remove();
        this.arrowEl.remove();
        this.floatingEl.remove();
    }
}
