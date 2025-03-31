# API

-  When declaring `ROW_KEY`, the corresponding field must be of string type.
## EVirtTable

EVirtTable(target: HTMLDivElement, options: EVirtTableOptions)

``` ts
type EVirtTableOptions = {
    data: any[];
    footerData: any[];
    columns: Column[];
    config?: ConfigType;
    overlayerElement?: HTMLDivElement;
    editorElement?: HTMLDivElement;
    emptyElement?: HTMLDivElement;
    contextMenuElement?: HTMLDivElement;
};
```

## Config

| Parameter | Description | Type | Optional Values | Default Value |
| --- | --- | --- | --- | --- |
| CSS_PREFIX | CSS class name prefix | string | — | e-virt-table |
| ROW_KEY | Unique key for rows | string | — | — |
| DISABLED | Disable editing | boolean | — | false |
| HEADR_FONT | Header font | string | — | 12px normal Arial |
| BODY_FONT | Cell font | string | — | 12px normal Arial |
| BORDER_COLOR | Border color | string | — | #e1e6eb |
| WIDTH | Width (0 means auto fit to 100%) | number | — | 0 |
| RESIZE_MIN_WIDTH | Minimum resizable width | number | — | 40 |
| HEIGHT | Height (0 means auto fit) | number | — | 0 |
| EMPTY_BODY_HEIGHT | Height of the body when data is empty | number | — | 120 |
| EMPTY_CUSTOM_STYLE | Custom style for empty data | ^[object]`CSSProperties` | — | — |
| EMPTY_TEXT | Text for empty data | string | — | No data |
| MAX_HEIGHT | Maximum height (0 means auto fit) | number | — | 1000 |
| BORDER_RADIUS | Border radius | number | — | 8 |
| HEADER_HEIGHT | Row height of the header | number | — | 36 |
| HEADER_BG_COLOR | Header background color | string | — | #F8FAFF |
| BODY_BG_COLOR | Body background color | string | — | #F8FAFF |
| HEADER_TEXT_COLOR | Header text color | string | — | #1D2129 |
| LOADING_ICON_SVG | Loading SVG icon | string | — | — |
| LOADING_ICON_COLOR | Color of the loading SVG icon | string | — | — |
| EXPAND_ICON_SVG | Tree expand SVG icon | string | — | — |
| SHRINK_ICON_SVG | Tree shrink SVG icon | string | — | — |
| EXPAND_ICON_COLOR | Expand icon color | string | — | #4E5969 |
| ERROR_TIP_ICON_COLOR | Error tip color | string | — | red |
| ERROR_TIP_ICON_SIZE | Error tip icon size | number | — | 6 |
| DEFAULT_EXPAND_ALL | Default tree expansion all | boolean | — | false |
| CELL_WIDTH | Cell width | number | — | 100 |
| CELL_HEIGHT | Cell height | number | — | 36 |
| CELL_PADDING | Padding of the table body | number | — | 8 |
| SCROLLER_TRACK_SIZE | Scrollbar track size | number | — | 14 |
| SCROLLER_SIZE | Scrollbar slider size | number | — | 8 |
| SCROLLER_COLOR | Scrollbar slider color | string | — | #dee0e3 |
| SCROLLER_FOCUS_COLOR | Scrollbar slider focus color | string | — | #bbbec4 |
| SELECT_BORDER_COLOR | Selected area border color | string | — | `rgb(82,146,247)` |
| SELECT_AREA_COLOR | Selected area background color | string | — | `rgba(82,146,247,0.1)` |
| SELECT_ROW_COL_BG_COLOR | Background color of the current focus cell row and column | string | — | `rgba(82,146,247,0.1)` |
| EDIT_BG_COLOR | Editable background color | string | — | `rgba(221,170,83,0.1)` |
| AUTOFILL_POINT_BORDER_COLOR | Autofill point border color | string | — | #fff |
| CHECKBOX_COLOR | Checkbox color | string | — | `rgb(82,146,247)` |
| CHECKBOX_SIZE | Checkbox size | number | — | 20 |
| CHECKBOX_CHECK_SVG | Checkbox checked icon | string | — | — |
| CHECKBOX_UNCHECK_SVG | Checkbox unchecked icon | string | — | — |
| CHECKBOX_DISABLED_SVG | Checkbox disabled icon | string | — | — |
| CHECKBOX_INDETERMINATE_SVG | Checkbox indeterminate icon | string | — | — |
| READONLY_COLOR | Read-only cell background color | string | — | #fff |
| READONLY_TEXT_COLOR | Read-only cell text color | string | — | #4E5969 |
| ERROR_TIP_COLOR | Cell error tip text color | string | — | #ED3F14 |
| FOOTER_BG_COLOR | Footer background color | string | — | #fafafa |
| FOOTER_FIXED | Fixed footer | boolean | — | true |
| CELL_FOOTER_HEIGHT | Row height of the table footer | number | — | 36 |
| FOOTER_DATA | Table footer data | ^[array]`any[]` | — | [] |
| ENABLE_SELECTOR | Enable selector | boolean | — | true |
| ENABLE_SELECTOR_SINGLE | Enable single selector | boolean | — | false |
| ENABLE_EDIT_CLICK_SELECTOR | Enable click selector edit | boolean | — | true |
| SELECTOR_AREA_MIN_X | Minimum X range of the selector | number | — | 0 |
| SELECTOR_AREA_MAX_X_OFFSET | Maximum X range of the selector (colMax - offset) | number | — | 0 |
| SELECTOR_AREA_MAX_X | Maximum X range of the selector (0 means colMax) | number | — | 0 |
| SELECTOR_AREA_MIN_Y | Minimum Y range of the selector (0 means rowMax) | number | — | 0 |
| SELECTOR_AREA_MAX_Y_OFFSET | Maximum Y range of the selector (0 means rowMax - offset) | number | — | 0 |
| ENABLE_SELECTOR_SPAN_COL | Enable selector for batch column selection | boolean | — | true |
| ENABLE_SELECTOR_SPAN_ROW | Enable selector for batch row selection | boolean | — | true |
| ENABLE_SELECTOR_ALL_ROWS | Enable selector for all rows | boolean | — | true |
| ENABLE_SELECTOR_ALL_COLS | Enable selector for all columns | boolean | — | true |
| ENABLE_MERGE_CELL_LINK | Enable merge cell data association | boolean | — | false |
| ENABLE_AUTOFILL | Enable autofill | boolean | — | true |
| ENABLE_CONTEXT_MENU | Enable context menu | boolean | — | true |
| ENABLE_COPY | Enable copy | boolean | — | true |
| ENABLE_PASTER | Enable paste | boolean | — | true |
| ENABLE_RESIZE_ROW | Enable row height adjustment | boolean | — | true |
| ENABLE_RESIZE_COLUMN | Enable column width adjustment | boolean | — | true |
| RESIZE_ROW_LINE_COLOR | Row adjustment line color | string | — | #e1e6eb |
| RESIZE_COLUMN_LINE_COLOR | Column adjustment line color | string | — | #e1e6eb |
| RESIZE_ROW_MIN_HEIGHT | Minimum row height adjustment | number | — | 36 |
| RESIZE_COLUMN_MIN_WIDTH | Minimum column width adjustment | number | — | 40 |
| ENABLE_KEYBOARD | Enable keyboard | boolean | — | true |
| ENABLE_HISTORY | Enable history (undo/redo) | boolean | — | true |
| HISTORY_NUM | Number of history records | number | — | 50 |
| HIGHLIGHT_HOVER_ROW | Highlight the current row on hover | boolean | — | false |
| HIGHLIGHT_HOVER_ROW_COLOR | Highlight color of the current row on hover | string | — | `rgba(186,203,231,0.1)` |
| HIGHLIGHT_SELECTED_ROW | Highlight the selected row | boolean | — | true |
| HIGHLIGHT_SELECTED_ROW_COLOR | Highlight color of the selected row | string | — | `rgba(82,146,247,0.1)` |
| TOOLTIP_BG_COLOR | Tooltip background color | string | — | #303133 |
| TOOLTIP_TEXT_COLOR | Tooltip text color | string | — | #fff |
| TOOLTIP_ZINDEX | Tooltip z-index | number | — | 3000 |
| TOOLTIP_CUSTOM_STYLE | Custom tooltip style | ^[object]`CSSProperties` | — | true |
| CONTEXT_MENU | Custom context menu | ^[array]`MenuItem[]` | — | CONTEXT_MENU |
| HEADER_CELL_STYLE_METHOD | Custom header cell style | ^[Function]`({column,colIndex})=>CellStyleOptions` | — | — |
| BODY_CELL_STYLE_METHOD | Custom body cell style | ^[Function]`({row, column, rowIndex, colIndex,value,isHasChanged})=>CellStyleOptions` | — | — |
| FOOTER_CELL_STYLE_METHOD | Custom footer cell style | ^[Function]`({row, column, rowIndex, colIndex,value})=>CellStyleOptions` | — | — |
| BODY_CELL_READONLY_METHOD | Custom read-only cell | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean\|void` | — | — |
| BODY_CELL_FORMATTER_METHOD | Custom cell formatter | ^[Function]`({row, column, rowIndex, colIndex,value})=>string\|void` | — | — |
| BODY_CELL_RULES_METHOD | Custom cell validation rules | ^[Function]`({row, column, rowIndex, colIndex,value})=>Rules\|void` | — | — |
| BODY_CELL_TYPE_METHOD | Custom cell type | ^[Function]`({row, column, rowIndex, colIndex,value})=>Type\|void` | — | — |
| BODY_CELL_EDITOR_METHOD | Custom cell editor type | ^[Function]`({row, column, rowIndex, colIndex,value})=>string\|void` | — | — |
| BODY_CELL_RENDER_METHOD | Custom cell render method | ^[Function]`({row, column, rowIndex, colIndex,headIndex,visibleRows,rows})=>string\|void` | — | — |
| SPAN_METHOD | Custom span method for column/row rendering | ^[Function]`({row, column, rowIndex, colIndex,value,visibleLeafColumns,headIndex,headPosition,visibleRows,rows})=>SpanType` | — | — |
| SELECTABLE_METHOD | Custom selectable method | ^[Function]`({row, rowIndex})=>boolean\|void` | — | — |
| EXPAND_LAZY_METHOD | Tree lazy load expand method | ^[Function]`({row, column, rowIndex, colIndex,value})=>Promise<any[]>` | — | — |
| BEFORE_VALUE_CHANGE_METHOD | Callback before value change | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — | — |
| BEFORE_PASTE_DATA_METHOD | Callback before paste change | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — | — |
| BEFORE_AUTOFILL_DATA_METHOD | Callback before autofill change | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — | — |
| BEFORE_SET_SELECTOR_METHOD | Callback before setting selector | ^[Function]`(BeforeSetSelectorParams)=>BeforeSetSelectorParams\|viod` | — |
| BEFORE_SET_AUTOFILL_METHOD | Callback before setting autofill | ^[Function]`(BeforeSetAutofillParams)=>BeforeSetAutofillParams\|viod` | — |
| BEFORE_COPY_METHOD | Callback before copying data | ^[Function]`(BeforeCopyParams)=>BeforeCopyParams\|viod` | — |

## Events

| Name  | Description | Type |
| --- | --- | --- |
| change | Data change callback including copy and autofill | `{rowKey, key, value, row}` |
| selectionChange | Selection change callback | `rows` |
| validateChangedData | Data change callback including copy and autofill, only called when all data passes validation | `{rowKey, key, value, row}` |
| autofillChange | Callback for autofill | `{rowKey, key, value, row}` |
| editChange | Callback for edit | `{rowKey, key, value, row}` |
| iterationChange | Callback for each value change | `{rowKey, key, value, row, oldValue, originalValue}` |
| resizeColumnChange | Callback for column resize | `{colIndex, key, oldWidth, width, column, columns}` |
| resizeRowChange | Callback for row resize | `{rowIndex, oldHeight, height, rowKey, row, data}` |
| emptyChange | Callback for empty data | `{isEmpty, headerHeight, bodyHeight, width, height}` |
| expandChange | Callback for expand | — |
| toggleRowSelection | Callback for row selection | — |
| toggleAllSelection | Callback for select all | — |
| overflowContextmenuChange | Callback for overlay context menu | `{show, list, clientX, clientY, cell}` |
| startEdit | Callback for start edit | focusCell |
| doneEdit | Callback for end edit | cellTarget |
| overlayerChange | Callback for overlay change | overlayer |
| onScrollX | Callback for horizontal scroll | scrollX |
| onScrollY | Callback for vertical scroll | scrollY |
| clearSelectedDataChange | Callback for clearing selected data | changeList |
| cellMouseenter | Callback for cell mouse enter | — |
| cellMousedown | Callback for cell mouse down | — |
| cellContextMenuClick | Callback for cell context menu click | — |
| cellHeaderMousedown | Callback for header cell mouse down | — |
| cellClick | Callback for body cell click | — |
| cellHoverChange | Callback for cell hover | — |
| cellHeaderHoverChange | Callback for header cell hover | — |
| mouseup | Callback for mouse up | — |
| click | Callback for click | — |
| dblclick | Callback for double click | — |
| contextMenu | Callback for context menu | — |
| resize | Callback for resize | — |
| mousedown | Callback for mouse down | — |
| mousemove | Callback for mouse move | — |
| keydown | Callback for key down | — |
| error | Error callback | — |

## Methods

| Method Name            | Description                   | Parameters                                                |
| ---------------------- | ----------------------------- | --------------------------------------------------------- |
| loadConfig             | Load configuration            | Configuration reference config                            |
| loadColumns            | Load column configuration     | Column[]                                                  |
| loadData               | Load body data                | Row[]                                                     |
| loadFooterData         | Load footer data              | Row[]                                                     |
| on                     | Listen to events              | `(event, callback)` configuration reference event         |
| emit                   | Emit event                    | `(event, callback)` configuration reference event         |
| off                    | Remove event listener         | `(event, callback)` configuration reference event         |
| filterMethod           | Filter data method            | FilterMethod                                              |
| setLoading             | Set loading state             | boolean                                                   |
| clearEditor            | Clear editor and selection              |   —                                                         |
| editCell               | Start editing cell            | (rowIndex, colIndex)                                      |
| setItemValue           | Set value                     | (rowKey, key, value, history, reDraw=true, isEditor=true) |
| setItemValueByEditor   | Set value via editor          | (rowKey, key, value, history, reDraw=true, isEditor=true) |
| batchSetItemValue      | Batch set values              | (ChangeItem[], reDraw=true, isEditor=true)                |
| getChangedData         | Get changed data              | —                                                         |
| getChangedRows         | Get changed rows data         | —                                                         |
| validate               | Validate data, scroll to error| boolean                                                   |
| validateFields         | Method for validating some form fields	| (ValidateField[], scrollError=true)         |
| clearValidate          | Clear validation              | —                                                         |
| setValidations         | Set validation errors         | ^[ValidateItemError]`[{message, key, rowKey}]`            |
| getValidations         | Validate data and return errors| —                                                         |
| hasValidationError     | Check if there are validation errors | —                                                   |
| scrollTo               | Scroll to position            | ^`(x, y)`                                                 |
| scrollXTo              | Scroll to X position          | x                                                         |
| scrollYTo              | Scroll to Y position          | y                                                         |
| scrollToColkey         | Scroll to column key position | colKey                                                    |
| scrollToRowkey         | Scroll to row key position    | rowKey                                                    |
| scrollToColIndex       | Scroll to column index position| colIndex                                                  |
| scrollToRowIndex       | Scroll to row index position  | rowIndex                                                  |
| setExpandRowKeys       | Set expanded rows by rowKey   | (rowKeys[], boolean)                                      |
| toggleRowExpand        | Toggle row expand             | (rowKey, expand)                                          |
| toggleExpandAll        | Toggle expand all             | boolean                                                   |
| clearSelection         | Clear selection               | —                                                         |
| toggleRowSelection     | Toggle row selection          | row                                                       |
| setSelectionByRows     | Set selection by rows         | (rows, selected)                                          |
| setSelectionByRowKeys  | Set selection by row keys     | (rowKeys, selected)                                       |
| getSelectionRows       | Get selected rows             | —                                                         |
| toggleAllSelection     | Toggle selection for all rows | —                                                         |
| getPositionForRowIndex | Get position for row index    | —                                                         |
| getCellValue           | Get cell value by rowKey and key | (rowKey, key)                                           |
| getUtils               | Get utility methods, such as built-in merge row and column methods | —                     
| contextMenuHide        | Hide context menu             | —                                                         |
| destroy                | Destroy                       | —                                                         |

## Column

| Parameter | Description | Type | Optional Values | Default Value |
| --- | --- | --- | --- | --- |
| key ^(required)| Unique identifier for the column | string | — | — |
| title ^(required)| Title of the column | string | — | — |
| type| Type of the column | Type |  ^[string]`index, selection, index-selection, tree` | — |
| operation | Specify the column as an operation column | boolean | — | false |
| editorType | Specify the editor type for the column | string | — | text |
| widthFillDisable | Disable width fill for the column | boolean | — | true |
| hide | Hide the column | boolean | — | false |
| sort | Sort order of the column | number | — | 0 |
| width | Width of the column | number | — | — |
| align | Horizontal alignment | string | `"left"`, `"center"`, `"right"` | — |
| verticalAlign | Vertical alignment | string | `"top"`, `"middle"`, `"bottom"` | — |
| fixed | Fix the column position | string | `"left"`, `"right"` | — |
| render | Custom render method | string\|Function | — | — |
| renderFooter | Custom footer render method | string\|Function | — | — |
| renderHeader | Custom header render method | string\|Function | — | — |
| formatter | Formatter method | ^[Function]`({row, column, rowIndex, colIndex, value})=>string\|void` | — | — |
| formatterFooter | Footer formatter method | ^[Function]`({row, column, rowIndex, colIndex, value})=>string\|void` | — | — |
| readonly | Read-only column | boolean | — | false |
| children | Child columns | Column[] | — | — |
| column | Current column object | Column | — | — |
| overflowTooltipShow | Show overflow tooltip | boolean | — | — |
| overflowTooltipMaxWidth | Max width of overflow tooltip | number | — | — |
| overflowTooltipPlacement | Placement of overflow tooltip | OverflowTooltipPlacement |  ^[string]`top, top-start, top-end, right, right-start, right-end, left, left-start, left-end, bottom, bottom-start, bottom-end` | — |
| rules | Validation rules | Rules | — | — |

## Row

-   Hidden field configuration

| Parameter       | Description   | Type   | Optional Values | Default Value |
| ---------- | ------ | ------ | ------ | ------ |
| \_readonly | Row read-only | string | —      | —      |
| \_height   | Row height | string | —      | —      |
| \_hasChildren   | Has children, effective only when type=tree | boolean | —      | —      |

## Rules

-   refer to [async-validator](https://github.com/yiminghe/async-validator)

## CONTEXT_MENU Default 
 
```ts
CONTEXT_MENU: MenuItem[] = [
        { label: '复制', value: 'copy' },
        { label: '剪切', value: 'cut' },
        { label: '粘贴', value: 'paste' },
        { label: '清空选中内容', value: 'clearSelected' },
];
```

## Typings{#typings}

```ts
type EVirtTableOptions = {
    data: any[];
    footerData: any[];
    columns: Column[];
    config?: ConfigType;
    overlayerElement?: HTMLDivElement;
    editorElement?: HTMLDivElement;
    emptyElement?: HTMLDivElement;
    contextMenuElement?: HTMLDivElement;
};
type Type = 'index' | 'selection' | 'index-selection' | 'tree';

type SpanType = {
    rowspan: number;
    colspan: number;
};

type MenuItem = {
    label: string;
    value: string | 'copy' | 'paste' | 'cut' | 'clearSelected';
    event?: Function;
};

type ChangeItem = {
    value: any;
    key: string;
    rowKey: string;
};
type ValidateField = {
    key: string;
    rowKey: string;
};
type BeforeChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
type BeforeSetSelectorParams = {
    focusCell?: Cell;
    xArr: number[];
    yArr: number[];
};
type BeforeSetAutofillParams = {
    focusCell?: Cell;
    xArr: number[];
    yArr: number[];
};
type BeforeCopyParams = {
    focusCell?: Cell;
    data: any;
    xArr: number[];
    yArr: number[];
};
type CellStyleOptions = {
    color?: string;
    backgroundColor?: string;
};

```