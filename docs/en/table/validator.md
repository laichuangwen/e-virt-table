# Validation

## Column

-   For more advanced usage of rules, refer to [async-validator](https://github.com/yiminghe/async-validator).

| Parameter | Description             | Type   | Default |
| --------- | ----------------------- | ------ | ------- |
| rules     | Column validation rules | object | —       |

## Config

| Parameter              | Description             | Type                                                            | Default |
| ---------------------- | ----------------------- | --------------------------------------------------------------- | ------- |
| BODY_CELL_RULES_METHOD | Custom validation rules | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | —       |

## Events

| Name                | Description                         | Callback Parameters |
| ------------------- | ----------------------------------- | ------------------- |
| validateChangedData | Callback after all validations pass | Array[]             |

## Validator
- Note the validateChangedData event, which will only callback the changed results after all validations pass
  
::: demo

validator/base
h:350px
:::

## Custom Validator

-   `BODY_CELL_RULES_METHOD` can customize cell validation rules
-   Email validation is not required for rowIndex= 0,1

::: demo

validator/custom
h:350px
:::

## Common Validation Rules
> For more advanced usage of rules, refer to [async-validator](https://github.com/yiminghe/async-validator)
1. Required

```js
[{ required: true, message: 'Please enter' }];
```

2. Amount

```js
[
    {
        required: true,
        message: 'Please enter an amount',
    },
    {
        pattern: /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/,
        message: 'Please enter a valid amount, up to two decimal places',
    },
];
```

3. Positive Integer

```js
[
    {
        required: true,
        message: 'Please enter',
    },
    {
        pattern: /^(?:[1-9]\d*)$/,
        message: 'Please enter a positive integer',
    },
];
```

4. Custom Validation Rules

```js
[
    {
        validator(rule, value, callback) {
            if (!value) {
                callback('Please enter');
            } else if (value.length > 20) {
                callback('Field length must be less than 20 characters!');
            } else {
                callback();
            }
        },
    },
];
```
