import Database from "./Database";
import History from "./History";
import EventBrowser from "./EventBrowser";
import EventBus, { EventCallback } from "./EventBus";
import Paint from "./Paint";
import config from "./config";
import { Column, EVirtTableOptions } from "./types";
import Icons from "./Icons";
import CellHeader from "./CellHeader";
import Row from "./Row";
import { generateShortUUID } from "./util";
import Cell from "./Cell";
export type ConfigType = Partial<typeof config>;
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
  private resizeObserver!: ResizeObserver;
  private eventBus: EventBus;
  private eventBrowser: EventBrowser;
  private uuid = generateShortUUID();
  target: HTMLCanvasElement;
  paint: Paint;
  icons: Icons;
  mousedown = false;
  isPointer = false;
  rowResizing = false; // 行调整大小中
  columnResizing = false; // 列调整大小中
  scrollerMove = false; // 滚动条移动中
  autofillMove = false; // 自动填充移动中
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
  config: ConfigType;

  constructor(target: HTMLCanvasElement, options: EVirtTableOptions) {
    this.target = target;
    this.target.setAttribute("uuid", this.uuid);
    this.config = { ...config, ...options.config };
    this.eventBus = new EventBus();
    this.eventBrowser = new EventBrowser(this);
    this.paint = new Paint(target);
    this.database = new Database(this, options);
    this.history = new History(this);
    this.icons = new Icons(this);
    this.initListener();
  }
  initListener(): void {
    // 监听窗口大小变化
    this.resizeObserver = new ResizeObserver(() => {
      this.emit("resizeObserver");
      this.emit("draw");
    });
    if (this.target.parentElement) {
      this.resizeObserver.observe(this.target);
    }
    this.on("mousedown", (e) => {
      if (!this.isTarget(e.target)) {
        return;
      }
      // 左边点击
      if (e.button !== 0) {
        return;
      }
      const y = e.layerY;
      const x = e.layerX;
      // 列行调整大小中不处理
      if (this.target.style.cursor === "row-resize") {
        return;
      }
      if (this.target.style.cursor === "col-resize") {
        return;
      }
      // 列调整大小中不处理
      if (this.columnResizing) {
        return;
      }
      // 行调整大小中不处理
      if (this.rowResizing) {
        return;
      }
      const { SCROLLER_TRACK_SIZE = 0 } = this.config;
      // 滚动条移动不处理
      if (this.scrollerMove) {
        return;
      }
      // 点击滚动条不处理
      if (y > this.target.offsetHeight - SCROLLER_TRACK_SIZE) {
        return;
      }
      // 点击滚动条不处理
      if (x > this.target.offsetWidth - SCROLLER_TRACK_SIZE) {
        return;
      }
      // header
      const renderCellHeaders = this.header.renderCellHeaders;
      for (const cell of renderCellHeaders) {
        const layerX = cell.getDrawX();
        const layerY = cell.getDrawY();
        if (
          x > layerX &&
          x < layerX + cell.width &&
          y > layerY &&
          y < layerY + cell.height
        ) {
          this.focusCellHeader = cell;
          this.emit("cellHeaderMousedown", cell, e);
          return; // 找到后直接返回
        }
      }
      // body
      const renderRows = this.body.renderRows;
      for (const row of renderRows) {
        // 优先处理固定列
        const cells = row.fixedCells.concat(row.noFixedCells);
        for (const cell of cells) {
          const layerX = cell.getDrawX();
          const layerY = cell.getDrawY();
          if (
            x > layerX &&
            x < layerX + cell.width &&
            y > layerY &&
            y < layerY + cell.height
          ) {
            this.setFocusCell(cell);
            this.emit("cellMousedown", cell, e);
            return; // 找到后直接返回
          }
        }
      }
    });
    this.on("click", (e) => {
      if (!this.isTarget(e.target)) {
        return;
      }
      // 左边点击
      if (e.button !== 0) {
        return;
      }
      const y = e.layerY;
      const x = e.layerX;
      const { SCROLLER_TRACK_SIZE = 0 } = this.config;
      // 列行调整大小中不处理
      if (this.target.style.cursor === "row-resize") {
        return;
      }
      // 列调整大小中不处理
      if (this.columnResizing) {
        return;
      }
      // 行调整大小中不处理
      if (this.rowResizing) {
        return;
      }
      // 滚动条移动不处理
      if (this.scrollerMove) {
        return;
      }
      // 点击滚动条不处理
      if (y > this.target.offsetHeight - SCROLLER_TRACK_SIZE) {
        return;
      }
      // 点击滚动条不处理
      if (x > this.target.offsetWidth - SCROLLER_TRACK_SIZE) {
        return;
      }
      // header
      const renderCellHeaders = this.header.renderCellHeaders;
      for (const cell of renderCellHeaders) {
        const layerX = cell.getDrawX();
        const layerY = cell.getDrawY();
        if (
          x > layerX &&
          x < layerX + cell.width &&
          y > layerY &&
          y < layerY + cell.height
        ) {
          this.clickCellHeader = cell;
          this.emit("cellHeaderClick", cell, e);
          // selection事件
          if (
            ["selection", "index-selection"].includes(cell.type) &&
            this.isPointer
          ) {
            if (
              cell.checkboxName === "checkbox-uncheck" ||
              cell.checkboxName === "checkbox-indeterminate"
            ) {
              this.database.toggleAllSelection();
            } else if (cell.checkboxName === "checkbox-check") {
              this.database.clearSelection();
            }
            this.emit("draw");
          }
          return; // 找到后直接返回
        }
      }
      // body
      const renderRows = this.body.renderRows;
      for (const row of renderRows) {
        // 优先处理固定列
        const cells = row.fixedCells.concat(row.noFixedCells);
        for (const cell of cells) {
          const layerX = cell.getDrawX();
          const layerY = cell.getDrawY();
          if (
            x > layerX &&
            x < layerX + cell.width &&
            y > layerY &&
            y < layerY + cell.height
          ) {
            this.clickCell = cell;
            this.emit("cellClick", cell, e);
            // selection事件
            if (
              ["selection", "index-selection"].includes(cell.type) &&
              this.isPointer
            ) {
              const selectable = this.database.getRowSelectable(cell.rowKey);
              if (!selectable) {
                return;
              }
              this.database.toggleRowSelection(cell.rowKey);
            }
            return; // 找到后直接返回
          }
        }
      }
    });
    this.on("mousemove", (e) => {
      if (!this.isTarget(e.target)) {
        return;
      }
      const y = e.layerY;
      const x = e.layerX;
      const { SCROLLER_TRACK_SIZE = 0 } = this.config;
      // 列行调整大小中不处理
      if (this.target.style.cursor === "row-resize") {
        return;
      }
      // 列调整大小中不处理
      if (this.columnResizing) {
        return;
      }
      // 行调整大小中不处理
      if (this.rowResizing) {
        return;
      }
      // 滚动条移动不处理
      if (this.scrollerMove) {
        return;
      }
      // 点击滚动条不处理
      if (y > this.target.offsetHeight - SCROLLER_TRACK_SIZE) {
        return;
      }
      // 点击滚动条不处理
      if (x > this.target.offsetWidth - SCROLLER_TRACK_SIZE) {
        return;
      }
      // header
      const renderCellHeaders = this.header.renderCellHeaders;
      for (const cell of renderCellHeaders) {
        const layerX = cell.getDrawX();
        const layerY = cell.getDrawY();
        if (
          x > layerX &&
          x < layerX + cell.width &&
          y > layerY &&
          y < layerY + cell.height
        ) {
          this.emit("cellHeaderMouseenter", cell, e);
          // 移出事件
          if (this.hoverCellHeader && this.hoverCellHeader !== cell) {
            this.emit("cellHeaderMouseleave", this.hoverCellHeader, e);
          }
          // selection事件
          if (["selection", "index-selection"].includes(cell.type)) {
            const { CHECKBOX_SIZE = 0 } = this.config;
            const _x = cell.drawX + (cell.width - CHECKBOX_SIZE) / 2;
            const _y = cell.drawY + (cell.height - CHECKBOX_SIZE) / 2;
            if (
              x > _x &&
              x < _x + CHECKBOX_SIZE &&
              y > _y &&
              y < _y + CHECKBOX_SIZE
            ) {
              this.target.style.cursor = "pointer";
              this.isPointer = true;
              this.emit("cellHeaderSelectionMouseenter", cell, e);
            } else {
              this.isPointer = false;
              this.target.style.cursor = "default";
            }
          }
          if (this.hoverCellHeader === cell) {
            return;
          }
          this.hoverCellHeader = cell;
          this.emit("cellHeaderHoverChange", cell);
          return; // 找到后直接返回
        }
      }
      // body
      const renderRows = this.body.renderRows;
      for (const row of renderRows) {
        // 优先处理固定列
        const cells = row.fixedCells.concat(row.noFixedCells);
        for (const cell of cells) {
          const layerX = cell.getDrawX();
          const layerY = cell.getDrawY();
          if (
            x > layerX &&
            x < layerX + cell.width &&
            y > layerY &&
            y < layerY + cell.height
          ) {
            this.emit("cellMouseenter", cell, e);
            // 移出事件
            if (this.hoverCell && this.hoverCell !== cell) {
              this.emit("cellMouseleave", this.hoverCell, e);
            }
            // selection事件
            if (["selection", "index-selection"].includes(cell.type)) {
              const { CHECKBOX_SIZE = 0 } = this.config;
              const _x = cell.drawX + (cell.width - CHECKBOX_SIZE) / 2;
              const _y = cell.drawY + (cell.height - CHECKBOX_SIZE) / 2;
              if (
                x > _x &&
                x < _x + CHECKBOX_SIZE &&
                y > _y &&
                y < _y + CHECKBOX_SIZE
              ) {
                const selectable = this.database.getRowSelectable(cell.rowKey);
                if (!selectable) {
                  this.target.style.cursor = "not-allowed";
                } else {
                  this.target.style.cursor = "pointer";
                }
                this.isPointer = true;
                this.emit("cellSelectionMouseenter", cell, e);
              } else {
                this.isPointer = false;
                this.target.style.cursor = "default";
              }
            }
            if (this.hoverCell === cell) return;
            if (this.hoverCell?.rowKey !== cell.rowKey) {
              this.hoverCell = cell;
              this.hoverRow = this.body.renderRows[cell.rowIndex];
              this.emit("rowHoverChange", this.hoverRow, cell);
              this.emit("draw");
            }
            this.hoverCell = cell;
            this.emit("cellHoverChange", cell);
            return; // 找到后直接返回
          }
        }
      }
    });
  }
  setFocusCell(cell: Cell) {
    if (this.focusCell === cell) return;
    if (this.focusCell?.rowKey !== cell.rowKey) {
      // 提前设置一下，保证rowFocusChange事件，能用focusCell
      this.focusCell = cell;
      this.emit("rowFocusChange", cell);
    }
    this.focusCell = cell;
    this.emit("cellFocusChange", cell);
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
    let text = "";
    for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
      const cellsData = [];
      for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
        const rowIndex = ri + yArr[0];
        const colIndex = ci + xArr[0];
        const item = this.database.getItemValueForRowIndexAndColIndex(
          rowIndex,
          colIndex
        );
        if (item) {
          cellsData.push(item.value);
        }
      }
      text += `${cellsData.join("\t")}\r`;
      rowsData.push(cellsData);
    }
    text = text ? text.replace(/\r$/, "") : " "; // 去掉最后一个\n，否则会导致复制到excel里多一行空白
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
    const scrollMaxY =
      this.body.height - this.body.visibleHeight - this.footer.height;
    if (scrollY < 0) {
      scrollY = 0;
    } else if (scrollY > scrollMaxY) {
      scrollY = scrollMaxY;
    }
    this.emit("setScroll", scrollX, scrollY);
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
    this.emit("setScrollX", scrollX);
  }
  setScrollY(y: number): void {
    // 边界处理
    let scrollY = Math.floor(y);
    const scrollMaxY =
      this.body.height - this.body.visibleHeight - this.footer.height;
    if (scrollY < 0) {
      scrollY = 0;
    } else if (scrollY > scrollMaxY) {
      scrollY = scrollMaxY;
    }
    this.emit("setScrollY", scrollY);
  }
  isTarget(target: HTMLCanvasElement): boolean {
    if (target === null) return false;
    const uuid = target.getAttribute("uuid");
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
  setHeader(headerOptions: HeaderOptions): void {
    this.header = headerOptions;
  }
  setBody(bodyOptions: BodyOptions): void {
    this.body = bodyOptions;
  }
  destroy(): void {
    this.resizeObserver.unobserve(this.target);
    this.eventBrowser.destroy();
    this.eventBus.destroy();
  }
}
