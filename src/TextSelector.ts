import type { Align } from './types';
import type Context from './Context';
import type CellHeader from './CellHeader';

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

type TextHit = { cellKey: string; index: number };
type PendingSelect = { cellKey: string; index: number; startX: number; startY: number };

export default class TextSelector {
    private static readonly DRAG_THRESHOLD = 4;
    private ctx: Context;
    private layouts = new Map<string, TextLayout>();
    private activeCellKey = '';
    private selectionStart: number | null = null;
    private selectionEnd: number | null = null;
    private pending: PendingSelect | null = null;

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.ctx.on('registerTextLayout', (key, layout) => this.layouts.set(key, layout));
        this.ctx.on('mousedown', (e) => this.onMouseDown(e));
        this.ctx.on('mousemove', (e) => this.onMouseMove(e));
        this.ctx.on('mouseup', () => this.onMouseUp());
        this.ctx.on('cellHeaderHoverChange', (cell) => this.yieldToColumnDrag(cell));
        this.ctx.on('cellHoverChange', () => this.yieldToColumnDrag());
        this.ctx.on('keydown', (e) => this.onCopyKeydown(e));
        this.ctx.on('outsideMousedown', () => this.resetSelection());
    }

    private get canSelect() {
        return this.ctx.config.ENABLE_TEXT_SELECTION && !this.ctx.editing && !this.ctx.finding;
    }

    /** 跨表头列或从表头拖入 body 时，让位给列/区域选择 */
    private yieldToColumnDrag(target?: CellHeader) {
        const anchor = this.ctx.focusCellHeader;
        if (!this.ctx.textSelecting || !anchor) {
            return;
        }
        if (target) {
            const min = anchor.colIndex;
            const max = anchor.colIndex + anchor.colspan - 1;
            const tMin = target.colIndex;
            const tMax = target.colIndex + target.colspan - 1;
            if (tMin >= min && tMax <= max) {
                return;
            }
        }
        this.resetSelection();
    }

    private onMouseDown(e: MouseEvent) {
        if (!this.canSelect || !this.ctx.isTarget(e)) {
            return;
        }
        if (!this.ctx.containerElement.contains(document.activeElement)) {
            this.ctx.containerElement.focus({ preventScroll: true });
        }
        const hit = this.hitTest(e);
        if (!hit) {
            this.resetSelection();
            return;
        }
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        this.pending = { cellKey: hit.cellKey, index: hit.index, startX: offsetX, startY: offsetY };
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.canSelect) {
            return;
        }
        if (!this.ctx.textSelecting) {
            this.tryStartDrag(e);
        }
        if (!this.ctx.textSelecting) {
            return;
        }
        const layout = this.layouts.get(this.activeCellKey);
        if (!layout) {
            return;
        }
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        const index = this.hitTestText(layout, offsetX, offsetY);
        if (index !== null) {
            this.selectionEnd = index;
            this.updateSelection();
        }
    }

    private tryStartDrag(e: MouseEvent) {
        if (!this.pending || !this.ctx.mousedown) {
            return;
        }
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        const dx = Math.abs(offsetX - this.pending.startX);
        const dy = Math.abs(offsetY - this.pending.startY);
        if (dx < TextSelector.DRAG_THRESHOLD && dy < TextSelector.DRAG_THRESHOLD) {
            return;
        }
        const hit = this.hitTest(e);
        if (!hit || hit.cellKey !== this.pending.cellKey) {
            this.pending = null;
            return;
        }
        this.activeCellKey = this.pending.cellKey;
        this.selectionStart = this.pending.index;
        this.selectionEnd = hit.index;
        this.pending = null;
        this.ctx.textSelecting = true;
        this.updateSelection();
    }

    private onMouseUp() {
        this.pending = null;
        this.ctx.textSelecting = false;
        this.ctx.textSelectionStr = this.getSelectedText();
        if (this.ctx.textSelectionStr) {
            this.ctx.emit('drawView');
        }
    }

    private onCopyKeydown(e: KeyboardEvent) {
        if (!this.canSelect || !((e.ctrlKey || e.metaKey) && e.code === 'KeyC')) {
            return;
        }
        const text = this.getSelectedText();
        if (!text) {
            return;
        }
        e.preventDefault();
        navigator.clipboard?.writeText(text).catch((error) => console.error('Copy Failure:', error));
    }

    /**
     * 命中最顶层文字（固定列/表头后绘制会覆盖普通单元格，取最后一个命中）。
     */
    private hitTest(e: MouseEvent): TextHit | null {
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        let hit: TextHit | null = null;
        for (const [cellKey, layout] of this.layouts) {
            const index = this.hitTestText(layout, offsetX, offsetY);
            if (index !== null) {
                hit = { cellKey, index };
            }
        }
        return hit;
    }

    private updateSelection() {
        this.ctx.textSelectionStr = this.getSelectedText();
        this.ctx.emit('drawView');
    }

    private hitTestText(layout: TextLayout, mouseX: number, mouseY: number): number | null {
        const { glyphs, contentY, lineHeight, lines } = layout;
        if (!glyphs.length) {
            return null;
        }
        const lineIndex = Math.floor((mouseY - contentY) / lineHeight);
        if (lineIndex < 0 || lineIndex >= lines.length) {
            return null;
        }
        const lineGlyphs = glyphs.filter((g) => g.line === lineIndex);
        if (!lineGlyphs.length) {
            return null;
        }
        const pad = 2;
        const lineTop = contentY + lineIndex * lineHeight;
        if (mouseY < lineTop - pad || mouseY >= lineTop + lineHeight + pad) {
            return null;
        }
        const first = lineGlyphs[0];
        const last = lineGlyphs[lineGlyphs.length - 1];
        if (mouseX < first.x - pad || mouseX > last.x + last.width + pad) {
            return null;
        }
        if (mouseX <= first.x) {
            return first.index;
        }
        for (const glyph of lineGlyphs) {
            if (mouseX < glyph.x + glyph.width / 2) {
                return glyph.index;
            }
        }
        return last.index + 1;
    }

    clearLayouts() {
        this.layouts.clear();
    }

    draw() {
        if (!this.ctx.config.ENABLE_TEXT_SELECTION) {
            return;
        }
        const range = this.getSelectionRange();
        const layout = range && this.layouts.get(this.activeCellKey);
        if (layout) {
            this.drawTextSelection(layout, range);
        }
    }

    private drawTextSelection(
        layout: TextLayout,
        range: TextSelectionRange,
        selectedColor = '#fff',
        selectionBgColor = '#3b82f6',
    ) {
        if (range.start >= range.end) {
            return;
        }
        const byLine = new Map<number, TextGlyph[]>();
        for (const glyph of layout.glyphs) {
            if (glyph.index < range.start || glyph.index >= range.end) {
                continue;
            }
            const list = byLine.get(glyph.line) ?? [];
            list.push(glyph);
            byLine.set(glyph.line, list);
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
            ctx.fillRect(first.x, first.y - 1, last.x + last.width - first.x, first.height);
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
        const layout = range && this.layouts.get(this.activeCellKey);
        if (!layout || range.start >= range.end) {
            return '';
        }
        return layout.chars.slice(range.start, range.end).join('');
    }

    private resetSelection() {
        this.activeCellKey = '';
        this.selectionStart = null;
        this.selectionEnd = null;
        this.pending = null;
        this.ctx.textSelecting = false;
        this.ctx.textSelectionStr = '';
        this.ctx.emit('drawView');
    }

    destroy() {
        this.layouts.clear();
        this.resetSelection();
    }
}
