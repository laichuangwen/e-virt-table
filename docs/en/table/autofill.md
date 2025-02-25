# Autofill

Autofill relies on the selector, so enabling autofill also requires enabling the selector.

## Config

| Parameter                | Description             | Type     | Default |
| ------------------------ | ----------------------- | -------  | ------- |
| ENABLE_SELECTOR          | Enable selector         | boolean  | false   |
| ENABLE_AUTOFILL          | Enable autofill         | boolean  | false   |
| ENABLE_SELECTOR_SINGLE   | Enable single selector  | boolean  | false   |
| ENABLE_SELECTOR_SPAN_COL | Enable span column selector | boolean | true   |
| ENABLE_SELECTOR_SPAN_ROW | Enable span row selector | boolean  | true   |
| ENABLE_SELECTOR_ALL_ROWS | Enable select all rows  | boolean  | true   |
| ENABLE_SELECTOR_ALL_COLS | Enable select all columns | boolean | true   |
| BEFORE_AUTOFILL_DATA_METHOD | Callback before autofill change | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — | — |

## Typings

``` ts
type BeforeChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
```

## Disabled

- Selector is disabled by default
- Autofill is disabled by default
::: demo
autofill/disabled
h:320px
:::

## Enabled

- Selector is disabled by default, to enable set `config.ENABLE_SELECTOR` to `true`
- Autofill is disabled by default, to enable set `config.ENABLE_AUTOFILL` to `true`
::: demo
autofill/enable
h:320px
:::

## Before Data Change

- BEFORE_AUTOFILL_DATA_METHOD can modify data before autofill, supports Promise
  
::: demo
autofill/before-change
h:320px
:::

## Column Autofill

Depending on the selector settings, column autofill requires the following settings:
- Set `config.ENABLE_SELECTOR` to `true`
- Set `config.ENABLE_AUTOFILL` to `true`
- Set `config.ENABLE_SELECTOR_SPAN_COL` to `false`
- Set `config.ENABLE_SELECTOR_SPAN_ROW` to `true`
- Set `config.ENABLE_SELECTOR_ALL_ROWS` to `true`
- Set `config.ENABLE_SELECTOR_ALL_COLS` to `false`
::: demo
autofill/col
h:320px
:::

## Row Autofill

Depending on the selector settings, row autofill requires the following settings:
- Set `config.ENABLE_SELECTOR` to `true`
- Set `config.ENABLE_AUTOFILL` to `true`
- Set `config.ENABLE_SELECTOR_SPAN_COL` to `true`
- Set `config.ENABLE_SELECTOR_SPAN_ROW` to `false`
- Set `config.ENABLE_SELECTOR_ALL_ROWS` to `false`
- Set `config.ENABLE_SELECTOR_ALL_COLS` to `true`
::: demo
autofill/row
h:320px
:::

## Limit Range
- `SELECTOR_AREA_MIN_X` Minimum X range for selector
- `SELECTOR_AREA_MAX_X_OFFSET` Maximum X range for selector (colMax - offset)
- `SELECTOR_AREA_MAX_X` Maximum X range for selector, 0 defaults to colMax
- `SELECTOR_AREA_MIN_Y` Minimum Y range for selector
- `SELECTOR_AREA_MAX_Y` Maximum Y range for selector, 0 defaults to rowMax
- `SELECTOR_AREA_MAX_Y_OFFSET` Maximum Y range for selector, 0 defaults to rowMax - offset

The following example limits the editable area. Note that currently only one area is supported, cross-area is not supported.

::: demo
autofill/scope
h:320px
:::

## Method scoping
- BEFORE_SET_AUTOFILL_METHOD

::: demo

autofill/scope-method
h:320px
:::