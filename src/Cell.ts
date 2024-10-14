import type { Rule } from "async-validator";
import type {
  Column,
  Fixed,
  Type,
  Align,
  VerticalAlign,
  CellType,
  Render,
  formatterMethod,
  CellTypeMethod,
  CellRenderMethod,
  // SpanMethod,
  CellEditorTypeMethod,
  SpanMethod,
  CellHoverIconMethod,
  CellStyleMethod,
  OverflowTooltipPlacement,
} from "./types";
import Context from "./Context";
import BaseCell from "./BaseCell";
export default class Cell extends BaseCell {
  formatter?: formatterMethod;
  hoverIconName: string = "";
  align: Align;
  verticalAlign: VerticalAlign;
  fixed?: Fixed;
  type: Type;
  editorType: string;
  cellType: CellType;
  level: number;
  colspan = 1;
  rowspan = 1;
  key: string;
  column: Column;
  rowIndex: number;
  colIndex: number;
  rowKey: string;
  row: any;
  private value: any;
  render: Render;
  renderFooter: Render;
  style: any = {};
  rules: Rule = {};
  message: string = "";
  text: string = "";
  displayText: string = "";
  visibleWidth = 0;
  visibleHeight = 0;
  drawX = 0;
  drawY = 0;
  drawCellBgColor = "";
  drawCellSkyBgColor = "";
  drawTextColor = "";
  drawTextX = 0;
  drawTextY = 0;
  drawImageX = 0;
  drawImageY = 0;
  drawImageWidth = 0;
  drawImageHeight = 0;
  drawImageName = "";
  drawImageSource?: HTMLImageElement;
  ellipsis = false;
  overflowTooltipShow = true;
  overflowTooltipWidth = 500;
  overflowTooltipPlacement: OverflowTooltipPlacement = "top";

  constructor(
    ctx: Context,
    rowIndex: number,
    colIndex: number,
    x: number,
    y: number,
    width: number,
    height: number,
    column: Column,
    row: any,
    cellType: CellType = "body"
  ) {
    super(ctx, x, y, width, height, column.fixed, cellType);
    this.visibleWidth = this.width;
    this.visibleHeight = this.height;
    this.colIndex = colIndex;
    this.rowIndex = rowIndex;
    this.key = column.key;
    this.type = column.type || "text";
    this.editorType = column.editorType || "text";
    this.cellType = cellType;
    this.align = column.align || "center";
    this.verticalAlign = column.verticalAlign || "middle";
    this.fixed = column.fixed;
    this.level = column.level;
    this.column = column;
    this.rules = column.rules;
    this.row = row;
    this.rowKey = this.ctx.database.getRowKeyForRowIndex(rowIndex);
    this.value = this.getValue();
    this.render = column.render;
    this.overflowTooltipShow = column.overflowTooltipShow || true;
    this.overflowTooltipWidth = column.overflowTooltipWidth || 500;
    this.overflowTooltipPlacement = column.overflowTooltipPlacement || "top";
    this.renderFooter = column.renderFooter;
    this.hoverIconName = column.hoverIconName;
    this.formatter = column.formatter;
    this.update();
  }
  getValidationMessage() {
    const errors = this.ctx.database.getValidationError(this.rowKey, this.key);
    if (Array.isArray(errors) && errors.length) {
      const [err] = errors;
      this.message = err.message;
    }
    return this.message;
  }
  update() {
    this.drawX = this.getDrawX();
    this.drawY = this.getDrawY();
    this.drawTextX = this.drawX;
    this.drawTextY = this.drawY;
    this.updateSpan();
    // this.updateStyle();
    this.updateType();
    this.updateHoverIcon();
    this.updateSelection();
    this.updateTree();
    this.updateEditorType();
    this.updateRender();
    this.getValidationMessage();
    this.updateContainer();
    this.text = this.getText();
    this.displayText = this.getDisplayText();
  }
  updateSpan() {
    // 合计不合并
    if (this.cellType === "footer") {
      return;
    }
    const { SPAN_METHOD } = this.ctx.config;
    if (typeof SPAN_METHOD === "function") {
      const spanMethod: SpanMethod = SPAN_METHOD;
      const { colspan = 1, rowspan = 1 } =
        spanMethod({
          row: this.row,
          rowIndex: this.rowIndex,
          colIndex: this.colIndex,
          column: this.column,
          value: this.getValue(),
          headIndex: this.ctx.body.headIndex,
          headPosition: this.ctx.database.getPositionForRowIndex(
            this.ctx.body.headIndex
          ),
          visibleRows: this.ctx.body.visibleRows,
          visibleLeafColumns: this.ctx.header.visibleLeafColumns,
          rows: this.ctx.body.data,
        }) || {};
      this.colspan = colspan;
      this.rowspan = rowspan;
      this.visibleWidth = this.getWidthByColIndexColSpan(
        this.colIndex,
        this.colspan
      );
      this.visibleHeight = this.ctx.database.getHeightByRowIndexRowSpan(
        this.rowIndex,
        this.rowspan
      );
    }
  }
  updateType() {
    // 更改类型
    const { CELL_TYPE_METHOD } = this.ctx.config;
    if (typeof CELL_TYPE_METHOD === "function") {
      const cellTypeMethod: CellTypeMethod = CELL_TYPE_METHOD;
      const type = cellTypeMethod({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      // 可以动态改变类型
      if (type !== undefined) {
        this.type = type;
      }
    }
  }
  updateEditorType() {
    // 更改类型
    const { CELL_EDITOR_TYPE_METHOD } = this.ctx.config;
    if (typeof CELL_EDITOR_TYPE_METHOD === "function") {
      const cellEditorTypeMethod: CellEditorTypeMethod =
        CELL_EDITOR_TYPE_METHOD;
      const editorType = cellEditorTypeMethod({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      // 可以动态改变类型
      if (editorType !== undefined) {
        this.editorType = editorType;
      }
    }
  }
  updateRender() {
    const { CELL_RENDER_METHOD } = this.ctx.config;
    if (typeof CELL_RENDER_METHOD === "function") {
      const cellRenderMethod: CellRenderMethod = CELL_RENDER_METHOD;
      const render = cellRenderMethod({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      // 可以动态改变类型
      if (render !== undefined) {
        this.render = render;
      }
    }
  }
  validate() {
    this.ctx.database
      .getValidator(this.rowKey, this.key)
      .then(() => {
        this.ctx.database.setValidationError(this.rowKey, this.key, []);
        this.message = "";
      })
      .catch((errors) => {
        if (Array.isArray(errors) && errors.length) {
          const [err] = errors;
          this.message = err.message;
          this.ctx.database.setValidationError(this.rowKey, this.key, errors);
        }
      })
      .finally(() => {
        this.ctx.emit("asyncDrawBody");
      });
  }

  /**
   * 更新样式
   */
  updateStyle() {
    this.style = this.getOverlayerViewsStyle();
  }
  private updateTree() {
    const { CELL_PADDING = 0 } = this.ctx.config;
    const { rowKey, cellType } = this;
    let icon = undefined;
    let iconOffsetX = 0;
    let iconName = "";
    if (this.type === "tree" && cellType === "body") {
      const row = this.ctx.database.getRowForRowKey(rowKey);
      const {
        expand = false,
        hasChildren = false,
        expandLoading = false,
        level = 0,
      } = row || {};
      if (expandLoading) {
        const loadingIcon = this.ctx.icons.get("loading");
        iconName = "loading";
        icon = loadingIcon;
        iconOffsetX = level * 8;
      } else if (hasChildren) {
        const expandIcon = this.ctx.icons.get("expand");
        const shrinkIcon = this.ctx.icons.get("shrink");
        icon = !expand ? expandIcon : shrinkIcon;
        iconName = !expand ? "expand" : "shrink";
        iconOffsetX = level * 8;
      } else {
        iconOffsetX = level * 8;
      }
      if (icon) {
        let iconWidth = 20;
        let iconHeight = 20;
        let iconX = this.drawX + iconOffsetX + CELL_PADDING;
        let iconY = this.drawY + (this.visibleHeight - iconHeight) / 2 + 2;
        this.ctx.paint.drawImage(icon, iconX, iconY, iconWidth, iconHeight);
        this.drawImageX = iconX;
        this.drawImageY = iconY;
        this.drawImageWidth = iconWidth;
        this.drawImageHeight = iconHeight;
        this.drawImageName = iconName;
        this.drawImageSource = icon;
        // 更改文本距离
        this.align = "left";
        this.drawTextX = iconOffsetX + this.drawX + iconWidth + 0.5;
      }
    }
  }
  private updateContainer() {
    const {
      BODY_BG_COLOR,
      EDIT_BG_COLOR,
      BODY_CELL_STYLE_METHOD,
      READONLY_TEXT_COLOR,
      FOOTER_BG_COLOR,
      HIGHLIGHT_SELECTED_ROW,
      HIGHLIGHT_SELECTED_ROW_COLOR,
      HIGHLIGHT_HOVER_ROW,
      HIGHLIGHT_HOVER_ROW_COLOR,
    } = this.ctx.config;
    const cell = this;
    const { rowKey, key, type } = this;
    // 恢复默认背景色
    let bgColor = BODY_BG_COLOR;
    let textColor = READONLY_TEXT_COLOR;
    // 赋值编辑色
    if (!this.ctx.database.getReadonly(rowKey, key)) {
      if (!["index", "index-selection", "selection"].includes(type)) {
        bgColor = EDIT_BG_COLOR;
      }
    }
    // 定义格子样式方法
    if (typeof BODY_CELL_STYLE_METHOD === "function") {
      const cellStyleMethod: CellStyleMethod = BODY_CELL_STYLE_METHOD;
      const { backgroundColor, color } =
        cellStyleMethod({
          row: cell.row,
          rowIndex: cell.rowIndex,
          colIndex: cell.colIndex,
          column: cell.column,
          value: cell.getValue(),
        }) || {};
      if (backgroundColor) {
        bgColor = backgroundColor;
      }
      // 文字颜色
      if (color) {
        textColor = color;
      }
    }
    // 合计底部背景色
    if (cell.cellType === "footer") {
      bgColor = FOOTER_BG_COLOR;
    }
    // 高亮行,在背景色上加一层颜色
    let drawCellSkyBgColor = "transparent";
    const focusCell = this.ctx.focusCell;
    const hoverCell = this.ctx.hoverCell;
    if (HIGHLIGHT_HOVER_ROW && hoverCell?.rowKey === this.rowKey) {
      drawCellSkyBgColor = HIGHLIGHT_HOVER_ROW_COLOR;
    }
    if (HIGHLIGHT_SELECTED_ROW && focusCell?.rowKey === this.rowKey) {
      drawCellSkyBgColor = HIGHLIGHT_SELECTED_ROW_COLOR;
    }
    this.drawCellSkyBgColor = drawCellSkyBgColor;
    this.drawCellBgColor = bgColor;
    this.drawTextColor = textColor;
    // const change = this.grid.database.isHasChangedData(cell.rowKey, cell.key);
    // if (change) {
    //   this.setBackgroundColor("red");
    // }
  }
  private updateSelection() {
    const {
      visibleWidth,
      visibleHeight,
      rowspan,
      colspan,
      cellType,
      type,
      rowIndex,
      rowKey,
    } = this;
    //合并的选框不显示
    if (rowspan === 0 || colspan === 0) {
      return;
    }
    // 合计不显示
    if (cellType === "footer") {
      return;
    }
    // 选中框类型
    if (["index-selection", "selection"].includes(type)) {
      const check = this.ctx.database.getRowSelection(rowKey);
      const selectable = this.ctx.database.getRowSelectable(rowKey);
      const { CHECKBOX_SIZE = 0 } = this.ctx.config;
      const _x = this.drawX + (visibleWidth - CHECKBOX_SIZE) / 2;
      const _y = this.drawY + (visibleHeight - CHECKBOX_SIZE) / 2;
      let checkboxImage: HTMLImageElement | undefined =
        this.ctx.icons.get("checkbox-uncheck");
      let checkboxName = "checkbox-uncheck";
      if (check && selectable) {
        checkboxImage = this.ctx.icons.get("checkbox-check");
        checkboxName = "checkbox-check";
      } else if (check && selectable) {
        checkboxImage = this.ctx.icons.get("checkbox-check-disabled");
        checkboxName = "checkbox-check-disabled";
      } else if (!check && selectable) {
        checkboxImage = this.ctx.icons.get("checkbox-uncheck");
        checkboxName = "checkbox-uncheck";
      } else {
        checkboxImage = this.ctx.icons.get("checkbox-disabled");
        checkboxName = "checkbox-disabled";
      }
      if (checkboxImage && type == "index-selection") {
        if (
          (this.ctx.hoverCell && this.ctx.hoverCell.rowIndex === rowIndex) ||
          ["checkbox-disabled", "checkbox-check"].includes(checkboxName)
        ) {
          this.drawImageX = _x;
          this.drawImageY = _y;
          this.drawImageWidth = CHECKBOX_SIZE;
          this.drawImageHeight = CHECKBOX_SIZE;
          this.drawImageName = checkboxName;
          this.drawImageSource = checkboxImage;
        }
      } else if (checkboxImage && "selection" === type) {
        this.drawImageX = _x;
        this.drawImageY = _y;
        this.drawImageWidth = CHECKBOX_SIZE;
        this.drawImageHeight = CHECKBOX_SIZE;
        this.drawImageName = checkboxName;
        this.drawImageSource = checkboxImage;
      }
    }
  }
  private updateHoverIcon() {
    const { CELL_HOVER_ICON_METHOD, CELL_HOVER_ICON_SIZE, CELL_PADDING } =
      this.ctx.config;
    if (typeof CELL_HOVER_ICON_METHOD === "function") {
      const hoverIconMethod: CellHoverIconMethod = CELL_HOVER_ICON_METHOD;
      const hoverIconName = hoverIconMethod({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      // 可以动态改变hoverIconName
      if (hoverIconName !== undefined) {
        this.hoverIconName = hoverIconName;
      }
    }
    // 永远放在右边
    const _x = this.drawX + this.width - CELL_HOVER_ICON_SIZE - CELL_PADDING;
    const _y = this.drawY + (this.height - CELL_HOVER_ICON_SIZE) / 2;
    if (this.hoverIconName) {
      if (this.ctx.hoverCell && this.ctx.hoverCell.rowIndex === this.rowIndex) {
        const drawImageSource = this.ctx.icons.get(this.hoverIconName);
        this.drawImageX = _x;
        this.drawImageY = _y;
        this.drawImageWidth = CELL_HOVER_ICON_SIZE;
        this.drawImageHeight = CELL_HOVER_ICON_SIZE;
        this.drawImageName = this.hoverIconName;
        this.drawImageSource = drawImageSource;
      }
    }
  }

  /**
   * 获取显示文本
   * @returns
   */
  getDisplayText() {
    if (this.cellType === "footer") {
      // 插槽不显示文本
      if (this.renderFooter) {
        return "";
      }
      const text = this.row[this.key];
      if (this.text === null || this.text === undefined) {
        return "";
      }
      return text;
    } else {
      // cellType === "body"
      // 被跨度单元格
      if (this.rowspan === 0 || this.colspan === 0) {
        return "";
      }
      // 插槽不显示文本
      if (this.render) {
        return "";
      }
      //
      if (
        this.type === "index-selection" &&
        ((this.ctx.hoverCell &&
          this.ctx.hoverCell.rowIndex === this.rowIndex) ||
          ["checkbox-disabled", "checkbox-check"].includes(this.drawImageName))
      ) {
        return "";
      }
      if (this.text === null || this.text === undefined) {
        return "";
      }
      return `${this.text}`;
    }
  }
  /**
   * 获取文本
   * @returns
   */
  getText() {
    if (typeof this.formatter === "function") {
      const _text = this.formatter({
        row: this.row,
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        column: this.column,
        value: this.getValue(),
      });
      return _text;
    }
    if (["index-selection", "index"].includes(this.type)) {
      const str = `${this.rowIndex + 1}`; // 索引
      return str; // 索引
    }
    this.value = this.ctx.database.getItemValue(this.rowKey, this.key);
    return this.value;
  }
  getValue() {
    return this.ctx.database.getItemValue(this.rowKey, this.key);
  }
  /**
   * 获取样式
   */
  getOverlayerViewsStyle() {
    // let left = `${this.getClientX() - this.ctx.header.fixedLeftWidth}px`;
    // let top = `${this.getClientY() - this.ctx.body.y}px`;
    // // 固定列
    // if (this.fixed === "left") {
    //   left = `${this.getClientX()}px`;
    // } else if (this.fixed === "right") {
    //   left = `${
    //     this.getClientX() -
    //     (this.ctx.stage.width() - this.ctx.header.fixedRightWidth)
    //   }px`;
    // }
    // // 合计
    // if (this.cellType === "footer") {
    //   if (this.ctx.config.FOOTER_FIXED) {
    //     top = `${this.getClientY() - this.ctx.footer.y}px`;
    //   }
    // }
    // return {
    //   position: "absolute",
    //   overflow: "hidden",
    //   left,
    //   top,
    //   width: `${this.visibleWidth}px`,
    //   height: `${this.visibleHeight}px`,
    //   pointerEvents: "none",
    // };
  }
  draw() {
    const {
      paint,
      config: { BORDER_COLOR },
    } = this.ctx;
    const { drawX, drawY } = this;
    // 绘制单元格
    paint.drawRect(drawX, drawY, this.visibleWidth, this.visibleHeight, {
      borderColor: BORDER_COLOR,
      fillColor: this.drawCellBgColor,
    });
    paint.drawRect(drawX, drawY, this.width, this.height, {
      borderColor: "transparent",
      borderWidth: 1,
      fillColor: this.drawCellSkyBgColor,
    });
    // 画选中框
    this.ellipsis = this.drawText();
    this.drawImage();
    this.drawSelector();
    this.drawAutofillPiont();
  }

  /**
   * 根据列的索引获取列的宽度
   * @param {Number} colIndex
   */
  private getWidthByColIndexColSpan(colIndex: number, colSpan: number) {
    if (colSpan === 0) {
      return 0;
    }
    let width = 0;
    for (let i = colIndex; i < colIndex + colSpan; i++) {
      const cellHeader = this.ctx.header.leafCellHeaders[i];
      width += cellHeader.width;
    }
    return width;
  }
  private drawText() {
    const {
      CELL_PADDING = 0,
      BODY_FONTFAMILY,
      BODY_FONT_SIZE,
      BODY_FONT_STYLE,
    } = this.ctx.config;
    const font = `${BODY_FONT_SIZE}px ${BODY_FONT_STYLE} ${BODY_FONTFAMILY}`;

    return this.ctx.paint.drawText(
      this.displayText,
      this.drawTextX,
      this.drawTextY,
      this.visibleWidth,
      this.visibleHeight,
      {
        font,
        padding: CELL_PADDING,
        align: this.align,
        verticalAlign: this.verticalAlign,
        color: this.drawTextColor,
      }
    );
  }
  private drawImage() {
    if (!this.drawImageSource) {
      return;
    }
    this.ctx.paint.drawImage(
      this.drawImageSource,
      this.drawImageX,
      this.drawImageY,
      this.drawImageWidth,
      this.drawImageHeight
    );
  }
  private drawAutofillPiont() {
    if (this.cellType === "footer") {
      return;
    }
    const { SELECT_BORDER_COLOR, ENABLE_AUTOFILL, ENABLE_SELECTOR } =
      this.ctx.config;
    if (!ENABLE_SELECTOR) {
      return;
    }
    if (!ENABLE_AUTOFILL) {
      return;
    }
    const show = true;
    const { xArr, yArr } = this.ctx.selector;
    const maxX = xArr[1];
    const maxY = yArr[1];
    const { colIndex, rowIndex, drawX, drawY } = this;
    // 绘制自动填充点
    if (show && colIndex === maxX && rowIndex === maxY) {
      this.ctx.paint.drawRect(
        drawX + this.width - 6,
        drawY + this.height - 6,
        6,
        6,
        {
          borderColor: "#fff",
          fillColor: SELECT_BORDER_COLOR,
        }
      );
    }
  }
  private drawSelector() {
    if (this.cellType === "footer") {
      return;
    }
    const { ENABLE_SELECTOR } = this.ctx.config;
    if (!ENABLE_SELECTOR) {
      return;
    }
    const { xArr, yArr, xArrCopy, yArrCopy } = this.ctx.selector;
    // 复制线
    this.drawBorder({
      xArr: xArrCopy,
      yArr: yArrCopy,
      borderColor: this.ctx.config.SELECT_BORDER_COLOR || "rgb(82,146,247)",
      fillColor: this.ctx.config.SELECT_AREA_COLOR || "rgba(82,146,247,0.1)",
      borderWidth: 1,
      lineDash: [4, 4],
    });
    // 填充线
    this.drawBorder({
      xArr: this.ctx.autofill.xArr,
      yArr: this.ctx.autofill.yArr,
      borderColor: this.ctx.config.SELECT_BORDER_COLOR || "rgb(82,146,247)",
      fillColor: this.ctx.config.SELECT_AREA_COLOR || "rgba(82,146,247,0.1)",
      borderWidth: 1,
      lineDash: [4, 4],
    });
    // 选择线
    this.drawBorder({
      xArr,
      yArr,
      borderColor: this.ctx.config.SELECT_BORDER_COLOR || "rgb(82,146,247)",
      fillColor: this.ctx.config.SELECT_AREA_COLOR || "rgba(82,146,247,0.1)",
      borderWidth: 1,
    });
  }
  private drawBorder(options: {
    xArr: number[];
    yArr: number[];
    borderColor: string;
    fillColor: string;
    borderWidth: number;
    lineDash?: number[];
  }) {
    const { drawX, drawY, width, rowIndex, colIndex } = this;
    const x = drawX + 0.5;
    let y = drawY + 0.5;
    let height = this.height;
    // 第一行减去1，不然会被表头覆盖
    if (rowIndex === 0) {
      y = this.y + 1;
      height = height - 1;
    }
    const {
      xArr,
      yArr,
      lineDash = [],
      borderWidth = 1,
      borderColor,
      fillColor,
    } = options;

    const minX = xArr[0];
    const maxX = xArr[1];
    const minY = yArr[0];
    const maxY = yArr[1];
    // 选择
    if (colIndex >= minX && colIndex <= maxX && rowIndex === minY) {
      this.ctx.paint.drawLine([x, y, x + width - 2, y], {
        borderColor,
        fillColor,
        borderWidth,
        lineCap: "round",
        lineJoin: "round",
        lineDash,
      });
    }
    // bottom border
    if (colIndex >= minX && colIndex <= maxX && rowIndex === maxY) {
      this.ctx.paint.drawLine(
        [x, y + height - 1.5, x + width, y + height - 1.5],
        {
          borderColor,
          fillColor,
          borderWidth,
          lineCap: "round",
          lineJoin: "round",
          lineDash,
        }
      );
    }
    // left border
    if (colIndex === minX && rowIndex >= minY && rowIndex <= maxY) {
      this.ctx.paint.drawLine([x, y, x, y + height - 1], {
        borderColor,
        fillColor,
        borderWidth,
        lineCap: "round",
        lineJoin: "round",
        lineDash,
      });
    }
    // right border
    if (colIndex === maxX && rowIndex >= minY && rowIndex <= maxY) {
      this.ctx.paint.drawLine(
        [x + width - 1, y, x + width - 1, y + height - 1],
        {
          borderColor,
          fillColor,
          borderWidth,
          lineCap: "round",
          lineJoin: "round",
          lineDash,
        }
      );
    }
  }
}
