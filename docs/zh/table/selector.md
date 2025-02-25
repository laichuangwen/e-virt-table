# 单元格选择

## Column

| 参数      | 说明       | 类型    | 默认值 |
| --------- | ---------- | ------- | ------ |
| operation | 开启操作列 | boolean | false  |

## Config

| 参数                       | 说明                                   | 类型    | 默认值 |
| -------------------------- | -------------------------------------- | ------- | ------ |
| ENABLE_SELECTOR            | 启用选择器                             | boolean | false  |
| ENABLE_SELECTOR_SINGLE     | 启用选择器-选择器单选                  | boolean | false  |
| ENABLE_SELECTOR_SPAN_COL   | 启用选择器-批量跨列选择                | boolean | true   |
| ENABLE_SELECTOR_SPAN_ROW   | 启用选择器-批量跨行选择                | boolean | true   |
| ENABLE_SELECTOR_ALL_ROWS   | 启用选择器-批量选中列                  | boolean | true   |
| ENABLE_SELECTOR_ALL_COLS   | 启用选择器-批量选中行                  | boolean | true   |
| SELECTOR_AREA_MIN_X        | 选择器X最小范围                        | number  | 0      |
| SELECTOR_AREA_MAX_X_OFFSET | 选择器X最大范围 colMax - offset        | number  | 0      |
| SELECTOR_AREA_MAX_X        | 选择器X最大范围, 0默认最大 colMax      | number  | 0      |
| SELECTOR_AREA_MIN_Y        | 选择器Y最小范围                        | number  | 0      |
| SELECTOR_AREA_MAX_Y        | 选择器Y最大范围, 0默认 rowMax          | number  | 0      |
| SELECTOR_AREA_MAX_Y_OFFSET | 选择器Y最大范围, 0默认 rowMax - offset | number  | 0      |
| BEFORE_SET_SELECTOR_METHOD | 设置选择器前回调 | ^[Function]`(BeforeSetSelectorParams)=>BeforeSetSelectorParams\|viod` | — |


## 禁用

-   选择器默认是禁用

::: demo

selector/disabled
h:320px
:::

## 启用

-   选择器默认是禁用，如果需要启用设置`config.ENABLE_SELECTOR`为`true`
-   列指定为operation时，可多选行

::: demo

selector/enable
h:320px
:::

## 单选

-   默认是批量选中的，如果需要单元格单选设置`config.ENABLE_SELECTOR_SINGLE`为`true`

::: demo

selector/single
h:320px
:::

## 只选列

只选列需要设置如下:

-   设置`config.ENABLE_SELECTOR`为`true`
-   设置`config.ENABLE_SELECTOR_SPAN_COL`为`false`
-   设置`config.ENABLE_SELECTOR_SPAN_ROW`为`true`
-   设置`config.ENABLE_SELECTOR_ALL_ROWS`为`true`
-   设置`config.ENABLE_SELECTOR_ALL_COLS`为`false`

::: demo
selector/col
h:320px
:::

## 只选行

只选行需要设置如下:

-   设置`config.ENABLE_SELECTOR`为`true`
-   设置`config.ENABLE_SELECTOR_SPAN_COL`为`true`
-   设置`config.ENABLE_SELECTOR_SPAN_ROW`为`false`
-   设置`config.ENABLE_SELECTOR_ALL_ROWS`为`false`
-   设置`config.ENABLE_SELECTOR_ALL_COLS`为`true`
-   指定operation


::: demo
selector/row
h:320px
:::

## 禁用批量

禁用表头批量选择和左侧批量选择需要设置如下:

-   设置`config.ENABLE_SELECTOR`为`true`
-   设置`config.ENABLE_SELECTOR_ALL_ROWS`为`false`
-   设置`config.ENABLE_SELECTOR_ALL_COLS`为`false` 

::: demo

selector/batch
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

selector/scope
h:320px
:::


## 方法限定范围
- BEFORE_SET_SELECTOR_METHOD

::: demo

selector/scope-method
h:320px
:::
