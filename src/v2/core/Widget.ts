import type Context from "./Context"
import type { EvitListenerMap } from "./EvitListener"
import type { Paint } from "./Paint"

/** 事件名 → 回调参数类型 */
export interface WidgetEventMap extends EvitListenerMap {

}

export type WidgetEventName = keyof WidgetEventMap
export type WidgetEventCallback<K extends WidgetEventName = WidgetEventName> = (
    event: WidgetEventMap[K],
) => void

export interface WidgetEventListenOptions {
    /** 是否禁止向父级冒泡，默认 true */
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
    reserveSpace?: boolean
    on?: {
        [K in WidgetEventName]?: WidgetEventCallback<K>
    }
}

export abstract class Widget {
    private hovered = false
    private listeners = new Map<WidgetEventName, Set<ListenerEntry>>()
    private children: Widget[] = []
    parent: Widget | null = null
    context!: Context
    x = 0
    y = 0
    width = 0
    height = 0
    visible = true
    /** 不可见时仍参与前置排版，用于叶子节点占住树图标位置 */
    reserveSpace = false
    zIndex = 0
    constructor(context: Context, config?: WidgetConfig) {
        this.context = context
        this.x = config?.x ?? 0
        this.y = config?.y ?? 0
        this.width = config?.width ?? 0
        this.height = config?.height ?? 0
        this.visible = config?.visible ?? true
        this.zIndex = config?.zIndex ?? 0
        this.reserveSpace = config?.reserveSpace ?? false
        if (config?.on) {
            for (const [eventName, callback] of Object.entries(config.on)) {
                this.on(eventName as WidgetEventName, callback as WidgetEventCallback)
            }
        }
    }
    setChildren(children: Widget[]) {
        for (const child of this.children) {
            if (child.parent === this) child.parent = null
        }
        this.children = children.sort((a, b) => a.zIndex - b.zIndex)
        for (const child of this.children) child.parent = this
    }
    getChildren() {
        return this.children
    }
    inside(x: number, y: number) {
        return this.visible && x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height
    }
    insideByEvent(event: PointerEvent | MouseEvent | TouchEvent) {
        const { x, y } = this.context.paint.getRelativePosition(event)
        return this.inside(x, y)
    }
    on<K extends WidgetEventName>(
        eventName: K,
        callback: WidgetEventCallback<K>,
        options?: WidgetEventListenOptions,
    ) {
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
     * 无 `:self` 派发给整棵树；`:self` 命中后沿 parent 冒泡（无监听不拦截，有监听默认 stop）。
     * pointerenter / leave 不冒泡，按命中目标及其祖先更新 hover。
     */
    dispatch<K extends WidgetEventName>(eventName: K, event: WidgetEventMap[K]) {
        const widgets = this.flatten()
        let target: Widget | null = null
        for (const widget of widgets) {
            if (widget.visible) widget.invoke(eventName, event)
        }
        for (let i = widgets.length - 1; i >= 0; i--) {
            if (widgets[i].hit(event)) {
                target = widgets[i]
                break
            }
        }
        if (eventName === 'pointermove' || eventName === 'pointerenter' || eventName === 'pointerleave') {
            this.syncHover(widgets, target, event as WidgetEventMap['pointermove'])
            if (eventName !== 'pointermove') return
        }
        const selfName = `${eventName}:self` as WidgetEventName
        for (let node = target; node; node = node.parent) {
            if (node.visible && node.invoke(selfName, event as WidgetEventMap[typeof selfName])) break
        }
    }

    private flatten(list: Widget[] = []) {
        list.push(this)
        for (const child of this.children) child.flatten(list)
        return list
    }
    private hit(event: unknown) {
        if (!this.visible || !event || typeof event !== 'object') return false
        const touch = event as TouchEvent
        if (!('clientX' in event) && !touch.touches?.[0] && !touch.changedTouches?.[0]) return false
        return this.insideByEvent(event as PointerEvent | MouseEvent | TouchEvent)
    }
    private ancestors(node: Widget | null) {
        const list: Widget[] = []
        while (node) {
            list.push(node)
            node = node.parent
        }
        return list
    }
    private syncHover(widgets: Widget[], target: Widget | null, event: WidgetEventMap['pointermove']) {
        const chain = this.ancestors(target)
        const path = new Set(chain)
        for (let i = widgets.length - 1; i >= 0; i--) {
            if (!path.has(widgets[i])) widgets[i].setHover(false, event)
        }
        for (let i = chain.length - 1; i >= 0; i--) chain[i].setHover(true, event)
    }
    private setHover(next: boolean, event: WidgetEventMap['pointermove']) {
        if (this.hovered === next) return
        this.hovered = next
        this.invoke(next ? 'pointerenter:self' : 'pointerleave:self', event)
    }
    /** @returns 是否应停止向父级冒泡 */
    protected invoke<K extends WidgetEventName>(eventName: K, event: WidgetEventMap[K]) {
        const entries = this.listeners.get(eventName)
        if (!entries?.size) return false
        let stop = false
        for (const entry of entries) {
            entry.callback(event)
            if (entry.stopPropagation) stop = true
        }
        return stop
    }
    render(_paint: Paint) { }
    update() {
        this.children.forEach(child => child.update())
    }
    draw() {
        if (!this.visible) return
        this.render(this.context.paint)
        this.children.forEach(child => child.draw())
    }
}
