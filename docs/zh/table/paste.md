# 单元格复制粘贴

粘贴需要启动选择器和键盘

## Config

| 参数                     | 说明                    | 类型     | 默认值 |
| ------------------------ | ----------------------- | -------  | ------ |
| ENABLE_COPY | 启用复制 | boolean  | true |
| ENABLE_PASTER | 启用粘贴 | boolean  | true |
| BEFORE_PASTE_DATA_METHOD | 粘贴前回调 | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>` | — |
| BEFORE_COPY_METHOD | 数据复制前回调 | ^[Function]`(BeforeCopyParams)=>BeforeCopyParams\|viod` | — |
## Typings

``` ts
type BeforeChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
```

## 禁用复制&粘贴

- 启用选择器
- 启用键盘`ENABLE_KEYBOARD`,默认true
- 启用复制`ENABLE_COPY`，默认true
- 启用粘贴`ENABLE_PASTER`，默认true
::: demo
paste/disabled
h:320px
:::

## 启用复制&粘贴

- 启用选择器
- 启用键盘`ENABLE_KEYBOARD`,默认true
- 启用复制`ENABLE_COPY`，默认true
- 启用粘贴`ENABLE_PASTER`，默认true
::: demo
paste/enable
h:320px
:::


## 粘贴数据更改前

- BEFORE_AUTOFILL_DATA_METHOD可篡改粘贴数据，支持Promise


::: demo
paste/before-change
h:320px
:::

## 复制数据更改前

- BEFORE_COPY_METHOD

::: demo
paste/before-copy
h:320px
:::

## 格式化复制内容

列配置 `formatterSelectorValue` 可以单独格式化复制内容，不会改变单元格显示值。回调接收当前单元格的原始 `value`、`row`、`rowIndex`、`colIndex` 和 `column`。

下面示例中，价格在表格内显示为 `$1,299.00`，选中价格单元格并使用 `Ctrl/Cmd + C` 复制后，内容为 `USD 1299.00`。

::: demo
paste/formatter-selector-value
h:320px
:::
