# 单元格编辑
注意默认不会带编辑输入功能的，主要为了方便各个框架拓展不仅仅能实现输入也能实现下拉、时间选择等~
- column中`readonly`控制列只读
- row中`_readonly`控制行只读
- `config.CELL_READONLY_METHOD`方法控制只读
- `config.EDIT_BG_COLOR`编辑背景色
- `startEdit` 开始编辑回调
- `doneEdit` 结束编辑回调
## 列只读/编辑
- 日期、姓名不可编辑，其他都可编辑
::: demo
<iframe src="/readonly/column.html" style="min-height:220px"></iframe>
:::

## 行只读/编辑
- 日期、姓名不可编辑，第一行不可编辑，其他都可编辑
- column全部设置`readonly`为`false`然后需要编辑row数据添加`_readonly`为`true`就可以了
::: demo
<iframe src="/readonly/row.html" style="min-height:220px"></iframe>
:::

## 方法控制只读/编辑
- 日期、姓名不可编辑，第一行不可编辑，其他都可编辑
- `config.CELL_READONLY_METHOD`方法控制只读
::: demo
<iframe src="/readonly/method.html" style="min-height:220px"></iframe>
:::

## 拓展编辑器（时间选择....等）
- 组件内部默认只有文本编辑
- 利用`editorType`、两个`startEdit`、`doneEdit`事件回调及`setItemValueByEditor`更新数据方法可实现拓展任意编辑器

下面例子是拓展了一个时间选择器的demo，其他拓展可参考
::: demo
<iframe src="/readonly/date.html" style="min-height:220px"></iframe>
:::