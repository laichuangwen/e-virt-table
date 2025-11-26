# Finder Bar

-   Since virtual tables cannot be searched by the system-level Ctrl + F, a custom search logic is required to find data.
-   When a match is found, the table will automatically scroll to the position and highlight the cell background
-   note: more data means longer search time

## Config

| Parameter             | Description                                | Type    | Default             |
| --------------------- | ------------------------------------------ | ------- | ------------------- |
| ENABLE_FINDER         | Enable the Finder Bar                      | boolean | true                |
| FINDER_CELL_BG_COLOR  | Background color for matched search result | string  | `rgb(255,229,144)`  |

## Example

::: demo Finder Bar

finder-bar/base
h:700px
:::