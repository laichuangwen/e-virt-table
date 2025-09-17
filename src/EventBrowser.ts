import Context from './Context';

type ListenerEntry = {
    target: EventTarget;
    name: string;
    fn: EventListenerOrEventListenerObject;
    options?: AddEventListenerOptions | boolean;
};

export default class EventBrowser {
    private eventTasks: Set<ListenerEntry> = new Set();
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
        this.bind(this.ctx.stageElement, 'wheel', this.handleWheel.bind(this), { passive: false });
        this.bind(this.ctx.stageElement, 'touchstart', this.handleTouchstart.bind(this), { passive: false });
        this.bind(this.ctx.stageElement, 'touchend', this.handleTouchend.bind(this));
        this.bind(this.ctx.stageElement, 'touchmove', this.handleTouchmove.bind(this), { passive: false });
        this.bind(this.ctx.stageElement, 'contextmenu', this.handleContextMenu.bind(this));
        this.bind(this.ctx.stageElement, 'mousedown', this.handleMouseDown.bind(this));
        this.bind(this.ctx.stageElement, 'dblclick', this.handleDblclick.bind(this));
        this.bind(this.ctx.stageElement, 'mouseover', this.handleMouseover.bind(this));
        this.bind(this.ctx.stageElement, 'mouseout', this.handleMouseout.bind(this));
        this.bind(document, 'selectionchange', this.selectionchange.bind(this));
    }
    private selectionchange() {
        this.ctx.domSelectionStr = '';
        const selection = window.getSelection();
        if (selection && selection.toString()) {
            this.ctx.domSelectionStr = selection.toString();
        }

    }
    private clearDomSelection() {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            selection.removeAllRanges();
        }
    }
    destroy() {
        const entries = Array.from(this.eventTasks);
        entries.forEach(({ target, name, fn, options }) => {
            this.unbind(target, name, fn, options);
        });
        this.eventTasks.clear();
    }
    private handleResize(e: Event) {
        this.ctx.emit('resetHeader', e);
        this.ctx.emit('resize', e);
    }
    private handleMouseDown(e: Event) {
        this.clearDomSelection();
        const _e = e as MouseEvent;
        if (_e.button === 0) {
            this.ctx.mousedown = true;
        }
        this.ctx.containerElement.focus({ preventScroll: true });
        this.ctx.emit('mousedown', e);
    }
    private handleMousemove(e: Event) {
        const _e = e as MouseEvent;
        const rect = this.ctx.containerElement.getBoundingClientRect();
        const x = _e.clientX - rect.left;
        const y = _e.clientY - rect.top;
        this.ctx.mouseX = x;
        this.ctx.mouseY = y;
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
        // 拖拽表头中不处理
        if(this.ctx.dragHeaderIng){
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
        e.preventDefault();
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
        this.eventTasks.add({ target, name, fn, options });
    }

    private unbind(target: EventTarget, name: string, fn: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void {
        target.removeEventListener(name, fn as EventListener, options as any);
        for (const entry of this.eventTasks) {
            if (entry.target === target && entry.name === name && entry.fn === fn) {
                this.eventTasks.delete(entry);
                break;
            }
        }
    }
}
