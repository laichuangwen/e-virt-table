import { ScrollbarType } from "../types";
import Context from "./Context";
import { Paint } from "./Paint";
import { Shape, ShapeConfig } from "./Shape";

function getScrollbarThumbConfig(context: Context, scrollbar: Scrollbar): ShapeConfig {
    const { SCROLLER_SIZE, SCROLLER_TRACK_SIZE } = context.config;
    if (scrollbar.type === 'vertical') {
        // body + footer
        const contentDistance = context.store.sumHeight;
        const visibleDistance = scrollbar.height;
        // const trackDistance = scrollbar.distance;
        const size = Math.floor((visibleDistance / contentDistance) * visibleDistance);
        return {
            x: scrollbar.x + (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2,
            y: 0,
            width: SCROLLER_SIZE,
            height: Math.min(30, size),
        };
    }
    const contentDistance = context.store.sumWidth;
    const visibleDistance = scrollbar.width;
    const size = Math.floor((visibleDistance / contentDistance) * visibleDistance);
    return {
        x: 0,
        y: scrollbar.y + (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2,
        width: Math.min(30, size),
        height: SCROLLER_SIZE,
    };
}

class ScrollbarThumb extends Shape {
    private scrollbar: Scrollbar;
    private color: string;
    constructor(context: Context, scrollbar: Scrollbar) {
        super(context, getScrollbarThumbConfig(context, scrollbar));
        this.scrollbar = scrollbar;
        const { SCROLLER_COLOR, SCROLLER_FOCUS_COLOR } = context.config;
        this.color = SCROLLER_COLOR;
        this.on('pointerenter:self', () => {
            this.color = SCROLLER_FOCUS_COLOR;
            this.context.draw();
        });
        this.on('pointerleave:self', () => {
            this.color = SCROLLER_COLOR;
            this.context.draw();
        });
        this.on('pointerdown:self', () => {
            console.log('ScrollbarThumb=>pointerdown:self');
        }, {
            stopPropagation: true,
        });
        this.on('pointerup', () => {
            console.log('ScrollbarThumb=>pointerup:self');
        });
        console.log('ScrollbarThumb', this.x, this.y, this.width, this.height);
    }
    render(paint: Paint) {
        const config = getScrollbarThumbConfig(this.context, this.scrollbar);
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: this.color,
            radius: 4,
        });
    }
}

function getScrollbarConfig(context: Context, type: ScrollbarType): ShapeConfig {
    const { SCROLLER_TRACK_SIZE } = context.config;
    if (type === 'vertical') {
        return {
            x: context.stageWidth - SCROLLER_TRACK_SIZE,
            y: 0,
            width: SCROLLER_TRACK_SIZE,
            height: context.stageHeight - SCROLLER_TRACK_SIZE,
        };
    }
    return {
        x: 0,
        y: context.stageHeight - SCROLLER_TRACK_SIZE,
        width: context.stageWidth - SCROLLER_TRACK_SIZE,
        height: SCROLLER_TRACK_SIZE,
    };
}

class Scrollbar extends Shape {
    private thumb!: ScrollbarThumb;
    type: ScrollbarType;
    constructor(context: Context, type: ScrollbarType) {
        super(context, getScrollbarConfig(context, type));
        this.type = type;
        this.on('pointerdown:self', () => {
            console.log('Scrollbar', this.type);
        });
        this.on('pointerenter:self', () => {
            this.context.paint.setCursor('pointer');
        });
        this.on('pointerleave:self', () => {
            this.context.paint.setCursor('default');
        });
        this.thumb = new ScrollbarThumb(this.context, this);
    }
    render(paint: Paint) {
        const config = getScrollbarConfig(this.context, this.type);
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        const { SCROLLER_TRACK_COLOR } = this.context.config;
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: SCROLLER_TRACK_COLOR,
        });
    }
}
export default class Scroller {
    private context: Context;
    private verticalScrollbar: Scrollbar;
    private horizontalScrollbar: Scrollbar;
    constructor(context: Context) {
        this.context = context;
        this.verticalScrollbar = new Scrollbar(this.context, 'vertical');
        this.horizontalScrollbar = new Scrollbar(this.context, 'horizontal');
    }
}