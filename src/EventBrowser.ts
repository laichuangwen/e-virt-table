import Context from './Context';

type EventTask = Map<string, EventListenerOrEventListenerObject>;

export default class EventBrowser {
    private eventTasks: EventTask = new Map();
    private ctx: Context;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }

    init() {
        this.bind(window, 'resize', this.handleResize.bind(this));
        this.bind(window, 'mouseup', this.handleMouseUp.bind(this));
        this.bind(window, 'mousemove', this.handleMousemove.bind(this));
        this.bind(window, 'blur', this.handleOutsideMousedown.bind(this));
        this.bind(window, 'mousedown', this.handleOutsideMousedown.bind(this));
        this.bind(this.ctx.stageElement, 'click', this.handleClick.bind(this));
        this.bind(window, 'keydown', this.handleKeydown.bind(this));
        this.bind(this.ctx.stageElement, 'wheel', this.handleWheel.bind(this));
        this.bind(this.ctx.stageElement, 'touchstart', this.handleTouchstart.bind(this));
        this.bind(this.ctx.stageElement, 'touchend', this.handleTouchend.bind(this));
        this.bind(this.ctx.stageElement, 'touchmove', this.handleTouchmove.bind(this));
        this.bind(this.ctx.stageElement, 'contextmenu', this.handleContextMenu.bind(this));
        this.bind(this.ctx.stageElement, 'mousedown', this.handleMouseDown.bind(this));
        this.bind(this.ctx.stageElement, 'dblclick', this.handleDblclick.bind(this));
        this.bind(this.ctx.stageElement, 'mouseover', this.handleMouseover.bind(this));
        this.bind(this.ctx.stageElement, 'mouseout', this.handleMouseout.bind(this));
    }
    destroy() {
        this.eventTasks.forEach((fn, event) => {
            this.unbind(window, event, fn);
        });
        this.eventTasks.clear();
    }
    private handleResize(e: Event) {
        this.ctx.emit('resetHeader', e);
        this.ctx.emit('resize', e);
    }
    private handleMouseDown(e: Event) {
        const _e = e as MouseEvent;
        if (_e.button === 0) {
            this.ctx.mousedown = true;
        }
        this.ctx.emit('mousedown', e);
    }
    private handleMousemove(e: Event) {
        this.ctx.emit('mousemove', e);
    }
    private handleMouseUp(e: Event) {
        const _e = e as MouseEvent;
        if (_e.button === 0) {
            this.ctx.mousedown = false;
        }
        this.ctx.emit('mouseup', e);
    }
    private handleClick(e: Event) {
        this.ctx.emit('click', e);
    }
    private handleKeydown(e: Event) {
        const { ENABLE_KEYBOARD } = this.ctx.config;
        if (!ENABLE_KEYBOARD) return;
        if (!this.ctx.isTarget(e)) {
            return;
        }
        this.ctx.emit('keydown', e);
    }
    private handleWheel(e: Event) {
        this.ctx.emit('wheel', e);
    }
    private handleTouchstart(e: Event) {
        this.ctx.emit('touchstart', e);
    }
    private handleTouchend(e: Event) {
        this.ctx.emit('touchend', e);
    }
    private handleTouchmove(e: Event) {
        this.ctx.emit('touchmove', e);
    }
    private handleContextMenu(e: Event) {
        this.ctx.emit('contextMenu', e);
    }
    private handleMouseover(e: Event) {
        this.ctx.isMouseoverTargetContainer = true;
        this.ctx.emit('mouseover', e);
    }
    private handleMouseout(e: Event) {
        this.ctx.isMouseoverTargetContainer = false;
        this.ctx.emit('mouseout', e);
    }
    private handleDblclick(e: Event) {
        this.ctx.emit('dblclick', e);
    }
    private handleOutsideMousedown(e: Event) {
        if (
            this.ctx.selector.enable &&
            (e.target instanceof Window || (e.target instanceof Node && !this.ctx.containerElement.contains(e.target)))
        ) {
            this.ctx.emit('outsideMousedown', e);
        }
    }
    private bind(
        target: EventTarget,
        name: string,
        fn: EventListenerOrEventListenerObject,
        options?: AddEventListenerOptions | boolean,
    ): void {
        target.addEventListener(name, fn, options);
        this.eventTasks.set(name, fn);
    }

    private unbind(target: EventTarget, name: string, fn: EventListenerOrEventListenerObject): void {
        target.removeEventListener(name, fn);
        this.eventTasks.delete(name);
    }
}
