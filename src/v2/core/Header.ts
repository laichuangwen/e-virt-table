import Context from "./Context";
import { Paint } from "./Paint";
import { Widget } from "./Widget";
export default class Header extends Widget {
    constructor(context: Context) {
        super(context);
        this.zIndex = 1000;
    }
    update() {
        this.width = this.context.stageWidth;
        this.height = 100;
        this.x = 0;
        this.y = 0;
    }
    render(paint: Paint) {
        paint.drawRect(0, 0, this.width, this.height, {
            fillColor: this.context.config.HEADER_BG_COLOR,
        });
    }
}