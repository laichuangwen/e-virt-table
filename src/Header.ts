import Context from './Context';
import { getMaxRow, calCrossSpan, toLeaf, sortFixed, throttle } from './util';
import CellHeader from './CellHeader';
import type { Column } from './types';
export default class Header {
    private ctx: Context; // 上下文
    private x = 0; // x坐标
    private y = 0; // y坐标
    private width = 0; // 宽度
    private height = 0; // 高度
    private resizeTarget: CellHeader | null = null; //调整表头
    private resizeNum = 0; // 调整列的数量
    private isResizing = false; // 是否移动中
    private clientX = 0; // 鼠标按下时的x轴位置
    private resizeDiff = 0; // 是否移动中
    private columnIndex = 0;
    private isMouseDown = false; // 是否按下
    private columns: any;
    private visibleLeafColumns: any[] = [];
    private visibleHeight = 0;
    private visibleWidth = 0;
    private allCellHeaders: CellHeader[] = [];
    private leafCellHeaders: CellHeader[] = [];
    private renderLeafCellHeaders: CellHeader[] = [];
    private fixedLeftCellHeaders: CellHeader[] = [];
    private centerCellHeaders: CellHeader[] = [];
    private fixedRightCellHeaders: CellHeader[] = [];
    private renderCenterCellHeaders: CellHeader[] = [];
    private renderFixedCellHeaders: CellHeader[] = [];
    constructor(ctx: Context) {
        this.ctx = ctx;
        // 监听表头重置,窗口变化
        this.ctx.on(
            'resetHeader',
            throttle(() => {
                this.init();
                this.ctx.emit('draw');
            }, 100),
        );
        this.init();
        // 初始化调整列大小ENABLE_RESIZE_COLUMN
        this.initResizeColumn();
    }
    init() {
        const {
            config: { HEADER_HEIGHT, SCROLLER_TRACK_SIZE },
        } = this.ctx;
        const columns = this.ctx.database.getColumns();
        this.columns = columns;
        this.allCellHeaders = [];
        this.leafCellHeaders = [];
        this.fixedLeftCellHeaders = [];
        this.fixedRightCellHeaders = [];
        this.centerCellHeaders = [];
        const maxHeaderRow = getMaxRow(columns);
        const leafColumns = toLeaf(columns);
        this.height = HEADER_HEIGHT * maxHeaderRow;
        this.width = leafColumns.reduce((sum, _item) => sum + (_item?.width || 100), 0);
        this.visibleHeight = this.height;
        const spanColumns = sortFixed(calCrossSpan(columns, maxHeaderRow));
        this.columnIndex = 0;
        this.resizeNum = 0; // 可调整调整列数量
        this.render(spanColumns, 0);
        this.ctx.database.updateColIndexKeyMap(this.leafCellHeaders);
        const containerElement = this.ctx.containerElement.getBoundingClientRect();
        // 如果有可调整列，宽度等于容器宽度
        if (this.resizeNum > 0) {
            // this.ctx.canvasElement.width = containerElement.width;
            this.ctx.stageWidth = Math.floor(containerElement.width);
        } else {
            // this.ctx.canvasElement.width = this.width + SCROLLER_TRACK_SIZE - 1;
            this.ctx.stageWidth = Math.floor(this.width + SCROLLER_TRACK_SIZE);
        }
        this.ctx.stageElement.style.width = this.ctx.stageWidth - 0.5 + 'px';
        this.visibleWidth = this.ctx.stageWidth - SCROLLER_TRACK_SIZE;

        // 如果表头宽度小于可视宽度，平均分配
        const overWidth = this.visibleWidth - this.width;
        if (this.resizeNum && overWidth > 0) {
            const diff = Math.floor((overWidth / this.resizeNum) * 100) / 100;
            this.resizeAllColumn(diff);
        }
        const leafLeftCellHeaders = this.fixedLeftCellHeaders.filter((item) => !item.hasChildren);
        this.ctx.fixedLeftWidth = leafLeftCellHeaders.reduce((sum, _item) => sum + _item.width, 0);
        const leafRightCellHeaders = this.fixedRightCellHeaders.filter((item) => !item.hasChildren);
        this.ctx.fixedRightWidth = leafRightCellHeaders.reduce((sum, _item) => sum + _item.width, SCROLLER_TRACK_SIZE);
        // 更新最大列索引
        this.ctx.maxColIndex = this.leafCellHeaders.length - 1;
        this.ctx.header.x = this.x;
        this.ctx.header.y = this.y;
        this.ctx.header.width = this.width;
        this.ctx.header.height = this.height;
        this.ctx.header.visibleWidth = this.visibleWidth;
        this.ctx.header.visibleHeight = this.visibleHeight;
    }
    // 调整表头的宽度
    private initResizeColumn() {
        const {
            config: { ENABLE_RESIZE_COLUMN },
        } = this.ctx;
        if (!ENABLE_RESIZE_COLUMN) {
            return;
        }
        this.ctx.on('mousedown', (e) => {
            if (!this.ctx.isTarget(e)) {
                return;
            }
            this.clientX = e.clientX;
            if (this.resizeTarget) {
                this.isResizing = true;
                this.ctx.columnResizing = true;
            } else {
                this.isResizing = false;
            }
            this.isMouseDown = true;
        });
        this.ctx.on('mouseup', () => {
            this.isMouseDown = false;
            // 清空
            if (this.resizeDiff !== 0 && this.resizeTarget) {
                // 调整宽度
                this.resizeColumn(this.resizeTarget, this.resizeDiff);
            }
            this.resizeTarget = null;
            this.isResizing = false;
            this.ctx.columnResizing = false;
            this.clientX = 0;
        });
        this.ctx.on('mousemove', (e) => {
            // 编辑中不触发mousemove
            if (this.ctx.editing) return;
            const {
                stageWidth,
                config: { RESIZE_COLUMN_MIN_WIDTH },
            } = this.ctx;
            // 鼠标移动
            if (this.isResizing && this.resizeTarget) {
                const resizeTargetWidth = this.resizeTarget.width;
                let diff = e.clientX - this.clientX;
                if (diff + resizeTargetWidth < RESIZE_COLUMN_MIN_WIDTH) {
                    diff = -(resizeTargetWidth - RESIZE_COLUMN_MIN_WIDTH);
                }
                this.resizeDiff = diff;
                this.ctx.emit('draw');
            } else {
                this.resizeTarget = null;
                // 按下时不改变样式，有可能是多选表头
                if (this.isMouseDown) {
                    return;
                }
                // 鼠标在表头上,边界处理
                if (e.offsetX < 0 || e.offsetX > this.visibleWidth) {
                    if (this.ctx.stageElement.style.cursor === 'col-resize') {
                        this.ctx.stageElement.style.cursor = 'default';
                    }
                    return;
                }
                // 恢复默认样式
                if (this.ctx.stageElement.style.cursor === 'col-resize') {
                    this.ctx.stageElement.style.cursor = 'default';
                }
                // 渲染的表头
                const renderAllCellHeaders = [...this.renderFixedCellHeaders, ...this.renderCenterCellHeaders];
                for (const col of renderAllCellHeaders) {
                    const { offsetX, offsetY } = this.ctx.getOffset(e);
                    const x = offsetX;
                    const drawX = col.getDrawX();
                    if (
                        x > drawX + col.width - 5 &&
                        x < drawX + col.width + 4 &&
                        x < stageWidth - 4 && // 视窗中最后一列不允许调整宽
                        col.colspan <= 1 // 父级表头不触发
                    ) {
                        // 在表头内
                        if (this.ctx.isTarget(e) && offsetY <= this.height) {
                            this.ctx.stageElement.style.cursor = 'col-resize';
                            this.resizeTarget = col;
                        }
                    }
                }
            }
        });
    }
    private resizeColumn(cell: CellHeader, diff: number) {
        const setWidth = (columns: any[]) => {
            columns.forEach((column: any) => {
                if (column.children && column.children.length > 0) {
                    setWidth(column.children);
                }
                if (column.key === cell.key) {
                    const width = column.width || 100;
                    column.width = width + diff;
                }
            });
        };
        setWidth(this.columns);
        this.ctx.database.setColumns(this.columns);
        this.init();
        this.ctx.emit('draw');
        let overDiff = 0;
        // 如果表头宽度小于可视宽度，平均分配
        if (this.width < this.visibleWidth) {
            const overWidth = this.visibleWidth - this.width;
            overDiff = Math.floor((overWidth / this.resizeNum) * 100) / 100;
            this.resizeAllColumn(overDiff);
            this.ctx.emit('draw');
        }
        this.ctx.emit('resizeColumnChange', {
            colIndex: cell.colIndex,
            key: cell.key,
            oldWidth: cell.width,
            width: cell.width + diff + overDiff,
            column: cell.column,
            columns: this.columns,
        });
    }
    resizeAllColumn(fellWidth: number) {
        if (fellWidth === 0) return;
        const widthMap = new Map();
        // 存需要更改的宽度
        let isResize = true;
        for (const col of this.allCellHeaders) {
            if (col.widthFillDisable) {
                // 不允许调整宽度
                widthMap.set(col.key, col.width);
            } else {
                const width = col.width + fellWidth * col.colspan;
                widthMap.set(col.key, width);
                if (width < this.ctx.config.RESIZE_COLUMN_MIN_WIDTH) {
                    isResize = false;
                }
            }
        }
        // 如果有小于RESIZE_COLUMN_MIN_WIDTH的列，不允许调整
        if (!isResize) {
            return;
        }
        // 递归更改宽度
        const uptateWidth = (columns: Column[]) => {
            columns.forEach((column: Column) => {
                if (widthMap.has(column.key)) {
                    column.width = widthMap.get(column.key);
                }
                if (column.children && column.children.length > 0) {
                    uptateWidth(column.children);
                }
            });
        };
        uptateWidth(this.columns);
        this.ctx.database.setColumns(this.columns);
        this.init();
        // this.ctx.emit("draw");
    }

    private render(arr: Column[], originX: number) {
        const len = arr.length;
        let everyOffsetX = originX;
        const { HEADER_HEIGHT = 0 } = this.ctx.config;
        for (let i = 0; i < len; i++) {
            const item = arr[i];
            const height = HEADER_HEIGHT * (item.rowspan || 0);
            const y = HEADER_HEIGHT * (item.level || 0);
            let width = item.width || 100; // 读取映射宽度
            if (item.children) {
                // 父级表头的宽度是叶子节点表头的宽度总和
                const _arr = toLeaf(item.children);
                width = _arr.reduce((sum, _item) => sum + (_item?.width || 100), 0);
            }
            const cellHeader = new CellHeader(this.ctx, this.columnIndex, everyOffsetX, y, width, height, item);
            // 设置表头
            this.ctx.database.setHeader(item.key, cellHeader);
            this.allCellHeaders.push(cellHeader);
            if (!item.children) {
                this.leafCellHeaders.push(cellHeader);
                if (!cellHeader.column.widthFillDisable) {
                    this.resizeNum++;
                }
            }
            if (item.fixed === 'left') {
                this.fixedLeftCellHeaders.push(cellHeader);
            } else if (item.fixed === 'right') {
                this.fixedRightCellHeaders.push(cellHeader);
            } else {
                this.centerCellHeaders.push(cellHeader);
            }
            !item.children && this.columnIndex++;
            item.children && this.render(item.children, everyOffsetX);
            everyOffsetX += width;
        }
    }

    private drawTipLine() {
        if (this.isResizing && this.resizeTarget) {
            const {
                stageHeight,
                config: { RESIZE_COLUMN_LINE_COLOR },
            } = this.ctx;
            const resizeTargetDrawX = this.resizeTarget.getDrawX();
            const resizeTargetWidth = this.resizeTarget.width;
            const x = resizeTargetDrawX + resizeTargetWidth + this.resizeDiff - 0.5;
            const poins = [x - 0.5, 0, x - 0.5, stageHeight];
            this.ctx.paint.drawLine(poins, {
                borderColor: RESIZE_COLUMN_LINE_COLOR,
                borderWidth: 1,
            });
        }
    }
    private drawFiexShadow() {
        const {
            fixedLeftWidth,
            fixedRightWidth,
            scrollX,
            header,
            stageWidth,
            config: { HEADER_BG_COLOR, SCROLLER_TRACK_SIZE },
        } = this.ctx;

        if (scrollX > 0 && fixedLeftWidth !== 0) {
            this.ctx.paint.drawShadow(this.x, this.y, fixedLeftWidth, this.height, {
                fillColor: HEADER_BG_COLOR,
                side: 'right',
                shadowWidth: 4,
                colorStart: 'rgba(0,0,0,0.1)',
                colorEnd: 'rgba(0,0,0,0)',
            });
        }
        // 右边阴影
        if (scrollX < Math.floor(header.width - stageWidth - 1) && fixedRightWidth !== SCROLLER_TRACK_SIZE) {
            const x = header.width - (this.x + this.width) + stageWidth - fixedRightWidth;
            this.ctx.paint.drawShadow(x + 1, this.y, fixedRightWidth, this.height, {
                fillColor: HEADER_BG_COLOR,
                side: 'left',
                shadowWidth: 4,
                colorStart: 'rgba(0,0,0,0)',
                colorEnd: 'rgba(0,0,0,0.1)',
            });
        }
    }
    update() {
        const renderLeafCellHeaders: CellHeader[] = [];
        const renderCenterCellHeaders: CellHeader[] = [];
        const renderFixedCellHeaders: CellHeader[] = [];
        this.centerCellHeaders.forEach((item) => {
            if (item.isHorizontalVisible() && item.isVerticalVisible()) {
                renderCenterCellHeaders.push(item);
                if (!item.hasChildren) {
                    renderLeafCellHeaders.push(item);
                }
            }
        });
        this.fixedLeftCellHeaders.forEach((item) => {
            renderFixedCellHeaders.push(item);
            if (!item.hasChildren) {
                renderLeafCellHeaders.push(item);
            }
        });
        this.fixedRightCellHeaders.forEach((item) => {
            renderFixedCellHeaders.push(item);
            if (!item.hasChildren) {
                renderLeafCellHeaders.push(item);
            }
        });
        this.renderCenterCellHeaders = renderCenterCellHeaders;
        this.renderFixedCellHeaders = renderFixedCellHeaders;
        this.renderLeafCellHeaders = renderLeafCellHeaders.sort((a, b) => a.x - b.x);
        this.visibleLeafColumns = this.renderLeafCellHeaders.map((item) => item.column);

        this.ctx.header.visibleLeafColumns = this.visibleLeafColumns;
        this.ctx.header.leafCellHeaders = this.leafCellHeaders;
        this.ctx.header.renderLeafCellHeaders = this.renderLeafCellHeaders;
        this.ctx.header.renderCellHeaders = this.renderFixedCellHeaders.concat(this.renderCenterCellHeaders);
    }
    draw() {
        this.renderCenterCellHeaders.forEach((item) => {
            item.update();
            item.draw();
        });
        this.drawFiexShadow();
        this.renderFixedCellHeaders.forEach((item) => {
            item.update();
            item.draw();
        });
        this.drawTipLine();
    }
}
