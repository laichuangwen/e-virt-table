# 回滚历史

## Config

| 参数           | 说明       | 类型    | 默认值 |
| -------------- | ---------- | ------- | ------ |
| ENABLE_HISTORY | 启用历史   | boolean | true   |
| HISTORY_NUM    | 历史栈数量 | number  | 50     |

注意：

-   历史回退会触发`change`事件
-   回滚历史会记录上次更改数据的滚动条位置

## 启用

-   `config.ENABLE_HISTORY`为`true`,默认是开开启的

::: demo

history/enable
h:320px
:::

## 禁用

-   `config.ENABLE_HISTORY`为`false`

::: demo

history/disabled
h:320px
:::

## 回退数量

-   `config.HISTORY_NUM`为`3`回退 3 次

::: demo

history/num
h:320px
:::
