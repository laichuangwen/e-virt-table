export type EventCallback = (...args: any[]) => void;

type EventMap = Map<string, EventCallback[]>;

class EventBus {
  private events: EventMap = new Map();
  constructor() {}
  has(event: string): boolean {
    return this.events.has(event);
  }
  // 订阅事件
  on(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event) || [];
    callbacks.push(callback);
    this.events.set(event, callbacks);
  }
  // 一次性订阅事件
  once(event: string, callback: EventCallback) {
    const onceCallback: EventCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
    return this;
  }
  // 取消订阅事件
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index >= 0) {
        callbacks.splice(index, 1);
        if (callbacks.length === 0) {
          this.events.delete(event);
        } else {
          this.events.set(event, callbacks);
        }
      }
    }
  }
  // 发布事件
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(...args);
      });
    }
  }

  destroy(): void {
    this.events.clear();
  }
}
export default EventBus;
