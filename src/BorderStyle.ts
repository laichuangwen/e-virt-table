export type BorderStyle = 'default' | 'outer' | 'inner' | 'none';
export type BorderConfigValue = boolean | BorderStyle;

type SectionBorderColorConfig = {
    BORDER_COLOR: string;
    HEADER_BORDER_COLOR?: string;
    FOOTER_BORDER_COLOR?: string;
};

export function resolveHeaderBorderColor(config: SectionBorderColorConfig): string {
    return config.HEADER_BORDER_COLOR ?? config.BORDER_COLOR;
}

export function resolveFooterBorderColor(config: SectionBorderColorConfig): string {
    return config.FOOTER_BORDER_COLOR ?? config.BORDER_COLOR;
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
