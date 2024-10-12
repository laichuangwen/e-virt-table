# 树形

- 需要展开列的`type=tree`
- row 数据中有`children`就有展开

## 默认收起

::: demo

<iframe src="/tree/base.html" style="min-height:250px"></iframe>
:::

## 默认展开

- `config.DEFAULT_EXPAND_ALL` 为 `true` 默认展开全部
::: demo
<iframe src="/tree/expand.html" style="min-height:400px"></iframe>
:::

## 懒加载

- `config.EXPAND_LAZY` 为 `true` 开启懒加载
- `config.EXPAND_LAZY_METHOD` 返回请求数据方法
::: demo
<iframe src="/tree/lazy.html" style="min-height:400px"></iframe>
:::