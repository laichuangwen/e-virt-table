# formatter

## Column

| Parameter | Description | Type                                              | Default |
| --------- | ----------- | ------------------------------------------------- | ------- |
| formatter | Formatting method | `({row, column, rowIndex, colIndex, value}) => string` | —       |

## Config

| Method Name                | Description                                | Parameters                                         |
| -------------------------- | ------------------------------------------ | -------------------------------------------------- |
| BODY_CELL_FORMATTER_METHOD | Change formatting method (formatter has higher priority) | `({row, column, rowIndex, colIndex, value}) => string` |

## Column formatter

::: demo

formatter/base
h:320px
:::

## BODY_CELL_FORMATTER_METHOD

-   cell formatter
-   Note that formatter has a higher priority than BODY_CELL_FORMATTER_METHOD

::: demo

formatter/methods
h:320px
:::
