import { ScrollbarType } from "../types";
import Context from "./Context";
import { Paint } from "./Paint";
import { Widget } from "./Widget";

const THUMB_MIN_SIZE = 30;

class ScrollbarThumb extends Widget {
    private type: ScrollbarType;
    private ratio = 1;
    private pointerdownOffset = 0;
    private isDragging = false;
    private bgColor: string;

    constructor(context: Context, type: ScrollbarType) {
        super(context);
        this.type = type;
        this.zIndex = 1;
        const { SCROLLER_COLOR, SCROLLER_FOCUS_COLOR } = context.config;
        this.bgColor = SCROLLER_COLOR;
        this.on('pointerenter:self', () => {
            this.bgColor = SCROLLER_FOCUS_COLOR;
            this.context.scrollerFocus = true;
            this.context.draw();
        });
        this.on('pointerleave:self', () => {
            if (this.isDragging) return;
            this.bgColor = SCROLLER_COLOR;
            this.context.scrollerFocus = false;
            this.context.draw();
        });
        this.on('pointerdown:self', (e) => {
            this.isDragging = true;
            this.context.scrollerMove = true;
            const { x, y } = this.context.paint.getRelativePosition(e);
            this.pointerdownOffset = this.type === 'vertical' ? y - this.y : x - this.x;
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
            this.context.draw();
        });
        this.on('pointermove', (e) => {
            if (!this.isDragging) return;
            const { x, y } = this.context.paint.getRelativePosition(e);
            if (this.type === 'vertical') {
                this.setY(Math.max(0, Math.min(y - this.pointerdownOffset, this.maxY)));
            } else {
                this.setX(Math.max(0, Math.min(x - this.pointerdownOffset, this.maxX)));
            }
        });
        this.update();
    }
    get viewportSize() {
        const { SCROLLER_TRACK_SIZE } = this.context.config;
        const { stageHeight, stageWidth } = this.context;
        return this.type === 'vertical' ? stageHeight - SCROLLER_TRACK_SIZE : stageWidth - SCROLLER_TRACK_SIZE;
    }
    get contentSize() {
        const { sumHeight, sumWidth } = this.context.store;
        return this.type === 'vertical' ? sumHeight : sumWidth;
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
    private setY(y: number) {
        if (this.y === y) return;
        this.y = y;
        console.log(this.y);
        this.context.scroller.setScrollY(y * this.ratio);
        this.context.draw();
    }
    private setX(x: number) {
        if (this.x === x) return;
        this.x = x;
        this.context.scroller.setScrollX(x * this.ratio);
        this.context.draw();
    }
    setYByPointerEvent(e: PointerEvent) {
        const { y, x } = this.context.paint.getRelativePosition(e);
        if (this.type === 'vertical') {
            this.setY(y < this.y + this.height / 2 ? y : y - this.height);
        } else {
            this.setX(x < this.x + this.width / 2 ? x : x - this.width);
        }
    }
    update() {
        const { SCROLLER_TRACK_SIZE, SCROLLER_SIZE } = this.context.config;
        const padding = (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2;
        this.visible = this.contentSize > this.viewportSize && this.viewportSize > 0;
        if (!this.visible) return;
        const thumbLength = this.getThumbSize;
        const track = this.viewportSize - thumbLength;
        this.ratio = track > 0 ? (this.contentSize - this.viewportSize) / track : 1;
        if (this.type === 'vertical') {
            this.width = SCROLLER_SIZE;
            this.height = thumbLength;
            this.x = this.context.stageWidth - SCROLLER_TRACK_SIZE + padding;
            this.y = Math.max(0, Math.min(this.context.scrollY / this.ratio, this.maxY));
        } else {
            this.width = thumbLength;
            this.height = SCROLLER_SIZE;
            this.x = Math.max(0, Math.min(this.context.scrollX / this.ratio, this.maxX));
            this.y = this.context.stageHeight - SCROLLER_TRACK_SIZE + padding;
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
    private type: ScrollbarType;
    private scrollbarThumb: ScrollbarThumb;

    constructor(context: Context, type: ScrollbarType) {
        super(context);
        this.type = type;
        this.scrollbarThumb = new ScrollbarThumb(context, type);
        this.on('pointerdown:self', (e) => {
            console.log('Scrollbar');
            this.scrollbarThumb.setYByPointerEvent(e);
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
        this.scrollbarThumb.update();
        const { SCROLLER_TRACK_SIZE } = this.context.config;
        if (this.type === 'vertical') {
            this.x = this.context.stageWidth - SCROLLER_TRACK_SIZE;
            this.y = 0;
            this.width = SCROLLER_TRACK_SIZE;
            this.height = this.context.stageHeight - SCROLLER_TRACK_SIZE;
            return;
        }
        this.x = 0;
        this.y = this.context.stageHeight - SCROLLER_TRACK_SIZE;
        this.width = this.context.stageWidth - SCROLLER_TRACK_SIZE;
        this.height = SCROLLER_TRACK_SIZE;
    }
    render(paint: Paint) {
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: this.context.config.SCROLLER_TRACK_COLOR,
        });
    }
}

class Scrollbar {
    private scrollbarTrack: ScrollbarTrack;

    constructor(context: Context, type: ScrollbarType) {
        this.scrollbarTrack = new ScrollbarTrack(context, type);
    }
    update() {
        this.scrollbarTrack.update();
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
    private get maxScrollY() {
        const viewportSize = this.context.stageHeight - this.context.config.SCROLLER_TRACK_SIZE;
        return Math.max(0, this.context.store.sumHeight - viewportSize);
    }
    private get maxScrollX() {
        const viewportSize = this.context.stageWidth - this.context.config.SCROLLER_TRACK_SIZE;
        return Math.max(0, this.context.store.sumWidth - viewportSize);
    }
    update() {
        this.verticalScrollbar.update();
        this.horizontalScrollbar.update();
    }
    setScrollY(scrollY: number) {
        this.context.scrollY = Math.max(0, Math.min(scrollY, this.maxScrollY));
        this.context.draw();
    }
    setScrollX(scrollX: number) {
        this.context.scrollX = Math.max(0, Math.min(scrollX, this.maxScrollX));
        this.context.draw();
    }
}
