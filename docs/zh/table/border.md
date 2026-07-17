# 边框

`config.BORDER` 支持四种边框样式：

| 值 | 说明 |
| --- | --- |
| `default` | 完整边框，包含外边框、行线和列线 |
| `outer` | 只显示表格外边框 |
| `inner` | 表体只显示内部横向行线，表头和表尾保留内部列分割线 |
| `none` | 不显示表格边框 |

兼容旧写法：`true` 等同 `default`，`false` 等同 `inner`。

`HEADER_BORDER_COLOR` 和 `FOOTER_BORDER_COLOR` 只设置表头、表尾内部的列分割线颜色，未设置时继承 `BORDER_COLOR`。表格外边框、表头下边界、表尾上边界及其他横线始终使用 `BORDER_COLOR`。

## 自定义列分割线颜色

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
