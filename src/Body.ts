import type Context from './Context';
import Row from './Row';
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
    private renderRows: Row[] = [];
    private visibleRows: any[] = [];
    private visibleHeight = 0;
    private visibleWidth = 0;
    private containerRect: DOMRect | undefined;
    private data: any[] = [];
    private dropBars: Map<string, HTMLElement> = new Map(); // dropBar 元素池
    private rowEventPool: Map<string, boolean> = new Map(); // 行事件绑定状态池
    private autoScrollTimer: number | null = null; // 自动滚动计时器

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
        this.initResizeRow();
        this.initDragEvents();
    }

    // 初始化拖拽相关事件
    private initDragEvents() {
        this.ctx.on('clearDropBars', () => {
            this.clearAllDropBars();
        });

        // 监听鼠标移动事件用于自动滚动
        const handleMouseMove = (e: MouseEvent) => {
            if (this.ctx.dragMove) {
                this.handleAutoScroll(e);
            }
        };

        // 监听拖拽结束停止自动滚动
        const handleMouseUp = () => {
            this.stopAutoScroll();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // 保存引用以便销毁时移除
        (this as any)._handleMouseMove = handleMouseMove;
        (this as any)._handleMouseUp = handleMouseUp;
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
        const {
            config: { ENABLE_RESIZE_ROW },
        } = this.ctx;
        if (!ENABLE_RESIZE_ROW) {
            return;
        }
        this.ctx.on('resize', () => {
            this.containerRect = this.ctx.containerElement.getBoundingClientRect();
        });
        this.ctx.on('resizeObserver', () => {
            this.containerRect = this.ctx.containerElement.getBoundingClientRect();
        });
        // 鼠标移动
        this.ctx.on('mouseup', () => {
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
                if (diff + resizeTargetHeight < RESIZE_ROW_MIN_HEIGHT) {
                    diff = -(resizeTargetHeight - RESIZE_ROW_MIN_HEIGHT);
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
                // 拖拽状态时不显示行高调整功能
                if (!this.ctx.dragMove) {
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

        // 维护 dropBar 池
        const currentRowKeys = rows.map(row => row.rowKey);
        this.cleanupDropBars(currentRowKeys);
        this.manageRowEventPool(currentRowKeys);
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
        this.drawDropBars();
    }

    // 绘制 dropBar
    private drawDropBars() {
        const {
            config: { ENABLE_DRAG_ROW },
        } = this.ctx;
        
        if (!ENABLE_DRAG_ROW) {
            return;
        }

        this.renderRows.forEach((row) => {
            const dropBar = this.getOrCreateDropBar(row.rowKey);
            this.updateDropBarPosition(dropBar, row);
            this.bindDropBarEvents(row.rowKey, dropBar);
        });
    }

    // 获取或创建 dropBar
    private getOrCreateDropBar(rowKey: string): HTMLElement {
        let dropBar = this.dropBars.get(rowKey);
        
        if (!dropBar) {
            dropBar = document.createElement('div');
            dropBar.style.position = 'absolute';
            dropBar.style.width = '100%';
            dropBar.style.height = '14px'; // 增加悬停区域
            dropBar.style.backgroundColor = 'transparent'; // 背景透明
            // dropBar.style.border = '1px dashed rgba(255,0,0,0.3)'; // 临时调试边框
            dropBar.style.opacity = '1'; // 外层容器保持可见
            dropBar.style.visibility = 'visible'; // 必须保持可见才能接收鼠标事件
            dropBar.style.zIndex = '1000';
            dropBar.style.pointerEvents = 'auto';
            dropBar.style.transition = 'opacity 0.15s ease';
            dropBar.dataset.rowKey = rowKey;
            dropBar.className = 'e-virt-table-drop-bar'; // 添加类名便于调试
            
            // 创建内部的蓝色指示条（2px高度，居中显示）
            const innerBar = document.createElement('div');
            innerBar.style.position = 'absolute';
            innerBar.style.top = '6px'; // (14-2)/2 = 6px，居中
            innerBar.style.left = '0';
            innerBar.style.width = '100%';
            innerBar.style.height = '2px';
            innerBar.style.backgroundColor = '#1890ff'; // 蓝色
            innerBar.style.borderRadius = '1px';
            innerBar.style.opacity = '0'; // 初始不可见
            innerBar.style.transition = 'opacity 0.15s ease';
            
            dropBar.appendChild(innerBar);
            (dropBar as any)._innerBar = innerBar; // 保存引用
            
            this.ctx.containerElement.appendChild(dropBar);
            this.dropBars.set(rowKey, dropBar);
        }
        
        return dropBar;
    }

    // 更新 dropBar 位置
    private updateDropBarPosition(dropBar: HTMLElement, row: Row) {
        // 获取容器的位置信息
        const containerRect = this.ctx.containerElement.getBoundingClientRect();
        const canvasRect = this.ctx.canvasElement.getBoundingClientRect();
        
        // 计算相对于容器的位置 - 放在行底部稍微向上一点
        const top = row.y + row.height - 7 - this.ctx.scrollY + (canvasRect.top - containerRect.top);
        const left = canvasRect.left - containerRect.left;
        
        dropBar.style.left = `${left}px`;
        dropBar.style.top = `${top}px`;
        dropBar.style.width = `${this.ctx.stageWidth}px`;
        

    }

    // 公共的 hoverHandler 方法
    public hoverHandler = (rowKey: string, isHover: boolean) => {
        const dropBar = this.dropBars.get(rowKey);
        if (dropBar) {
            const innerBar = (dropBar as any)._innerBar;
            if (innerBar) {
                if (isHover) {
                    innerBar.style.opacity = '1';
                } else {
                    innerBar.style.opacity = '0';
                }
            }
        }
    };

    // 公共的 dropHandler 方法
    public dropHandler = (sourceRowKey: string, targetRowKey: string) => {
        // 使用正确的数据库方法获取行数据
        const sourceRow = this.ctx.database.getRowForRowKey(sourceRowKey);
        const targetRow = this.ctx.database.getRowForRowKey(targetRowKey);
        
        if (sourceRow && targetRow) {
            // 触发行移动事件，与 develop.ts 中的监听器匹配
            this.ctx.emit('rowMove', {
                source: sourceRow,
                target: targetRow,
                sourceRowKey,
                targetRowKey
            });
        }
    };

    // 清理所有显示的蓝条
    public clearAllDropBars = () => {
        this.dropBars.forEach((dropBar, _rowKey) => {
            const innerBar = (dropBar as any)._innerBar;
            if (innerBar) {
                innerBar.style.opacity = '0';
            }
        });
        // 停止自动滚动
        this.stopAutoScroll();
    };

    // 处理自动滚动
    private handleAutoScroll(e: MouseEvent) {
        const containerRect = this.ctx.containerElement.getBoundingClientRect();
        const mouseY = e.clientY;
        const scrollThreshold = 50; // 滚动触发区域高度
        const scrollSpeed = 10; // 滚动速度
        
        // 计算相对于容器的鼠标位置
        const relativeY = mouseY - containerRect.top;
        const containerHeight = containerRect.height;
        
        let shouldScroll = false;
        let scrollDirection = 0;
        
        // 检查是否在顶部边界
        if (relativeY < scrollThreshold) {
            shouldScroll = true;
            scrollDirection = -scrollSpeed;
        }
        // 检查是否在底部边界
        else if (relativeY > containerHeight - scrollThreshold) {
            shouldScroll = true;
            scrollDirection = scrollSpeed;
        }
        
        if (shouldScroll) {
            this.startAutoScroll(scrollDirection);
        } else {
            this.stopAutoScroll();
        }
    }

    // 开始自动滚动
    private startAutoScroll(direction: number) {
        if (this.autoScrollTimer) {
            return; // 已经在滚动中
        }
        
        this.autoScrollTimer = window.setInterval(() => {
            const currentScrollY = this.ctx.scrollY;
            const newScrollY = currentScrollY + direction;
            
            // 设置新的滚动位置
            this.ctx.setScrollY(newScrollY);
            this.ctx.emit('draw');
        }, 16); // 约60fps
    }

    // 停止自动滚动
    private stopAutoScroll() {
        if (this.autoScrollTimer) {
            clearInterval(this.autoScrollTimer);
            this.autoScrollTimer = null;
        }
    }

    // 绑定 dropBar 事件
    private bindDropBarEvents(rowKey: string, dropBar: HTMLElement) {
        if (this.rowEventPool.get(rowKey)) {
            return; // 已经绑定过了
        }

        const hoverHandler = () => {
            // 只有在拖拽过程中才显示 dropBar
            if (this.ctx.dragMove) {
                this.hoverHandler(rowKey, true);
            }
        };

        const leaveHandler = () => {
            // 只有在拖拽过程中才隐藏 dropBar
            if (this.ctx.dragMove) {
                this.hoverHandler(rowKey, false);
            }
        };

        const dropHandler = (_e: MouseEvent) => {
            // 在拖拽时处理放置逻辑
            if (this.ctx.dragMove && this.ctx.dragManager) {
                this.handleDrop(rowKey);
                
                // 直接结束拖拽状态
                this.ctx.dragMove = false;
                this.clearAllDropBars();
                
                // 延迟重置 DragManager 状态，确保在 DragManager 的 mouseup 处理之后
                setTimeout(() => {
                    if (this.ctx.dragManager && this.ctx.dragManager.resetDragStateFromBody) {
                        this.ctx.dragManager.resetDragStateFromBody();
                    }
                }, 10);
            }
        };

        dropBar.addEventListener('mouseenter', hoverHandler);
        dropBar.addEventListener('mouseleave', leaveHandler);
        dropBar.addEventListener('mouseup', dropHandler);

        // 存储事件处理器以便后续解绑
        (dropBar as any)._hoverHandler = hoverHandler;
        (dropBar as any)._leaveHandler = leaveHandler;
        (dropBar as any)._dropHandler = dropHandler;

        this.rowEventPool.set(rowKey, true);
    }

    // 解绑 dropBar 事件
    private unbindDropBarEvents(rowKey: string) {
        const dropBar = this.dropBars.get(rowKey);
        if (dropBar) {
            if ((dropBar as any)._hoverHandler) {
                dropBar.removeEventListener('mouseenter', (dropBar as any)._hoverHandler);
                delete (dropBar as any)._hoverHandler;
            }
            if ((dropBar as any)._leaveHandler) {
                dropBar.removeEventListener('mouseleave', (dropBar as any)._leaveHandler);
                delete (dropBar as any)._leaveHandler;
            }
            if ((dropBar as any)._dropHandler) {
                dropBar.removeEventListener('mouseup', (dropBar as any)._dropHandler);
                delete (dropBar as any)._dropHandler;
            }
        }
        this.rowEventPool.delete(rowKey);
    }

    // 管理行事件池
    private manageRowEventPool(currentRowKeys: string[]) {
        // 解绑不再存在的行
        this.rowEventPool.forEach((_, rowKey) => {
            if (!currentRowKeys.includes(rowKey)) {
                this.unbindDropBarEvents(rowKey);
            }
        });
    }

    // 处理拖拽放置
    private handleDrop(targetRowKey: string) {
        if (this.ctx.dragManager) {
            const sourceRowKey = this.ctx.dragManager.getCurrentDragRowKey();
            if (sourceRowKey && sourceRowKey !== targetRowKey) {
                // 触发拖拽放置事件，传递行数据
                this.dropHandler(sourceRowKey, targetRowKey);
            }
        }
    }

    // 清理不再需要的 dropBar
    private cleanupDropBars(currentRowKeys: string[]) {
        const keysToRemove: string[] = [];
        
        this.dropBars.forEach((dropBar, rowKey) => {
            if (!currentRowKeys.includes(rowKey)) {
                // 先解绑事件
                this.unbindDropBarEvents(rowKey);
                // 移除 DOM 元素
                dropBar.remove();
                keysToRemove.push(rowKey);
            }
        });
        
        // 从 Map 中移除
        keysToRemove.forEach(key => {
            this.dropBars.delete(key);
        });
    }

    // 销毁方法，清理事件监听器
    public destroy() {
        this.stopAutoScroll();
        
        if ((this as any)._handleMouseMove) {
            document.removeEventListener('mousemove', (this as any)._handleMouseMove);
            delete (this as any)._handleMouseMove;
        }
        
        if ((this as any)._handleMouseUp) {
            document.removeEventListener('mouseup', (this as any)._handleMouseUp);
            delete (this as any)._handleMouseUp;
        }
    }
}
