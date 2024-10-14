import Cell from "./Cell";
import Context from "./Context";
import {
  computePosition,
  offset,
  arrow,
  flip,
  shift,
} from "@floating-ui/dom";
export default class Tooltip {
  private ctx: Context;
  private contentEl: HTMLDivElement;
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
    this.contentEl = document.createElement("div");
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
    this.ctx.on("mousemove", (e) => {
      // 鼠标移动时，判断是否在目标元素上，不在则隐藏
      if (!this.ctx.isTarget(e.target)) {
        this.hide();
      }
    });
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
    // 如果没有设置overflowTooltipShow=true，则不显示
    if (!cell.overflowTooltipShow) {
      return;
    }
    // 如果是鼠标按下状态，则不显示
    if (this.ctx.mousedown) { 
      return;
    }
    this.floatingEl.style.display = "block";
    let text = cell.getText();
    if (cell.message) {
      text = cell.message;
    }
    // 设置最大宽度
    this.contentEl.style.maxWidth = "500px";
    this.contentEl.style.width = "100%";
    this.contentEl.style.display = "inline-block";
    this.contentEl.style.wordBreak = "break-all";
    this.contentEl.style.lineHeight = "1.5";
    this.contentEl.innerText = text;
    const cellX = cell.drawX + this.ctx.targetContainer.offsetLeft;
    const cellY = cell.drawY + this.ctx.targetContainer.offsetTop;
    // 这个是相对于视口的位置
    const virtualEl = {
      getBoundingClientRect() {
        return {
          width: cell.visibleWidth,
          height: cell.visibleHeight,
          x: cellX,
          y: cellY,
          left: cellX,
          right: cellX + cell.visibleWidth,
          top: cellY,
          bottom: cellY + cell.visibleHeight,
        };
      },
    };

    computePosition(virtualEl, this.floatingEl, {
      placement: cell.overflowTooltipPlacement,
      middleware: [
        shift(),
        flip(),
        offset(6),
        arrow({ element: this.arrowEl }),
      ],
    }).then((val) => {
      const { x, y, placement, middlewareData } = val;
      Object.assign(this.floatingEl.style, {
        top: `${y}px`,
        left: `${x}px`,
      });
      if (middlewareData.arrow) {
        const arrow = middlewareData.arrow;
        if (["left", "left-start", "left-end"].includes(placement)) {
          Object.assign(this.arrowEl.style, {
            top: `${arrow.y}px`,
            bottom: "",
            left: "",
            right: `-5px`,
          });
        } else if (["right", "right-start", "right-end"].includes(placement)) {
          Object.assign(this.arrowEl.style, {
            top: `${arrow.y}px`,
            bottom: "",
            left: `-5px`,
            right: "",
          });
        } else if (
          ["bottom", "bottom-start", "bottom-end"].includes(placement)
        ) {
          Object.assign(this.arrowEl.style, {
            top: `-5px`,
            bottom: "",
            left: `${arrow.x}px`,
            right: "",
          });
        } else if (["top", "top-start", "top-end"].includes(placement)) {
          Object.assign(this.arrowEl.style, {
            top: "",
            bottom: `-5px`,
            left: `${arrow.x}px`,
            right: "",
          });
        }
      }
    });
  }
  private hide() {
    this.floatingEl.style.display = "none";
  }
  destroy() {}
}
