import Context from "./Context";
import { RectOptions } from "./Paint";

export default class CellImage {
    source?: HTMLImageElement;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visible = true;
    constructor(name: string, x: number, y: number, width: number, height: number, source?: HTMLImageElement) {
        this.source = source;
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    drawWrapper(ctx: Context, options: RectOptions) {
        ctx.paint.drawRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4, {
            radius: 4,
            borderWidth: 1,
            ...options,
        });
    }
    setVisible(visible: boolean) {
        this.visible = visible;
    }
    isInside(
        mouseX: number,
        mouseY: number
    ) {
        if (this.source && mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height) {
            return true;
        }
        return false;
    }
}