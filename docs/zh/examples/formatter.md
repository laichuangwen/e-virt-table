# 格式化

## Column

| 参数      | 说明       | 类型                                              | 可选值 | 默认值 |
| --------- | ---------- | ------------------------------------------------- | ------ | ------ |
| formatter | 格式化方法 | `({row, column,rowIndex,colIndex,value})=>string` | —      | —      |

## Config

| 方法名称              | 说明           | 参数                                              |
| --------------------- | -------------- | ------------------------------------------------- |
| CELL_FORMATTER_METHOD | 格式化方法更改（单元格格式化） | `({row, column,rowIndex,colIndex,value})=>string` |

## formatter

-   只能针对列属性

::: demo

<iframe src="/formatter/base.html" style="min-height:220px"></iframe>
:::

## CELL_FORMATTER_METHOD

-   精确到单元格格式化
-   注意 formatter 优先等级比 CELL_FORMATTER_METHOD 高

::: demo

<iframe src="/formatter/methods.html" style="min-height:220px"></iframe>
:::
