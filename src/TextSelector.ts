import type { Align } from './types';
import type Context from './Context';
import type Cell from './Cell';

export type TextSelectionRange = {
    start: number;
    end: number;
};
export type TextGlyph = {
    char: string;
    index: number;
    line: number;
    x: number;
    y: number;
    width: number;
    height: number;
};
export type TextLineItem = {
    char: string;
    sourceIndex: number;
    ellipsis?: boolean;
};
export type TextLayoutLine = {
    items: TextLineItem[];
    text: string;
    caretIndex: number;
    lineIndex: number;
    drawX: number;
    drawY: number;
    width: number;
    segments: TextLineSegment[];
};
export type TextLineSegment = {
    char: string;
    itemIndex: number;
    sourceIndex: number;
    x: number;
    width: number;
};
export type TextLayout = {
    text: string;
    chars: string[];
    glyphs: TextGlyph[];
    lines: TextLayoutLine[];
    box: { x: number; y: number; width: number; height: number };
    contentBox: { x: number; y: number; width: number; height: number };
    contentY: number;
    lineHeight: number;
    font: string;
    color: string;
    align: Align;
    ellipsis: boolean;
};

export default class TextSelector {
    private ctx: Context;
    private layouts = new Map<string, TextLayout>();
    private activeCellKey = '';
    private selectionStart: number | null = null;
    private selectionEnd: number | null = null;
    private dragging = false;

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }

    private init() {
        this.ctx.on('registerTextLayout', (cellKey: string, layout: TextLayout) => {
            this.registerLayout(cellKey, layout);
        });
        this.ctx.on('mousedown', (e) => {
            if (!this.ctx.config.ENABLE_TEXT_SELECTION) {
                return;
            }
            if (!this.ctx.isTarget(e)) {
                return;
            }
            if (this.ctx.editing || this.ctx.finding) {
                return;
            }
            const cell = this.ctx.focusCell;
            if (!cell || cell.cellType !== 'body') {
                this.clearSelection();
                return;
            }
            const layout = this.getCellLayout(cell);
            if (!layout) {
                this.clearSelection();
                return;
            }
            const { offsetX, offsetY } = this.ctx.getOffset(e);
            const index = this.hitTestText(layout, offsetX, offsetY);
            if (index === null) {
                this.clearSelection();
                return;
            }
            this.activeCellKey = this.getCellKey(cell);
            this.selectionStart = index;
            this.selectionEnd = index;
            this.dragging = true;
            this.ctx.textSelecting = true;
            this.ctx.textSelectionStr = this.getSelectedText();
            this.ctx.emit('drawView');
        });
        this.ctx.on('mousemove', (e) => {
            if (!this.ctx.config.ENABLE_TEXT_SELECTION || !this.dragging) {
                return;
            }
            const cell = this.ctx.focusCell;
            if (!cell) {
                return;
            }
            const layout = this.getCellLayout(cell);
            if (!layout) {
                return;
            }
            const { offsetX, offsetY } = this.ctx.getOffset(e);
            const index = this.hitTestText(layout, offsetX, offsetY);
            if (index === null) {
                return;
            }
            this.selectionEnd = index;
            this.ctx.textSelectionStr = this.getSelectedText();
            this.ctx.emit('drawView');
        });
        this.ctx.on('mouseup', () => {
            this.dragging = false;
            this.ctx.textSelecting = false;
            this.ctx.textSelectionStr = this.getSelectedText();
            if (this.ctx.textSelectionStr) {
                this.ctx.emit('drawView');
            }
        });
        this.ctx.on('keydown', (e) => {
            if (!this.ctx.config.ENABLE_TEXT_SELECTION) {
                return;
            }
            if (this.ctx.editing || this.ctx.finding) {
                return;
            }
            if ((e.ctrlKey && e.code === 'KeyC') || (e.metaKey && e.code === 'KeyC')) {
                const text = this.getSelectedText();
                if (!text) {
                    return;
                }
                e.preventDefault();
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).catch((error) => console.error('Copy Failure:', error));
                }
            }
        });
        this.ctx.on('outsideMousedown', () => {
            this.clearSelection();
        });
    }

    /**
     * 命中测试，返回字符索引
     */
    private hitTestText(layout: TextLayout, mouseX: number, mouseY: number): number | null {
        const { contentBox, lines, glyphs, contentY, lineHeight } = layout;
        if (
            mouseX < contentBox.x ||
            mouseX > contentBox.x + contentBox.width ||
            mouseY < contentBox.y ||
            mouseY > contentBox.y + contentBox.height
        ) {
            return null;
        }
        const relativeY = mouseY - contentY;
        const lineIndex = Math.max(0, Math.min(Math.floor(relativeY / lineHeight), lines.length - 1));
        const line = lines[lineIndex];
        const lineGlyphs = glyphs.filter((glyph) => glyph.line === lineIndex);
        if (!lineGlyphs.length) {
            return line.caretIndex;
        }
        if (mouseX <= lineGlyphs[0].x) {
            return lineGlyphs[0].index;
        }
        for (const glyph of lineGlyphs) {
            if (mouseX < glyph.x + glyph.width / 2) {
                return glyph.index;
            }
        }
        return lineGlyphs[lineGlyphs.length - 1].index + 1;
    }

    registerLayout(cellKey: string, layout: TextLayout) {
        this.layouts.set(cellKey, layout);
    }

    clearLayouts() {
        this.layouts.clear();
    }

    draw() {
        if (!this.ctx.config.ENABLE_TEXT_SELECTION) {
            return;
        }
        const range = this.getSelectionRange();
        if (!range) {
            return;
        }
        const layout = this.layouts.get(this.activeCellKey);
        if (!layout) {
            return;
        }
        this.drawTextSelection(layout, range);
    }

    private getCanvasCtx(): CanvasRenderingContext2D {
        const ctx = this.ctx.canvasElement.getContext('2d');
        if (!ctx) {
            throw new Error('canvas context not found');
        }
        return ctx;
    }

    /**
     * 绘制文字选中高亮
     */
    private drawTextSelection(
        layout: TextLayout,
        range: TextSelectionRange,
        selectedColor = '#fff',
        selectionBgColor = '#3b82f6',
    ): void {
        if (range.start >= range.end) {
            return;
        }
        const byLine = new Map<number, TextGlyph[]>();
        layout.glyphs.forEach((glyph) => {
            if (glyph.index < 0 || glyph.index < range.start || glyph.index >= range.end) {
                return;
            }
            if (!byLine.has(glyph.line)) {
                byLine.set(glyph.line, []);
            }
            byLine.get(glyph.line)!.push(glyph);
        });
        const ctx = this.getCanvasCtx();
        ctx.save();
        ctx.fillStyle = selectionBgColor;
        byLine.forEach((lineGlyphs) => {
            const first = lineGlyphs[0];
            const last = lineGlyphs[lineGlyphs.length - 1];
            ctx.fillRect(first.x, first.y, last.x + last.width - first.x, first.height);
        });
        ctx.font = layout.font;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = selectedColor;
        layout.lines.forEach((line) => {
            const selectedItems = line.items.filter(
                (item) => item.sourceIndex >= 0 && item.sourceIndex >= range.start && item.sourceIndex < range.end,
            );
            if (!selectedItems.length) {
                return;
            }
            const firstSelected = selectedItems[0];
            const colIndex = line.items.indexOf(firstSelected);
            const selectedText = selectedItems.map((item) => item.char).join('');
            const prefix = line.items
                .slice(0, colIndex)
                .map((item) => item.char)
                .join('');
            const drawX = line.drawX + ctx.measureText(prefix).width;
            ctx.fillText(selectedText, drawX, line.drawY);
        });
        ctx.restore();
    }

    private getCellKey(cell: Cell) {
        return `${cell.rowIndex}-${cell.colIndex}`;
    }

    private getCellLayout(cell: Cell) {
        return this.layouts.get(this.getCellKey(cell));
    }

    private getSelectionRange(): TextSelectionRange | null {
        if (this.selectionStart === null || this.selectionEnd === null) {
            return null;
        }
        return {
            start: Math.min(this.selectionStart, this.selectionEnd),
            end: Math.max(this.selectionStart, this.selectionEnd),
        };
    }

    private getSelectedText() {
        const range = this.getSelectionRange();
        if (!range || range.start >= range.end) {
            return '';
        }
        const layout = this.layouts.get(this.activeCellKey);
        if (!layout) {
            return '';
        }
        return layout.chars.slice(range.start, range.end).join('');
    }

    private clearSelection() {
        this.activeCellKey = '';
        this.selectionStart = null;
        this.selectionEnd = null;
        this.dragging = false;
        this.ctx.textSelectionStr = '';
    }

    destroy() {
        this.layouts.clear();
        this.clearSelection();
    }
}
