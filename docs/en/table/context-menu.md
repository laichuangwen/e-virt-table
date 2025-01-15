# Context Menu

## Config

| Parameter           | Description       | Type    | Default |
| ------------------- | ----------------- | ------- | ------- |
| ENABLE_CONTEXT_MENU | Enable context menu | boolean | false   |

## Methods

| Method Name     | Description       | Parameters |
| --------------- | ----------------- | ---------- |
| contextMenuHide | Hide context menu | —          |
| emit            | Emit event        | —          |

### Built-in Methods

-   Copy `contextMenuCopy`
-   Paste `contextMenuPaste`
-   Cut `contextMenuCut`
-   Clear `contextMenuClearSelected`

Usage: emit('contextMenuCopy')

## Enable

-   `ENABLE_CONTEXT_MENU` is false by default

::: demo

context-menu/enable 
h:320px
:::

## Custom Context Menu

-   Pass contextMenuElement to the constructor

::: demo

context-menu/custom
h:320px 

:::
