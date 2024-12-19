# 单元格合并

## Config

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| SPAN_METHOD | 自定义跨列/行渲染 | ^[Function]`({row, column, rowIndex, colIndex,value,visibleLeafColumns,headIndex,headPosition,visibleRows,rows})=>{rowspan,colspan}` | — | — |

## 合并行

::: demo

<d-iframe src="/span/row.html" style="min-height:430px"></d-iframe>
:::

## 合并列

::: demo

<d-iframe src="/span/col.html" style="min-height:430px"></d-iframe>
:::

## 动态合并

-   `config.SPAN_METHOD` 合并方法

::: demo

<d-iframe src="/span/dynamic.html" style="min-height:430px"></d-iframe>
:::
