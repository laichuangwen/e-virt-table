# Copy and Paste

Pasting requires enabling the selector and keyboard

## Config

| Parameter                     | Description                    | Type     | Default Value |
| ------------------------ | ----------------------- | -------  | ------ |
| ENABLE_COPY | Enable Copy | boolean  | true |
| ENABLE_PASTER | Enable Paste | boolean  | true |
| BEFORE_PASTE_DATA_METHOD | Callback before paste | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — |

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

## Disable

- Enable selector
- Enable keyboard `ENABLE_KEYBOARD`, default true
- Enable copy `ENABLE_COPY`, default true
- Enable paste `ENABLE_PASTER`, default true
::: demo
paste/disabled
h:320px
:::

## Enable

- Enable selector
- Enable keyboard `ENABLE_KEYBOARD`, default true
- Enable copy `ENABLE_COPY`, default true
- Enable paste `ENABLE_PASTER`, default true
::: demo
paste/enable
h:320px
:::

## Before Paste Data Change

- BEFORE_AUTOFILL_DATA_METHOD can modify paste data, supports Promise

::: demo
paste/before-change
h:320px
:::

## Before Copy Data Change

- BEFORE_COPY_METHOD

::: demo
paste/before-copy
h:320px
:::