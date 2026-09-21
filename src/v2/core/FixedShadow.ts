import { Fixed } from "../types";
import Context from "./Context";
import { Paint } from "./Paint";
import { Widget, WidgetConfig } from "./Widget";
export interface FixedShadowConfig extends WidgetConfig {
    fixed: Fixed;
}
export default class FixedShadow extends Widget {
    private fixed: Fixed;
    constructor(context: Context, config: FixedShadowConfig) {
        super(context, config);
        this.fixed = config.fixed;
        this.visible = this.fixed === 'left' ? this.context.scrollX > 0 : this.context.scrollX < this.context.maxScrollX;
    }
    render(paint: Paint) {
        const {
            fixedShadowWidth,
            fixedShadowColor,
            fixedShadowFadeColor,
        } = this.context.config;
        const ctx = paint.getCtx();
        if (this.fixed === 'right') {
            const gradient = ctx.createLinearGradient(this.x - fixedShadowWidth, this.y, this.x, this.y);
            gradient.addColorStop(0, fixedShadowFadeColor);
            gradient.addColorStop(1, fixedShadowColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x - fixedShadowWidth, this.y, fixedShadowWidth, this.height);
        } else if (this.fixed === 'left') {
            const gradient = ctx.createLinearGradient(this.x + this.width, this.y, this.x + this.width + fixedShadowWidth, this.y);
            gradient.addColorStop(0, fixedShadowColor);
            gradient.addColorStop(1, fixedShadowFadeColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x + this.width, this.y, fixedShadowWidth, this.height);
        }
    }
}