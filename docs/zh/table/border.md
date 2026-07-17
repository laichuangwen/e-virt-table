# 边框

`config.BORDER` 支持四种边框样式：

| 值 | 说明 |
| --- | --- |
| `default` | 完整边框，包含外边框、行线和列线 |
| `outer` | 只显示表格外边框 |
| `inner` | 只显示表格内部横向行线 |
| `none` | 不显示表格边框 |

兼容旧写法：`true` 等同 `default`，`false` 等同 `inner`。

`HEADER_BORDER_COLOR` 和 `FOOTER_BORDER_COLOR` 可分别设置表头、表尾的单元格边框及分割线颜色。未设置时继承 `BORDER_COLOR`。

也可通过 CSS 变量配置。`e-virt-table` 会自动读取配置名对应的 kebab-case `--evt-*` 变量：

```css
:root {
    --evt-header-border-color: #3b82f6;
    --evt-footer-border-color: #f59e0b;
}
```

## 自定义区域边框颜色

::: demo

border/color
h:320px
:::

## 完整边框

::: demo

border/default
h:320px
:::

## 仅外边框

::: demo

border/outer
h:320px
:::

## 仅内部横线

::: demo

border/inner
h:320px
:::

## 无边框

::: demo

border/none
h:320px
:::
