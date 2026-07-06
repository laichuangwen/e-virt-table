import Cell from './Cell';
import Context from './Context';
import { computePosition, offset, arrow, flip, shift } from '@floating-ui/dom';
import { html, render } from 'lit-html';
import { toStyleStr } from './util';

export default class Tooltip {
    private ctx: Context;
    private enable = false;
    private floatingEl: HTMLDivElement;
    private contentText = '';
    private contentStyle: Record<string, string> = {};
    private floatingStyle: Record<string, string | number> = { display: 'none' };
    private arrowStyle: Record<string, string | number> = {};

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.floatingEl = document.createElement('div');
        this.ctx.containerElement.appendChild(this.floatingEl);
        this.renderTooltip();
        this.init();
    }

    private getBaseStyles() {
        const { TOOLTIP_BG_COLOR, TOOLTIP_TEXT_COLOR, TOOLTIP_ZINDEX, CSS_PREFIX } = this.ctx.config;
        return {
            prefix: CSS_PREFIX,
            floating: {
                position: 'absolute',
                background: TOOLTIP_BG_COLOR,
                color: TOOLTIP_TEXT_COLOR,
                boxSizing: 'border-box',
                zIndex: TOOLTIP_ZINDEX,
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
            },
            arrow: {
                position: 'absolute',
                width: '10px',
                height: '10px',
                background: TOOLTIP_BG_COLOR,
                transform: 'rotate(45deg)',
                zIndex: TOOLTIP_ZINDEX,
            },
        };
    }

    private renderTooltip() {
        const { prefix, floating, arrow } = this.getBaseStyles();
        const customFloatingStyle = this.ctx.config.TOOLTIP_CUSTOM_STYLE as Record<string, string | number>;
        render(
            html`<div class="${prefix}-tooltip" style="${toStyleStr({ ...floating, ...customFloatingStyle, ...this.floatingStyle })}">
                <div class="${prefix}-tooltip-content" style="${toStyleStr(this.contentStyle)}">
                    ${this.contentText}
                </div>
                <div class="${prefix}-tooltip-arrow" style="${toStyleStr({ ...arrow, ...this.arrowStyle })}"></div>
            </div>`,
            this.floatingEl,
        );
    }

    private init() {
        this.floatingEl.addEventListener('mouseleave', () => {
            this.hide();
        });
        this.ctx.on('mouseout', (e) => {
            if (this.floatingEl.contains(e.relatedTarget as Node)) {
                return;
            }
            this.hide();
        });
        this.ctx.on('onScroll', () => {
            this.hide();
        });
        this.ctx.on('startEdit', () => {
            this.hide();
        });
        this.ctx.on('visibleCellHoverChange', (cell, e) => {
            const contains = this.floatingEl.contains(e.target);
            if (contains) {
                return;
            }
            if (cell.ellipsis || cell.message) {
                this.show(cell);
            }
        });
        this.ctx.on('visibleCellMouseleave', (_, e) => {
            const contains = this.floatingEl.contains(e.target);
            if (contains) {
                return;
            }
            this.hide();
        });
        this.ctx.on('cellHeaderMouseleave', (_, e) => {
            const contains = this.floatingEl.contains(e.target);
            if (contains) {
                return;
            }
            this.hide();
        });
        this.ctx.on('cellHeaderHoverChange', (cell, e) => {
            const contains = this.floatingEl.contains(e.target);
            if (contains) {
                return;
            }
            if (cell.ellipsis) {
                this.show(cell);
            }
        });
        this.ctx.on('cellFooterMouseleave', (_, e) => {
            const contains = this.floatingEl.contains(e.target);
            if (contains) {
                return;
            }
            this.hide();
        });
        this.ctx.on('cellFooterHoverChange', (cell, e) => {
            const contains = this.floatingEl.contains(e.target);
            if (contains) {
                return;
            }
            if (cell.ellipsis) {
                this.show(cell);
            }
        });
        this.ctx.on('cellShowTooltip', (cell, message) => {
            this.show(cell, message);
        });
        this.ctx.on('cellHideTooltip', () => {
            this.hide();
        });
    }

    private show(cell: Cell, message?: string) {
        if (this.ctx.contextMenuIng) {
            return;
        }
        if (!cell.overflowTooltipShow) {
            return;
        }
        if (this.ctx.mousedown) {
            return;
        }
        this.floatingStyle = { ...this.floatingStyle, display: 'block' };
        let text = cell.getText();
        if (cell.message) {
            text = cell.message;
        }
        if (message) {
            text = message;
        }
        const targetRect = this.ctx.containerElement.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        this.enable = true;
        this.contentText = text;
        this.contentStyle = {
            maxWidth: `${cell.overflowTooltipMaxWidth || 500}px`,
            minWidth: '100px',
            width: '100%',
            display: 'inline-block',
            wordBreak: 'break-all',
            lineHeight: '1.5',
        };
        this.renderTooltip();

        const viewportRect = this.ctx.zoomScale.getViewportRect(
            {
                x: cell.drawX,
                y: cell.drawY,
                width: cell.visibleWidth,
                height: cell.visibleHeight,
            },
            targetRect,
        );
        const virtualEl = {
            getBoundingClientRect() {
                return viewportRect;
            },
        };
        const arrowEl = this.floatingEl.querySelector(`.${this.ctx.config.CSS_PREFIX}-tooltip-arrow`) as HTMLElement;

        computePosition(virtualEl, this.floatingEl.firstElementChild as HTMLElement, {
            placement: cell.overflowTooltipPlacement,
            middleware: [shift(), flip(), offset(6), arrow({ element: arrowEl })],
        }).then((val) => {
            const { x, y, placement, middlewareData } = val;
            this.floatingStyle = {
                ...this.floatingStyle,
                top: `${y}px`,
                left: `${x}px`,
            };
            if (middlewareData.arrow) {
                const arrowData = middlewareData.arrow;
                if (['left', 'left-start', 'left-end'].includes(placement)) {
                    this.arrowStyle = {
                        top: `${arrowData.y}px`,
                        bottom: '',
                        left: '',
                        right: '-5px',
                    };
                } else if (['right', 'right-start', 'right-end'].includes(placement)) {
                    this.arrowStyle = {
                        top: `${arrowData.y}px`,
                        bottom: '',
                        left: '-5px',
                        right: '',
                    };
                } else if (['bottom', 'bottom-start', 'bottom-end'].includes(placement)) {
                    this.arrowStyle = {
                        top: '-5px',
                        bottom: '',
                        left: `${arrowData.x}px`,
                        right: '',
                    };
                } else if (['top', 'top-start', 'top-end'].includes(placement)) {
                    this.arrowStyle = {
                        top: '',
                        bottom: '-5px',
                        left: `${arrowData.x}px`,
                        right: '',
                    };
                }
            }
            this.renderTooltip();
        });
    }

    hide() {
        if (!this.enable) {
            return;
        }
        this.enable = false;
        this.floatingStyle = { ...this.floatingStyle, display: 'none' };
        this.renderTooltip();
    }

    destroy() {
        this.floatingEl.remove();
    }
}
