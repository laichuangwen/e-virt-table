import Context from "./Context";
import { Widget } from "./Widget";
import Header from "./Header";
import Body from "./Body";
import Scrollbar from "./Scrollbar";

export default class Table extends Widget {
    private header: Header;
    private body: Body;
    private verticalScrollbar: Scrollbar;
    private horizontalScrollbar: Scrollbar;
    constructor(context: Context) {
        super(context);
        this.header = new Header(context);
        this.body = new Body(context);
        this.verticalScrollbar = new Scrollbar(context, 'vertical');
        this.horizontalScrollbar = new Scrollbar(context, 'horizontal');
        this.setChildren([this.header, this.body, this.verticalScrollbar, this.horizontalScrollbar]);
        this.context.listener.on('resizeObserver',
            () => {
                // 重新设置滚动条位置,防止溢出了
                this.setScrollX(context.scrollX);
                this.setScrollY(context.scrollY);
                context.draw()
            }
        );
        this.on('pointerenter:self', (e) => {
            this.context.listener.emit('pointerenter:table', e);
            this.context.isTableHovering = true;
            this.context.draw();
        });
        this.on('pointerleave:self', (e) => {
            this.context.listener.emit('pointerleave:table', e);
            this.context.isTableHovering = false;
            this.context.draw();
        });
    }
    getAllWidgets() {
        const allWidgets: Widget[] = [];
        const loop = (widget: Widget) => {
            allWidgets.push(widget);
            for (const child of widget.getChildren()) loop(child);
        };
        loop(this);
        // console.log('allWidgets=>>', allWidgets);
        return allWidgets;
    }
    setScrollY(scrollY: number) {
        const _scrollY = Math.max(0, Math.min(Math.round(scrollY), this.verticalScrollbar.maxScroll));
        if (this.context.scrollY === _scrollY) return;
        this.context.scrollY = _scrollY;
        this.context.draw();
    }
    setScrollX(scrollX: number) {
        const _scrollX = Math.max(0, Math.min(Math.round(scrollX), this.horizontalScrollbar.maxScroll));
        if (this.context.scrollX === _scrollX) return;
        this.context.scrollX = _scrollX;
        this.context.draw();
    }
    update() {
        this.x = 0;
        this.y = 0;
        this.width = this.context.stageWidth;
        this.height = this.context.stageHeight;
        this.context.scrollbarGutter = this.verticalScrollbar.scrollbarGutter;
        this.context.maxScrollY = this.verticalScrollbar.maxScroll;
        this.context.maxScrollX = this.horizontalScrollbar.maxScroll;
        super.update();
        console.log('table update', this.getChildren());
    }
    destroy() {
    }
}
