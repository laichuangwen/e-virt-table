# 右键菜单

## Config

| 参数                | 说明         | 类型    | 默认值 |
| ------------------- | ------------ | ------- | ------ |
| ENABLE_CONTEXT_MENU | 启用右键菜单 | boolean | false  |

## Methods

| 方法名称        | 说明         | 参数 |
| --------------- | ------------ | ---- |
| contextMenuHide | 隐藏右键菜单 | —    |
| emit            | 发出监听事件 | —    |

### 内置操作方法

-   复制 `contextMenuCopy`
-   粘贴 `contextMenuPaste`
-   剪切 `contextMenuCut`
-   清空 `contextMenuClearSelected`

使用方式 emit('contextMenuCopy')

## 启用

-   `ENABLE_CONTEXT_MENU`默认是 false

::: demo

context-menu/enable 
h:320px
:::

## 自定义右键

-   构造函数传递 contextMenuElement

::: demo

context-menu/custom
h:320px 

:::
