import type Context from "./Context";
import type { Paint } from "./Paint";
import { Widget, WidgetConfig } from "./Widget"
export type IconSource = string | HTMLImageElement;
export interface IconConfig extends WidgetConfig {
    source?: HTMLImageElement;
    name: string;
    color: string;
    /** 绕自身中心顺时针旋转的角度，单位度 */
    rotate?: number;
}
export class Icon extends Widget {
    source?: HTMLImageElement;
    name: string;
    color: string = 'currentColor';
    rotate = 0;
    constructor(context: Context, config: IconConfig) {
        super(context, config)
        this.name = config.name
        this.color = config.color || 'currentColor';
        this.source = config.source;
        this.rotate = config.rotate ?? 0;
        this.on('pointerenter:self', () => {
            this.context.paint.setCursor('pointer')
        })
        this.on('pointerleave:self', () => {
            this.context.paint.setCursor('default')
        })
    }
    render(paint: Paint): void {
        if (!this.source) {
            return;
        }
        paint.drawImage(this.source, this.x, this.y, this.width, this.height, this.rotate)
    }
}
