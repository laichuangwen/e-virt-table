import { Icon, IconConfig } from "./Icon";
import { Paint } from "./Paint";

export interface IconWithShadowConfig extends IconConfig {
    borderColor: string;
    fillColor: string;
    padding?: number;
    borderWidth?: number;
    radius?: number;
}

export class IconWithShadow extends Icon {
    borderColor: string;
    fillColor: string;
    padding: number;
    borderWidth: number;
    radius: number;

    constructor(paint: Paint, config: IconWithShadowConfig) {
        super(paint, config);
        this.borderColor = config.borderColor;
        this.fillColor = config.fillColor;
        this.padding = config.padding ?? 0;
        this.borderWidth = config.borderWidth ?? 1;
        this.radius = config.radius ?? 10;
    }
    render(paint: Paint): void {
        paint.drawRect(this.x, this.y, this.width, this.height, {
            radius: this.radius,
            borderWidth: this.borderWidth,
            borderColor: this.borderColor,
            fillColor: this.fillColor,
        });
        paint.drawImage(
            this.source as HTMLImageElement,
            this.x + this.padding,
            this.y + this.padding,
            this.width - this.padding * 2,
            this.height - this.padding * 2,
        );
    }
}
