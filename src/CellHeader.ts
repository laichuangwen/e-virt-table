import type Context from "./Context";
import { generateShortUUID } from "./util";
import type {
  Align,
  Column,
  Fixed,
  Render,
  Rules,
  Type,
  VerticalAlign,
} from "./types";
import BaseCell from "./BaseCell";
export default class CellHeader extends BaseCell {
  align: Align;
  verticalAlign: VerticalAlign = "middle";
  fixed: Fixed | undefined;
  type: Type;
  editorType: string;
  level: number;
  text: string;
  displayText: string = "";
  colspan: number;
  rowspan: number;
  key: string;
  required = false;
  readonly = false;
  children: Column[] = [];
  column: Column;
  colIndex: number;
  rowKey: string;
  rules: Rules;
  hasChildren: boolean;
  render: Render;
  style: Partial<CSSStyleDeclaration> = {};
  constructor(
    ctx: Context,
    colIndex: number,
    x: number,
    y: number,
    width: number,
    height: number,
    column: Column
  ) {
    super(ctx, x, y, width, height, column.fixed);
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colIndex = colIndex;
    this.key = column.key;
    this.type = column.type;
    this.editorType = column.editorType || "text";
    this.align = column.align || "center";
    this.verticalAlign = column.verticalAlign || "middle";
    this.fixed = column.fixed;
    this.level = column.level;
    this.text = column.title;
    this.column = column;
    this.colspan = column.colspan;
    this.rowspan = column.rowspan;
    this.rules = column.rules;
    this.readonly = column.readonly;
    this.required = column.required;
    this.rowKey = generateShortUUID();
    this.hasChildren = (column.children && column.children.length > 0) || false; // 是否有子
    this.render = column.renderHeader;
  }
  /**
   * 覆盖基类方法，获取绘制y坐标
   * @returns
   */
  getDrawY() {
    return this.y;
  }
  /**
   * 是否可见，覆盖基类方法，表头是跟y滚动条没有关系的所以不需要加滚动参数
   * @returns
   */
  isVerticalVisible() {
    const { target } = this.ctx;
    const offsetHeight = target.offsetHeight;
    return !(this.y + this.height <= 0 || this.y >= offsetHeight);
  }

  /**
   * 更新样式
   */
  updateStyle() {
    // this.style = this.getOverlayerViewsStyle();
  }

  update() {
    this.updateStyle();
  }
  draw() {
    // this.x = this.getDisplayX();
    // console.log(this.x);
    const drawX = this.getDrawX();
    const drawY = this.getDrawY();
    const displayText = this.getText();
    const {
      paint,
      config: {
        BORDER_COLOR,
        HEADER_BG_COLOR,
        CELL_PADDING,
        HEAD_FONTFAMILY,
        HEAD_FONT_SIZE,
        HEAD_FONT_STYLE,
      },
    } = this.ctx;
    paint.drawRect(drawX, drawY, this.width, this.height, {
      borderColor: BORDER_COLOR,
      fillColor: HEADER_BG_COLOR,
    });
    const font = `${HEAD_FONT_SIZE}px ${HEAD_FONT_STYLE} ${HEAD_FONTFAMILY}`;
    paint.drawText(displayText, drawX, drawY, this.width, this.height, {
      font,
      padding: CELL_PADDING,
      align: this.align,
      verticalAlign: this.verticalAlign,
    });
  }
  getText() {
    if (this.render) {
      return "";
    }
    return this.text;
  }
  /**
   * 获取样式
   */
  // getOverlayerViewsStyle() {
  //   let left = "";
  //   if (this.fixed === "left") {
  //     left = `${this.getClientX()}px`;
  //   } else if (this.fixed === "right") {
  //     left = `${
  //       this.getClientX() -
  //       (this.ctx.stage.width() - this.ctx.header.fixedRightWidth)
  //     }px`;
  //   } else {
  //     left = `${this.getClientX() - this.ctx.header.fixedLeftWidth}px`;
  //   }
  //   return {
  //     position: "absolute",
  //     overflow: "hidden",
  //     left: left,
  //     top: `${this.y}px`,
  //     width: `${this.width}px`,
  //     height: `${this.height}px`,
  //     pointerEvents: "none",
  //   };
  // }
}
