import Context from "./Context";

type WithPrefix<
    T,
    P extends string
> = {
        [K in keyof T as `${K & string}:${P}`]: T[K]
    }
type NativeListenertMap = {
    resize: ResizeObserverEntry;
    wheel: WheelEvent
    click: MouseEvent
    dblclick: MouseEvent
    keydown: KeyboardEvent
    touchmove: TouchEvent
    touchstart: TouchEvent
    pointermove: PointerEvent
    pointerdown: PointerEvent
    pointerup: PointerEvent
    pointerleave: PointerEvent
    pointerenter: PointerEvent
    pointercancel: PointerEvent
    resizeObserver: ResizeObserverEntry[]
}
type SelfListenertMap = WithPrefix<NativeListenertMap, 'self'>;
type CustomListenertMap = {
    containerResize: HTMLDivElement;
    'pointerenter:table': PointerEvent;
    'pointerleave:table': PointerEvent;
}
export type EvitListenerMap = NativeListenertMap & SelfListenertMap & CustomListenertMap;
export type EvitListenerName = keyof EvitListenerMap
export type EvitListenerCallback<K extends EvitListenerName = EvitListenerName> = (
    event: EvitListenerMap[K],
) => void

type NativeBinding = {
    target: EventTarget;
    name: string;
    fn: EventListener;
    options?: AddEventListenerOptions | boolean;
};

type ListenerRecord = {
    callback: EvitListenerCallback;
    once: boolean;
};

export default class EvitListener {
    private context: Context;
    private nativeListenerTasks: Set<NativeBinding> = new Set();
    private listeners = new Map<EvitListenerName, Set<ListenerRecord>>();
    private resizeObserver!: ResizeObserver;
    constructor(context: Context) {
        this.context = context;
        this.init();
    }
    private init() {
        this.resizeObserver = new ResizeObserver((entries) => {
            this.context.initWH();
            this.emit('resizeObserver', entries);
        });
        this.resizeObserver.observe(this.context.containerElement);
        this.bind(window, 'pointerdown');
        this.bind(window, 'pointermove');
        this.bind(window, 'pointerup');
        this.bind(window, 'resize');
        this.bind(this.context.stageElement, 'wheel', { passive: false });
        this.bind(this.context.stageElement, 'touchstart', { passive: false });
        this.bind(this.context.stageElement, 'touchmove', { passive: false });
        this.bind(this.context.stageElement, 'click');
        this.bind(this.context.stageElement, 'dblclick');
        this.bind(this.context.stageElement, 'pointerleave');
        this.bind(this.context.stageElement, 'pointerenter');
        this.bind(this.context.stageElement, 'pointercancel');
        this.bind(this.context.containerElement, 'keydown');
        this.on('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {
                this.context.copyTextSelection(e);
            }
        });
    }
    private bind(
        target: EventTarget,
        name: keyof NativeListenertMap,
        options?: AddEventListenerOptions | boolean,
    ): void {
        const fn = (e: NativeListenertMap[typeof name]) => {
            this.emit(name, e);
            const allWidgets = this.context.table.getAllWidgets();
            for (let i = allWidgets.length - 1; i >= 0; i--) {
                if (allWidgets[i].dispatch(name, e)) break
            }
        }
        target.addEventListener(name, fn as EventListener, options);
        this.nativeListenerTasks.add({ target, name, fn: fn as EventListener, options });
    }

    private unbind(target: EventTarget, name: string, fn: EventListener, options?: AddEventListenerOptions | boolean): void {
        target.removeEventListener(name, fn, options as EventListenerOptions | boolean);
        for (const entry of this.nativeListenerTasks) {
            if (entry.target === target && entry.name === name && entry.fn === fn) {
                this.nativeListenerTasks.delete(entry);
                break;
            }
        }
    }

    on<K extends EvitListenerName>(
        name: K,
        callback: EvitListenerCallback<K>,
    ): this {
        let set = this.listeners.get(name);
        if (!set) {
            set = new Set();
            this.listeners.set(name, set);
        }
        set.add({ callback: callback as EvitListenerCallback, once: false });
        return this;
    }

    off<K extends EvitListenerName>(
        name: K,
        callback?: EvitListenerCallback<K>,
    ): this {
        const set = this.listeners.get(name);
        if (!set) return this;
        if (!callback) {
            this.listeners.delete(name);
            return this;
        }
        for (const entry of set) {
            if (entry.callback === callback) {
                set.delete(entry);
            }
        }
        if (set.size === 0) this.listeners.delete(name);
        return this;
    }

    once<K extends EvitListenerName>(
        name: K,
        callback: EvitListenerCallback<K>,
    ): this {
        let set = this.listeners.get(name);
        if (!set) {
            set = new Set();
            this.listeners.set(name, set);
        }
        set.add({ callback: callback as EvitListenerCallback, once: true });
        return this;
    }

    emit<K extends EvitListenerName>(
        name: K,
        event: EvitListenerMap[K],
    ): this {
        const set = this.listeners.get(name);
        if (!set?.size) return this;
        for (const entry of [...set]) {
            if (entry.once) set.delete(entry);
            (entry.callback as EvitListenerCallback<K>)(event);
        }
        if (set.size === 0) this.listeners.delete(name);
        return this;
    }

    offAll() {
        this.listeners.clear();
    }

    destroy() {
        this.resizeObserver.disconnect();
        this.offAll();
        const entries = Array.from(this.nativeListenerTasks);
        entries.forEach(({ target, name, fn, options }) => {
            this.unbind(target, name, fn, options);
        });
        this.nativeListenerTasks.clear();
    }
}
