import type Context from "./Context";
import type { Paint } from "./Paint";
import { Widget, WidgetConfig } from "./Widget"
export type IconSource = string | HTMLImageElement;
export interface IconConfig extends WidgetConfig {
    source: IconSource;
    name: string;
    color?: string;
}
export class Icon extends Widget {
    source!: IconSource;
    name: string;
    color: string = 'currentColor';
    constructor(context: Context, config: IconConfig) {
        super(context, { zIndex: 100, autoDraw: false, ...config })
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
    generateSource(source: IconSource) {
        if (source instanceof HTMLImageElement) {
            return source;
        }
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(source, 'image/svg+xml');
        const svg = svgDoc.documentElement;
        if (this.color) {
            // 控制填充颜色
            svg.querySelectorAll('*').forEach((element) => {
                const attrValue = element.getAttribute('fill');
                if (attrValue === 'currentColor' || attrValue === null) {
                    element.setAttribute('fill', this.color);
                }
            });
        }
        const img = new Image();
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
        img.src = url;
        return img;
    }
    render(paint: Paint): void {
        paint.drawImage(this.generateSource(this.source), this.x, this.y, this.width, this.height)
    }
}
