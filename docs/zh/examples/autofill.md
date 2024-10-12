# 单元格填充

注意默认不会带编辑输入功能的, 具体查看单元格编辑，填充依赖选择器所以启动填充也需要启动选择器

- 启用选择器：`config.ENABLE_SELECTOR`为`false`
- 启用填充：`config.ENABLE_AUTOFILL`为`false`
- 启用选择器可跨列： `config.ENABLE_SELECTOR_SPAN_COL`为`true`
- 启用选择器可跨行：`config.ENABLE_SELECTOR_SPAN_ROW`为`true`
- 启用选择器批量选中行（全选行）：`config.ENABLE_SELECTOR_ALL_ROWS`为`true`
- 启用选择器批量选中列（全选列）：`config.ENABLE_SELECTOR_ALL_COLS`为`true`

## 禁用

- 选择器默认是禁用
- 填充默认是禁用
::: demo
<iframe src="/autofill/disabled.html" style="min-height:210px"></iframe>
:::

## 启用

- 选择器默认是禁用，如果需要启用设置`config.ENABLE_SELECTOR`为`true`
- 选择器默认是禁用，如果需要启用设置`config.ENABLE_AUTOFILL`为`true`
::: demo
<iframe src="/autofill/enable.html" style="min-height:210px"></iframe>
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

<iframe src="/autofill/col.html" style="min-height:210px"></iframe>
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

<iframe src="/autofill/row.html" style="min-height:210px"></iframe>
:::
