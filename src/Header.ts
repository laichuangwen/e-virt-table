import Context from "./Context";
import { getMaxRow, calCrossSpan, toLeaf, sortFixed } from "./util";
import CellHeader from "./CellHeader";
import type { Column } from "./types";
export default class Header {
  private ctx: Context; // 上下文
  private x = 0; // x坐标
  private y = 0; // y坐标
  private width = 0; // 宽度
  private height = 0; // 高度
  private resizeTarget: CellHeader | null = null; //调整表头
  isResizing = false; // 是否移动中
  private offsetX = 0; // 鼠标按下时的x轴位置
  private resizeDiff = 0; // 是否移动中
  private columnIndex = 0;
  isMouseDown = false; // 是否按下
  columns: any;
  visibleLeafColumns: any[] = [];
  visibleHeight = 0;
  visibleWidth = 0;
  allCellHeaders: CellHeader[] = [];
  leafCellHeaders: CellHeader[] = [];
  renderLeafCellHeaders: CellHeader[] = [];
  fixedLeftCellHeaders: CellHeader[] = [];
  centerCellHeaders: CellHeader[] = [];
  fixedRightCellHeaders: CellHeader[] = [];
  renderCenterCellHeaders: CellHeader[] = [];
  renderFixedCellHeaders: CellHeader[] = [];
  constructor(ctx: Context) {
    this.ctx = ctx;
    this.init();
    // 初始化调整列大小ENABLE_RESIZE_COLUMN
    this.initResizeColumn();
  }
  init() {
    const {
      config: { HEADER_HEIGHT = 0, SCROLLER_TRACK_SIZE = 0 },
    } = this.ctx;
    const columns = this.ctx.database.getColumns();
    this.columns = columns;
    this.allCellHeaders = [];
    this.leafCellHeaders = [];
    this.fixedLeftCellHeaders = [];
    this.fixedRightCellHeaders = [];
    this.centerCellHeaders = [];
    const maxHeaderRow = getMaxRow(columns);
    const leafColumns = toLeaf(columns);
    this.height = HEADER_HEIGHT * maxHeaderRow;
    this.width = leafColumns.reduce(
      (sum, _item) => sum + (_item?.width || 100),
      0
    );
    this.visibleHeight = this.height;
    const spanColumns = sortFixed(calCrossSpan(columns, maxHeaderRow));
    this.columnIndex = 0;
    this.render(spanColumns, 0);
    this.ctx.database.updateColIndexKeyMap(this.leafCellHeaders);
    const leafLeftCellHeaders = this.fixedLeftCellHeaders.filter(
      (item) => !item.hasChildren
    );
    this.ctx.fixedLeftWidth = leafLeftCellHeaders.reduce(
      (sum, _item) => sum + _item.width,
      0
    );
    const leafRightCellHeaders = this.fixedRightCellHeaders.filter(
      (item) => !item.hasChildren
    );
    // 需要加右边滚动条的轨道宽度
    this.ctx.fixedRightWidth = leafRightCellHeaders.reduce(
      (sum, _item) => sum + _item.width,
      SCROLLER_TRACK_SIZE
    );
    // 更新最大列索引
    this.ctx.maxRowIndex = this.leafCellHeaders.length - 1;
  }
  // 调整表头的宽度
  initResizeColumn() {
    const {
      config: { ENABLE_RESIZE_COLUMN },
    } = this.ctx;
    if (!ENABLE_RESIZE_COLUMN) {
      return;
    }
    this.ctx.on("mousedown", (e) => {
      if (!this.ctx.isTarget(e.target)) {
        return;
      }
      this.offsetX = e.offsetX;
      if (this.resizeTarget) {
        this.isResizing = true;
        this.ctx.columnResizing = true;
      } else {
        this.isResizing = false;
      }
      this.isMouseDown = true;
    });
    this.ctx.on("mouseup", () => {
      this.isMouseDown = false;
      // 清空
      if (this.resizeDiff !== 0 && this.resizeTarget) {
        // 调整宽度
        this.resizeColumn(this.resizeTarget, this.resizeDiff);
      }
      this.ctx.target.style.cursor = "default";
      this.resizeTarget = null;
      this.isResizing = false;
      this.ctx.columnResizing = false;
      this.offsetX = 0;
    });
    this.ctx.on("mousemove", (e) => {
      const {
        target,
        config: { RESIZE_COLUMN_MIN_WIDTH = 0 },
      } = this.ctx;
      // 鼠标移动
      if (this.isResizing && this.resizeTarget) {
        const resizeTargetWidth = this.resizeTarget.width;
        let diff = e.offsetX - this.offsetX;
        if (diff + resizeTargetWidth < RESIZE_COLUMN_MIN_WIDTH) {
          diff = -(resizeTargetWidth - RESIZE_COLUMN_MIN_WIDTH);
        }
        this.resizeDiff = diff;
        this.ctx.emit("draw");
      } else {
        this.resizeTarget = null;
        // 按下时不改变样式，有可能是多选表头
        if (this.isMouseDown) {
          return;
        }
        // 恢复默认样式
        if (this.ctx.target.style.cursor === "col-resize") {
          this.ctx.target.style.cursor = "default";
        }
        // 渲染的表头
        const renderAllCellHeaders = [
          ...this.renderFixedCellHeaders,
          ...this.renderCenterCellHeaders,
        ];
        for (const col of renderAllCellHeaders) {
          const x = e.layerX;
          const drawX = col.getDrawX();
          if (
            x > drawX + col.width - 5 &&
            x < drawX + col.width + 4 &&
            x < target.offsetWidth - 4 && // 视窗中最后一列不允许调整宽
            col.colspan <= 1 // 父级表头不触发
          ) {
            // 在表头内
            if (
              e.target instanceof HTMLCanvasElement &&
              this.ctx.isTarget(e.target) &&
              e.layerY <= this.height
            ) {
              this.ctx.target.style.cursor = "col-resize";
              this.resizeTarget = col;
            }
          }
        }
      }
    });
  }
  resizeColumn(cell: CellHeader, diff: number) {
    const setWidth = (columns: any[]) => {
      columns.forEach((column: any) => {
        if (column.children && column.children.length > 0) {
          setWidth(column.children);
        }
        if (column.key === cell.key) {
          const width = column.width || 100;
          column.width = width + diff;
        }
      });
    };
    setWidth(this.columns);
    this.ctx.database.setColumns(this.columns);
    this.init();

    this.ctx.emit("draw");
    this.ctx.emit("resizeColumnChange", {
      colIndex: cell.colIndex,
      key: cell.key,
      oldWidth: cell.width,
      width: cell.width + diff,
      column: cell.column,
      columns: this.columns,
    });
  }
  // moveToTop() {
  //   this.container.moveToTop();
  // }
  /**
   * 根据列的索引获取列的宽度
   * @param {Number} colIndex
   */
  getWidthByColIndexColSpan(colIndex: number, colSpan: number) {
    if (colSpan === 0) {
      return 0;
    }
    let width = 0;
    for (let i = colIndex; i < colIndex + colSpan; i++) {
      const cellHeader = this.leafCellHeaders[i];
      width += cellHeader.width;
    }
    return width;
  }
  render(arr: Column[], originX: number) {
    const len = arr.length;
    let everyOffsetX = originX;
    const { HEADER_HEIGHT = 0 } = this.ctx.config;
    for (let i = 0; i < len; i++) {
      const item = arr[i];
      const height = HEADER_HEIGHT * (item.rowspan || 1);
      const y = HEADER_HEIGHT * item.level;
      let width = item.width || 100; // 读取映射宽度
      if (item.children) {
        // 父级表头的宽度是叶子节点表头的宽度总和
        const _arr = toLeaf(item.children);
        width = _arr.reduce((sum, _item) => sum + (_item?.width || 100), 0);
      }
      const cellHeader = new CellHeader(
        this.ctx,
        this.columnIndex,
        everyOffsetX,
        y,
        width,
        height,
        item
      );
      // 设置表头
      this.ctx.database.setHeader(item.key, cellHeader);
      this.allCellHeaders.push(cellHeader);
      if (!item.children) {
        this.leafCellHeaders.push(cellHeader);
      }
      if (item.fixed === "left") {
        this.fixedLeftCellHeaders.push(cellHeader);
      } else if (item.fixed === "right") {
        this.fixedRightCellHeaders.push(cellHeader);
      } else {
        this.centerCellHeaders.push(cellHeader);
      }
      !item.children && this.columnIndex++;
      item.children && this.render(item.children, everyOffsetX);
      everyOffsetX += width;
    }
  }
  update() {
    const renderLeafCellHeaders: CellHeader[] = [];
    const renderCenterCellHeaders: CellHeader[] = [];
    const renderFixedCellHeaders: CellHeader[] = [];
    this.ctx.database.clearRenderHeaderCell(); // 清除渲染的单元格
    this.centerCellHeaders.forEach((item) => {
      if (item.isHorizontalVisible() && item.isVerticalVisible()) {
        renderCenterCellHeaders.push(item);
        if (!item.hasChildren) {
          renderLeafCellHeaders.push(item);
        }
      }
    });
    this.fixedLeftCellHeaders.forEach((item) => {
      renderFixedCellHeaders.push(item);
      if (!item.hasChildren) {
        renderLeafCellHeaders.push(item);
      }
    });
    this.fixedRightCellHeaders.forEach((item) => {
      renderFixedCellHeaders.push(item);
      if (!item.hasChildren) {
        renderLeafCellHeaders.push(item);
      }
    });
    this.renderCenterCellHeaders = renderCenterCellHeaders;
    this.renderFixedCellHeaders = renderFixedCellHeaders;
    this.renderLeafCellHeaders = renderLeafCellHeaders.sort(
      (a, b) => a.x - b.x
    );
    this.visibleLeafColumns = this.renderLeafCellHeaders.map(
      (item) => item.column
    );
    const {
      config: { SCROLLER_TRACK_SIZE = 0 },
      target,
    } = this.ctx;
    this.visibleWidth = target.offsetWidth - SCROLLER_TRACK_SIZE;
    this.ctx.setHeader({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      visibleHeight: this.visibleHeight,
      visibleWidth: this.visibleWidth,
      leafCellHeaders: this.leafCellHeaders,
      visibleLeafColumns: this.visibleLeafColumns,
      renderLeafCellHeaders: this.renderLeafCellHeaders,
    });
  }
  drawTipLine() {
    if (this.isResizing && this.resizeTarget) {
      const {
        target,
        config: { RESIZE_COLUMN_LINE_COLOR },
      } = this.ctx;
      const resizeTargetDrawX = this.resizeTarget.getDrawX();
      const resizeTargetWidth = this.resizeTarget.width;
      const x = resizeTargetDrawX + resizeTargetWidth + this.resizeDiff - 0.5;
      const poins = [x + 0.5, 0, x + 0.5, target.offsetHeight];
      this.ctx.paint.drawLine(poins, {
        borderColor: RESIZE_COLUMN_LINE_COLOR,
        borderWidth: 1,
      });
    }
  }
  drawFiexShadow() {
    const {
      fixedLeftWidth,
      fixedRightWidth,
      scrollX,
      header,
      target,
      config: { HEADER_BG_COLOR, SCROLLER_TRACK_SIZE },
    } = this.ctx;

    if (scrollX > 0) {
      this.ctx.paint.drawShadow(this.x, this.y, fixedLeftWidth, this.height, {
        fillColor: HEADER_BG_COLOR,
        side: "right",
        shadowWidth: 4,
        colorStart: "rgba(0,0,0,0.1)",
        colorEnd: "rgba(0,0,0,0)",
      });
    }
    // 右边阴影
    if (
      scrollX < header.width - header.visibleWidth &&
      fixedRightWidth !== SCROLLER_TRACK_SIZE
    ) {
      const x =
        header.width -
        (this.x + this.width) +
        target.offsetWidth -
        fixedRightWidth;
      this.ctx.paint.drawShadow(x + 0.5, this.y, fixedRightWidth, this.height, {
        fillColor: HEADER_BG_COLOR,
        side: "left",
        shadowWidth: 4,
        colorStart: "rgba(0,0,0,0)",
        colorEnd: "rgba(0,0,0,0.1)",
      });
    }
  }
  draw() {
    this.renderCenterCellHeaders.forEach((item) => {
      item.draw();
    });
    this.drawFiexShadow();
    this.renderFixedCellHeaders.forEach((item) => {
      item.draw();
    });
    this.drawTipLine();
  }
}
