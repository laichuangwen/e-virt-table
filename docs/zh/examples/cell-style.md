# 样式

## Config

| 方法名称                 | 说明            | 参数                                                                 |
| ------------------------ | --------------- | -------------------------------------------------------------------- |
| HEADER_CELL_STYLE_METHOD | header 格子样式 | `({column,colIndex})=>({color,backgroundColor})`                     |
| BODY_CELL_STYLE_METHOD   | body 格子样式   | `({row, column,rowIndex,colIndex,value})=>({color,backgroundColor})` |
| FOOTER_CELL_STYLE_METHOD | footer 格子样式 | `({row, column,rowIndex,colIndex,value})=>({color,backgroundColor})` |



## header样式自定义

-   只支持 color 和 backgroundColor

::: demo

<iframe src="/cell-style/header.html" style="min-height:220px"></iframe>
:::

## body样式自定义

-   只支持 color 和 backgroundColor

::: demo

<iframe src="/cell-style/body.html" style="min-height:220px"></iframe>
:::

## footer样式自定义

-   只支持 color 和 backgroundColor

::: demo

<iframe src="/cell-style/footer.html" style="min-height:320px"></iframe>
:::
