import { EVirtTableOptions } from "../../types";
import { EventBus } from "./EventBus";
import { Paint } from "./Paint";
import Config from './Config';
import EventBrowser from "./EventBrowser";
export default class Context {
    config: Config;
    eventBus: EventBus;
    private eventBrowser: EventBrowser;
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
        this.createContainer(target, options);
        this.eventBus = new EventBus();
        this.eventBrowser = new EventBrowser(this);
        this.paint = new Paint(this.canvasElement);
    }
    private createContainer(containerElement: HTMLDivElement, options: EVirtTableOptions) {
        const stageElement = document.createElement('div');
        const canvasElement = document.createElement('canvas');
        const overlayerElement = options.overlayerElement || document.createElement('div');
        const editorElement = options.editorElement || document.createElement('div');
        const emptyElement = options.emptyElement || document.createElement('div');
        const contextMenuElement = options.contextMenuElement || document.createElement('div');
        const { classPrefix } = this.config;
        containerElement.className = `${classPrefix}-container`;
        containerElement.tabIndex = 0;
        canvasElement.className = `${classPrefix}-canvas`;
        overlayerElement.className = `${classPrefix}-overlayer`;
        stageElement.className = `${classPrefix}-stage`;
        editorElement.className = `${classPrefix}-editor`;
        emptyElement.className = `${classPrefix}-empty`;
        contextMenuElement.className = `${classPrefix}-context-menu`;
        stageElement.appendChild(canvasElement);
        stageElement.appendChild(overlayerElement);
        containerElement.appendChild(stageElement);
        containerElement.appendChild(editorElement);
        containerElement.appendChild(emptyElement);
        containerElement.appendChild(contextMenuElement);
        this.canvasElement = canvasElement;
        this.stageElement = stageElement;
        this.overlayerElement = overlayerElement;
        this.editorElement = editorElement;
        this.emptyElement = emptyElement;
        this.contextMenuElement = contextMenuElement;
    }
    draw() {
        this.paint.draw();
    }
    destroy() {
        this.eventBrowser.destroy();
        this.eventBus.destroy();
    }
}
