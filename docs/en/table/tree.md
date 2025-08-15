# Tree

-   Requires `type=tree` for the expand column
-   Rows with `children` data will have expand functionality
-   `row._hasChildren` is a hidden field that indicates whether more data needs to be loaded for lazy loading

## Row
| Parameter    | Description                                             | Type    | Default |
| ------------ | ------------------------------------------------------- | ------- | ------- |
| children     | Child row data                                          | array   | —       |
| _hasChildren | Whether more data needs to be loaded (for lazy loading) | boolean | false   |


## Column

-   Set `type=tree` to enable

| Parameter | Description    | Type                                 | Default |
| --------- | -------------- | ------------------------------------ | ------- |
| type      | Selection type | `tree,tree-selection,selection-tree` | —       |

## Config

| Parameter          | Description                     | Type                                                            | Default   |
| ------------------ | ------------------------------- | --------------------------------------------------------------- | --------- |
| DEFAULT_EXPAND_ALL | Expand all by default           | boolean                                                         | false     |
| EXPAND_LAZY        | Enable lazy loading             | boolean                                                         | false     |
| EXPAND_LAZY_METHOD | Custom selection disable method | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | —         |
| TREE_INDENT        | Tree indent width               | number                                                          | 20        |
| TREE_SELECT_MODE   | Tree selection mode             | `'auto' \| 'cautious' \| 'strictly'`                            | 'auto'    |
| TREE_LINE          | Show tree lines                 | boolean                                                         | false     |
| TREE_LINE_COLOR    | Tree line color                 | string                                                          | '#e1e6eb' |

## Events

| Event Name      | Description               | Callback Parameters |
| --------------- | ------------------------- | ------------------- |
| selectionChange | Selection change callback | `rows`              |
| expandChange    | Expand callback           | -                   |

## Methods

| Method Name           | Description               | Parameters         |
| --------------------- | ------------------------- | ------------------ |
| toggleRowExpand       | Toggle row expansion      | (rowKey, expand)   |
| toggleExpandAll       | Toggle expand all         | boolean            |
| getExpandRowKeys      | Get expanded row keys     | rowkeys[]          |
| clearSelection        | Clear selection           | —                  |
| toggleRowSelection    | Toggle selection          | row                |
| setSelectionByRows    | Set selection by rows     | (rows,selected)    |
| setSelectionByRowKeys | Set selection by row keys | (rowKeys,selected) |
| getSelectionRows      | Get selected rows         | —                  |

## Modes

### Auto Mode

Default mode, child items and semi-selected items are treated as selected. Specifically reflected in the `selectionChange` event.

### Cautious Mode

In Cautious mode, semi-selected state is not treated as selected. Specifically reflected in the `selectionChange` event.

### Strictly Mode

Parent and child items are independent of each other. Parent and child selection states are completely independent.

## Collapsed

-   Collapsed by default

::: demo

tree/base
h:250px
:::

## Expanded

-   Set `config.DEFAULT_EXPAND_ALL` to `true` to expand all by default

::: demo

tree/expand
h:500px
:::

## Specify Expansion
- Set ROW_KEY
- setExpandRowKeys

 The example below expands items with id 0 and 1

::: demo

tree/key-expand
h:550px
:::


## Lazy Loading

-   Set `config.EXPAND_LAZY` to `true` to enable lazy loading
-   `config.EXPAND_LAZY_METHOD` returns the method to request data

::: demo

tree/lazy
h:400px
:::

## Custom Indent

-   Set `config.TREE_INDENT` to configure tree indent width, default is 20px

::: demo

tree/indent
h:400px
:::

## tree-selection Type
`tree-selection` type renders tree icons first, then renders checkboxes

::: demo

tree/tree-selection
h:320px
:::

## selection-tree Type
`selection-tree` type renders checkboxes first, then renders tree icons

::: demo

tree/selection-tree
h:320px
:::

## Auto Mode

::: demo

tree/auto
h:320px
:::

## Cautious Mode

::: demo

tree/cautious
h:320px
:::

## Strictly Mode

::: demo

tree/strictly
h:320px
::: 

## Hierarchy Lines

::: demo

tree/tree-line
h:320px
::: 