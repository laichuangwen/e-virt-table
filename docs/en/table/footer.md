# Footer

1. The footer summary allows for the summary display of table data.
2. `footerData` is the footer summary data. The data structure is consistent with `tableData`.

## Config

| Parameter          | Description                     | Type    | Default |
| ------------------ | ------------------------------- | ------- | ------- |
| FOOTER_BG_COLOR    | Background color of the footer  | string  | #fafafa |
| FOOTER_FIXED       | Fixed footer                    | boolean | true    |
| CELL_FOOTER_HEIGHT | Row height of the footer section | number  | 36      |

## Methods

| Name    | Description          | Parameters |
| -------------- | -------------------- | ---------- |
| loadFooterData | Update footer data   | `row[]`    |

## SUM

-   Because statistics are time-consuming with large data, the total is not automatically calculated internally. You need to calculate it yourself and pass in `footerData`.

::: demo

footer/base
h:320px
:::

## Footer Row Height

-   `CELL_FOOTER_HEIGHT` can set the footer row height, default is `36`.

::: demo

footer/height
h:320px
:::

## Fixed

-   `FOOTER_FIXED=true` can be fixed at the bottom, default is `true`.

::: demo
footer/fixed
h:320px
:::

## Fixed Footer at Header Bottom

-   `FOOTER_FIXED=true` can be fixed at the bottom, default is `true`.
-   `FOOTER_POSITION=top` can be fixed at the bottom of the header.

::: demo
footer/position
h:320px
:::

## Not Fixed

-   `FOOTER_FIXED=false` places it after the body.

::: demo

footer/noFixed
h:320px
:::

## Dynamically footerData

-   `loadFooterData` can change the data.

::: demo

footer/loadData
h:320px
:::
