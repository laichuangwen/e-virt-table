import type Cell from './Cell';
import type CellHeader from './CellHeader';
import { html, render } from 'lit-html';
import { toStyleStr } from './util';

const PX_VALUE_RE = /^-?\d*\.?\d+px$/;

export type ViewportRect = {
    x: number;
    y: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
};

/** 内容缩放：逻辑坐标 ↔ 物理像素，canvas / DOM 共用 */
export default class ZoomScale {
    value = 1;

    get isDefault() {
        return this.value === 1;
    }

    clamp(value: number, min: number, max: number): number {
        return Math.min(max, Math.max(min, value));
    }

    /** @returns 是否发生变化 */
    set(value: number, min: number, max: number): boolean {
        const next = this.clamp(value, min, max);
        if (Math.abs(next - this.value) < 0.0001) {
            return false;
        }
        this.value = next;
        return true;
    }

    /** 逻辑 -> 物理 */
    toVisual(logical: number): number {
        return logical * this.value;
    }

    /** 物理 -> 逻辑 */
    toLogical(physical: number): number {
        return physical / this.value;
    }

    toPx(logical: number): string {
        return `${this.toVisual(logical)}px`;
    }

    /** DOM 测量高度 -> 逻辑高度 */
    domHeightToLogical(physicalHeight: number): number {
        return Math.round(physicalHeight / this.value);
    }

    /** 逻辑内容尺寸 -> 物理尺寸 */
    contentToPhysical(logical: number): number {
        return logical * this.value;
    }

    scaleStyle<T extends Record<string, any>>(style: T): T {
        if (this.isDefault) {
            return style;
        }
        const result: Record<string, any> = { ...style };
        for (const key of Object.keys(result)) {
            const val = result[key];
            if (typeof val === 'string' && PX_VALUE_RE.test(val)) {
                result[key] = `${parseFloat(val) * this.value}px`;
            }
        }
        return result as T;
    }

    assignScaledStyle(el: HTMLElement, style: Record<string, any>) {
        Object.assign(el.style, this.scaleStyle(style));
    }

    /** 容器物理宽度 -> 逻辑可视宽度 */
    containerWidth(containerPhysicalWidth: number): number {
        return Math.floor(containerPhysicalWidth / this.value);
    }

    resolveStageWidth(options: {
        containerPhysicalWidth: number;
        contentWidth: number;
        scrollerTrackSize: number;
        fillContainer: boolean;
    }): { stageWidth: number; stagePhysicalWidth: number } {
        const containerLogical = this.containerWidth(options.containerPhysicalWidth);
        const stageWidth = options.fillContainer
            ? containerLogical
            : Math.min(Math.floor(options.contentWidth + options.scrollerTrackSize), containerLogical);
        const stagePhysicalWidth = Math.min(
            Math.round(this.toVisual(stageWidth)),
            Math.floor(options.containerPhysicalWidth),
        );
        return { stageWidth, stagePhysicalWidth };
    }

    applyStageHeight(
        stageElement: HTMLDivElement,
        physicalHeight: number,
    ): { stageHeight: number; stagePhysicalHeight: number } {
        const stagePhysicalHeight = Math.floor(physicalHeight);
        const stageHeight = Math.floor(stagePhysicalHeight / this.value);
        stageElement.style.height = `${stagePhysicalHeight}px`;
        return { stageHeight, stagePhysicalHeight };
    }

    /** floating-ui 锚点：逻辑单元格 -> 视口物理矩形 */
    getViewportRect(
        logical: { x: number; y: number; width: number; height: number },
        containerRect: DOMRect,
    ): ViewportRect {
        const x = this.toVisual(logical.x) + containerRect.x;
        const y = this.toVisual(logical.y) + containerRect.y;
        const width = this.toVisual(logical.width);
        const height = this.toVisual(logical.height);
        return {
            x,
            y,
            left: x,
            top: y,
            right: x + width,
            bottom: y + height,
            width,
            height,
        };
    }

    /** overlayer 单元格：外层物理定位 + 内层 zoom 缩放自定义 render */
    createOverlayerCellElement(cell: Cell | CellHeader, cssPrefix: string): HTMLDivElement {
        const mount = document.createElement('div');
        render(this.overlayerCellTemplate(cell, cssPrefix), mount);
        const cellEl = mount.firstElementChild as HTMLDivElement;
        this.mountOverlayerCellRender(cellEl, cell, cssPrefix);
        cellEl.remove();
        return cellEl;
    }

    overlayerCellTemplate(cell: Cell | CellHeader, cssPrefix: string) {
        const scaledStyle = this.scaleStyle(cell.style);
        const cellKey = this.getOverlayerCellKey(cell);

        if (typeof cell.render !== 'function') {
            return html`<div style="${toStyleStr(scaledStyle)}" data-overlayer-cell=${cellKey}></div>`;
        }

        if (this.isDefault) {
            return html`<div
                style="${toStyleStr(scaledStyle)}"
                data-overlayer-cell=${cellKey}
                data-render-target="self"
            ></div>`;
        }

        const logicalWidth = 'visibleWidth' in cell ? (cell as Cell).visibleWidth : (cell as CellHeader).width;
        const logicalHeight = 'visibleHeight' in cell ? (cell as Cell).visibleHeight : (cell as CellHeader).height;
        const isAutoHeight =
            'autoRowHeight' in cell &&
            cell.autoRowHeight &&
            'renderType' in cell &&
            cell.renderType === 'default';

        const cellStyle = { ...scaledStyle };
        const contentStyle: Record<string, string | number> = {
            width: `${logicalWidth}px`,
            boxSizing: 'border-box',
            zoom: String(this.value),
        };

        if (isAutoHeight) {
            contentStyle.height = 'auto';
            contentStyle.minHeight = `${logicalHeight}px`;
            cellStyle.height = 'auto';
        } else {
            contentStyle.height = `${logicalHeight}px`;
            cellStyle.height = this.toPx(logicalHeight);
        }
        cellStyle.width = this.toPx(logicalWidth);

        return html`<div style="${toStyleStr(cellStyle)}" data-overlayer-cell=${cellKey}>
            <div
                class="${cssPrefix}-overlayer-cell-content"
                style="${toStyleStr(contentStyle)}"
                data-render-target="content"
            ></div>
        </div>`;
    }

    getOverlayerCellKey(cell: Cell | CellHeader): string {
        const rowIndex = 'rowIndex' in cell ? cell.rowIndex : 0;
        return `${cell.key}_${rowIndex}_${cell.colIndex}`;
    }

    mountOverlayerCellRender(cellEl: HTMLDivElement, cell: Cell | CellHeader, cssPrefix: string) {
        Object.keys(cell.domDataset || {}).forEach((key) => {
            cellEl.setAttribute(key, cell.domDataset[key]);
        });
        if (typeof cell.render !== 'function') {
            return;
        }
        const renderTarget = cellEl.dataset.renderTarget;
        if (renderTarget === 'content') {
            const contentEl = cellEl.querySelector(`.${cssPrefix}-overlayer-cell-content`) as HTMLDivElement;
            cell.render(contentEl, cell);
            return;
        }
        cell.render(cellEl, cell);
    }
}
