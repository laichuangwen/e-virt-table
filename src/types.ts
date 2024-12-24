import type Cell from './Cell';
import type CellHeader from './CellHeader';
import type { RuleItem } from 'async-validator';
import Config from './Config';
export type EVirtTableOptions = {
    data: any[];
    footerData: any[];
    columns: Column[];
    config?: ConfigType;
    overlayerElement?: HTMLDivElement;
    editorElement?: HTMLDivElement;
};
export type EventCallback = (...args: any[]) => void;
export type ChangeItem = {
    value: any;
    key: string;
    rowKey: string;
    row: any;
};
export type OverflowTooltipPlacement =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end';

export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type Align = 'left' | 'center' | 'right';
export type Fixed = 'left' | 'right';
export type Type = 'index' | 'selection' | 'index-selection' | 'tree';

export type TypeCheckbox =
    | 'checkbox-uncheck'
    | 'checkbox-check'
    | 'checkbox-check-disabled'
    | 'checkbox-disabled'
    | 'checkbox-hover'
    | 'checkbox-indeterminate';
export type CellType = 'header' | 'body' | 'footer';
export type RowType = CellType;
export type MenuItem = {
    label: string;
    value: string | 'copy' | 'paste' | 'cut' | 'clearSelected';
    event?: Function;
};
export type OverlayerView = {
    key: 'left' | 'center' | 'right';
    style: any;
    cells: Cell[] | CellHeader[];
};
export type OverlayerWrapper = {
    type: 'body' | 'footer' | 'header';
    class: string;
    style: any;
    views: OverlayerView[];
};
export type OverlayerContainer = {
    views: OverlayerWrapper[];
};
export type ContextmenuItem = {
    label: string;
    value: string | number;
    render: Function;
};
export type Render = Function | string | undefined;
export interface KRuleItem extends RuleItem {
    column?: Column;
    row?: any; // 这里可以定义更具体的类型，根据你的需求
    rowIndex?: number;
    colIndex?: number;
}
export type Rule = KRuleItem | KRuleItem[];
export type ValidateItemError = {
    rowIndex: number;
    key: string;
    message: string;
};
export type Rules = {
    [x: string]: Rule;
};
export type Position = {
    height: number;
    top: number;
    bottom: number;
};
export interface Column {
    type: Type;
    operation: boolean;
    editorType: string;
    hoverIconName: string;
    title: string;
    width: number;
    widthFillDisable: boolean;
    align: Align;
    verticalAlign: VerticalAlign;
    fixed: Fixed;
    level: number;
    text: string;
    colspan: number;
    rowspan: number;
    sort: number;
    key: string;
    hide: boolean | Function;
    render: Function;
    renderFooter: Function;
    renderHeader: Function;
    formatter: FormatterMethod;
    formatterFooter: FormatterMethod;
    overflowTooltipShow: boolean;
    overflowTooltipMaxWidth: number;
    overflowTooltipPlacement: OverflowTooltipPlacement;
    required: boolean;
    readonly: boolean;
    children: Column[];
    column: Column;
    rules: Rules;
    options: any[];
}
export type OverlayerTooltip = {
    style: any;
    text: string;
    show: boolean;
};
export type OverlayerContextmenu = {
    style: any;
    list: any[];
    show: boolean;
};
export type CellStyleOptions = {
    color?: string;
    backgroundColor?: string;
};
export type CellParams = {
    row: any;
    rowIndex: number;
    colIndex: number;
    column: Column;
    value: any;
};
export type BeforeCellValueChangeParams = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
export type CellStyleParams = {
    row: any;
    rowIndex: number;
    colIndex: number;
    column: Column;
    value: any;
    isHasChanged?: boolean;
};
export type CellHeaderParams = {
    colIndex?: number;
    column?: Column;
};
export type SpanType = {
    rowspan: number;
    colspan: number;
};
export type SpanParams = {
    row: any;
    rowIndex: number;
    colIndex: number;
    column: Column;
    visibleLeafColumns: Column[];
    value: any;
    headIndex: number;
    headPosition: Position;
    visibleRows: any[];
    rows: any[];
};
export type SelectableParams = {
    row: any;
    rowIndex: number;
};
export type ConfigType = Partial<Config>;
export type FilterMethod = (rows: any[]) => any[];
export type FormatterMethod = (params: CellParams) => string | void;
export type CellStyleMethod = (params: CellStyleParams) => CellStyleOptions | void;
export type CellHeaderStyleMethod = (params: CellHeaderParams) => CellStyleOptions | void;
export type CellReadonlyMethod = (params: CellParams) => boolean | void;
export type CellRulesMethod = (params: CellParams) => Rules | void;
export type CellTypeMethod = (params: CellParams) => Type | void;
export type CellEditorTypeMethod = (params: CellParams) => string | void;
export type CellRenderMethod = (params: CellParams) => string | void;
export type CellHoverIconMethod = (params: CellParams) => string | void;
export type SpanMethod = (params: SpanParams) => SpanType | void;
export type SelectableMethod = (params: SelectableParams) => boolean | void;
export type ExpandLazyMethod = (params: CellParams) => Promise<any[]>;
export type BeforeCellValueChangeMethod = (params: BeforeCellValueChangeParams[]) => any;
