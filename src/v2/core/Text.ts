import type Context from './Context'
import { Icon } from './Icon'
import type { Paint } from './Paint'
import { Widget, type WidgetConfig } from './Widget'

export type TextAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'middle' | 'bottom'

export type PaddingInput =
  | number
  | {
      top?: number
      right?: number
      bottom?: number
      left?: number
    }

export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface TextConfig extends WidgetConfig {
  text: string
  padding?: PaddingInput
  maxLineClamp?: number
  autoRowHeight?: boolean
  onAutoHeight?: (height: number) => void
  debug?: boolean
  align?: TextAlign
  verticalAlign?: VerticalAlign
  fontSize?: number
  fontWeight?: string
  fontStyle?: string
  fontVariant?: string
  font?: string
  lineHeight?: number
  color?: string
  selectionColor?: string
  beforeIcons?: Icon[]
  afterIcons?: Icon[]
  iconGap?: number
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
  beforeIconsWidth: number
  afterIconsWidth: number
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
  textAnchor: number
  startY: number
  neededHeight: number
  clamped: boolean
  afterOnNextLine: boolean
}

const ELLIPSIS = '...'
const DEFAULT_SELECTION_COLOR = '#B4D7FF'

const defaultTextOptions = {
  debug: false,
  align: 'center' as TextAlign,
  verticalAlign: 'middle' as VerticalAlign,
  fontSize: 14,
  fontWeight: '',
  fontStyle: '',
  fontVariant: '',
  font: 'Arial',
  lineHeight: undefined as number | undefined,
  color: undefined as string | undefined,
  padding: 0 as PaddingInput,
  maxLineClamp: undefined as number | undefined,
  autoRowHeight: false,
  onAutoHeight: undefined as ((height: number) => void) | undefined,
  selectionColor: DEFAULT_SELECTION_COLOR,
  iconGap: 4,
  type: 'text' as 'text' | 'link',
}

type ResolvedTextOptions = typeof defaultTextOptions

const EMPTY_LAYOUT: TextLayout = {
  lines: [],
  flatText: '',
  charHeight: 0,
  textAnchor: 0,
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

function iconsSpanWidth(icons: Icon[], gap: number): number {
  if (icons.length === 0) return 0
  return icons.reduce((sum, icon, i) => {
    return sum + icon.width + (i < icons.length - 1 ? gap : 0)
  }, 0)
}

function measureIconsWidth(icons: Icon[], gap: number): number {
  return icons.length === 0 ? 0 : iconsSpanWidth(icons, gap) + gap
}

function measureEdges(ctx: CanvasRenderingContext2D, text: string): number[] {
  const edges = [0]
  for (let i = 1; i <= text.length; i++) {
    edges.push(ctx.measureText(text.slice(0, i)).width)
  }
  return edges
}

function alignTextX(
  align: TextAlign,
  boxX: number,
  boxW: number,
  textW: number
): number {
  if (align === 'right') return boxX + boxW - textW
  if (align === 'left') return boxX
  return boxX + (boxW - textW) / 2
}

export class Text extends Widget {
  text: string
  private selAnchor = 0
  private selFocus = 0
  private readonly options: ResolvedTextOptions
  private readonly pad: Padding
  private readonly box: ContentBox
  private readonly beforeIcons: Icon[]
  private readonly afterIcons: Icon[]
  private layoutCache: TextLayout | null = null
  private result: DrawTextResult = EMPTY_RESULT
  constructor(context: Context, config: TextConfig) {
    super(context, { zIndex: 10, ...config })
    this.text = config.text
    this.options = { ...defaultTextOptions, ...config }
    this.pad = normalizePadding(this.options.padding)
    this.beforeIcons = (config.beforeIcons ?? []).filter((icon) => icon.visible)
    this.afterIcons = (config.afterIcons ?? []).filter((icon) => icon.visible)
    this.box = this.createContentBox()
    this.on('pointerdown:self', (e) => this.handlePointerDown(e))
    this.on('pointermove', (e) => this.handlePointerMove(e))
    this.on('pointerup', (e) => this.handlePointerUp(e))
  }
  getDrawResult(): DrawTextResult {
    return this.result
  }
  getBeforeIcons(): Icon[] {
    return this.beforeIcons
  }
  getAfterIcons(): Icon[] {
    return this.afterIcons
  }
  getIcons(): Icon[] {
    return [...this.beforeIcons, ...this.afterIcons]
  }

  draw(): DrawTextResult {
    if (!this.visible) {
      this.result = EMPTY_RESULT
      return this.result
    }
    this.render(this.context.paint)
    return this.result
  }

  render(paint: Paint): void {
    if (!this.isValid()) {
      this.result = EMPTY_RESULT
      return
    }
    const ctx = paint.getCtx()
    const layout = this.ensureLayout(ctx)
    const { lines, charHeight, textAnchor, flatText, neededHeight, clamped } =
      layout

    if (this.options.autoRowHeight) {
      const neededBoxHeight = neededHeight + this.pad.top + this.pad.bottom
      this.options.onAutoHeight?.(Math.ceil(neededBoxHeight))
    }
    const drawnHeight =
      linesHeight(lines.length, charHeight) +
      (layout.afterOnNextLine ? charHeight : 0)

    this.layoutIcons(lines, layout.afterOnNextLine)
    this.paintSelection(ctx, layout)
    this.paintLines(ctx, lines)
    this.paintIcons()
    if (this.options.debug) {
      const { debugY } = this.resolveVerticalAlign(drawnHeight)
      this.drawDebug(textAnchor, debugY)
    }
    this.result = {
      height: drawnHeight,
      neededHeight,
      lines: lines.length,
      clamped,
      flatText,
    }
  }

  private isSelecting(): boolean {
    return this.context.textSelecting && this.context.selectingText === this
  }

  private clearOtherSelections(): void {
    for (const widget of this.context.paint.getWidgets()) {
      if (widget instanceof Text && widget !== this) {
        widget.selAnchor = 0
        widget.selFocus = 0
      }
    }
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
    const layout = this.ensureLayout(this.context.paint.getCtx())
    const len = Math.min(
      flatLen ?? layout.flatText.length,
      this.getSelectableEnd(layout)
    )
    if (this.context.selectingText !== this) return null
    let start = Math.max(0, Math.min(this.selAnchor, this.selFocus, len))
    let end = Math.max(0, Math.min(Math.max(this.selAnchor, this.selFocus), len))
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
    this.clearOtherSelections()
    const { x, y } = this.context.paint.getRelativePosition(e)
    const index = this.hitTest(x, y)
    this.selAnchor = index
    this.selFocus = index
    this.context.textSelecting = true
    this.context.selectingText = this

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
    if (next === this.selFocus) return
    this.selFocus = next
    this.emitSelectionChange()
  }
  private handlePointerUp(e?: PointerEvent): void {
    if (!this.isSelecting()) return
    this.context.textSelecting = false
    const target = e?.currentTarget
    if (target instanceof Element && e && target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId)
    }
  }

  private createContentBox(): ContentBox {
    const { x, y, width, height } = this
    const { left, top, right, bottom } = this.pad
    const contentX = x + left
    const contentY = y + top
    const contentWidth = width - left - right
    const contentHeight = height - top - bottom
    const gap = this.options.iconGap
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
      beforeIconsWidth: measureIconsWidth(this.beforeIcons, gap),
      afterIconsWidth: measureIconsWidth(this.afterIcons, gap),
    }
  }

  private isValid(): boolean {
    const { width, height } = this
    const { fontSize } = this.options
    const { contentWidth, contentHeight, beforeIconsWidth } = this.box
    return (
      width > 0 &&
      height > 0 &&
      fontSize > 0 &&
      contentWidth > 0 &&
      contentHeight > 0 &&
      contentWidth - beforeIconsWidth > 0
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
    const textAnchor = this.applyHorizontalAlign(ctx)
    const { txtY: startY } = this.resolveVerticalAlign(drawnHeight)
    const { contentX, contentWidth, beforeIconsWidth, afterIconsWidth } = box
    const afterOnSameLine = !afterOnNextLine && this.afterIcons.length > 0
    const layoutLines: LayoutLine[] = []
    let flatStart = 0
    let txtY = startY
    const lineCount = prepared.lines.length
    for (let i = 0; i < lineCount; i++) {
      const text = prepared.lines[i].trimEnd()
      const width = text ? ctx.measureText(text).width : 0
      const lead = i === 0 ? beforeIconsWidth : 0
      const trail =
        i === lineCount - 1 && afterOnSameLine ? afterIconsWidth : 0
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
      textAnchor,
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
    const { contentWidth, contentHeight, beforeIconsWidth, afterIconsWidth } =
      box

    const firstLineWidth = Math.max(0, contentWidth - beforeIconsWidth)
    const maxLinesByHeight = options.autoRowHeight
      ? undefined
      : Math.floor(contentHeight / charHeight)

    const lastLineMax = (lineCount: number) => {
      const lead = lineCount <= 1 ? beforeIconsWidth : 0
      return Math.max(0, contentWidth - lead - afterIconsWidth)
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

    applyClamp(options.maxLineClamp)

    const neededHeight = linesHeight(lines.length, charHeight)

    if (
      maxLinesByHeight != null &&
      linesHeight(lines.length, charHeight) > contentHeight
    ) {
      applyClamp(maxLinesByHeight)
    }

    if (afterIconsWidth > 0 && lines.length > 0) {
      const last = lines[lines.length - 1]
      const lastMax = lastLineMax(lines.length)
      if (ctx.measureText(last).width > lastMax) {
        const hitLineClamp =
          options.maxLineClamp != null && lines.length >= options.maxLineClamp
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

  private applyHorizontalAlign(ctx: CanvasRenderingContext2D): number {
    const { align } = this.options
    const { contentX, contentXEnd, contentWidth } = this.box
    if (align === 'right') {
      ctx.textAlign = 'right'
      return contentXEnd
    }
    if (align === 'left') {
      ctx.textAlign = 'left'
      return contentX
    }
    ctx.textAlign = 'center'
    return contentX + contentWidth / 2
  }

  private resolveVerticalAlign(drawnHeight: number): {
    txtY: number
    debugY: number
  } {
    const { verticalAlign } = this.options
    const { contentY, contentYEnd, contentHeight } = this.box
    if (verticalAlign === 'bottom') {
      return { txtY: contentYEnd - drawnHeight, debugY: contentYEnd }
    }
    if (verticalAlign === 'middle') {
      return {
        txtY: contentY + (contentHeight - drawnHeight) / 2,
        debugY: contentY + contentHeight / 2,
      }
    }
    return { txtY: contentY, debugY: contentY }
  }

  private canPlaceAfterOnSameLine(
    ctx: CanvasRenderingContext2D,
    lines: string[]
  ): boolean {
    if (this.afterIcons.length === 0 || lines.length === 0) return false
    const { contentWidth, beforeIconsWidth, afterIconsWidth } = this.box
    const last = lines[lines.length - 1].trimEnd()
    const lastWidth = last ? ctx.measureText(last).width : 0
    const lead = lines.length === 1 ? beforeIconsWidth : 0
    return lastWidth + afterIconsWidth <= contentWidth - lead + 0.5
  }

  private willPlaceAfterOnNextLine(
    ctx: CanvasRenderingContext2D,
    lines: string[]
  ): boolean {
    if (this.afterIcons.length === 0) return false
    if (!lines.some((line) => line.trimEnd().length > 0)) return false
    return !this.canPlaceAfterOnSameLine(ctx, lines)
  }

  private layoutIcons(lines: LayoutLine[], afterOnNextLine: boolean): void {
    const { contentX, contentXEnd, contentWidth, contentY, contentHeight } =
      this.box
    const gap = this.options.iconGap
    const align = this.options.align

    const placeRow = (
      icons: Icon[],
      startX: number,
      lineY: number,
      lineH: number
    ) => {
      let x = startX
      for (const icon of icons) {
        icon.x = x
        icon.y = lineY + (lineH - icon.height) / 2
        x += icon.width + gap
      }
    }

    const alignedX = (span: number): number => {
      if (span <= 0) return contentX
      if (align === 'right') return contentXEnd - span
      if (align === 'center') return contentX + (contentWidth - span) / 2
      return contentX
    }

    const placeBothInOneRow = (lineY: number, lineH: number) => {
      const beforeSpan = iconsSpanWidth(this.beforeIcons, gap)
      const afterSpan = iconsSpanWidth(this.afterIcons, gap)
      const midGap =
        this.beforeIcons.length && this.afterIcons.length ? gap : 0
      let x = alignedX(beforeSpan + afterSpan + midGap)
      placeRow(this.beforeIcons, x, lineY, lineH)
      if (this.beforeIcons.length) x += beforeSpan + gap
      placeRow(this.afterIcons, x, lineY, lineH)
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
    if (this.beforeIcons.length > 0) {
      const beforeSpan = iconsSpanWidth(this.beforeIcons, gap)
      placeRow(this.beforeIcons, first.x - gap - beforeSpan, first.y, first.height)
    }
    if (this.afterIcons.length === 0) return
    if (afterOnNextLine) {
      placeRow(
        this.afterIcons,
        alignedX(iconsSpanWidth(this.afterIcons, gap)),
        last.y + last.height,
        last.height
      )
      return
    }
    placeRow(this.afterIcons, last.x + last.width + gap, last.y, last.height)
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
    if (this.options.color) ctx.fillStyle = this.options.color
    for (const line of lines) {
      if (!line.text) continue
      ctx.fillText(line.text, line.x, this.getTextBaselineY(ctx, line))
    }
  }
  private paintIcons(): void {
    for (const icon of this.beforeIcons) icon.draw()
    for (const icon of this.afterIcons) icon.draw()
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

  private drawDebug(textAnchor: number, debugY: number): void {
    const paint = this.context.paint
    const { pad, box } = this
    const {
      x,
      y,
      width,
      height,
      contentX,
      contentY,
      contentWidth,
      contentHeight,
      contentXEnd,
      contentYEnd,
    } = box
    const color = '#0C8CE9'

    paint.drawRect(x, y, width, height, {
      borderWidth: 1,
      borderColor: color,
    })

    if (pad.top || pad.right || pad.bottom || pad.left) {
      paint.drawRect(contentX, contentY, contentWidth, contentHeight, {
        borderWidth: 1,
        borderColor: '#94a3b8',
        lineDash: [4, 3],
      })
    }

    paint.drawLine([textAnchor, contentY, textAnchor, contentYEnd], {
      borderWidth: 1,
      borderColor: color,
    })
    paint.drawLine([contentX, debugY, contentXEnd, debugY], {
      borderWidth: 1,
      borderColor: color,
    })
  }
}
