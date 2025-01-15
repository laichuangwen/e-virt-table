# 插槽（覆盖层）

-   在表格上方覆盖元素实现自定义插槽组件功能

## Config

| 参数               | 说明                  | 类型 | 默认值 |
| ------------------ | --------------------- | ---- | ------ |
| CELL_RENDER_METHOD | 自定义格子类型 render | —    |        |

## Events

| 事件名称        | 说明       | 回调参数               |
| --------------- | ---------- | ---------------------- |
| overlayerChange | 覆盖层回调 | `({type,views,style})` |

## 启用

-   利用`overlayerChange`对 header、body、footer 进行动态插入元素

::: demo

overlayer/base
h:420px
:::
