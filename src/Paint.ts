import { Align, VerticalAlign } from './types';

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
    isAutoRowHeight?: boolean;
    lineHeight?: number;
    lineClamp?: number;
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
    measureTextWidth(text: string, font: string) {
        this.ctx.font = font;
        return this.ctx.measureText(text).width;
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
            lineClamp = 1,
        } = options;
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;

        if (options.isAutoRowHeight) {
            // 多行文本渲染
            this.drawMultilineText(text, x, y, width, height, options);
            this.ctx.restore();
            return false; // 自适应高度时不算溢出
        } else {
            // 单行文本渲染（原逻辑）
            this.ctx.textBaseline = verticalAlign;
            const { _text, ellipsis } = this.handleEllipsis(text, width, padding, font, lineClamp);
            if (lineClamp > 1) {
                // 多行文本渲染
                this.drawMultilineText(_text, x, y, width, height, options);
                return ellipsis;
            }

            let yPos = 0;
            if (verticalAlign === 'top') {
                yPos = y + padding;
            } else if (verticalAlign === 'bottom') {
                yPos = y + height - padding;
            } else {
                yPos = y + (height + 1) / 2;
            }
            let xPos = 0;
            if (align === 'left') {
                xPos = x + padding;
            } else if (align === 'right') {
                xPos = x + width - padding;
            } else {
                xPos = x + width / 2;
            }
            this.ctx.fillText(_text, xPos, yPos);
            this.ctx.restore();
            return ellipsis;
        }
    }

    /**
     * 绘制多行文本
     * @param text
     * @param x
     * @param y
     * @param width
     * @param height
     * @param options
     */
    private drawMultilineText(
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        options: DrawTextOptions = {},
    ): void {
        const { font = '12px Arial', align = 'center', padding = 0, verticalAlign = 'middle' } = options;

        this.ctx.font = font;
        const fontSize = parseInt(font.match(/\d+/)?.[0] || '12');
        const lineHeight = fontSize * (options.lineHeight || 1.2); // 默认行高为字体大小的1.2倍
        const availableWidth = width - padding * 2;

        // 将文本按可用宽度分割成行
        const lines = this.wrapText(text, availableWidth);

        // 计算起始Y位置
        let startY = y + padding;
        if (verticalAlign === 'middle') {
            const totalTextHeight = lines.length * lineHeight;
            startY = y + (height - totalTextHeight) / 2;
        } else if (verticalAlign === 'bottom') {
            const totalTextHeight = lines.length * lineHeight;
            startY = y + height - totalTextHeight - padding;
        }

        // 绘制每一行
        lines.forEach((line, index) => {
            let xPos = x + padding;
            if (align === 'center') {
                xPos = x + width / 2;
            } else if (align === 'right') {
                xPos = x + width - padding;
            }

            const lineY = startY + index * lineHeight;
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(line, xPos, lineY);
        });
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
        if (!text) return 0;

        const { font = '12px Arial', padding = 0 } = options;

        this.ctx.save();
        this.ctx.font = font;

        // 获取字体高度
        const fontSize = parseInt(font.match(/\d+/)?.[0] || '12');
        const lineHeight = fontSize * (options.lineHeight || 1.2); // 默认行高为字体大小的1.2倍

        // 可用宽度
        const availableWidth = width - padding * 2;

        // 按换行符分割文本
        const lines = text.split('\n');
        let totalLines = 0;

        for (const line of lines) {
            if (line === '') {
                totalLines += 1;
                continue;
            }

            const textWidth = this.ctx.measureText(line).width;
            if (textWidth <= availableWidth) {
                totalLines += 1;
            } else {
                // 需要换行，计算需要多少行
                const words = line.split('');
                let currentLine = '';
                let lineCount = 0;

                for (const word of words) {
                    const testLine = currentLine + word;
                    const testWidth = this.ctx.measureText(testLine).width;

                    if (testWidth <= availableWidth) {
                        currentLine = testLine;
                    } else {
                        if (currentLine) {
                            lineCount += 1;
                            currentLine = word;
                        } else {
                            // 单个字符也超出宽度，强制换行
                            lineCount += 1;
                            currentLine = '';
                        }
                    }
                }

                if (currentLine) {
                    lineCount += 1;
                }

                totalLines += lineCount;
            }
        }

        this.ctx.restore();

        // 计算总高度：行数 * 行高 + 上下padding
        return Math.max(totalLines * lineHeight + padding * 2, fontSize + padding * 2);
    }
    handleEllipsis(
        text: string,
        width: number,
        padding: number = 0,
        font: string = '12px Arial',
        lineClamp: number = 1,
    ): { _text: string; ellipsis: boolean } {
        let ellipsis = false;
        let _text = text;
        this.ctx.font = font;
        if (text === null || text === undefined || text === '') {
            return {
                _text: '',
                ellipsis,
            };
        }
        const ellipsesWidth = this.ctx.measureText('...').width;
        // 如果宽度小于省略号宽度，则不进行省略，直接返回空字符串
        if (width <= ellipsesWidth + padding * 2) {
            return {
                _text: '',
                ellipsis: true,
            };
        }
        const textWidth = this.ctx.measureText(text).width;
        const lineWidth = width - padding * 2;
        if (lineClamp > 1) {
            // 多行文本省略
            const lines = this.wrapText(text, lineWidth);
            if (lines.length > lineClamp) {
                // 大于lineClamp行数，需要省略
                const lastText = lines[lineClamp - 1];
                // 处理最后一行文本省略
                const { _text: ellipsisText } = this.handleEllipsis(lastText, width, padding, font);
                // 拼接省略后的文本
                const newText = lines.slice(0, lineClamp - 1).join('') + ellipsisText;
                return {
                    _text: newText,
                    ellipsis: true,
                };
            }
            return {
                _text: lines.join(''),
                ellipsis: false,
            };
        }
        // 单行文本省略
        if (textWidth && textWidth + ellipsesWidth >= lineWidth) {
            ellipsis = true;
            // text字符截取并添加省略号
            let textLength = 0;
            for (let i = 0; i < text.length; i++) {
                textLength += this.ctx.measureText(text[i]).width;
                if (textLength >= lineWidth - ellipsesWidth) {
                    _text = text.slice(0, i) + '...';
                    break;
                }
            }
        }
        return {
            _text,
            ellipsis,
        };
    }
}

export default Paint;
