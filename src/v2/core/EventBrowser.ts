import Context from "./Context";
export interface EventBrowserMap {
    click: MouseEvent
    dblclick: MouseEvent
    pointermove: PointerEvent
    pointerdown: PointerEvent
    pointerup: PointerEvent
    pointerleave: PointerEvent
    pointerenter: PointerEvent
    pointercancel: PointerEvent
}

export type EventBrowserName = keyof EventBrowserMap
export type EventBrowserCallback<K extends EventBrowserName = EventBrowserName> = (
    event: EventBrowserMap[K],
) => void
type ListenerEntry = {
    target: EventTarget;
    name: string;
    fn: EventListenerOrEventListenerObject;
    options?: AddEventListenerOptions | boolean;
};

export default class EventBrowser {
    private context: Context;
    private eventTasks: Set<ListenerEntry> = new Set();
    constructor(context: Context) {
        this.context = context;
        this.init();
    }

    init() {
        this.bind(this.context.stageElement, 'click');
        this.bind(this.context.stageElement, 'dblclick');
        this.bind(this.context.stageElement, 'pointermove');
        this.bind(this.context.stageElement, 'pointerdown');
        this.bind(this.context.stageElement, 'pointerup');
        this.bind(this.context.stageElement, 'pointerleave');
        this.bind(this.context.stageElement, 'pointerenter');
        this.bind(this.context.stageElement, 'pointercancel');
    }
    destroy() {
        const entries = Array.from(this.eventTasks);
        entries.forEach(({ target, name, fn, options }) => {
            this.unbind(target, name, fn, options);
        });
        this.eventTasks.clear();
    }

    private bind(
        target: EventTarget,
        name: EventBrowserName,
        options?: AddEventListenerOptions | boolean,
    ): void {
        const fn = (e: EventBrowserMap[EventBrowserName]) => {
            this.context.eventBus.emit(`${name}:self`, e);
            this.context.paint.dispatchListener(name, e);
        }
        target.addEventListener(name, fn as EventListener, options);
        this.eventTasks.add({ target, name, fn: fn as EventListener, options });
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
