import { Align, LineClampType, Padding, PaddingInput, VerticalAlign } from '../types'
import type Context from './Context'
import type { Paint } from './Paint'
import { Widget, type WidgetConfig } from './Widget'
export interface TextConfig extends WidgetConfig {
  text: string
  /** 划选稳定标识；Header/Body 重建 Text 后仍能续上选区 */
  selectionKey?: string
  padding?: PaddingInput
  maxLineClamp?: LineClampType
  autoRowHeight?: boolean
  onAutoHeight?: (height: number) => void
  align?: Align
  verticalAlign?: VerticalAlign
  fontSize?: number
  fontWeight?: string
  fontStyle?: string
  fontVariant?: string
  font?: string
  lineHeight?: number
  color?: string
  selectionColor?: string
  beforeWidgets?: Widget[]
  afterWidgets?: Widget[]
  widgetGap?: number
  /** 内容区左侧额外占位 */
  offsetLeft?: number
  /** 内容区右侧额外占位 */
  offsetRight?: number
  /** 内容区顶部额外占位 */
  offsetTop?: number
  /** 内容区底部额外占位 */
  offsetBottom?: number
}

export interface TextSelectionRange {
  start: number
  end: number
}

export interface DrawTextResult {
  height: number
  neededHeight: number
  lines: number
  clamped: boolean
  flatText: string
}

export interface SplitTextProps {
  ctx: CanvasRenderingContext2D
  text: string
  width: number
  firstLineWidth?: number
}

export interface GetTextHeightProps {
  ctx: CanvasRenderingContext2D
  text: string
  style: string
  fallback?: number
}

interface ContentBox {
  x: number
  y: number
  width: number
  height: number
  contentX: number
  contentY: number
  contentWidth: number
  contentHeight: number
  contentXEnd: number
  contentYEnd: number
  beforeWidgetsWidth: number
  afterWidgetsWidth: number
}

interface LayoutLine {
  text: string
  x: number
  y: number
  width: number
  height: number
  edges: number[]
  flatStart: number
  ellipsisStart: number | null
}

interface TextLayout {
  lines: LayoutLine[]
  flatText: string
  charHeight: number
  startY: number
  neededHeight: number
  clamped: boolean
  afterOnNextLine: boolean
}

const ELLIPSIS = '...'
const DEFAULT_SELECTION_COLOR = '#B4D7FF'

const defaultTextOptions = {
  align: 'center' as Align,
  verticalAlign: 'middle' as VerticalAlign,
  fontSize: 14,
  fontWeight: '',
  fontStyle: '',
  fontVariant: '',
  font: 'Arial',
  lineHeight: undefined as number | undefined,
  color: undefined as string | undefined,
  padding: 0 as PaddingInput,
  maxLineClamp: 'auto' as LineClampType,
  autoRowHeight: false,
  onAutoHeight: undefined as ((height: number) => void) | undefined,
  selectionColor: DEFAULT_SELECTION_COLOR,
  widgetGap: 4,
  type: 'text' as 'text' | 'link',
  offsetLeft: 0,
  offsetRight: 0,
  offsetTop: 0,
  offsetBottom: 0,
}

type ResolvedTextOptions = typeof defaultTextOptions

const EMPTY_LAYOUT: TextLayout = {
  lines: [],
  flatText: '',
  charHeight: 0,
  startY: 0,
  neededHeight: 0,
  clamped: false,
  afterOnNextLine: false,
}

const EMPTY_RESULT: DrawTextResult = {
  height: 0,
  neededHeight: 0,
  lines: 0,
  clamped: false,
  flatText: '',
}

function normalizePadding(padding: PaddingInput = 0): Padding {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding }
  }
  return {
    top: padding.top ?? 0,
    right: padding.right ?? 0,
    bottom: padding.bottom ?? 0,
    left: padding.left ?? 0,
  }
}

function linesHeight(lineCount: number, charHeight: number): number {
  return lineCount <= 0 ? 0 : charHeight * lineCount
}

function selectableLength(line: LayoutLine): number {
  return line.ellipsisStart ?? line.text.length
}

function isAsciiWordChar(ch: string | undefined): boolean {
  if (!ch) return false
  const code = ch.charCodeAt(0)
  return (
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122)
  )
}

function findFitLength(
  measure: (value: string) => number,
  text: string,
  maxWidth: number
): number {
  if (text.length <= 1) return text.length
  if (measure(text) <= maxWidth) return text.length
  let low = 1
  let high = text.length
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (measure(text.slice(0, mid)) <= maxWidth) low = mid
    else high = mid - 1
  }
  return Math.max(1, low)
}

function createMeasureCache(ctx: CanvasRenderingContext2D) {
  const cache = new Map<string, number>()
  return (value: string): number => {
    const hit = cache.get(value)
    if (hit !== undefined) return hit
    const width = ctx.measureText(value).width
    cache.set(value, width)
    return width
  }
}

function getTextHeight({
  ctx,
  text,
  style,
  fallback = 0,
}: GetTextHeightProps): number {
  const prevBaseline = ctx.textBaseline
  const prevFont = ctx.font
  ctx.textBaseline = 'alphabetic'
  ctx.font = style
  const metrics = ctx.measureText(text)
  const height =
    (metrics.actualBoundingBoxAscent || 0) +
    (metrics.actualBoundingBoxDescent || 0)

  ctx.textBaseline = prevBaseline
  ctx.font = prevFont
  return height > 0 ? height * 1.2 : fallback
}

function splitText({
  ctx,
  text,
  width,
  firstLineWidth,
}: SplitTextProps): string[] {
  const measure = createMeasureCache(ctx)
  const lines: string[] = []
  let isFirstLine = true
  const maxWidthOf = () =>
    isFirstLine && firstLineWidth != null ? firstLineWidth : width

  for (const paragraph of text.split('\n')) {

    if (!paragraph) {
      lines.push('')
      isFirstLine = false
      continue
    }
    let remaining = paragraph
    while (remaining) {
      const maxW = maxWidthOf()
      if (measure(remaining) <= maxW) {
        lines.push(remaining)
        isFirstLine = false
        break
      }
      let splitPoint = findFitLength(measure, remaining, maxW)

      if (
        splitPoint < remaining.length &&
        isAsciiWordChar(remaining[splitPoint - 1]) &&
        isAsciiWordChar(remaining[splitPoint])
      ) {
        const lastSpace = remaining.slice(0, splitPoint).lastIndexOf(' ')
        if (lastSpace > 0) splitPoint = lastSpace
      }
      let line = remaining.slice(0, splitPoint)
      while (line.length > 1 && measure(line) > maxW) {
        line = line.slice(0, -1)
        splitPoint = line.length
      }
      remaining = remaining.slice(splitPoint).replace(/^\s+/, '')
      lines.push(line.trimEnd())
      isFirstLine = false
    }
  }
  return lines
}

function truncateWithEllipsis(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (maxWidth <= 0) return ''

  const base = text.replace(/\.{3}$/, '').trimEnd()
  const withEllipsis = `${base}${ELLIPSIS}`
  if (ctx.measureText(withEllipsis).width <= maxWidth) return withEllipsis
  const ellipsisWidth = ctx.measureText(ELLIPSIS).width
  if (ellipsisWidth >= maxWidth) return ELLIPSIS
  let low = 0
  let high = base.length
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (ctx.measureText(base.slice(0, mid)).width + ellipsisWidth <= maxWidth) {
      low = mid
    } else {
      high = mid - 1
    }
  }
  return `${base.slice(0, low).trimEnd()}${ELLIPSIS}`
}

function clampLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxLineClamp: number | undefined,
  contentWidth: number
): { lines: string[]; clamped: boolean } {
  if (maxLineClamp == null || lines.length <= maxLineClamp) {
    return { lines, clamped: false }
  }
  if (maxLineClamp <= 0) {
    return { lines: [], clamped: true }
  }
  const clamped = lines.slice(0, maxLineClamp)
  const last = clamped.length - 1
  clamped[last] = truncateWithEllipsis(ctx, clamped[last], contentWidth)
  return { lines: clamped, clamped: true }
}

function widgetsSpanWidth(widgets: Widget[], gap: number): number {
  if (widgets.length === 0) return 0
  return widgets.reduce((sum, widget, i) => {
    return sum + widget.width + (i < widgets.length - 1 ? gap : 0)
  }, 0)
}

function measureWidgetsWidth(widgets: Widget[], gap: number): number {
  return widgets.length === 0 ? 0 : widgetsSpanWidth(widgets, gap) + gap
}

function measureEdges(ctx: CanvasRenderingContext2D, text: string): number[] {
  const edges = [0]
  for (let i = 1; i <= text.length; i++) {
    edges.push(ctx.measureText(text.slice(0, i)).width)
  }
  return edges
}

function alignTextX(
  align: Align,
  boxX: number,
  boxW: number,
  textW: number
): number {
  if (align === 'right') return boxX + boxW - textW
  if (align === 'left') return boxX
  return boxX + (boxW - textW) / 2
}

export default class Text extends Widget {
  text: string
  readonly selectionKey: string
  private readonly options: ResolvedTextOptions
  private readonly pad: Padding
  private readonly box: ContentBox
  private readonly beforeWidgets: Widget[]
  private readonly afterWidgets: Widget[]
  private layoutCache: TextLayout | null = null
  private result: DrawTextResult = EMPTY_RESULT
  constructor(context: Context, config: TextConfig) {
    super(context, config)
    this.text = config.text
    this.selectionKey = config.selectionKey ?? `text:${config.x},${config.y},${config.text}`
    this.options = { ...defaultTextOptions, ...config }
    this.pad = normalizePadding(this.options.padding)
    this.beforeWidgets = (config.beforeWidgets ?? []).filter((widget) => widget.visible)
    this.afterWidgets = (config.afterWidgets ?? []).filter((widget) => widget.visible)
    this.box = this.createContentBox()
    this.setChildren([...this.beforeWidgets, ...this.afterWidgets])
    this.on('pointerdown', (e) => this.handlePointerDown(e))
    this.on('pointermove', (e) => this.handlePointerMove(e))
    this.on('pointerup', (e) => this.handlePointerUp(e))
  }
  getDrawResult(): DrawTextResult {
    return this.result
  }
  getBeforeWidgets(): Widget[] {
    return this.beforeWidgets
  }
  getAfterWidgets(): Widget[] {
    return this.afterWidgets
  }
  getWidgets(): Widget[] {
    return [...this.beforeWidgets, ...this.afterWidgets]
  }

  render(paint: Paint): void {
    if (!this.isValid()) {
      this.result = EMPTY_RESULT
      return
    }
    const ctx = paint.getCtx()
    const layout = this.ensureLayout(ctx)
    const { lines, charHeight, flatText, neededHeight, clamped } = layout

    if (this.options.autoRowHeight) {
      const neededBoxHeight =
        neededHeight +
        this.pad.top +
        this.pad.bottom +
        this.options.offsetTop +
        this.options.offsetBottom
      this.options.onAutoHeight?.(Math.ceil(neededBoxHeight))
    }
    const drawnHeight =
      linesHeight(lines.length, charHeight) +
      (layout.afterOnNextLine ? charHeight : 0)

    this.layoutWidgets(lines, layout.afterOnNextLine)
    this.paintSelection(ctx, layout)
    this.paintLines(ctx, lines)
    // this.paintWidgets()
    this.result = {
      height: drawnHeight,
      neededHeight,
      lines: lines.length,
      clamped,
      flatText,
    }
  }

  private isSelecting(): boolean {
    return (
      this.context.textSelecting &&
      this.context.textSelectionKey === this.selectionKey
    )
  }

  private isActiveSelection(): boolean {
    return this.context.textSelectionKey === this.selectionKey
  }

  private emitSelectionChange(): void {
    this.context.textSelectionStr = this.getSelectedText()
    this.context.draw()
  }
  private getSelectedText(): string {
    const layout = this.ensureLayout(this.context.paint.getCtx())
    const range = this.normalizedSelection(layout.flatText.length)
    return range ? layout.flatText.slice(range.start, range.end) : ''
  }

  private getSelectableEnd(layout: TextLayout): number {
    const line = layout.lines.find((l) => l.ellipsisStart != null)
    return line
      ? line.flatStart + line.ellipsisStart!
      : layout.flatText.length
  }

  private clampIndexBeforeEllipsis(index: number, lines: LayoutLine[]): number {
    for (const line of lines) {
      if (line.ellipsisStart == null) continue
      const ellStart = line.flatStart + line.ellipsisStart
      if (index > ellStart) return ellStart
    }
    return index
  }

  private normalizedSelection(flatLen?: number): TextSelectionRange | null {
    if (!this.isActiveSelection()) return null
    const layout = this.ensureLayout(this.context.paint.getCtx())
    const len = Math.min(
      flatLen ?? layout.flatText.length,
      this.getSelectableEnd(layout)
    )
    const { textSelAnchor, textSelFocus } = this.context
    let start = Math.max(0, Math.min(textSelAnchor, textSelFocus, len))
    let end = Math.max(0, Math.min(Math.max(textSelAnchor, textSelFocus), len))
    start = this.clampIndexBeforeEllipsis(start, layout.lines)
    end = this.clampIndexBeforeEllipsis(end, layout.lines)
    return start >= end ? null : { start, end }
  }

  private hitTest(x: number, y: number): number {
    const layout = this.ensureLayout(this.context.paint.getCtx())
    const { lines } = layout
    if (lines.length === 0) return 0
    const first = lines[0]
    const last = lines[lines.length - 1]
    if (y < first.y) return 0
    if (y >= last.y + last.height) return this.getSelectableEnd(layout)
    const line = this.findLineAtY(lines, y)
    const limit = selectableLength(line)
    const localX = x - line.x
    if (localX <= 0) return line.flatStart
    if (localX >= line.edges[limit]) return line.flatStart + limit

    for (let i = 0; i < limit; i++) {
      if (localX < (line.edges[i] + line.edges[i + 1]) / 2) {
        return line.flatStart + i
      }
    }
    return line.flatStart + limit
  }

  private findLineAtY(lines: LayoutLine[], y: number): LayoutLine {
    let line = lines[0]
    for (const candidate of lines) {
      if (y >= candidate.y && y < candidate.y + candidate.height) return candidate
      if (y >= candidate.y) line = candidate
    }
    return line
  }
  private handlePointerDown(e: PointerEvent): void {
    if (e.button !== 0) return
    e.preventDefault()
    if (!this.insideByEvent(e)) {
      return;
    }
    const { x, y } = this.context.paint.getRelativePosition(e)
    const index = this.hitTest(x, y)
    this.context.textSelectionKey = this.selectionKey
    this.context.textSelAnchor = index
    this.context.textSelFocus = index
    this.context.textSelecting = true

    if (e.currentTarget instanceof Element) {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    this.emitSelectionChange()
  }
  private handlePointerMove(e: PointerEvent): void {
    if (!this.isSelecting()) return
    if ((e.buttons & 1) === 0) {
      this.handlePointerUp(e)
      return
    }
    const { x, y } = this.context.paint.getRelativePosition(e)
    const next = this.hitTest(x, y)
    if (next === this.context.textSelFocus) return
    this.context.textSelFocus = next
    this.emitSelectionChange()
  }
  private handlePointerUp(e?: PointerEvent): void {
    if (!this.isSelecting()) return
    this.context.textSelecting = false
    this.context.textSelectionStr = this.getSelectedText()
    const target = e?.currentTarget
    if (target instanceof Element && e && target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId)
    }
  }

  private createContentBox(): ContentBox {
    const { x, y, width, height } = this
    const { left, top, right, bottom } = this.pad
    const { offsetLeft, offsetRight, offsetTop, offsetBottom } = this.options
    const contentX = x + left + offsetLeft
    const contentY = y + top + offsetTop
    const contentWidth = width - left - right - offsetLeft - offsetRight
    const contentHeight = height - top - bottom - offsetTop - offsetBottom
    const gap = this.options.widgetGap
    return {
      x,
      y,
      width,
      height,
      contentX,
      contentY,
      contentWidth,
      contentHeight,
      contentXEnd: contentX + contentWidth,
      contentYEnd: contentY + contentHeight,
      beforeWidgetsWidth: measureWidgetsWidth(this.beforeWidgets, gap),
      afterWidgetsWidth: measureWidgetsWidth(this.afterWidgets, gap),
    }
  }

  private isValid(): boolean {
    const { width, height } = this
    const { fontSize } = this.options
    const { contentWidth, contentHeight, beforeWidgetsWidth } = this.box
    return (
      width > 0 &&
      height > 0 &&
      fontSize > 0 &&
      contentWidth > 0 &&
      contentHeight > 0 &&
      contentWidth - beforeWidgetsWidth > 0
    )
  }
  private buildFontStyle(): string {
    const { fontStyle, fontVariant, fontWeight, fontSize, font } = this.options
    return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${font}`.trim()
  }

  private measureCharHeight(
    ctx: CanvasRenderingContext2D,
    style: string
  ): number {
    const { lineHeight, fontSize } = this.options
    if (lineHeight != null) return lineHeight
    return Math.max(
      getTextHeight({ ctx, text: 'Mg', style, fallback: fontSize }),
      fontSize
    )
  }

  private ensureLayout(ctx: CanvasRenderingContext2D): TextLayout {
    if (this.layoutCache) return this.layoutCache
    if (!this.isValid()) {
      this.layoutCache = EMPTY_LAYOUT
      return this.layoutCache
    }
    const { options, box } = this
    const style = this.buildFontStyle()
    ctx.font = style
    const charHeight = this.measureCharHeight(ctx, style)
    const prepared = this.prepareLines(ctx, charHeight)
    const afterOnNextLine = this.willPlaceAfterOnNextLine(ctx, prepared.lines)
    const drawnHeight =
      linesHeight(prepared.lines.length, charHeight) +
      (afterOnNextLine ? charHeight : 0)
    const startY = this.resolveVerticalAlign(drawnHeight)
    const { contentX, contentWidth, beforeWidgetsWidth, afterWidgetsWidth } = box
    const afterOnSameLine = !afterOnNextLine && this.afterWidgets.length > 0
    const layoutLines: LayoutLine[] = []
    let flatStart = 0
    let txtY = startY
    const lineCount = prepared.lines.length
    for (let i = 0; i < lineCount; i++) {
      const text = prepared.lines[i].trimEnd()
      const width = text ? ctx.measureText(text).width : 0
      const lead = i === 0 ? beforeWidgetsWidth : 0
      const trail =
        i === lineCount - 1 && afterOnSameLine ? afterWidgetsWidth : 0
      const lineBoxX = contentX + lead
      const lineBoxW = Math.max(0, contentWidth - lead - trail)
      layoutLines.push({
        text,
        x: alignTextX(options.align, lineBoxX, lineBoxW, width),
        y: txtY,
        width,
        height: charHeight,
        edges: measureEdges(ctx, text),
        flatStart,
        ellipsisStart: null,
      })

      flatStart += text.length + (i < lineCount - 1 ? 1 : 0)
      txtY += charHeight
    }

    if (prepared.clamped && layoutLines.length > 0) {
      const lastLine = layoutLines[layoutLines.length - 1]
      if (lastLine.text.endsWith(ELLIPSIS)) {
        lastLine.ellipsisStart = lastLine.text.length - ELLIPSIS.length
      }
    }
    this.layoutCache = {
      lines: layoutLines,
      flatText: layoutLines.map((l) => l.text).join('\n'),
      charHeight,
      startY,
      neededHeight: prepared.neededHeight + (afterOnNextLine ? charHeight : 0),
      clamped: prepared.clamped,
      afterOnNextLine,
    }
    return this.layoutCache
  }

  private prepareLines(
    ctx: CanvasRenderingContext2D,
    charHeight: number
  ): { lines: string[]; clamped: boolean; neededHeight: number } {
    const { text, options, box } = this
    const { contentWidth, contentHeight, beforeWidgetsWidth, afterWidgetsWidth } =
      box

    const firstLineWidth = Math.max(0, contentWidth - beforeWidgetsWidth)
    // 高度连一行都放不下时仍保留 1 行，避免空白，改画省略号
    const fitLines = options.autoRowHeight
      ? undefined
      : Math.floor(contentHeight / charHeight)
    const maxLinesByHeight =
      fitLines == null ? undefined : Math.max(1, fitLines)

    const lastLineMax = (lineCount: number) => {
      const lead = lineCount <= 1 ? beforeWidgetsWidth : 0
      return Math.max(0, contentWidth - lead - afterWidgetsWidth)
    }
    let lines = splitText({
      ctx,
      text,
      width: contentWidth,
      firstLineWidth,
    })
    let clamped = false
    const applyClamp = (maxLines: number | undefined) => {
      if (maxLines == null) return
      const n = Math.min(lines.length, Math.max(0, maxLines))
      const result = clampLines(ctx, lines, maxLines, lastLineMax(n))
      lines = result.lines
      if (result.clamped) clamped = true
    }

    const lineClamp =
      typeof options.maxLineClamp === 'number' ? options.maxLineClamp : undefined
    applyClamp(lineClamp)

    const neededHeight = linesHeight(lines.length, charHeight)

    if (
      maxLinesByHeight != null &&
      linesHeight(lines.length, charHeight) > contentHeight
    ) {
      if (
        fitLines != null &&
        fitLines <= 0 &&
        lines.some((line) => line.trimEnd().length > 0)
      ) {
        lines = [ELLIPSIS]
        clamped = true
      } else {
        applyClamp(maxLinesByHeight)
      }
    }

    if (afterWidgetsWidth > 0 && lines.length > 0) {
      const last = lines[lines.length - 1]
      const lastMax = lastLineMax(lines.length)
      if (ctx.measureText(last).width > lastMax) {
        const hitLineClamp =
          lineClamp != null && lines.length >= lineClamp
        const hitHeightClamp =
          maxLinesByHeight != null && lines.length >= maxLinesByHeight
        if (clamped || hitLineClamp || hitHeightClamp) {
          lines[lines.length - 1] = truncateWithEllipsis(ctx, last, lastMax)
          clamped = true
        }
      }
    }
    return { lines, clamped, neededHeight }
  }

  private resolveVerticalAlign(drawnHeight: number): number {
    const { verticalAlign } = this.options
    const { contentY, contentYEnd, contentHeight } = this.box
    if (verticalAlign === 'bottom') {
      return contentYEnd - drawnHeight
    }
    if (verticalAlign === 'middle') {
      return contentY + (contentHeight - drawnHeight) / 2
    }
    return contentY
  }

  private canPlaceAfterOnSameLine(
    ctx: CanvasRenderingContext2D,
    lines: string[]
  ): boolean {
    if (this.afterWidgets.length === 0 || lines.length === 0) return false
    const { contentWidth, beforeWidgetsWidth, afterWidgetsWidth } = this.box
    const last = lines[lines.length - 1].trimEnd()
    const lastWidth = last ? ctx.measureText(last).width : 0
    const lead = lines.length === 1 ? beforeWidgetsWidth : 0
    return lastWidth + afterWidgetsWidth <= contentWidth - lead + 0.5
  }

  private willPlaceAfterOnNextLine(
    ctx: CanvasRenderingContext2D,
    lines: string[]
  ): boolean {
    if (this.afterWidgets.length === 0) return false
    if (!lines.some((line) => line.trimEnd().length > 0)) return false
    return !this.canPlaceAfterOnSameLine(ctx, lines)
  }

  private layoutWidgets(lines: LayoutLine[], afterOnNextLine: boolean): void {
    const { contentX, contentXEnd, contentWidth, contentY, contentHeight } =
      this.box
    const gap = this.options.widgetGap
    const align = this.options.align

    const placeRow = (
      widgets: Widget[],
      startX: number,
      lineY: number,
      lineH: number
    ) => {
      let x = startX
      for (const widget of widgets) {
        widget.x = x
        widget.y = lineY + (lineH - widget.height) / 2
        x += widget.width + gap
      }
    }

    const alignedX = (span: number): number => {
      if (span <= 0) return contentX
      if (align === 'right') return contentXEnd - span
      if (align === 'center') return contentX + (contentWidth - span) / 2
      return contentX
    }

    const placeBothInOneRow = (lineY: number, lineH: number) => {
      const beforeSpan = widgetsSpanWidth(this.beforeWidgets, gap)
      const afterSpan = widgetsSpanWidth(this.afterWidgets, gap)
      const midGap =
        this.beforeWidgets.length && this.afterWidgets.length ? gap : 0
      let x = alignedX(beforeSpan + afterSpan + midGap)
      placeRow(this.beforeWidgets, x, lineY, lineH)
      if (this.beforeWidgets.length) x += beforeSpan + gap
      placeRow(this.afterWidgets, x, lineY, lineH)
    }
    const hasVisibleText = lines.some((line) => line.text.length > 0)
    if (lines.length === 0 || !hasVisibleText) {
      placeBothInOneRow(
        lines[0]?.y ?? contentY,
        lines[0]?.height ?? contentHeight
      )
      return
    }
    const first = lines[0]
    const last = lines[lines.length - 1]
    if (this.beforeWidgets.length > 0) {
      const beforeSpan = widgetsSpanWidth(this.beforeWidgets, gap)
      placeRow(this.beforeWidgets, first.x - gap - beforeSpan, first.y, first.height)
    }
    if (this.afterWidgets.length === 0) return
    if (afterOnNextLine) {
      placeRow(
        this.afterWidgets,
        alignedX(widgetsSpanWidth(this.afterWidgets, gap)),
        last.y + last.height,
        last.height
      )
      return
    }
    placeRow(this.afterWidgets, last.x + last.width + gap, last.y, last.height)
  }

  private paintSelection(ctx: CanvasRenderingContext2D, layout: TextLayout): void {
    const range = this.normalizedSelection(layout.flatText.length)
    if (!range) return
    const { start, end } = range
    const { lines, charHeight } = layout
    ctx.fillStyle = this.options.selectionColor || DEFAULT_SELECTION_COLOR
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const limit = selectableLength(line)
      const breakEnd =
        line.flatStart + line.text.length + (i < lines.length - 1 ? 1 : 0)

      if (end <= line.flatStart || start >= breakEnd || limit === 0) continue

      if (!line.text) {
        ctx.fillRect(line.x, line.y, Math.max(4, charHeight * 0.35), line.height)
        continue
      }
      const localStart = Math.max(0, start - line.flatStart)
      const localEnd = Math.min(limit, end - line.flatStart)
      if (localEnd <= localStart) continue
      const w = line.edges[localEnd] - line.edges[localStart]
      if (w > 0) {
        ctx.fillRect(line.x + line.edges[localStart], line.y, w, line.height)
      }
    }
  }

  private paintLines(ctx: CanvasRenderingContext2D, lines: LayoutLine[]): void {
    ctx.font = this.buildFontStyle()
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    // 必须显式设置：paintSelection 会污染共享 ctx.fillStyle
    ctx.fillStyle = this.options.color || '#000'
    for (const line of lines) {
      if (!line.text) continue
      ctx.fillText(line.text, line.x, this.getTextBaselineY(ctx, line))
    }
  }

  private getTextBaselineY(
    ctx: CanvasRenderingContext2D,
    line: LayoutLine
  ): number {
    const metrics = ctx.measureText(line.text || 'Mg')
    const ascent =
      metrics.actualBoundingBoxAscent || this.options.fontSize * 0.8
    const descent = metrics.actualBoundingBoxDescent || 0
    return line.y + (line.height + ascent - descent) / 2
  }
}
