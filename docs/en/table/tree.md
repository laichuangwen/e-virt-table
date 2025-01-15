# Tree

-   Set `type=tree` for the column that needs to be expandable.
-   Rows with `children` in the data will be expandable.

## Column

-   Set `type=tree` to enable.

| Parameter | Description  | Type                                   | Default |
| --------- | ------------ | -------------------------------------- | ------- |
| type      | Column type  | `index,selection,index-selection,tree` | —       |

## Config

| Parameter           | Description         | Type                                                            | Default |
| ------------------- | ------------------- | --------------------------------------------------------------- | ------- |
| DEFAULT_EXPAND_ALL  | Expand all by default | boolean                                                         | false   |
| EXPAND_LAZY         | Enable lazy loading | boolean                                                         | false   |
| EXPAND_LAZY_METHOD  | Custom lazy load method | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | —       |

## Collapse

-   Collapsed by default

::: demo

tree/base
h:250px
:::

## Expand

-   Set `config.DEFAULT_EXPAND_ALL` to `true` to expand all by default.

::: demo

tree/expand
h:500px
:::

## Specify Expansion
- Set ROW_KEY
- Use setExpandRowKeys

 The example below expands items with id 0 and 1.

::: demo

tree/key-expand
h:550px
:::

## Lazy Loading

-   Set `config.EXPAND_LAZY` to `true` to enable lazy loading.
-   Use `config.EXPAND_LAZY_METHOD` to return the request data method.

::: demo

tree/lazy
h:400px
:::
