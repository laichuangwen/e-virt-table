# Height

## RowData

- The hidden field `_height` in `RowData` can also adjust the height to fit different row height settings, default is `config.CELL_HEIGHT`
  | Parameter | Description | Type   | Default       |
  | --------- | ----------- | ------ | ------------- |
  | \_height  | Row height  | number | `CELL_HEIGHT` |

## Config

| Parameter            | Description                            | Type    | Default |
| -------------------- | -------------------------------------- | ------- | ------- |
| HEIGHT               | Height (0 means auto fit)              | number  | 0       |
| MAX_HEIGHT           | Maximum height, (0 means auto fit)     | number  | 1000    |
| CELL_HEIGHT          | Default row height for body cells      | number  | 32      |
| ENABLE_RESIZE_ROW | Enable row height adjustment | boolean | — | true |

## Events

| Name            | Description         | Callback                                              |
| --------------- | ------------------- | ----------------------------------------------------- |
| resizeRowChange | Adjustment callback | `({colIndex, key, oldWidth, width, column, columns})` |

## Default Height
- `MAX_HEIGHT` is 1000
- `HEIGHT` is 0 (0 means auto fit)

::: demo

height/base
h:320px
:::

## HEIGHT

::: demo

height/set-height
h:445px
:::

## MAX_HEIGHT

- Set maximum height

::: demo

height/max-height
h:445px
:::

## MAX_HEIGHT&HEIGHT

- Note that setting both `HEIGHT` and `MAX_HEIGHT` to 0 means no vertical scrollbar

::: demo

height/set-max-height
h:445px
:::

## CELL_HEIGHT

- Set the height by `CELL_HEIGHT`

::: demo

height/setting
h:320px
:::

## _height

- Set the height by row data

::: demo

height/data-setting
h:400px
:::

## Disable Row Height Adjustment
- By default, row height adjustment is enabled

::: demo

height/resize
h:350px
:::