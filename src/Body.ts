import type Context from './Context';
import Row from './Row';
import ExtendRow from './ExtendRow';
import { Position } from './types';
export default class Body {
    private resizeTarget: Row | null = null; //调整行大小的目标
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
    private renderRows: (Row | ExtendRow)[] = [];
    private visibleRows: any[] = [];
    private visibleHeight = 0;
    private visibleWidth = 0;
    private containerRect: DOMRect | undefined;
    private data: any[] = [];
    private extendRowHeights = new Map<string, number>(); // 记录每个扩展行的实际高度
    private isUpdatingExtendHeight = false; // 防止高度更新循环
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
        this.initResizeRow();
        this.initExtendRowObserver();
    }
    
    /**
     * 初始化扩展行观察者
     */
    private initExtendRowObserver() {
        // 监听扩展行展开/收起
        this.ctx.on('rowExtendChange', (event: any) => {
            // 重新计算总高度
            this.updateTotalHeight();
            
            // 更新后续行的位置（在下次渲染时生效）
            this.updateRowPositionsAfterExtend(event.rowIndex, event.action);
            
            // 如果是展开操作，确保扩展行可见
            if (event.action === 'expand') {
                setTimeout(() => {
                    this.ensureExtendRowVisible(event.rowKey, event.rowIndex);
                }, 100);
            }
            
            // 触发重绘
            this.ctx.emit('draw');
        });
        
        // 监听扩展行高度变化
        this.ctx.on('extendRowHeightChange', (event: any) => {
            // 防止循环更新
            if (this.isUpdatingExtendHeight) {
                return;
            }
            
            this.isUpdatingExtendHeight = true;
            
            // 检查高度是否真的发生了变化
            const currentHeight = this.extendRowHeights.get(event.sourceRowKey);
            if (currentHeight === event.newHeight) {
                this.isUpdatingExtendHeight = false;
                return;
            }
            
            // 更新实际高度记录（这个方法内部会调用 updateTotalHeight）
            this.updateExtendRowHeight(event.sourceRowKey, event.newHeight);
            
            // 延迟触发重绘，避免同步循环
            setTimeout(() => {
                this.isUpdatingExtendHeight = false;
                // 高度变化后，确保扩展行仍然可见
                this.ensureExtendRowVisible(event.sourceRowKey, event.rowIndex);
                this.ctx.emit('draw');
            }, 16); // 约一帧的时间
        });
        
        // 监听清除所有扩展行高度
        this.ctx.on('clearAllExtendRowHeights', () => {
            this.extendRowHeights.clear();
        });
    }
    
    /**
     * 更新扩展行后续行的位置
     */
    private updateRowPositionsAfterExtend(_extendRowIndex: number, _action: 'expand' | 'collapse') {
        // 这里主要是为了在下次 update() 时正确计算 yOffset
        // 实际的位置更新会在 update() 方法中的 yOffset 计算中体现
    }
    
    /**
     * 确保扩展行在可视区域内
     */
    private ensureExtendRowVisible(rowKey: string, rowIndex: number) {
        const { height: rowHeight, top: rowTop } = this.ctx.database.getPositionForRowIndex(rowIndex);
        const extendHeight = this.extendRowHeights.get(rowKey) || 150;
        
        // 计算扩展行的实际位置
        const yOffset = this.calculateYOffsetForRow(rowIndex);
        const actualRowTop = rowTop + yOffset;
        const extendRowTop = actualRowTop + rowHeight;
        const extendRowBottom = extendRowTop + extendHeight;
        
        const visibleTop = this.ctx.scrollY;
        const visibleBottom = visibleTop + this.visibleHeight;
        
        // 如果扩展行不完全可见，滚动到合适位置
        if (extendRowBottom > visibleBottom) {
            // 扩展行底部超出可视区域，向下滚动
            const newScrollY = extendRowBottom - this.visibleHeight + 20; // 留20px边距
            this.ctx.setScrollY(newScrollY);
        } else if (extendRowTop < visibleTop) {
            // 扩展行顶部在可视区域上方，向上滚动
            const newScrollY = extendRowTop - 20; // 留20px边距
            this.ctx.setScrollY(newScrollY);
        }
    }
    
    /**
     * 计算指定行之前所有扩展行的累积高度偏移
     */
    private calculateYOffsetForRow(rowIndex: number): number {
        let yOffset = 0;
        
        // 遍历所有展开的行，计算在当前行之前的扩展行高度
        this.ctx.rowExtendMap.forEach((_colKey, rowKey) => {
            const extendRowIndex = this.ctx.database.getRowIndexForRowKey(rowKey);
            
            // 如果扩展行在当前行之前，累加其高度
            if (extendRowIndex !== null && extendRowIndex!==undefined && extendRowIndex < rowIndex) {
                // 使用实际记录的高度，如果没有记录则使用默认值
                const actualHeight = this.extendRowHeights.get(rowKey) || 150;
                yOffset += actualHeight;
            }
        });
        
        return yOffset;
    }
    
    /**
     * 更新扩展行的实际高度
     */
    private updateExtendRowHeight(sourceRowKey: string, newHeight: number) {
        const oldHeight = this.extendRowHeights.get(sourceRowKey) || 150;
        this.extendRowHeights.set(sourceRowKey, newHeight);
        
        
        // 立即更新总高度
        this.updateTotalHeight();
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
        // 更新高度（基础高度，不包含ExtendRow）
        this.height = sumHeight;
        // 更新数据
        this.data = data;
        // 更新宽度
        this.width = header.width;
        this.visibleWidth = this.ctx.stageWidth - SCROLLER_TRACK_SIZE;
        // 底部高度
        const footerHeight = this.ctx.footer.height;
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
    
    /**
     * 计算考虑扩展行影响的可见区域
     */
    private calculateVisibleRangeWithExtendRows(positions: any[], offset: number) {
        const { CELL_HEIGHT } = this.ctx.config;
        
        // 如果没有扩展行，使用原始逻辑
        if (this.ctx.rowExtendMap.size === 0) {
            let _headIndex = this.binarySearch(positions, offset);
            let _tailIndex = this.binarySearch(positions, offset + this.visibleHeight);
            if (_tailIndex === -1) {
                _tailIndex = this.ctx.maxRowIndex;
            }
            if (_headIndex === -1 && _tailIndex === this.ctx.maxRowIndex) {
                const buffer = Math.floor(this.visibleHeight / CELL_HEIGHT);
                _headIndex = this.ctx.maxRowIndex - buffer;
            }
            return {
                headIndex: Math.max(0, _headIndex),
                tailIndex: Math.min(this.ctx.maxRowIndex, _tailIndex + 1)
            };
        }
        
        // 有扩展行时，需要考虑扩展行对位置的影响
        let headIndex = -1;
        let tailIndex = -1;
        
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const rowKey = this.ctx.database.getRowKeyForRowIndex(i);
            
            // 计算当前行的实际位置（考虑之前扩展行的影响）
            const yOffsetBefore = this.calculateYOffsetForRow(i);
            const actualTop = position.top + yOffsetBefore;
            const actualBottom = actualTop + position.height;
            
            // 检查是否有扩展行
            const extendHeight = this.extendRowHeights.get(rowKey) || 0;
            const totalBottom = actualBottom + extendHeight;
            
            // 判断可见性
            if (headIndex === -1 && totalBottom > offset) {
                headIndex = i;
            }
            
            if (actualTop <= offset + this.visibleHeight) {
                tailIndex = i;
            } else {
                break;
            }
        }
        
        // 边界处理
        if (headIndex === -1) headIndex = 0;
        if (tailIndex === -1) tailIndex = this.ctx.maxRowIndex;
        
        // 扩展范围以确保不遗漏
        headIndex = Math.max(0, headIndex - 1);
        tailIndex = Math.min(this.ctx.maxRowIndex, tailIndex + 1);
        
        return { headIndex, tailIndex };
    }
    update() {
        this.init();
        const {
            header,
            database,
            scrollY,
            config: { CELL_HEIGHT: _CELL_HEIGHT },
        } = this.ctx;
        const offset = scrollY;
        const { data, positions } = database.getData();
        // 更新最大行数
        this.ctx.maxRowIndex = data.length - 1;
        
        // 计算考虑扩展行影响的可见区域
        const { headIndex, tailIndex } = this.calculateVisibleRangeWithExtendRows(positions, offset);
        this.headIndex = headIndex;
        this.tailIndex = tailIndex;
        this.visibleRows = data.slice(this.headIndex, this.tailIndex + 1);
        this.ctx.body.headIndex = this.headIndex;
        this.ctx.body.tailIndex = this.tailIndex;
        this.ctx.body.visibleRows = this.visibleRows;

        const rows: (Row | ExtendRow)[] = [];
        
        for (let i = 0; i < this.visibleRows.length; i++) {
            const index = this.headIndex + i;
            const data = this.visibleRows[i];
            const { height, top } = this.ctx.database.getPositionForRowIndex(index);
            
            // 计算当前行之前所有扩展行的累积高度偏移
            const yOffset = this.calculateYOffsetForRow(index);
            
            // 创建普通行，应用累积偏移
            const adjustedY = top + this.y + yOffset;
            const row = new Row(this.ctx, index, 0, adjustedY, header.width, height, data);
            rows.push(row);
            
            // 检查是否需要创建扩展行
            const extendRows = this.createExtendRowsForRow(row, data);
            if (extendRows.length > 0) {
                extendRows.forEach(extendRow => {
                    // 扩展行位于普通行之后
                    extendRow.y = row.y + row.height;
                    
                    // 如果已经有记录的高度，直接使用，避免重复计算
                    const recordedHeight = this.extendRowHeights.get(extendRow.sourceRowKey);
                    if (recordedHeight && recordedHeight > 0) {
                        extendRow.height = recordedHeight;
                    }
                    
                    extendRow.update();
                    rows.push(extendRow);
                });
            }
        }
        this.renderRows = rows;
        this.ctx.body.renderRows = rows;
        
        // 重新计算包含ExtendRow的总高度
        this.updateTotalHeight();
        
    }
    
    /**
     * 更新包含ExtendRow的总高度
     */
    private updateTotalHeight() {
        // 获取原始总高度
        const { sumHeight } = this.ctx.database.getData();
        
        // 计算所有扩展行的额外高度
        let extendRowsHeight = 0;
        this.ctx.rowExtendMap.forEach((_colKey, rowKey) => {
            // 使用实际记录的高度，如果没有记录则使用默认值
            const actualHeight = this.extendRowHeights.get(rowKey) || 150;
            extendRowsHeight += actualHeight;
        });
        
        const newTotalHeight = sumHeight + extendRowsHeight;
        
        
        // 更新body的总高度，这会影响滚动条
        this.height = newTotalHeight;
        
        // 更新 Context 中的 body 高度信息
        this.ctx.body.height = newTotalHeight;
        
        // 触发重绘以更新滚动条
        this.ctx.emit('draw');
    }

    /**
     * 为指定行创建扩展行
     */
    private createExtendRowsForRow(row: Row, data: any): ExtendRow[] {
        const extendRows: ExtendRow[] = [];
        const rowKey = row.rowKey;
        
        // 检查是否有扩展状态
        const extendColKey = this.ctx.getRowExtend(rowKey);
        if (!extendColKey) {
            return extendRows;
        }
        
        // 查找有extendRender的列
        const columns = this.ctx.header.visibleLeafColumns;
        const extendColumn = columns.find(col => col.key === extendColKey && col.extendRender);
        
        if (!extendColumn || !extendColumn.extendRender) {
            return extendRows;
        }
        
        // 检查是否满足扩展条件
        if (!this.ctx.config.AUTO_ROW_HEIGHT) {
            return extendRows;
        }
        
        if (['tree', 'selection-tree', 'tree-selection'].includes(extendColumn.type || '')) {
            return extendRows;
        }
        
        // 创建扩展行，使用更合理的默认高度
        const extendRow = new ExtendRow(
            this.ctx,
            rowKey,
            extendColKey,
            extendColumn.extendRender,
            row.rowIndex,
            0, // x位置
            row.y + row.height, // y位置在原行下方
            this.visibleWidth, // 占据整个可视宽度
            150, // 更合理的默认高度，会根据内容自动调整
            data
        );
        
        // 立即记录扩展行的初始高度
        if (!this.extendRowHeights.has(rowKey)) {
            this.extendRowHeights.set(rowKey, 150);
        }
        
        extendRows.push(extendRow);
        return extendRows;
    }
    
    updateAutoHeight() {
        const rows = this.ctx.body.renderRows;
        
        // 分离普通行和扩展行
        const normalRows = rows.filter((row) => row.rowType !== 'extend');
        
        const hasAutoHeight = rows.some((row) => row.calculatedHeightCells.length > 0);
        
        // 如果没有计算格子，不更新
        if (!hasAutoHeight) {
            return;
        }
        
        // 更新所有行的计算高度（包括 ExtendRow）
        rows.forEach((row) => {
            row.updateCalculatedHeight();
        });
        
        // 只对普通行更新数据库中的行高，ExtendRow 不影响原始数据行高
        const heights = normalRows.map((row) => ({
            height: row.calculatedHeight,
            rowIndex: row.rowIndex,
        }));
        
        
        // 只更新普通行的高度到数据库，保持原始数据行高度不变
        this.ctx.database.setBatchCalculatedRowHeight(heights);
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
