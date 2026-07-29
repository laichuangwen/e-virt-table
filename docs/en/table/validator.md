# Validation

## Column

## Rules

```ts

type Rule = {
    required?: boolean;
    pattern?: RegExp;
    validator?: RuleValidator;
    message?: string;
};
type Rules = Rule[];

```

| Parameter | Description             | Type   | Default |
| --------- | ----------------------- | ------ | ------- |
| rules     | Column validation rules | object | —       |

## Config

| Parameter              | Description             | Type                                                            | Default |
| ---------------------- | ----------------------- | --------------------------------------------------------------- | ------- |
| BODY_CELL_RULES_METHOD | Custom validation rules | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | —       |

## Events

| Name                | Description                                      | Callback Parameters |
| ------------------- | ------------------------------------------------ | ------------------- |
| change              | Fired after value change (includes validation)   | `BeforeValueChangeItem[]` with `errorTip` |
| validateChangedData | Callback after all validations pass              | Array[]             |

```ts
type BeforeValueChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue?: any;
    row?: any;
    errorTip?: boolean; // whether this cell failed validation
};
```

## Validator
- Note the validateChangedData event, which will only callback the changed results after all validations pass
  
::: demo

validator/base
h:350px
:::

## Validation Result `errorTip`

- After the value is written, `rules` run first, then column-level `valueChange` and table-level `change` fire
- `errorTip` in the callback: `true` means validation failed for that cell, `false` means it passed
- Useful for linkage, logging, or status columns based on validation result
- `validateChangedData` only fires when the whole table has no validation errors

::: demo

validator/error-tip
h:420px
:::

## Custom Validator

-   `BODY_CELL_RULES_METHOD` can customize cell validation rules
-   Email validation is not required for rowIndex= 0,1

::: demo

validator/custom
h:350px
:::

## Common Validation Rules

## Rules

```ts

type Rule = {
    required?: boolean;
    pattern?: RegExp;
    validator?: RuleValidator;
    message?: string;
};
type Rules = Rule[];

```

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
