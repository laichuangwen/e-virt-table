import Cell from "./Cell";
import Context from "./Context";
import { computePosition, shift, flip, offset, arrow } from "@floating-ui/dom";
export default class Tooltip {
  private ctx: Context;
  private contentEl: HTMLSpanElement;
  private floatingEl: HTMLDivElement;
  private arrowEl: HTMLDivElement;
  constructor(ctx: Context) {
    this.ctx = ctx;
    const {
      TOOLTIP_BG_COLOR,
      TOOLTIP_TEXT_COLOR,
      TOOLTIP_ZINDEX,
      TOOLTIP_CUSTOM_STYLE,
    } = this.ctx.config;
    this.contentEl = document.createElement("span");
    this.arrowEl = document.createElement("div");
    this.floatingEl = document.createElement("div");
    const floatingStyle = {
      display: "none",
      position: "absolute",
      background: TOOLTIP_BG_COLOR,
      color: TOOLTIP_TEXT_COLOR,
      boxSizing: "border-box",
      zIndex: TOOLTIP_ZINDEX,
      padding: "8px",
      borderRadius: `4px`,
      fontSize: `12px`,
      ...TOOLTIP_CUSTOM_STYLE,
    };
    const arrowStyle = {
      position: "absolute",
      width: "10px",
      height: "10px",
      background: floatingStyle.background,
      backgroundColor: floatingStyle.backgroundColor,
      transform: "rotate(45deg)",
      zIndex: floatingStyle.zIndex,
    };
    Object.assign(this.arrowEl.style, arrowStyle);
    Object.assign(this.floatingEl.style, floatingStyle);
    this.floatingEl.appendChild(this.contentEl);
    this.floatingEl.appendChild(this.arrowEl);
     this.ctx.targetContainer.appendChild(this.floatingEl);
    this.init();
  }
  private init() {
    this.ctx.on("cellHoverChange", (cell) => {
      if (cell.ellipsis) {
        this.show(cell);
      }
    });
    this.ctx.on("cellMouseleave", () => {
      this.hide();
    });
  }
  private show(cell: Cell) {
    this.floatingEl.style.display = "block";
    let text = cell.getText();
    if (cell.message) {
      text = cell.message;
    }
    this.contentEl.innerText = text;
    const virtualEl = {
      getBoundingClientRect() {
        return {
          width: cell.visibleWidth,
          height: cell.visibleHeight,
          x: cell.drawX,
          y: cell.drawY,
          left: cell.drawX,
          right: cell.drawX,
          top: cell.drawY,
          bottom: cell.drawY,
        };
      },
    };
    computePosition(virtualEl, this.floatingEl, {
      placement: "top",
      middleware: [
        flip(),
        shift(),
        offset(0),
        arrow({ element: this.arrowEl }),
      ],
    }).then(({ x, y, middlewareData }) => {
      Object.assign(this.floatingEl.style, {
        top: `${y}px`,
        left: `${x}px`,
      });
      if (middlewareData.arrow) {
        const { x, y } = middlewareData.arrow;
        Object.assign(this.arrowEl.style, {
          left: x != null ? `${x}px` : "",
          top: y != null ? `${y}px` : "",
        });
      }
    });
  }
  private hide() {
    this.floatingEl.style.display = "none";
  }
  destroy() {}
}
