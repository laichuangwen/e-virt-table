# vue3 例子

## 基础

::: demo

framework/vue3/base
h:220px
:::

## 基于vue3和element-plus拓展的可编辑组件
- 拓展编辑器(支持下拉、日期、时间、tree等)
- 拓展空数据
- 拓展覆盖层，支持dom图片等
- 支持不同格子有不同编辑器

### 封装组件EVirtTableVue

::: code 组件源码

framework/vue3/EVirtTableVue.vue
:::
### 拓展编辑器例子

::: code 例子源码

framework/vue3/EVirtTableDemo.vue
:::

<ClientOnly>
  <EVirtTableDemo />
</ClientOnly>