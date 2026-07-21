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

| Parameter                      | Description                    | Type                                                                            | Default |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------------------------- | ------- |
| formatterFinderValue           | Custom Body finder text        | `({row, column, rowIndex, colIndex, value, displayText}) => string \| void`      | —       |
| formatterFinderHeaderValue     | Custom Header finder text      | `({column, rowIndex, colIndex, value, displayText}) => string \| void`           | —       |
| formatterFinderFooterValue     | Custom Footer finder text      | `({row, column, rowIndex, colIndex, value, displayText}) => string \| void`      | —       |

Returning a string replaces the default finder text for that section. Returning `undefined` falls back to the Canvas display text. Returning an empty string excludes the cell from the finder. `value` is the raw value and `displayText` is the Canvas display text.

## Basic Example

::: demo Finder Bar

finder-bar/base
h:700px
:::

## Find Overlay Content

The overlay renders only visible rows, so the finder does not scan DOM nodes. Use `formatterFinderHeaderValue`, `formatterFinderValue`, and `formatterFinderFooterValue` to provide the complete semantic text for Header, Body, and Footer overlays. All three overlay sections remain searchable, including Body rows outside the current viewport.

::: demo Find Overlay Content

finder-bar/layer
h:520px
:::
