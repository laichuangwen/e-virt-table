import Cell from "./Cell";
import Context from "./Context";

export default class Tooltip {
  private ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
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
    let text = cell.getText();
    if (cell.message) {
      text = cell.message;
    }
    this.ctx.emit("overlayerTooltipChange", {
      cell,
      text,
      show: true,
    });
  }
  private hide() {
    this.ctx.emit("overlayerTooltipChange", {
      cell: {},
      text: "",
      show: false,
    });
  }
  destroy() {}
}
