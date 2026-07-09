# 滚动条

## 方法

| 方法名称         | 说明                 | 参数                 |
| ---------------- | -------------------- | -------------------- |
| scrollTo         | 滚动到 x,y 位置      | `(x,y) => void`      |
| scrollXTo        | 滚动到 x 位置        | `(x) => void`        |
| scrollYTo        | 滚动到 y 位置        | `(y) => void`        |
| scrollToColkey   | 滚动到 colKey 位置   | `(colKey) => void`   |
| scrollToRowkey   | 滚动到 rowKey 位置   | `(rowKey) => void`   |
| scrollToColIndex | 滚动到 colIndex 位置 | `(colIndex) => void` |
| scrollToRowIndex | 滚动到 rowIndex 位置 | `(rowIndex) => void` |

## 更改滚动条位置

::: demo

scroller/base
h:420px
:::

## 内部滚动条

设置 `config.scrollbarMode` 为 `inner` 后，表头、单元格和表尾会使用完整可视区域，滚动条在悬停延迟后覆盖在右侧和底部。滚动条上的箭头可以临时收起，边缘箭头可以恢复显示。

::: demo

scroller/inner
h:380px
:::
