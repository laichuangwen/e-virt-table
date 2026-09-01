import type Context from "./Context"
import { EvitListenerMap } from "./EvitListener"
import type { Paint } from "./Paint"

/** 事件名 → 回调参数类型 */
export interface ShapeEventMap extends EvitListenerMap {

}

export type ShapeEventName = keyof ShapeEventMap
export type ShapeEventCallback<K extends ShapeEventName = ShapeEventName> = (
    event: ShapeEventMap[K],
) => void

/** 注册监听时的选项 */
export interface ShapeEventListenOptions {
    stopPropagation?: boolean
}

interface ListenerEntry {
    callback: ShapeEventCallback
    stopPropagation: boolean
}

export interface ShapeConfig {
    x: number
    y: number
    width: number
    height: number
    visible?: boolean
    zIndex?: number
}

export abstract class Shape {
    private hovered = false
    private listeners = new Map<ShapeEventName, Set<ListenerEntry>>()
    context: Context
    x: number = 0
    y: number = 0
    width: number = 0
    height: number = 0
    visible: boolean = true
    zIndex: number = 0

    constructor(context: Context, config: ShapeConfig) {
        this.context = context
        this.x = config.x
        this.y = config.y
        this.width = config.width
        this.height = config.height
        this.visible = config.visible ?? true
        this.zIndex = config.zIndex ?? 0
        this.context.paint.addShape(this)
    }

    abstract render(paint: Paint): void

    inside(x: number, y: number): boolean {
        if (!this.visible) return false
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height
    }

    insideByEvent(event: PointerEvent | MouseEvent): boolean {
        const { x, y } = this.context.paint.getRelativePosition(event)
        return this.inside(x, y)
    }

    on<K extends ShapeEventName>(
        eventName: K,
        callback: ShapeEventCallback<K>,
        options?: ShapeEventListenOptions,
    ): void {
        let set = this.listeners.get(eventName)
        if (!set) {
            set = new Set()
            this.listeners.set(eventName, set)
        }
        set.add({
            callback: callback as ShapeEventCallback,
            stopPropagation: options?.stopPropagation ?? false,
        })
    }

    /**
     * 无 `:self` 后缀的监听始终派发（划选拖出区域后仍需 pointermove / pointerup）。
     * `:self` 仅在命中本 shape 时派发；stopPropagation 只对 `:self` 生效。
     * @returns 是否应停止向更下层 shape 继续分发
     */
    dispatch<K extends ShapeEventName>(eventName: K, event: ShapeEventMap[K]): boolean {
        if (!this.visible) return false

        const pointerEvent = event as PointerEvent | MouseEvent
        const inside = 'clientX' in pointerEvent && this.insideByEvent(pointerEvent)

        if (eventName === 'pointermove') {
            const moveEvent = event as ShapeEventMap['pointermove']
            if (!inside && this.hovered) {
                this.invoke('pointerleave:self', moveEvent)
                this.hovered = false
            } else if (inside && !this.hovered) {
                this.invoke('pointerenter:self', moveEvent)
                this.hovered = true
            }
        }

        this.invoke(eventName, event)
        if (!inside) return false
        const selfName = `${eventName}:self` as ShapeEventName
        return this.invoke(selfName, event as ShapeEventMap[typeof selfName])
    }

    /** @returns 是否有带 stopPropagation 的监听被触发 */
    protected invoke<K extends ShapeEventName>(
        eventName: K,
        event: ShapeEventMap[K],
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

    draw() {
        if (!this.visible) return
        this.render(this.context.paint)
    }
}
