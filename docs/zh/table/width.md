# 宽度

-   整体宽度跟容器的宽度有关系
-   总宽度超过各列设置的宽度默认会平均填充，除非列设置`widthFillDisable`禁用填充

## Column

| 参数             | 说明                   | 类型    | 可选值 | 默认值 |
| ---------------- | ---------------------- | ------- | ------ | ------ |
| width            | 列的宽度               | number  | —      | 100    |
| widthFillDisable | 指定当前列不可填充宽度 | boolean | —      | —      |

## Config

| 参数                    | 说明           | 类型    | 可选值 | 默认值 |
| ----------------------- | -------------- | ------- | ------ | ------ |
| RESIZE_COLUMN_MIN_WIDTH | 列宽最小值     | number  | —      | 40     |
| ENABLE_RESIZE_COLUMN    | 启用列宽可调整 | boolean | —      | true   |

## Events

| 事件名称           | 说明         | 回调参数                                            |
| ------------------ | ------------ | --------------------------------------------------- |
| resizeColumnChange | 表头调整回调 | `({colIndex, key, oldWidth, width,column,columns})` |

## 总宽度

-   整体宽度跟容器的宽度有关系，所以设置外层宽度就行

::: demo

width/width
h:320px
:::

## 动态总宽度

1. 所有列 `widthFillDisable`为 true,这个总宽度就等于每一列的总和

::: demo

width/width-dynamic
h:320px
:::

2. 列`widthFillDisable`为 false 超过会被平均填充，最小 100

::: demo

width/width-dynamic1
h:320px
:::

## 默认列宽度

-   不设置 width 默认是 100

::: demo

width/base
h:320px
:::

## 设置列宽度

::: demo

width/setting
h:320px
:::

## 可调整列宽度

-   `config.ENABLE_RESIZE_COLUMN`为 true,可启用调整列宽，默认 true
-   `resizeColumnChange`为调整列后的回调

::: demo

width/resize
h:320px
:::
