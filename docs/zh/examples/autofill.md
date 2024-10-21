# 单元格填充

填充依赖选择器所以启动填充也需要启动选择器

## Config

| 参数                     | 说明                    | 类型    | 可选值 | 默认值 |
| ------------------------ | ----------------------- | ------- | ------ | ------ |
| ENABLE_SELECTOR          | 启用选择器              | boolean | —      | false   |
| ENABLE_AUTOFILL          | 启用填充器              | boolean | —      | false   |
| ENABLE_SELECTOR_SINGLE   | 启用选择器-选择器单选   | boolean | —      | false  |
| ENABLE_SELECTOR_SPAN_COL | 启用选择器-批量跨列选择 | boolean | —      | true   |
| ENABLE_SELECTOR_SPAN_ROW | 启用选择器-批量跨行选择 | boolean | —      | true   |
| ENABLE_SELECTOR_ALL_ROWS | 启用选择器-批量选中列   | boolean | —      | true   |
| ENABLE_SELECTOR_ALL_COLS | 启用选择器-批量选中行   | boolean | —      | true   |

## 禁用

- 选择器默认是禁用
- 填充默认是禁用
::: demo
<iframe src="/autofill/disabled.html" style="min-height:220px"></iframe>
:::

## 启用

- 选择器默认是禁用，如果需要启用设置`config.ENABLE_SELECTOR`为`true`
- 选择器默认是禁用，如果需要启用设置`config.ENABLE_AUTOFILL`为`true`
::: demo
<iframe src="/autofill/enable.html" style="min-height:220px"></iframe>
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

<iframe src="/autofill/col.html" style="min-height:220px"></iframe>
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

<iframe src="/autofill/row.html" style="min-height:220px"></iframe>
:::
