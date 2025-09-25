# Inline Rendering

-   Expand and render custom content within table rows, supporting dynamic height and full-width display

## Column Configuration

| Parameter    | Description                                                                      | Type            | Default |
| ------------ | -------------------------------------------------------------------------------- | --------------- | ------- |
| extendRender | Row extension render function, only effective when AUTO_ROW_HEIGHT is enabled and column type is not tree | Function/string | —       |

## Config Configuration

| Parameter       | Description        | Type    | Default |
| --------------- | ------------------ | ------- | ------- |
| AUTO_ROW_HEIGHT | Enable auto row height | boolean | false   |

## Features

-   **Conditional Enable**: Only effective when `AUTO_ROW_HEIGHT` is `true`
-   **Type Restriction**: Does not support tree columns (`tree`, `selection-tree`, `tree-selection`)
-   **Full-width Rendering**: Extended content occupies the entire visible width, unaffected by fixed columns
-   **Dynamic Height**: Automatically adjusts height based on content
-   **Exclusive Expansion**: Only one extended content can be expanded per row
-   **Virtual Scroll Compatible**: Perfect support for virtual scrolling without affecting performance

## Basic Usage

-   Configure `extendRender` function for columns, click the expand icon to expand/collapse row content

::: demo

extend-render/base
h:420px
:::

## Multiple Inline Expansions

-   Multiple columns in the same row can be configured with `extendRender`, supporting different expansion content styles

::: demo

extend-render/multiple
h:420px
:::
