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

## Tool-based Merge Method
> Note: This tool can only merge columns or rows individually. For more flexible scenarios, please refer to the examples above to implement your own solution.
- The following example demonstrates multi-level row and column merging using the tool.

::: demo

span/tool
h:430px
:::

## Merge Data Association
> The above tool example merges data without association, you can compare the differences.
- When merging data with association, if the data in the merged cells changes, it will automatically update the data in other related cells.
- When merging data with association, be aware that copying, pasting, and filling cells may cause error prompts. If you do not want to use the system's default prompt box, you can listen to the `error` event for custom handling.

::: demo

span/relation
h:430px
:::
