import { offset } from '@floating-ui/dom';
import { ScrollbarType } from "../types";
import Context from "./Context";
import { Paint } from "./Paint";
import { Widget } from "./Widget";

const THUMB_MIN_SIZE = 30;
const Z_INDEX = 10000;

class ScrollbarThumb extends Widget {
    private scrollbar: Scrollbar;
    private ratio = 1;
    private pointerdownOffset = 0;
    private isDragging = false;
    private bgColor: string;
    private touchClient = 0;
    private touchScroll = 0;
    private touchPanning = false;
    constructor(scrollbar: Scrollbar) {
        super(scrollbar.context);
        this.scrollbar = scrollbar;
        const { scrollbarThumbColor, scrollbarThumbFocusColor } = this.context.config;
        this.bgColor = scrollbarThumbColor;
        this.on('pointerenter:self', () => {
            this.bgColor = scrollbarThumbFocusColor;
            this.context.scrollerFocus = true;
            this.context.paint.setCursor('pointer');
            this.draw();
        });
        this.on('pointerleave:self', () => {
            if (this.isDragging) return;
            this.bgColor = scrollbarThumbColor;
            this.context.scrollerFocus = false;
            this.context.paint.setCursor('default');
            this.draw();
        });
        this.on('pointerdown:self', (e) => {
            this.isDragging = true;
            this.context.scrollerMove = true;
            const { x, y } = this.context.paint.getRelativePosition(e);
            this.pointerdownOffset = this.scrollbar.isVertical() ? y - this.y : x - this.x;
        }, {
            stopPropagation: true,
        });
        this.on('pointerup', (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.context.scrollerMove = false;
            this.context.scrollerFocus = false;
            this.pointerdownOffset = 0;
            if (!this.insideByEvent(e)) {
                this.bgColor = scrollbarThumbColor;
            };
            this.draw();
        });
        this.on('pointermove', (e) => {
            if (!this.isDragging) return;
            const { x, y } = this.context.paint.getRelativePosition(e);
            if (this.isVertical()) {
                this.setY(y - this.pointerdownOffset);
            } else {
                this.setX(x - this.pointerdownOffset);
            }
        });
        this.on('wheel', (e) => {
            if (this.isVertical() && e.shiftKey === false) {
                this.context.setScrollY(this.context.scrollY + e.deltaY);
            } else if (this.isHorizontal() && e.shiftKey === false) {
                this.context.setScrollX(this.context.scrollX + e.deltaX);
            } else if (this.isVertical() && e.shiftKey === true) {
                this.context.setScrollX(this.context.scrollX + e.deltaY);
            }
        });
        this.on('touchstart', (e) => {
            const touch = e.touches[0];
            if (!touch) return;
            if (this.isDragging || this.context.scrollerMove || this.isOnScrollbar(e)) {
                this.touchPanning = false;
                return;
            }
            this.touchPanning = true;
            this.touchClient = this.isVertical() ? touch.clientY : touch.clientX;
            this.touchScroll = this.isVertical() ? this.context.scrollY : this.context.scrollX;
        });
        this.on('touchmove', (e) => {
            if (!this.touchPanning) return;
            const touch = e.touches[0];
            if (!touch) return;
            const client = this.isVertical() ? touch.clientY : touch.clientX;
            const delta = client - this.touchClient;
            const next = Math.max(0, Math.min(Math.round(this.touchScroll - delta), this.scrollbar.maxScroll));
            const atEdge = (next === 0 && delta > 0) || (next === this.scrollbar.maxScroll && delta < 0);
            if (this.scrollbar.maxScroll > 0 && !atEdge) {
                e.preventDefault();
            }
            if (this.isVertical()) {
                if (next === this.context.scrollY) return;
                this.context.setScrollY(next);
                return;
            }
            if (next === this.context.scrollX) return;
            this.context.setScrollX(next);
        });
        this.update();
    }
    get offset() {
        return this.scrollbar.offset;
    }
    get viewportSize() {
        return this.scrollbar.viewportSize;
    }
    get contentSize() {
        return this.scrollbar.contentSize;
    }
    get getThumbSize() {
        const size = Math.floor((this.viewportSize / this.contentSize) * this.viewportSize);
        return Math.min(this.viewportSize, Math.max(THUMB_MIN_SIZE, size));
    }
    get maxY() {
        return this.offset + this.viewportSize - this.height;
    }
    get maxX() {
        return this.offset + this.viewportSize - this.width;
    }
    private isVertical() {
        return this.scrollbar.isVertical();
    }
    private isHorizontal() {
        return this.scrollbar.isHorizontal();
    }
    private setY(y: number) {
        const next = Math.max(this.offset, Math.min(y, this.maxY));
        if (this.y === next) return;
        this.y = next;
        this.context.setScrollY((next - this.offset) * this.ratio);
    }
    private setX(x: number) {
        const next = Math.max(this.offset, Math.min(x, this.maxX));
        if (this.x === next) return;
        this.x = next;
        this.context.setScrollX((next - this.offset) * this.ratio);
    }
    private isOnScrollbar(e: TouchEvent) {
        return this.scrollbar.insideByEvent(e);
    }
    setXYByPointerEvent(e: PointerEvent) {
        const { y, x } = this.context.paint.getRelativePosition(e);
        if (this.isVertical()) {
            this.setY(y < this.y + this.height / 2 ? y : y - this.height);
        } else {
            this.setX(x < this.x + this.width / 2 ? x : x - this.width);
        }
    }
    update() {
        this.visible = this.scrollbar.visible;
        /** 如果inner模式下，表格不在hover状态，则隐藏滚动条滑块 */
        if (!this.scrollbar.isOuterMode && !this.isDragging && !this.context.isTableHovering) {
            this.visible = false;
        }
        const { scrollbarTrackSize, scrollbarThumbSize } = this.context.config;
        this.zIndex = Z_INDEX + 100;
        const padding = (scrollbarTrackSize - scrollbarThumbSize - 2) / 2;
        if (!this.visible) return;
        const thumbLength = this.getThumbSize;
        const track = this.viewportSize - thumbLength;
        this.ratio = track > 0 ? (this.contentSize - this.viewportSize) / track : 1;
        const isVertical = this.isVertical();
        const scroll = isVertical ? this.context.scrollY : this.context.scrollX;
        const maxPos = isVertical ? this.maxY : this.maxX;
        const thumbPos = Math.max(
            this.offset,
            Math.min(this.offset + scroll / this.ratio, maxPos),
        );
        if (isVertical) {
            this.width = scrollbarThumbSize;
            this.height = thumbLength;
            this.x = this.scrollbar.x + padding;
            this.y = thumbPos;
        } else {
            this.width = thumbLength;
            this.height = scrollbarThumbSize;
            this.x = thumbPos;
            this.y = this.scrollbar.y + padding;
        }

    }
    render(paint: Paint) {
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: this.bgColor,
            radius: 4,
        });
    }
}

class ScrollbarTrack extends Widget {
    private scrollbar: Scrollbar;
    constructor(scrollbar: Scrollbar) {
        const { context } = scrollbar;
        super(context);
        this.zIndex = Z_INDEX + 1;
        this.scrollbar = scrollbar;
        this.on('pointerdown:self', (e) => {
            this.scrollbar.scrollbarThumb.setXYByPointerEvent(e);
        });
        this.on('pointerenter:self', () => {
            this.context.paint.setCursor('pointer');
        });
        this.on('pointerleave:self', () => {
            this.context.paint.setCursor('default');
        });
        this.update();
    }
    update() {
        const { x, y, height, width, offset } = this.scrollbar;
        this.visible = this.scrollbar.visible;
        if (this.scrollbar.isVertical()) {
            this.x = x;
            this.y = y + offset;
            this.width = width;
            this.height = height - offset;
        } else {
            this.x = x + offset;
            this.y = y;
            this.width = width - offset;
            this.height = height;
        }
    }
    render(paint: Paint) {
        if (this.scrollbar.isOuterMode) {
            paint.drawRect(this.x, this.y, this.width, this.height, {
                borderColor: this.context.config.borderColor,
                fillColor: this.context.config.scrollbarTrackColor,
            });
        }

    }
}

export default class Scrollbar extends Widget {
    type: ScrollbarType;
    scrollbarTrack: ScrollbarTrack;
    scrollbarThumb: ScrollbarThumb;
    constructor(context: Context, type: ScrollbarType) {
        super(context);
        this.zIndex = Z_INDEX;
        this.type = type;
        this.scrollbarTrack = new ScrollbarTrack(this);
        this.scrollbarThumb = new ScrollbarThumb(this);
        this.setChildren([this.scrollbarTrack, this.scrollbarThumb]);
    }
    get isOuterMode() {
        return this.context.config.scrollbarMode === 'outer';
    }
    /** 内容区为滚动条让出的空隙：outer 占用，inner 覆盖不占位 */
    get scrollbarGutter() {
        const { scrollbarTrackSize } = this.context.config;
        return this.isOuterMode ? scrollbarTrackSize : 0;
    }
    get offset() {
        return this.isVertical() ? this.context.store.headerHeight : 0;
    }
    get trackSize() {
        const { scrollbarTrackSize } = this.context.config;
        const { stageHeight, stageWidth } = this.context;
        return this.isVertical() ? stageHeight - scrollbarTrackSize : stageWidth - scrollbarTrackSize;
    }
    get viewportSize() {
        return Math.max(0, this.trackSize - this.offset);
    }
    get contentSize() {
        const { sumHeight, sumWidth } = this.context.store;
        const { scrollbarTrackSize } = this.context.config;
        const scrollbarGutter = this.isOuterMode ? 0 : scrollbarTrackSize;
        // inner 滚动条会占内容一些，所以得减，outer不占用内容
        return this.isVertical() ? sumHeight - scrollbarGutter : sumWidth - scrollbarGutter;
    }
    get maxScroll() {
        return Math.max(0, this.contentSize - this.viewportSize);
    }
    private getX() {
        const { scrollbarTrackSize } = this.context.config;
        return this.isVertical() ? this.context.stageWidth - scrollbarTrackSize : 0;
    }
    private getY() {
        const { scrollbarTrackSize } = this.context.config;
        return this.isVertical() ? 0 : this.context.stageHeight - scrollbarTrackSize;
    }
    private getWidth() {
        const { scrollbarTrackSize } = this.context.config;
        return this.isVertical() ? scrollbarTrackSize : this.trackSize;
    }
    private getHeight() {
        const { scrollbarTrackSize } = this.context.config;
        return this.isVertical() ? this.trackSize : scrollbarTrackSize;
    }
    isVertical() {
        return this.type === 'vertical';
    }
    isHorizontal() {
        return !this.isVertical();
    }
    render(paint: Paint) {
        if (this.isOuterMode) {
            const { borderColor } = this.context.config;
            paint.drawRect(this.x, this.y, this.width, this.height, {
                borderColor,
            });
            if (this.isVertical()) {
                paint.drawRect(this.x, this.y, this.width, this.offset, {
                    fillColor: this.context.config.headerBgColor,
                });
            }
        }
    }
    update() {
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.x = this.getX();
        this.y = this.getY();
        this.visible = this.contentSize > this.viewportSize && this.viewportSize > 0;
        this.scrollbarTrack.update();
        this.scrollbarThumb.update();
    }
}
