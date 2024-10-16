# 宽度

## Column

| 参数  | 说明     | 类型   | 可选值 | 默认值 |
| ----- | -------- | ------ | ------ | ------ |
| width | 列的宽度 | number | —      | 100    |

## Config

| 参数                 | 说明                  | 类型    | 可选值 | 默认值 |
| -------------------- | --------------------- | ------- | ------ | ------ |
| WIDTH                | 宽度，为 0 表示自适应 | number  | —      | 0      |
| ENABLE_RESIZE_COLUMN | 启用列宽可调整        | boolean | —      | true   |

## Events

| 事件名称           | 说明         | 回调参数                                            |
| ------------------ | ------------ | --------------------------------------------------- |
| resizeColumnChange | 表头调整回调 | `({colIndex, key, oldWidth, width,column,columns})` |

## 总宽度

- WIDTH=0 为自适应
- WIDTH 设置超过总长度,超过部分会平均填充到每一列中

::: demo

<iframe src="/width/width.html" style="min-height:220px"></iframe>
:::

## 默认宽度

- 不设置 width 默认是 100

::: demo

<iframe src="/width/base.html" style="min-height:220px"></iframe>
:::

## 设置宽度

::: demo

<iframe src="/width/setting.html" style="min-height:220px"></iframe>
:::

## 可调整宽度

::: demo

<iframe src="/width/resize.html" style="min-height:220px"></iframe>
:::
