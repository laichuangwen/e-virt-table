# 回滚历史

注意：
- 历史回退会触发`change`事件
- 回滚历史会记录上次更改数据的滚动条位置
- `config.ENABLE_HISTORY`为`true`开始可历史回退，默认是开开启的
- `config.HISTORY_NUM`为历史栈数量，默认 50

## 启用

- `config.ENABLE_HISTORY`为`true`,默认是开开启的
::: demo
<iframe src="/history/enable.html" style="min-height:220px"></iframe>
:::

## 禁用

- `config.ENABLE_HISTORY`为`false`
::: demo
<iframe src="/history/disabled.html" style="min-height:220px"></iframe>
:::

## 回退数量

- `config.HISTORY_NUM`为`3`回退 3 次
::: demo
<iframe src="/history/num.html" style="min-height:220px"></iframe>
:::
