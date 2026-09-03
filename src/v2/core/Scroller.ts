import { ScrollbarType } from "../types";
import Context from "./Context";
import { Paint } from "./Paint";
import { Shape, ShapeConfig } from "./Shape";
type ScrollbarThumbConfig = ShapeConfig & {
    ratio: number;
}
function getScrollbarThumbConfig(context: Context, scrollbar: Scrollbar): ScrollbarThumbConfig {
    const MIN_SIZE = 30;
    const { SCROLLER_SIZE, SCROLLER_TRACK_SIZE } = context.config;
    const padding = (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2;
    const getThumbSize = (sum: number, scrollbarSize: number) => {
        const size = Math.floor((scrollbarSize / sum) * scrollbarSize);
        return Math.max(MIN_SIZE, size);
    }
    const getThumbVisible = (sum: number, scrollbarSize: number) => {
        return sum > scrollbarSize;
    }
    // 获取比例
    const getRatio = (sum: number, scrollbarSize: number) => {
        const thumbSize = getThumbSize(sum, scrollbarSize);
        // 4位小数
        return (sum - scrollbarSize) / (scrollbarSize - thumbSize);
    }
    if (scrollbar.type === 'vertical') {
        const ratio = getRatio(context.store.sumHeight, scrollbar.height);
        return {
            x: scrollbar.x + padding,
            y: context.scrollY / ratio,// 根据比例计算滚动条位置
            width: SCROLLER_SIZE,
            height: getThumbSize(context.store.sumHeight, scrollbar.height),
            visible: getThumbVisible(context.store.sumHeight, scrollbar.height),
            ratio,
        };
    }
    const ratio = getRatio(context.store.sumWidth, scrollbar.width);
    console.log('scrollbar',scrollbar.width);
    return {
        x: context.scrollX / ratio,
        y: scrollbar.y + padding,
        width: getThumbSize(context.store.sumWidth, scrollbar.width),
        height: SCROLLER_SIZE,
        visible: getThumbVisible(context.store.sumWidth, scrollbar.width),
        ratio: getRatio(context.store.sumWidth, scrollbar.width),
    };
}

class ScrollbarThumb extends Shape {
    private ratio: number;
    private scrollbar: Scrollbar;
    private color: string;
    private pointerdownOffset = 0; // 鼠标按下时相对于滚动条的偏移量
    private isDragging = false;
    constructor(context: Context, scrollbar: Scrollbar) {
        const { ratio, ..._config } = getScrollbarThumbConfig(context, scrollbar);
        super(context, _config);
        this.ratio = ratio;
        this.scrollbar = scrollbar;
        const { SCROLLER_COLOR, SCROLLER_FOCUS_COLOR } = context.config;
        this.color = SCROLLER_COLOR;
        this.on('pointerenter:self', () => {
            this.color = SCROLLER_FOCUS_COLOR;
            this.context.draw();
        });
        this.on('pointerleave:self', () => {
            if (this.isDragging) return;
            this.color = SCROLLER_COLOR;
            this.context.draw();
        });
        this.on('pointerdown:self', (e) => {
            this.isDragging = true;
            const { x, y } = this.context.paint.getRelativePosition(e);
            this.pointerdownOffset = this.scrollbar.type === 'vertical' ? y - this.y : x - this.x;
        }, {
            stopPropagation: true,
        });
        this.on('pointerup', () => {
            this.isDragging = false;
            this.color = SCROLLER_COLOR;
            this.pointerdownOffset = 0;
            this.context.draw();
        });
        this.on('pointermove', (e) => {
            if (!this.isDragging) return;
            const { x, y } = this.context.paint.getRelativePosition(e);
            this.setXY(x, y);
            this.context.draw();
        });
    }
    get maxScrollSize() {
        return this.scrollbar.type === 'vertical' ? this.context.store.sumHeight - this.scrollbar.height : this.context.store.sumWidth - this.scrollbar.width;
    }
    init() {
        const config = getScrollbarThumbConfig(this.context, this.scrollbar);
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.visible = config.visible || false;
        this.ratio = config.ratio;
    }
    private setXY(x: number, y: number) {
        const config = getScrollbarThumbConfig(this.context, this.scrollbar);
        if (this.scrollbar.type === 'vertical') {
            const max = this.scrollbar.height - this.height;
            this.y = Math.max(0, Math.min(y - this.pointerdownOffset, max));
            this.x = config.x;
            this.context.scrollY = this.y * this.ratio;
        } else {
            const max = this.scrollbar.width - this.width;
            this.x = Math.max(0, Math.min(x - this.pointerdownOffset, max));
            this.y = config.y;
        }
    }
    render(paint: Paint) {
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
        this.on('resizeObserver', () => {
            this.init();
        });
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
    init() {
        const config = getScrollbarConfig(this.context, this.type);
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.thumb.init();
    }
    render(paint: Paint) {
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
    get getMaxScrollY() {
        return this.context.store.sumHeight - this.verticalScrollbar.height;
    }
    get getMaxScrollX() {
        return this.context.store.sumWidth - this.horizontalScrollbar.width;
    }
    setScrollY(scrollY: number) {
        this.verticalScrollbar.init();
        this.context.scrollY = Math.max(0, Math.min(scrollY, this.getMaxScrollY));
        this.context.draw();
    }
    setScrollX(scrollX: number) {
        this.horizontalScrollbar.init();
        this.context.scrollX = Math.max(0, Math.min(scrollX, this.getMaxScrollX));
        this.context.draw();
    }
}