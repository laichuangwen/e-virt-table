# 单元格复制粘贴

粘贴需要启动选择器和键盘

## Config

| 参数                     | 说明                    | 类型    | 可选值 | 默认值 |
| ------------------------ | ----------------------- | ------- | ------ | ------ |
| ENABLE_COPY | 启用复制 | boolean | — | true |
| ENABLE_PASTER | 启用粘贴 | boolean | — | true |
| BEFORE_PASTE_CHANGE_METHOD | 粘贴前回调 | ^[Function]`(BeforeChangeParams[])=>BeforeChangeParams[]\|Promise<BeforeChangeParams[]>` | — | — |

## Typings

``` ts
type BeforeChangeParams = {
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

- BEFORE_AUTOFILL_CHANGE_METHOD可篡改粘贴数据，支持Promise


::: demo
paste/before-change
h:320px
:::