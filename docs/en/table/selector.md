# Selector

## Column

| Parameter | Description    | Type    | Default |
| --------- | -------------- | ------- | ------- |
| operation | Enable operation column | boolean | false  |

## Config

| Parameter                  | Description                             | Type    | Default |
| -------------------------- | --------------------------------------- | ------- | ------- |
| ENABLE_SELECTOR            | Enable selector                         | boolean | false   |
| ENABLE_SELECTOR_SINGLE     | Enable single selection                 | boolean | false   |
| ENABLE_SELECTOR_SPAN_COL   | Enable multi-column selection           | boolean | true    |
| ENABLE_SELECTOR_SPAN_ROW   | Enable multi-row selection              | boolean | true    |
| ENABLE_SELECTOR_ALL_ROWS   | Enable select all rows                  | boolean | true    |
| ENABLE_SELECTOR_ALL_COLS   | Enable select all columns               | boolean | true    |
| SELECTOR_AREA_MIN_X        | Selector minimum X range                | number  | 0       |
| SELECTOR_AREA_MAX_X_OFFSET | Selector maximum X range colMax - offset| number  | 0       |
| SELECTOR_AREA_MAX_X        | Selector maximum X range, 0 for colMax  | number  | 0       |
| SELECTOR_AREA_MIN_Y        | Selector minimum Y range                | number  | 0       |
| SELECTOR_AREA_MAX_Y        | Selector maximum Y range, 0 for rowMax  | number  | 0       |
| SELECTOR_AREA_MAX_Y_OFFSET | Selector maximum Y range, 0 for rowMax - offset | number  | 0       |

## Disabled

-   The selector is disabled by default

::: demo

selector/disabled
h:320px
:::

## Enabled

-   The selector is disabled by default. To enable it, set `config.ENABLE_SELECTOR` to `true`
-   When the column is specified as operation, multiple rows can be selected

::: demo

selector/enable
h:320px
:::

## Single Selection

-   By default, multiple cells can be selected. To enable single cell selection, set `config.ENABLE_SELECTOR_SINGLE` to `true`

::: demo

selector/single
h:320px
:::

## Column Selection Only

To select columns only, set the following:

-   Set `config.ENABLE_SELECTOR` to `true`
-   Set `config.ENABLE_SELECTOR_SPAN_COL` to `false`
-   Set `config.ENABLE_SELECTOR_SPAN_ROW` to `true`
-   Set `config.ENABLE_SELECTOR_ALL_ROWS` to `true`
-   Set `config.ENABLE_SELECTOR_ALL_COLS` to `false`

::: demo
selector/col
h:320px
:::

## Row Selection Only

To select rows only, set the following:

-   Set `config.ENABLE_SELECTOR` to `true`
-   Set `config.ENABLE_SELECTOR_SPAN_COL` to `true`
-   Set `config.ENABLE_SELECTOR_SPAN_ROW` to `false`
-   Set `config.ENABLE_SELECTOR_ALL_ROWS` to `false`
-   Set `config.ENABLE_SELECTOR_ALL_COLS` to `true`
-   Specify operation

::: demo
selector/row
h:320px
:::

## Disable Batch Selection

To disable batch selection from the header and the left side, set the following:

-   Set `config.ENABLE_SELECTOR` to `true`
-   Set `config.ENABLE_SELECTOR_ALL_ROWS` to `false`
-   Set `config.ENABLE_SELECTOR_ALL_COLS` to `false`

::: demo

selector/batch
h:320px
:::

## Limit Range
-   `SELECTOR_AREA_MIN_X` Selector minimum X range
-   `SELECTOR_AREA_MAX_X_OFFSET` Selector maximum X range colMax - offset
-   `SELECTOR_AREA_MAX_X` Selector maximum X range, 0 for colMax
-   `SELECTOR_AREA_MIN_Y` Selector minimum Y range
-   `SELECTOR_AREA_MAX_Y` Selector maximum Y range, 0 for rowMax
-   `SELECTOR_AREA_MAX_Y_OFFSET` Selector maximum Y range, 0 for rowMax - offset

The example below limits the editable area. Note that currently only one area is supported, cross-area selection is not supported.

::: demo

selector/scope
h:320px
:::

## Method scoping
- BEFORE_SET_SELECTOR_METHOD

::: demo

selector/scope-method
h:320px
:::