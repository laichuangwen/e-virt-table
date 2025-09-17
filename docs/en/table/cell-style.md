# Style

## Config

| Name                     | Description       | Parameters                                                           |
| ------------------------ | ----------------- | -------------------------------------------------------------------- |
| HEADER_CELL_STYLE_METHOD | Header cell style | `({column,colIndex})=>({color,backgroundColor})`                     |
| BODY_CELL_STYLE_METHOD   | Body cell style   | `({row, column,rowIndex,colIndex,value})=>({color,backgroundColor})` |
| FOOTER_CELL_STYLE_METHOD | Footer cell style | `({row, column,rowIndex,colIndex,value})=>({color,backgroundColor})` |

## Header Style

-   Only supports color and backgroundColor

::: demo

cell-style/header
h:320px
:::

## Body Style

-   Supports color, backgroundColor, and font

::: demo

cell-style/body
h:320px
:::

## Footer Style

-   Only supports color and backgroundColor

::: demo

cell-style/footer
h:360px
:::
