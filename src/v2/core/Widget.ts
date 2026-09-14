import type Context from "./Context"
import { EvitListenerMap } from "./EvitListener"
import type { Paint } from "./Paint"

/** 事件名 → 回调参数类型 */
export interface WidgetEventMap extends EvitListenerMap {

}

export type WidgetEventName = keyof WidgetEventMap
export type WidgetEventCallback<K extends WidgetEventName = WidgetEventName> = (
    event: WidgetEventMap[K],
) => void

/** 注册监听时的选项 */
export interface WidgetEventListenOptions {
    stopPropagation?: boolean
}

interface ListenerEntry {
    callback: WidgetEventCallback
    stopPropagation: boolean
}

export interface WidgetConfig {
    x: number
    y: number
    width: number
    height: number
    visible?: boolean
    zIndex?: number
}

export class Widget {
    private hovered = false
    private listeners = new Map<WidgetEventName, Set<ListenerEntry>>()
    context: Context
    x: number = 0
    y: number = 0
    width: number = 0
    height: number = 0
    visible: boolean = true
    zIndex: number = 0

    constructor(context: Context, config?: WidgetConfig) {
        this.context = context
        this.x = config?.x ?? 0
        this.y = config?.y ?? 0
        this.width = config?.width ?? 0
        this.height = config?.height ?? 0
        this.visible = config?.visible ?? true
        this.zIndex = config?.zIndex ?? 0
        this.context.paint.addWidget(this)
    }
    inside(x: number, y: number): boolean {
        if (!this.visible) return false
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height
    }

    insideByEvent(event: PointerEvent | MouseEvent | TouchEvent): boolean {
        const { x, y } = this.context.paint.getRelativePosition(event)
        return this.inside(x, y)
    }

    on<K extends WidgetEventName>(
        eventName: K,
        callback: WidgetEventCallback<K>,
        options?: WidgetEventListenOptions,
    ): void {
        let set = this.listeners.get(eventName)
        if (!set) {
            set = new Set()
            this.listeners.set(eventName, set)
        }
        set.add({
            callback: callback as WidgetEventCallback,
            stopPropagation: options?.stopPropagation ?? false,
        })
    }

    /**
     * 无 `:self` 后缀的监听始终派发（划选拖出区域后仍需 pointermove / pointerup）。
     * `:self` 仅在命中本 widget 时派发；stopPropagation 只对 `:self` 生效。
     * @returns 是否应停止向更下层 widget 继续分发
     */
    dispatch<K extends WidgetEventName>(eventName: K, event: WidgetEventMap[K]): boolean {
        if (!this.visible) return false

        const pointerEvent = event as PointerEvent | MouseEvent | TouchEvent
        const hasPoint = 'clientX' in pointerEvent || Boolean(
            (pointerEvent as TouchEvent).touches?.[0] || (pointerEvent as TouchEvent).changedTouches?.[0],
        )
        const inside = hasPoint && this.insideByEvent(pointerEvent)

        if (eventName === 'pointermove') {
            const moveEvent = event as WidgetEventMap['pointermove']
            if (!inside && this.hovered) {
                this.invoke('pointerleave:self', moveEvent)
                this.hovered = false
            } else if (inside && !this.hovered) {
                this.invoke('pointerenter:self', moveEvent)
                this.hovered = true
            }
        } else if ((eventName === 'pointerleave' || eventName === 'pointercancel') && this.hovered) {
            this.invoke('pointerleave:self', event as WidgetEventMap['pointerleave:self'])
            this.hovered = false
        }

        this.invoke(eventName, event)
        if (!inside) return false
        const selfName = `${eventName}:self` as WidgetEventName
        return this.invoke(selfName, event as WidgetEventMap[typeof selfName])
    }

    /** @returns 是否有带 stopPropagation 的监听被触发 */
    protected invoke<K extends WidgetEventName>(
        eventName: K,
        event: WidgetEventMap[K],
    ): boolean {
        const entries = this.listeners.get(eventName)
        if (!entries?.size) return false
        let stopped = false
        for (const entry of entries) {
            entry.callback(event)
            if (entry.stopPropagation) stopped = true
        }
        return stopped
    }
    destroy() {
        this.context.paint.removeWidget(this)
    }
    render(_paint: Paint) { }
    update() { }
    draw() {
        if (!this.visible) return
        this.render(this.context.paint)
    }
}
