import type Context from "./Context";
import type Cell from "./Cell";
import type CellHeader from "./CellHeader";
export default class Selector {
  private show = false;
  private focusCellHeader: CellHeader | undefined;
  private focusCell: Cell | undefined;
  private hoverCell: Cell | undefined;
  private mousedown = false;
  private xArr = [-1, -1];
  private yArr = [-1, -1];
  // 复制线
  private xArrCopy = [-1, -1];
  private yArrCopy = [-1, -1];
  ctx: Context;
  colIndex = 0;
  rowIndex = 0;
  constructor(ctx: Context) {
    this.ctx = ctx;
    this.init();
    // this.ctx.stage.on("mouseleave", () => {
    //   this.clearHover();
    // });
  }
  init() {
    this.ctx.on("mousedown", (e) => {
      if (!this.ctx.isTarget(e.target)) {
        return;
      }
      console.log("mousedown11", this.ctx);
    });
  }

  setMouseDown(cell: Cell) {
    // 不能用全局按下事件,体验不好,需要要当前focusCell按下,才能拖
    if (
      this.focusCell?.rowKey === cell.rowKey &&
      this.focusCell?.key === cell.key
    ) {
      this.mousedown = true;
      // 按下隐藏提示
      // this.ctx.tooltip.hide();
    }
  }
  setMouseUp() {
    this.mousedown = false;
  }
  setSelector(xArr: number[], yArr: number[], ignoreAutofill = true) {
    const {
      ENABLE_SELECTOR,
      ENABLE_SELECTOR_SPAN_COL,
      ENABLE_SELECTOR_SPAN_ROW,
    } = this.ctx.config;
    if (!ENABLE_SELECTOR) {
      return;
    }
    this.show = true;
    let _xArr = xArr;
    let _yArr = yArr;
    // if (this.ctx.autofill.getEnable() && ignoreAutofill) {
    //   return;
    // }
    if (!ENABLE_SELECTOR_SPAN_ROW) {
      const [rowstart] = _yArr;
      _yArr = [rowstart, rowstart];
    }
    if (!ENABLE_SELECTOR_SPAN_COL) {
      const [colstart] = _xArr;
      _xArr = [colstart, colstart];
    }
    // 减少渲染
    if (
      JSON.stringify(this.xArr) !== JSON.stringify(_xArr) ||
      JSON.stringify(this.yArr) !== JSON.stringify(_yArr)
    ) {
      this.xArr = _xArr;
      this.yArr = _yArr;
      // this.ctx.autofill.setAutofill(this.xArr, this.yArr);
      this.ctx.emit("setSelector", this.getSelector());
    }
  }
  setFocusCell(cell?: Cell) {
    if (this.focusCell?.rowKey !== cell?.rowKey) {
      // 提前设置一下，保证rowFocusChange事件，能用focusCell
      this.focusCell = cell;
      this.ctx.emit("rowFocusChange", cell);
    }
    this.focusCell = cell;
    this.ctx.emit("cellFocusChange", cell);
  }
  getFocusCell() {
    return this.focusCell;
  }
  setFocusCellHeader(cell?: CellHeader) {
    this.focusCellHeader = cell;
  }
  getFocusCellHeader() {
    return this.focusCellHeader;
  }
  selectCols(cell: CellHeader) {
    // 启用单选就不能批量选中
    if (this.ctx.config.ENABLE_SELECTOR_SINGLE) {
      return;
    }
    if (!this.ctx.config.ENABLE_SELECTOR_ALL_ROWS) {
      return;
    }
    // index, index-selection, selection全选
    if (["index", "index-selection", "selection"].includes(cell.type)) {
      this.selectAll();
      return;
    }
    const minY = 0;
    const maxY = this.ctx.maxRowIndex;
    if (this.focusCellHeader) {
      const { colIndex } = this.focusCellHeader;
      if (cell.colIndex >= colIndex) {
        const xArr = [colIndex, cell.colIndex + cell.colspan - 1];
        const yArr = [minY, maxY];
        this.setSelector(xArr, yArr);
      } else {
        const xArr = [cell.colIndex, colIndex];
        const yArr = [minY, maxY];
        this.setSelector(xArr, yArr);
      }
    } else {
      this.setFocusCellHeader(cell);
      const xArr = [cell.colIndex, cell.colIndex + cell.colspan - 1];
      const yArr = [minY, maxY];
      this.setSelector(xArr, yArr);
    }
  }
  selectAll() {
    // 只有两个全选启用了才能全选
    const { ENABLE_SELECTOR_ALL_ROWS, ENABLE_SELECTOR_ALL_COLS } =
      this.ctx.config;
    if (ENABLE_SELECTOR_ALL_ROWS && ENABLE_SELECTOR_ALL_COLS) {
      const minX = 0;
      const maxX = this.ctx.maxColIndex;
      const minY = 0;
      const maxY = this.ctx.maxRowIndex;
      const xArr = [minX + 1, maxX];
      const yArr = [minY, maxY];
      this.focusCell = undefined; // 清除focusCell
      this.setSelector(xArr, yArr);
    }
  }
  selectRows(cell: Cell, isSetFocus = true) {
    // 启用单选就不能批量选中
    if (this.ctx.config.ENABLE_SELECTOR_SINGLE) {
      return;
    }
    if (!this.ctx.config.ENABLE_SELECTOR_ALL_COLS) {
      return;
    }
    // index, index-selection, selection不可选列
    if (["index", "index-selection", "selection"].includes(cell.type)) {
      const maxX = this.ctx.maxColIndex;
      const minX = cell.colIndex + 1;
      if (isSetFocus) {
        this.setFocusCell(cell);
        const xArr = [minX, maxX];
        const yArr = [cell.rowIndex, cell.rowIndex];
        this.setSelector(xArr, yArr);
      }
      if (this.focusCell && this.mousedown) {
        const { rowIndex } = this.focusCell;
        if (cell.rowIndex >= rowIndex) {
          const xArr = [minX, maxX];
          const yArr = [rowIndex, cell.rowIndex];
          this.setSelector(xArr, yArr);
        } else {
          const xArr = [minX, maxX];
          const yArr = [cell.rowIndex, rowIndex];
          this.setSelector(xArr, yArr);
        }
      }
    }
  }
  setHoverCell(cell: Cell) {
    // 如果在body行调整大小，就不显示
    // if (this.ctx.body.isResizing) {
    //   return;
    // }
    const { rowKey, key } = cell;
    // 相同的跳过赋值，减少渲染
    if (this.hoverCell?.rowKey === rowKey && this.hoverCell?.key === key) {
      return;
    }
    if (this.hoverCell?.rowKey !== rowKey) {
      this.hoverCell = cell;
      this.ctx.emit("rowHoverChange", cell);
    }
    this.hoverCell = cell;
    this.ctx.emit("cellHoverChange", cell);
    // 按下不提示
    if (this.mousedown) {
      // this.ctx.body.reDraw();
      return;
    }
    // 提示，因为每次Hover都会重绘，所以不拆提示tooltip
    // if (cell.isTextOverflowing() && !this.ctx.editor.getShow()) {
    //   this.ctx.tooltip.show(cell);
    // } else if (cell.message) {
    //   this.ctx.tooltip.show(cell);
    // } else {
    //   this.ctx.tooltip.hide();
    // }
    // this.ctx.body.reDraw();
  }
  clearHover() {
    this.hoverCell = undefined;
  }
  getHoverCell() {
    return this.hoverCell;
  }
  mouseenter(cell: Cell) {
    if (this.ctx.config.ENABLE_SELECTOR_SINGLE) {
      return;
    }
    // 设置autofill的mouseenter
    // this.ctx.autofill.mouseenter(cell);
    this.setHoverCell(cell);
    const focusCell = this.getFocusCell();
    if (this.mousedown && focusCell) {
      const { rowIndex, colIndex, type } = focusCell;
      // 选中行处理
      if (["index-selection", "selection", "index"].includes(type)) {
        return;
      }
      const minX = Math.min(cell.colIndex, colIndex);
      const maxX = Math.max(cell.colIndex, colIndex);
      const minY = Math.min(cell.rowIndex, rowIndex);
      const maxY = Math.max(cell.rowIndex, rowIndex);
      const xArr = [minX, maxX];
      const yArr = [minY, maxY];
      this.setSelector(xArr, yArr);
    }
  }
  click(cell: Cell, shiftKey = false) {
    if (["index", "selection", "index-selection"].includes(cell.type)) {
      return;
    }
    this.ctx.emit("cellClick", cell);
    const focusCell = this.getFocusCell();
    // 开始编辑
    if (cell.rowKey === focusCell?.rowKey && cell.key === focusCell?.key) {
      // this.ctx.editor.startEdit();
    } else {
      // this.ctx.editor.doneEdit();
    }
    // shiftKey快捷选中
    if (focusCell && shiftKey) {
      const { colIndex, rowIndex } = cell;
      const { colIndex: oldX, rowIndex: oldY } = focusCell;
      const minX = Math.min(oldX, colIndex);
      const maxX = Math.max(oldX, colIndex);
      const minY = Math.min(oldY, rowIndex);
      const maxY = Math.max(oldY, rowIndex);
      const xArr = [minX, maxX];
      const yArr = [minY, maxY];
      this.setSelector(xArr, yArr);
      // this.ctx.editor.resetEditor();
    } else {
      this.setFocusCell(cell);
      const xArr = [cell.colIndex, cell.colIndex];
      const yArr = [cell.rowIndex, cell.rowIndex];
      this.setSelector(xArr, yArr);
      this.adjustBoundaryPosition();
      // if (this.ctx.config.ENABLE_EDIT_SINGLE_CLICK) {
      //   setTimeout(() => {
      //     this.ctx.editor.startEdit();
      //   }, 0);
      // }
    }
  }
  getSelector() {
    return {
      show: this.show,
      xArr: this.xArr,
      yArr: this.yArr,
      xArrCopy: this.xArrCopy,
      yArrCopy: this.yArrCopy,
    };
  }
  clearSelector() {
    this.show = true;
    this.xArr = [-1, -1];
    this.yArr = [-1, -1];
    this.clearCopyLine();
  }
  clearCopyLine() {
    this.xArrCopy = [-1, -1];
    this.yArrCopy = [-1, -1];
  }
  /**
   * 获取选中单元格
   * @param rowIndex
   * @param colIndex
   * @returns
   */
  getCell(rowIndex: number, colIndex: number) {
    // 设置选中FocusCell
    const row = this.ctx.body.renderRows.find(
      (row) => row.rowIndex === rowIndex
    );
    const cell = row?.cells.find(
      (cell: { colIndex: number }) => cell.colIndex === colIndex
    );
    return cell;
  }
  /**
   * 获取选中的数据
   * @returns
   */
  getSelectedData() {
    const rowsData = [];
    const yArr = this.yArr;
    const xArr = this.xArr;
    let text = "";
    for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
      const cellsData = [];
      for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
        const rowIndex = ri + yArr[0];
        const colIndex = ci + xArr[0];
        const item = this.ctx.database.getItemValueForRowIndexAndColIndex(
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
  /**
   * 复制
   * @returns
   */
  copy() {
    if (!this.ctx.config.ENABLE_COPY) {
      return;
    }
    const { text } = this.getSelectedData();
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          // 处理复制线
          this.xArrCopy = this.xArr.slice();
          this.yArrCopy = this.yArr.slice();
          this.ctx.emit("setCopy", this);
        })
        .catch((error) => console.error("复制失败：", error));
    } else {
      console.error("当前浏览器不支持Clipboard API");
    }
  }
  clearSelectedData() {
    let changeList = [];
    const rowKeyList: Set<string> = new Set();
    const { xArr, yArr } = this;
    for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
      for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
        const _rowIndex = ri + yArr[0];
        const _colIndex = ci + xArr[0];
        const itemValue = this.ctx.database.getItemValueForRowIndexAndColIndex(
          _rowIndex,
          _colIndex
        );
        if (itemValue) {
          const { rowKey, key } = itemValue;
          // 只读就跳过
          if (!this.ctx.database.getReadonly(rowKey, key)) {
            rowKeyList.add(rowKey);
            changeList.push({
              rowKey,
              key,
              value: null,
              row: {}, //内部有设置
            });
          }
        }
      }
    }
    // 没有变化就返回
    if (!changeList.length) {
      return;
    }
    // 批量设置数据，并记录历史
    this.ctx.database.batchSetItemValue(changeList, true);
    let rows: any[] = [];
    rowKeyList.forEach((rowKey) => {
      rows.push(this.ctx.database.getRowDataItemForRowKey(rowKey));
    });
    this.ctx.emit("clearSelectedDataChange", changeList, rows);
    // 清除复制线
    // this.ctx.rendererView?.reDraw();
  }
  paste() {
    if (!navigator.clipboard) {
      console.error("当前浏览器不支持Clipboard API");
      return;
    }
    const { ENABLE_PASTER } = this.ctx.config;
    if (this.show && ENABLE_PASTER) {
      const rowIndex = this.yArr[0];
      const colIndex = this.xArr[0];
      const rowKeyList: Set<string> = new Set();
      navigator.clipboard
        .readText()
        .then((val) => {
          let textArr = [];
          const arr = val.split("\r");
          if (arr.length === 1) {
            const _arr = arr[0].split("\n");
            textArr = _arr.map((item) => item.split("\t"));
          } else {
            textArr = arr.map((item) => item.split("\t"));
          }
          let changeList = [];
          for (let ri = 0; ri <= textArr.length - 1; ri++) {
            const len = textArr[ri].length;
            for (let ci = 0; ci <= len - 1; ci++) {
              const _rowIndex = ri + rowIndex;
              const _colIndex = ci + colIndex;
              const value = textArr[ri][ci];
              const itemValue =
                this.ctx.database.getItemValueForRowIndexAndColIndex(
                  _rowIndex,
                  _colIndex
                );
              if (itemValue) {
                const { rowKey, key } = itemValue;
                // 只读就跳过
                if (!this.ctx.database.getReadonly(rowKey, key)) {
                  rowKeyList.add(rowKey);
                  changeList.push({
                    rowKey,
                    key,
                    value,
                    row: {}, //内部有设置
                  });
                }
              }
            }
          }
          // 没有变化就返回
          if (!changeList.length) {
            return;
          }
          // 批量设置数据，并记录历史
          this.ctx.database.batchSetItemValue(changeList, true);
          let rows: any[] = [];
          rowKeyList.forEach((rowKey) => {
            rows.push(this.ctx.database.getRowDataItemForRowKey(rowKey));
          });
          this.ctx.emit("pasteChange", changeList, rows);
          // 清除复制线
          this.clearCopyLine();
          // this.ctx?.rendererView?.reDraw();
        })
        .catch((error) => {
          console.error("获取剪贴板内容失败：", error);
        });
    }
  }
  /**键盘上下左右切换
   * @param dir
   */
  moveFocus(dir: "LEFT" | "TOP" | "RIGHT" | "BOTTOM") {
    if (!this.focusCell) {
      return;
    }
    let { colIndex = 0, rowIndex = 0 } = this.focusCell;
    const minX = 0;
    const minY = 0;
    const maxX = this.ctx.maxColIndex;
    const maxY = this.ctx.maxRowIndex;
    switch (dir) {
      case "LEFT":
        if (colIndex > minX) {
          colIndex--;
        }
        break;
      case "TOP":
        if (rowIndex > minY) {
          rowIndex--;
        }
        break;
      case "RIGHT":
        if (colIndex < maxX) {
          colIndex++;
        }
        break;
      case "BOTTOM":
        if (rowIndex < maxY) {
          rowIndex++;
        }
        break;
      default:
    }
    const xArr = [colIndex, colIndex];
    const yArr = [rowIndex, rowIndex];
    const cell = this.getCell(rowIndex, colIndex);
    if (cell) {
      this.setFocusCell(cell);
    }
    this.setSelector(xArr, yArr);
    this.adjustBoundaryPosition();
  }
  isInside(cell: Cell) {
    const minX = this.xArr[0];
    const maxX = this.xArr[1];
    const minY = this.yArr[0];
    const maxY = this.yArr[1];
    const { colIndex, rowIndex } = cell;
    if (
      minX <= colIndex &&
      maxX >= colIndex &&
      minY <= rowIndex &&
      maxY >= rowIndex
    ) {
      return true;
    }
    return false;
  }
  /**
   * 是否有边框线
   * @param cell
   * @returns
   */
  hasBorderline(cell: Cell) {
    const minX = this.xArr[0];
    const maxX = this.xArr[1];
    const minY = this.yArr[0];
    const maxY = this.yArr[1];
    const { colIndex, rowIndex } = cell;
    if (
      colIndex < minX ||
      colIndex > maxX ||
      rowIndex < minY ||
      rowIndex > maxY
    ) {
      return false;
    }
    if (
      minX === colIndex ||
      maxX === colIndex ||
      minY === rowIndex ||
      maxY === rowIndex
    ) {
      return true;
    }
    return false;
  }
  /**
   * 调整滚动条位置，让焦点单元格始终出现在可视区域内
   */
  adjustBoundaryPosition() {
    if (!this.focusCell) {
      return;
    }
    // const { fixedRightWidth, fixedLeftWidth, height } = this.ctx.header;
    // const { SCROLLER_TRACK_SIZE, FOOTER_FIXED } = this.ctx.config;
    // const scrollX = this.ctx.scroller.getScrollX();
    // const scrollY = this.ctx.scroller.getScrollY();
    // const focusCell = this.focusCell;
    // const cellTotalViewWidth = focusCell.x + focusCell.width + scrollX;
    // const cellTotalViewHeight = focusCell.y + focusCell.height + scrollY;
    // const viewWidth = this.ctx.stage.width() - fixedRightWidth;
    // let footerHeight = 0;
    // if (FOOTER_FIXED) {
    //   footerHeight = this.ctx.footer.visibleHeight;
    // }
    // const viewHeight =
    //   this.ctx.stage.height() - footerHeight - SCROLLER_TRACK_SIZE;
    // // 减1补选中框的边框,且可以移动滚动
    // const diffLeft = focusCell.x + scrollX - fixedLeftWidth - 1;
    // const diffRight = viewWidth - cellTotalViewWidth - 1;
    // const diffTop = focusCell.y + scrollY - height - 1;
    // const diffBottom = viewHeight - cellTotalViewHeight - 1;
    // // fixed禁用左右横向移动
    // if (diffRight < 0 && !this.focusCell.fixed) {
    //   this.ctx.scroller.setScrollX(scrollX + diffRight);
    // } else if (diffLeft < 0 && !this.focusCell.fixed) {
    //   this.ctx.scroller.setScrollX(scrollX - diffLeft);
    // }
    // if (diffTop < 0) {
    //   this.ctx.scroller.setScrollY(scrollY - diffTop);
    // } else if (diffBottom < 0) {
    //   this.ctx.scroller.setScrollY(scrollY + diffBottom);
    // }
  }
}
