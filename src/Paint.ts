import { Align, LineClampType, VerticalAlign } from './types';
import type { TextGlyph, TextLayout, TextLayoutLine, TextLineItem, TextLineSegment } from './TextSelector';

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
    layoutCallback?: (layout: TextLayout) => void;
    cacheTextKey?: string;
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
    private textCacheMap = new Map<string, string[]>();
    constructor(target: HTMLCanvasElement) {
        const ctx = target.getContext('2d');
        if (!ctx) throw new Error('canvas context not found');
        this.ctx = ctx;
    }
    getCtx() {
        return this.ctx;
    }
    clearTextCache() {
        this.textCacheMap.clear();
    }
    scale(dpr: number, zoom = 1) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        // dpr 保证清晰度,zoom 实现内容缩放,两者相乘按原生分辨率绘制,不会模糊
        this.ctx.scale(dpr * zoom, dpr * zoom);
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
        if (['', null, undefined].includes(text)) {
            this.ctx.restore();
            return false;
        }
        const fontSize = parseInt(font.match(/\d+/)?.[0] || '12');
        const lineHeight = fontSize * (options.lineHeight || 1.2);
        const layout = this.buildTextLayout(text, x, y, width, height, {
            font,
            color,
            align,
            padding,
            verticalAlign,
            maxLineClamp,
            autoRowHeight,
            lineHeight,
            offsetLeft,
            offsetRight,
        });
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = 'left';
        layout.lines.forEach((line) => {
            this.ctx.fillText(line.text, line.drawX, line.drawY);
        });
        if (options.textCallback && layout.lines.length) {
            const maxLineWidth = layout.lines.reduce((max, line) => Math.max(max, line.width), 0);
            const textMaxWidth = Math.round(maxLineWidth);
            let left = layout.lines[0]?.drawX ?? x + padding + offsetLeft;
            let right = left + textMaxWidth;
            if (align === 'center') {
                left = x + width / 2 - textMaxWidth / 2;
                right = x + width / 2 + textMaxWidth / 2;
            } else if (align === 'right') {
                left = x + width - padding - offsetRight - textMaxWidth;
                right = x + width - padding - offsetRight;
            }
            const textInfo = {
                x: layout.lines[0]?.drawX ?? left,
                y: layout.contentY,
                width: textMaxWidth,
                height: layout.lines.length * lineHeight,
                left,
                right,
                top: layout.contentY,
                bottom: layout.contentY + layout.lines.length * lineHeight,
            };
            options.textCallback(textInfo);
        }
        if (options.layoutCallback) {
            options.layoutCallback(layout);
        }
        this.ctx.restore();
        return layout.ellipsis;
    }

    private buildTextLayout(
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        options: {
            font: string;
            color: string;
            align: Align;
            padding: number;
            verticalAlign: VerticalAlign;
            maxLineClamp: LineClampType;
            autoRowHeight: boolean;
            lineHeight: number;
            offsetLeft: number;
            offsetRight: number;
        },
    ): TextLayout {
        const {
            font,
            color,
            align,
            padding,
            verticalAlign,
            maxLineClamp,
            autoRowHeight,
            lineHeight,
            offsetLeft,
            offsetRight,
        } = options;
        this.ctx.save();
        this.ctx.font = font;
        const availableWidth = width - padding * 2 - offsetLeft - offsetRight;
        const contentWidth = availableWidth;
        const contentHeight = height - padding * 2;
        const chars = Array.from(text);
        let lines = this.wrapTextToLines(text, availableWidth);
        const maxTextLine = Math.round(contentHeight / lineHeight);
        let totalTextLine = Math.min(lines.length, Math.max(maxTextLine, 1));
        if (maxLineClamp === 'auto' && autoRowHeight) {
            totalTextLine = lines.length;
        } else if (typeof maxLineClamp === 'number' && maxLineClamp < totalTextLine && maxLineClamp !== 1) {
            totalTextLine = maxLineClamp;
        } else {
            if (maxLineClamp === 1) {
                lines = [{ items: chars.map((char, i) => ({ char, sourceIndex: i })), text, caretIndex: 0, lineIndex: 0, drawX: 0, drawY: 0, width: 0, segments: [] }];
                totalTextLine = 1;
            }
            if (maxLineClamp === 'auto' && maxTextLine === 1) {
                lines = [{ items: chars.map((char, i) => ({ char, sourceIndex: i })), text, caretIndex: 0, lineIndex: 0, drawX: 0, drawY: 0, width: 0, segments: [] }];
                totalTextLine = 1;
            }
        }
        let ellipsis = false;
        const visibleLines = lines.slice(0, totalTextLine);
        if (lines.length > totalTextLine) {
            ellipsis = true;
            const remainingLines = lines.slice(totalTextLine - 1);
            const ellipsisLine = this.buildEllipsisLine(remainingLines, width, padding);
            ellipsisLine.lineIndex = totalTextLine - 1;
            visibleLines[totalTextLine - 1] = ellipsisLine;
        } else if (totalTextLine > 0) {
            const lastLineIndex = totalTextLine - 1;
            const remainingLines = lines.slice(lastLineIndex);
            const remainingText = remainingLines.map((line) => line.text).join('');
            const { ellipsis: widthEllipsis } = this.handleEllipsis(remainingText, width, padding, font);
            if (widthEllipsis) {
                ellipsis = true;
                const ellipsisLine = this.buildEllipsisLine(remainingLines, width, padding);
                ellipsisLine.lineIndex = lastLineIndex;
                visibleLines[lastLineIndex] = ellipsisLine;
            }
        }
        const totalTextHeight = visibleLines.length * lineHeight;
        let contentY = y + padding;
        if (verticalAlign === 'middle') {
            contentY = y + (height - totalTextHeight) / 2;
        } else if (verticalAlign === 'bottom') {
            contentY = y + height - totalTextHeight - padding;
        }
        const glyphs: TextGlyph[] = [];
        visibleLines.forEach((line, index) => {
            line.lineIndex = index;
            const segments = this.buildLineSegments(line);
            const lineWidth = segments.reduce((sum, segment) => sum + segment.width, 0);
            let lineX = x + padding + offsetLeft;
            if (align === 'center') {
                lineX = x + (width - lineWidth) / 2;
            } else if (align === 'right') {
                lineX = x + width - padding - offsetRight - lineWidth;
            }
            const lineY = contentY + index * lineHeight;
            line.drawX = lineX;
            line.drawY = lineY;
            line.width = lineWidth;
            line.segments = segments;
            segments.forEach((segment) => {
                if (segment.sourceIndex < 0) {
                    return;
                }
                glyphs.push({
                    char: segment.char,
                    index: segment.sourceIndex,
                    line: index,
                    x: lineX + segment.x,
                    y: lineY,
                    width: segment.width,
                    height: lineHeight,
                });
            });
        });
        this.ctx.restore();
        return {
            text,
            chars,
            glyphs,
            lines: visibleLines,
            box: { x, y, width, height },
            contentBox: { x: x + padding + offsetLeft, y: y + padding, width: contentWidth, height: contentHeight },
            contentY,
            lineHeight,
            font,
            color,
            align,
            ellipsis,
        };
    }

    private wrapTextToLines(text: string, maxWidth: number): TextLayoutLine[] {
        if (!text) {
            return [{ items: [], text: '', caretIndex: 0, lineIndex: 0, drawX: 0, drawY: 0, width: 0, segments: [] }];
        }
        const chars = Array.from(text);
        const lines: TextLayoutLine[] = [];
        let currentItems: TextLineItem[] = [];
        let currentWidth = 0;
        let lineCaretIndex = 0;

        const flushLine = (nextCaretIndex: number) => {
            const lineText = currentItems.map((item) => item.char).join('');
            lines.push({
                items: currentItems,
                text: lineText,
                caretIndex: lineCaretIndex,
                lineIndex: lines.length,
                drawX: 0,
                drawY: 0,
                width: 0,
                segments: [],
            });
            currentItems = [];
            currentWidth = 0;
            lineCaretIndex = nextCaretIndex;
        };

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            if (char === '\n') {
                flushLine(i + 1);
                continue;
            }
            const charWidth = this.ctx.measureText(char).width;
            if (currentWidth + charWidth > maxWidth && currentItems.length > 0) {
                flushLine(currentItems[currentItems.length - 1].sourceIndex + 1);
                currentItems.push({ char, sourceIndex: i });
                currentWidth = charWidth;
                continue;
            }
            currentItems.push({ char, sourceIndex: i });
            currentWidth += charWidth;
        }
        if (currentItems.length > 0 || lines.length === 0) {
            flushLine(chars.length);
        }
        return lines;
    }

    private buildEllipsisLine(remainingLines: TextLayoutLine[], width: number, padding: number): TextLayoutLine {
        const remainingItems = remainingLines.flatMap((line) => line.items);
        const remainingText = remainingItems.map((item) => item.char).join('');
        const { _text, ellipsis } = this.handleEllipsis(remainingText, width, padding, this.ctx.font);
        const contentText = ellipsis ? _text.slice(0, -3) : _text;
        const items: TextLineItem[] = [];
        for (let i = 0; i < contentText.length; i++) {
            const item = remainingItems[i];
            if (!item) {
                break;
            }
            items.push({ char: item.char, sourceIndex: item.sourceIndex });
        }
        if (ellipsis) {
            items.push(
                { char: '.', sourceIndex: -1, ellipsis: true },
                { char: '.', sourceIndex: -1, ellipsis: true },
                { char: '.', sourceIndex: -1, ellipsis: true },
            );
        }
        return {
            items,
            text: _text,
            caretIndex: remainingLines[0]?.caretIndex ?? 0,
            lineIndex: 0,
            drawX: 0,
            drawY: 0,
            width: 0,
            segments: [],
        };
    }

    private buildLineSegments(line: TextLayoutLine): TextLineSegment[] {
        const segments: TextLineSegment[] = [];
        let offsetX = 0;
        line.items.forEach((item, itemIndex) => {
            const segmentWidth = this.ctx.measureText(item.char).width;
            segments.push({
                char: item.char,
                itemIndex,
                sourceIndex: item.sourceIndex,
                x: offsetX,
                width: segmentWidth,
            });
            offsetX += segmentWidth;
        });
        return segments;
    }

    /**
     * 将文本按宽度换行
     * @param text
     * @param maxWidth
     * @returns
     */
    private wrapText(text: string, maxWidth: number, cacheTextKey = ''): string[] {
        if (!text) return [''];
        // 缓存文本
        if (cacheTextKey && this.textCacheMap.has(cacheTextKey)) {
            return this.textCacheMap.get(cacheTextKey) || [''];
        }
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
        const result = lines.length > 0 ? lines : [''];
        if (cacheTextKey) {
            this.textCacheMap.set(cacheTextKey, result);
        }
        return result;
    }

    /**
     * 计算文本自适应高度
     * @param text
     * @param width
     * @param options
     * @returns 计算出的高度
     */
    calculateTextHeight(text: string = '', width: number, options: DrawTextOptions = {}): number {
        const {
            font = '12px Arial',
            padding = 0,
            align = 'center',
            color = '#495060',
            maxLineClamp = 1,
            cacheTextKey = '',
        } = options;
        this.ctx.save();
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        // // 获取字体高度
        const fontSize = parseInt(font.match(/\d+/)?.[0] || '12');
        const lineHeight = fontSize * (options.lineHeight || 1.2); // 默认行高为字体大小的1.2倍

        // 将文本按可用宽度分割成行
        const availableWidth = width - padding * 2;
        const lines = this.wrapText(text, availableWidth, cacheTextKey);
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
        if (textWidth && textWidth >= lineWidth) {
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
