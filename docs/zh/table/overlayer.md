# 插槽（覆盖层）
提示：覆盖层不是编辑器，建议只做格子展示

-   在表格上方覆盖元素实现自定义插槽组件功能


## Config

| 参数                    | 说明                  | 类型 | 默认值 |
| ----------------------- | --------------------- | ---- | ------ |
| BODY_CELL_RENDER_METHOD | 自定义格子类型 render | —    |        |

## Events

| 事件名称        | 说明       | 回调参数               |
| --------------- | ---------- | ---------------------- |
| overlayerChange | 覆盖层回调 | `({type,views,style})` |

##  内置
  > 注意：内置版本1.3.9后版本才能使用
- 在render,renderHeader,renderFooter中返回了element

::: demo

overlayer/base
h:420px
:::


## 自定义覆盖层
vue2、vue3、react等可参考这个例子的结构来进行封装
- 传入overlayerEl
- 利用`overlayerChange`对 header、body、footer 进行动态插入元素

::: demo

overlayer/custom
h:420px
:::