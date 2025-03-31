import Database from './Database';
import History from './History';
import EventBrowser from './EventBrowser';
import EventBus, { EventCallback } from './EventBus';
import Paint from './Paint';
import Config from './Config';
import { ChangeItem, Column, EVirtTableOptions } from './types';
import Icons from './Icons';
import CellHeader from './CellHeader';
import Row from './Row';
import Cell from './Cell';
import EventTable from './EventTable';
export type ConfigType = Partial<typeof Config>;
export type containerElementOptions = {
    containerElement: HTMLDivElement;
    stageElement: HTMLDivElement;
    canvasElement: HTMLCanvasElement;
    overlayerElement: HTMLDivElement;
    editorElement: HTMLDivElement;
    emptyElement?: HTMLDivElement;
    contextMenuElement?: HTMLDivElement;
};
export type HeaderOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    visibleHeight: number;
    visibleWidth: number;
    visibleLeafColumns: Column[];
    leafCellHeaders: CellHeader[];
    renderLeafCellHeaders: CellHeader[];
    renderCellHeaders: CellHeader[];
    fixedLeftCellHeaders: [];
    fixedRightCellHeaders: [];
    renderCenterCellHeaders: [];
};
export type BodyOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    visibleHeight: number;
    visibleWidth: number;
    headIndex: number;
    tailIndex: number;
    visibleRows: any[];
    renderRows: Row[];
    data: any[];
};
export type FooterOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    visibleHeight: number;
    visibleWidth: number;
    renderRows: Row[];
};
export type SelectorOptions = {
    enable: boolean;
    xArr: number[];
    yArr: number[];
    xArrCopy: number[];
    yArrCopy: number[];
};
export type AutofillOptions = {
    enable: boolean;
    xArr: number[];
    yArr: number[];
};
export default class Context {
    private eventBus: EventBus;
    private eventBrowser: EventBrowser;
    private eventTable: EventTable;
    containerElement: HTMLDivElement;
    stageElement: HTMLDivElement;
    canvasElement: HTMLCanvasElement;
    overlayerElement: HTMLDivElement;
    editorElement: HTMLDivElement;
    emptyElement?: HTMLDivElement;
    contextMenuElement?: HTMLDivElement;
    stageWidth = 0;
    stageHeight = 0;
    paint: Paint;
    icons: Icons;
    isMouseoverTargetContainer = false;
    mousedown = false;
    isPointer = false;
    rowResizing = false; // 行调整大小中
    columnResizing = false; // 列调整大小中
    scrollerMove = false; // 滚动条移动中
    scrollerFocus = false; // 滚动条focus中
    autofillMove = false; // 自动填充移动中
    selectorMove = false; // 选择器移动中
    adjustPositioning = false; // 调整位置中
    editing = false; // 编辑中
    onlyMergeCell = false; // 只有合并单元格
    selectOnlyOne = false; // 只选择一个
    scrollY = 0;
    scrollX = 0;
    fixedLeftWidth = 0;
    fixedRightWidth = 0;
    maxColIndex = 0;
    maxRowIndex = 0;
    hoverRow?: Row;
    clickCell?: Cell;
    focusCell?: Cell;
    hoverCell?: Cell;
    clickCellHeader?: CellHeader;
    focusCellHeader?: CellHeader;
    hoverCellHeader?: CellHeader;
    body: BodyOptions = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        visibleHeight: 0,
        visibleWidth: 0,
        headIndex: 0,
        tailIndex: 0,
        visibleRows: [],
        renderRows: [],
        data: [],
    };
    footer: FooterOptions = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        visibleHeight: 0,
        visibleWidth: 0,
        renderRows: [],
    };
    header: HeaderOptions = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        visibleHeight: 0,
        visibleWidth: 0,
        visibleLeafColumns: [],
        leafCellHeaders: [],
        renderLeafCellHeaders: [],
        renderCellHeaders: [],
        fixedLeftCellHeaders: [],
        fixedRightCellHeaders: [],
        renderCenterCellHeaders: [],
    };
    selector: SelectorOptions = {
        enable: false,
        xArr: [-1, -1],
        yArr: [-1, -1],
        xArrCopy: [-1, -1],
        yArrCopy: [-1, -1],
    };
    autofill: AutofillOptions = {
        enable: false,
        xArr: [-1, -1],
        yArr: [-1, -1],
    };
    database: Database;
    history: History;
    config: Config;

    constructor(containerOptions: containerElementOptions, options: EVirtTableOptions) {
        const {
            containerElement,
            stageElement,
            canvasElement,
            overlayerElement,
            editorElement,
            emptyElement,
            contextMenuElement,
        } = containerOptions;
        this.containerElement = containerElement;
        stageElement.tabIndex = 0; // 设置为可获取焦点
        this.stageElement = stageElement;
        this.canvasElement = canvasElement;
        this.overlayerElement = overlayerElement;
        this.editorElement = editorElement;
        this.emptyElement = emptyElement;
        this.contextMenuElement = contextMenuElement;
        this.config = new Config(options.config || {});
        this.eventBus = new EventBus();
        this.eventBrowser = new EventBrowser(this);
        this.eventTable = new EventTable(this);
        this.paint = new Paint(this.canvasElement);
        this.database = new Database(this, options);
        this.history = new History(this);
        this.icons = new Icons(this);
    }
    setConfig(config: Config) {
        this.config = new Config(config);
    }
    setItemValueByEditor(rowKey: string, key: string, value: any, history = true, reDraw = true) {
        // 启用合并单元格关联
        if (this.config.ENABLE_MERGE_CELL_LINK) {
            const rowIndex = this.database.getRowIndexForRowKey(rowKey);
            const colIndex = this.database.getColIndexForKey(key);
            if (rowIndex === undefined || colIndex === undefined) return;
            const cell = this.database.getVirtualBodyCell(rowIndex, colIndex);
            if (cell) {
                const { dataList } = cell.getSpanInfo();
                const data = dataList.map((item: any) => ({ ...item, value }));
                this.database.batchSetItemValue(data, history);
            }
        } else {
            this.database.setItemValue(rowKey, key, value, history, reDraw, true);
        }
    }

    batchSetItemValueByEditor(_list: ChangeItem[], history = true) {
        // 启用合并单元格关联
        if (this.config.ENABLE_MERGE_CELL_LINK) {
            const list: ChangeItem[] = [];
            _list.forEach((item) => {
                const rowIndex = this.database.getRowIndexForRowKey(item.rowKey);
                const colIndex = this.database.getColIndexForKey(item.key);
                if (rowIndex === undefined || colIndex === undefined) return;
                const cell = this.database.getVirtualBodyCell(rowIndex, colIndex);
                if (cell) {
                    const { dataList } = cell.getSpanInfo();
                    const data = dataList.map((list: any) => ({ ...list, value: item.value }));
                    list.push(...data);
                }
            });
            this.database.batchSetItemValue(list, history);
        } else {
            this.database.batchSetItemValue(_list, history);
        }
    }
    setFocusCell(cell: Cell) {
        if (this.focusCell === cell) return;
        if (this.focusCell?.rowKey !== cell.rowKey) {
            // 提前设置一下，保证rowFocusChange事件，能用focusCell
            this.focusCell = cell;
            this.emit('rowFocusChange', cell);
        }
        this.focusCell = cell;
        this.emit('cellFocusChange', cell);
    }
    clearSelector() {
        this.selector.enable = false;
        this.selector.xArr = [-1, -1];
        this.selector.yArr = [-1, -1];
        this.emit('clearSelector');
    }
    clearSelectorCopy() {
        this.selector.xArrCopy = [-1, -1];
        this.selector.yArrCopy = [-1, -1];
    }
    clearAutofill() {
        this.autofill = {
            enable: false,
            xArr: [-1, -1],
            yArr: [-1, -1],
        };
    }
    /**
     * 获取选中的数据
     * @returns
     */
    getSelectedData() {
        const rowsData = [];
        const yArr = this.selector.yArr;
        const xArr = this.selector.xArr;
        let text = '';
        for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
            const cellsData = [];
            for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
                const rowIndex = ri + yArr[0];
                const colIndex = ci + xArr[0];
                const item = this.database.getItemValueForRowIndexAndColIndex(rowIndex, colIndex);
                if (item) {
                    cellsData.push(item.value);
                }
            }
            text += `${cellsData.join('\t')}\r`;
            rowsData.push(cellsData);
        }
        text = text ? text.replace(/\r$/, '') : ' '; // 去掉最后一个\n，否则会导致复制到excel里多一行空白
        return {
            xArr,
            yArr,
            text,
            value: rowsData,
        };
    }
    setScroll(x: number, y: number): void {
        let scrollX = Math.floor(x);
        const scrollMaxX = this.body.width - this.body.visibleWidth;
        // x边界处理
        if (scrollX < 0) {
            scrollX = 0;
        } else if (scrollX > scrollMaxX) {
            scrollX = scrollMaxX;
        }
        // y边界处理
        let scrollY = Math.floor(y);
        let scrollMaxY = this.body.height - this.body.visibleHeight;
        if (!this.config.FOOTER_FIXED) {
            scrollMaxY = this.body.height + this.footer.height - this.body.visibleHeight;
        }
        if (scrollY < 0) {
            scrollY = 0;
        } else if (scrollY > scrollMaxY) {
            scrollY = scrollMaxY;
        }
        this.emit('setScroll', scrollX, scrollY);
    }
    setScrollX(x: number): void {
        let scrollX = Math.floor(x);
        const scrollMaxX = this.body.width - this.body.visibleWidth;
        // 边界处理
        if (scrollX < 0) {
            scrollX = 0;
        } else if (scrollX > scrollMaxX) {
            scrollX = scrollMaxX;
        }
        this.emit('setScrollX', scrollX);
    }
    setScrollY(y: number): void {
        // 边界处理
        let scrollY = Math.floor(y);
        let footerHeight = 0;
        if (!this.config.FOOTER_FIXED) {
            footerHeight = this.footer.height;
        }
        const scrollMaxY = this.body.height - this.body.visibleHeight + footerHeight;
        if (scrollY < 0) {
            scrollY = 0;
        } else if (scrollY > scrollMaxY) {
            scrollY = scrollMaxY;
        }
        this.emit('setScrollY', scrollY);
    }
    isTarget(e: Event): boolean {
        if (!this.containerElement.contains(e.target as Node)) {
            return false;
        }
        return true;
    }
    getOffset(e: MouseEvent) {
        const { left, top } = this.containerElement.getBoundingClientRect();
        return {
            offsetX: e.clientX - left,
            offsetY: e.clientY - top,
        };
    }
    hasEvent(event: string): boolean {
        return this.eventBus.has(event);
    }
    on(event: string, callback: EventCallback): void {
        this.eventBus.on(event, callback);
    }
    once(event: string, callback: EventCallback): void {
        this.eventBus.once(event, callback);
    }
    off(event: string, callback: EventCallback): void {
        this.eventBus.off(event, callback);
    }
    emit(event: string, ...args: any[]): void {
        this.eventBus.emit(event, ...args);
    }
    destroy(): void {
        this.eventTable.destroy();
        this.eventBrowser.destroy();
        this.eventBus.destroy();
    }
}
