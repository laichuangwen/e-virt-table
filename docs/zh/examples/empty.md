## 空数据

-   整体宽度跟容器的宽度有关系，所以设置外层宽度就行

## Config

| 参数               | 说明             | 类型                           | 可选值 | 默认值   |
| ------------------ | ---------------- | ------------------------------ | ------ | -------- |
| EMPTY_CUSTOM       | 是否开启自定义   | boolean                        | —      | false    |
| EMPTY_CUSTOM_STYLE | 自定义空样式     | ^[object]`CSSStyleDeclaration` | —      | {}       |
| EMPTY_BODY_HEIGHT  | 空数据 body 高度 | number                         | —      | 120      |
| EMPTY_TEXT         | 空数据文本       | string                         | —      | 暂无数据 |

## Events

| 事件名称    | 说明       | 回调参数                                      |
| ----------- | ---------- | --------------------------------------------- |
| emptyChange | 空数据回调 | `(type,headerHeight,bodyHeight,width,height)` |

## 更改空文本

::: demo

<d-iframe src="/empty/base.html" style="min-height:250px"></d-iframe>
:::

## 更改样式

::: demo

<d-iframe src="/empty/style.html" style="min-height:250px"></d-iframe>
:::

## 完全自定义

::: demo

<d-iframe src="/empty/custom.html" style="min-height:250px"></d-iframe>
:::
