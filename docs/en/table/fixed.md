# Fixed

## Column

| Parameter | Description  | Type                | Default |
| --------- | ------------ | ------------------- | ------- |
| fixed     | Fixed column | `"left"`, `"right"` | 100     |

## Config

| Parameter                      | Description                                      | Type   | Default             |
| ------------------------------ | ------------------------------------------------ | ------ | ------------------- |
| FIXED_COLUMN_SHADOW_COLOR      | Shadow color next to the fixed-column boundary   | string | `rgba(0,0,0,0.1)`  |
| FIXED_COLUMN_SHADOW_FADE_COLOR | Shadow color at the faded edge                   | string | `rgba(0,0,0,0)`    |
| FIXED_COLUMN_SHADOW_WIDTH      | Shadow width; set to `0` to disable the shadow   | number | 4                   |

## Fixed Header

- `config.HEIGHT` height, setting the height means fixed header

::: demo

fixed/fixed-header
h:400px
h:350px
:::

## Non-Fixed Header

- `config.MAX_HEIGHT` and `config.HEIGHT` set to 0 means non-fixed header

::: demo

fixed/no-fixed-header
h:400px
:::

## Fixed Column

- fixed can be `"left","right"`

::: demo

fixed/left-right
h:320px
:::

## Custom Fixed-Column Shadow

-   Set colors with `--evt-fixed-column-shadow-color` and `--evt-fixed-column-shadow-fade-color`.
-   Set width with `config.FIXED_COLUMN_SHADOW_WIDTH`.
-   Explicit Config colors take precedence over CSS variables.

::: demo

fixed/shadow
h:320px
:::
