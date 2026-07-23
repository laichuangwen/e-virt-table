# 固定

## Column

| 参数  | 说明       | 类型                | 默认值 |
| ----- | ---------- | ------------------- | ------ |
| fixed | 是否固定列 | `"left"`, `"right"` | 100    |

## Config

| 参数                           | 说明                                     | 类型   | 默认值              |
| ------------------------------ | ---------------------------------------- | ------ | ------------------- |
| FIXED_COLUMN_SHADOW_COLOR      | 固定列阴影靠近边界的颜色                 | string | `rgba(0,0,0,0.1)`  |
| FIXED_COLUMN_SHADOW_FADE_COLOR | 固定列阴影渐隐末端的颜色                 | string | `rgba(0,0,0,0)`    |
| FIXED_COLUMN_SHADOW_WIDTH      | 固定列阴影宽度，设为 `0` 可关闭阴影      | number | 4                   |


## 固定表头

- `config.HEIGHT`高度，设置高度表示固定表头

::: demo

fixed/fixed-header
h:400px
h:350px
:::

## 不固定表头

- `config.MAX_HEIGHT` 和`config.HEIGHT`为0，表示不固定表头

::: demo

fixed/no-fixed-header
h:400px
:::

## 固定列

- fixed 可为`"left","right"`

::: demo

fixed/left-right
h:320px
:::

## 自定义固定列阴影

-   颜色可通过 `--evt-fixed-column-shadow-color` 和 `--evt-fixed-column-shadow-fade-color` 设置
-   宽度通过 `config.FIXED_COLUMN_SHADOW_WIDTH` 设置
-   Config 中显式传入颜色时，优先于 CSS 变量

::: demo

fixed/shadow
h:320px
:::
