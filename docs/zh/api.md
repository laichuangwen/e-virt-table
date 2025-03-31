# API

-   声明ROW_KEY时对应字段必须为字符串类型
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

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| CSS_PREFIX | CSS 类名前缀 | string | e-virt-table |
| ROW_KEY | 行的唯一标识键 | string | — |
| DISABLED | 禁止编辑 | boolean | false |
| HEADR_FONT | 表头字体 | string | 12px normal Arial |
| BODY_FONT | 单元格字体 | string | 12px normal Arial |
| BORDER_COLOR | 区域边框颜色 | string | #e1e6eb |
| WIDTH | 宽度为 0 表示自适应100% | number | 0 |
| RESIZE_MIN_WIDTH | 最小可调整宽度 | number | 40 |
| HEIGHT | 高度，高度为 0 表示自适应 | number | 0 |
| EMPTY_BODY_HEIGHT | 数据为空时表格体的高度 | number | 120 |
| EMPTY_CUSTOM_STYLE | 自定义空数据样式 | ^[object]`CSSProperties` | — |
| EMPTY_TEXT | 空数据文本 | string | 暂无数据 |
| MAX_HEIGHT | 最大高度，高度为 0 表示自适应 | number | 1000 |
| BORDER_RADIUS | 区域边框圆角 | number | 8 |
| HEADER_HEIGHT | 表头行高 | number | 36 |
| HEADER_BG_COLOR | 表头背景色 | string | #F8FAFF |
| BODY_BG_COLOR | body 背景色 | string | #F8FAFF |
| HEADER_TEXT_COLOR | 表头文本颜色 | string | #1D2129 |
| LOADING_ICON_SVG | 加载 svg 图标 | string | — |
| LOADING_ICON_COLOR | 加载 svg 图标颜色 | string | — |
| EXPAND_ICON_SVG | 树形展开svg 图标 | string | — |
| SHRINK_ICON_SVG | 树形收缩svg 图标 | string | — |
| EXPAND_ICON_COLOR | 展开图标颜色 | string | #4E5969 |
| ERROR_TIP_ICON_COLOR | 错误提示颜色 | string | red |
| ERROR_TIP_ICON_SIZE | 错误提示图标大小 | number | 6 |
| DEFAULT_EXPAND_ALL | tree 默认是否全部展开 | boolean | false |
| CELL_WIDTH | 表格 body 部分的宽度 | number | 100 |
| CELL_HEIGHT | 表格 body 部分的行高 | number | 36 |
| CELL_PADDING | 表格 body 部分的 padding | number | 8 |
| SCROLLER_TRACK_SIZE | 滚动条轨道尺寸 | number | 14 |
| SCROLLER_SIZE | 滚动条滑块尺寸 | number | 8 |
| SCROLLER_COLOR | 滚动条滑块颜色 | string | #dee0e3 |
| SCROLLER_FOCUS_COLOR | 滚动条滑块聚焦时的颜色 | string | #bbbec4 |
| SELECT_BORDER_COLOR | 选中区域边框颜色 | string | `rgb(82,146,247)` |
| SELECT_AREA_COLOR | 选中区域背景颜色 | string | `rgba(82,146,247,0.1)` |
| SELECT_ROW_COL_BG_COLOR | 当前焦点单元格所在行、列的背景色 | string | `rgba(82,146,247,0.1)` |
| EDIT_BG_COLOR | 可编辑背景色 | string | `rgba(221,170,83,0.1)` |
| AUTOFILL_POINT_BORDER_COLOR | 填充点的边框颜色 | string | #fff |
| CHECKBOX_COLOR | 选择框颜色 | string | `rgb(82,146,247)` |
| CHECKBOX_SIZE | 选择框大小 | number | 20 |
| CHECKBOX_CHECK_SVG | 选择框选中图标 | string | — |
| CHECKBOX_UNCHECK_SVG | 选择框未中图标 | string | — |
| CHECKBOX_DISABLED_SVG | 选择框禁用图标 | string | — |
| CHECKBOX_INDETERMINATE_SVG | 选择框半选中图标 | string | — |
| READONLY_COLOR | 单元格只读背景色 | string | #fff |
| READONLY_TEXT_COLOR | 单元格只读文本颜色 | string | #4E5969 |
| ERROR_TIP_COLOR | 单元格错误提示文本颜色 | string | #ED3F14 |
| FOOTER_BG_COLOR | 合计底部背景色 | string | #fafafa |
| FOOTER_FIXED | 合计底部固定 | boolean | true |
| FOOTER_POSITION | 合计底部位置 | `top`、`bottom` | `bottom` |
| CELL_FOOTER_HEIGHT | 表格 footer 部分的行高 | number | 36 |
| FOOTER_DATA | 表格 footer 数据 | ^[array]`any[]` | [] |
| ENABLE_SELECTOR | 启用选择器 | boolean | true |
| ENABLE_SELECTOR_SINGLE | 启用选择器-选择器单选 | boolean | false |
| ENABLE_EDIT_CLICK_SELECTOR | 启用点击选择器编辑 | boolean | true |
| SELECTOR_AREA_MIN_X | 选择器 X 最小范围 | number | 0 |
| SELECTOR_AREA_MAX_X_OFFSET | 选择器 X 最大范围 colMax - offset | number | 0 |
| SELECTOR_AREA_MAX_X | 选择器 X 最大范围,0 默认最大 colMax | number | 0 |
| SELECTOR_AREA_MIN_Y | 选择器 Y 最大范围,0 默认 rowMax | number | 0 |
| SELECTOR_AREA_MAX_Y_OFFSET | 选择器 Y 最大范围,0 默认 rowMax-offset | number | 0 |
| ENABLE_SELECTOR_SPAN_COL | 启用选择器-批量跨列选择 | boolean | true |
| ENABLE_SELECTOR_SPAN_ROW | 启用选择器-批量跨行选择 | boolean | true |
| ENABLE_SELECTOR_ALL_ROWS | 启用选择器-批量选中列 | boolean | true |
| ENABLE_SELECTOR_ALL_COLS | 启用选择器-批量选中行 | boolean | true |
| ENABLE_MERGE_CELL_LINK | 启用合并格子数据关联 | boolean | false |
| ENABLE_AUTOFILL | 启用填充 | boolean | true |
| ENABLE_CONTEXT_MENU | 启用右键 | boolean | true |
| ENABLE_COPY | 启用复制 | boolean | true |
| ENABLE_PASTER | 启用粘贴 | boolean | true |
| ENABLE_RESIZE_ROW | 启用调整行高 | boolean | true |
| ENABLE_RESIZE_COLUMN | 启用调整列宽 | boolean | true |
| RESIZE_ROW_LINE_COLOR | 行调整线颜色 | string | #e1e6eb |
| RESIZE_COLUMN_LINE_COLOR | 列调整线颜色 | string | #e1e6eb |
| RESIZE_ROW_MIN_HEIGHT | 最小调整行高 | number | 36 |
| RESIZE_COLUMN_MIN_WIDTH | 最小调整列宽 | number | 40 |
| ENABLE_KEYBOARD | 启用键盘 | boolean | true |
| ENABLE_HISTORY | 启用历史记录，可回退 | boolean | true |
| HISTORY_NUM | 启用历史记录数量 | number | 50 |
| HIGHLIGHT_HOVER_ROW | hover 高亮当前行 | boolean | false |
| HIGHLIGHT_HOVER_ROW_COLOR | hover 高亮当前行颜色 | string | `rgba(186,203,231,0.1)` |
| HIGHLIGHT_SELECTED_ROW | 高亮选中当前行 | boolean | true |
| HIGHLIGHT_SELECTED_ROW_COLOR | 高亮当前行颜色 | string | `rgba(82,146,247,0.1)` |
| TOOLTIP_BG_COLOR | 提示背景颜色 | string | #303133 |
| TOOLTIP_TEXT_COLOR | 提示文本颜色 | string | #fff |
| TOOLTIP_ZINDEX | 提示文本颜色 | number | 3000 |
| TOOLTIP_CUSTOM_STYLE | 提示样式 | ^[object]`CSSProperties` | true |
| CONTEXT_MENU | 自定义右键菜单 | ^[array]`MenuItem[]` | CONTEXT_MENU |
| HEADER_CELL_STYLE_METHOD | 自定义表头单元格样式 | ^[Function]`({column,colIndex})=>CellStyleOptions` | — |
| BODY_CELL_STYLE_METHOD | 自定义 body 单元格样式 | ^[Function]`({row, column, rowIndex, colIndex,value,isHasChanged})=>CellStyleOptions` | — |
| FOOTER_CELL_STYLE_METHOD | 自定 footer 义单元格样式 | ^[Function]`({row, column, rowIndex, colIndex,value})=>CellStyleOptions` | — |
| BODY_CELL_READONLY_METHOD | 自定义只读 | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean\|viod` | — |
| BODY_CELL_FORMATTER_METHOD | 自定义格式化 | ^[Function]`({row, column, rowIndex, colIndex,value})=>string\|viod` | — |
| BODY_CELL_RULES_METHOD | 自定义校验规则 | ^[Function]`({row, column, rowIndex, colIndex,value})=>Rules\|viod` | — |
| BODY_CELL_TYPE_METHOD | 自定义类型 | ^[Function]`({row, column, rowIndex, colIndex,value})=>Type\|viod` | — |
| BODY_CELL_EDITOR_METHOD | 自定义编辑器类型 | ^[Function]`({row, column, rowIndex, colIndex,value})=>string\|viod` | — |
| BODY_CELL_RENDER_METHOD | 自定义单元格渲染 | ^[Function]`({row, column, rowIndex, colIndex,headIndex,visibleRows,rows})=>string\|viod` | — |
| SPAN_METHOD | 自定义跨列/行渲染 | ^[Function]`({row, column, rowIndex, colIndex,value,visibleLeafColumns,headIndex,headPosition,visibleRows,rows})=>SpanType` | — |
| SELECTABLE_METHOD | 自定义选择禁用 | ^[Function]`({row, rowIndex})=>boolean\|viod` | — |
| EXPAND_LAZY_METHOD | tree 懒加载展开 | ^[Function]`({row, column, rowIndex, colIndex,value})=>Promise<any[]>` | — |
| BEFORE_VALUE_CHANGE_METHOD | 数值改变前回调 | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — |
| BEFORE_PASTE_DATA_METHOD | 数值粘贴前回调 | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — |
| BEFORE_AUTOFILL_DATA_METHOD | 数值填充前回调 | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — |
| BEFORE_SET_SELECTOR_METHOD | 设置选择器前回调 | ^[Function]`(BeforeSetSelectorParams)=>BeforeSetSelectorParams\|viod` | — |
| BEFORE_SET_AUTOFILL_METHOD | 设置填充器前回调 | ^[Function]`(BeforeSetAutofillParams)=>BeforeSetAutofillParams\|viod` | — |
| BEFORE_COPY_METHOD | 数据复制前回调 | ^[Function]`(BeforeCopyParams)=>BeforeCopyParams\|viod` | — |

## Events

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| change | `常用方法之一`，数据改变回调包括复制填充等 | `{rowKey,key,value,row}` |
| selectionChange    | `常用方法之一`选择改变回调      | `rows`   |
| validateChangedData | `常用方法之一`，数据改变回调包括复制填充等，只有数据全部通过校验才会回调 | `{rowKey,key,value,row}` |
| autofillChange | 填充回调 | `{rowKey,key,value,row}` |
| editChange | 编辑回调 | `{rowKey,key,value,row}` |
| iterationChange | 每改变一个值的回调 | `{rowKey,key,value,row,oldValue,originalValue}` |
| resizeColumnChange | 表头调整回调 | `{colIndex,key,oldWidth, width, column, columns}` |
| resizeRowChange | 行调整回调 | `{rowIndex,oldHeight,height,rowKey, row, data}` |
| emptyChange | 空数据回调 | `{isEmpty,headerHeight,bodyHeight,width,height}` |
| expandChange | 展开回调 | — |
| toggleRowSelection | 行选择回调 | — |
| toggleAllSelection | 全选回调 | — |
| overflowContextmenuChange | 覆盖层回调 | `{show,list,clientX,clientY,cell}` |
| startEdit | 开始编辑回调 | focusCell |
| doneEdit | 结束编回调 | cellTarget |
| overlayerChange | 覆盖层改变回调 | overlayer |
| onScrollX | 横向滚动条回调 | scrollX |
| onScrollY | 纵向滚动条回调 | scrollY |
| clearSelectedDataChange | 清除数据回调 | changeList |
| cellMouseenter | 格子移入回调 | — |
| cellMousedown | 格子按下回调 | — |
| cellContextMenuClick | 右键菜单按下回调 | — |
| cellHeaderMousedown | 表头格子按下回调 | — |
| cellClick | body格子按下回调 | — |
| cellHoverChange | 格子hover回调 | — |
| cellHeaderHoverChange | 表头格子hover回调 | — |
| mouseup | mouseup回调 | — |
| click | click回调 | — |
| dblclick | dblclick回调 | — |
| contextMenu | contextMenu回调 | — |
| resize | resize回调 | — |
| mousedown | mousedown回调 | — |
| mousemove | mousemove回调 | — |
| keydown | keydown回调 | — |
| error | error回调 | — |

## Methods

| 方法名称               | 说明                          | 参数                                                      |
| ---------------------- | ----------------------------- | --------------------------------------------------------- |
| loadConfig             | 加载配置                      | 配置参考 config                                           |
| loadColumns            | 加载列配置                    | Column[]                                                  |
| loadData               | 加载 body 数据                | Row[]                                                     |
| loadFooterData         | 加载 footer 数据              | Row[]                                                     |
| on                     | 监听事件                      | `(event,callback)`配置参考 event                          |
| emit                   | 发出监听事件                  | `(event,callback)`配置参考 event                          |
| off                    | 移除监听事件                  | `(event,callback)`配置参考 event                          |
| filterMethod           | 过滤数据方法                  | FilterMethod                                              |
| setLoading             | 设置加载方法                  | boolean                                                   |
| clearEditor            | 清除编辑器及选中              |   —                                                         |
| editCell               | 主动启动编辑格子              | (rowIndex, colIndex)                                      |
| setItemValue           | 设置值                        | (rowKey, key, value, history, reDraw=true, isEditor=true) |
| setItemValueByEditor   | 通过编辑器设置值              | (rowKey, key, value, history, reDraw=true, isEditor=true) |
| batchSetItemValue      | 批量设置值                    | (ChangeItem[], reDraw=true, isEditor=true)                |
| getChangedData         | 获取已改变数据                | —                                                         |
| getChangedRows         | 获取已改变行数据              | —                                                         |
| validate               | 校验数据，true 滚到错误的地方 | boolean                                                   |
| validateFields         | 对部分表单字段进行校验的方法	 | (ValidateField[], scrollError=true)         |
| clearValidate          | 清除校验                      | —                                                         |
| setValidations         | 设置错误信息                  | ^[ValidateItemError]`[{message,key,rowKey}]`             |
| getValidations         | 校验数据并返回错误信息        | —                                                         |
| hasValidationError     | 是否有错误校验                | —                                                         |
| scrollTo               | 滚动位置                      | ^`(x,y)`                                                  |
| scrollXTo              | 滚动位置                      | x                                                         |
| scrollYTo              | 滚动位置                      | y                                                         |
| scrollToColkey         | 滚动位置                      | colKey                                                    |
| scrollToRowkey         | 滚动位置                      | rowKey                                                    |
| scrollToRowkey         | 滚动位置                      | rowKey                                                    |
| scrollToColIndex       | 滚动位置                      | colIndex                                                  |
| scrollToColIndex       | 滚动位置                      | colIndex                                                  |
| setExpandRowKeys       | 通过 rowKey 设置展开项        | (rowkeys[],boolean)                                       |
| toggleRowExpand        | 展开项取反                    | (rowKey, expand)                                          |
| toggleExpandAll        | 展开全部                      | boolean                                                   |
| clearSelection         | 清除选中                      | —                                                         |
| toggleRowSelection     | 取反                          | row                                                       |
| setSelectionByRows     | 设置选中                      | (rows,selected)                                           |
| setSelectionByRowKeys  | 通过 RowKeys 设置选中         | (RowKeys,selected)                                        |
| getSelectionRows       | 获取选中                      | —                                                         |
| toggleAllSelection     | 切换所有行的选中状态          | —                                                         |
| getPositionForRowIndex | 获取当前行的高度定位          | —                                                         |
| getCellValue           | 通过 rowKey 和 key 获取格子值 | (rowKey, key)                                             |
| getUtils               | 获取工具类方法，如内置合并行列方法                  | —                                     |
| contextMenuHide        | 隐藏右键菜单                  | —                                                         |
| destroy                | 销毁                          | —                                                         |


## Column
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key ^(required)| 列的唯一标识 | string | — |
| title ^(required)| 列的标题 | string | — |
| type| 列的类型 | ^[string]`index, selection, index-selection,tree` | — |
| operation | 指定列为操作列 | boolean | false |
| editorType | 指定列编辑器类型 | string | text |
| widthFillDisable | 指定当前列不可填充宽度 | boolean | true |
| hide | 指定列隐藏 | boolean | false |
| sort | 指定列排序 | number | 0 |
| width | 列的宽度 | number | 100 |
| align | 水平对齐方式 | `"left"`, `"center"`, `"right"` | center |
| verticalAlign | 垂直对齐方式 | `"top"`, `"middle"`, `"bottom"` | middle |
| fixed | 是否固定列 | `"left"`, `"right"` | — |
| render | 自定义渲染方法 | string\|Function | — |
| renderFooter | 自定义渲染底部方法 | string\|Function | — |
| renderHeader | 自定义渲染头部方法 | string\|Function | — |
| formatter | 格式化方法 | ^[Function]`({row, column, rowIndex, colIndex,value})=>string\|viod` | — |
| formatterFooter | 格式化底部方法 | ^[Function]`({row, column, rowIndex, colIndex,value})=>string\|viod` | — |
| readonly | 是否只读 | boolean | false |
| children | 子列 | Column[] | — |
| column | 当前列对象 | Column | — |
| overflowTooltipShow | 是否显示溢出提示 | boolean | true |
| overflowTooltipMaxWidth | 溢出提示的宽度 | number | 500 |
| overflowTooltipPlacement | 溢出提示的位置|  ^[string]`top, top-start, top-end, right, right-start, right-end, left, left-start, left-end, bottom, bottom-start, bottom-end` | — |
| rules | 校验规则 | Rules | — |

## Row

-   隐藏字段配置

| 参数       | 说明   | 类型   | 默认值 |
| ---------- | ------ | ------  | ------ |
| \_readonly | 行只读 | string   | false      |
| \_height   | 行高度 | string     | —      |
| \_hasChildren   | 是否有子，仅type=tree生效 | boolean  | —      |

## Rules

-   可参考 [async-validator](https://github.com/yiminghe/async-validator)

## CONTEXT_MENU 默认值
 
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