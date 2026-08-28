import { EventBrowserMap } from "./EventBrowser";

type EventMapWithPrefix<
    T,
    P extends string
> = {
        [K in keyof T as `${K & string}:${P}`]: T[K]
    }
export type EventBusMap = EventMapWithPrefix<EventBrowserMap, 'self'>;

type ListenerEntry = {
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
};

export class EventBus<T extends EventBusMap = EventBusMap> extends EventTarget {
    private listeners = new Set<ListenerEntry>();

    on<K extends keyof T & string>(
        type: K,
        listener: (event: any) => void,
        options?: boolean | AddEventListenerOptions,
    ) {
        this.addEventListener(type, listener as EventListener, options);
        this.listeners.add({ type, listener: listener as EventListener, options });
    }

    off<K extends keyof T & string>(
        type: K,
        listener: (event: any) => void,
        options?: boolean | EventListenerOptions,
    ) {
        this.removeEventListener(type, listener as EventListener, options);
        for (const entry of this.listeners) {
            if (entry.type === type && entry.listener === listener) {
                this.listeners.delete(entry);
                break;
            }
        }
    }

    once<K extends keyof T & string>(
        type: K,
        listener: (event: any) => void,
    ) {
        const wrapped = (event: Event) => {
            this.off(type, wrapped);
            listener(event);
        };
        this.on(type, wrapped);
    }

    emit<K extends keyof T & string>(
        type: K,
        detail?: T[K],
        options?: Omit<CustomEventInit, 'detail'>,
    ): boolean {
        return this.dispatchEvent(new CustomEvent(type, { detail, ...options }));
    }

    offAll() {
        for (const { type, listener, options } of this.listeners) {
            this.removeEventListener(type, listener, options);
        }
        this.listeners.clear();
    }

    destroy() {
        this.offAll();
    }
}
