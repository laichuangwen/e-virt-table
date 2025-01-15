# Merge

## Config

| Parameter | Description | Type  | Default |
| --- | --- | ---  | --- |
| SPAN_METHOD | Custom column/row rendering | ^[Function]`({row, column, rowIndex, colIndex, value, visibleLeafColumns, headIndex, headPosition, visibleRows, rows}) => {rowspan, colspan}`  | — |

## Merge Rows

::: demo

span/row
h:430px
:::

## Merge Columns

::: demo

span/col
h:430px
:::

## Dynamic Merging

-   `config.SPAN_METHOD` merging method

::: demo

span/dynamic
h:430px
:::
