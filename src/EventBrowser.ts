import Context from './Context';

type EventTask = Map<string, EventListenerOrEventListenerObject>;

export default class EventBrowser {
    eventTasks: EventTask = new Map();
    private ctx: Context;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }

    init() {
        this.bind(window, 'resize', this.handleResize.bind(this));
        this.bind(window, 'mouseup', this.handleMouseUp.bind(this));
        this.bind(window, 'mousemove', this.handleMousemove.bind(this));
        this.bind(this.ctx.targetContainer, 'click', this.handleClick.bind(this));
        this.bind(window, 'keydown', this.handleKeydown.bind(this));
        this.bind(this.ctx.targetContainer, 'wheel', this.handleWheel.bind(this));
        this.bind(this.ctx.targetContainer, 'contextmenu', this.handleContextMenu.bind(this));
        this.bind(this.ctx.targetContainer, 'mousedown', this.handleMouseDown.bind(this));
        this.bind(this.ctx.targetContainer, 'mouseenter', this.handleMouseEnter.bind(this));
        this.bind(this.ctx.targetContainer, 'mouseleave', this.handleMouseLeave.bind(this));
        this.bind(this.ctx.targetContainer, 'dblclick', this.handleDblclick.bind(this));
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
        e.preventDefault();
        const _e = e as MouseEvent;
        if (_e.button === 0) {
            this.ctx.mousedown = true;
        }
        this.ctx.emit('mousedown', e);
    }
    private handleMousemove(e: Event) {
        e.preventDefault();
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
        if (!this.ctx.isTarget()) {
            return;
        }
        this.ctx.emit('keydown', e);
    }
    private handleWheel(e: Event) {
        this.ctx.emit('wheel', e);
    }
    private handleContextMenu(e: Event) {
        this.ctx.emit('contextMenu', e);
    }
    private handleMouseEnter(e: Event) {
        this.ctx.isInsideTargetContainer = true;
        this.ctx.emit('mouseenter', e);
    }
    private handleMouseLeave(e: Event) {
        this.ctx.isInsideTargetContainer = false;
        this.ctx.emit('mouseleave', e);
    }
    private handleDblclick(e: Event) {
        this.ctx.emit('dblclick', e);
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
