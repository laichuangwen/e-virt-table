import Context from "./Context";
import { throttle } from "./util";

type EventTask = Map<string, EventListenerOrEventListenerObject>;

export default class EventBrowser {
  private eventTasks: EventTask = new Map();
  private ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
    this.init();
  }

  init() {
    this.bind(window, "resize", throttle(this.handleResize.bind(this), 100));
    this.bind(window, "mousedown", this.handleMouseDown.bind(this));
    this.bind(window, "mouseup", this.handleMouseUp.bind(this));
    this.bind(window, "mousemove", this.handleMousemove.bind(this));
    this.bind(this.ctx.target, "click", this.handleClick.bind(this));
    this.bind(this.ctx.target, "wheel", this.handleWheel.bind(this));
  }
  destroy() {
    this.eventTasks.forEach((fn, event) => {
      this.unbind(window, event, fn);
    });
    this.eventTasks.clear();
  }
  private handleResize(e: Event) {
    this.ctx.emit("resize", e);
    this.ctx.emit("draw");
  }
  private handleMouseDown(e: Event) {
    this.ctx.mousedown = true;
    this.ctx.emit("mousedown", e);
  }
  private handleMousemove(e: Event) {
    this.ctx.emit("mousemove", e);
  }
  private handleMouseUp(e: Event) {
    this.ctx.mousedown = false;
    this.ctx.emit("mouseup", e);
  }
  private handleClick(e: Event) {
    this.ctx.emit("click", e);
  }
  private handleWheel(e: Event) {
    this.ctx.emit("wheel", e);
  }
  private bind(
    target: EventTarget,
    name: string,
    fn: EventListenerOrEventListenerObject
  ): void {
    target.addEventListener(name, fn);
    this.eventTasks.set(name, fn);
  }

  private unbind(
    target: EventTarget,
    name: string,
    fn: EventListenerOrEventListenerObject
  ): void {
    target.removeEventListener(name, fn);
    this.eventTasks.delete(name);
  }
}
