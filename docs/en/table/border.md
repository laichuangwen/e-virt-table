# Border

`config.BORDER` supports four border styles:

| Value | Description |
| --- | --- |
| `default` | Full border, including outer border, row lines and column lines |
| `outer` | Only show the table outer border |
| `inner` | Show only internal horizontal row lines in the body, while keeping internal column dividers in the header and footer |
| `none` | Hide table border lines |

Compatibility: `true` equals `default`, and `false` equals `inner`.

`HEADER_BORDER_COLOR` and `FOOTER_BORDER_COLOR` only customize internal column dividers in the header and footer. Unset values inherit `BORDER_COLOR`. The table outer border, header bottom boundary, footer top boundary, and all other horizontal lines always use `BORDER_COLOR`.

## Custom Column Divider Colors

::: demo

border/color
h:320px
:::

## Full Border

::: demo

border/default
h:320px
:::

## Outer Border

::: demo

border/outer
h:320px
:::

## Inner Borders

::: demo

border/inner
h:320px
:::

## No Border

::: demo

border/none
h:320px
:::
