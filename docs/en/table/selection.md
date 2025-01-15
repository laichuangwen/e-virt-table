# Selection

## Column

-   Set `type` to `selection` or `index-selection` to enable

| Parameter | Description    | Type                                   | Default |
| --------- | -------------- | -------------------------------------- | ------- |
| type      | Selection type | `index,selection,index-selection,tree` | —       |

## Config

| Parameter         | Description              | Type                                                            | Default |
| ----------------- | ------------------------ | --------------------------------------------------------------- | ------- |
| SELECTABLE_METHOD | Custom selectable method | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | —       |
| CHECKBOX_KEY      | Selection key            | string                                                          | —       |

## Methods

| Method Name           | Description               | Parameters                 |
| --------------------- | ------------------------- | -------------------------- |
| clearSelection        | Clear selection           | `()=>void`                 |
| toggleRowSelection    | Toggle selection          | `row`                      |
| setSelectionByRows    | Set selection by rows             | `(rows,selected)=>void`    |
| setSelectionByRowKeys | Set selection by rowKeys  | `(rowKeys,selected)=>void` |
| getSelectionRows      | Get selected rows         | `()=>[]`                   |
| toggleAllSelection    | Toggle all rows selection | `()=>void`                 |

## Events

| Event Name         | Description                  | Callback Parameters |
| ------------------ | ---------------------------- | ------------------- |
| toggleRowSelection | Row selection callback       | `row`               |
| toggleAllSelection | Select/Deselect all callback | `rows`              |
| clearSelection     | Clear selection callback     | `rows`              |
| setRowSelection    | Row selection callback       | `rows`              |
| selectionChange    | Selection change callback    | `rows`              |

## selection

-   `type=selection`
-   Console has callback output

::: demo

selection/base
h:320px
:::

## Index-selection

-   `type=index-selection`

::: demo

selection/index
h:320px
:::

## Set/Clear Selection by Rows

-   `clearSelection` to clear
-   `setSelectionByRows` to set selection
-   `toggleRowSelection` to toggle

::: demo

selection/setting
h:350px
:::

## Set/Clear Selection by RowKeys

-   Note to set `config.ROW_KEY`
-   `clearSelection` to clear
-   `setSelectionByRowKeys` to set selection

::: demo

selection/settingRowKeys
h:350px
:::

## Get Selection

-   `getSelectionRows` to get selected data

::: demo

selection/get
h:350px
:::

## Disable

-   `config.SELECTABLE_METHOD` optional disable method

::: demo

selection/disabled
h:350px
:::

## Merge Cells Selection

-   `config.CHECKBOX_KEY` selection key
-   `config.SPAN_METHOD` merge method
-   Will merge based on the visible area, so it won't cause merged cells to not display due to too many merged rows

::: demo

selection/span
h:625px
:::
