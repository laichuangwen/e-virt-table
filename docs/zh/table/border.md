# 边框

`config.BORDER` 支持四种边框样式：

| 值 | 说明 |
| --- | --- |
| `default` | 完整边框，包含外边框、行线和列线 |
| `outer` | 只显示表格外边框 |
| `inner` | 表体只显示内部横向行线，表头和表尾保留内部列分割线 |
| `none` | 不显示表格边框 |

兼容旧写法：`true` 等同 `default`，`false` 等同 `inner`。

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
