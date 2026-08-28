import { EventBrowserMap } from "./EventBrowser"
import { Paint } from "./Paint"

/** 事件名 → 回调参数类型 */
export interface ShapeEventMap extends EventBrowserMap {

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
    paint: Paint = null!
    x: number = 0
    y: number = 0
    width: number = 0
    height: number = 0
    visible: boolean = true
    zIndex: number = 0

    constructor(paint: Paint, config: ShapeConfig) {
        this.paint = paint
        this.x = config.x
        this.y = config.y
        this.width = config.width
        this.height = config.height
        this.visible = config.visible ?? true
        this.zIndex = config.zIndex ?? 0
        this.paint.addShape(this)
    }

    abstract render(paint: Paint): void

    inside(x: number, y: number): boolean {
        if (!this.visible) return false
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height
    }

    insideByEvent(event: PointerEvent | MouseEvent): boolean {
        const { x, y } = this.paint.getRelativePosition(event)
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
     * @returns 是否应停止向更下层 shape 继续分发
     */
    dispatch<K extends ShapeEventName>(eventName: K, event: ShapeEventMap[K]): boolean {
        if (!this.visible) return false
        // 不在区域内
        if (!this.insideByEvent(event)) {
            // 模拟 pointerleave
            if (eventName === 'pointermove' && this.hovered) {
                this.invoke('pointerleave', event as ShapeEventMap['pointerleave'])
                this.hovered = false
            }
            return false
        }
        // 模拟 pointerenter
        if (eventName === 'pointermove' && !this.hovered) {
            this.invoke('pointerenter', event as ShapeEventMap['pointerenter'])
            this.hovered = true
        }
        return this.invoke(eventName, event)
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
        this.render(this.paint)
    }
}
