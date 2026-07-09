export type ScrollbarMode = 'outer' | 'inner';

export type ScrollbarModeConfig = {
    scrollbarMode?: unknown;
    SCROLLBAR_MODE?: unknown;
    SCROLLER_TRACK_SIZE?: number;
};

export function getScrollbarMode(config: ScrollbarModeConfig): ScrollbarMode {
    const mode = config.scrollbarMode ?? config.SCROLLBAR_MODE;
    return mode === 'inner' ? 'inner' : 'outer';
}

export function isInnerScrollbarMode(config: ScrollbarModeConfig): boolean {
    return getScrollbarMode(config) === 'inner';
}

export function getLayoutScrollerTrackSize(config: ScrollbarModeConfig): number {
    return isInnerScrollbarMode(config) ? 0 : config.SCROLLER_TRACK_SIZE || 0;
}

export function getOverlayScrollerTrackSize(config: ScrollbarModeConfig): number {
    return config.SCROLLER_TRACK_SIZE || 0;
}
