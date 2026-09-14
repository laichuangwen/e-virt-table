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
        super(context, { zIndex: 100, ...config })
        this.name = config.name
        this.color = config.color || 'currentColor';
        this.initSource(config.source)
        this.on('pointerenter:self', () => {
            this.context.paint.setCursor('pointer')
        })
        this.on('pointerleave:self', () => {
            this.context.paint.setCursor('default')
        })
        this.on('click:self', () => {
            console.log('click', this.name);
        }, { stopPropagation: true })
    }
    private initSource(source: IconSource): void {
        if (source instanceof HTMLImageElement) {
            this.source = source;
            return;
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
        img.onload = () => {
            this.source = img;
            this.draw();
        }
        this.source = img;
    }
    render(paint: Paint): void {
        paint.drawImage(this.source as HTMLImageElement, this.x, this.y, this.width, this.height)
    }
}
