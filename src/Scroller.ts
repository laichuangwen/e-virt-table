import Context from './Context';
import { getLayoutScrollerTrackSize, getOverlayScrollerTrackSize, isInnerScrollbarMode } from './ScrollbarMode';
export type ScrollbarType = 'horizontal' | 'vertical';
type Rect = { x: number; y: number; width: number; height: number };

class Scrollbar {
    private ctx: Context;
    private type: ScrollbarType;
    private isFocus = false;
    private trackX = 0;
    private trackY = 0;
    private trackWidth = 0;
    private trackHeight = 0;
    private splitPoints: number[] = []; //分割线
    private barX = 0;
    private barY = 0;
    private barWidth = 0;
    private barHeight = 0;
    private distance = 0; // 滚动条的长度
    private visibleDistance = 0; //可见区域的长度
    private clientX = 0;
    private clientY = 0;
    private dragStart = 0; // 拖拽开始的位置
    private innerVisible = false;
    private innerCollapsed = false;
    private innerShowTimer = 0;
    private collapseButton: Rect = { x: 0, y: 0, width: 0, height: 0 };
    private expandButton: Rect = { x: 0, y: 0, width: 0, height: 0 };
    isDragging = false;
    scroll = 0;

    constructor(ctx: Context, type: ScrollbarType) {
        this.ctx = ctx;
        this.type = type;
        if (this.type === 'vertical') {
            this.scroll = this.ctx.scrollY;
        } else {
            this.scroll = this.ctx.scrollX;
        }
    }

    onWheel(e: WheelEvent) {
        this.updateScroll(e);
    }
    onTouchmove(e: TouchEvent) {
        const { clientY, clientX } = e.touches[0];
        // 物理滑动距离换算为逻辑距离
        const deltaY = this.ctx.zoomScale.toLogical(clientY - this.clientY);
        const deltaX = this.ctx.zoomScale.toLogical(clientX - this.clientX);
        let scroll = 0;
        if (this.type === 'vertical') {
            scroll = Math.max(0, Math.min(this.dragStart - deltaY, this.distance));
            // 只有在滚动条需要滚动时才阻止默认事件
            const hasScrollbar = this.hasScrollbar();
            if (hasScrollbar && !((scroll === 0 && deltaY > 0) || (scroll === this.distance && deltaY < 0))) {
                e.preventDefault();
            }
        } else if (this.type === 'horizontal') {
            scroll = Math.max(0, Math.min(this.dragStart - deltaX, this.distance));
        }
        this.scroll = scroll;
    }
    onTouchstart(e: TouchEvent) {
        const { clientY, clientX } = e.touches[0];
        this.clientX = clientX;
        this.clientY = clientY;
        this.dragStart = this.scroll;
    }

    onMouseDown(e: MouseEvent) {
        if (!(e.target instanceof Element)) {
            return;
        }
        if (!this.ctx.isTarget(e)) {
            return;
        }
        // 行调整大小中不处理
        if (this.ctx.stageElement.style.cursor === 'row-resize') {
            return true;
        }
        // 列调整大小中不处理
        if (this.ctx.stageElement.style.cursor === 'col-resize') {
            return true;
        }

        const { clientX, clientY } = e;
        // 滚动条按逻辑坐标绘制,鼠标 offset 是物理像素,需换算
        const offsetX = this.ctx.zoomScale.toLogical(e.offsetX);
        const offsetY = this.ctx.zoomScale.toLogical(e.offsetY);
        if (clientX == this.clientX && clientY == this.clientY) return;
        if (this.isInnerMode()) {
            if (this.isOnExpandButton(offsetX, offsetY)) {
                this.innerCollapsed = false;
                this.innerVisible = true;
                this.ctx.stageElement.style.cursor = 'default';
                this.ctx.emit('draw');
                e.preventDefault();
                return;
            }
            if (this.isOnCollapseButton(offsetX, offsetY)) {
                this.innerCollapsed = true;
                this.innerVisible = false;
                this.isFocus = false;
                this.ctx.stageElement.style.cursor = 'default';
                this.ctx.emit('draw');
                e.preventDefault();
                return;
            }
            if (!this.canInteractWithScrollbar()) {
                return;
            }
        }
        if (this.isOnScrollbar(offsetX, offsetY)) {
            this.clientX = clientX;
            this.clientY = clientY;
            this.isDragging = true;
            this.ctx.scrollerMove = true; // 滚动条移动
            this.isFocus = true;
            this.dragStart = this.scroll;
            e.preventDefault();
        } else if (this.isOnTrack(offsetX, offsetY)) {
            // 点击轨道滚动
            let scroll = 0;
            if (this.type === 'vertical') {
                // 滚动条位置=（鼠标位置-滚动条的高度/2-头部的高度）/（可见区域的长度-滚动条的高度）*滚动条的长度
                // 滚动到中间所以减去滚动条的高度/2
                const offset = offsetY - this.ctx.header.height - this.barHeight / 2;
                scroll = (offset / (this.visibleDistance - this.barHeight)) * this.distance;
            } else {
                const offset = offsetX - this.barWidth / 2;
                scroll = (offset / (this.visibleDistance - this.barWidth)) * this.distance;
            }
            this.scroll = Math.max(0, Math.min(scroll, this.distance));
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.isFocus = false;
        this.clientX = 0;
        this.clientY = 0;
    }

    onMouseMove(e: MouseEvent) {
        const { clientX, clientY, buttons } = e;
        const offsetX = this.ctx.zoomScale.toLogical(e.offsetX);
        const offsetY = this.ctx.zoomScale.toLogical(e.offsetY);
        if (this.isInnerMode()) {
            this.startInnerShowTimer();
        }
        // 没有鼠标按下时不处理，要重置抬起事件
        // 悬浮提示
        const isInnerControl =
            this.isInnerMode() && (this.isOnCollapseButton(offsetX, offsetY) || this.isOnExpandButton(offsetX, offsetY));
        const isScrollbarHover =
            this.canInteractWithScrollbar() && (this.isOnScrollbar(offsetX, offsetY) || this.isOnTrack(offsetX, offsetY));
        if ((isScrollbarHover || isInnerControl) && e.target === this.ctx.canvasElement) {
            this.isFocus = true;
            this.ctx.stageElement.style.cursor = 'pointer';
        } else {
            this.isFocus = false;
        }
        if (buttons === 0) {
            return;
        }
        // 拖拽移动滚动条
        if (clientX == this.clientX && clientY == this.clientY) return;
        let offset = 0;
        if (this.type === 'horizontal') {
            offset = clientX - this.clientX;
        } else {
            offset = clientY - this.clientY;
        }
        // 物理位移换算为逻辑位移
        offset = this.ctx.zoomScale.toLogical(offset);
        if (this.isDragging && offset !== 0) {
            // scroll= 开始滚动条位置+（鼠标移动的距离/可见区域的长度）*滚动条的长度
            let scroll = 0;
            if (this.type === 'vertical') {
                scroll = this.dragStart + (offset / (this.visibleDistance - this.barHeight)) * this.distance;
            } else {
                scroll = this.dragStart + (offset / (this.visibleDistance - this.barWidth)) * this.distance;
            }
            this.scroll = Math.max(0, Math.min(scroll, this.distance));
        }
    }

    private isPointInElement(
        pointX: number,
        pointY: number,
        elementX: number,
        elementY: number,
        elementWidth: number,
        elementHeight: number,
    ): boolean {
        return (
            pointX >= elementX &&
            pointX <= elementX + elementWidth &&
            pointY >= elementY &&
            pointY <= elementY + elementHeight
        );
    }
    private hasScrollbar(): boolean {
        if (this.type === 'vertical') {
            return this.barHeight > 0;
        } else if (this.type === 'horizontal') {
            return this.barWidth > 0;
        }
        return false;
    }

    private isOnScrollbar(x: number, y: number): boolean {
        return this.isPointInElement(x, y, this.barX, this.barY, this.barWidth, this.barHeight);
    }
    private isOnTrack(x: number, y: number): boolean {
        return this.isPointInElement(x, y, this.trackX, this.trackY, this.trackWidth, this.trackHeight);
    }
    private isOnCollapseButton(x: number, y: number): boolean {
        if (!this.isInnerMode() || this.innerCollapsed || !this.innerVisible) {
            return false;
        }
        return this.isPointInElement(
            x,
            y,
            this.collapseButton.x,
            this.collapseButton.y,
            this.collapseButton.width,
            this.collapseButton.height,
        );
    }
    private isOnExpandButton(x: number, y: number): boolean {
        if (!this.isInnerMode() || !this.innerCollapsed) {
            return false;
        }
        return this.isPointInElement(
            x,
            y,
            this.expandButton.x,
            this.expandButton.y,
            this.expandButton.width,
            this.expandButton.height,
        );
    }
    private isInnerMode(): boolean {
        return isInnerScrollbarMode(this.ctx.config);
    }
    private shouldDrawInnerScrollbar(): boolean {
        if (!this.isInnerMode()) {
            return true;
        }
        return !this.innerCollapsed && (this.innerVisible || this.isFocus || this.isDragging);
    }
    private canInteractWithScrollbar(): boolean {
        return !this.isInnerMode() || this.shouldDrawInnerScrollbar();
    }
    private startInnerShowTimer() {
        if (!this.isInnerMode() || this.innerVisible || this.innerCollapsed || this.innerShowTimer) {
            return;
        }
        const delay = Math.max(0, this.ctx.config.SCROLLBAR_SHOW_DELAY || 0);
        this.innerShowTimer = window.setTimeout(() => {
            this.innerVisible = true;
            this.innerShowTimer = 0;
            this.ctx.emit('draw');
        }, delay);
    }
    hideInnerScrollbar() {
        if (!this.isInnerMode() || this.isDragging || this.innerCollapsed) {
            return;
        }
        if (this.innerShowTimer) {
            clearTimeout(this.innerShowTimer);
            this.innerShowTimer = 0;
        }
        this.innerVisible = false;
        this.isFocus = false;
    }

    private updateScroll(e: WheelEvent) {
        const deltaX = e.deltaX;
        const deltaY = e.deltaY;
        if (this.type === 'vertical' && e.shiftKey === false) {
            // 只有在滚动条需要滚动时才阻止默认事件
            const hasScrollbar = this.hasScrollbar();
            if (hasScrollbar && !((this.scroll === 0 && deltaY < 0) || (this.scroll === this.distance && deltaY > 0))) {
                e.preventDefault();
            }
            this.scroll = Math.max(0, Math.min(this.scroll + deltaY, this.distance));
        } else if (this.type === 'horizontal') {
            if (e.shiftKey) {
                this.scroll = Math.max(0, Math.min(this.scroll + deltaY, this.distance));
            } else {
                this.scroll = Math.max(0, Math.min(this.scroll + deltaX, this.distance));
            }
        }
    }
    private updatedSize() {
        const {
            body,
            header,
            stageHeight,
            stageWidth,
            config: { SCROLLER_SIZE = 0, BORDER },
        } = this.ctx;
        const layoutScrollerTrackSize = getLayoutScrollerTrackSize(this.ctx.config);
        const overlayScrollerTrackSize = getOverlayScrollerTrackSize(this.ctx.config);
        const visibleWidth = stageWidth;
        const visibleHeight = stageHeight;
        const headerHeight = header.height;
        const headerWidth = header.width;
        const bodyHeight = body.height;
        const footerHeight = this.ctx.footer.height;
        if (this.type === 'vertical') {
            this.visibleDistance = visibleHeight - layoutScrollerTrackSize - headerHeight;
            this.distance = Math.max(0, bodyHeight - this.visibleDistance + footerHeight);
            this.trackX = visibleWidth - overlayScrollerTrackSize;
            this.trackY = 0;
            // 分割线
            this.splitPoints = [this.trackX, headerHeight, this.trackX + overlayScrollerTrackSize, headerHeight];
            this.trackWidth = overlayScrollerTrackSize;
            this.trackHeight = visibleHeight;
            // 滚动条的X位置=轨道的X位置+（轨道的宽度-滚动条的宽度）/2
            this.barX = this.trackX - 1 + (overlayScrollerTrackSize - SCROLLER_SIZE) / 2;
            this.barWidth = SCROLLER_SIZE;
            const ratio = this.distance ? this.visibleDistance / (bodyHeight + footerHeight) : 0;
            let _barHeight = Math.floor(ratio * this.visibleDistance);
            // 最小30,超出可见区域则隐藏
            if (_barHeight < 30) {
                _barHeight = 30;
            } else if (_barHeight > this.visibleDistance) {
                _barHeight = 0;
            }
            this.barHeight = _barHeight;

            const progress = this.distance ? this.scroll / this.distance : 0;
            this.barY = headerHeight + progress * (this.visibleDistance - this.barHeight);
            // 范围限制
            this.scroll = Math.max(0, Math.min(this.scroll, this.distance));
        } else {
            this.visibleDistance = visibleWidth - layoutScrollerTrackSize;
            this.distance = Math.max(0, headerWidth - this.visibleDistance);
            // 分割线
            this.splitPoints = [
                visibleWidth - overlayScrollerTrackSize,
                visibleHeight - overlayScrollerTrackSize,
                visibleWidth - overlayScrollerTrackSize,
                visibleHeight,
            ];
            const offset = BORDER ? 0 : 0.5; // 解决边框问题，补偿0.5px
            this.trackX = 0;
            this.trackY = visibleHeight - overlayScrollerTrackSize + offset;
            this.trackWidth = visibleWidth;
            this.trackHeight = overlayScrollerTrackSize;

            const ratio = this.distance ? this.visibleDistance / headerWidth : 0;

            let _barWidth = Math.floor(ratio * this.visibleDistance);
            this.barY = this.trackY - 1 + (overlayScrollerTrackSize - SCROLLER_SIZE) / 2;
            // 最小30,超出可见区域则隐藏
            if (_barWidth < 30) {
                _barWidth = 30;
            } else if (_barWidth >= this.visibleDistance) {
                _barWidth = 0;
            }
            this.barWidth = _barWidth;
            this.barHeight = SCROLLER_SIZE;
            const progress = this.distance ? this.scroll / this.distance : 0;
            this.barX = progress * (this.visibleDistance - this.barWidth);
            // 范围限制
            this.scroll = Math.max(0, Math.min(this.scroll, this.distance));
        }
        this.updateToggleButtons();
    }
    private updateToggleButtons() {
        const size = Math.max(14, Math.min(20, getOverlayScrollerTrackSize(this.ctx.config) + 4));
        if (this.type === 'vertical') {
            const minY = this.ctx.header.height + 8;
            const maxY = Math.max(minY, this.ctx.stageHeight - size - 8);
            const y = Math.min(minY, maxY);
            this.collapseButton = { x: this.trackX - size - 2, y, width: size, height: size };
            this.expandButton = { x: this.ctx.stageWidth - size - 2, y, width: size, height: size };
            return;
        }
        const x = 8;
        this.collapseButton = { x, y: this.trackY - size - 2, width: size, height: size };
        this.expandButton = { x, y: this.ctx.stageHeight - size - 2, width: size, height: size };
    }
    private drawToggleButton(rect: Rect, label: string) {
        const {
            config: { SCROLLER_FOCUS_COLOR, SCROLLER_TRACK_COLOR, BODY_TEXT_COLOR },
        } = this.ctx;
        this.ctx.paint.drawRect(rect.x, rect.y, rect.width, rect.height, {
            borderColor: SCROLLER_FOCUS_COLOR,
            fillColor: SCROLLER_TRACK_COLOR,
            radius: 4,
        });
        this.ctx.paint.drawText(label, rect.x, rect.y - 1, rect.width, rect.height + 2, {
            padding: 0,
            align: 'center',
            verticalAlign: 'middle',
            color: BODY_TEXT_COLOR,
        });
    }
    draw(): boolean {
        const {
            config: { SCROLLER_FOCUS_COLOR, SCROLLER_COLOR, BORDER_COLOR, BORDER, SCROLLER_TRACK_COLOR },
        } = this.ctx;
        this.updatedSize();
        if (this.isInnerMode() && this.innerCollapsed) {
            this.drawToggleButton(this.expandButton, this.type === 'vertical' ? '<' : '^');
            return this.isFocus || this.isDragging;
        }
        if (this.isInnerMode() && !this.shouldDrawInnerScrollbar()) {
            return this.isFocus || this.isDragging;
        }
        let borderColor = BORDER_COLOR;
        if (!BORDER) {
            borderColor = 'transparent';
        }
        // 轨道
        this.ctx.paint.drawRect(this.trackX, this.trackY, this.trackWidth, this.trackHeight, {
            borderColor,
            fillColor: SCROLLER_TRACK_COLOR,
        });
        // 滚动条
        this.ctx.paint.drawRect(this.barX, this.barY, this.barWidth, this.barHeight, {
            fillColor: this.isFocus || this.isDragging ? SCROLLER_FOCUS_COLOR : SCROLLER_COLOR,
            radius: 4,
        });
        // 分割线范围外
        if (this.splitPoints.length > 0) {
            this.ctx.paint.drawLine(this.splitPoints, {
                borderColor,
                borderWidth: 1,
            });
        }
        if (this.isInnerMode()) {
            this.drawToggleButton(this.collapseButton, this.type === 'vertical' ? '>' : 'v');
        }
        return this.isFocus || this.isDragging;
    }
}

export default class Scroller {
    private ctx: Context;
    private verticalScrollbar: Scrollbar;
    private horizontalScrollbar: Scrollbar;
    private mousedownHeader = false; // 是否点击了表头,点击头部处理滚动条调整位置
    private adjustPositionX = '';
    private adjustPositionY = '';
    private timerX = 0; // 水平滚动定时器
    private timerY = 0; // 垂直滚动定时器

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.verticalScrollbar = new Scrollbar(ctx, 'vertical');
        this.horizontalScrollbar = new Scrollbar(ctx, 'horizontal');
        this.ctx.on('wheel', (e) => this.onWheel(e));
        this.ctx.on('mousedown', (e) => this.onMouseDown(e));
        this.ctx.on('mousemove', (e) => this.onMouseMove(e));
        this.ctx.on('mouseup', () => this.onMouseUp());
        this.ctx.on('mouseout', (e: MouseEvent) => this.onMouseOut(e));
        this.ctx.on('touchmove', (e) => this.onTouchmove(e));
        this.ctx.on('touchstart', (e) => {
            this.onTouchstart(e);
        });
        this.ctx.on('setScroll', (scrollX: number, scrollY: number) => {
            this.setScroll(scrollX, scrollY);
        });
        this.ctx.on('setScrollX', (scrollX: number) => {
            this.setScrollX(scrollX);
        });
        this.ctx.on('setScrollY', (scrollY: number) => {
            this.setScrollY(scrollY);
        });
        this.ctx.on('scrollToIndex', (rowIndex: number, colIndex: number) => {
            this.scrollToIndex(rowIndex, colIndex);
        });
        this.ctx.on('cellHeaderMousedown', () => {
            this.mousedownHeader = true;
        });
        this.ctx.on('startAdjustPosition', (e: MouseEvent) => {
            this.startAdjustPosition(e);
        });
        this.ctx.on('stopAdjustPosition', () => {
            this.stopAdjustPosition();
        });
    }

    onWheel(e: WheelEvent) {
        this.verticalScrollbar.onWheel(e);
        this.horizontalScrollbar.onWheel(e);
        this.draw();
    }

    onTouchmove(e: TouchEvent) {
        this.verticalScrollbar.onTouchmove(e);
        this.horizontalScrollbar.onTouchmove(e);
        this.draw();
    }

    onTouchstart(e: TouchEvent) {
        this.verticalScrollbar.onTouchstart(e);
        this.horizontalScrollbar.onTouchstart(e);
        this.draw();
    }
    onMouseDown(e: MouseEvent) {
        this.verticalScrollbar.onMouseDown(e);
        this.horizontalScrollbar.onMouseDown(e);
        this.draw();
    }

    onMouseMove(e: MouseEvent) {
        this.verticalScrollbar.onMouseMove(e);
        this.horizontalScrollbar.onMouseMove(e);
        this.draw();
    }

    onMouseUp() {
        this.mousedownHeader = false;
        this.verticalScrollbar.onMouseUp();
        this.horizontalScrollbar.onMouseUp();
        this.ctx.scrollerMove = false;
    }
    onMouseOut(e: MouseEvent) {
        if (this.ctx.containerElement.contains(e.relatedTarget as Node)) {
            return;
        }
        this.verticalScrollbar.hideInnerScrollbar();
        this.horizontalScrollbar.hideInnerScrollbar();
        this.ctx.emit('draw');
    }

    draw() {
        const verticalFocus = this.verticalScrollbar.draw();
        const horizontalFocus = this.horizontalScrollbar.draw();
        this.ctx.scrollerFocus = verticalFocus || horizontalFocus;
        const scrollX = Math.floor(this.horizontalScrollbar.scroll);
        const scrollY = Math.floor(this.verticalScrollbar.scroll);
        // 只有滚动条发生变化才触发绘制
        if (scrollX !== this.ctx.scrollX || scrollY !== this.ctx.scrollY) {
            this.ctx.emit('onScroll', scrollX, scrollY);
            if (scrollX !== this.ctx.scrollX) {
                this.ctx.emit('onScrollX', scrollX);
            }
            if (scrollY !== this.ctx.scrollY) {
                this.ctx.emit('onScrollY', scrollY);
            }
            this.ctx.scrollX = scrollX;
            this.ctx.scrollY = scrollY;
            this.ctx.emit('draw');
        }
    }
    setScroll(x: number, y: number) {
        this.horizontalScrollbar.scroll = x;
        this.verticalScrollbar.scroll = y;
        this.ctx.emit('draw');
        this.ctx.emit('onScroll', x, y);
    }
    setScrollX(scrollX: number) {
        this.horizontalScrollbar.scroll = scrollX;
        this.ctx.emit('draw');
    }
    setScrollY(scrollY: number) {
        this.verticalScrollbar.scroll = scrollY;
        this.ctx.emit('draw');
    }
    scrollToColkey(key: string) {
        const { header } = this.ctx;
        const cell = header.leafCellHeaders.find((cell) => cell.key === key);
        if (cell) {
            // 移动到窗口中间/2
            this.setScrollX(cell.x - header.visibleWidth / 2);
        }
    }
    scrollToColIndex(colIndex: number) {
        const { header } = this.ctx;
        const cell = header.leafCellHeaders.find((cell) => cell.colIndex === colIndex);
        if (cell) {
            this.setScrollX(cell.x - header.visibleWidth / 2);
        }
    }
    scrollToRowIndex(rowIndex: number) {
        const { body, database } = this.ctx;
        const { top } = database.getPositionForRowIndex(rowIndex);
        this.setScrollY(top - body.visibleHeight / 2);
    }
    scrollToIndex(rowIndex: number, colIndex: number) {
        this.scrollToRowIndex(rowIndex);
        this.scrollToColIndex(colIndex);
    }
    scrollToRowKey(rowKey: string) {
        const { body, database } = this.ctx;
        const rowIndex = database.getRowIndexForRowKey(rowKey);
        if (rowIndex === undefined) {
            return;
        }
        const { top } = database.getPositionForRowIndex(rowIndex);
        this.setScrollY(top - body.visibleHeight / 2);
    }
    /**
     * 调整滚动条位置，让到达边界时自动滚动
     */
    private startAdjustPosition(e: MouseEvent) {
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        let positionX = '';
        let positionY = '';
        if (this.ctx.focusCell?.fixed !== 'left' && offsetX < this.ctx.fixedLeftWidth) {
            positionX = 'left';
        } else if (
            this.ctx.focusCell?.fixed !== 'right' &&
            offsetX > this.ctx.body.visibleWidth - this.ctx.fixedRightWidth
        ) {
            positionX = 'right';
        } else {
            positionX = '';
            this.stopAdjustPosition(true, false);
        }

        if (!this.mousedownHeader && offsetY < this.ctx.header.visibleHeight) {
            positionY = 'top';
        } else if (offsetY > this.ctx.header.visibleHeight + this.ctx.body.visibleHeight) {
            positionY = 'bottom';
        } else {
            positionY = '';
            this.stopAdjustPosition(false, true);
        }
        if (positionX && this.adjustPositionX !== positionX) {
            this.adjustPositionX = positionX;
            const position = positionX === 'left' ? -1 : 1;
            let scrollSpeedX = 10 * position; // 滚动速度
            if (this.timerX) {
                clearInterval(this.timerX);
                this.timerX = 0;
            }
            this.timerX = setInterval(() => {
                // 增加滚动速度
                scrollSpeedX *= 1.5; // 加速因子
                const { scrollX } = this.ctx;
                const num = scrollX + scrollSpeedX;
                if (num < 0 || num > this.ctx.body.width) {
                    clearInterval(this.timerX);
                    this.timerX = 0;
                }
                this.ctx.setScrollX(num);
            }, 100); // 每100毫秒执行一次
        }

        if (positionY && this.adjustPositionY !== positionY) {
            this.adjustPositionY = positionY;
            const position = positionY === 'top' ? -1 : 1;
            let scrollSpeedY = 10 * position; // 滚动速度
            if (this.timerY) {
                clearInterval(this.timerY);
                this.timerY = 0;
            }
            this.timerY = setInterval(() => {
                // 增加滚动速度
                scrollSpeedY *= 1.5; // 加速因子
                const { scrollY } = this.ctx;
                const num = scrollY + scrollSpeedY;
                if (num < 0 || num > this.ctx.body.height) {
                    clearInterval(this.timerY);
                    this.timerY = 0;
                }
                this.ctx.setScrollY(num);
            }, 100); // 每100毫秒执行一次
        }
    }
    private stopAdjustPosition(x = true, y = true) {
        if (x) {
            this.adjustPositionX = '';
            if (this.timerX) {
                clearInterval(this.timerX);
                this.timerX = 0;
            }
        }
        if (y) {
            this.adjustPositionY = '';
            if (this.timerY) {
                clearInterval(this.timerY);
                this.timerY = 0;
            }
        }
    }
}
