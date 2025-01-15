# 格式化

## Column

| 参数      | 说明       | 类型                                              | 默认值 |
| --------- | ---------- | ------------------------------------------------- | ------ |
| formatter | 格式化方法 | `({row, column,rowIndex,colIndex,value})=>string` | —      |

## Config

| 方法名称                   | 说明                                      | 参数                                              |
| -------------------------- | ----------------------------------------- | ------------------------------------------------- |
| BODY_CELL_FORMATTER_METHOD | 格式化方法更改（formatter优先等级比较高） | `({row, column,rowIndex,colIndex,value})=>string` |

## formatter

-   只能针对列属性

::: demo

formatter/base
h:320px
:::

## BODY_CELL_FORMATTER_METHOD

-   精确到单元格格式化
-   注意 formatter 优先等级比 BODY_CELL_FORMATTER_METHOD 高

::: demo

formatter/methods
h:320px
:::
