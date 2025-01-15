# Tooltip

## Column

| Parameter               | Description                  | Type | Default                                                                                                                 |
| ----------------------- | ---------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| overflowTooltipShow     | Show tooltip on overflow     | —    | true                                                                                                                    |
| overflowTooltipMaxWidth | Maximum width of tooltip     | —    | 500                                                                                                                     |
| overflowTooltipPlacement| Tooltip placement            | —    | ^[string]`top, top-start, top-end, right, right-start, right-end, left, left-start, left-end, bottom, bottom-start, bottom-end` |

## Config

| Parameter              | Description           | Type                           | Default |
| ---------------------- | --------------------- | ------------------------------ | ------- |
| TOOLTIP_CUSTOM_STYLE   | Custom tooltip style  | ^[object]`CSSStyleDeclaration` | {}      |
| TOOLTIP_BG_COLOR       | Tooltip background color | string                         | #000    |
| TOOLTIP_TEXT_COLOR     | Tooltip text color    | string                         | #fff    |
| TOOLTIP_ZINDEX         | Tooltip z-index       | number                         | 3000    |

## Examples

::: demo

tooltip/base
h:320px
:::

## Custom styles

::: demo

tooltip/style
h:320px
:::
