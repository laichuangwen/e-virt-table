import type { Fixed } from './types';

export type BorderStyle = 'default' | 'outer' | 'inner' | 'none';
export type BorderConfigValue = boolean | BorderStyle;

type ResizeColumnDividerColorConfig = {
    ENABLE_RESIZE_COLUMN: boolean;
    RESIZE_COLUMN_DIVIDER_COLOR?: string;
};

type ColumnDividerBoundaries = {
    fixedLeftEnd?: number;
    fixedRightStart?: number;
};

export function resolveResizeColumnDividerColor(
    config: ResizeColumnDividerColorConfig,
): string | undefined {
    return config.ENABLE_RESIZE_COLUMN ? config.RESIZE_COLUMN_DIVIDER_COLOR : undefined;
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

export function getColumnDividerSide(
    fixed: Fixed | undefined,
    x: number,
    width: number,
    sectionWidth: number,
    boundaries: ColumnDividerBoundaries = {},
): 'left' | 'right' | null {
    const { fixedLeftEnd = sectionWidth, fixedRightStart = 0 } = boundaries;
    if (fixed === 'right') {
        return x > fixedRightStart + 0.01 ? 'left' : null;
    }
    if (fixed === 'left') {
        return x + width < fixedLeftEnd - 0.01 ? 'right' : null;
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
