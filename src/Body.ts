import type Context from "./Context";
import Row from "./Row";
import { Position } from "./types";
export default class Body {
  private resizeTarget: Row | null = null; //调整行大小的目标
  private isMouseDown = false; // 是否按下
  private resizeDiff = 0; // 是否移动中
  private offsetY = 0; // 鼠标按下时的y轴位置
  private ctx: Context;
  private x = 0;
  private y = 0;
  private width = 0;
  private height = 0;
  private headIndex = 0;
  private tailIndex = 0;
  isResizing = false; //是否正在调整大小
  renderRows: Row[] = [];
  visibleRows: any[] = [];
  visibleHeight = 0;
  visibleWidth = 0;
  data: any[] = [];
  constructor(ctx: Context) {
    this.ctx = ctx;
    this.init();
    this.initResizeRow();
  }
  private init() {
    const { database, header } = this.ctx;
    const { data, sumHeight } = database.getData();
    this.height = sumHeight;
    this.data = data;
    this.updateWidthHeight();
  }
  private updateWidthHeight() {
    const {
      target,
      header,
      config: {
        FOOTER_FIXED,
        CELL_FOOTER_HEIGHT = 0,
        SCROLLER_TRACK_SIZE = 0,
        BORDER_COLOR,
        BORDER_RADIUS,
        HEIGHT,
        WIDTH,
        EMPTY_BODY_HEIGHT = 0,
        MAX_HEIGHT = 0,
        ENABLE_OFFSET_HEIGHT = 0,
        OFFSET_HEIGHT = 0,
      },
    } = this.ctx;
    if (!header.width) {
      return;
    }
    this.x = 0;
    this.y = header.height; //更新body的y轴位置
    const { left, top } = target.getBoundingClientRect();
    // 更新宽度
    this.width = header.width;
    const windowInnerWidth = window.innerWidth;
    const visibleWidth =
      target.parentElement?.clientWidth || windowInnerWidth - left;
    const containerWidth = this.width + SCROLLER_TRACK_SIZE;
    let stageWidth = 0;
    if (WIDTH) {
      stageWidth = WIDTH;
    } else if (containerWidth > visibleWidth) {
      stageWidth = visibleWidth;
    } else {
      stageWidth = containerWidth;
    }
    // 更新窗口高度
    target.width = stageWidth;
    this.visibleWidth = target.width - SCROLLER_TRACK_SIZE;
    // 底部高度
    const footerData = this.ctx.database.getFooterData();
    const footerHeight = footerData.reduce((sum: number) => {
      return sum + CELL_FOOTER_HEIGHT;
    }, 0);
    if (!this.data.length) {
      this.height = EMPTY_BODY_HEIGHT;
    }
    const isEmpty = !this.data.length ? "empty" : "not-empty";
    this.ctx.emit("emptyChange", {
      isEmpty,
      headerHeight: header.height,
      bodyHeight: this.height,
      width: this.width,
      height: !this.data.length ? EMPTY_BODY_HEIGHT + footerHeight : 0,
    });
    let containerHeight = this.height + header.height + SCROLLER_TRACK_SIZE;
    // 如果有底部,加上底部高度
    containerHeight += footerHeight;
    let stageHeight = 0;
    if (this.data.length && ENABLE_OFFSET_HEIGHT) {
      const windowInnerHeight = window.innerHeight;
      const visibleHeight = windowInnerHeight - top;
      stageHeight = visibleHeight - OFFSET_HEIGHT;
      if (stageHeight < 0) {
        stageHeight = 32;
        console.error(
          "There is an error in the height calculation ENABLE_OFFSET_HEIGHT and OFFSET_HEIGHT are invalid"
        );
      }
    } else if (this.data.length && HEIGHT) {
      stageHeight = HEIGHT;
    } else if (this.data.length && MAX_HEIGHT && containerHeight > MAX_HEIGHT) {
      stageHeight = MAX_HEIGHT;
    } else {
      stageHeight = containerHeight;
    }
    // 外层容器样式
    target.setAttribute(
      "style",
      `outline: none; position: relative; border-radius: ${BORDER_RADIUS}px; border: 1px solid ${BORDER_COLOR}; height:${stageHeight}px;width:${
        stageWidth - 1
      }px;`
    );
    // 更新窗口高度
    if (stageHeight > 0) {
      target.height = stageHeight;
    }
    // 可视区高度
    let _visibleHeight = target.height - header.height - SCROLLER_TRACK_SIZE;
    // 底部高度,如果是固定底部,可视区减上底部高度
    if (FOOTER_FIXED) {
      this.visibleHeight = _visibleHeight - footerHeight;
    } else {
      this.visibleHeight = _visibleHeight;
    }
  }
  // 调整行的高度
  private initResizeRow() {
    const {
      config: { ENABLE_RESIZE_ROW },
    } = this.ctx;
    if (!ENABLE_RESIZE_ROW) {
      return;
    }
    // 鼠标移动
    this.ctx.on("mouseup", () => {
      this.isMouseDown = false;
      if (this.resizeDiff !== 0 && this.resizeTarget) {
        // 调整宽度
        this.resizeRow(this.resizeTarget, this.resizeDiff);
      }
      this.ctx.target.style.cursor = "default";
      this.resizeTarget = null;
      this.resizeDiff = 0;
      this.isResizing = false;
      this.ctx.rowResizing = false;
      this.offsetY = 0;
    });
    this.ctx.on("mousedown", (e) => {
      if (!this.ctx.isTarget(e.target)) {
        return;
      }
      this.offsetY = e.offsetY;
      if (this.resizeTarget) {
        this.isResizing = true;
        // 传递给上下文，防止其他事件触发，行调整大小时，不触发选择器
        this.ctx.rowResizing = true;
      } else {
        this.isResizing = false;
      }
      this.isMouseDown = true;
    });
    this.ctx.on("mousemove", (e) => {
      const y = e.layerY;
      const x = e.layerX;
      const {
        target,
        scrollY,
        scrollX,
        config: { RESIZE_ROW_MIN_HEIGHT = 0 },
      } = this.ctx;
      if (this.isResizing && this.resizeTarget) {
        const resizeTargetHeight = this.resizeTarget.height;
        let diff = e.offsetY - this.offsetY;
        if (diff + resizeTargetHeight < RESIZE_ROW_MIN_HEIGHT) {
          diff = -(resizeTargetHeight - RESIZE_ROW_MIN_HEIGHT);
        }
        this.resizeDiff = diff;
        this.ctx.emit("draw");
      } else {
        this.resizeTarget = null;
        // 按下时不改变样式，有可能是多选表头
        if (this.isMouseDown) {
          return;
        }
        // 如果是拖动选择
        if (this.ctx.target.style.cursor === "crosshair") {
          return;
        }
        if (this.ctx.target.style.cursor === "row-resize") {
          // 恢复默认样式
          this.ctx.target.style.cursor = "default";
        }
        for (let i = 0; i < this.renderRows.length; i++) {
          const row = this.renderRows[i];
          const isYRange =
            y > row.y - scrollY + row.height - 1.2 &&
            y < row.y - scrollY + row.height + 1.2 &&
            y < target.offsetHeight - 4;
          const isXRange =
            x >= row.x - scrollX + 10 && x <= row.x - scrollX + row.width - 10;
          if (isYRange && isXRange) {
            for (let j = 0; j < row.cells.length; j++) {
              const cell = row.cells[j];
              // 对应格子l
              const cellClientX = cell.getDrawX();
              if (
                x > cellClientX &&
                x < cellClientX + cell.width + 4 &&
                cell.rowspan === 1 //没有被合并的单元格
              ) {
                this.ctx.target.style.cursor = "row-resize";
                this.resizeTarget = row;
              }
            }
          }
        }
      }
    });
  }
  private resizeRow(row: Row, diff: number) {
    const { rowIndex, height, rowKey, data } = row;
    this.ctx.database.setRowHeight(rowIndex, height + diff);
    // 清除显示缓存
    this.ctx.database.clearBufferData();
    this.init();
    // 清除选择器
    // this.ctx.selector.setFocusCell(undefined);
    // this.ctx.selector.clearSelector();
    // this.ctx.autofill.clearAutofill();
    this.ctx.emit("draw");
    this.ctx.emit("resizeRowChange", {
      rowIndex,
      oldHeight: height,
      height: height + diff,
      rowKey,
      row: data,
      data: this.data,
    });
  }
  private drawTipLine() {
    if (this.isResizing && this.resizeTarget) {
      const {
        target,
        scrollY,
        config: { RESIZE_ROW_LINE_COLOR },
      } = this.ctx;
      const resizeTargetDrawY = this.resizeTarget.y - scrollY;
      const resizeTargetHeight = this.resizeTarget.height;
      const y = resizeTargetDrawY + resizeTargetHeight + this.resizeDiff - 0.5;
      const poins = [0, y + 0.5, target.offsetWidth, y + 0.5];
      this.ctx.paint.drawLine(poins, {
        borderColor: RESIZE_ROW_LINE_COLOR,
        borderWidth: 1,
      });
    }
  }
  private drawFiexShadow() {
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
  private binarySearch(list: Position[], value: number) {
    let start = 0;
    let end = list.length - 1;
    let tempIndex = -1;
    while (start <= end) {
      let midIndex = Math.floor((start + end) / 2);
      let midValue = list[midIndex].bottom;
      if (midValue === value) {
        return midIndex;
      } else if (midValue < value) {
        start = midIndex + 1;
      } else {
        tempIndex = midIndex; // 记录当前的 midIndex
        end = midIndex - 1;
      }
    }
    return tempIndex;
  }
  update() {
    this.updateWidthHeight();
    const { header, database, scrollY } = this.ctx;
    const offset = scrollY;
    const { data, positions } = database.getData();
    // 更新最大行数
    this.ctx.maxRowIndex = data.length - 1;
    const _headIndex = this.binarySearch(positions, offset);
    let _tailIndex = this.binarySearch(positions, offset + this.visibleHeight);
    // 找不到就为data.length
    if (_tailIndex === -1) {
      _tailIndex = data.length;
    }
    this.headIndex = Math.max(0, _headIndex);
    this.tailIndex = Math.min(data.length, _tailIndex + 1);
    this.visibleRows = data.slice(this.headIndex, this.tailIndex);
    const rows: Row[] = [];
    for (let i = 0; i <= this.visibleRows.length; i++) {
      const index = this.headIndex + i;
      const data = this.visibleRows[i];
      const { height, top } = this.ctx.database.getPositionForRowIndex(index);
      const row = new Row(
        this.ctx,
        index,
        0,
        top + this.y,
        header.width,
        height,
        data
      );
      rows.push(row);
    }
    this.renderRows = rows;
    this.ctx.setBody({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      visibleWidth: this.visibleWidth,
      visibleHeight: this.visibleHeight,
      headIndex: this.headIndex,
      tailIndex: this.tailIndex,
      visibleRows: this.visibleRows,
      renderRows: this.renderRows,
    });
  }
  draw() {
    this.renderRows.forEach((row) => {
      row.drawCenter();
    });
    this.drawFiexShadow();
    this.renderRows.forEach((row) => {
      row.drawFixed();
    });
    this.drawTipLine();
  }
}
