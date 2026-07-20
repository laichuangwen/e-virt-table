# Width

-   The overall width is related to the width of the container.
-   If the total width exceeds the set width of each column, it will be evenly filled by default unless the column sets `widthFillDisable` to disable filling.

## Column

| Parameter        | Description                                  | Type    | Default |
| ---------------- | -------------------------------------------- | ------- | ------- |
| width            | Width of the column                          | number  | 100     |
| widthFillDisable | Disable width filling for the current column | boolean | false   |

## Config

| Parameter                   | Description                                                  | Type    | Default        |
| --------------------------- | ------------------------------------------------------------ | ------- | -------------- |
| RESIZE_COLUMN_MIN_WIDTH     | Adjustable minimum column width                              | number  | 40             |
| ENABLE_RESIZE_COLUMN        | Enable column width adjustment                               | boolean | true           |
| RESIZE_COLUMN_DIVIDER_COLOR | Static header and footer divider color for resizable columns | string  | `BORDER_COLOR` |
| RESIZE_COLUMN_LINE_COLOR    | Full-height guide color while resizing a column              | string  | #e1e6eb        |

## Events

| Event Name         | Description         | Callback Parameters                                   |
| ------------------ | ------------------- | ----------------------------------------------------- |
| resizeColumnChange | Adjustment callback | `({colIndex, key, oldWidth, width, column, columns})` |

## Total Width

-   The overall width is related to the width of the container, so just set the outer width.

::: demo

width/width
h:320px
:::

## Dynamic Total Width

1. If all columns have `widthFillDisable` set to true, the total width equals the sum of each column.

::: demo

width/width-dynamic
h:320px
:::

2. If the column `widthFillDisable` is set to false, the excess will be evenly filled, with a minimum of 100.

::: demo

width/width-dynamic1
h:320px
:::

## Default Column Width

-   If width is not set, the default is 100.

::: demo

width/base
h:320px
:::

## Set Column Width

::: demo

width/setting
h:320px
:::

## Adjustable Column Width

-   If `config.ENABLE_RESIZE_COLUMN` is set to true, column width adjustment can be enabled, default is true.
-   Use `config.RESIZE_COLUMN_DIVIDER_COLOR` or the `--evt-resize-column-divider-color` CSS variable to customize static column dividers. Unset values use `BORDER_COLOR`.
-   `resizeColumnChange` is the callback after adjustment.

::: demo

width/resize
h:320px
:::

## Resizable Column Divider Color

The blue static column dividers use `--evt-resize-column-divider-color`. While resizing, the red full-height guide uses `RESIZE_COLUMN_LINE_COLOR`.

::: demo

width/resize-divider-color
h:320px
:::
