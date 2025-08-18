import Context from './Context';
import CellHeader from './CellHeader';
import Row from './Row';
import { DragType, DragState } from './types';

export default class DragManager {
    private ctx: Context;
    private dragState: DragState = {
        type: DragType.None,
        sourceIndex: -1,
        targetIndex: -1,
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    };
    private dragPreviewCanvas?: HTMLCanvasElement;
    private dragThreshold = 2; // 拖拽触发阈值（降低到2像素）
    private hoverCellHeader: CellHeader | null = null; // 悬停的表头
    private hoverRow: Row | null = null; // 悬停的行
    private currentDragRowKey: string = ''; // 当前拖拽的行Key
    
    // 绑定的事件处理器
    private boundMouseDown: (e: MouseEvent) => void;
    private boundMouseMove: (e: MouseEvent) => void;
    private boundMouseUp: (e: MouseEvent) => void;
    private get dragIconSize() {
        return this.ctx.config.DRAG_ICON_SIZE || 16;
    }
    
    private get dragIconOpacity() {
        return this.ctx.config.DRAG_ICON_OPACITY || 0.6;
    }
    
    constructor(ctx: Context) {
        this.ctx = ctx;
        
        // 绑定事件处理器
        this.boundMouseDown = this.onMouseDown.bind(this);
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundMouseUp = this.onMouseUp.bind(this);
        
        this.init();
    }
    
    private init() {
        // 直接监听原生 DOM 事件，确保优先级最高
        this.ctx.stageElement.addEventListener('mousedown', this.boundMouseDown, true); // 使用捕获阶段
        this.ctx.stageElement.addEventListener('mousemove', this.boundMouseMove, false);
        this.ctx.stageElement.addEventListener('mouseup', this.boundMouseUp, false);
        
        // 监听悬停事件
        this.ctx.on('cellHeaderHoverChange', this.onCellHeaderHover.bind(this));
        this.ctx.on('cellHeaderMouseleave', this.onCellHeaderLeave.bind(this));
        this.ctx.on('visibleCellHoverChange', this.onCellHover.bind(this));
        this.ctx.on('visibleCellMouseleave', this.onCellLeave.bind(this));
        
        // 监听配置变化
        this.ctx.on('resetHeader', () => {
            // 只有在非拖拽状态时才取消拖拽
            if (!this.dragState.isDragging) {
                this.cancelDrag();
            }
        });
    }
    
    private onMouseDown(e: MouseEvent) {
        if (!this.ctx.isTarget(e)) {
            return;
        }
        
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        
        // 检查是否点击在表头拖拽图标上
        if (this.hoverCellHeader && this.ctx.config.ENABLE_DRAG_COLUMN) {
            const iconArea = this.getHeaderDragIconArea(this.hoverCellHeader);
            
            if (this.isPointInArea(offsetX, offsetY, iconArea)) {
                // 立即设置拖拽状态，阻止其他功能
                this.ctx.dragMove = true;
                // 阻止其他拖选功能触发
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.initColumnDrag(this.hoverCellHeader, offsetX, offsetY);
                return;
            }
        }
        
        // 检查是否点击在行拖拽图标上
        if (this.hoverRow && this.ctx.config.ENABLE_DRAG_ROW) {
            const iconArea = this.getRowDragIconArea(this.hoverRow);
            
            if (this.isPointInArea(offsetX, offsetY, iconArea)) {
                // 立即设置拖拽状态，阻止其他功能
                this.ctx.dragMove = true;

                // 阻止其他拖选功能触发
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.initRowDrag(this.hoverRow, offsetX, offsetY);
                return;
            }
        }
    }
    
    private onMouseMove(e: MouseEvent) {
        if (!this.dragState.isDragging) {
            // 检查鼠标是否在拖拽图标上，更新鼠标样式
            this.updateCursorStyle(e);
            
            // 检查是否需要开始拖拽
            this.checkStartDrag(e);
            return;
        }
        
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        this.dragState.currentX = offsetX;
        this.dragState.currentY = offsetY;
        
        // 更新拖拽预览位置
        this.updateDragPreview();
        
        // 更新拖拽目标
        this.updateDragTarget(offsetX, offsetY);
        
        // 重绘表格显示拖拽指示器
        this.ctx.emit('draw');
    }
    
    private onMouseUp(_e: MouseEvent) {
        const wasDragging = this.dragState.isDragging && this.dragState.type !== DragType.None;
        const hasDragState = this.dragState.type !== DragType.None || this.ctx.dragMove;
        
        // 如果是行拖拽，不在这里处理，让 Body 的 dropHandler 处理
        if (this.dragState.type === DragType.Row && this.dragState.isDragging) {
            // 不阻止事件传播，让 dropBar 的事件处理器先执行
            return;
        }
        
        // 其他类型的拖拽或非拖拽状态，正常处理
        if (wasDragging) {
            this.completeDrag();
        }
        
        if (hasDragState) {
            this.resetDragState();
        }
    }
    
    // 悬停事件处理
    private onCellHeaderHover(header: CellHeader) {
        if (this.ctx.config.ENABLE_DRAG_COLUMN && !this.dragState.isDragging) {
            this.hoverCellHeader = header;
            this.ctx.emit('draw'); // 重绘以显示拖拽图标
        }
    }
    
    private onCellHeaderLeave(header: CellHeader) {
        if (this.hoverCellHeader === header && !this.dragState.isDragging) {
            this.hoverCellHeader = null;
            this.ctx.emit('draw'); // 重绘以隐藏拖拽图标
        }
    }
    
    private onCellHover(cell: any) {
        if (this.ctx.config.ENABLE_DRAG_ROW && !this.dragState.isDragging) {
            // 查找对应的行
            const rows = this.ctx.body.renderRows;
            const row = rows.find(r => r.rowIndex === cell.rowIndex);
            if (row) { // 在任何单元格悬停时都显示拖拽图标
                if (this.hoverRow !== row) {
                    this.hoverRow = row;
                    this.ctx.emit('draw');
                }
            }
        }
    }
    
    private onCellLeave(cell: any) {
        if (this.hoverRow && this.hoverRow.rowIndex === cell.rowIndex && !this.dragState.isDragging) {
            this.hoverRow = null;
            this.ctx.emit('draw');
        }
    }
    
    // 获取表头拖拽图标区域
    private getHeaderDragIconArea(header: CellHeader) {
        const headerX = header.getDrawX();
        const headerY = header.y;
        // 水平居中，垂直靠上
        const iconX = headerX + (header.width - this.dragIconSize) / 2;
        const iconY = headerY + 4; // 距离顶部4px
        
        return {
            x: iconX,
            y: iconY,
            width: this.dragIconSize,
            height: this.dragIconSize
        };
    }
    
    // 获取行拖拽图标区域
    private getRowDragIconArea(row: Row) {
        const firstCell = row.cells[0];
        if (!firstCell) return null;
        
        // 水平靠左，垂直居中
        const iconX = firstCell.drawX + 4; // 距离左侧4px
        // 使用 firstCell.drawY 而不是 row.y，因为 drawY 已经考虑了滚动偏移
        const iconY = firstCell.drawY + (firstCell.height - this.dragIconSize) / 2;
        
        return {
            x: iconX,
            y: iconY,
            width: this.dragIconSize,
            height: this.dragIconSize
        };
    }
    
    // 检查点是否在区域内
    private isPointInArea(x: number, y: number, area: any) {
        if (!area) return false;
        return x >= area.x && 
               x <= area.x + area.width && 
               y >= area.y && 
               y <= area.y + area.height;
    }
    
    // 更新鼠标样式
    private updateCursorStyle(e: MouseEvent) {
        if (!this.ctx.isTarget(e)) return;
        
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        let isOverDragIcon = false;
        
        // 检查是否在表头拖拽图标上
        if (this.hoverCellHeader && this.ctx.config.ENABLE_DRAG_COLUMN) {
            const iconArea = this.getHeaderDragIconArea(this.hoverCellHeader);
            if (this.isPointInArea(offsetX, offsetY, iconArea)) {
                isOverDragIcon = true;
            }
        }
        
        // 检查是否在行拖拽图标上
        if (!isOverDragIcon && this.hoverRow && this.ctx.config.ENABLE_DRAG_ROW) {
            const iconArea = this.getRowDragIconArea(this.hoverRow);
            if (this.isPointInArea(offsetX, offsetY, iconArea)) {
                isOverDragIcon = true;
            }
        }
        
        // 设置鼠标样式
        if (isOverDragIcon) {
            this.ctx.stageElement.style.cursor = 'pointer';
        } else {
            // 只有当不是其他特殊状态时才重置为默认
            if (this.ctx.stageElement.style.cursor === 'pointer') {
                this.ctx.stageElement.style.cursor = '';
            }
        }
    }
    
    // 绘制拖拽图标
    drawDragIcons() {
        // 绘制表头拖拽图标
        if (this.hoverCellHeader && this.ctx.config.ENABLE_DRAG_COLUMN) {
            this.drawHeaderDragIcon(this.hoverCellHeader);
        }
        
        // 绘制行拖拽图标
        if (this.hoverRow && this.ctx.config.ENABLE_DRAG_ROW) {
            this.drawRowDragIcon(this.hoverRow);
        }
    }
    
    // 绘制表头拖拽图标
    private drawHeaderDragIcon(header: CellHeader) {
        const iconArea = this.getHeaderDragIconArea(header);
        const icon = this.ctx.icons.get('draggable');
        
        if (icon && iconArea) {
            const { paint } = this.ctx;
            paint.save();
            
            // 设置半透明
            (paint as any).ctx.globalAlpha = this.dragIconOpacity;
            
            // 绘制图标背景（可选）
            paint.drawRect(
                iconArea.x - 2,
                iconArea.y - 2,
                iconArea.width + 4,
                iconArea.height + 4,
                {
                    fillColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    radius: 2
                }
            );
            
            // 绘制拖拽图标
            paint.drawImage(icon, iconArea.x, iconArea.y, iconArea.width, iconArea.height);
            
            paint.restore();
        }
    }
    
    // 绘制行拖拽图标
    private drawRowDragIcon(row: Row) {
        const iconArea = this.getRowDragIconArea(row);
        const icon = this.ctx.icons.get('draggable');
        
        if (icon && iconArea) {
            const { paint } = this.ctx;
            paint.save();
            
            // 设置半透明
            (paint as any).ctx.globalAlpha = this.dragIconOpacity;
            
            // 绘制图标背景（可选）
            paint.drawRect(
                iconArea.x - 2,
                iconArea.y - 2,
                iconArea.width + 4,
                iconArea.height + 4,
                {
                    fillColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    radius: 2
                }
            );
            
            // 绘制拖拽图标
            paint.drawImage(icon, iconArea.x, iconArea.y, iconArea.width, iconArea.height);
            
            paint.restore();
        }
    }
    
    // 初始化列拖拽
    private initColumnDrag(header: CellHeader, x: number, y: number) {
        // dragMove 已经在点击检测时设置了
        this.dragState = {
            type: DragType.Column,
            sourceIndex: header.colIndex,
            targetIndex: header.colIndex,
            isDragging: false,
            startX: x,
            startY: y,
            currentX: x,
            currentY: y,
            dragElement: header
        };
        
        // 立即开始拖拽，不需要等待鼠标移动
        setTimeout(() => {
            if (this.dragState.type === DragType.Column && this.ctx.dragMove) {
                this.startDrag();
            }
        }, 5);
    }
    
    // 初始化行拖拽
    private initRowDrag(row: Row, x: number, y: number) {
        // dragMove 已经在点击检测时设置了
        this.dragState = {
            type: DragType.Row,
            sourceIndex: row.rowIndex,
            targetIndex: row.rowIndex,
            isDragging: false,
            startX: x,
            startY: y,
            currentX: x,
            currentY: y,
            dragElement: row
        };
        
        // 设置当前拖拽的行Key
        this.currentDragRowKey = row.rowKey;
        
        // 立即开始拖拽，不需要等待鼠标移动
        setTimeout(() => {
            if (this.dragState.type === DragType.Row && this.ctx.dragMove) {
                this.startDrag();
            }
        }, 5);
    }
    
    // 检查是否开始拖拽
    private checkStartDrag(e: MouseEvent) {
        if (this.dragState.type === DragType.None) return;
        
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        const deltaX = Math.abs(offsetX - this.dragState.startX);
        const deltaY = Math.abs(offsetY - this.dragState.startY);
        
        if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
            this.startDrag();
            this.dragState.currentX = offsetX;
            this.dragState.currentY = offsetY;
        }
    }
    
    // 开始拖拽
    private startDrag() {
        this.dragState.isDragging = true;
        this.createDragPreview();
        this.ctx.stageElement.style.cursor = 'move';
        
        // 触发拖拽开始事件
        this.ctx.emit('dragStart', {
            type: this.dragState.type,
            fromIndex: this.dragState.sourceIndex
        });
    }
    
    // 创建拖拽预览
    private createDragPreview() {
        if (!this.dragPreviewCanvas) {
            this.dragPreviewCanvas = document.createElement('canvas');
            this.dragPreviewCanvas.style.position = 'absolute';
            this.dragPreviewCanvas.style.pointerEvents = 'none';
            this.dragPreviewCanvas.style.zIndex = '9999';
            this.dragPreviewCanvas.style.opacity = '0.8';
            this.ctx.containerElement.appendChild(this.dragPreviewCanvas);
        }
        
        if (this.dragState.type === DragType.Column) {
            this.createColumnPreview();
        } else if (this.dragState.type === DragType.Row) {
            this.createRowPreview();
        }
    }
    
    // 创建列拖拽预览
    private createColumnPreview() {
        const header = this.dragState.dragElement as CellHeader;
        const canvas = this.dragPreviewCanvas!;
        const ctx = canvas.getContext('2d')!;
        
        // 限制预览宽度，避免过大
        const maxPreviewWidth = Math.min(200, header.width); // 最大200px
        const previewHeight = header.height;
        
        canvas.width = maxPreviewWidth;
        canvas.height = previewHeight;
        
        // 绘制表头预览
        ctx.fillStyle = this.ctx.config.HEADER_BG_COLOR;
        ctx.fillRect(0, 0, maxPreviewWidth, previewHeight);
        ctx.strokeStyle = this.ctx.config.BORDER_COLOR;
        ctx.strokeRect(0, 0, maxPreviewWidth, previewHeight);
        
        // 绘制文本
        ctx.fillStyle = this.ctx.config.HEADER_TEXT_COLOR;
        ctx.font = this.ctx.config.HEADER_FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const title = header.column?.title || '';
        // 如果文本过长，进行截断
        const maxTextWidth = maxPreviewWidth - 10;
        let displayTitle = title;
        const textWidth = ctx.measureText(title).width;
        if (textWidth > maxTextWidth) {
            // 简单截断，添加省略号
            displayTitle = title.substring(0, Math.floor(title.length * maxTextWidth / textWidth)) + '...';
        }
        ctx.fillText(displayTitle, maxPreviewWidth / 2, previewHeight / 2);
    }
    
    // 创建行拖拽预览
    private createRowPreview() {
        const row = this.dragState.dragElement as Row;
        const canvas = this.dragPreviewCanvas!;
        const ctx = canvas.getContext('2d')!;
        
        // 限制预览宽度，避免过大
        const maxPreviewWidth = Math.min(300, row.width); // 最大300px
        const previewHeight = row.height;
        
        canvas.width = maxPreviewWidth;
        canvas.height = previewHeight;
        
        // 绘制行预览
        ctx.fillStyle = this.ctx.config.BODY_BG_COLOR;
        ctx.fillRect(0, 0, maxPreviewWidth, previewHeight);
        ctx.strokeStyle = this.ctx.config.BORDER_COLOR;
        ctx.strokeRect(0, 0, maxPreviewWidth, previewHeight);
        
        // 绘制行号或标识文本
        ctx.fillStyle = this.ctx.config.BODY_TEXT_COLOR;
        ctx.font = this.ctx.config.BODY_FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`行 ${row.rowIndex + 1}`, maxPreviewWidth / 2, previewHeight / 2);
    }
    
    // 更新拖拽预览位置
    private updateDragPreview() {
        if (!this.dragPreviewCanvas) return;
        
        const rect = this.ctx.containerElement.getBoundingClientRect();
        const canvas = this.dragPreviewCanvas;
        
        // 计算预览位置，让其跟随鼠标但有小偏移
        let previewX = this.dragState.currentX + rect.left + 10; // 鼠标右侧10px
        let previewY = this.dragState.currentY + rect.top - 10;  // 鼠标上方10px
        
        // 防止预览超出屏幕边界
        const previewWidth = canvas.width;
        const previewHeight = canvas.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 右边界检查
        if (previewX + previewWidth > viewportWidth) {
            previewX = this.dragState.currentX + rect.left - previewWidth - 10; // 移到鼠标左侧
        }
        
        // 下边界检查
        if (previewY + previewHeight > viewportHeight) {
            previewY = this.dragState.currentY + rect.top - previewHeight - 10; // 移到鼠标上方
        }
        
        // 上边界检查
        if (previewY < 0) {
            previewY = this.dragState.currentY + rect.top + 10; // 移到鼠标下方
        }
        
        // 左边界检查
        if (previewX < 0) {
            previewX = 10; // 距离左边缘10px
        }
        
        canvas.style.left = `${previewX}px`;
        canvas.style.top = `${previewY}px`;
    }
    
    // 更新拖拽目标 - 现在主要用于列拖拽
    private updateDragTarget(x: number, _y: number) {
        if (this.dragState.type === DragType.Column) {
            this.updateColumnTarget(x);
        }
        // 行拖拽现在通过 dropBar 事件处理，不需要基于位置计算
    }
    
    // 更新列拖拽目标
    private updateColumnTarget(x: number) {
        const headers = this.ctx.header.renderLeafCellHeaders;
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const headerX = header.getDrawX();
            
            if (x >= headerX && x <= headerX + header.width) {
                // 根据鼠标位置决定插入位置
                const insertBefore = x < headerX + header.width / 2;
                this.dragState.targetIndex = insertBefore ? i : i + 1;
                break;
            }
        }
    }
    

    
    // 完成拖拽
    private completeDrag() {
        if (this.dragState.type === DragType.Column && this.dragState.sourceIndex !== this.dragState.targetIndex) {
            this.moveColumn(this.dragState.sourceIndex, this.dragState.targetIndex);
        }
        // 行拖拽的完成逻辑现在在 Body 的 dropHandler 中处理
        
        // 触发拖拽完成事件
        this.ctx.emit('dragEnd', {
            type: this.dragState.type,
            fromIndex: this.dragState.sourceIndex,
            toIndex: this.dragState.targetIndex
        });
    }
    
    // 移动列
    private moveColumn(sourceIndex: number, targetIndex: number) {
        const columns = this.ctx.header.visibleLeafColumns;
        const sourceColumn = columns[sourceIndex];
        
        // 从原位置移除
        columns.splice(sourceIndex, 1);
        
        // 插入到新位置
        const insertIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
        columns.splice(insertIndex, 0, sourceColumn);
        
        // 重建表头
        this.ctx.emit('resetHeader');
        
        // 触发列移动事件
        this.ctx.emit('columnMove', {
            type: DragType.Column,
            fromIndex: sourceIndex,
            toIndex: insertIndex,
            column: sourceColumn
        });
    }
    

    
    // 取消拖拽
    private cancelDrag() {
        this.resetDragState();
    }
    
    // 重置拖拽状态
    private resetDragState() {
        this.ctx.dragMove = false; // 清除拖拽状态

        this.currentDragRowKey = ''; // 清除当前拖拽行Key
        
        // 通过事件清理所有显示的蓝条
        this.ctx.emit('clearDropBars');
        this.dragState = {
            type: DragType.None,
            sourceIndex: -1,
            targetIndex: -1,
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        
        if (this.dragPreviewCanvas) {
            this.dragPreviewCanvas.remove();
            this.dragPreviewCanvas = undefined;
        }
        
        this.ctx.stageElement.style.cursor = '';
    }
    
    // 获取当前拖拽的行Key
    public getCurrentDragRowKey(): string {
        return this.currentDragRowKey;
    }

    // 重置拖拽状态（供 Body 调用）
    public resetDragStateFromBody() {
        this.currentDragRowKey = '';
        this.dragState = {
            type: DragType.None,
            sourceIndex: -1,
            targetIndex: -1,
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        
        if (this.dragPreviewCanvas) {
            this.dragPreviewCanvas.remove();
            this.dragPreviewCanvas = undefined;
        }
        
        this.ctx.stageElement.style.cursor = '';
    }

    // 销毁方法
    destroy() {
        this.ctx.stageElement.removeEventListener('mousedown', this.boundMouseDown, true);
        this.ctx.stageElement.removeEventListener('mousemove', this.boundMouseMove, false);
        this.ctx.stageElement.removeEventListener('mouseup', this.boundMouseUp, false);
        
        if (this.dragPreviewCanvas) {
            this.dragPreviewCanvas.remove();
            this.dragPreviewCanvas = undefined;
        }
    }
    
    // 绘制拖拽指示器
    drawDragIndicator() {
        if (!this.dragState.isDragging) return;
        
        if (this.dragState.type === DragType.Column) {
            this.drawColumnDropIndicator();
        }
        // 行拖拽指示器现在通过 dropBar 显示，不需要额外绘制
    }
    
    // 绘制列拖放指示器
    private drawColumnDropIndicator() {
        const headers = this.ctx.header.renderLeafCellHeaders;
        const targetHeader = headers[this.dragState.targetIndex] || headers[headers.length - 1];
        
        if (!targetHeader) return;
        
        const { paint } = this.ctx;
        const x = this.dragState.targetIndex >= headers.length 
            ? targetHeader.getDrawX() + targetHeader.width 
            : targetHeader.getDrawX();
        
        // 绘制插入指示线
        paint.drawLine([x, 0, x, this.ctx.header.height], {
            borderColor: '#1890ff',
            borderWidth: 2
        });
    }
    

}
