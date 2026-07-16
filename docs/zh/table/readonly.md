# 单元格编辑

## Column

| 参数           | 说明                                       | 类型                                                                                      | 默认值 |
| -------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- | ------ |
| readonly       | 控制列只读                                 | boolean                                                                                   | false  |
| editorType     | 编辑器类型                                 | sting                                                                                     | false  |
| editorProps    | 传递给编辑器的属性                         | object                                                                                    | {}     |
| canValueChange | 列级别值变更拦截，返回 `false` 则取消本次修改 | ^[Function]`(BeforeValueChangeItem)=>boolean\|Promise<boolean>`                           | —      |
| valueChange    | 列级别值变更成功后的回调，常用于联动赋值   | ^[Function]`(BeforeValueChangeItem)=>void`                                                | —      |

## Row

| 参数       | 说明       | 类型    | 默认值 |
| ---------- | ---------- | ------- | ------ |
| \_readonly | 控制行只读 | boolean | false  |

## Config

| 参数                       | 说明                 | 类型                                                                               | 默认值                 |
| -------------------------- | -------------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| BODY_CELL_READONLY_METHOD  | 自定义只读           | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean\|viod`              | —                      |
| BODY_CELL_EDITOR_METHOD    | 自定义编辑器类型     | ^[Function]`({row, column, rowIndex, colIndex,value})=>string\|viod`               | —                      |
| BEFORE_VALUE_CHANGE_METHOD | 数值改变前回调       | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | —                      |
| EDIT_BG_COLOR              | 可编辑背景色         | string                                                                             | `rgba(221,170,83,0.1)` |
| DISABLED                   | 禁止编辑优先等级最高 | boolean                                                                            | false                  |

## Typings
``` ts
type BeforeChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
type BeforeValueChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue?: any;
    row?: any;
    errorTip?: boolean;
};
```

> 执行顺序：数字/长度等内置校验 → `canValueChange` → `BEFORE_VALUE_CHANGE_METHOD` → 写入数据 → `valueChange` → 校验器。

## Methods

| 方法名称             | 说明                             | 参数                                                  |
| -------------------- | -------------------------------- | ----------------------------------------------------- |
| setItemValueByEditor | 更新数据方法可实现拓展任意编辑器 | `(rowKey, key, value, history = true, reDraw = true)` |

## Events

| 事件名称  | 说明             | 回调参数       |
| --------- | ---------------- | -------------- |
| startEdit | 开始编辑回调     | `cell`         |
| doneEdit  | 结束编辑回调     | `cell`         |
| change    | 编辑值改变的回调 | 当前改变值数组 |

注意默认只自带文本编辑功能的，也可以拓展根据需求拓展下拉、时间选择等~


## 禁用编辑
-   `DISABLED=true`整个表格不可编辑

::: demo

readonly/disabled
h:350px
:::

## 列只读/编辑

-   readonly=true,指定列不可编辑
-   日期、姓名不可编辑，其他都可编辑

::: demo

readonly/column
h:350px
:::

## 行只读/编辑

-   日期、姓名不可编辑，第一行不可编辑，其他都可编辑
-   column 全部设置`readonly`为`false`然后需要编辑 row 数据添加`_readonly`为`true`就可以了

::: demo

readonly/row
h:350px
:::

## 方法控制只读/编辑

-   `config.BODY_CELL_READONLY_METHOD`方法控制只读
-   日期、姓名不可编辑，第一行不可编辑，其他都可编辑

::: demo

readonly/method
h:350px
:::

## 拓展编辑器（时间选择....等）

-   组件内部默认只有文本编辑
-   利用`editorType`、两个`startEdit`、`doneEdit`事件回调及`setItemValueByEditor`更新数据方法可实现拓展任意编辑器

下面例子是拓展了一个时间选择器的 demo，其他拓展可参考这个例子

::: demo
readonly/date
h:350px
:::

## 方法控制编辑器类型

-   更改 key=date&&rowIndex=1 为 text 类型

从下面的例子可以实现同一列可以支持很多编辑器类型

::: demo

readonly/editType-method
h:350px
:::

## 更改编辑后的值

- 注意和formatter的区别，BEFORE_VALUE_CHANGE_METHOD更改的是赋值。


::: demo

readonly/value-change
h:350px
:::

## 列级别拦截修改（canValueChange）

- `canValueChange` 在写入前按列拦截，支持同步或异步（`Promise`）
- 返回 `false` 时本次修改会被取消，单元格保持原值
- 适用于手机号格式、业务权限、异步校验等场景

::: demo

readonly/can-value-change
h:350px
:::

## 列级别值变更回调（valueChange）

- `valueChange` 在值成功写入后触发
- 常用于字段联动：修改 A 列后同步更新 B 列展示内容
- 与表格级 `change` 事件不同，它是**列级别**回调，只作用于配置了该函数的列

::: demo

readonly/column-value-change
h:350px
:::


## Hover编辑图标

- 内置了icon-edit和icon-select图标,更多请自行配置config.ICONS
- 指定图标hoverIconName(列)或者BODY_CELL_HOVER_ICON_METHOD(行列)


::: demo

readonly/hover-icon
h:350px
:::