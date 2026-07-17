# Border

`config.BORDER` supports four border styles:

| Value | Description |
| --- | --- |
| `default` | Full border, including outer border, row lines and column lines |
| `outer` | Only show the table outer border |
| `inner` | Only show internal horizontal row lines |
| `none` | Hide table border lines |

Compatibility: `true` equals `default`, and `false` equals `inner`.

`HEADER_BORDER_COLOR` and `FOOTER_BORDER_COLOR` customize header and footer cell borders and divider colors. Unset values inherit `BORDER_COLOR`.

They can also be configured with CSS variables. `e-virt-table` automatically reads the kebab-case `--evt-*` variable matching each config name:

```css
:root {
    --evt-header-border-color: #3b82f6;
    --evt-footer-border-color: #f59e0b;
}
```

## Custom Section Border Colors

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

## Inner Row Lines

::: demo

border/inner
h:320px
:::

## No Border

::: demo

border/none
h:320px
:::
