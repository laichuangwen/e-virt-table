# 索引

## Column

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| type | 列的序号 | string | `index,selection,index-selection,tree` | — |
| formatter | 格式化 | ^[function]`({row,rowIndex,colIndex,column,value}) => string` | — | — |

## 默认索引

-   type=index 列的行号

::: demo

index/base
h:220px
:::

## 自定义索引

-   formatter 更改索引

::: demo

index/custom
h:220px
:::
