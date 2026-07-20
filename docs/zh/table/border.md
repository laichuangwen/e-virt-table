# 边框

`config.BORDER` 支持四种边框样式：

| 值 | 说明 |
| --- | --- |
| `default` | 完整边框，包含外边框、行线和列线 |
| `outer` | 只显示表格外边框 |
| `inner` | 表体只显示内部横向行线，表头和表尾保留内部列分割线 |
| `none` | 不显示表格边框 |

兼容旧写法：`true` 等同 `default`，`false` 等同 `inner`。

启用列宽调整时，`RESIZE_COLUMN_DIVIDER_COLOR` 或 CSS 变量 `--evt-resize-column-divider-color` 可设置表头、表尾的静态列分割线颜色。未设置或禁用列宽调整时使用 `BORDER_COLOR`。`RESIZE_COLUMN_LINE_COLOR` 仍只控制拖动调整列宽时的贯穿引导线。

## 可调整列宽分割线颜色

::: demo

border/color
h:320px
:::

## 完整边框

::: demo

border/default
h:320px
:::

## 仅外边框

::: demo

border/outer
h:320px
:::

## 内部边框

::: demo

border/inner
h:320px
:::

## 无边框

::: demo

border/none
h:320px
:::
