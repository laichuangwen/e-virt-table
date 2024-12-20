# 单元格合并

## Config

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| SPAN_METHOD | 自定义跨列/行渲染 | ^[Function]`({row, column, rowIndex, colIndex,value,visibleLeafColumns,headIndex,headPosition,visibleRows,rows})=>{rowspan,colspan}` | — | — |

## 合并行

::: demo

span/row
h:430px
:::

## 合并列

::: demo

span/col
h:430px
:::

## 动态合并

-   `config.SPAN_METHOD` 合并方法

::: demo

span/dynamic
h:430px
:::
