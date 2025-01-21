# 合计

1. footer 汇总，允许对表格数据进行汇总展示
2. footerData为 footer 汇总数据。数据结构与tableData保持一致

## Config

| 参数               | 说明                   | 类型            | 默认值   |
| ------------------ | ---------------------- | --------------- | -------- |
| FOOTER_BG_COLOR    | 合计底部背景色         | string          | #fafafa  |
| FOOTER_FIXED       | 合计底部固定           | boolean         | true     |
| FOOTER_POSITION    | 合计底部位置           | `top`、`bottom` | `bottom` |
| CELL_FOOTER_HEIGHT | 表格 footer 部分的行高 | number          | 36       |

## Methods

| 方法名称       | 说明             | 参数    |
| -------------- | ---------------- | ------- |
| loadFooterData | 更新 footer 数据 | `row[]` |

## 初始化合计

-   因为大数据的时候统计很耗时，合计内部不会自动算，需要自己算传入 footerData  

::: demo

footer/base
h:320px
:::

## 更改行高

-   `CELL_FOOTER_HEIGHT` 可设置 footer 行高,默认`36`

::: demo

footer/height
h:320px
:::

## 固定

-   `FOOTER_FIXED=true`可固定在底部，默认`true`

::: demo
footer/fixed
h:320px
:::

## 固定表头底部

-   `FOOTER_FIXED=true`可固定在底部，默认`true`
-   `FOOTER_POSITION=top`可固定在表头底部

::: demo
footer/position
h:320px
:::

## 不固定

-   `FOOTER_FIXED=false`放在 body 后面

::: demo

footer/noFixed
h:320px
:::

## 动态更改 footerData

-   `loadFooterData`可更改数据

::: demo

footer/loadData
h:320px
:::
