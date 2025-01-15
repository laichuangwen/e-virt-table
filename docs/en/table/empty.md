# Empty

## Config

| Parameter          | Description       | Type                           | Default  |
| ------------------ | ----------------- | ------------------------------ | -------- |
| EMPTY_CUSTOM_STYLE | Custom empty style| ^[object]`CSSStyleDeclaration` | {}       |
| EMPTY_BODY_HEIGHT  | Empty body height | number                         | 120      |
| EMPTY_TEXT         | Empty text        | string                         | No data  |

## Events

| Event Name  | Description | Callback Parameters                          |
| ----------- | ----------- | --------------------------------------------- |
| emptyChange | Empty callback | `(type,headerHeight,bodyHeight,width,height)` |

## Empty Text

::: demo

empty/base
h:350px
:::

## Style

::: demo

empty/style
h:350px
:::

## Custom

::: demo

empty/custom
h:350px
:::
