import Cell from './Cell';
import CellHeader from './CellHeader';
import Context from './Context';
import Row from './Row';
export default class EventTable {
    ctx: Context;
    private visibleHoverCell?: Cell;
    private resizeObserver!: ResizeObserver;
    private mutationObserver!: MutationObserver;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }
    private init(): void {
        // 监听窗口大小变化
        this.resizeObserver = new ResizeObserver((entries) => {
            this.ctx.emit('resetHeader');
            this.ctx.emit('resizeObserver', entries);
            this.ctx.emit('containerResize', this.ctx.containerElement);
        });
        this.resizeObserver.observe(this.ctx.containerElement);
        this.mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    this.ctx.config.updateCssVar();
                    this.ctx.emit('draw');
                }
            }
        });
        if (this.ctx.config.ENABLE_AUTO_THEME) {
            this.mutationObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'], // ✅ 只监听 class 更改
            });
        }

        // 按下事件
        this.ctx.on('mousedown', (e) => {
            // 是否忙碌，进行其他操作
            if (this.isBusy(e)) {
                return;
            }
            const { offsetY, offsetX } = this.ctx.getOffset(e);
            const y = offsetY;
            const x = offsetX;
            if (!this.isInsideBody(x, y)) {
                this.ctx.emit('mousedownBodyOutside', e);
            }
            // 左边点击
            if (e.button !== 0) {
                return;
            }
            this.handleHeaderEvent(x, y, this.ctx.header.renderCellHeaders, (cell: CellHeader) => {
                this.ctx.focusCellHeader = cell;
                this.ctx.focusCell = undefined;
                this.ctx.emit('cellHeaderMousedown', cell, e);
            });
            this.handleBodyEvent(x, y, this.ctx.body.renderRows, (cell: Cell) => {
                this.ctx.setFocusCell(cell);
                this.ctx.focusCellHeader = undefined;
                this.ctx.emit('cellMousedown', cell, e);
            }, true);
        });
        // 按上事件
        this.ctx.on('mouseup', (e) => {
            // 左边点击
            if (e.button !== 0) {
                return;
            }
            // 是否忙碌，进行其他操作
            if (this.isBusy(e)) {
                return;
            }
            const { offsetY, offsetX } = this.ctx.getOffset(e);
            const y = offsetY;
            const x = offsetX;
            this.handleHeaderEvent(x, y, this.ctx.header.renderCellHeaders, (cell: CellHeader) => {
                this.ctx.emit('cellHeaderMouseup', cell, e);
            });
            this.handleBodyEvent(x, y, this.ctx.body.renderRows, (cell: Cell) => {
                this.ctx.emit('cellMouseup', cell, e);
            });
        });
        this.ctx.on('click', (e) => {
            // 左边点击
            if (e.button !== 0) {
                return;
            }
            // 是否忙碌，进行其他操作
            if (this.isBusy(e)) {
                return;
            }
            const y = this.ctx.getOffset(e).offsetY;
            const x = this.ctx.getOffset(e).offsetX;
            this.handleHeaderEvent(x, y, this.ctx.header.renderCellHeaders, (cell: CellHeader) => {
                this.ctx.clickCellHeader = cell;
                this.ctx.emit('cellHeaderClick', cell, e);
            });
            // 可视区
            this.handleBodyEvent(
                x,
                y,
                this.ctx.body.renderRows,
                (cell: Cell) => {
                    this.ctx.clickCell = cell;
                    this.ctx.emit('cellClick', cell, e);
                    const hoverIcon = cell.getImage('hover');
                    if (!this.ctx.disableHoverIconClick && hoverIcon && hoverIcon.isInside(x, y)) {
                        this.ctx.emit('hoverIconClick', cell);
                    }
                },
                true,
            );
        });
        this.ctx.on('dblclick', (e) => {
            // 左边点击
            if (e.button !== 0) {
                return;
            }
            // 是否忙碌，进行其他操作
            if (this.isBusy(e)) {
                return;
            }
            const y = this.ctx.getOffset(e).offsetY;
            const x = this.ctx.getOffset(e).offsetX;
            this.handleHeaderEvent(x, y, this.ctx.header.renderCellHeaders, (cell: CellHeader) => {
                this.ctx.emit('cellHeaderDblclick', cell, e);
            });

            this.handleBodyEvent(x, y, this.ctx.body.renderRows, (cell: Cell) => {
                this.ctx.clickCell = cell;
                this.ctx.emit('cellDblclick', cell, e);
            });
        });
        this.ctx.on('contextMenu', (e: MouseEvent) => {
            if (this.isBusy(e)) {
                return;
            }
            const { offsetY, offsetX } = this.ctx.getOffset(e);
            const y = offsetY;
            const x = offsetX;

            this.handleHeaderEvent(x, y, this.ctx.header.renderCellHeaders, (cell: CellHeader) => {
                this.ctx.emit('cellHeaderContextMenuClick', cell, e);
            });
            this.handleBodyEvent(x, y, this.ctx.body.renderRows, (cell: Cell) => {
                this.ctx.emit('cellContextMenuClick', cell, e);
            });
        });
        this.ctx.on('mouseout', (e: MouseEvent) => {
            if (!this.ctx.containerElement.contains(e.relatedTarget as Node) && this.ctx.hoverCell !== undefined) {
                this.ctx.hoverRow = undefined;
                this.ctx.hoverCell = undefined;
                this.ctx.emit('draw');
            }
        });
        this.ctx.on('mousemove', (e: MouseEvent) => {
            // 是否忙碌，进行其他操作
            if (this.isBusy(e)) {
                return;
            }
            if (!this.ctx.mousedown && this.ctx.stageElement.style.cursor !== 'default') {
                this.ctx.stageElement.style.cursor = 'default';
            }
            const y = this.ctx.getOffset(e).offsetY;
            const x = this.ctx.getOffset(e).offsetX;
            this.handleHeaderEvent(x, y, this.ctx.header.renderCellHeaders, (cell: CellHeader) => {
                this.imageEnterAndLeave(cell, e);
                this.ctx.emit('cellHeaderMouseenter', cell, e);
                // 移出事件
                if (this.ctx.hoverCellHeader && this.ctx.hoverCellHeader !== cell) {
                    this.ctx.emit('cellHeaderMouseleave', this.ctx.hoverCellHeader, e);
                }
                if (this.ctx.hoverCellHeader === cell) {
                    return;
                }
                this.ctx.hoverCellHeader = cell;
                this.visibleHoverCell = undefined; // 清除可视区hover
                this.ctx.emit('cellHeaderHoverChange', cell, e);
            });
            // 可视区
            this.handleBodyEvent(
                x,
                y,
                this.ctx.body.renderRows,
                (cell: Cell) => {
                    this.imageEnterAndLeave(cell, e);
                    if (this.visibleHoverCell !== cell) {
                        this.ctx.emit('visibleCellMouseleave', cell, e);
                        this.visibleHoverCell = cell;
                        this.ctx.hoverCellHeader = undefined; // 清除头部hover
                        this.ctx.emit('visibleCellHoverChange', cell, e);
                    }
                },
                true,
            );
            // 正常
            this.handleBodyEvent(x, y, this.ctx.body.renderRows, (cell: Cell) => {
                // this.imageEnterAndLeave(cell, e);
                this.ctx.emit('cellMouseenter', cell, e);
                // 移出事件
                if (this.ctx.hoverCell && this.ctx.hoverCell !== cell) {
                    this.ctx.emit('cellMouseleave', cell, e);
                }
                if (this.ctx.hoverCell === cell) return;
                if (this.ctx.hoverCell?.rowKey !== cell.rowKey) {
                    this.ctx.hoverCell = cell;
                    this.ctx.hoverRow = this.ctx.body.renderRows.find((item) => item.rowKey === cell.rowKey);
                    this.ctx.emit('rowHoverChange', this.ctx.hoverRow, cell, e);
                    this.ctx.emit('draw');
                }
                this.ctx.hoverCell = cell;
                this.ctx.emit('cellHoverChange', cell, e);
            });
            this.handleFooterEvent(x, y, this.ctx.footer.renderRows, (cell: Cell) => {
                this.ctx.emit('cellFooterMouseenter', cell, e);
                // 移出事件
                if (this.ctx.hoverCell && this.ctx.hoverCell !== cell) {
                    this.ctx.emit('cellFooterMouseleave', cell, e);
                }
                this.ctx.emit('cellFooterHoverChange', cell, e);
            });
        });
    }
    /**
     * 图标进入和离开事件，包括选中，展开，提示图标等
     * @param cell
     * @param e
     */
    private imageEnterAndLeave(cell: Cell | CellHeader, e: MouseEvent) {
        if (this.ctx.dragRowIng || this.ctx.dragHeaderIng || this.ctx.selectColsIng || this.ctx.selectRowsIng || this.ctx.selectorMove || this.ctx.autofillMove) {
            return;
        }
        const { offsetY, offsetX } = this.ctx.getOffset(e);
        const y = offsetY;
        const x = offsetX;
        cell.cellImages.forEach((image, key) => {
            if (image.isInside(x, y)) {
                if (key === 'drag') {
                    this.ctx.stageElement.style.cursor = 'grab';
                } else {
                    this.ctx.stageElement.style.cursor = 'pointer';
                }
            }
        });
    }
    private isBusy(e: MouseEvent) {
        const { offsetY, offsetX } = this.ctx.getOffset(e);
        const y = offsetY;
        const x = offsetX;

        if (this.ctx.loading) {
            return true;
        }
        if (!this.ctx.isTarget(e)) {
            return true;
        }
        // 行调整大小中不处理
        if (this.ctx.stageElement.style.cursor === 'row-resize') {
            return true;
        }
        // 列调整大小中不处理
        if (this.ctx.stageElement.style.cursor === 'col-resize') {
            return true;
        }
        // 列调整大小中不处理
        if (this.ctx.columnResizing) {
            return true;
        }
        // 行调整大小中不处理
        if (this.ctx.rowResizing) {
            return true;
        }
        const { SCROLLER_TRACK_SIZE } = this.ctx.config;
        // 滚动条移动不处理
        if (this.ctx.scrollerMove) {
            return true;
        }
        // 滚动条悬浮不处理
        if (this.ctx.scrollerFocus) {
            return true;
        }
        // 点击滚动条不处理
        if (y > this.ctx.stageHeight - SCROLLER_TRACK_SIZE) {
            return true;
        }
        // 点击滚动条不处理
        if (x > this.ctx.stageWidth - SCROLLER_TRACK_SIZE) {
            return true;
        }
        return false;
    }
    private handleBodyEvent(x: number, y: number, renderRows: Row[], callback: Function, visible = false) {
        if (!this.isInsideBody(x, y)) {
            return;
        }
        for (const row of renderRows) {
            // 优先处理固定列
            const cells = row.fixedCells.concat(row.noFixedCells);
            for (const cell of cells) {
                const isInside = visible ? cell.isInsideVisible(x, y) : cell.isInside(x, y);
                if (isInside) {
                    callback(cell);
                    return;
                }
            }
        }
    }
    private handleHeaderEvent(x: number, y: number, renderCellHeaders: CellHeader[], callback: Function) {
        for (const cell of renderCellHeaders) {
            if (cell.isInside(x, y)) {
                callback(cell);
                return;
            }
        }
    }
    private handleFooterEvent(x: number, y: number, renderRows: Row[], callback: Function) {
        for (const row of renderRows) {
            // 优先处理固定列
            const cells = row.fixedCells.concat(row.noFixedCells);
            for (const cell of cells) {
                if (cell.isInside(x, y)) {
                    callback(cell);
                    return;
                }
            }
        }
    }
    private isInsideBody(_x: number, _y: number) {
        const { body: {
            y,
            visibleHeight,
            height,
            visibleWidth,
        } } = this.ctx;
        const realityHeight = Math.min(height, visibleHeight);
        return _x > 0 && _x < visibleWidth && _y > y && _y < y + realityHeight;
    }
    destroy() {
        this.resizeObserver.unobserve(this.ctx.stageElement);
        this.mutationObserver.disconnect();
    }
}
