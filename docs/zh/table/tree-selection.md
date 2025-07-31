# 树形选择

## Column

-   `type=tree-selection` 开启树形选择

| 参数 | 说明     | 类型                                   | 默认值 |
| ---- | -------- | -------------------------------------- | ------ |
| type | 选择类型 | `index,selection,index-selection,tree-selection` | —      |

## Config

| 参数                     | 说明           | 类型                                                            | 默认值 |
| ------------------------ | -------------- | --------------------------------------------------------------- | ------ |
| TREE_SELECT_MODE         | 树形选择模式   | `'auto' \| 'cautious' \| 'strictly'`                          | 'auto' |

## 选择模式

### Auto 模式

默认模式，子项选中即是半选当做选中。当子项被选中时，父项自动变为半选状态。

### Cautious 模式

只有但子项全选时父项选中，父项选中也会使子项全选，全选时父项点击则清空子项和父项取消勾选。

### Strictly 模式

父子项互不干扰各选各的。父项和子项的选择状态完全独立。

## 基础示例

::: demo

tree-selection/base
h:320px
:::

## Auto 模式

::: demo

tree-selection/auto
h:320px
:::

## Cautious 模式

::: demo

tree-selection/cautious
h:320px
:::

## Strictly 模式

::: demo

tree-selection/strictly
h:320px
::: 