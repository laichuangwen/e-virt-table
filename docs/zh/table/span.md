# 单元格合并

## Config

| 参数                   | 说明                 | 类型                                                                                                                                 | 默认值 |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| SPAN_METHOD            | 自定义跨列/行渲染    | ^[Function]`({row, column, rowIndex, colIndex,value,visibleLeafColumns,headIndex,headPosition,visibleRows,rows})=>{rowspan,colspan}` | —      |
| ENABLE_MERGE_CELL_LINK | 启用合并格子数据关联 | boolean                                                                                                                              | false  |

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

## 工具类合并方法
> 注意：这个工具类只能单独合并列或行。如果需要更灵活的场景，请参考上面的例子自行实现。
- 下面的例子展示了利用工具类实现多级行合并及列合并。

::: demo

span/tool
h:430px
:::

## 合并数据关联
> 上面工具类例子是合并数据不关联的，可比对区别
- 合并数据关联时，如果合并单元格的数据有更改会自动更改其他相关单元格的数据。
- 合并数据关联需要注意在复制、粘贴、填充单元格时，可能会出现报错提示。如果不想使用系统自带的提示框，可以监听 `error` 事件进行自定义处理。

::: demo

span/relation
h:430px
:::
