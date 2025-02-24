# 单元格合并

## Config

| 参数 | 说明 | 类型  | 默认值 |
| --- | --- | ---  | --- |
| SPAN_METHOD | 自定义跨列/行渲染 | ^[Function]`({row, column, rowIndex, colIndex,value,visibleLeafColumns,headIndex,headPosition,visibleRows,rows})=>{rowspan,colspan}`  | — |
| ENABLE_MERGE_CELL_LINK | 启用合并选择器关联 | boolean | false |
| ENABLE_MERGE_DISABLED_PASTER | 启用合并禁用粘贴,错误信息在error回调中 | boolean | false |
| ENABLE_MERGE_DISABLED_AUTOFILL | 启用合并禁用填充,错误信息在error回调中 | boolean | false |

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
