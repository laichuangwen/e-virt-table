import { Shape, ShapeEventMap } from "./Shape";

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
    private shapes: Shape[] = [];
    private ctx: CanvasRenderingContext2D
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
    addShape(shape: Shape) {
        // 按 zIndex 升序插入；同级保持后添加更靠上（数组更靠后）
        const idx = this.shapes.findIndex((s) => s.zIndex > shape.zIndex)
        if (idx === -1) this.shapes.push(shape)
        else this.shapes.splice(idx, 0, shape)
    }
    removeShape(shape: Shape) {
        this.shapes = this.shapes.filter(s => s !== shape)
    }
    /** 修改 zIndex 后重新按层级排序 */
    setZIndex(shape: Shape, zIndex: number) {
        shape.zIndex = zIndex
        this.removeShape(shape)
        this.addShape(shape)
    }
    getShapes(): Shape[] {
        return this.shapes
    }
    removeAllShapes() {
        this.shapes = []
    }
    dispatchListener<K extends keyof ShapeEventMap>(eventName: K, e: ShapeEventMap[K]) {
        // zIndex 高的在数组后面，倒序优先命中；stopPropagation 后不再传给下层
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            if (this.shapes[i].dispatch(eventName, e)) break
        }
    }
    getRelativePosition(e: PointerEvent | MouseEvent) {
        if (!(this.target instanceof HTMLCanvasElement)) {
            throw new Error('target is not a canvas element')
        }
        const rect = this.target.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
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
        this.shapes.forEach(shape => shape.draw())
    }
}