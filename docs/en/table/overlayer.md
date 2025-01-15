# Slots (Overlay)

-   Implement custom slot component functionality by overlaying elements on top of the table

## Config

| Parameter          | Description               | Type | Default |
| ------------------ | ------------------------- | ---- | ------- |
| CELL_RENDER_METHOD | Custom cell type render   | —    |         |

## Events

| Event Name        | Description   | Callback Parameters       |
| ----------------- | ------------- | ------------------------- |
| overlayerChange   | Overlay callback | `({type, views, style})` |

## Enable

-   Use `overlayerChange` to dynamically insert elements into the header, body, and footer

::: demo

overlayer/base
h:420px
:::
