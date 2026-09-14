import Context from "./Context";
import { Paint } from "./Paint";
import { Widget } from "./Widget";

export default class Body extends Widget {
    constructor(context: Context) {
        super(context);
        this.on('pointerdown:self', (e) => {
            console.log('body pointerdown', e);
        });
    }
    update() {
        this.x = 0;
        this.y = 100;
        this.width = this.context.stageWidth - 14;
        this.height = this.context.stageHeight - 100;
    }
    render(paint: Paint) {
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: 'pink',
        });
    }
}