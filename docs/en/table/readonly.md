# Edit

## Column

| Parameter   | Description       | Type     | Default |
| ----------- | ----------------- | -------- | ------- |
| readonly    | Control column readonly | boolean  | false   |
| editorType  | Editor type       | string   | false   |
| editorProps | Properties passed to the editor | object | {}      |

## Row

| Parameter   | Description       | Type     | Default |
| ----------- | ----------------- | -------- | ------- |
| \_readonly  | Control row readonly | boolean  | false   |

## Config

| Parameter                     | Description          | Type  | Default |
| ----------------------------- | -------------------- | ----- | ------- |
| BODY_CELL_READONLY_METHOD     | Custom readonly      | ^[Function]`({row, column, rowIndex, colIndex, value})=>boolean\|void` | — |
| BODY_CELL_EDITOR_METHOD       | Custom editor type   | ^[Function]`({row, column, rowIndex, colIndex, value})=>string\|void`  | — |
| BEFORE_VALUE_CHANGE_METHOD    | Callback before value change | ^[Function]`(BeforeChangeItem[])=>BeforeChangeItem[]\|Promise<BeforeChangeItem[]>`  | — |
| EDIT_BG_COLOR                 | Editable background color | string  | `rgba(221,170,83,0.1)` |
| DISABLED                      | Highest priority to disable editing | boolean  | false |

## Typings
```ts
type BeforeChangeItem = {
    rowKey: string;
    key: string;
    value: any;
    oldValue: any;
    row: any;
};
```

## Methods

| Name           | Description                        | Parameters                                              |
| --------------------- | ---------------------------------- | ------------------------------------------------------- |
| setItemValueByEditor  | Update data method to extend any editor | `(rowKey, key, value, history = true, reDraw = true)`   |

## Events

| Name | Description            | Callback Parameters |
| ---------- | ---------------------- | ------------------- |
| startEdit  | Callback when editing starts | `cell`             |
| doneEdit   | Callback when editing ends   | `cell`             |
| change     | Callback when edit value changes | Current changed value array |

>Note that only text editing functionality is provided by default, but it can be extended to include dropdowns, date pickers, etc.

## Disable Editing
-   `DISABLED=true` makes the entire table non-editable

::: demo

readonly/disabled
h:350px
:::

## Column Readonly/Editable

-   readonly=true, specifies that the column is non-editable
-   Date and name are non-editable, others are editable

::: demo

readonly/column
h:350px
:::

## Row Readonly/Editable

-   Date and name are non-editable, the first row is non-editable, others are editable
-   Set all columns' `readonly` to `false`, then add `_readonly` as `true` to the row data that needs to be non-editable

::: demo

readonly/row
h:350px
:::

## Method Control Readonly/Editable

-   `config.BODY_CELL_READONLY_METHOD` method controls readonly
-   Date and name are non-editable, the first row is non-editable, others are editable

::: demo

readonly/method
h:350px
:::

## Extend Editor (Date Picker, etc.)

-   The component only has text editing by default
-   Use `editorType`, `startEdit`, `doneEdit` events, and `setItemValueByEditor` update data method to extend any editor

The example below extends a date picker, other extensions can refer to this example

::: demo
readonly/date
h:350px
:::

## Method Control Editor Type

-   Change key=date&&rowIndex=1 to text type

From the example below, the same column can support multiple editor types

::: demo

readonly/editType-method
h:350px
:::

## Change Edited Value

- Note the difference with formatter, BEFORE_VALUE_CHANGE_METHOD changes the assigned value.

::: demo

readonly/value-change
h:350px
:::
