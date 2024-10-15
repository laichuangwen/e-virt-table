import Cell from "./Cell";
import CellHeader from "./CellHeader";
import Context from "./Context";
import { ExpandLazyMethod } from "./types";

export default class EventTable {
  ctx: Context;
  private resizeObserver!: ResizeObserver;
  constructor(ctx: Context) {
    this.ctx = ctx;
    this.init();
  }
  private init(): void {
    // 监听窗口大小变化
    this.resizeObserver = new ResizeObserver(() => {
      this.ctx.emit("resizeObserver");
      this.ctx.emit("draw");
    });
    if (this.ctx.target.parentElement) {
      this.resizeObserver.observe(this.ctx.target);
    }
    // 按下事件
    this.ctx.on("mousedown", (e) => {
      // 左边点击
      if (e.button !== 0) {
        return;
      }
      // 是否忙碌，进行其他操作
      if (this.isBusy(e)) {
        return;
      }
      const y = e.offsetY;
      const x = e.offsetX;
      // header
      const renderCellHeaders = this.ctx.header.renderCellHeaders;
      for (const cell of renderCellHeaders) {
        const drawX = cell.getDrawX();
        const drawY = cell.getDrawY();
        if (
          x > drawX &&
          x < drawX + cell.width &&
          y > drawY &&
          y < drawY + cell.height
        ) {
          this.ctx.focusCellHeader = cell;
          this.ctx.emit("cellHeaderMousedown", cell, e);
          return; // 找到后直接返回
        }
      }
      // body
      const renderRows = this.ctx.body.renderRows;
      for (const row of renderRows) {
        // 优先处理固定列
        const cells = row.fixedCells.concat(row.noFixedCells);
        for (const cell of cells) {
          const drawX = cell.getDrawX();
          const drawY = cell.getDrawY();
          if (
            x > drawX &&
            x < drawX + cell.width &&
            y > drawY &&
            y < drawY + cell.height
          ) {
            this.ctx.setFocusCell(cell);
            this.ctx.emit("cellMousedown", cell, e);
            return; // 找到后直接返回
          }
        }
      }
    });
    this.ctx.on("click", (e) => {
      // 左边点击
      if (e.button !== 0) {
        return;
      }
      // 是否忙碌，进行其他操作
      if (this.isBusy(e)) {
        return;
      }
      const y = e.offsetY;
      const x = e.offsetX;
      // header
      const renderCellHeaders = this.ctx.header.renderCellHeaders;
      for (const cell of renderCellHeaders) {
        const drawX = cell.getDrawX();
        const drawY = cell.getDrawY();
        if (
          x > drawX &&
          x < drawX + cell.width &&
          y > drawY &&
          y < drawY + cell.height
        ) {
          this.ctx.clickCellHeader = cell;
          this.ctx.emit("cellHeaderClick", cell, e);
          // selection事件
          this.selectionClick(cell);
          return; // 找到后直接返回
        }
      }
      // body
      const renderRows = this.ctx.body.renderRows;
      for (const row of renderRows) {
        // 优先处理固定列
        const cells = row.fixedCells.concat(row.noFixedCells);
        for (const cell of cells) {
          const drawX = cell.getDrawX();
          const drawY = cell.getDrawY();
          if (
            x > drawX &&
            x < drawX + cell.width &&
            y > drawY &&
            y < drawY + cell.height
          ) {
            this.ctx.clickCell = cell;
            this.ctx.emit("cellClick", cell, e);
            // selection事件
            this.selectionClick(cell);
            // 树事件
            this.treeClick(cell);
            return; // 找到后直接返回
          }
        }
      }
    });
    this.ctx.on("mousemove", (e) => {
      // 是否忙碌，进行其他操作
      if (this.isBusy(e)) {
        return;
      }
      const y = e.offsetY;
      const x = e.offsetX;
      // header
      const renderCellHeaders = this.ctx.header.renderCellHeaders;
      for (const cell of renderCellHeaders) {
        const drawX = cell.getDrawX();
        const drawY = cell.getDrawY();
        if (
          x > drawX &&
          x < drawX + cell.width &&
          y > drawY &&
          y < drawY + cell.height
        ) {
          this.ctx.emit("cellHeaderMouseenter", cell, e);
          // 移出事件
          if (this.ctx.hoverCellHeader && this.ctx.hoverCellHeader !== cell) {
            this.ctx.emit("cellHeaderMouseleave", this.ctx.hoverCellHeader, e);
          }
          // selection头部事件
          this.imageEnterAndLeave(cell, e);
          if (this.ctx.hoverCellHeader === cell) {
            return;
          }
          this.ctx.hoverCellHeader = cell;
          this.ctx.emit("cellHeaderHoverChange", cell);
          return; // 找到后直接返回
        }
      }
      // body
      const renderRows = this.ctx.body.renderRows;
      for (const row of renderRows) {
        // 优先处理固定列
        const cells = row.fixedCells.concat(row.noFixedCells);
        for (const cell of cells) {
          const layerX = cell.getDrawX();
          const layerY = cell.getDrawY();
          // 因为可能有合并单元格，所以这里要判断是可视区域
          if (
            x > layerX &&
            x < layerX + cell.visibleWidth &&
            y > layerY &&
            y < layerY + cell.visibleHeight
          ) {
            // selection移入移除事件
            this.imageEnterAndLeave(cell, e);
          }
          if (
            x > layerX &&
            x < layerX + cell.width &&
            y > layerY &&
            y < layerY + cell.height
          ) {
            this.ctx.emit("cellMouseenter", cell, e);
            // 移出事件
            if (this.ctx.hoverCell && this.ctx.hoverCell !== cell) {
              this.ctx.emit("cellMouseleave", this.ctx.hoverCell, e);
            }
            if (this.ctx.hoverCell === cell) return;
            if (this.ctx.hoverCell?.rowKey !== cell.rowKey) {
              this.ctx.hoverCell = cell;
              this.ctx.hoverRow = this.ctx.body.renderRows[cell.rowIndex];
              this.ctx.emit("rowHoverChange", this.ctx.hoverRow, cell, e);
              this.ctx.emit("draw");
            }
            this.ctx.hoverCell = cell;
            this.ctx.emit("cellHoverChange", cell, e);
            return; // 找到后直接返回
          }
        }
      }
    });
  }
  /**
   *选中点击
   * @param cell
   */
  private selectionClick(cell: CellHeader | Cell) {
    // 鼠标移动到图标上会变成pointer，所以这里判断是否是pointer就能判断出是图标点击的
    const isSelection =
      ["selection", "index-selection"].includes(cell.type) &&
      this.ctx.isPointer;
    if (!isSelection) {
      return;
    }
    // 点击头部
    if (cell instanceof CellHeader) {
      if (
        cell.drawImageName === "checkbox-uncheck" ||
        cell.drawImageName === "checkbox-indeterminate"
      ) {
        this.ctx.database.toggleAllSelection();
      } else if (cell.drawImageName === "checkbox-check") {
        this.ctx.database.clearSelection();
      }
    } else {
      // 点击body
      // 是否可点击
      const selectable = this.ctx.database.getRowSelectable(cell.rowKey);
      if (!selectable) {
        return;
      }
      this.ctx.database.toggleRowSelection(cell.rowKey);
    }
  }
  /**
   * 树点击
   * @param cell
   */
  private treeClick(cell: Cell) {
    // 鼠标移动到图标上会变成pointer，所以这里判断是否是pointer就能判断出是图标点击的
    if (cell.type === "tree" && this.ctx.isPointer) {
      const row = this.ctx.database.getRowForRowKey(cell.rowKey);
      const { expand = false, expandLazy = false } = row || {};
      const { EXPAND_LAZY, EXPAND_LAZY_METHOD } = this.ctx.config;
      // 懒加载且有懒加载方法，不是展开的不是已经加载过的
      if (EXPAND_LAZY && EXPAND_LAZY_METHOD && !expand && !expandLazy) {
        if (typeof EXPAND_LAZY_METHOD === "function") {
          this.ctx.database.expandLoading(cell.rowKey, true);
          const expandLazyMethod: ExpandLazyMethod = EXPAND_LAZY_METHOD;
          expandLazyMethod({
            row: cell.row,
            rowIndex: cell.rowIndex,
            colIndex: cell.colIndex,
            column: cell.column,
            value: cell.getValue(),
          })
            .then((res: any) => {
              this.ctx.database.setExpandChildren(cell.rowKey, res);
              this.ctx.database.expandLoading(cell.rowKey, false);
            })
            .catch((err: any) => {
              this.ctx.database.expandLoading(cell.rowKey, false);
              console.error(err);
            });
        }
        // 懒加载
      } else {
        const isExpand = this.ctx.database.getIsExpand(cell.rowKey);
        this.ctx.database.expandItem(cell.rowKey, !isExpand);
        this.ctx.emit("expandChange");
      }
    }
  }
  /**
   * 图标进入和离开事件，包括选中，展开，提示图标等
   * @param cell
   * @param e
   */
  private imageEnterAndLeave(cell: Cell | CellHeader, e: MouseEvent) {
    const y = e.offsetY;
    const x = e.offsetX;
    if (
      x > cell.drawImageX &&
      x < cell.drawImageX + cell.drawImageWidth &&
      y > cell.drawImageY &&
      y < cell.drawImageY + cell.drawImageHeight
    ) {
      this.ctx.target.style.cursor = "pointer";
      this.ctx.isPointer = true;
      // body cell 选中图标
      if (
        cell instanceof Cell &&
        ["selection", "index-selection"].includes(cell.type)
      ) {
        // body cell 需要处理是否可选
        const selectable = this.ctx.database.getRowSelectable(cell.rowKey);
        if (!selectable) {
          this.ctx.target.style.cursor = "not-allowed";
        }
      }
    } else {
      this.ctx.isPointer = false;
      if (this.ctx.target.style.cursor === "pointer") {
        this.ctx.target.style.cursor = "default";
      }
    }
  }

  private isBusy(e: MouseEvent) {
    const y = e.offsetY;
    const x = e.offsetX;
    if (!(e.target instanceof HTMLCanvasElement)) {
      return true;
    }
    if (!this.ctx.isTarget(e.target)) {
      return true;
    }
    // 行调整大小中不处理
    if (this.ctx.target.style.cursor === "row-resize") {
      return true;
    }
    // 列调整大小中不处理
    if (this.ctx.target.style.cursor === "col-resize") {
      return true;
    }
    // 列调整大小中不处理
    if (this.ctx.columnResizing) {
      return true;
    }
    // 行调整大小中不处理
    if (this.ctx.rowResizing) {
      return true;
    }
    const { SCROLLER_TRACK_SIZE } = this.ctx.config;
    // 滚动条移动不处理
    if (this.ctx.scrollerMove) {
      return true;
    }
    // 滚动条悬浮不处理
    if (this.ctx.scrollerFocus) {
      return true;
    }
    // 点击滚动条不处理
    if (y > this.ctx.target.height - SCROLLER_TRACK_SIZE) {
      return true;
    }
    // 点击滚动条不处理
    if (x > this.ctx.target.width - SCROLLER_TRACK_SIZE) {
      return true;
    }
    return false;
  }
  destroy() {
    this.resizeObserver.unobserve(this.ctx.target);
  }
}
