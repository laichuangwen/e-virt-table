import Context from "./Context";
import { Widget } from "./Widget";
import { Paint } from "./Paint";
import Header from "./Header";
import Body from "./Body";

export default class Table extends Widget {
    private header: Header;
    private body: Body;
    constructor(context: Context) {
        super(context);
        this.header = new Header(context);
        this.body = new Body(context);
        this.context.listener.on('resizeObserver',
            () => {
                // 重新设置滚动条位置,防止溢出了
                context.scroller.setScrollX(context.scrollX);
                context.scroller.setScrollY(context.scrollY);
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
    update() {
        this.x = 0;
        this.y = 0;
        this.width = this.context.stageWidth;
        this.height = this.context.stageHeight;
    }
    render(paint: Paint) {
    }
}
