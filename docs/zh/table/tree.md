# 树形

-   需要展开列的`type=tree`
-   row 数据中有`children`就有展开
-   row._hasChildren,隐藏字段懒加载时标识是否还需要加载

## Row
| 参数         | 说明                       | 类型    | 默认值 |
| ------------ | -------------------------- | ------- | ------ |
| children     | 子row 数据                 | array   | —      |
| _hasChildren | 是否还需要加载，懒加载有效 | boolean | false  |


## Column

-   type= `tree`开启

| 参数 | 说明     | 类型                                 | 默认值 |
| ---- | -------- | ------------------------------------ | ------ |
| type | 选择类型 | `tree,tree-selection,selection-tree` | —      |

## Config

| 参数               | 说明           | 类型                                                            | 默认值    |
| ------------------ | -------------- | --------------------------------------------------------------- | --------- |
| DEFAULT_EXPAND_ALL | 默认展开全部   | boolean                                                         | false     |
| EXPAND_LAZY        | 是否开启懒加载 | boolean                                                         | false     |
| EXPAND_LAZY_METHOD | 自定义选择禁用 | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | —         |
| TREE_INDENT        | 树形缩进宽度   | number                                                          | 20        |
| TREE_SELECT_MODE   | 树形选择模式   | `'auto' \| 'cautious' \| 'strictly'`                            | 'auto'    |
| TREE_LINE          | 树形是否划线   | boolean                                                         | false     |
| TREE_LINE_COLOR    | 树形划线颜色   | string                                                          | '#e1e6eb' |

## Events

| 事件名称        | 说明         | 回调参数 |
| --------------- | ------------ | -------- |
| selectionChange | 选择改变回调 | `rows`   |
| expandChange | 展开回调	 | -   |

## Methods

| 方法名称               | 说明                          | 参数                                                      |
| ---------------------- | ----------------------------- | --------------------------------------------------------- |
| toggleRowExpand        | 展开项取反                    | (rowKey, expand)                                          |
| toggleExpandAll        | 展开全部                      | boolean                                                   |
| getExpandRowKeys       | 获取展开keys                 | rowkeys[]                                                   |
| clearSelection         | 清除选中                      | —                                                         |
| toggleRowSelection     | 取反                          | row                                                       |
| setSelectionByRows     | 设置选中                      | (rows,selected)                                           |
| setSelectionByRowKeys  | 通过 RowKeys 设置选中         | (RowKeys,selected)                                        |
| getSelectionRows       | 获取选中                      | —                                                         |

## 模式

### Auto 模式

默认模式，子项选中和半选当做选中。具体`selectionChange`事件体现

### Cautious 模式

Cautious 模式，半选中状态不会当做选中。具体`selectionChange`事件体现

### Strictly 模式

父子项互不干扰各选各的。父项和子项的选择状态完全独立。

## 收起

-   默认收起

::: demo

tree/base
h:250px
:::

## 展开

-   `config.DEFAULT_EXPAND_ALL` 为 `true` 默认展开全部

::: demo

tree/expand
h:500px
:::

## 指定展开
- 设置ROW_KEY
- setExpandRowKeys

 下面例子展开id为0、1项

::: demo

tree/key-expand
h:550px
:::


## 懒加载

-   `config.EXPAND_LAZY` 为 `true` 开启懒加载
-   `config.EXPAND_LAZY_METHOD` 返回请求数据方法

::: demo

tree/lazy
h:400px
:::

## 自定义缩进

-   `config.TREE_INDENT` 设置树形缩进宽度，默认为 20px

::: demo

tree/indent
h:400px
:::

## tree-selection 类型
`tree-selection` 类型会先渲染树形图标，再渲染勾选框

::: demo

tree/tree-selection
h:320px
:::

## selection-tree 类型
`selection-tree` 类型会先勾选框标，再渲染树形图标

::: demo

tree/selection-tree
h:320px
:::

## Auto 模式
默认模式，半选中状态会当做选中。具体打开控制台查看`selectionChange`事件
::: demo

tree/auto
h:320px
:::

## Cautious 模式
Cautious 模式，半选中状态不会当做选中。具体打开控制台查看`selectionChange`事件体现

::: demo

tree/cautious
h:320px
:::

## Strictly 模式
父子项互不干扰各选各的。父项和子项的选择状态完全独立。

::: demo

tree/strictly
h:320px
::: 

## 层级线

::: demo

tree/tree-line
h:320px
::: 