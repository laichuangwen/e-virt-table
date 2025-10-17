import Context from './Context';
import { getMaxRow, calCrossSpan, toLeaf, sortFixed, throttle, filterHiddenColumns, deepClone } from './util';
import CellHeader from './CellHeader';
import type { Column, ColumnDragChangeEvent } from './types';
import { TreeUtil } from './TreeUtil';
export default class Header {
    private ctx: Context; // 上下文
    private x = 0; // x坐标
    private y = 0; // y坐标
    private width = 0; // 宽度
    private height = 0; // 高度
    private resizeTarget: CellHeader | null = null; //调整表头
    private dragTarget: CellHeader | null = null; //拖拽表头
    private dragingCell: CellHeader | undefined = undefined; //拖拽表头进入的格子
    private dragCellDiff = 0; //拖拽表头
    private resizeNum = 0; // 调整列的数量
    private isResizing = false; // 是否移动中
    private clientX = 0; // 鼠标按下时的x轴位置
    private resizeDiff = 0; // 是否移动中
    private columnIndex = 0;
    private isMouseDown = false; // 是否按下
    private columns: any;
    private visibleColumns: any;
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
                this.ctx.clearSelector();
                this.ctx.emit('draw');
            }, 100),
        );
        this.init();
        // 初始化调整列大小ENABLE_RESIZE_COLUMN
        this.initResizeColumn();
        this.initDragColumn();
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

        this.visibleHeight = this.height;
        this.visibleColumns = filterHiddenColumns(columns);
        const maxHeaderRow = getMaxRow(this.visibleColumns);
        const leafColumns = toLeaf(this.visibleColumns);
        this.height = HEADER_HEIGHT * maxHeaderRow;
        this.width = leafColumns.reduce((sum, _item) => {
            const width = _item.width || 100;
            const { maxWidth, minWidth } = _item;
            if (maxWidth && width > maxWidth) {
                return sum + maxWidth;
            }
            if (minWidth && width < minWidth) {
                return sum + minWidth;
            }
            return sum + width;
        }, 0);
        this.columnIndex = 0;
        this.resizeNum = 0; // 可调整调整列数量
        const spanColumns = sortFixed(calCrossSpan(this.visibleColumns, maxHeaderRow));
        this.render(spanColumns, 0);
        this.ctx.database.updateColIndexKeyMap(this.leafCellHeaders);
        const containerElement = this.ctx.containerElement.getBoundingClientRect();
        // 如果有可调整列，宽度等于容器宽度
        if (this.resizeNum > 0) {
            this.ctx.stageWidth = Math.floor(containerElement.width);
        } else {
            this.ctx.stageWidth = Math.min(
                Math.floor(this.width + SCROLLER_TRACK_SIZE),
                Math.floor(containerElement.width),
            );
        }
        this.ctx.stageElement.style.width = this.ctx.stageWidth + 'px';
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
        this.ctx.header.allCellHeaders = this.allCellHeaders;
        this.ctx.header.visibleWidth = this.visibleWidth;
        this.ctx.header.visibleHeight = this.visibleHeight;
    }
    // 调整表头的宽度
    private initResizeColumn() {
        this.ctx.on('mousedown', (e) => {
            if (!this.ctx.config.ENABLE_RESIZE_COLUMN) {
                return;
            }
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
            if (!this.ctx.config.ENABLE_RESIZE_COLUMN) {
                return;
            }
            this.isMouseDown = false;
            // 清空
            if (this.resizeDiff !== 0 && this.resizeTarget) {
                // 调整宽度
                this.resizeColumn(this.resizeTarget, this.resizeDiff);
            }
            this.resizeTarget = null;
            this.isResizing = false;
            this.isMouseDown = false;
            this.ctx.columnResizing = false;
            this.clientX = 0;
            this.resizeDiff = 0;
        });
        this.ctx.on('mousemove', (e) => {
            if (!this.ctx.config.ENABLE_RESIZE_COLUMN) {
                return;
            }
            // 编辑中不触发mousemove
            if (this.ctx.editing) return;
            const {
                stageWidth,
                config: { RESIZE_COLUMN_MIN_WIDTH },
            } = this.ctx;
            // 鼠标移动
            if (this.isResizing && this.resizeTarget) {
                const resizeTargetWidth = this.resizeTarget.width;
                const resizeTargetMinWidth = this.resizeTarget.minWidth;
                const resizeTargetMaxWidth = this.resizeTarget.maxWidth;
                let diff = e.clientX - this.clientX;
                if (diff + resizeTargetWidth < RESIZE_COLUMN_MIN_WIDTH) {
                    diff = -(resizeTargetWidth - RESIZE_COLUMN_MIN_WIDTH);
                }
                if (resizeTargetMinWidth && diff + resizeTargetWidth < resizeTargetMinWidth) {
                    diff = -(resizeTargetWidth - resizeTargetMinWidth);
                }
                if (resizeTargetMaxWidth && diff + resizeTargetWidth > resizeTargetMaxWidth) {
                    diff = resizeTargetMaxWidth - resizeTargetWidth;
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
                    const y = offsetY;
                    const drawX = col.getDrawX();
                    const drawY = col.getDrawY();
                    if (
                        x > drawX + col.width - 5 &&
                        x < drawX + col.width + 4 &&
                        x < stageWidth - 4 && // 视窗中最后一列不允许调整宽
                        y > drawY
                    ) {
                        const colIndex = col.colIndex + col.colspan - 1;
                        const resizeTarget = this.leafCellHeaders.find((item) => item.colIndex === colIndex);
                        if (!resizeTarget) {
                            return;
                        }
                        // 中间部分到固定位置
                        if (!resizeTarget.fixed && this.ctx.stageWidth - this.ctx.fixedRightWidth < drawX + col.width) {
                            return;
                        }
                        // 在表头内
                        if (this.ctx.isTarget(e) && offsetY <= this.height) {
                            this.ctx.stageElement.style.cursor = 'col-resize';
                            this.resizeTarget = resizeTarget;
                        }
                    }
                }
            }
        });
    }
    private initDragColumn() {
        this.ctx.on('cellHeaderMousedown', (cellHeader) => {
            if (!this.ctx.config.ENABLE_DRAG_COLUMN) {
                return;
            }
            if (cellHeader.column.dragDisabled) {
                return;
            }
            if (this.dragTarget === cellHeader) {
                this.ctx.dragHeaderIng = true;
                this.dragCellDiff = this.ctx.mouseX - cellHeader.drawX;
                this.ctx.stageElement.style.cursor = 'grabbing';
            } else {
                this.dragTarget = cellHeader;
                this.ctx.dragHeaderIng = false;
            }
        });
        this.ctx.on('cellMousedown', () => {
            if (!this.ctx.config.ENABLE_DRAG_COLUMN) {
                return;
            }
            this.dragTarget = null;
            this.ctx.dragHeaderIng = false;
        });
        this.ctx.on('mouseup', () => {
            if (!this.ctx.config.ENABLE_DRAG_COLUMN) {
                return;
            }
            if (this.dragingCell && this.dragTarget) {
                // 需要移动
                const genSortObj = (columns: Column[], obj: any = {}) => {
                    columns.forEach((item: Column, index): any => {
                        if (item.children) {
                            genSortObj(item.children, obj);
                        }
                        obj[item.key] = index;
                    });
                    return obj;
                };
                const columns = this.ctx.database.getColumns();
                const sortColumns = calCrossSpan(columns, getMaxRow(columns));
                const tree = new TreeUtil(deepClone(sortColumns), {
                    key: 'key', // 节点唯一标识字段（对应我们之前的field）
                    childrenKey: 'children', // 子节点数组字段
                });
                const position = this.dragTarget.colIndex > this.dragingCell.colIndex ? 'before' : 'after';
                tree.treeMove(this.dragTarget.column, this.dragingCell.column, position);
                const columnsTree = tree.getTree();
                const sortData = genSortObj(columnsTree);
                this.ctx.database.setCustomHeader({ sortData });
                this.ctx.database.init(false);
                this.init();
                const data: ColumnDragChangeEvent = {
                    source: this.dragTarget,
                    target: this.dragingCell,
                    columns: sortColumns,
                };
                this.ctx.emit('columnDragChange', data);
            }
            if (this.ctx.dragHeaderIng && this.dragTarget) {
                this.ctx.dragHeaderIng = false;
                this.dragTarget = null;
                this.dragingCell = undefined;
                this.dragCellDiff = 0;
                this.ctx.clearSelector();
                this.ctx.focusCellHeader = undefined;
                this.ctx.stageElement.style.cursor = 'default';
                this.ctx.emit('draw');
            }
        });
        this.ctx.on('mousemove', (e) => {
            if (!this.ctx.config.ENABLE_DRAG_COLUMN) {
                return;
            }
            if (!this.ctx.dragHeaderIng || !this.dragTarget) {
                return;
            }
            if (!this.dragTarget.fixed) {
                this.ctx.startAdjustPosition(e);
            }
            this.ctx.emit('draw');
        });
        this.ctx.on('cellHoverChange', (cell) => {
            if (!this.ctx.config.ENABLE_DRAG_COLUMN) {
                return;
            }
            if (cell.column.dragDisabled) {
                return;
            }
            this.dragingCell = this.getDragCellHeader(cell.colIndex);
        });
        this.ctx.on('cellHeaderHoverChange', (cellHeader) => {
            if (!this.ctx.config.ENABLE_DRAG_COLUMN) {
                return;
            }
            if (cellHeader.column.dragDisabled) {
                return;
            }
            this.dragingCell = this.getDragCellHeader(cellHeader.colIndex);
        });
    }

    private getDragCellHeader(colIndex: number) {
        if (!this.dragTarget || !this.ctx.dragHeaderIng) {
            return;
        }
        // 同级别
        const {
            column: { parentKey },
            key,
            level,
            fixed,
        } = this.dragTarget;

        const dragCellHeader = this.allCellHeaders.find(
            (item) =>
                item.key !== key &&
                item.fixed === fixed &&
                item.column.level === level &&
                item.column.parentKey === parentKey &&
                item.colIndex <= colIndex &&
                item.colIndex + item.colspan - 1 >= colIndex,
        );
        if (this.ctx.dragHeaderIng) {
            const cursor = dragCellHeader ? 'grabbing' : 'not-allowed';
            // 禁用拖拽
            this.ctx.stageElement.style.cursor = cursor;
        }
        return dragCellHeader;
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
        let overDiff = 0;
        // 如果表头宽度小于可视宽度，平均分配
        if (this.width < this.visibleWidth) {
            const overWidth = this.visibleWidth - this.width;
            overDiff = Math.floor((overWidth / this.resizeNum) * 100) / 100;
            this.resizeAllColumn(overDiff);
        }
        const width = cell.width + diff + overDiff;
        this.ctx.emit('resizeColumnChange', {
            colIndex: cell.colIndex,
            key: cell.key,
            oldWidth: cell.width,
            width: width,
            column: cell.column,
            columns: this.columns,
        });
        this.ctx.database.setCustomHeaderResizableData(cell.key, width);
        this.ctx.database.init(false);
        this.init();
        this.ctx.emit('draw');
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
    getCustomHeader() {
        const columns = this.ctx.database.getColumns();
        const customHeader = this.ctx.database.getCustomHeader();
        const { sortData = {} } = customHeader;
        if (Object.keys(sortData).length === 0) {
            return {
                columns,
                customHeader,
            };
        }
        const _sortColumns = calCrossSpan(columns, getMaxRow(columns));
        return {
            columns: _sortColumns,
            customHeader,
        };
    }
    private render(arr: Column[], originX: number) {
        const len = arr.length;
        let everyOffsetX = originX;
        const { HEADER_HEIGHT = 0 } = this.ctx.config;
        for (let i = 0; i < len; i++) {
            const item = arr[i];
            const height = HEADER_HEIGHT * (item.rowspan || 0);
            const y = HEADER_HEIGHT * (item.level || 0);
            let { minWidth, maxWidth } = item;
            let width = item.width || 100; // 读取映射宽度
            if (minWidth && width < minWidth) {
                width = minWidth;
            }
            if (maxWidth && width > maxWidth) {
                width = maxWidth;
            }
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
                config: {
                    RESIZE_COLUMN_LINE_COLOR,
                    RESIZE_COLUMN_TEXT_COLOR,
                    RESIZE_COLUMN_TEXT_BG_COLOR,
                    ENABLE_RESIZE_COLUMN_TEXT,
                },
            } = this.ctx;
            const resizeTargetDrawX = this.resizeTarget.getDrawX();
            const resizeTargetWidth = this.resizeTarget.width;
            const x = resizeTargetDrawX + resizeTargetWidth + this.resizeDiff - 0.5;
            const poins = [x - 0.5, 0, x - 0.5, stageHeight];
            this.ctx.paint.drawLine(poins, {
                borderColor: RESIZE_COLUMN_LINE_COLOR,
            });
            if (ENABLE_RESIZE_COLUMN_TEXT) {
                const newWidth = Math.floor(resizeTargetWidth + this.resizeDiff);
                const text = `${newWidth}px`;
                const rw = 45;
                const rh = 24;
                this.ctx.paint.drawRect(x + rw / 2, this.ctx.mouseY - rh / 2, rw, rh, {
                    fillColor: RESIZE_COLUMN_TEXT_BG_COLOR,
                    borderWidth: 0,
                    borderColor: 'transparent',
                });
                this.ctx.paint.drawText(text, x + rw / 2, this.ctx.mouseY - rh / 2, rw, rh + 2, {
                    padding: 0,
                    color: RESIZE_COLUMN_TEXT_COLOR,
                    align: 'center',
                    verticalAlign: 'middle',
                });
            }
        }
    }
    private drawDragTip() {
        if (this.dragTarget && this.ctx.dragHeaderIng) {
            const { DRAG_TIP_BG_COLOR, DRAG_TIP_LINE_COLOR } = this.ctx.config;
            const rw = this.dragTarget.width;
            // 提示背景
            this.ctx.paint.drawRect(
                this.ctx.mouseX - this.dragCellDiff,
                this.visibleHeight,
                rw,
                this.ctx.body.visibleHeight,
                {
                    fillColor: DRAG_TIP_BG_COLOR,
                    borderWidth: 0,
                    borderColor: 'transparent',
                },
            );
            if (this.dragingCell) {
                const { drawX, drawY, visibleWidth, colIndex } = this.dragingCell;
                // 向坐移动
                let x = drawX;
                let y = drawY;
                if (colIndex > this.dragTarget.colIndex) {
                    // 向右移动
                    x = drawX + visibleWidth;
                }
                // 边界处理
                if (colIndex === 0) {
                    x = x + 1;
                }
                // 边界处理
                if (colIndex === this.ctx.maxColIndex) {
                    x = x - 1;
                }
                const poins = [x, y, x, this.ctx.stageHeight];
                // 倒三角形
                const trianglePoins = [x - 4, y, x + 4, y, x, y + 6, x - 4, y];
                this.ctx.paint.drawLine(trianglePoins, {
                    borderColor: DRAG_TIP_LINE_COLOR,
                    borderWidth: 1.2,
                    fillColor: DRAG_TIP_LINE_COLOR,
                });
                this.ctx.paint.drawLine(poins, {
                    borderColor: DRAG_TIP_LINE_COLOR,
                    borderWidth: 1.2,
                });
            }
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
            this.ctx.paint.drawShadow(x, this.y, fixedRightWidth, this.height, {
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
        // 中心的最后一个ColIndex
        if (this.centerCellHeaders.length) {
            const lastCenterCell = this.centerCellHeaders[this.centerCellHeaders.length - 1];
            this.ctx.lastCenterColIndex = lastCenterCell.colIndex;
        }
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
    drawBottomLine() {
        const {
            stageWidth,
            config: { BORDER_COLOR },
        } = this.ctx;
        const poins = [0, this.height, stageWidth, this.height];
        this.ctx.paint.drawLine(poins, {
            borderColor: BORDER_COLOR,
            borderWidth: 1,
        });
    }
    draw() {
        this.renderCenterCellHeaders.forEach((item) => {
            item.update();
            item.draw();
        });
        this.drawFixedShadow();
        this.renderFixedCellHeaders.forEach((item) => {
            item.update();
            item.draw();
        });
        this.drawBottomLine();
        this.drawTipLine();
        this.drawDragTip();
    }
}
