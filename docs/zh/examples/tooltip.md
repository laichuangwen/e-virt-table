# 提示
## 内置tooltip
- `overflowTooltipShow`显示提示，注意如果是自定义这属性不生效
- `overflowTooltipWidth`溢出提示的宽度，注意如果是自定义这属性不生效

::: demo
<iframe src="/tooltip/base.html" style="min-height:210px"></iframe>
:::

## 自定义tooltip
- 这只是个简单例子，可以用第三方tooltip库整改样式，这样超过容器就不会被遮住了
- `overlayerTooltipChange`会回调是否显示tooltip，及定位信息
::: demo
<iframe src="/tooltip/custom.html" style="min-height:230px"></iframe>
:::