import { Column, EVirtTableOptions } from "../../types";
// import { EventBus } from "./EventBus";
import { Paint } from "./Paint";
import Config from './Config';
import EvitListener from "./EvitListener";
import Store from "./Store";
import type { Text } from "./Text";
export default class Context {
    private animationFrameId: number | undefined = undefined;
    private listener: EvitListener;
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
    /** 文本划选进行中；全局同时只允许一个 Text 划选 */
    textSelecting = false;
    selectingText: Text | null = null;
    isMouseoverTargetContainer = false;
    mousedown = false;
    isEmpty = false; // 是否空数据
    rowResizing = false; // 行调整大小中
    columnResizing = false; // 列调整大小中
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
    fixedLeftWidth = 0;
    fixedRightWidth = 0;
    lastCenterColIndex = 0;
    maxColIndex = 0;
    maxRowIndex = 0;
    constructor(target: HTMLDivElement, options: EVirtTableOptions) {
        this.config = new Config();
        this.store = new Store({
            columns: options.columns as unknown as any,
            data: options.data as unknown as any,
        });
        this.createContainer(target, options);
        this.paint = new Paint(this.canvasElement);
        this.initWH();
        this.listener = new EvitListener(this);
        console.log(this.store);

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
        this.stageWidth = Math.floor(containerElement.width);
        this.stageHeight = Math.floor(containerElement.height);
        this.stageElement.style.width = `${this.stageWidth}px`;
        this.stageElement.style.height = `${this.stageHeight}px`;
        const dpr = window.devicePixelRatio || 1; // 获取设备像素比
        this.canvasElement.width = Math.round(this.stageWidth * dpr);
        this.canvasElement.height = Math.round(this.stageHeight * dpr);
        this.canvasElement.style.width = `${this.stageWidth}px`;
        this.canvasElement.style.height = `${this.stageHeight}px`;
        this.paint.scale(dpr);
    }
    draw() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame(() => {
            console.time('draw');
            this.initWH();
            this.paint.draw();
            console.timeEnd('draw');
        });
    }
    destroy() {
        this.listener.destroy();
    }
}
