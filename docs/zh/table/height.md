# 高度

## RowData

- `RowData`中隐藏字段`_height`也可以调整高度，适应不同行高设置，默认`config.CELL_HEIGHT`
  | 参数 | 说明 | 类型 | 可选值 | 默认值 |
  | ----- | -------- | ------ | ------ | ------ |
  | \_height | 列的宽度 | number | — | 100 |

## Config

| 参数                 | 说明                                                        | 类型    | 可选值 | 默认值 |
| -------------------- | ----------------------------------------------------------- | ------- | ------ | ------ |
| HEIGHT               | 高度，为 0 表示自适应                                       | number  | —      | 0      |
| MAX_HEIGHT           | 最大高度，为 0 表示自适应高度根据 HEIGHT                    | number  | —      | 1000   |
| CELL_HEIGHT          | body 单元格默认行高                                         | number  | —      | 32     |
| ENABLE_RESIZE_ROW | 启用调整行高 | boolean | — | true |

## Events

| 事件名称        | 说明          | 回调参数                                            |
| --------------- | ------------- | --------------------------------------------------- |
| resizeRowChange | body 调整回调 | `({colIndex, key, oldWidth, width,column,columns})` |


## 默认总高度
- `MAX_HEIGHT`为1000
- `HEIGHT`为0，即自适应

::: demo

height/base
h:320px
:::

## 设置总高度

::: demo

height/set-height
h:445px
:::

## 最大总高度

- 设置最大高度

::: demo

height/max-height
h:445px
:::

## 设置总高度和最大总高度

- 注意`HEIGHT`、`MAX_HEIGHT`都设置为 0，表示垂直没有滚动条

::: demo

height/set-max-height
h:445px
:::

## `CELL_HEIGHT`设置行高

- 统一更改所有行高

::: demo

height/setting
h:320px
:::

## `_height`设置行高

- 可根据需求控制某行的高度

::: demo

height/data-setting
h:320px
:::

## 禁用调整行高
- 默认是开启调整行高的

::: demo

height/resize
h:350px
:::