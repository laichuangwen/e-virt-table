import { offset } from "@floating-ui/dom";
import type Cell from "./Cell";
import type Context from "./Context";

export default class Editor {
  private enable = false;
  private cellTarget: Cell | null = null;
  ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
    this.ctx.on("keydown", (e) => {
      // CTRL+V／Command+V
      if (
        (e.ctrlKey && e.code === "KeyV") ||
        (e.metaKey && e.code === "KeyV")
      ) {
        return;
      }
      // 撤销
      if (
        (e.ctrlKey && !e.shiftKey && e.code === "KeyZ") ||
        (e.metaKey && !e.shiftKey && e.code === "KeyZ")
      ) {
        e.preventDefault();
        return;
      }
      // 恢复
      if (
        (e.ctrlKey && e.code === "KeyY") ||
        (e.ctrlKey && e.shiftKey && e.code === "KeyZ") ||
        (e.metaKey && e.shiftKey && e.code === "KeyZ")
      ) {
        return;
      }
      // CTRL+C／Command+C
      if (
        (e.ctrlKey && e.code === "KeyC") ||
        (e.metaKey && e.code === "KeyC")
      ) {
        e.preventDefault();
        return;
      }
      // CTRL+X／Command+X
      if (
        (e.ctrlKey && e.code === "KeyX") ||
        (e.metaKey && e.code === "KeyX")
      ) {
        e.preventDefault();
        return;
      }
      // CTRL+A／Command+A
      if (
        (e.ctrlKey && e.code === "KeyA") ||
        (e.metaKey && e.code === "KeyA")
      ) {
      }
      if (e.code === "ArrowLeft") {
        return;
      }
      if (e.code === "ArrowUp") {
        return;
      }
      if (e.code === "ArrowRight" || e.code === "Tab") {
        return;
      }
      if (e.code === "ArrowDown") {
        return;
      }
      if (e.code === "Delete" || e.code === "Backspace") {
        return;
      }
      // CTRL+R／CRTRL+F等类型的事件不阻止默认事件
      if (
        e.key === "Alt" ||
        e.key === "Control" ||
        e.key === "Shift" ||
        e.key === "CapsLock" ||
        e.key === "Backspace"
      ) {
        return;
      }
      // 编辑模式按下按Enter进入编辑模式
      if (e.code === "Enter") {
        e.preventDefault();
        this.startEdit();
        return;
      }
      // 除了上面的建其他都开始编辑
      this.startEdit();
    });
    this.ctx.on("onScroll", () => {
      // 滚动时结束编辑模式
      if (!this.enable) {
        return;
      }
      this.doneEdit();
    });
    this.ctx.on("mousedown", (e) => {
      const { targetRect } = this.ctx;
      if (!targetRect) {
        return;
      }
      if (!this.enable) {
        return;
      }
      // 在编辑时点击窗口外结束编辑模式
      if (
        e.clientX < targetRect.x ||
        e.clientX > targetRect.x + targetRect.width ||
        e.clientY < targetRect.y ||
        e.clientY > targetRect.y + targetRect.height
      ) {
        this.doneEdit();
      }
    });
    this.ctx.on("cellClick", (cell) => {
      if (
        cell.rowKey === this.cellTarget?.rowKey &&
        cell.key === this.cellTarget?.key
      ) {
        this.startEdit();
        console.log("startEdit");
      } else {
        this.doneEdit();
        this.cellTarget = cell;
        // 单击单元格进入编辑模式
        if (this.ctx.config.ENABLE_EDIT_SINGLE_CLICK) {
          this.startEdit();
        }
      }
    });
  }
  startEdit() {
    const focusCell = this.ctx.focusCell;
    const { rowKey = "", key = "" } = focusCell || {};
    const readonly = this.ctx.database.getReadonly(rowKey, key);
    if (focusCell && !readonly) {
      this.enable = true;
      this.ctx.emit("startEdit", focusCell);
    }
  }
  doneEdit() {
    if (!this.enable) {
      return;
    }
    this.enable = false;
    if (this.cellTarget) {
      console.log("doneEdit", this.cellTarget);
      this.ctx.emit("doneEdit", this.cellTarget);
      this.ctx.target.focus();
      this.cellTarget = null;
      this.ctx.emit("draw");
    }
  }
  destroy() {}
}
