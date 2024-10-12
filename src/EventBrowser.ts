import Context from "./Context";

type EventTask = Map<string, EventListenerOrEventListenerObject>;

export default class EventBrowser {
  private eventTasks: EventTask = new Map();
  private ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
    this.init();
  }

  init() {
    this.bind(window, "resize", this.handleResize.bind(this));
    this.bind(window, "mousedown", this.handleMouseDown.bind(this));
    this.bind(window, "mouseup", this.handleMouseUp.bind(this));
    this.bind(window, "mousemove", this.handleMousemove.bind(this));
    this.bind(this.ctx.target, "click", this.handleClick.bind(this));
    this.bind(this.ctx.target, "keydown", this.handleKeydown.bind(this));
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
    const _e = e as MouseEvent;
    if (_e.button === 0) {
      this.ctx.mousedown = true;
    }
    this.ctx.emit("mousedown", e);
  }
  private handleMousemove(e: Event) {
    this.ctx.emit("mousemove", e);
  }
  private handleMouseUp(e: Event) {
    const _e = e as MouseEvent;
    if (_e.button === 0) {
      this.ctx.mousedown = false;
    }
    this.ctx.emit("mouseup", e);
  }
  private handleClick(e: Event) {
    this.ctx.emit("click", e);
  }
  private handleKeydown(e: Event) {
    const { ENABLE_KEYBOARD } = this.ctx.config;
    if (!ENABLE_KEYBOARD) return;
    this.ctx.emit("keydown", e);
  }
  private handleWheel(e: Event) {
    this.ctx.emit("wheel", e);
  }
  private bind(
    target: EventTarget,
    name: string,
    fn: EventListenerOrEventListenerObject
  ): void {
    // canvas元素默认不支持键盘事件，需要设置tabIndex
    if (target instanceof HTMLCanvasElement && name === "keydown") {
      target.tabIndex = 0;
    }
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
