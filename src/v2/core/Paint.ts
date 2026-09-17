import { Widget, WidgetEventMap } from "./Widget";

export interface LineOptions {
    lineCap?: CanvasLineCap;
    lineDash?: number[];
    lineDashOffset?: number;
    lineJoin?: CanvasLineJoin;
    borderWidth?: number;
    borderColor?: string | CanvasGradient | CanvasPattern;
    fillColor?: string | CanvasGradient | CanvasPattern;
};
export type PointerCursor =
    | 'default'
    | 'pointer'
    | 'move'
    | 'text'
    | 'grab'
    | 'grabbing'
    | 'col-resize'
    | 'row-resize'
    | 'crosshair'
    | 'not-allowed'
    | 'wait'
    | 'none';
export interface ShadowOptions {
    side: 'left' | 'right' | 'top' | 'bottom';
    shadowWidth: number;
    colorStart: string;
    colorEnd: string;
    fillColor?: string | CanvasGradient | CanvasPattern;
};
export interface RectOptions {
    borderWidth?: number;
    borderColor?: string;
    fillColor?: string;
    radius?: number | [number, number, number, number];
    lineDash?: number[];
    lineDashOffset?: number;
};
export class Paint {
    private ctx: CanvasRenderingContext2D
    private widgets: Widget[] = [];
    private target: HTMLCanvasElement | null = null
    constructor(target: HTMLCanvasElement | CanvasRenderingContext2D) {
        // 不能用 instanceof 判断；非 canvas 元素即视为已有 ctx。
        if (!(target instanceof HTMLCanvasElement)) {
            this.ctx = target
            return
        }
        this.target = target
        const ctx = target.getContext('2d')
        if (!ctx) throw new Error('canvas context not found')
        this.ctx = ctx
    }
    scale(dpr: number) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }
    addWidget(widget: Widget) {
        this.widgets.push(widget)
    }
    removeWidget(widget: Widget) {
        this.widgets = this.widgets.filter((item) => item !== widget)
    }
    getWidgets() {
        return this.widgets.sort((a, b) => a.zIndex - b.zIndex);
    }
    getAllWidgets() {
        // 获取所有 widget 和 子 widget，可以插到的父级
        const widgets = this.getWidgets();
        const allWidgets: Widget[] = [];
        const loop = (widgets: Widget[]) => {
            widgets.forEach(widget => {
                allWidgets.push(widget);
                if(widget.children.length) {
                    loop(widget.children);
                }
            });
        };
        loop(widgets);
        return allWidgets;
    }
    dispatchListener<K extends keyof WidgetEventMap>(eventName: K, e: WidgetEventMap[K]) {
        const allWidgets = this.getAllWidgets();
        for (let i = allWidgets.length - 1; i >= 0; i--) {
            if (allWidgets[i].dispatch(eventName, e)) break
        }
    }
    getRelativePosition(e: PointerEvent | MouseEvent | TouchEvent) {
        if (!(this.target instanceof HTMLCanvasElement)) {
            throw new Error('target is not a canvas element')
        }
        const point = 'clientX' in e ? e : (e.touches[0] ?? e.changedTouches[0])
        if (!point) {
            return { x: 0, y: 0 }
        }
        const rect = this.target.getBoundingClientRect()
        return {
            x: point.clientX - rect.left,
            y: point.clientY - rect.top,
        }
    }
    getCtx() {
        return this.ctx;
    }
    setCursor(cursor: PointerCursor) {
        if (this.target instanceof HTMLCanvasElement) {
            this.target.style.cursor = cursor;
        }
    }
    /**
     * 绘制单侧阴影
     */
    drawShadow(x: number, y: number, width: number, height: number, options: ShadowOptions): void {
        const { fillColor, side, shadowWidth, colorStart, colorEnd } = options;
        this.ctx.save();
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, y, width, height);
        }
        if (!Number.isFinite(shadowWidth) || shadowWidth <= 0) {
            this.ctx.restore();
            return;
        }
        let gradient: CanvasGradient;
        switch (side) {
            case 'left':
                gradient = this.ctx.createLinearGradient(x - shadowWidth, y, x, y);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x - shadowWidth, y, shadowWidth, height);
                break;
            case 'right':
                gradient = this.ctx.createLinearGradient(x + width, y, x + width + shadowWidth, y);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + width, y, shadowWidth, height);
                break;
            case 'top':
                gradient = this.ctx.createLinearGradient(x, y - shadowWidth, x, y);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, y - shadowWidth, width, shadowWidth);
                break;
            case 'bottom':
                gradient = this.ctx.createLinearGradient(x, y + height, x, y + height + shadowWidth);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, y + height, width, shadowWidth);
                break;
            default:
                console.error('Invalid side specified for shadow');
                break;
        }
        this.ctx.restore();
    }
    /**
     * 绘制线条
     */
    drawLine(points: number[], options: LineOptions) {
        if (points.length < 4 || points.length % 2 !== 0) {
            throw new Error('A valid array of points is required to draw a line');
        }
        this.ctx.save();
        const { borderColor = 'black', borderWidth = 1 } = options;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0] - 0.5, points[1] - 0.5);
        for (let i = 2; i < points.length; i += 2) {
            this.ctx.lineTo(points[i] - 0.5, points[i + 1] - 0.5);
        }
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        if (options.lineDash) {
            this.ctx.lineDashOffset = options.lineDashOffset ?? 0;
            this.ctx.setLineDash(options.lineDash);
        }

        if (options.fillColor) {
            this.ctx.fillStyle = options.fillColor;
            this.ctx.fill();
        }
        if (options.borderColor) {
            this.ctx.strokeStyle = options.borderColor;
        }
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }
    /**
     * 绘制图片
     */
    drawImage(img: CanvasImageSource, x: number, y: number, width: number, height: number) {
        this.ctx.save();
        this.ctx.drawImage(img, x, y, width, height);
        this.ctx.restore();
    }

    /**
     * 绘制矩形
     */
    drawRect(
        x: number,
        y: number,
        width: number,
        height: number,
        {
            borderWidth = 1,
            borderColor,
            fillColor,
            radius = 0,
            lineDash,
            lineDashOffset,
        }: RectOptions = {},
    ) {
        this.ctx.save();
        if (fillColor !== undefined) {
            this.ctx.fillStyle = fillColor;
        }
        if (borderColor !== undefined) {
            this.ctx.lineWidth = borderWidth;
            this.ctx.strokeStyle = borderColor;
        }
        if (lineDash) {
            this.ctx.lineDashOffset = lineDashOffset ?? 0;
            this.ctx.setLineDash(lineDash);
        }
        this.ctx.beginPath();
        if (radius === 0) {
            if (fillColor !== undefined) {
                this.ctx.fillRect(x, y, width, height);
            }
            // Keep the half-pixel offset for crisp 1px strokes only.
            this.ctx.rect(x - 0.5, y - 0.5, width, height);
        } else {
            // 确保 radius 是一个包含四个元素的数组
            const [tl, tr, br, bl] = typeof radius === 'number' ? [radius, radius, radius, radius] : radius;
            // 绘制圆角矩形路径
            this.ctx.moveTo(x + tl, y);
            this.ctx.arcTo(x + width, y, x + width, y + tr, tr); // draw right side and top-right corner
            this.ctx.arcTo(x + width, y + height, x + width - br, y + height, br); // draw bottom side and bottom-right corner
            this.ctx.arcTo(x, y + height, x, y + height - bl, bl); // draw left side and bottom-left corner
            this.ctx.arcTo(x, y, x + tl, y, tl); // draw top side and top-left corner
        }

        if (fillColor !== undefined && radius !== 0) {
            this.ctx.fill();
        }
        if (borderColor !== undefined) {
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    draw() {
        const { canvas } = this.ctx;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height)
        const widgets = this.getWidgets();
        widgets.forEach(widget => widget.update());
        widgets.forEach(widget => widget.draw())
    }
}