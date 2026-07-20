# Border

`config.BORDER` supports four border styles:

| Value | Description |
| --- | --- |
| `default` | Full border, including outer border, row lines and column lines |
| `outer` | Only show the table outer border |
| `inner` | Show only internal horizontal row lines in the body, while keeping internal column dividers in the header and footer |
| `none` | Hide table border lines |

Compatibility: `true` equals `default`, and `false` equals `inner`.

When column resizing is enabled, `RESIZE_COLUMN_DIVIDER_COLOR` or the `--evt-resize-column-divider-color` CSS variable customizes the static column dividers in the header and footer. It falls back to `BORDER_COLOR` when unset or when column resizing is disabled. `RESIZE_COLUMN_LINE_COLOR` still controls only the full-height guide shown while dragging.

## Resizable Column Divider Color

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
