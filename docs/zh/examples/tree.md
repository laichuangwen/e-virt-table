# 树形

-   需要展开列的`type=tree`
-   row 数据中有`children`就有展开

## Column

-   type= `tree`开启

| 参数 | 说明     | 类型   | 可选值                                 | 默认值 |
| ---- | -------- | ------ | -------------------------------------- | ------ |
| type | 选择类型 | string | `index,selection,index-selection,tree` | —      |

## Config

| 参数               | 说明           | 类型                                                            | 可选值 | 默认值 |
| ------------------ | -------------- | --------------------------------------------------------------- | ------ | ------ |
| DEFAULT_EXPAND_ALL | 默认展开全部   | boolean                                                         | —      | false  |
| EXPAND_LAZY        | 是否开启懒加载 | boolean                                                         | —      | false  |
| EXPAND_LAZY_METHOD | 自定义选择禁用 | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | —      | —      |

## 收起

-   默认收起

::: demo

<iframe src="/tree/base.html" style="min-height:250px"></iframe>
:::

## 展开

-   `config.DEFAULT_EXPAND_ALL` 为 `true` 默认展开全部

::: demo

<iframe src="/tree/expand.html" style="min-height:400px"></iframe>
:::

## 指定展开
- 设置ROW_KEY
- setExpandRowKeys

 下面例子展开id为0、1项

::: demo

<iframe src="/tree/key-expand.html" style="min-height:400px"></iframe>
:::


## 懒加载

-   `config.EXPAND_LAZY` 为 `true` 开启懒加载
-   `config.EXPAND_LAZY_METHOD` 返回请求数据方法

::: demo

<iframe src="/tree/lazy.html" style="min-height:400px"></iframe>
:::
