import Database from './Database';
import History from './History';
import EventBrowser from './EventBrowser';
import EventBus, { EventCallback } from './EventBus';
import Paint from './Paint';
import Config from './Config';
import { ChangeItem, Column, EVirtTableOptions, RowParams } from './types';
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
    loadingElement?: HTMLDivElement;
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
    allCellHeaders: CellHeader[];
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
    loadingElement?: HTMLDivElement;
    stageWidth = 0;
    stageHeight = 0;
    paint: Paint;
    icons: Icons;
    domSelectionStr = '';
    isMouseoverTargetContainer = false;
    mousedown = false;
    isPointer = false;
    isEmpty = false; // 是否空数据
    rowResizing = false; // 行调整大小中
    columnResizing = false; // 列调整大小中
    scrollerMove = false; // 滚动条移动中
    scrollerFocus = false; // 滚动条focus中
    autofillMove = false; // 自动填充移动中
    selectorMove = false; // 选择器移动中
    selectColsIng = false; // 选择列中
    selectRowsIng = false; // 选择行中
    dragHeaderIng = false; // 拖拽表头中
    adjustPositioning = false; // 调整位置中
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
    hoverRow?: Row;
    clickCell?: Cell;
    focusCell?: Cell;
    currentCell?: Cell;
    hoverCell?: Cell;
    clickCellHeader?: CellHeader;
    focusCellHeader?: CellHeader;
    hoverCellHeader?: CellHeader;
    mouseX = 0;
    mouseY = 0;
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
        allCellHeaders: [],
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
    drawTime = 0;
    rowExtendMap = new Map<string, string>(); // 行扩展状态管理，key为rowKey，value为展开的colKey

    constructor(containerOptions: containerElementOptions, options: EVirtTableOptions) {
        const {
            containerElement,
            stageElement,
            canvasElement,
            overlayerElement,
            editorElement,
            emptyElement,
            loadingElement,
            contextMenuElement,
        } = containerOptions;
        this.containerElement = containerElement;
        stageElement.tabIndex = 0; // 设置为可获取焦点
        this.stageElement = stageElement;
        this.canvasElement = canvasElement;
        this.overlayerElement = overlayerElement;
        this.editorElement = editorElement;
        this.emptyElement = emptyElement;
        this.loadingElement = loadingElement;
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
    setItemValueByEditor(rowKey: string, key: string, value: any, history = true, reDraw = true, checkReadonly = true) {
        // 启用合并单元格关联
        if (this.config.ENABLE_MERGE_CELL_LINK) {
            const cell = this.database.getVirtualBodyCellByKey(rowKey, key);
            if (cell && (cell.mergeRow || cell.mergeCol)) {
                const { dataList } = cell.getSpanInfo();
                const data = dataList.map((item: any) => ({ ...item, value }));
                this.database.batchSetItemValue(data, history, checkReadonly);
                return;
            }
        }
        this.database.setItemValue(rowKey, key, value, history, reDraw, true, checkReadonly);
    }

    batchSetItemValueByEditor(_list: ChangeItem[], history = true, checkReadonly = true) {
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
            this.database.batchSetItemValue(list, history, checkReadonly);
        } else {
            this.database.batchSetItemValue(_list, history, checkReadonly);
        }
    }
    setFocusCell(cell: Cell) {
        if (this.focusCell === cell) return;
        if (this.focusCell?.rowKey !== cell.rowKey) {
            // 提前设置一下，保证rowFocusChange事件，能用focusCell
            this.currentCell = cell;
            this.emit('rowFocusChange', cell);
            const data: RowParams = {
                rowIndex: cell.rowIndex,
                rowKey: cell.rowKey,
                row: cell.row,
            };
            this.emit('currentRowChange', data);
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
                const cell = this.database.getVirtualBodyCell(rowIndex, colIndex);
                if (cell) {
                    // 选择器值类型
                    if (cell.selectorCellValueType === 'displayText') {
                        cellsData.push(cell.displayText);
                    } else {
                        // 默认value
                        cellsData.push(cell.getValue());
                    }
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
    startAdjustPosition(e: MouseEvent) {
        this.emit('startAdjustPosition', e);
    }
    stopAdjustPosition() {
        this.emit('stopAdjustPosition');
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

    /**
     * 设置行扩展状态
     */
    setRowExtend(rowKey: string, colKey: string) {
        const currentColKey = this.rowExtendMap.get(rowKey);
        const wasExtended = !!currentColKey;
        
        // 收集需要收起的其他行
        const otherExtendedRows: Array<{ rowKey: string; colKey: string; rowIndex: number }> = [];
        this.rowExtendMap.forEach((extendColKey, extendRowKey) => {
            if (extendRowKey !== rowKey) {
                const otherRowIndex = this.database.getRowIndexForRowKey(extendRowKey);
                if (otherRowIndex !== undefined) {
                    otherExtendedRows.push({ 
                        rowKey: extendRowKey, 
                        colKey: extendColKey,
                        rowIndex: otherRowIndex
                    });
                }
            }
        });
        
        if (currentColKey === colKey) {
            // 如果点击的是同一个扩展，则收起
            this.rowExtendMap.delete(rowKey);
        } else {
            // 否则设置新的扩展
            // 先批量收起所有其他已展开的行（单选行为）
            otherExtendedRows.forEach(({ rowKey: otherRowKey }) => {
                this.rowExtendMap.delete(otherRowKey);
            });
            
            // 设置新的扩展
            this.rowExtendMap.set(rowKey, colKey);
        }
        
        // 先发出其他行的收起事件（批量）
        otherExtendedRows.forEach(({ rowKey: otherRowKey, rowIndex: otherRowIndex }) => {
            this.emit('rowExtendChange', {
                rowKey: otherRowKey,
                colKey: null,
                rowIndex: otherRowIndex,
                wasExtended: true,
                isExtended: false,
                action: 'collapse'
            });
        });
        
        // 最后发出当前行的扩展变化事件
        const isExtended = this.rowExtendMap.has(rowKey);
        const rowIndex = this.database.getRowIndexForRowKey(rowKey);
        const action = isExtended ? 'expand' : 'collapse';
        this.emit('rowExtendChange', { 
            rowKey, 
            colKey: this.rowExtendMap.get(rowKey) || null,
            rowIndex,
            wasExtended,
            isExtended,
            action
        });
    }

    /**
     * 获取行的扩展状态
     */
    getRowExtend(rowKey: string): string | undefined {
        return this.rowExtendMap.get(rowKey);
    }

    /**
     * 检查行是否已扩展指定列
     */
    isRowExtended(rowKey: string, colKey: string): boolean {
        return this.rowExtendMap.get(rowKey) === colKey;
    }

    /**
     * 清除所有扩展状态
     */
    clearAllRowExtend() {
        this.rowExtendMap.clear();
        this.emit('rowExtendChange', { rowKey: null, colKey: null });
        this.emit('clearAllExtendRowHeights'); // 通知清除所有高度记录
    }
}
