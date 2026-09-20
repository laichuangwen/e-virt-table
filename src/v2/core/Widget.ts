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
    /** 是否禁止向更下层 widget 冒泡，默认 true */
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
    autoDraw?: boolean
}

export abstract class Widget {
    private hovered = false
    private listeners = new Map<WidgetEventName, Set<ListenerEntry>>()
    private children: Widget[] = []
    context!: Context
    x = 0
    y = 0
    width = 0
    height = 0
    visible = true
    zIndex = 0
    autoDraw = true
    constructor(context: Context, config?: WidgetConfig) {
        this.context = context
        this.x = config?.x ?? 0
        this.y = config?.y ?? 0
        this.width = config?.width ?? 0
        this.height = config?.height ?? 0
        this.visible = config?.visible ?? true
        this.zIndex = config?.zIndex ?? 0
        this.autoDraw = config?.autoDraw ?? true
        if (this.autoDraw) {
            this.context.paint.addWidget(this)
        }
    }
    setChildren(children: Widget[]) {
        this.children = children
    }
    getChildren(): Widget[] {
        return this.children;
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
            stopPropagation: options?.stopPropagation ?? true,
        })
    }

    /**
     * 无 `:self` 后缀的监听始终派发（划选拖出区域后仍需 pointermove / pointerup）。
     * `:self` 仅在命中本 widget 时派发；命中后默认 stopPropagation，避免被遮挡的下层仍触发 pointerenter:self。
     * @returns 是否应停止向更下层 widget 继续分发
     */
    dispatch<K extends WidgetEventName>(eventName: K, event: WidgetEventMap[K]): boolean {
        if (!this.visible) return false
        this.invoke(eventName, event)
        const pointerEvent = event as PointerEvent | MouseEvent | TouchEvent
        const hasPoint = 'clientX' in pointerEvent || Boolean(
            (pointerEvent as TouchEvent).touches?.[0] || (pointerEvent as TouchEvent).changedTouches?.[0],
        )
        const inside = hasPoint && this.insideByEvent(pointerEvent)
        // 因为事件代理重新派发 pointerleave / pointerenter 是失效的，用 pointermove 判断；return 防止重复派发
        if (['pointermove', 'pointerleave', 'pointerenter'].includes(eventName)) {
            const moveEvent = event as WidgetEventMap['pointermove']
            if (!inside && this.hovered) {
                this.hovered = false
                this.invoke('pointerleave:self', moveEvent)
                return false
            } else if (inside && !this.hovered) {
                this.hovered = true
                this.invoke('pointerenter:self', moveEvent)
                return this.shouldStopPropagation('pointerenter:self')
            }
        }
        if (!inside) return false
        const selfName = `${eventName}:self` as WidgetEventName
        this.invoke(selfName, event as WidgetEventMap[typeof selfName])
        return this.shouldStopPropagation(selfName)
    }

    /** 命中后默认拦截；仅当所有 :self 监听都显式 stopPropagation: false 时才继续向下分发 */
    private shouldStopPropagation(eventName: WidgetEventName): boolean {
        const entries = this.listeners.get(eventName)
        if (!entries?.size) return true
        for (const entry of entries) {
            if (entry.stopPropagation) return true
        }
        return false
    }

    protected invoke<K extends WidgetEventName>(
        eventName: K,
        event: WidgetEventMap[K],
    ): void {
        const entries = this.listeners.get(eventName)
        if (!entries?.size) return
        for (const entry of entries) {
            entry.callback(event)
        }
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
