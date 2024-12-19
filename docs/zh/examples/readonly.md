# 单元格编辑

## Column

| 参数       | 说明       | 类型    | 可选值 | 默认值 |
| ---------- | ---------- | ------- | ------ | ------ |
| readonly   | 控制列只读 | boolean | —      | false  |
| editorType | 编辑器类型 | sting   | —      | false  |

## Row

| 参数       | 说明       | 类型    | 可选值 | 默认值 |
| ---------- | ---------- | ------- | ------ | ------ |
| \_readonly | 控制行只读 | boolean | —      | false  |

## Config

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| BODY_CELL_READONLY_METHOD | 自定义只读 | `Function({row, column, rowIndex, colIndex,value})=>boolean` | — | — |
| BODY_CELL_EDITOR_TYPE_METHOD | 自定义编辑器类型 | `Function({row, column, rowIndex, colIndex,value})=>string` | — | — |
| BEFORE_VALUE_CHANGE_METHOD |改变前的回调方法，用于更改编辑后的值  | `Function({rowKey, key, oldValue, originalValue,value})=>any` | — | — |
| EDIT_BG_COLOR | 可编辑背景色 | string | — | `rgba(221,170,83,0.1)` |

## Methods

| 方法名称             | 说明                             | 参数                                                  |
| -------------------- | -------------------------------- | ----------------------------------------------------- |
| setItemValueByEditor | 更新数据方法可实现拓展任意编辑器 | `(rowKey, key, value, history = true, reDraw = true)` |

## Events

| 事件名称  | 说明         | 回调参数 |
| --------- | ------------ | -------- |
| startEdit | 开始编辑回调 | `cell`   |
| doneEdit  | 结束编辑回调 | `cell`   |
| change  | 编辑值改变的回调 | 当前改变值数组   |

注意默认只自带文本编辑功能的，也可以拓展根据需求拓展下拉、时间选择等~

## 列只读/编辑

-   readonly=true,指定列不可编辑
-   日期、姓名不可编辑，其他都可编辑

::: demo

<d-iframe src="/readonly/column.html" style="min-height:220px"></d-iframe>
:::

## 行只读/编辑

-   日期、姓名不可编辑，第一行不可编辑，其他都可编辑
-   column 全部设置`readonly`为`false`然后需要编辑 row 数据添加`_readonly`为`true`就可以了

::: demo

<d-iframe src="/readonly/row.html" style="min-height:220px"></d-iframe>
:::

## 方法控制只读/编辑

-   `config.BODY_CELL_READONLY_METHOD`方法控制只读
-   日期、姓名不可编辑，第一行不可编辑，其他都可编辑

::: demo

<d-iframe src="/readonly/method.html" style="min-height:220px"></d-iframe>
:::

## 拓展编辑器（时间选择....等）

-   组件内部默认只有文本编辑
-   利用`editorType`、两个`startEdit`、`doneEdit`事件回调及`setItemValueByEditor`更新数据方法可实现拓展任意编辑器
-   内部建议传递`editorElement`

下面例子是拓展了一个时间选择器的 demo，其他拓展可参考这个例子

::: demo

<d-iframe src="/readonly/date.html" style="min-height:220px"></d-iframe>
:::

## 方法控制编辑器类型

-   更改 key=date&&rowIndex=1 为 text 类型

从下面的例子可以实现同一列可以支持很多编辑器类型

::: demo

<d-iframe src="/readonly/editType-method.html" style="min-height:220px"></d-iframe>
:::

## 更改编辑后的值

- 注意和formatter的区别，BEFORE_VALUE_CHANGE_METHOD更改的是赋值。

从下面的例子可以年龄是数字类型，只有输入数字类型才更改值

::: demo

<d-iframe src="/readonly/value-change.html" style="min-height:220px"></d-iframe>
:::