import Context from "./Context";
import { Paint } from "./Paint";
import { Widget } from "./Widget";

export default class Body extends Widget {
    constructor(context: Context) {
        super(context);
    }
    update() {
        const headerHeight = this.context.store.headerHeight;
        const { scrollbarGutter, stageWidth, stageHeight } = this.context;
        this.x = 0;
        this.y = headerHeight;
        this.width = stageWidth - scrollbarGutter;
        this.height = stageHeight - headerHeight - scrollbarGutter;
    }
    render(paint: Paint) {
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: this.context.config.bodyBgColor,
        });
    }
}