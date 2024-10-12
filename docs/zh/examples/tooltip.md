# 提示
- 不建议使用建议用`overlayerTooltipChange`自定义，因为内置的tooltip,有覆盖层时或者超过容器时就会被遮住
- 注意自定义要设置 `config.TOOLTIP_CUSTOM`为`true`
## 内置tooltip
- `overflowTooltipShow`显示提示，注意如果是自定义这属性不生效
- `overflowTooltipWidth`溢出提示的宽度，注意如果是自定义这属性不生效
- `overflowTooltipPlacement`溢出提示的位置，注意如果是自定义这属性不生效
- `overflowTooltipPlacement`支持`"top", "top-start", "top-end", "right", "right-start", "right-end", "left", "left-start", "left-end", "bottom", "bottom-start", "bottom-end"`

::: demo
<iframe src="/tooltip/base.html" style="min-height:210px"></iframe>
:::

## 自定义tooltip
- 这只是个简单例子，可以用第三方tooltip库整改样式，这样超过容器就不会被遮住了
- `overlayerTooltipChange`会回调是否显示tooltip，及定位信息
::: demo
<iframe src="/tooltip/custom.html" style="min-height:230px"></iframe>
:::