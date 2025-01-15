# 单元格校验

## Column

-   更多 rules 高级用法可参考 [async-validator](https://github.com/yiminghe/async-validator)。

| 参数  | 说明           | 类型   | 默认值 |
| ----- | -------------- | ------ | ------ |
| rules | 列数据校验规则 | object | —      |

## Config

| 参数                   | 说明           | 类型                                                            | 默认值 |
| ---------------------- | -------------- | --------------------------------------------------------------- | ------ |
| BODY_CELL_RULES_METHOD | 自定义校验规则 | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | —      |

## Events

| 事件名称            | 说明                         | 回调参数       |
| ------------------- | ---------------------------- | -------------- |
| validateChangedData | 更改值后全部校验通过后的回调 | Array[]  |

## 校验器
- 注意validateChangedData事件，全部校验通过后才会回调更改的结果
  
::: demo

validator/base
h:350px
:::

## 自定义校验器

-   `BODY_CELL_RULES_METHOD` 可自定义 cell 校验规则
-   email的rowIndex= 0,1不校验不必填

::: demo

validator/custom
h:350px
:::

## 常用校验规则
> 更多 rules 高级用法可参考  [async-validator](https://github.com/yiminghe/async-validator)
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
