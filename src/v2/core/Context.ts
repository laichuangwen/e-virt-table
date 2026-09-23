import { EVirtTableOptions } from "../../types";
import { Paint } from "./Paint";
import Config from './Config';
import EvitListener from "./EvitListener";
import Store, { RowNode } from "./Store";
import Table from "./Table";
export default class Context {
    private animationFrameId = 0;
    table: Table;
    listener: EvitListener;
    config: Config;
    store: Store;
    containerElement!: HTMLDivElement;
    stageElement!: HTMLDivElement;
    canvasElement!: HTMLCanvasElement;
    overlayerElement!: HTMLDivElement;
    editorElement!: HTMLDivElement;
    emptyElement!: HTMLDivElement;
    contextMenuElement!: HTMLDivElement;
    loadingElement!: HTMLDivElement;
    stageWidth = 0;
    stageHeight = 0;
    paint: Paint;
    domSelectionStr = '';
    textSelectionStr = '';
    textSelecting = false;
    textSelectionKey = '';
    textSelAnchor = 0;
    textSelFocus = 0;
    isTableHovering = false;
    mousedown = false;
    isEmpty = false; // 是否空数据
    rowResizing = false; // 行调整大小中
    columnResizing = false; // 列调整大小中
    /** 内容区为滚动条让出的空隙：outer 为轨道宽，inner 为 0 */
    scrollbarGutter = 0;
    scrollerMove = false; // 滚动条移动中
    scrollerFocus = false; // 滚动条focus中
    autofillMove = false; // 自动填充移动中
    selectorMove = false; // 选择器移动中
    disableHoverIconClick = false; // 禁用hoverIconClick,防止填充选择器移动时，触发hoverIconClick
    selectColsIng = false; // 选择列中
    selectRowsIng = false; // 选择行中
    dragHeaderIng = false; // 拖拽表头中
    dragRowIng = false; // 拖拽行中
    finding = false; // 查找中
    contextMenuIng = false; // 右键菜单中
    editing = false; // 编辑中
    loading = false; // 加载中
    onlyMergeCell = false; // 只有合并单元格
    selectOnlyOne = false; // 只选择一个
    hasSelection = false; // 是否有选中
    hasTree = false; // 是否有树形结构
    scrollY = 0;
    scrollX = 0;
    maxScrollX = 0;
    maxScrollY = 0;
    lastCenterColIndex = 0;
    maxColIndex = 0;
    maxRowIndex = 0;
    startCenterIndex = 0;
    endCenterIndex = 0;
    startRowIndex = 0;
    endRowIndex = 0;
    constructor(target: HTMLDivElement, options: EVirtTableOptions) {
        this.config = new Config();
        this.store = new Store({
            context: this,
            columns: options.columns as unknown as any,
            data: options.data as unknown as any,
        });
        this.createContainer(target, options);
        this.paint = new Paint(this.canvasElement);
        this.initWH();
        this.listener = new EvitListener(this);
        this.table = new Table(this);
    }
    private createContainer(containerElement: HTMLDivElement, options: EVirtTableOptions) {
        this.containerElement = containerElement;
        this.stageElement = document.createElement('div');
        this.canvasElement = document.createElement('canvas');
        this.overlayerElement = options.overlayerElement || document.createElement('div');
        this.editorElement = options.editorElement || document.createElement('div');
        this.emptyElement = options.emptyElement || document.createElement('div');
        this.contextMenuElement = options.contextMenuElement || document.createElement('div');
        const { classPrefix } = this.config;
        this.containerElement.className = `${classPrefix}-container`;
        this.containerElement.tabIndex = 0;
        this.canvasElement.className = `${classPrefix}-canvas`;
        this.overlayerElement.className = `${classPrefix}-overlayer`;
        this.stageElement.className = `${classPrefix}-stage`;
        this.editorElement.className = `${classPrefix}-editor`;
        this.emptyElement.className = `${classPrefix}-empty`;
        this.contextMenuElement.className = `${classPrefix}-context-menu`;
        this.stageElement.appendChild(this.canvasElement);
        this.stageElement.appendChild(this.overlayerElement);
        this.containerElement.appendChild(this.stageElement);
        this.containerElement.appendChild(this.editorElement);
        this.containerElement.appendChild(this.emptyElement);
        this.containerElement.appendChild(this.contextMenuElement);
    }
    initWH() {
        const containerElement = this.containerElement.getBoundingClientRect();
        const { top } = containerElement;
        const windowInnerHeight = window.innerHeight;
        const visibleHeight = windowInnerHeight - top;
        const stageWidth = Math.floor(containerElement.width)
        let stageHeight = 0;
        if (visibleHeight > 0) {
            stageHeight = Math.floor(visibleHeight - 16);
        }
        if (stageHeight === this.stageHeight && stageWidth === this.stageWidth) {
            return;
        }
        this.stageHeight = stageHeight;
        this.stageWidth = stageWidth;
        // this.stageHeight = Math.floor(containerElement.height);
        this.stageElement.style.width = `${this.stageWidth}px`;
        this.stageElement.style.height = `${this.stageHeight}px`;
        this.stageElement.style.borderColor = this.config.borderColor;
        this.stageElement.style.borderRadius = `${this.config.borderRadius}px`;
        const dpr = window.devicePixelRatio || 1; // 获取设备像素比
        this.canvasElement.width = Math.round(this.stageWidth * dpr);
        this.canvasElement.height = Math.round(this.stageHeight * dpr);
        // console.log(this.canvasElement.width, this.canvasElement.height);
        this.canvasElement.style.width = `${this.stageWidth}px`;
        this.canvasElement.style.height = `${this.stageHeight}px`;
        this.paint.scale(dpr);
    }
    setScrollY(scrollY: number) {
        this.table.setScrollY(scrollY);
    }
    setScrollX(scrollX: number) {
        this.table.setScrollX(scrollX);
    }
    draw() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame(() => {
            console.time('draw');
            this.paint.clear();
            this.table.update();
            this.table.draw();
            console.timeEnd('draw');
        });
    }
    clearTextSelection(redraw = true) {
        this.textSelecting = false;
        this.textSelectionKey = '';
        this.textSelAnchor = 0;
        this.textSelFocus = 0;
        this.textSelectionStr = '';
        if (redraw) this.draw();
    }
    copyTextSelection(e?: KeyboardEvent) {
        const text = this.textSelectionStr;
        if (!text) return;
        e?.preventDefault();
        navigator.clipboard?.writeText(text).catch((error) => console.error('Copy Failure:', error));
    }
    destroy() {
        this.listener.destroy();
    }
}
