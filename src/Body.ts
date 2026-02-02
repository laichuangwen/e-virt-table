import Cell from './Cell';
import type Context from './Context';
import Row from './Row';
import { TreeUtil, TreeUtilPosition } from './TreeUtil';
import { Position } from './types';
export default class Body {
    private resizeTarget: Row | null = null; //调整行大小的目标
    private dragSource: Cell | null = null; //拖拽行的源
    private dragTarget: Cell | null = null; //拖拽行的目标
    private dragRowDiff = 0; //拖拽行的差值
    private dragPosition: TreeUtilPosition = 'none'; //拖拽行的目标行索引
    private isMouseDown = false; // 是否按下
    private resizeDiff = 0; // 是否移动中
    private clientY = 0; // 鼠标按下时的y轴位置
    private ctx: Context;
    private x = 0;
    private y = 0;
    private width = 0;
    private height = 0;
    private headIndex = 0;
    private tailIndex = 0;
    private isResizing = false; //是否正在调整大小
    private renderRows: Row[] = [];
    private visibleRows: any[] = [];
    private visibleHeight = 0;
    private visibleWidth = 0;
    private containerRect: DOMRect | undefined;
    private data: any[] = [];
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
        this.initResizeRow();
        this.initDragRow();
    }
    private init() {
        const {
            canvasElement,
            header,
            footer,
            database,
            config: {
                FOOTER_FIXED,
                SCROLLER_TRACK_SIZE = 0,
                HEIGHT,
                EMPTY_BODY_HEIGHT = 0,
                MAX_HEIGHT = 0,
                ENABLE_OFFSET_HEIGHT = 0,
                OFFSET_HEIGHT = 0,
                FOOTER_POSITION,
            },
        } = this.ctx;
        if (!header.width) {
            return;
        }
        this.x = 0;
        if (FOOTER_POSITION === 'top' && FOOTER_FIXED) {
            this.y = header.height + footer.height; //更新body的y轴位置
        } else {
            this.y = header.height;
        }
        const { data, sumHeight } = database.getData();
        // 更新高度
        this.height = sumHeight;
        // 更新数据
        this.data = data;
        // 更新宽度
        this.width = header.width;
        this.visibleWidth = this.ctx.stageWidth - SCROLLER_TRACK_SIZE;
        // 底部高度
        const footerHeight = this.ctx.footer.height;
        this.ctx.isEmpty = !this.data.length;
        if (!this.data.length && !HEIGHT) {
            this.height = EMPTY_BODY_HEIGHT;
        } else if (!this.data.length && HEIGHT) {
            // 如果有设置高度的情况，空数据时，高度也要保持为设置的高度
            this.height = HEIGHT - header.height - footerHeight - SCROLLER_TRACK_SIZE;
        }

        let containerHeight = this.height + header.height + SCROLLER_TRACK_SIZE;
        // 如果有底部,加上底部高度
        containerHeight += footerHeight;
        let stageHeight = containerHeight;
        const windowInnerHeight = window.innerHeight;
        const { top } = this.containerRect || this.ctx.containerElement.getBoundingClientRect();
        if (windowInnerHeight > top && ENABLE_OFFSET_HEIGHT && !HEIGHT) {
            const visibleHeight = windowInnerHeight - top;
            const _stageHeight = visibleHeight - OFFSET_HEIGHT;
            if (_stageHeight > header.height + SCROLLER_TRACK_SIZE) {
                stageHeight = _stageHeight;
            } else if (containerHeight > MAX_HEIGHT) {
                stageHeight = MAX_HEIGHT;
            }
        } else if (this.data.length && HEIGHT) {
            stageHeight = HEIGHT;
        } else if (this.data.length && MAX_HEIGHT && containerHeight > MAX_HEIGHT) {
            stageHeight = MAX_HEIGHT;
        }
        // 更新窗口高度
        if (stageHeight > 0) {
            // this.ctx.canvasElement.height = stageHeight;
            this.ctx.stageHeight = Math.floor(stageHeight);
            this.ctx.stageElement.style.height = `${this.ctx.stageHeight}px`;
        }
        // 可视区高度
        let _visibleHeight = this.ctx.stageHeight - header.height - SCROLLER_TRACK_SIZE;
        // 底部高度,如果是固定底部,可视区减上底部高度
        if (FOOTER_FIXED) {
            this.visibleHeight = _visibleHeight - footerHeight;
        } else {
            this.visibleHeight = _visibleHeight;
        }
        if (!this.data.length) {
            this.height = this.visibleHeight;
        }
        this.ctx.body.x = this.x;
        this.ctx.body.y = this.y;
        this.ctx.body.width = this.width;
        this.ctx.body.height = this.height;
        this.ctx.body.visibleWidth = this.visibleWidth;
        this.ctx.body.visibleHeight = this.visibleHeight;
        this.ctx.body.data = data;
        const dpr = window.devicePixelRatio || 1; // 获取设备像素比
        const canvasWidth = this.ctx.stageWidth * dpr;
        const canvasHeight = this.ctx.stageHeight * dpr;
        canvasElement.width = Math.round(canvasWidth);
        canvasElement.height = Math.round(canvasHeight);
        const isEmpty = !this.data.length ? 'empty' : 'not-empty';
        this.ctx.emit('emptyChange', {
            isEmpty,
            type: isEmpty,
            headerHeight: header.height,
            bodyHeight: this.height,
            footerHeight,
            width: this.width,
            height: !this.data.length ? EMPTY_BODY_HEIGHT + footerHeight : 0,
        });
        // 外层容器样式
        const _cssWidth = Math.round((canvasElement.width / dpr) * 10000) / 10000;
        const _cssHeight = Math.round((canvasElement.height / dpr) * 10000) / 10000;
        this.ctx.canvasElement.setAttribute('style', `height:${_cssHeight}px;width:${_cssWidth}px;`);
        this.ctx.paint.scale(dpr);
    }
    // 调整行的高度
    private initResizeRow() {
        this.ctx.on('resize', () => {
            if (!this.ctx.config.ENABLE_RESIZE_ROW) {
                return;
            }
            this.containerRect = this.ctx.containerElement.getBoundingClientRect();
        });
        this.ctx.on('resizeObserver', () => {
            if (!this.ctx.config.ENABLE_RESIZE_ROW) {
                return;
            }
            this.containerRect = this.ctx.containerElement.getBoundingClientRect();
        });
        // 鼠标移动
        this.ctx.on('mouseup', () => {
            if (!this.ctx.config.ENABLE_RESIZE_ROW) {
                return;
            }
            this.isMouseDown = false;
            if (this.resizeDiff !== 0 && this.resizeTarget) {
                // 调整宽度
                this.resizeRow(this.resizeTarget, this.resizeDiff);
            }
            this.resizeTarget = null;
            this.resizeDiff = 0;
            this.isResizing = false;
            //加个延时，修复拖动时，开始编辑的问题
            setTimeout(() => {
                this.ctx.rowResizing = false;
            }, 0);
            this.clientY = 0;
        });
        this.ctx.on('mousedown', (e) => {
            if (!this.ctx.config.ENABLE_RESIZE_ROW) {
                return;
            }
            if (!this.ctx.isTarget(e)) {
                return;
            }
            this.clientY = e.clientY;
            if (this.resizeTarget) {
                this.isResizing = true;
                // 传递给上下文，防止其他事件触发，行调整大小时，不触发选择器
                this.ctx.rowResizing = true;
            } else {
                this.isResizing = false;
                this.ctx.rowResizing = false;
            }
            this.isMouseDown = true;
        });
        this.ctx.on('mousemove', (e) => {
            if (!this.ctx.config.ENABLE_RESIZE_ROW) {
                return;
            }
            // 编辑中不触发mousemove
            if (this.ctx.editing) return;
            const { offsetY, offsetX } = this.ctx.getOffset(e);
            const y = offsetY;
            const x = offsetX;
            const clientY = e.clientY;
            const {
                stageHeight,
                scrollY,
                config: { RESIZE_ROW_MIN_HEIGHT = 0 },
            } = this.ctx;
            if (this.isResizing && this.resizeTarget) {
                const resizeTargetHeight = this.resizeTarget.height;
                let diff = clientY - this.clientY;
                const { calculatedHeight } = this.resizeTarget;
                const minHeight = calculatedHeight === -1 ? RESIZE_ROW_MIN_HEIGHT : calculatedHeight;
                if (diff + resizeTargetHeight < minHeight) {
                    diff = -(resizeTargetHeight - minHeight);
                }
                this.resizeDiff = diff;
                this.ctx.emit('draw');
            } else {
                this.resizeTarget = null;
                // 按下时不改变样式，有可能是多选表头
                if (this.isMouseDown) {
                    return;
                }
                // 鼠标移动时，判断是否在行的范围内
                if (
                    x < 0 ||
                    x > this.ctx.body.visibleWidth ||
                    y < 0 ||
                    y > this.ctx.header.visibleHeight + this.ctx.body.visibleHeight
                ) {
                    if (this.ctx.stageElement.style.cursor === 'row-resize') {
                        // 恢复默认样式
                        this.ctx.stageElement.style.cursor = 'default';
                    }
                    return;
                }
                // 如果是拖动选择
                if (this.ctx.stageElement.style.cursor === 'crosshair') {
                    return;
                }
                if (this.ctx.stageElement.style.cursor === 'row-resize') {
                    // 恢复默认样式
                    this.ctx.stageElement.style.cursor = 'default';
                }
                for (let i = 0; i < this.renderRows.length; i++) {
                    const row = this.renderRows[i];
                    const isYRange =
                        y > row.y - scrollY + row.height - 1.5 &&
                        y < row.y - scrollY + row.height + 1.5 &&
                        y < stageHeight - 4;
                    if (isYRange) {
                        for (let j = 0; j < row.cells.length; j++) {
                            const cell = row.cells[j];
                            if (
                                x > cell.drawX + 10 &&
                                x < cell.drawX + cell.width - 10 &&
                                cell.rowspan === 1 //没有被合并的单元格
                            ) {
                                this.ctx.stageElement.style.cursor = 'row-resize';
                                this.resizeTarget = row;
                            }
                        }
                    }
                }
            }
        });
    }
    private isDragRowValid() {
        if (!this.ctx.config.ENABLE_DRAG_ROW) {
            return false;
        }
        if (!this.dragSource) {
            return false;
        }
        if (!this.dragTarget) {
            return false;
        }
        if (!this.ctx.dragRowIng) {
            return false;
        }
        if (this.ctx.stageElement.style.cursor === 'not-allowed') {
            return false;
        }
        return true;
    }
    private initDragRow() {
        this.ctx.on('dragRowMouseDown', (cell) => {
            if (!this.ctx.config.ENABLE_DRAG_ROW) {
                return;
            }
            this.dragSource = cell;
            // 收起行
            this.ctx.database.expandItem(cell.rowKey, false);
            this.ctx.dragRowIng = true;
            this.dragRowDiff = this.ctx.mouseY - cell.drawY;
            this.ctx.stageElement.style.cursor = 'grabbing';
            this.ctx.clearSelector();
            this.ctx.emit('draw');
        });
        this.ctx.on('mouseup', async () => {
            if (this.isDragRowValid()) {
                try {
                    const dragSource = this.dragSource as Cell;
                    const dragTarget = this.dragTarget as Cell;
                    const params = {
                        source: dragSource,
                        target: dragTarget,
                        position: this.dragPosition,
                    };
                    let isDragRow = true;
                    const { BEFORE_DRAG_ROW_METHOD } = this.ctx.config;
                    // 判断是不是函数
                    if (typeof BEFORE_DRAG_ROW_METHOD === 'function') {
                        // 判断的是不是Promise
                        isDragRow = await BEFORE_DRAG_ROW_METHOD(params);
                    }
                    if (isDragRow) {
                        this.ctx.emit('dragRowChange', params);
                        const originalData = this.ctx.database.getOriginalData();
                        const { TREE_CHILDREN_KEY, ROW_KEY } = this.ctx.config;
                        const treeUtil = new TreeUtil(originalData, {
                            key: ROW_KEY,
                            childrenKey: TREE_CHILDREN_KEY,
                        });
                        treeUtil.treeMove(dragSource.rowKey, dragTarget.rowKey, this.dragPosition);
                        this.ctx.database.setData(treeUtil.getTree());
                    }

                } catch { }
            }
            this.ctx.dragRowIng = false;
            this.dragSource = null;
            this.dragTarget = null;
            this.dragPosition = 'after';
            this.dragRowDiff = 0;
            this.ctx.stageElement.style.cursor = 'default';
            this.ctx.emit('draw');
        });
        this.ctx.on('mousemove', (e) => {
            if (!this.isDragRowValid()) {
                return;
            }
            const { offsetY } = this.ctx.getOffset(e);
            const { drawY } = this.dragTarget as Cell;
            if (drawY < offsetY || drawY > offsetY) {
                this.ctx.startAdjustPosition(e);
            } else {
                this.ctx.stopAdjustPosition();
            }
        });
        this.ctx.on('cellMouseenter', (cell) => {
            this.dragTarget = cell;
            if (!this.isDragRowValid()) {
                return;
            }
            const { ENABLE_DRAG_ROW_CROSS_LEVEL } = this.ctx.config;
            const dragSource = this.dragSource as Cell;
            const dragTarget = this.dragTarget as Cell;
            // 不启用跨级拖拽时，判断是否在同一级
            if (!ENABLE_DRAG_ROW_CROSS_LEVEL && dragSource.parentRowKey !== dragTarget.parentRowKey) {
                this.ctx.stageElement.style.cursor = 'not-allowed';
                return;
            }
            this.ctx.stageElement.style.cursor = 'grabbing';
            this.dragTarget = cell;
            const { drawY, visibleHeight } = cell;
            const scopeHeight = ENABLE_DRAG_ROW_CROSS_LEVEL ? visibleHeight / 3 : visibleHeight / 2;
            if (this.ctx.mouseY <= drawY + scopeHeight) {
                this.dragPosition = 'before';
            } else if (this.ctx.mouseY > drawY + visibleHeight - scopeHeight) {
                this.dragPosition = 'after';
            } else {
                this.dragPosition = 'inside';
            }
            this.ctx.emit('draw');
        });
    }
    private resizeRow(row: Row, diff: number) {
        const { rowIndex, height, rowKey, data } = row;
        this.ctx.database.setRowHeight(rowIndex, height + diff);
        this.init();
        this.ctx.emit('draw');
        this.ctx.emit('resizeRowChange', {
            rowIndex,
            oldHeight: height,
            height: height + diff,
            rowKey,
            row: data,
            data: this.data,
        });
    }
    private drawTipLine() {
        if (this.isResizing && this.resizeTarget) {
            const {
                stageWidth,
                scrollY,
                config: { RESIZE_ROW_LINE_COLOR },
            } = this.ctx;
            const resizeTargetDrawY = this.resizeTarget.y - scrollY;
            const resizeTargetHeight = this.resizeTarget.height;
            const y = resizeTargetDrawY + resizeTargetHeight + this.resizeDiff - 0.5;
            const poins = [0, y - 0.5, stageWidth, y - 0.5];
            this.ctx.paint.drawLine(poins, {
                borderColor: RESIZE_ROW_LINE_COLOR,
                borderWidth: 1,
            });
        }
    }
    // 拖拽提示线绘制
    drawDragRowTip() {
        if (this.ctx.dragRowIng && this.dragTarget && this.dragSource) {
            const {
                stageWidth,
                config: { DRAG_ROW_TIP_LINE_COLOR, DRAG_TIP_BG_COLOR },
            } = this.ctx;
            const rh = this.dragSource.visibleHeight;
            // 提示背景
            this.ctx.paint.drawRect(0, this.ctx.mouseY - this.dragRowDiff, this.visibleWidth, rh, {
                fillColor: DRAG_TIP_BG_COLOR,
                borderWidth: 0,
                borderColor: 'transparent',
            });
            const dragTargetDrawY = this.dragTarget.drawY;
            const dragTargetHeight = this.dragTarget.height;
            // 默认上方
            let y = dragTargetDrawY;
            if (['before', 'after'].includes(this.dragPosition)) {
                if (this.dragPosition === 'after') {
                    y = dragTargetDrawY + dragTargetHeight;
                }
                const poins = [0, y - 0.5, stageWidth, y - 0.5];
                this.ctx.paint.drawLine(poins, {
                    borderColor: DRAG_ROW_TIP_LINE_COLOR,
                    borderWidth: 1.2,
                });
            }
            // 中间位置
            if (['inside'].includes(this.dragPosition)) {
                y = dragTargetDrawY + dragTargetHeight / 2;
            }
            // 倒三角形
            const trianglePoins = [0, y - 4, 6, y, 0, y + 4, 0, y - 4];
            this.ctx.paint.drawLine(trianglePoins, {
                borderColor: DRAG_ROW_TIP_LINE_COLOR,
                borderWidth: 1.2,
                fillColor: DRAG_ROW_TIP_LINE_COLOR,
            });
        }
    }
    private drawFixedShadow() {
        const {
            fixedLeftWidth,
            fixedRightWidth,
            scrollX,
            header,
            stageWidth,
            config: { HEADER_BG_COLOR, SCROLLER_TRACK_SIZE },
        } = this.ctx;

        if (scrollX > 0 && fixedLeftWidth !== 0 && !this.ctx.isEmpty) {
            this.ctx.paint.drawShadow(this.x, this.y, fixedLeftWidth, this.height, {
                fillColor: HEADER_BG_COLOR,
                side: 'right',
                shadowWidth: 4,
                colorStart: 'rgba(0,0,0,0.1)',
                colorEnd: 'rgba(0,0,0,0)',
            });
        }
        // 右边阴影
        if (
            scrollX < Math.floor(header.width - stageWidth - 1) &&
            fixedRightWidth !== SCROLLER_TRACK_SIZE &&
            !this.ctx.isEmpty
        ) {
            const x = header.width - (this.x + this.width) + stageWidth - fixedRightWidth;
            this.ctx.paint.drawShadow(x, this.y, fixedRightWidth, this.height, {
                fillColor: HEADER_BG_COLOR,
                side: 'left',
                shadowWidth: 4,
                colorStart: 'rgba(0,0,0,0)',
                colorEnd: 'rgba(0,0,0,0.1)',
            });
        }
    }
    private binarySearch(list: Position[], value: number) {
        let start = 0;
        let end = list.length - 1;
        let tempIndex = -1;
        while (start <= end) {
            let midIndex = Math.floor((start + end) / 2);
            let midValue = list[midIndex].bottom;
            if (midValue === value) {
                return midIndex;
            } else if (midValue < value) {
                start = midIndex + 1;
            } else {
                tempIndex = midIndex; // 记录当前的 midIndex
                end = midIndex - 1;
            }
        }
        return tempIndex;
    }
    update() {
        this.init();
        const {
            header,
            database,
            scrollY,
            config: { CELL_HEIGHT },
        } = this.ctx;
        const offset = scrollY;
        const { data, positions } = database.getData();
        // 更新最大行数
        this.ctx.maxRowIndex = data.length - 1;
        let _headIndex = this.binarySearch(positions, offset);
        let _tailIndex = this.binarySearch(positions, offset + this.visibleHeight);
        if (_tailIndex === -1) {
            _tailIndex = this.ctx.maxRowIndex;
        }
        // 解决性能问题,设置数据时又设置滚动条可能导致虚拟滚动计算错误
        if (_headIndex === -1 && _tailIndex === this.ctx.maxRowIndex) {
            const buffer = Math.floor(this.visibleHeight / CELL_HEIGHT);
            _headIndex = this.ctx.maxRowIndex - buffer;
        }
        this.headIndex = Math.max(0, _headIndex);
        this.tailIndex = Math.min(this.ctx.maxRowIndex, _tailIndex + 1);
        this.visibleRows = data.slice(this.headIndex, this.tailIndex + 1);
        this.ctx.body.headIndex = this.headIndex;
        this.ctx.body.tailIndex = this.tailIndex;
        this.ctx.body.visibleRows = this.visibleRows;

        const rows: Row[] = [];
        for (let i = 0; i < this.visibleRows.length; i++) {
            const index = this.headIndex + i;
            const data = this.visibleRows[i];
            const { height, top } = this.ctx.database.getPositionForRowIndex(index);
            const row = new Row(this.ctx, index, 0, top + this.y, header.width, height, data);
            rows.push(row);
        }
        this.renderRows = rows;
        this.ctx.body.renderRows = rows;
    }
    updateAutoHeight(): boolean {
        const rows = this.ctx.body.renderRows;
        const hasAutoHeight = rows.some((row) => row.calculatedHeightCells.length > 0);
        // 如果没有计算格子，不更新
        if (!hasAutoHeight) {
            return false;
        }
        // 更新计算高度
        rows.forEach((row) => {
            row.updateCalculatedHeight();
        });
        // 如果有计算格子，重新计算行高
        const heights = rows.map((row) => ({
            height: row.calculatedHeight,
            rowIndex: row.rowIndex,
        }));
        return this.ctx.database.setBatchCalculatedRowHeight(heights);
    }
    draw() {
        // 容器背景
        this.renderRows.forEach((row) => {
            row.drawContainer();
        });
        this.renderRows.forEach((row) => {
            row.drawCenter();
        });
        this.drawFixedShadow();
        this.renderRows.forEach((row) => {
            row.drawFixedContainer();
        });
        this.renderRows.forEach((row) => {
            row.drawFixed();
        });
        this.drawTipLine();
    }
}
