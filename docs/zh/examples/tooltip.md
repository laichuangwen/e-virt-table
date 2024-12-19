# 提示

## 内置 tooltip

## Column

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| overflowTooltipShow | 溢出显示提示 | boolean | — | true |
| overflowTooltipMaxWidth | 溢出显示提示最大宽度 | number | — | 500 |
| overflowTooltipPlacement | 出现的位置 | string | — | `top\|top-start\|top-end\|right\|right-start\|right-end\|left\|left-start\|left-end\|bottom\|bottom-start\|bottom-end` |

## Config

| 参数                 | 说明           | 类型                           | 可选值 | 默认值 |
| -------------------- | -------------- | ------------------------------ | ------ | ------ |
| TOOLTIP_CUSTOM_STYLE | 自定义提示样式 | ^[object]`CSSStyleDeclaration` | —      | {}     |
| TOOLTIP_BG_COLOR     | 提示背景颜色   | string                         | —      | #000   |
| TOOLTIP_TEXT_COLOR   | 提示文本颜色   | string                         | —      | #fff   |
| TOOLTIP_ZINDEX       | 提示层级       | number                         | —      | 3000   |

## 例子

::: demo

<d-iframe src="/tooltip/base.html" style="min-height:220px"></d-iframe>
:::

## 自定义样式

::: demo

<d-iframe src="/tooltip/style.html" style="min-height:220px"></d-iframe>
:::
