import { EVirtTableOptions } from "./types";
import Context from "./Context";
import Scroller from "./Scroller";
import Header from "./Header";
import Body from "./Body";
import Selector from "./Selector";
import Autofill from "./Autofill";
import Tooltip from "./Tooltip";
export default class VirtTable {
  private target: HTMLCanvasElement;
  private scroller: Scroller;
  private header: Header;
  private body: Body;
  private selector: Selector;
  private autofill: Autofill;
  private tooltip: Tooltip;
  ctx: Context;
  constructor(target: HTMLCanvasElement, options: EVirtTableOptions) {
    this.target = target;
    this.ctx = new Context(target, options);
    this.header = new Header(this.ctx);
    this.body = new Body(this.ctx);
    this.scroller = new Scroller(this.ctx);
    this.selector = new Selector(this.ctx);
    this.autofill = new Autofill(this.ctx);
    this.tooltip = new Tooltip(this.ctx);
    console.log(this.ctx);
    // 外层容器样式
    const {
      config: { BORDER_COLOR, BORDER_RADIUS, WIDTH = 0, HEIGHT = 0 },
    } = this.ctx;
    this.target.width = WIDTH - 1;
    this.target.height = HEIGHT - 1;
    this.target.setAttribute(
      "style",
      `outline: none; position: relative; border-radius: ${BORDER_RADIUS}px; border: 1px solid ${BORDER_COLOR};`
    );
    this.ctx.on("draw", this.draw.bind(this));
    this.draw();
  }
  draw() {
    this.header.update();
    this.body.update();
    requestAnimationFrame(() => {
      console.time("draw");
      this.ctx.paint.clear();
      this.body.draw();
      this.header.draw();
      this.scroller.draw();
      console.timeEnd("draw");
    });
  }
  /**
   * 销毁
   */
  destroy() {
    this.tooltip.destroy();
    this.selector.destroy();
    this.autofill.destroy();
    this.ctx.destroy();
    this.target.remove();
    console.log("销毁");
  }
}
