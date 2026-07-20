import type { Fixed } from './types';

export type BorderStyle = 'default' | 'outer' | 'inner' | 'none';
export type BorderConfigValue = boolean | BorderStyle;

type ResizeColumnDividerColorConfig = {
    BORDER: BorderConfigValue;
    BORDER_COLOR: string;
    ENABLE_RESIZE_COLUMN: boolean;
    RESIZE_COLUMN_DIVIDER_COLOR?: string;
};

export function resolveResizeColumnDividerColor(
    config: ResizeColumnDividerColorConfig,
): string | undefined {
    if (config.ENABLE_RESIZE_COLUMN && config.RESIZE_COLUMN_DIVIDER_COLOR !== undefined) {
        return config.RESIZE_COLUMN_DIVIDER_COLOR;
    }
    return shouldDrawFullCellBorder(config.BORDER) ? config.BORDER_COLOR : undefined;
}

export function normalizeBorderStyle(value: BorderConfigValue): BorderStyle {
    if (value === true) return 'default';
    if (value === false) return 'inner';
    return value;
}

export function shouldDrawFullCellBorder(value: BorderConfigValue): boolean {
    return normalizeBorderStyle(value) === 'default';
}

export function shouldDrawInternalHorizontalBorder(value: BorderConfigValue): boolean {
    const style = normalizeBorderStyle(value);
    return style === 'default' || style === 'inner';
}

export function shouldDrawColumnDivider(value: BorderConfigValue): boolean {
    return shouldDrawFullCellBorder(value);
}

export function getColumnDividerSide(
    fixed: Fixed | undefined,
    x: number,
    width: number,
    sectionWidth: number,
): 'left' | 'right' | null {
    if (fixed === 'right') {
        return x > 0.01 ? 'left' : null;
    }
    return x + width < sectionWidth - 0.01 ? 'right' : null;
}

export function shouldDrawOuterBorder(value: BorderConfigValue): boolean {
    const style = normalizeBorderStyle(value);
    return style === 'default' || style === 'outer';
}

export function shouldDrawScrollerBorder(value: BorderConfigValue): boolean {
    return normalizeBorderStyle(value) === 'default';
}

export function shouldDrawScrollerTrack(value: BorderConfigValue, hasScrollbar: boolean): boolean {
    return shouldDrawScrollerBorder(value) || hasScrollbar;
}

export function shouldDrawRightBoundaryBorder(value: BorderConfigValue): boolean {
    void value;
    return false;
}
