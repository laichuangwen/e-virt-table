import type Cell from "./Cell";
import type Context from "./Context";

export default class Editor {
  private show = false;
  private cellTarget: Cell | null = null;
  ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  getShow() {
    return this.show;
  }
  setShow(show: boolean) {
    this.show = show;
  }
  startEdit() {
    // const focusCell = this.ctx.selector.getFocusCell();
    // if (focusCell) {
    //   this.ctx.emit("cellSelectedClick", focusCell);
    // }
    // const { rowKey = "", key = "" } = focusCell || {};
    // const readonly = this.ctx.database.getReadonly(rowKey, key);
    // if (focusCell && !readonly) {
    //   this.show = true;
    //   this.ctx.tooltip.hide();
    //   this.cellTarget = focusCell;
    //   this.ctx.emit("startEdit", focusCell);
    // }
  }
  doneEdit() {
    this.show = false;
    if (this.cellTarget) {
      this.ctx.emit("doneEdit", this.cellTarget);
      this.ctx.target.focus();
      this.cellTarget = null;
    }
  }
}
