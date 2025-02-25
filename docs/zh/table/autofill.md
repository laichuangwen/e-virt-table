# 单元格填充

填充依赖选择器所以启动填充也需要启动选择器

## Config

| 参数                     | 说明                    | 类型     | 默认值 |
| ------------------------ | ----------------------- | -------  | ------ |
| ENABLE_SELECTOR          | 启用选择器              | boolean     | false   |
| ENABLE_AUTOFILL          | 启用填充器              | boolean      | false   |
| ENABLE_SELECTOR_SINGLE   | 启用选择器-选择器单选   | boolean      | false  |
| ENABLE_SELECTOR_SPAN_COL | 启用选择器-批量跨列选择 | boolean      | true   |
| ENABLE_SELECTOR_SPAN_ROW | 启用选择器-批量跨行选择 | boolean       | true   |
| ENABLE_SELECTOR_ALL_ROWS | 启用选择器-批量选中列   | boolean    | true   |
| ENABLE_SELECTOR_ALL_COLS | 启用选择器-批量选中行   | boolean      | true   |
| BEFORE_AUTOFILL_DATA_METHOD | 数值填充前回调 | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — | — |
| BEFORE_SET_AUTOFILL_METHOD | 设置填充器前回调 | ^[Function]`(BeforeSetAutofillParams)=>BeforeSetAutofillParams\|viod` | — |

## Typings

``` ts
type BeforeChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
```

## 禁用

- 选择器默认是禁用
- 填充默认是禁用
::: demo
autofill/disabled
h:320px
:::

## 启用

- 选择器默认是禁用，如果需要启用设置`config.ENABLE_SELECTOR`为`true`
- 选择器默认是禁用，如果需要启用设置`config.ENABLE_AUTOFILL`为`true`
::: demo
autofill/enable
h:320px
:::

## 数据更改前

- BEFORE_AUTOFILL_DATA_METHOD可篡改填充前数据，支持Promise
  
::: demo

autofill/before-change
h:320px
:::


## 列填充
依赖选择器的设置，行填充需要设置如下:
- 设置`config.ENABLE_SELECTOR`为`true`
- 设置`config.ENABLE_AUTOFILL`为`true`
- 设置`config.ENABLE_SELECTOR_SPAN_COL`为`false`
- 设置`config.ENABLE_SELECTOR_SPAN_ROW`为`true`
- 设置`config.ENABLE_SELECTOR_ALL_ROWS`为`true`
- 设置`config.ENABLE_SELECTOR_ALL_COLS`为`false`
::: demo
autofill/col
h:320px
:::

## 行填充

依赖选择器的设置，行填充需要设置如下:
- 设置`config.ENABLE_SELECTOR`为`true`
- 设置`config.ENABLE_AUTOFILL`为`true`
- 设置`config.ENABLE_SELECTOR_SPAN_COL`为`true`
- 设置`config.ENABLE_SELECTOR_SPAN_ROW`为`false`
- 设置`config.ENABLE_SELECTOR_ALL_ROWS`为`false`
- 设置`config.ENABLE_SELECTOR_ALL_COLS`为`true`
::: demo
autofill/row
h:320px
:::

## 限定范围
-   `SELECTOR_AREA_MIN_X` 选择器X最小范围
-   `SELECTOR_AREA_MAX_X_OFFSET` 选择器X最大范围colMax - offset
-   `SELECTOR_AREA_MAX_X` 选择器X最大范围,0默认最大colMax
-   `SELECTOR_AREA_MIN_Y` 选择器Y最小范围
-   `SELECTOR_AREA_MAX_Y` 选择器Y最大范围,0默认rowMax
-   `SELECTOR_AREA_MAX_Y_OFFSET` 选择器Y最大范围,0默认rowMax- offset

下面例子限制可编辑区域，注意目前只能支持一个区域，不能跨域区域

::: demo
autofill/scope
h:320px
:::

## 方法限定范围
- BEFORE_SET_AUTOFILL_METHOD

::: demo

autofill/scope-method
h:320px
:::