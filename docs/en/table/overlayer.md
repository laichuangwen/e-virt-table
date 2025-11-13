# Slot (Overlayer)
Note: Overlayer is not an editor, it's recommended to only use it for cell display

-   Overlay elements above the table to implement custom slot component functionality


## Config

| Parameter                | Description                    | Type | Default |
| ------------------------ | ------------------------------ | ---- | ------- |
| BODY_CELL_RENDER_METHOD  | Custom cell type render method | —    |         |

## Events

| Event Name      | Description         | Callback Parameters        |
| --------------- | ------------------- | -------------------------- |
| overlayerChange | Overlayer callback  | `({type,views,style})`     |

## Built-in
  > Note: Built-in version is available from version 1.3.9 onwards
- Returns element in render, renderHeader, renderFooter

::: demo

overlayer/base
h:420px
:::


## Custom Overlayer
vue2, vue3, react, etc. can refer to this example's structure for encapsulation
- Pass overlayerEl
- Use `overlayerChange` to dynamically insert elements into header, body, footer

::: demo

overlayer/custom
h:420px
:::