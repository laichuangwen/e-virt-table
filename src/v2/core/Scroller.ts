import { ScrollbarType } from "../types";
import Context from "./Context";
import { Paint } from "./Paint";
import { Widget } from "./Widget";

const THUMB_MIN_SIZE = 30;

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
        const { SCROLLER_COLOR, SCROLLER_FOCUS_COLOR } = this.context.config;
        this.bgColor = SCROLLER_COLOR;
        this.on('pointerenter:self', () => {
            this.bgColor = SCROLLER_FOCUS_COLOR;
            this.context.scrollerFocus = true;
            this.draw();
        });
        this.on('pointerleave:self', () => {
            if (this.isDragging) return;
            this.bgColor = SCROLLER_COLOR;
            this.context.scrollerFocus = false;
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
                this.bgColor = SCROLLER_COLOR;
            };
            this.draw();
        });
        this.on('pointermove', (e) => {
            if (!this.isDragging) return;
            const { x, y } = this.context.paint.getRelativePosition(e);
            if (this.isVertical()) {
                this.setY(Math.max(0, Math.min(y - this.pointerdownOffset, this.maxY)));
            } else {
                this.setX(Math.max(0, Math.min(x - this.pointerdownOffset, this.maxX)));
            }
        });
        this.on('wheel', (e) => {
            if (this.isVertical() && e.shiftKey === false) {
                this.context.scroller.setScrollY(this.context.scrollY + e.deltaY);
            } else if (this.isHorizontal() && e.shiftKey === false) {
                this.context.scroller.setScrollX(this.context.scrollX + e.deltaX);
            } else if (this.isVertical() && e.shiftKey === true) {
                this.context.scroller.setScrollX(this.context.scrollX + e.deltaY);
            }
        });
        this.on('touchstart', (e) => this.onTouchStart(e));
        this.on('touchmove', (e) => this.onTouchMove(e));
        this.update();
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
        return this.viewportSize - this.height;
    }
    get maxX() {
        return this.viewportSize - this.width;
    }
    private isVertical() {
        return this.scrollbar.isVertical();
    }
    private isHorizontal() {
        return this.scrollbar.isHorizontal();
    }
    private setY(y: number) {
        if (this.y === y) return;
        this.y = y;
        this.context.scroller.setScrollY(y * this.ratio);
        this.context.draw();
    }
    private setX(x: number) {
        if (this.x === x) return;
        this.x = x;
        this.context.scroller.setScrollX(x * this.ratio);
        this.context.draw();
    }
    private isOnScrollbar(e: TouchEvent) {
        return this.scrollbar.insideByEvent(e);
    }
    private onTouchStart(e: TouchEvent) {
        const touch = e.touches[0];
        if (!touch) return;
        if (this.isDragging || this.context.scrollerMove || this.isOnScrollbar(e)) {
            this.touchPanning = false;
            return;
        }
        this.touchPanning = true;
        this.touchClient = this.isVertical() ? touch.clientY : touch.clientX;
        this.touchScroll = this.isVertical() ? this.context.scrollY : this.context.scrollX;
    }
    private onTouchMove(e: TouchEvent) {
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
            this.context.scroller.setScrollY(next);
            return;
        }
        if (next === this.context.scrollX) return;
        this.context.scroller.setScrollX(next);
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
        const { SCROLLER_TRACK_SIZE, SCROLLER_SIZE } = this.context.config;
        const padding = (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2;
        this.visible = this.scrollbar.visible;
        if (!this.visible) return;
        const thumbLength = this.getThumbSize;
        const track = this.viewportSize - thumbLength;
        this.ratio = track > 0 ? (this.contentSize - this.viewportSize) / track : 1;
        if (this.isVertical()) {
            this.width = SCROLLER_SIZE;
            this.height = thumbLength;
            this.x = this.scrollbar.x + padding;
            this.y = Math.max(0, Math.min(this.context.scrollY / this.ratio, this.maxY));
        } else {
            this.width = thumbLength;
            this.height = SCROLLER_SIZE;
            this.x = Math.max(0, Math.min(this.context.scrollX / this.ratio, this.maxX));
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
        const { x, y, height, width } = this.scrollbar;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = this.scrollbar.visible;
    }
    render(paint: Paint) {
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: this.context.config.SCROLLER_TRACK_COLOR,
        });
    }
}

class Scrollbar extends Widget {
    type: ScrollbarType;
    scrollbarTrack: ScrollbarTrack;
    scrollbarThumb: ScrollbarThumb;

    constructor(context: Context, type: ScrollbarType) {
        super(context);
        this.type = type;
        this.scrollbarTrack = new ScrollbarTrack(this);
        this.scrollbarThumb = new ScrollbarThumb(this);
    }
    get offset() {
        return this.isVertical() ? 50 : 0;
    }
    get viewportSize() {
        const { SCROLLER_TRACK_SIZE } = this.context.config;
        const { stageHeight, stageWidth } = this.context;
        return this.isVertical() ? stageHeight - SCROLLER_TRACK_SIZE : stageWidth - SCROLLER_TRACK_SIZE;
    }
    get contentSize() {
        const { sumHeight, sumWidth } = this.context.store;
        return this.isVertical() ? sumHeight : sumWidth;
    }
    get maxScroll() {
        return Math.max(0, this.contentSize - this.viewportSize);
    }
    private getX() {
        const { SCROLLER_TRACK_SIZE } = this.context.config;
        return this.isVertical() ? this.context.stageWidth - SCROLLER_TRACK_SIZE : 0;
    }
    private getY() {
        const { SCROLLER_TRACK_SIZE } = this.context.config;
        return this.isVertical() ? 0 : this.context.stageHeight - SCROLLER_TRACK_SIZE;
    }
    private getWidth() {
        const { SCROLLER_TRACK_SIZE } = this.context.config;
        return this.isVertical() ? SCROLLER_TRACK_SIZE : this.viewportSize;
    }
    private getHeight() {
        const { SCROLLER_TRACK_SIZE } = this.context.config;
        return this.isVertical() ? this.viewportSize : SCROLLER_TRACK_SIZE;
    }
    isVertical() {
        return this.type === 'vertical';
    }
    isHorizontal() {
        return !this.isVertical();
    }
    render(paint: Paint) {
        // paint.drawRect(this.x, this.y, this.width, this.height, {
        //     borderWidth: 1,
        //     borderColor: this.context.config.BORDER_COLOR,
        // });
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

export default class Scroller {
    private context: Context;
    private verticalScrollbar: Scrollbar;
    private horizontalScrollbar: Scrollbar;

    constructor(context: Context) {
        this.context = context;
        this.verticalScrollbar = new Scrollbar(context, 'vertical');
        this.horizontalScrollbar = new Scrollbar(context, 'horizontal');
    }
    update() {
        this.verticalScrollbar.update();
        this.horizontalScrollbar.update();
    }
    setScrollY(scrollY: number) {
        this.context.scrollY = Math.max(0, Math.min(Math.round(scrollY), this.verticalScrollbar.maxScroll));
        this.context.draw();
    }
    setScrollX(scrollX: number) {
        this.context.scrollX = Math.max(0, Math.min(Math.round(scrollX), this.horizontalScrollbar.maxScroll));
        this.context.draw();
    }
}
