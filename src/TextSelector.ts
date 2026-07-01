import type { Align } from './types';
import type Context from './Context';

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

    /** 是否允许进行文字选择（开启配置且不在编辑/查找状态） */
    private get canSelect() {
        return this.ctx.config.ENABLE_TEXT_SELECTION && !this.ctx.editing && !this.ctx.finding;
    }

    /**
     * 在所有已注册的文字 layout（body/header/footer）中命中鼠标位置，返回命中的单元格 key 与字符索引。
     * 由于固定列/表头会后绘制并覆盖普通单元格，这里取最后一个命中的 layout 作为最顶层结果。
     */
    private hitTestLayouts(e: MouseEvent): { cellKey: string; index: number } | null {
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        let hit: { cellKey: string; index: number } | null = null;
        for (const [cellKey, layout] of this.layouts) {
            const index = this.hitTestText(layout, offsetX, offsetY);
            if (index !== null) {
                hit = { cellKey, index };
            }
        }
        return hit;
    }

    /** 同步选中文本并触发重绘 */
    private syncSelection() {
        this.ctx.textSelectionStr = this.getSelectedText();
        this.ctx.emit('drawView');
    }

    private init() {
        this.ctx.on('registerTextLayout', (cellKey: string, layout: TextLayout) => {
            this.registerLayout(cellKey, layout);
        });
        this.ctx.on('mousedown', (e) => {
            if (!this.canSelect || !this.ctx.isTarget(e)) {
                return;
            }
            if (!this.ctx.containerElement.contains(document.activeElement)) {
                this.ctx.containerElement.focus({ preventScroll: true });
            }
            const hit = this.hitTestLayouts(e);
            if (!hit) {
                this.clearSelection();
                return;
            }
            this.activeCellKey = hit.cellKey;
            this.selectionStart = hit.index;
            this.selectionEnd = hit.index;
            this.dragging = true;
            this.ctx.textSelecting = true;
            this.syncSelection();
        });
        this.ctx.on('mousemove', (e) => {
            if (!this.canSelect || !this.dragging) {
                return;
            }
            // 拖拽选区限制在起始单元格内
            const layout = this.layouts.get(this.activeCellKey);
            if (!layout) {
                return;
            }
            const { offsetX, offsetY } = this.ctx.getOffset(e);
            const index = this.hitTestText(layout, offsetX, offsetY);
            if (index === null) {
                return;
            }
            this.selectionEnd = index;
            this.syncSelection();
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
            console.log('keydown');
            if (!this.canSelect || !((e.ctrlKey || e.metaKey) && e.code === 'KeyC')) {
                return;
            }
            const text = this.getSelectedText();
            if (!text) {
                return;
            }
            e.preventDefault();
            navigator.clipboard?.writeText(text).catch((error) => console.error('Copy Failure:', error));
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
        for (const glyph of layout.glyphs) {
            if (glyph.index < range.start || glyph.index >= range.end) {
                continue;
            }
            const lineGlyphs = byLine.get(glyph.line);
            if (lineGlyphs) {
                lineGlyphs.push(glyph);
            } else {
                byLine.set(glyph.line, [glyph]);
            }
        }
        if (!byLine.size) {
            return;
        }
        const ctx = this.ctx.paint.getCtx();
        ctx.save();
        ctx.font = layout.font;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        byLine.forEach((lineGlyphs) => {
            const first = lineGlyphs[0];
            const last = lineGlyphs[lineGlyphs.length - 1];
            ctx.fillStyle = selectionBgColor;
            ctx.fillRect(first.x, first.y-1, last.x + last.width - first.x, first.height);
            ctx.fillStyle = selectedColor;
            for (const glyph of lineGlyphs) {
                ctx.fillText(glyph.char, glyph.x, glyph.y);
            }
        });
        ctx.restore();
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
