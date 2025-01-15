# History

## Config

| Parameter       | Description       | Type    | Default |
| --------------- | ----------------- | ------- | ------------- |
| ENABLE_HISTORY  | Enable History    | boolean | true          |
| HISTORY_NUM     | History Stack Size| number  | 50            |

Note:

-   History rollback will trigger the `change` event.
-   Rollback history will record the scrollbar position of the last data change.

## Enable

-   `config.ENABLE_HISTORY` is `true` by default.

::: demo

history/enable
h:320px
:::

## Disable

-   `config.ENABLE_HISTORY` is `false`.

::: demo

history/disabled
h:320px
:::

## Rollback Count

-   `config.HISTORY_NUM` is `3` to rollback 3 times.

::: demo

history/num
h:320px
:::
