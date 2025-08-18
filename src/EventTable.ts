import Cell from './Cell';
import CellHeader from './CellHeader';
import Context from './Context';
import Row from './Row';
import { ExpandLazyMethod } from './types';

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
        this.resizeObserver = new ResizeObserver(() => {
            this.ctx.emit('resetHeader');
            this.ctx.emit('resizeObserver');
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
                this.ctx.focusCellHeader = cell;
                this.ctx.emit('cellHeaderMousedown', cell, e);
            });
            this.handleBodyEvent(x, y, this.ctx.body.renderRows, (cell: Cell) => {
                this.ctx.setFocusCell(cell);
                this.ctx.emit('cellMousedown', cell, e);
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
                // selection事件
                this.selectionClick(cell, e);
                this.sortClick(cell, e);
            });
            // 可视区
            this.handleBodyEvent(
                x,
                y,
                this.ctx.body.renderRows,
                (cell: Cell) => {
                    this.ctx.clickCell = cell;
                    this.ctx.emit('cellClick', cell, e);
                    this.selectionClick(cell, e);
                    this.treeClick(cell, e);
                },
                true,
            );
            // 正常
            this.handleBodyEvent(
                x,
                y,
                this.ctx.body.renderRows,
                (cell: Cell) => {
                    // hoverIcon事件
                    this.hoverIconClick(cell);
                },
                false,
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
            this.ctx.isPointer = false;
            if (this.ctx.stageElement.style.cursor === 'pointer') {
                this.ctx.stageElement.style.cursor = 'default';
            }
            const y = this.ctx.getOffset(e).offsetY;
            const x = this.ctx.getOffset(e).offsetX;
            this.handleHeaderEvent(x, y, this.ctx.header.renderCellHeaders, (cell: CellHeader) => {
                this.ctx.emit('cellHeaderMouseenter', cell, e);
                // 移出事件
                if (this.ctx.hoverCellHeader && this.ctx.hoverCellHeader !== cell) {
                    this.ctx.emit('cellHeaderMouseleave', this.ctx.hoverCellHeader, e);
                }
                // selection头部事件
                this.imageEnterAndLeave(cell, e);
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
                    // selection移入移除事件
                    //  this.ctx.emit("visibleCellHoverChange", cell, e);
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
                this.imageEnterAndLeave(cell, e);
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
                    this.ctx.emit('drawView');
                }
                this.ctx.hoverCell = cell;
                this.ctx.emit('cellHoverChange', cell, e);
            });
        });
    }
    private hoverIconClick(cell: Cell) {
        // 鼠标移动到图标上会变成pointer，所以这里判断是否是pointer就能判断出是图标点击的
        if (cell.hoverIconName && this.ctx.isPointer) {
            this.ctx.emit('hoverIconClick', cell);
        }
    }
    /**
     *选中点击
     * @param cell
     */
    private selectionClick(cell: CellHeader | Cell, e: MouseEvent) {
        // 鼠标移动到图标上会变成pointer，所以这里判断是否是pointer就能判断出是图标点击的
        const isSelection =
            ['selection', 'index-selection', 'selection-tree', 'tree-selection'].includes(cell.type) &&
            this.ctx.isPointer;
        if (!isSelection) {
            return;
        }
        // 判断是否点击checkbox图标
        const { offsetY, offsetX } = this.ctx.getOffset(e);
        const clickY = offsetY;
        const clickX = offsetX;
        if (
            !this.isInsideElement(
                clickX,
                clickY,
                cell.drawSelectionImageX,
                cell.drawSelectionImageY,
                cell.drawSelectionImageWidth,
                cell.drawSelectionImageHeight,
            )
        ) {
            return;
        }
        // 点击头部
        if (cell instanceof CellHeader) {
            if (
                cell.drawSelectionImageName === 'checkbox-uncheck' ||
                cell.drawSelectionImageName === 'checkbox-indeterminate'
            ) {
                this.ctx.database.toggleAllSelection();
            } else if (cell.drawSelectionImageName === 'checkbox-check') {
                this.ctx.database.clearSelection(true);
            }
        } else {
            // 点击body
            // 是否可点击
            const selectable = this.ctx.database.getRowSelectable(cell.rowKey);
            if (!selectable) {
                return;
            }
            this.ctx.database.toggleRowSelection(cell.rowKey, cell.type);
        }
    }
    /**
     * 树点击
     * @param cell
     */
    private treeClick(cell: Cell, e: MouseEvent) {
        // 鼠标移动到图标上会变成pointer，所以这里判断是否是pointer就能判断出是图标点击的
        const isTree = ['tree', 'selection-tree', 'tree-selection'].includes(cell.type) && this.ctx.isPointer;
        if (!isTree) {
            return;
        }
        // 判断是否点击tree图标
        const { offsetY, offsetX } = this.ctx.getOffset(e);
        const clickY = offsetY;
        const clickX = offsetX;

        if (
            !this.isInsideElement(
                clickX,
                clickY,
                cell.drawTreeImageX,
                cell.drawTreeImageY,
                cell.drawTreeImageWidth,
                cell.drawTreeImageHeight,
            )
        ) {
            return;
        }

        const row = this.ctx.database.getRowForRowKey(cell.rowKey);
        const { expand = false, expandLazy = false } = row || {};
        const { EXPAND_LAZY, EXPAND_LAZY_METHOD } = this.ctx.config;
        // 懒加载且有懒加载方法，不是展开的不是已经加载过的
        if (EXPAND_LAZY && EXPAND_LAZY_METHOD && !expand && !expandLazy) {
            if (typeof EXPAND_LAZY_METHOD === 'function') {
                this.ctx.database.expandLoading(cell.rowKey, true);
                const expandLazyMethod: ExpandLazyMethod = EXPAND_LAZY_METHOD;
                expandLazyMethod({
                    row: cell.row,
                    rowIndex: cell.rowIndex,
                    colIndex: cell.colIndex,
                    column: cell.column,
                    value: cell.getValue(),
                })
                    .then((res: any) => {
                        this.ctx.database.setExpandChildren(cell.rowKey, res);
                        this.ctx.database.expandLoading(cell.rowKey, false);
                        this.ctx.emit('expandChange', this.ctx.database.getExpandRowKeys());
                    })
                    .catch((err: any) => {
                        this.ctx.database.expandLoading(cell.rowKey, false);
                        console.error(err);
                    });
            }
            // 懒加载
        } else {
            const isExpand = this.ctx.database.getIsExpand(cell.rowKey);
            this.ctx.database.expandItem(cell.rowKey, !isExpand);
            this.ctx.emit('expandChange', this.ctx.database.getExpandRowKeys());
        }
    }

    private sortClick(cellHeader: CellHeader, e: MouseEvent) {
        const { offsetY, offsetX } = this.ctx.getOffset(e);
        const clickY = offsetY;
        const clickX = offsetX;
        if (
            !this.isInsideElement(
                clickX,
                clickY,
                cellHeader.drawSortImageX,
                cellHeader.drawSortImageY,
                cellHeader.drawSortImageWidth,
                cellHeader.drawSortImageHeight,
            )
        ) {
            return;
        }
        // 前端排序
        const currentState = this.ctx.database.getSortState(cellHeader.key);
        let newDirection: 'asc' | 'desc' | 'none';
        // 按照 不排序->升序->降序->不排序 的顺序循环
        if (currentState.direction === 'none') {
            newDirection = 'asc';
        } else if (currentState.direction === 'asc') {
            newDirection = 'desc';
        } else {
            newDirection = 'none';
        }
        this.ctx.database.setSortState(cellHeader.key, newDirection);
    }
    /**
     * 图标进入和离开事件，包括选中，展开，提示图标等
     * @param cell
     * @param e
     */
    private imageEnterAndLeave(cell: Cell | CellHeader, e: MouseEvent) {
        const { offsetY, offsetX } = this.ctx.getOffset(e);
        const y = offsetY;
        const x = offsetX;
        // 检查头部图标
        if (cell instanceof CellHeader) {
            // 选中图标
            if (
                cell.drawSelectionImageSource &&
                this.isInsideElement(
                    x,
                    y,
                    cell.drawSelectionImageX,
                    cell.drawSelectionImageY,
                    cell.drawSelectionImageWidth,
                    cell.drawSelectionImageHeight,
                )
            ) {
                this.ctx.stageElement.style.cursor = 'pointer';
                this.ctx.isPointer = true;
                return;
            }
            // 排序图标
            if (
                cell.drawSortImageSource &&
                this.isInsideElement(
                    x,
                    y,
                    cell.drawSortImageX,
                    cell.drawSortImageY,
                    cell.drawSortImageWidth,
                    cell.drawSortImageHeight,
                )
            ) {
                this.ctx.stageElement.style.cursor = 'pointer';
                this.ctx.isPointer = true;
                return;
            }
        }
        // 检查body图标
        if (cell instanceof Cell) {
            // 选中图标
            if (
                cell.drawSelectionImageSource &&
                this.isInsideElement(
                    x,
                    y,
                    cell.drawSelectionImageX,
                    cell.drawSelectionImageY,
                    cell.drawSelectionImageWidth,
                    cell.drawSelectionImageHeight,
                )
            ) {
                this.ctx.stageElement.style.cursor = 'pointer';
                this.ctx.isPointer = true;
                // body cell 需要处理是否禁用
                const selectable = this.ctx.database.getRowSelectable(cell.rowKey);
                if (!selectable) {
                    this.ctx.stageElement.style.cursor = 'not-allowed';
                }
                return;
            }
            // hover图标
            if (
                cell.drawHoverImageSource &&
                this.isInsideElement(
                    x,
                    y,
                    cell.drawHoverImageX,
                    cell.drawHoverImageY,
                    cell.drawHoverImageWidth,
                    cell.drawHoverImageHeight,
                )
            ) {
                this.ctx.stageElement.style.cursor = 'pointer';
                this.ctx.isPointer = true;
                return;
            }
            // tree图标
            if (
                cell.drawTreeImageSource &&
                this.isInsideElement(
                    x,
                    y,
                    cell.drawTreeImageX,
                    cell.drawTreeImageY,
                    cell.drawTreeImageWidth,
                    cell.drawTreeImageHeight,
                )
            ) {
                this.ctx.stageElement.style.cursor = 'pointer';
                this.ctx.isPointer = true;
                return;
            }
        }
    }
    private isInsideElement(
        x: number,
        y: number,
        xElement: number,
        yElement: number,
        widthElement: number,
        heightElement: number,
    ) {
        if (x > xElement && x < xElement + widthElement && y > yElement && y < yElement + heightElement) {
            return true;
        }
        return false;
    }
    private isBusy(e: MouseEvent) {
        const { offsetY, offsetX } = this.ctx.getOffset(e);
        const y = offsetY;
        const x = offsetX;

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
        if (!this.isInsideBody(y)) {
            return;
        }
        for (const row of renderRows) {
            // 优先处理固定列
            const cells = row.fixedCells.concat(row.noFixedCells);
            for (const cell of cells) {
                const drawX = cell.getDrawX();
                const drawY = cell.getDrawY();
                if (visible) {
                    if (x > drawX && x < drawX + cell.visibleWidth && y > drawY && y < drawY + cell.visibleHeight) {
                        callback(cell);
                        return; // 找到后直接返回
                    }
                } else if (x > drawX && x < drawX + cell.width && y > drawY && y < drawY + cell.height) {
                    callback(cell);
                    return; // 找到后直接返回
                }
            }
        }
    }
    private handleHeaderEvent(x: number, y: number, renderCellHeaders: CellHeader[], callback: Function) {
        for (const cell of renderCellHeaders) {
            const drawX = cell.getDrawX();
            const drawY = cell.getDrawY();
            if (x > drawX && x < drawX + cell.width && y > drawY && y < drawY + cell.height) {
                callback(cell);
                return; // 找到后直接返回
            }
        }
    }
    private isInsideBody(y: number) {
        return y > this.ctx.body.y && y < this.ctx.body.y + this.ctx.body.visibleHeight;
    }
    destroy() {
        this.resizeObserver.unobserve(this.ctx.stageElement);
        this.mutationObserver.disconnect();
    }
}
