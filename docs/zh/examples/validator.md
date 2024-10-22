# 单元格校验

## Column

-   更多 rules 高级用法可参考 [async-validator](https://github.com/yiminghe/async-validator)。

| 参数  | 说明           | 类型   | 可选值 | 默认值 |
| ----- | -------------- | ------ | ------ | ------ |
| rules | 列数据校验规则 | object | —      | —      |

## Config

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| CELL_RULES_METHOD | 自定义校验规则 | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | — | — |

## 校验器

::: demo

<iframe src="/validator/base.html" style="min-height:250px"></iframe>
:::

## 自定义校验器

-   `CELL_RULES_METHOD` 可自定义 cell 校验规则
-   email的rowIndex= 0,1不校验不必填

::: demo

<iframe src="/validator/custom.html" style="min-height:250px"></iframe>
:::

## 常用校验规则

1. 必填

```js
[{ required: true, message: '请输入' }];
```

2. 金额

```js
[
    {
        required: true,
        message: '请输入金额',
    },
    {
        pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/,
        message: '请输入合法的金额数字，最多两位小数',
    },
];
```

3. 正整数

```js
[
    {
        required: true,
        message: '请输入',
    },
    {
        pattern: /^(?:[1-9]\d*)$/,
        message: '请输入正整数',
    },
];
```

4. 自定义校验规则

```js
[
    {
        validator(rule, value, callback) {
            if (!value) {
                callback('请输入');
            } else if (value.length > 20) {
                callback('字段长度必须小于20个字符哦！');
            } else {
                callback();
            }
        },
    },
];
```
