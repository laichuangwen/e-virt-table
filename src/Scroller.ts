import Context from './Context';
import type { CellType } from './types';
import { shouldDrawRightBoundaryBorder, shouldDrawScrollerBorder, shouldDrawScrollerTrack } from './BorderStyle';
import {
    getLayoutScrollerTrackSize,
    getOverlayScrollerTrackSize,
    getScrollbarCornerOffset,
    getScrollbarThumbEndInset,
    isInnerScrollbarMode,
    shouldDrawScrollbar,
    shouldDrawScrollbarTrackBackground,
    shouldDrawScrollbarTrackBorder,
    shouldStartInnerScrollbarShowTimer,
} from './ScrollbarMode';

function getScrollbarThumbSize(
    distance: number,
    visibleDistance: number,
    contentDistance: number,
    trackDistance = visibleDistance,
    minSize = 30,
): number {
    if (distance <= 0 || visibleDistance <= 0 || contentDistance <= 0 || trackDistance <= 0) {
        return 0;
    }
    const size = Math.floor((visibleDistance / contentDistance) * trackDistance);
    if (size < minSize) {
        return Math.min(minSize, trackDistance);
    }
    if (size > trackDistance) {
        return 0;
    }
    return size;
}

export type ScrollbarType = 'horizontal' | 'vertical';

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
    private thumbTrackDistance = 0;
    private thumbTravelDistance = 0;
    private clientX = 0;
    private clientY = 0;
    private dragStart = 0; // 拖拽开始的位置
    private innerVisible = false;
    private innerShowTimer = 0;
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
        const deltaY = clientY - this.clientY;
        const deltaX = clientX - this.clientX;
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
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        if (clientX == this.clientX && clientY == this.clientY) return;
        if (this.isInnerMode()) {
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
                scroll = (offset / this.thumbTravelDistance) * this.distance;
            } else {
                const offset = offsetX - this.barWidth / 2;
                scroll = (offset / this.thumbTravelDistance) * this.distance;
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

    onMouseMove(e: MouseEvent, isPointerInsideTable: boolean): boolean {
        const { clientX, clientY, buttons } = e;
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        let needsFullRedraw = false;
        if (shouldStartInnerScrollbarShowTimer(this.ctx.config, isPointerInsideTable)) {
            this.startInnerShowTimer();
        } else {
            needsFullRedraw = this.hideInnerScrollbar();
        }
        // 没有鼠标按下时不处理，要重置抬起事件
        // 悬浮提示
        const isScrollbarHover =
            this.canInteractWithScrollbar() && (this.isOnScrollbar(offsetX, offsetY) || this.isOnTrack(offsetX, offsetY));
        if (isScrollbarHover && isPointerInsideTable) {
            this.isFocus = true;
            this.ctx.stageElement.style.cursor = 'pointer';
        } else {
            this.isFocus = false;
        }
        if (buttons === 0) {
            return needsFullRedraw;
        }
        // 拖拽移动滚动条
        if (clientX == this.clientX && clientY == this.clientY) return needsFullRedraw;
        let offset = 0;
        if (this.type === 'horizontal') {
            offset = clientX - this.clientX;
        } else {
            offset = clientY - this.clientY;
        }
        if (this.isDragging && offset !== 0) {
            // scroll= 开始滚动条位置+（鼠标移动的距离/可见区域的长度）*滚动条的长度
            let scroll = 0;
            if (this.type === 'vertical') {
                scroll = this.dragStart + (offset / this.thumbTravelDistance) * this.distance;
            } else {
                scroll = this.dragStart + (offset / this.thumbTravelDistance) * this.distance;
            }
            this.scroll = Math.max(0, Math.min(scroll, this.distance));
        }
        return needsFullRedraw;
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
    private isInnerMode(): boolean {
        return isInnerScrollbarMode(this.ctx.config);
    }
    private shouldDrawInnerScrollbar(): boolean {
        return shouldDrawScrollbar(this.ctx.config, {
            innerVisible: this.innerVisible,
            isFocus: this.isFocus,
            isDragging: this.isDragging,
        });
    }
    private canInteractWithScrollbar(): boolean {
        return !this.isInnerMode() || this.shouldDrawInnerScrollbar();
    }
    private startInnerShowTimer() {
        if (!this.isInnerMode() || this.innerVisible || this.innerShowTimer) {
            return;
        }
        const delay = Math.max(0, this.ctx.config.SCROLLBAR_SHOW_DELAY || 0);
        this.innerShowTimer = window.setTimeout(() => {
            this.innerVisible = true;
            this.innerShowTimer = 0;
            this.ctx.emit('draw');
        }, delay);
    }
    private cancelInnerShowTimer() {
        if (!this.innerShowTimer) {
            return;
        }
        clearTimeout(this.innerShowTimer);
        this.innerShowTimer = 0;
    }
    hideInnerScrollbar(): boolean {
        if (!this.isInnerMode() || this.isDragging) {
            return false;
        }
        const needsFullRedraw = this.innerVisible || this.isFocus;
        this.cancelInnerShowTimer();
        this.innerVisible = false;
        this.isFocus = false;
        return needsFullRedraw;
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
        const verticalVisibleDistance = visibleHeight - layoutScrollerTrackSize - headerHeight;
        const horizontalVisibleDistance = visibleWidth - layoutScrollerTrackSize;
        const verticalDistance = Math.max(0, bodyHeight - verticalVisibleDistance + footerHeight);
        const horizontalDistance = Math.max(0, headerWidth - horizontalVisibleDistance);
        const thumbEndInset = getScrollbarThumbEndInset(this.ctx.config);
        if (this.type === 'vertical') {
            this.visibleDistance = verticalVisibleDistance;
            this.distance = verticalDistance;
            const cornerOffset = getScrollbarCornerOffset(this.ctx.config, horizontalDistance > 0);
            this.thumbTrackDistance = Math.max(0, this.visibleDistance - cornerOffset);
            this.trackX = visibleWidth - overlayScrollerTrackSize;
            this.trackY = 0;
            // 分割线
            this.splitPoints = [this.trackX, headerHeight, this.trackX + overlayScrollerTrackSize, headerHeight];
            this.trackWidth = overlayScrollerTrackSize;
            this.trackHeight = Math.max(0, visibleHeight - cornerOffset);
            // 滚动条的X位置=轨道的X位置+（轨道的宽度-滚动条的宽度）/2
            this.barX = this.trackX - 1 + (overlayScrollerTrackSize - SCROLLER_SIZE) / 2;
            this.barWidth = SCROLLER_SIZE;
            this.barHeight = getScrollbarThumbSize(
                this.distance,
                this.visibleDistance,
                bodyHeight + footerHeight,
                this.thumbTrackDistance,
            );
            this.thumbTravelDistance = Math.max(0, this.thumbTrackDistance - this.barHeight - thumbEndInset);
            // 最小30,超出可见区域则隐藏
            const progress = this.distance ? this.scroll / this.distance : 0;
            this.barY = headerHeight + progress * this.thumbTravelDistance;
            // 范围限制
            this.scroll = Math.max(0, Math.min(this.scroll, this.distance));
        } else {
            this.visibleDistance = horizontalVisibleDistance;
            this.distance = horizontalDistance;
            const cornerOffset = getScrollbarCornerOffset(this.ctx.config, verticalDistance > 0);
            this.thumbTrackDistance = Math.max(0, this.visibleDistance - cornerOffset);
            // 分割线
            this.splitPoints = [
                visibleWidth - overlayScrollerTrackSize,
                visibleHeight - overlayScrollerTrackSize,
                visibleWidth - overlayScrollerTrackSize,
                visibleHeight,
            ];
            const offset = shouldDrawScrollerBorder(BORDER) ? 0 : 0.5; // 解决边框问题，补偿0.5px
            this.trackX = 0;
            this.trackY = visibleHeight - overlayScrollerTrackSize + offset;
            this.trackWidth = Math.max(0, visibleWidth - cornerOffset);
            this.trackHeight = overlayScrollerTrackSize;

            this.barWidth = getScrollbarThumbSize(
                this.distance,
                this.visibleDistance,
                headerWidth,
                this.thumbTrackDistance,
            );
            this.thumbTravelDistance = Math.max(0, this.thumbTrackDistance - this.barWidth - thumbEndInset);
            this.barY = this.trackY - 1 + (overlayScrollerTrackSize - SCROLLER_SIZE) / 2;
            // 最小30,超出可见区域则隐藏
            this.barHeight = SCROLLER_SIZE;
            const progress = this.distance ? this.scroll / this.distance : 0;
            this.barX = progress * this.thumbTravelDistance;
            // 范围限制
            this.scroll = Math.max(0, Math.min(this.scroll, this.distance));
        }
    }
    draw(): boolean {
        const {
            config: { SCROLLER_FOCUS_COLOR, SCROLLER_COLOR, BORDER_COLOR, BORDER, SCROLLER_TRACK_COLOR },
        } = this.ctx;
        this.updatedSize();
        if (this.isInnerMode() && !this.shouldDrawInnerScrollbar()) {
            return this.isFocus || this.isDragging;
        }
        const drawTrackBorder = shouldDrawScrollbarTrackBorder(this.ctx.config);
        const drawTrackBackground = shouldDrawScrollbarTrackBackground(this.ctx.config);
        const borderColor = drawTrackBorder && shouldDrawScrollerBorder(BORDER) ? BORDER_COLOR : 'transparent';
        const hasScrollbar = this.hasScrollbar();
        const drawTrack = shouldDrawScrollerTrack(BORDER, hasScrollbar);
        // 轨道
        if (drawTrackBackground && drawTrack) {
            this.ctx.paint.drawRect(this.trackX, this.trackY, this.trackWidth, this.trackHeight, {
                fillColor: SCROLLER_TRACK_COLOR,
            });
            this.drawTrackHeaderBackground();
            if (drawTrackBorder) {
                this.ctx.paint.drawRect(this.trackX, this.trackY, this.trackWidth, this.trackHeight, {
                    borderColor,
                });
                this.drawRightBoundaryBorder();
            }
        } else if (drawTrackBackground) {
            this.drawInactiveTrackBackground();
        }
        // 滚动条
        if (hasScrollbar) {
            this.ctx.paint.drawRect(this.barX, this.barY, this.barWidth, this.barHeight, {
                fillColor: this.isFocus || this.isDragging ? SCROLLER_FOCUS_COLOR : SCROLLER_COLOR,
                radius: 4,
            });
        }
        // 分割线范围外
        if (drawTrackBorder && drawTrack && this.splitPoints.length > 0) {
            this.ctx.paint.drawLine(this.splitPoints, {
                borderColor,
                borderWidth: 1,
            });
        }
        return this.isFocus || this.isDragging;
    }

    private drawTrackHeaderBackground() {
        if (this.type !== 'vertical' || this.trackWidth <= 0) {
            return;
        }
        const {
            header,
            config: { HEADER_BG_COLOR },
        } = this.ctx;
        const height = Math.max(0, Math.min(header.height, this.trackHeight));
        if (height <= 0) {
            return;
        }
        this.ctx.paint.drawRect(this.trackX, this.trackY, this.trackWidth, height, {
            fillColor: HEADER_BG_COLOR,
        });
    }

    private drawInactiveTrackBackground() {
        if (this.type !== 'vertical') {
            return;
        }
        const {
            footer,
            header,
            scrollY,
            stageHeight,
            config: {
                BODY_BG_COLOR,
                FOOTER_BG_COLOR,
                FOOTER_FIXED,
                FOOTER_POSITION,
                HEADER_BG_COLOR,
                SCROLLER_TRACK_SIZE = 0,
            },
        } = this.ctx;
        const bottom = Math.max(0, stageHeight - SCROLLER_TRACK_SIZE);
        if (bottom <= 0 || this.trackWidth <= 0) {
            return;
        }
        this.ctx.paint.drawRect(this.trackX, 0, this.trackWidth, bottom, {
            fillColor: BODY_BG_COLOR,
        });
        this.ctx.paint.drawRect(this.trackX, 0, this.trackWidth, header.height, {
            fillColor: HEADER_BG_COLOR,
        });
        if (!footer.height) {
            return;
        }
        const footerY = FOOTER_FIXED
            ? FOOTER_POSITION === 'top'
                ? header.height
                : bottom - footer.height
            : footer.y - scrollY;
        const y = Math.max(header.height, Math.min(footerY, bottom));
        const height = Math.max(0, Math.min(footer.height, bottom - y));
        if (height > 0) {
            this.ctx.paint.drawRect(this.trackX, y, this.trackWidth, height, {
                fillColor: FOOTER_BG_COLOR,
            });
        }
    }

    private drawRightBoundaryBorder() {
        const {
            stageHeight,
            config: { BORDER, BORDER_COLOR, SCROLLER_TRACK_SIZE = 0 },
        } = this.ctx;
        if (this.type !== 'vertical' || !shouldDrawRightBoundaryBorder(BORDER) || SCROLLER_TRACK_SIZE <= 0) {
            return;
        }
        const bottom = stageHeight - SCROLLER_TRACK_SIZE;
        if (bottom <= 0) {
            return;
        }
        this.ctx.paint.drawLine([this.trackX, 0, this.trackX, bottom], {
            borderColor: BORDER_COLOR,
            borderWidth: 1,
        });
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
        this.ctx.on('scrollToIndex', (rowIndex: number, colIndex: number, cellType: CellType = 'body') => {
            this.scrollToIndex(rowIndex, colIndex, cellType);
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
        const rect = this.ctx.containerElement.getBoundingClientRect();
        const isPointerInsideTable =
            e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        const verticalNeedsFullRedraw = this.verticalScrollbar.onMouseMove(e, isPointerInsideTable);
        const horizontalNeedsFullRedraw = this.horizontalScrollbar.onMouseMove(e, isPointerInsideTable);
        if (verticalNeedsFullRedraw || horizontalNeedsFullRedraw) {
            this.ctx.emit('draw');
        } else {
            this.draw();
        }
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
    scrollToFooterRowIndex(rowIndex: number) {
        const { body, config, footer } = this.ctx;
        if (config.FOOTER_FIXED) {
            return;
        }
        const row = footer.renderRows.find((item) => item.rowIndex === rowIndex);
        if (!row) {
            return;
        }
        this.setScrollY(row.y - body.y - (body.visibleHeight - row.height) / 2);
    }
    scrollToIndex(rowIndex: number, colIndex: number, cellType: CellType = 'body') {
        if (cellType === 'body') {
            this.scrollToRowIndex(rowIndex);
        } else if (cellType === 'footer') {
            this.scrollToFooterRowIndex(rowIndex);
        }
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
