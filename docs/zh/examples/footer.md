# 合计

- `config.FOOTER_BG_COLOR`可调整合计背景色
- `config.FOOTER_FIXED`可调整是否固定底部，默认`true`
- `config.CELL_FOOTER_HEIGHT`调整 footer 行高度

## 初始化合计

- 因为大数据的时候统计很耗时，合计内部不会自动算，需要自己算传入 footerData
::: demo

<iframe src="/footer/base.html" style="min-height:320px"></iframe>
:::

## 更改行高

- `CELL_FOOTER_HEIGHT` 可设置 footer 行高,默认`36`

::: demo

<iframe src="/footer/height.html" style="min-height:320px"></iframe>
:::

## 固定

- `FOOTER_FIXED=true`可固定在底部，默认`true`

::: demo

<iframe src="/footer/fixed.html" style="min-height:320px"></iframe>
:::

## 不固定

- `FOOTER_FIXED=false`放在 body 后面

::: demo

<iframe src="/footer/noFixed.html" style="min-height:320px"></iframe>
:::

## 动态更改 footerData

- `loadFooterData`可更改数据

::: demo

<iframe src="/footer/loadData.html" style="min-height:320px"></iframe>
:::
