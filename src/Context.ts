import Database from './Database';
import History from './History';
import EventBrowser from './EventBrowser';
import EventBus, { EventCallback } from './EventBus';
import Paint from './Paint';
import Config from './Config';
import { Column, EVirtTableOptions } from './types';
import Icons from './Icons';
import CellHeader from './CellHeader';
import Row from './Row';
import { generateShortUUID } from './util';
import Cell from './Cell';
import EventTable from './EventTable';
export type ConfigType = Partial<typeof Config>;
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
    private uuid = generateShortUUID();
    targetContainer: HTMLElement;
    target: HTMLCanvasElement;
    paint: Paint;
    icons: Icons;
    mousedown = false;
    isPointer = false;
    rowResizing = false; // 行调整大小中
    columnResizing = false; // 列调整大小中
    scrollerMove = false; // 滚动条移动中
    scrollerFocus = false; // 滚动条focus中
    autofillMove = false; // 自动填充移动中
    selectorMove = false; // 选择器移动中
    editing = false; // 编辑中
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

    constructor(targetContainer: HTMLDivElement, target: HTMLCanvasElement, options: EVirtTableOptions) {
        this.target = target;
        this.targetContainer = targetContainer;
        this.target.setAttribute('uuid', this.uuid);
        this.config = new Config(options.config || {});
        this.eventBus = new EventBus();
        this.eventBrowser = new EventBrowser(this);
        this.eventTable = new EventTable(this);
        this.paint = new Paint(target);
        this.database = new Database(this, options);
        this.history = new History(this);
        this.icons = new Icons(this);
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
        this.selector = {
            enable: false,
            xArr: [-1, -1],
            yArr: [-1, -1],
            xArrCopy: [-1, -1],
            yArrCopy: [-1, -1],
        };
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
        const scrollMaxY = this.body.height - this.body.visibleHeight - this.footer.height;
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
        const scrollMaxY = this.body.height - this.body.visibleHeight - this.footer.height;
        if (scrollY < 0) {
            scrollY = 0;
        } else if (scrollY > scrollMaxY) {
            scrollY = scrollMaxY;
        }
        this.emit('setScrollY', scrollY);
    }
    isTarget(target: HTMLCanvasElement): boolean {
        if (target === null) return false;
        const uuid = target.getAttribute('uuid');
        return this.uuid === uuid;
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
