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
| ENABLE_OFFSET_HEIGHT | 启用自适应，内部根据屏幕计算大小，与 OFFSET_HEIGHT 配合使用 | boolean | —      | false  |
| OFFSET_HEIGHT        | 表格顶部距离屏幕底部的偏移量                                | number  | —      | 0      |

## Events

| 事件名称        | 说明          | 回调参数                                            |
| --------------- | ------------- | --------------------------------------------------- |
| resizeRowChange | body 调整回调 | `({colIndex, key, oldWidth, width,column,columns})` |

- `config.HEADER_HEIGHT`可调整表头行高度,默认 32
- `config.CELL_HEIGHT`可调整行高度，默认 32
- `RowData`中隐藏字段`_height`也可以调整高度，适应不同行高设置，默认`config.CELL_HEIGHT`

## 默认高度

- 注意两个高度都设置为 0，表示没有滚动条这样水平不会虚拟滚动

::: demo

<iframe src="/height/base.html" style="min-height:220px"></iframe>
:::

## 设置高度

::: demo

<iframe src="/height/set-height.html" style="min-height:445px"></iframe>
:::

## 最大高度

- 设置最大高度

::: demo

<iframe src="/height/max-height.html" style="min-height:445px"></iframe>
:::

## 设置高度和最大高度

- 注意两个高度都设置为 0 会没有滚动条，水平不会虚拟滚动

::: demo

<iframe src="/height/set-max-height.html" style="min-height:445px"></iframe>
:::

## ENABLE_OFFSET_HEIGHT

- 全屏看效果

::: demo

<iframe src="/height/offset-height.html" style="min-height:420px"></iframe>
:::

## `CELL_HEIGHT`设置行高

- 统一更改所有行高

::: demo

<iframe src="/height/setting.html" style="min-height:320px"></iframe>
:::

## `_height`设置行高

- 可根据需求东东控制某行的高度

::: demo

<iframe src="/height/data-setting.html" style="min-height:320px"></iframe>
:::
