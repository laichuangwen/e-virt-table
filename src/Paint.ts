import { Align, LineClampType, VerticalAlign } from './types';

export type LineOptions = {
    lineCap?: CanvasLineCap;
    lineDash?: number[];
    lineDashOffset?: number;
    lineJoin?: CanvasLineJoin;
    borderWidth?: number;
    borderColor?: string | CanvasGradient | CanvasPattern;
    fillColor?: string | CanvasGradient | CanvasPattern;
};
export type ShodowOptions = {
    side: 'left' | 'right' | 'top' | 'bottom';
    shadowWidth: number;
    colorStart: string;
    colorEnd: string;
    fillColor?: string | CanvasGradient | CanvasPattern;
};
export type RectOptions = {
    borderWidth?: number;
    borderColor?: string;
    fillColor?: string;
    radius?: number | [number, number, number, number];
};
export type DrawTextOptions = {
    font?: string;
    color?: string;
    align?: Align;
    padding?: number;
    verticalAlign?: VerticalAlign;
    autoRowHeight?: boolean;
    lineHeight?: number;
    maxLineClamp?: LineClampType;
    offsetLeft?: number;
    offsetRight?: number;
    textCallback?: (textInfo: TextInfo) => void;
};
export type TextInfo = {
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
};
export class Paint {
    private ctx: CanvasRenderingContext2D;
    constructor(target: HTMLCanvasElement) {
        const ctx = target.getContext('2d');
        if (!ctx) throw new Error('canvas context not found');
        this.ctx = ctx;
    }
    scale(dpr: number) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }
    save() {
        this.ctx.save();
    }
    restore() {
        this.ctx.restore();
    }
    translate(x: number, y: number) {
        this.ctx.translate(x, y);
    }

    setCursor(cursor = 'default') {
        this.ctx.canvas.style.cursor = cursor;
    }
    clear(x = 0, y = 0, width?: number, height?: number) {
        this.ctx.clearRect(x, y, width || this.ctx.canvas.width, height || this.ctx.canvas.height);
    }
    /**
     * 在 Canvas 上绘制单侧阴影
     * @param {number} x - 矩形的 x 坐标
     * @param {number} y - 矩形的 y 坐标
     * @param {number} width - 矩形的宽度
     * @param {number} height - 矩形的高度
     * @param {string} side - 阴影的位置（'left', 'right', 'top', 'bottom'）
     * @param {number} shadowWidth - 阴影的宽度
     * @param {string} color - 阴影的颜色
     */
    drawShadow(x: number, y: number, width: number, height: number, options: ShodowOptions): void {
        const { fillColor, side, shadowWidth, colorStart, colorEnd } = options;
        this.ctx.save();
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, y, width, height);
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
    // 绘制线条
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
    drawImage(img: CanvasImageSource, x: number, y: number, width: number, height: number) {
        this.ctx.save();
        this.ctx.drawImage(img, x, y, width, height);
        this.ctx.restore();
    }

    drawRect(
        x: number,
        y: number,
        width: number,
        height: number,
        { borderWidth = 1, borderColor, fillColor, radius = 0 }: RectOptions = {},
    ) {
        this.ctx.save();
        this.ctx.beginPath();
        // 填充颜色
        if (fillColor !== undefined) {
            this.ctx.fillStyle = fillColor;
        }

        // 线条宽度及绘制颜色
        if (borderColor !== undefined) {
            this.ctx.lineWidth = borderWidth;
            this.ctx.strokeStyle = borderColor;
        }
        if (radius === 0) {
            // 绘制矩形路径，- 0.5解决1px模糊的问题
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

        // 如果有填充色，则填充
        if (fillColor !== undefined) {
            this.ctx.fill();
        }

        // 如果有绘制色，则绘制
        if (borderColor !== undefined) {
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    /**
     * 画文本
     * @param text
     * @param x
     * @param y
     * @param width
     * @param height
     * @param options
     * @returns 是否溢出
     */
    drawText(
        text: string = '',
        x: number,
        y: number,
        width: number,
        height: number,
        options: DrawTextOptions = {},
    ): boolean {
        this.ctx.save();
        const {
            font = '12px Arial',
            align = 'center',
            color = '#495060',
            padding = 0,
            verticalAlign = 'middle',
            maxLineClamp = 1,
            autoRowHeight = false,
            offsetLeft = 0,
            offsetRight = 0,
        } = options;
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        const fontSize = parseInt(font.match(/\d+/)?.[0] || '12');
        const lineHeight = fontSize * (options.lineHeight || 1.2); // 默认行高为字体大小的1.2倍
        const availableWidth = width - padding * 2 - offsetLeft - offsetRight;
        const ellipsesWidth = this.ctx.measureText('...').width;
        let textEllipsis = false;
        // 如果宽度小于省略号宽度,
        if (width <= ellipsesWidth + padding * 2 + offsetLeft + offsetRight) {
            this.ctx.restore();
            textEllipsis = true;
            return textEllipsis;
        }
        // 计算总行数,向上取整round
        const maxTextLine = Math.round((height - 2 * padding) / lineHeight);
        // 将文本按可用宽度分割成行,如果为1直接就不计算了,直接绘制
        let lines = this.wrapText(text, availableWidth);
        let totalTextLine = Math.min(lines.length, Math.max(maxTextLine, 1));
        if (maxLineClamp === 'auto' && autoRowHeight) {
            totalTextLine = lines.length;
        } else if (typeof maxLineClamp === 'number' && maxLineClamp < maxTextLine) {
            totalTextLine = maxLineClamp;
        } else {
            // 处理边界问题
            if (maxLineClamp === 1 && !autoRowHeight) {
                lines = [text];
                totalTextLine = 1;
            }
            if (maxLineClamp === 'auto' && maxTextLine === 1) {
                lines = [text];
                totalTextLine = 1;
            }
        }
        // 计算起始Y位置
        let startY = y + padding;
        const totalTextHeight = Math.round(totalTextLine * lineHeight);
        if (verticalAlign === 'middle') {
            startY = y + (height - totalTextHeight) / 2;
        } else if (verticalAlign === 'bottom') {
            startY = y + height - totalTextHeight - padding;
        }
        // 计算起始X位置
        let startX = x + padding + offsetLeft;
        if (align === 'center') {
            startX = x + (width - offsetLeft - offsetRight) / 2;
        } else if (align === 'right') {
            startX = x + width - padding - offsetRight;
        }

        // 绘制每一行用for循环
        for (let i = 0; i < lines.length; i++) {
            const lineText = lines[i];
            const lineY = startY + i * lineHeight;
            this.ctx.textBaseline = 'top';
            // 如果设置了lineClamp，则只绘制lineClamp行
            if (i === totalTextLine - 1) {
                const { _text, ellipsis } = this.handleEllipsis(lineText, width, padding, font);
                this.ctx.fillText(_text, startX, lineY);
                textEllipsis = ellipsis;
                break;
            }
            this.ctx.fillText(lineText, startX, lineY);
        }
        // 文字信息回调，用于画跟随图标的
        if (options.textCallback && lines.length) {
            const textMaxWidth = Math.round(this.ctx.measureText(lines[0]).width);
            let left = startX;
            let right = startX + textMaxWidth;
            if (align === 'center') {
                left = startX - textMaxWidth / 2;
                right = startX + textMaxWidth / 2;
            } else if (align === 'right') {
                left = startX - textMaxWidth;
                right = startX;
            }
            const textInfo = {
                x: startX,
                y: startY,
                width: textMaxWidth,
                height: totalTextHeight,
                left,
                right,
                top: startY,
                bottom: startY + totalTextHeight,
            };
            options.textCallback(textInfo);
        }
        this.ctx.restore();
        return textEllipsis;
    }

    /**
     * 将文本按宽度换行
     * @param text
     * @param maxWidth
     * @returns
     */
    private wrapText(text: string, maxWidth: number): string[] {
        if (!text) return [''];

        const lines: string[] = [];
        const paragraphs = text.split('\n');

        for (const paragraph of paragraphs) {
            if (paragraph === '') {
                lines.push('');
                continue;
            }

            const words = paragraph.split('');
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine + word;
                const testWidth = this.ctx.measureText(testLine).width;

                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        // 单个字符也超出宽度，强制换行
                        lines.push(word);
                        currentLine = '';
                    }
                }
            }

            if (currentLine) {
                lines.push(currentLine);
            }
        }
        // 处理溢出刚好和...溢出问题
        if (lines.length >= 1) {
            const lastLine = lines[lines.length - 1];
            const { ellipsis } = this.handleEllipsis(lastLine, maxWidth, 0, this.ctx.font);
            if (ellipsis) {
                const newLine = lastLine.slice(0, -1);
                lines[lines.length - 1] = newLine;
                lines.push(lastLine.slice(-1));
            }
        }

        return lines.length > 0 ? lines : [''];
    }

    /**
     * 计算文本自适应高度
     * @param text
     * @param width
     * @param options
     * @returns 计算出的高度
     */
    calculateTextHeight(text: string = '', width: number, options: DrawTextOptions = {}): number {
        const { font = '12px Arial', padding = 0, align = 'center', color = '#495060', maxLineClamp = 1 } = options;
        this.ctx.save();
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        // // 获取字体高度
        const fontSize = parseInt(font.match(/\d+/)?.[0] || '12');
        const lineHeight = fontSize * (options.lineHeight || 1.2); // 默认行高为字体大小的1.2倍

        // 将文本按可用宽度分割成行
        const availableWidth = width - padding * 2;
        const lines = this.wrapText(text, availableWidth);
        // 计算总行数
        let totalLines = 1;
        if (maxLineClamp === 'auto') {
            totalLines = lines.length;
        } else {
            if (lines.length > maxLineClamp) {
                totalLines = maxLineClamp;
            } else {
                totalLines = lines.length;
            }
        }
        this.ctx.restore();
        // 计算总高度：行数 * 行高 + 上下padding
        return Math.max(Math.floor(totalLines * lineHeight + padding * 2), Math.floor(fontSize + padding * 2));
    }
    handleEllipsis(
        text: string,
        width: number,
        padding: number = 0,
        font: string = '12px Arial',
    ): { _text: string; ellipsis: boolean } {
        this.ctx.save();
        let ellipsis = false;
        let _text = text;
        this.ctx.font = font;
        if (text === null || text === undefined || text === '') {
            this.ctx.restore();
            return {
                _text: '',
                ellipsis,
            };
        }
        const ellipsesWidth = this.ctx.measureText('...').width;
        // 如果宽度小于省略号宽度，则不进行省略，直接返回空字符串
        if (width <= ellipsesWidth + padding * 2) {
            this.ctx.restore();
            return {
                _text: '',
                ellipsis: true,
            };
        }
        const textWidth = this.ctx.measureText(text).width;
        const lineWidth = width - padding * 2;
        // 单行文本省略
        if (textWidth && textWidth + ellipsesWidth >= lineWidth) {
            ellipsis = true;
            // text字符截取并添加省略号
            let textLength = 0;
            for (let i = 0; i < text.length; i++) {
                textLength += this.ctx.measureText(text[i]).width;
                if (textLength >= lineWidth - ellipsesWidth) {
                    _text = text.slice(0, i) + '...';
                    ellipsis = true;
                    break;
                }
            }
        }
        this.ctx.restore();
        return {
            _text,
            ellipsis,
        };
    }
}

export default Paint;
