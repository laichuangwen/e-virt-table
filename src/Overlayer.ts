import type Cell from './Cell';
import type CellHeader from './CellHeader';
import type Context from './Context';
import type { OverlayerContainer, OverlayerView, OverlayerWrapper } from './types';
export default class Overlayer {
    ctx: Context;
    constructor(ctx: Context) {
        this.ctx = ctx;
    }
    draw() {
        const overlayer = this.getContainer();
        this.ctx.emit('overlayerChange', overlayer);
    }
    destroy() {
        this.ctx.emit('overlayerChange', {
            style: {},
            views: [],
        });
    }
    private getContainer(): OverlayerContainer {
        const header = this.getHeader();
        const body = this.getBody();
        const footer = this.getFooter();
        let views: OverlayerWrapper[] = [];
        // 不是固定底部的时候，不用加入footer，因为footer是在body的下面的
        const { FOOTER_FIXED, FOOTER_POSITION } = this.ctx.config;
        if (!FOOTER_FIXED) {
            views = [header, body];
        } else {
            if (FOOTER_POSITION === 'top') {
                views = [header, footer, body];
            } else {
                views = [header, body, footer];
            }
        }
        return {
            views,
        };
    }
    private getHeader() {
        const {
            fixedLeftWidth,
            fixedRightWidth: _fixedRightWidth,
            config: { SCROLLER_TRACK_SIZE, CSS_PREFIX },
        } = this.ctx;
        const { visibleWidth, visibleHeight, renderCellHeaders } = this.ctx.header;
        let centerCells: CellHeader[] = [];
        let leftCells: CellHeader[] = [];
        let rightCells: CellHeader[] = [];
        renderCellHeaders.forEach((cellHeader) => {
            if (cellHeader.render) {
                if (cellHeader.fixed === 'left') {
                    leftCells.push(cellHeader);
                } else if (cellHeader.fixed === 'right') {
                    rightCells.push(cellHeader);
                } else {
                    centerCells.push(cellHeader);
                }
            }
        });
        // 减去滚动条的宽度
        const fixedRightWidth = _fixedRightWidth - SCROLLER_TRACK_SIZE;
        const left: OverlayerView = {
            key: 'left',
            style: {
                position: 'absolute',
                top: `${0}px`,
                left: `${0}px`,
                overflow: 'hidden',
                width: `${fixedLeftWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: leftCells,
        };
        const center: OverlayerView = {
            key: 'center',
            style: {
                position: 'absolute',
                top: `${0}px`,
                left: `${fixedLeftWidth}px`,
                overflow: 'hidden',
                width: `${visibleWidth - fixedLeftWidth - fixedRightWidth + 1}px`,
                height: `${visibleHeight}px`,
            },
            cells: centerCells,
        };
        const right: OverlayerView = {
            key: 'right',
            style: {
                position: 'absolute',
                top: `${0}px`,
                right: `${0}px`,
                overflow: 'hidden',
                width: `${fixedRightWidth + 1}px`,
                height: `${visibleHeight}px`,
            },
            cells: rightCells,
        };
        const header: OverlayerWrapper = {
            type: 'header',
            class: `${CSS_PREFIX}-overlayer-header`,
            style: {
                position: 'relative',
                overflow: 'hidden',
                width: `${visibleWidth}px`,
                height: `${visibleHeight}px`,
            },
            views: [left, center, right],
        };
        return header;
    }
    private getBody() {
        const centerCells: Cell[] = [];
        const leftCells: Cell[] = [];
        const rightCells: Cell[] = [];
        let renderRows = this.ctx.body.renderRows;
        // 合计如果不是固定在底部，就加入到渲染行中
        if (!this.ctx.config.FOOTER_FIXED) {
            renderRows = renderRows.concat(this.ctx.footer.renderRows);
        }
        renderRows.forEach((row: { cells: Cell[] }) => {
            row.cells.forEach((cell: Cell) => {
                if (cell.cellType === 'footer') {
                    cell.render = cell.renderFooter;
                }
                if (cell.render) {
                    if (cell.fixed === 'left') {
                        leftCells.push(cell);
                    } else if (cell.fixed === 'right') {
                        rightCells.push(cell);
                    } else {
                        centerCells.push(cell);
                    }
                }
            });
        });
        const {
            fixedLeftWidth,
            fixedRightWidth: _fixedRightWidth,
            config: { SCROLLER_TRACK_SIZE, CSS_PREFIX },
        } = this.ctx;
        const { visibleWidth, visibleHeight } = this.ctx.body;
        // 减去滚动条的宽度
        const fixedRightWidth = _fixedRightWidth - SCROLLER_TRACK_SIZE;
        const left: OverlayerView = {
            key: 'left',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${0.5}px`,
                overflow: 'hidden',
                width: `${fixedLeftWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: leftCells,
        };
        const center: OverlayerView = {
            key: 'center',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${fixedLeftWidth - 0.5}px`,
                overflow: 'hidden',
                width: `${visibleWidth - fixedLeftWidth - fixedRightWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: centerCells,
        };
        const right: OverlayerView = {
            key: 'right',
            style: {
                position: 'absolute',
                top: `${0}px`,
                right: `${0}px`,
                overflow: 'hidden',
                width: `${fixedRightWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: rightCells,
        };
        const body: OverlayerWrapper = {
            type: 'body',
            class: `${CSS_PREFIX}-overlayer-body`,
            style: {
                position: 'relative',
                overflow: 'hidden',
                width: `${visibleWidth}px`,
                height: `${visibleHeight}px`,
            },
            views: [left, center, right],
        };
        return body;
    }
    private getFooter() {
        const centerCells: Cell[] = [];
        const leftCells: Cell[] = [];
        const rightCells: Cell[] = [];
        this.ctx.footer.renderRows.forEach((row: { cells: Cell[] }) => {
            row.cells.forEach((cell: Cell) => {
                if (cell.cellType === 'footer' && cell.renderFooter) {
                    // 把转renderFooter成render统一出口
                    cell.render = cell.renderFooter;
                    if (cell.fixed === 'left') {
                        leftCells.push(cell);
                    } else if (cell.fixed === 'right') {
                        rightCells.push(cell);
                    } else {
                        centerCells.push(cell);
                    }
                }
            });
        });
        const {
            fixedLeftWidth,
            fixedRightWidth: _fixedRightWidth,
            config: { SCROLLER_TRACK_SIZE, CSS_PREFIX },
        } = this.ctx;
        const { visibleWidth, visibleHeight } = this.ctx.footer;
        // 减去滚动条的宽度
        const fixedRightWidth = _fixedRightWidth - SCROLLER_TRACK_SIZE;
        const left: OverlayerView = {
            key: 'left',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${0.5}px`,
                overflow: 'hidden',
                width: `${fixedLeftWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: leftCells,
        };
        const center: OverlayerView = {
            key: 'center',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${fixedLeftWidth - 0.5}px`,
                overflow: 'hidden',
                width: `${visibleWidth - fixedLeftWidth - fixedRightWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: centerCells,
        };
        const right: OverlayerView = {
            key: 'right',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                right: `${0.5}px`,
                overflow: 'hidden',
                width: `${fixedRightWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: rightCells,
        };
        const footer: OverlayerWrapper = {
            type: 'footer',
            class: `${CSS_PREFIX}-overlayer-footer`,
            style: {
                position: 'relative',
                overflow: 'hidden',
                width: `${visibleWidth}px`,
                height: `${visibleHeight}px`,
            },
            views: [left, center, right],
        };
        return footer;
    }
}
