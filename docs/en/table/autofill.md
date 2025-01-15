# Cell Autofill

Autofill depends on the selector, so enabling autofill also requires enabling the selector.

## Config

| Parameter                | Description             | Type    | Optional Values | Default Value |
| ------------------------ | ----------------------- | ------- | --------------- | ------------- |
| ENABLE_SELECTOR          | Enable Selector         | boolean | —               | false         |
| ENABLE_AUTOFILL          | Enable Autofill         | boolean | —               | false         |
| ENABLE_SELECTOR_SINGLE   | Enable Single Selector  | boolean | —               | false         |
| ENABLE_SELECTOR_SPAN_COL | Enable Column Span      | boolean | —               | true          |
| ENABLE_SELECTOR_SPAN_ROW | Enable Row Span         | boolean | —               | true          |
| ENABLE_SELECTOR_ALL_ROWS | Enable Select All Rows  | boolean | —               | true          |
| ENABLE_SELECTOR_ALL_COLS | Enable Select All Columns | boolean | —             | true          |
| BEFORE_AUTOFILL_CHANGE_METHOD | Callback Before Autofill | ^[Function]`(BeforeChangeParams[])=>BeforeChangeParams[]\|Promise<BeforeChangeParams[]>` | — | — |

## Typings

```ts
type BeforeChangeParams = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
```

## Disable

- The selector is disabled by default.
- Autofill is disabled by default.
::: demo
autofill/disabled
h:320px
:::

## Enable

- The selector is disabled by default. To enable it, set `config.ENABLE_SELECTOR` to `true`.
- Autofill is disabled by default. To enable it, set `config.ENABLE_AUTOFILL` to `true`.
::: demo
autofill/enable
h:320px
:::

## Before Data Change

- `BEFORE_AUTOFILL_CHANGE_METHOD` can modify data before autofill, supporting Promise.
  
::: demo
autofill/before-change
h:320px
:::

## Column Autofill

Depending on the selector settings, column autofill requires the following settings:
- Set `config.ENABLE_SELECTOR` to `true`.
- Set `config.ENABLE_AUTOFILL` to `true`.
- Set `config.ENABLE_SELECTOR_SPAN_COL` to `false`.
- Set `config.ENABLE_SELECTOR_SPAN_ROW` to `true`.
- Set `config.ENABLE_SELECTOR_ALL_ROWS` to `true`.
- Set `config.ENABLE_SELECTOR_ALL_COLS` to `false`.
::: demo
autofill/col
h:320px
:::

## Row Autofill

Depending on the selector settings, row autofill requires the following settings:
- Set `config.ENABLE_SELECTOR` to `true`.
- Set `config.ENABLE_AUTOFILL` to `true`.
- Set `config.ENABLE_SELECTOR_SPAN_COL` to `true`.
- Set `config.ENABLE_SELECTOR_SPAN_ROW` to `false`.
- Set `config.ENABLE_SELECTOR_ALL_ROWS` to `false`.
- Set `config.ENABLE_SELECTOR_ALL_COLS` to `true`.
::: demo
autofill/row
h:320px
:::

## Scope Limitation
- `SELECTOR_AREA_MIN_X` Minimum X range of the selector.
- `SELECTOR_AREA_MAX_X_OFFSET` Maximum X range of the selector (colMax - offset).
- `SELECTOR_AREA_MAX_X` Maximum X range of the selector (0 for default colMax).
- `SELECTOR_AREA_MIN_Y` Minimum Y range of the selector.
- `SELECTOR_AREA_MAX_Y` Maximum Y range of the selector (0 for default rowMax).
- `SELECTOR_AREA_MAX_Y_OFFSET` Maximum Y range of the selector (0 for default rowMax - offset).

The following example limits the editable area. Note that currently, only one area is supported, and it cannot span multiple areas.

::: demo
autofill/scope
h:320px
:::
