# Scrollbar

## Methods

| Name             | Description                 | Parameters           |
| ---------------- | --------------------------- | -------------------- |
| scrollTo         | Scroll to x, y position     | `(x,y) => void`      |
| scrollXTo        | Scroll to x position        | `(x) => void`        |
| scrollYTo        | Scroll to y position        | `(y) => void`        |
| scrollToColkey   | Scroll to colKey position   | `(colKey) => void`   |
| scrollToRowkey   | Scroll to rowKey position   | `(rowKey) => void`   |
| scrollToColIndex | Scroll to colIndex position | `(colIndex) => void` |
| scrollToRowIndex | Scroll to rowIndex position | `(rowIndex) => void` |

## Change Scrollbar Position

::: demo

scroller/base
h:420px
:::

## Inner Scrollbar

Set `config.scrollbarMode` to `inner` to let the header, cells, and footer use the full visible area. The scrollbars appear over the right and bottom edges after a hover delay and hide when the pointer leaves the table.

::: demo

scroller/inner
h:380px
:::
