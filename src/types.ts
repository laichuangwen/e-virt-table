import type Cell from './Cell';
import type CellHeader from './CellHeader';
import type { Rule, Rules } from './Validator';
import Config from './Config';
export type OptionalizeExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;
export type EVirtTableOptions = {
    data: Record<string, any>[];
    footerData?: Record<string, any>[];
    columns: Column[];
    config?: ConfigType;
    overlayerElement?: HTMLDivElement;
    editorElement?: HTMLDivElement;
    emptyElement?: HTMLDivElement;
    contextMenuElement?: HTMLDivElement;
    loadingElement?: HTMLDivElement;
};

export type EventCallback = (...args: any[]) => void;
export type ChangeItem = {
    value: any;
    key: string;
    rowKey: string;
    row: any;
    oldValue?: any;
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
export type Type = 'index' | 'selection' | 'index-selection' | 'tree' | 'selection-tree' | 'tree-selection' | 'number';

export type TypeCheckbox =
    | 'checkbox-uncheck'
    | 'checkbox-check'
    | 'checkbox-check-disabled'
    | 'checkbox-disabled'
    | 'checkbox-indeterminate';
export type CellType = 'header' | 'body' | 'footer';
export type FooterPosition = 'top' | 'bottom';
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

export type ValidateItemError = {
    rowIndex: number;
    key: string;
    message: string;
};
export type ValidateField = {
    key: string;
    rowKey: string;
};
export type Position = {
    height: number;
    top: number;
    bottom: number;
    calculatedHeight: number;
};
export type PastedDataOverflow = {
    maxY: number;
    maxX: number;
    minY: number;
    minX: number;
    overflowRowCount: number;
    overflowColCount: number;
    textArr: string[][];
};
export type SelectionMap = {
    check: boolean;
    key: string;
    row: any;
};

export type SortDirection = 'asc' | 'desc' | 'none';
export type SortStateMapItem = { direction: SortDirection; timestamp: number };
export type SortStateMap = Map<string, SortStateMapItem>;
export type SortByType =
    | 'number'
    | 'string'
    | 'date'
    | 'api'
    | ((a: any, b: any) => number);

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
    sortIconName?: string; // 默认排序图标
    sortAscIconName?: string; // 升序排序图标
    sortDescIconName?: string; // 降序排序图标
    hide?: boolean | Function;
    render?: Function | string;
    renderFooter?: Function | string;
    renderHeader?: Function | string;
    formatter?: FormatterMethod;
    formatterFooter?: FormatterMethod;
    autoRowHeight?: boolean;
    overflowTooltipShow?: boolean;
    overflowTooltipHeaderShow?: boolean;
    overflowTooltipMaxWidth?: number;
    overflowTooltipPlacement?: OverflowTooltipPlacement;
    required?: boolean;
    readonly?: boolean;
    children?: Column[];
    column?: Column;
    rules?: Rules | Rule;
    options?: any;
    selectorCellValueType?: SelectorCellValueType;
    maxLineClamp?: LineClampType; // 行高超出多少行显示省略号
}
export type LineClampType = number | 'auto';
export type HistoryAction = 'back' | 'forward' | 'none';
export type SelectorCellValueType = 'displayText' | 'value';

export type TreeSelectMode = 'auto' | 'cautious' | 'strictly';
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
export type RowParams = {
    row: any;
    rowIndex: number;
    rowKey: string;
};
export type CellHeaderParams = {
    colIndex: number;
    column: Column;
};
export type BeforeChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
export type BeforeValueChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue?: any;
    row?: any;
};
export type BeforeSetSelectorParams = {
    focusCell?: Cell;
    xArr: number[];
    yArr: number[];
};
export type BeforeSetAutofillParams = {
    focusCell?: Cell;
    xArr: number[];
    yArr: number[];
};
export type BeforeCopyParams = {
    focusCell?: Cell;
    data: any;
    xArr: number[];
    yArr: number[];
};
export type CellStyleParams = CellParams & {
    isHasChanged?: boolean;
};

export type SpanType = {
    rowspan: number;
    colspan: number;
    relationRowKeys?: string[];
    relationColKeys?: string[];
    mergeRow?: boolean;
    mergeCol?: boolean;
};
export type ErrorType = {
    code: string;
    message: string;
    data?: any;
};
export type SpanParams = CellParams & {
    visibleLeafColumns: Column[];
    headIndex: number;
    headPosition: Position;
    visibleRows: any[];
    rows: any[];
};
export type SpanInfo = {
    xArr: number[];
    yArr: number[];
    rowspan: number;
    colspan: number;
    height: number;
    width: number;
    offsetTop: number;
    offsetLeft: number;
    dataList: ChangeItem[];
};
export type SelectableParams = {
    row: any;
    rowIndex: number;
};
export type EditorOptions = {
    type: string;
    props: any;
};
export type ConfigType = Partial<Config>;
export type FilterMethod = (rows: any[]) => any[];
export type FormatterMethod = (params: CellParams) => string | void;
export type CellStyleMethod = (params: CellStyleParams) => CellStyleOptions | void;
export type CellHeaderStyleMethod = (params: CellHeaderParams) => CellStyleOptions | void;
export type CellReadonlyMethod = (params: CellParams) => boolean | void;
export type CellRulesMethod = (params: CellParams) => Rules | void;
export type CellTypeMethod = (params: CellParams) => Type | void;
export type CellEditorMethod = (params: CellParams) => EditorOptions | void;
export type CellRenderMethod = (params: CellParams) => string | void;
export type CellHoverIconMethod = (params: CellParams) => string | void;
export type SpanMethod = (params: SpanParams) => SpanType | void;
export type SelectableMethod = (params: SelectableParams) => boolean | void;
export type ExpandLazyMethod = (params: CellParams) => Promise<any[]>;
export type BeforeCellValueChangeMethod = (
    changeList: BeforeValueChangeItem[],
) => BeforeValueChangeItem[] | Promise<BeforeValueChangeItem[]>;
export type BeforePasteDataMethod = (
    changeList: BeforeChangeItem[],
    xArr: number[],
    yArr: number[],
    textArr: string[][],
) => BeforeChangeItem[] | Promise<BeforeChangeItem[]>;
export type BeforeAutofillDataMethod = (
    changeList: BeforeChangeItem[],
    xArr: number[],
    yArr: number[],
) => BeforeChangeItem[] | Promise<BeforeChangeItem[]>;

export type BeforeSetSelectorMethod = (params: BeforeSetSelectorParams) => BeforeSetSelectorParams | undefined;
export type BeforeSetAutofillMethod = (params: BeforeSetAutofillParams) => BeforeSetAutofillParams | undefined;
export type BeforeCopyMethod = (params: BeforeCopyParams) => BeforeCopyParams | undefined;
