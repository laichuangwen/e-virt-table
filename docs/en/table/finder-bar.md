# Finder Bar

-   Since virtual tables cannot be searched by the system-level Ctrl + F, a custom search logic is required to find data.
-   When a match is found, the table will automatically scroll to the position and highlight the cell background
-   note: more data means longer search time

## Config

| Parameter             | Description                                | Type    | Default             |
| --------------------- | ------------------------------------------ | ------- | ------------------- |
| ENABLE_FINDER         | Enable the Finder Bar                      | boolean | true                |
| FINDER_CELL_BG_COLOR  | Background color for matched search result | string  | `rgb(255,229,144)`  |

## Column

| Parameter            | Description                                                              | Type                                                          | Default |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- | ------- |
| formatterFinderValue | Custom finder text merged with existing cell text; each cell counts once | `({row, column, rowIndex, colIndex, value}) => string \| void` | —       |

## Basic Example

::: demo Finder Bar

finder-bar/base
h:700px
:::

## Find Overlay Content

The overlay renders only visible rows, so the finder does not scan DOM nodes. Use `formatterFinderValue` to provide semantic overlay text. Canvas text and overlay text remain searchable, including rows outside the current viewport.

::: demo Find Overlay Content

finder-bar/layer
h:520px
:::
