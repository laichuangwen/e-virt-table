export type BorderStyle = 'default' | 'outer' | 'inner' | 'none';
export type BorderConfigValue = boolean | BorderStyle;

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
