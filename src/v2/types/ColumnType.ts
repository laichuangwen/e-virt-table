export type SortDirection = 'asc' | 'desc' | 'none';
export type SortStateMapItem = { direction: SortDirection; timestamp: number };
export type SortStateMap = Map<string, SortStateMapItem>;
export type SortByType = 'number' | 'string' | 'date' | 'api' | ((a: any, b: any) => number);
export type RenderType = 'default' | 'both';
export type Type = 'index' | 'selection' | 'index-selection' | 'tree' | 'selection-tree' | 'tree-selection' | 'number';
export type Align = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type Fixed = 'left' | 'right' | '';
export type LineClampType = number | 'auto';
export type SelectorCellValueType = 'displayText' | 'value';
export type OverflowTooltipPlacement = 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end' | 'bottom' | 'bottom-start' | 'bottom-end';
export type Rules = Rule[];
export type Rule = {
    required?: boolean;
    message?: string;
    validator?: (value: any) => boolean | Promise<boolean>;
};
export type BeforeValueChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue?: any;
    row?: any;
    errorTip?: boolean;
};
export type CellParams = {
    row: any;
    rowIndex: number;
    colIndex: number;
    column: Column;
    value: any;
};
export type FinderCellParams = CellParams & {
    displayText: string;
};
export type FinderHeaderParams = CellHeaderParams & {
    rowIndex: number;
    value: string;
    displayText: string;
};
export type CellHeaderParams = {
    colIndex: number;
    column: Column;
};
export type FormatterMethod = (params: CellParams) => string | void;
export type FinderFormatterMethod = (params: FinderCellParams) => string | void;
export type FinderHeaderFormatterMethod = (params: FinderHeaderParams) => string | void;
export type CellReadonlyMethod = (params: CellParams) => boolean | void;
export interface Column {
    key: string;
    title: string;
    type?: Type;
    operation?: boolean;
    editorType?: string;
    editorProps?: any;
    hoverIconName?: string;
    placeholder?: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    widthFillDisable?: boolean;
    headerAlign?: Align;
    headerVerticalAlign?: VerticalAlign;
    hideHeaderSelection?: boolean;
    align?: Align;
    verticalAlign?: VerticalAlign;
    fixed?: Fixed;
    level?: number;
    text?: string;
    colspan?: number;
    rowspan?: number;
    sort?: number;
    sortBy?: SortByType;
    sortIconType?: 'up-down' | 'left-right' | 'loop';
    sortIconName?: string; // 默认排序图标
    sortAscIconName?: string; // 升序排序图标
    sortDescIconName?: string; // 降序排序图标
    parentKey?: string;
    hide?: boolean | Function;
    render?: Function | string;
    renderFooter?: Function | string;
    renderHeader?: Function | string;
    renderType?: RenderType;
    renderHeaderType?: RenderType;
    renderFooterType?: RenderType;
    formatter?: FormatterMethod;
    formatterFinderValue?: FinderFormatterMethod;
    formatterFinderHeaderValue?: FinderHeaderFormatterMethod;
    formatterFinderFooterValue?: FinderFormatterMethod;
    formatterFooter?: FormatterMethod;
    autoRowHeight?: boolean;
    overflowTooltipShow?: boolean;
    overflowTooltipHeaderShow?: boolean;
    overflowTooltipMaxWidth?: number;
    overflowTooltipPlacement?: OverflowTooltipPlacement;
    required?: boolean;
    readonly?: boolean | CellReadonlyMethod;
    children?: Column[];
    column?: Column;
    rules?: Rules | Rule;
    options?: any;
    dragRow?: boolean;
    dragDisabled?: boolean;
    hideDisabled?: boolean;
    fixedDisabled?: boolean;
    selectorCellValueType?: SelectorCellValueType;
    formatterSelectorValue?: FormatterMethod;
    maxLineClamp?: LineClampType; // 行高超出多少行显示省略号
    maxLineClampHeader?: LineClampType; // 表头行高超出多少行显示省略号
    precision?: number; // 精度,数字类型有效
    min?: number; // 最小值,数字类型有效
    max?: number; // 最大值,数字类型有效
    maxlength?: number; // 最大长度,字符串类型有效
    mixedRender?: boolean; // 混合渲染,dom和canvas一起渲染
    canValueChange?: (changeItem: BeforeValueChangeItem) => Promise<boolean> | boolean; // 是否允许被修改
    valueChange?: (changeItem: BeforeValueChangeItem) => void;
    beforeValueChange?: (changeItem: BeforeValueChangeItem) => BeforeValueChangeItem | Promise<BeforeValueChangeItem>;
}