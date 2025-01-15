# 空数据

## Config

| 参数               | 说明             | 类型                           | 默认值   |
| ------------------ | ---------------- | ------------------------------ | -------- |
| EMPTY_CUSTOM_STYLE | 自定义空样式     | ^[object]`CSSStyleDeclaration` | {}       |
| EMPTY_BODY_HEIGHT  | 空数据 body 高度 | number                         | 120      |
| EMPTY_TEXT         | 空数据文本       | string                         | 暂无数据 |

## Events

| 事件名称    | 说明       | 回调参数                                      |
| ----------- | ---------- | --------------------------------------------- |
| emptyChange | 空数据回调 | `(type,headerHeight,bodyHeight,width,height)` |

## 更改空文本

::: demo

empty/base
h:350px
:::

## 更改样式

::: demo

empty/style
h:350px
:::

## 完全自定义

::: demo

empty/custom
h:350px
:::
