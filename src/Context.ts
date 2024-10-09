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
export default class Context {
  private eventBus: EventBus;
  private eventBrowser: EventBrowser;
  private uuid = generateShortUUID();
  target: HTMLCanvasElement;
  paint: Paint;
  icons: Icons;
  mousedown = false;
  rowResizing = false; // 行调整大小中
  columnResizing = false; // 列调整大小中
  scrollerMove = false; // 滚动条移动中
  scrollY = 0;
  scrollX = 0;
  fixedLeftWidth = 0;
  fixedRightWidth = 0;
  maxColIndex = 0;
  maxRowIndex = 0;
  clickCell?: Cell;
  focusCell?: Cell;
  hoverCell?: Cell;
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
  };
  selector: SelectorOptions = {
    enable: false,
    xArr: [-1, -1],
    yArr: [-1, -1],
    xArrCopy: [-1, -1],
    yArrCopy: [-1, -1],
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
    this.on("mousedown", (e) => {
      if (!this.isTarget(e.target)) {
        return;
      }
      const y = e.layerY;
      const x = e.layerX;
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
            this.setHoverCell(cell);
            return; // 找到后直接返回
          }
        }
      }
    });
  }
  private setHoverCell(cell: Cell) {
    // 如果在body行调整大小，就不显示
    // if (this.ctx.body.isResizing) {
    //   return;
    // }
    if (this.hoverCell === cell) return;
    if (this.hoverCell?.rowKey !== cell.rowKey) {
      this.hoverCell = cell;
      this.emit("rowHoverChange", cell);
    }
    this.hoverCell = cell;
    this.emit("cellHoverChange", cell);
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
  /**
   * 获取渲染单元格
   * @param rowIndex
   * @param colIndex
   * @returns
   */
  getRenderCell(rowIndex: number, colIndex: number) {
    // 设置选中FocusCell
    const row = this.body.renderRows.find((row) => row.rowIndex === rowIndex);
    if (!row) {
      return null;
    }
    const cell = row.cells.find(
      (cell: { colIndex: number }) => cell.colIndex === colIndex
    );
    return cell;
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
    this.eventBrowser.destroy();
    this.eventBus.destroy();
  }
}
