import type Context from "./Context";
import type { Paint } from "./Paint";
import { Widget, WidgetConfig } from "./Widget"
export type IconSource = string | HTMLImageElement;
export interface IconConfig extends WidgetConfig {
    source?: HTMLImageElement;
    name: string;
    color: string;
}
export class Icon extends Widget {
    source?: HTMLImageElement;
    name: string;
    color: string = 'currentColor';
    constructor(context: Context, config: IconConfig) {
        super(context, config)
        this.name = config.name
        this.color = config.color || 'currentColor';
        this.source = config.source;
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
        paint.drawImage(this.source, this.x, this.y, this.width, this.height)
    }
}
