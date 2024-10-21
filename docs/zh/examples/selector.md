# 单元格选择

## Config

| 参数                     | 说明                    | 类型    | 可选值 | 默认值 |
| ------------------------ | ----------------------- | ------- | ------ | ------ |
| ENABLE_SELECTOR          | 启用选择器              | boolean | —      | false   |
| ENABLE_SELECTOR_SINGLE   | 启用选择器-选择器单选   | boolean | —      | false  |
| ENABLE_SELECTOR_SPAN_COL | 启用选择器-批量跨列选择 | boolean | —      | true   |
| ENABLE_SELECTOR_SPAN_ROW | 启用选择器-批量跨行选择 | boolean | —      | true   |
| ENABLE_SELECTOR_ALL_ROWS | 启用选择器-批量选中列   | boolean | —      | true   |
| ENABLE_SELECTOR_ALL_COLS | 启用选择器-批量选中行   | boolean | —      | true   |

## 禁用

-   选择器默认是禁用

::: demo

<iframe src="/selector/disabled.html" style="min-height:220px"></iframe>
:::

## 启用

-   选择器默认是禁用，如果需要启用设置`config.ENABLE_SELECTOR`为`true`

::: demo

<iframe src="/selector/enable.html" style="min-height:220px"></iframe>
:::

## 单选

-   默认是批量选中的，如果需要单元格单选设置`config.ENABLE_SELECTOR_SINGLE`为`true`

::: demo

<iframe src="/selector/single.html" style="min-height:220px"></iframe>
:::

## 只选列

只选列需要设置如下:

-   设置`config.ENABLE_SELECTOR`为`true`
-   设置`config.ENABLE_SELECTOR_SPAN_COL`为`false`
-   设置`config.ENABLE_SELECTOR_SPAN_ROW`为`true`
-   设置`config.ENABLE_SELECTOR_ALL_ROWS`为`true`
-   设置`config.ENABLE_SELECTOR_ALL_COLS`为`false`

::: demo

<iframe src="/selector/col.html" style="min-height:220px"></iframe>
:::

## 只选行

只选行需要设置如下:

-   设置`config.ENABLE_SELECTOR`为`true`
-   设置`config.ENABLE_SELECTOR_SPAN_COL`为`true`
-   设置`config.ENABLE_SELECTOR_SPAN_ROW`为`false`
-   设置`config.ENABLE_SELECTOR_ALL_ROWS`为`false`
-   设置`config.ENABLE_SELECTOR_ALL_COLS`为`true`

::: demo

<iframe src="/selector/row.html" style="min-height:220px"></iframe>
:::

## 禁用批量

禁用表头批量选择和左侧批量选择需要设置如下:

-   设置`config.ENABLE_SELECTOR`为`true`
-   设置`config.ENABLE_SELECTOR_ALL_ROWS`为`false`
-   设置`config.ENABLE_SELECTOR_ALL_COLS`为`false` 

::: demo

<iframe src="/selector/batch.html" style="min-height:220px"></iframe>
:::
