import Context from "./Context";
import { Paint } from "./Paint";
import { Widget } from "./Widget";
import { Icon } from "./Icon";
import checkboxCheck from "../svg/checkbox-check.svg?raw";

export default class Header extends Widget {
    private icon: Icon;
    constructor(context: Context) {
        super(context);
        this.zIndex = 1000;
        this.icon = new Icon(this.context, {
            name: 'checkbox-check',
            source: checkboxCheck,
            x: 0,
            y: 0,
            width: 20,
            height: 20,
            color: 'blue',
            zIndex:1200
        })
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