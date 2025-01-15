# 索引

## Column

| 参数      | 说明      | 类型                                                          | 默认值 |
| --------- | --------- | ------------------------------------------------------------- | ------ |
| type      | row的序号 | `index,selection,index-selection,tree`                        | —      |
| formatter | 格式化    | ^[function]`({row,rowIndex,colIndex,column,value}) => string` | —      |

## 默认

-   type=index 列的行号

::: demo

index/base
h:320px
:::

## 自定义

-   formatter 更改索引

::: demo

index/custom
h:320px
:::
