# 右键菜单

## Config

| 参数                       | 说明                          | 类型       | 默认值 |
| -------------------------- | ----------------------------- | ---------- | ------ |
| ENABLE_CONTEXT_MENU        | 是否启用 body 区域右键菜单    | boolean    | false  |
| ENABLE_HEADER_CONTEXT_MENU | 是否启用 header 区域右键菜单  | boolean    | false  |
| CONTEXT_MENU               | body 区域默认右键菜单项配置   | MenuItem[] | 见下文 |
| HEADER_CONTEXT_MENU        | header 区域默认右键菜单项配置 | MenuItem[] | 见下文 |
| CUSTOM_BODY_CONTEXT_MENU   | 自定义 body 区域右键菜单项    | MenuItem[] | []     |
| CUSTOM_HEADER_CONTEXT_MENU | 自定义 header 区域右键菜单项  | MenuItem[] | []     |

> 说明：  
> - `CONTEXT_MENU` 和 `HEADER_CONTEXT_MENU` 提供默认的右键菜单项，可通过配置项自定义或扩展。  
> - `CUSTOM_BODY_CONTEXT_MENU` 和 `CUSTOM_HEADER_CONTEXT_MENU` 用于完全自定义菜单项，设置后会向下添加菜单。

## Methods

| 方法名称        | 说明         | 参数 |
| --------------- | ------------ | ---- |
| contextMenuHide | 隐藏右键菜单 | —    |
| emit            | 触发监听事件 | —    |

### 内置操作方法

内置支持以下右键菜单操作，设置对应value 值：

-   复制：`copy`
-   粘贴：`paste`
-   剪切：`cut`
-   清空选中内容：`clearSelected`
-   固定列（表头）：`fixedLeft`、`fixedRight`
-   取消固定（表头）：`fixedNone`
-   隐藏列（表头）：`hide`
-   取消隐藏（表头）：`visible`
-   恢复默认（表头）：`resetHeader`

## 右键表头&body


::: demo

context-menu/enable 
h:320px
:::

## 右键多级&图标

-  `CONTEXT_MENU` 和 `HEADER_CONTEXT_MENU` 提供默认的右键菜单项，不需要自行清空
-  右键子项支持多级及svg图标
-  event的callback可关闭,默认是不管关闭需要自己调用
::: demo

context-menu/level 
h:320px
:::

## 自定义右键

-   构造函数传递 contextMenuElement

::: demo

context-menu/custom
h:320px 

:::

## typings

```  ts
type MenuItemEvent =
    | 'copy'
    | 'paste'
    | 'cut'
    | 'clearSelected'
    | 'fixedLeft'
    | 'fixedRight'
    | 'fixedNone'
    | 'hide'
    | 'resetHeader'
    | 'visible';

type MenuItem = {
    label: string;
    value: string | MenuItemEvent;
    event?: Function;
    icon?: string;
    divider?: boolean;
    disabled?: boolean;
    children?: MenuItem[];
};

const CONTEXT_MENU: MenuItem[] = [
    { label: '复制', value: 'copy' },
    { label: '剪切', value: 'cut' },
    { label: '粘贴', value: 'paste' },
    { label: '清空选中内容', value: 'clearSelected' },
];

const HEADER_CONTEXT_MENU: MenuItem[] = [
    { label: '左固定', value: 'fixedLeft' },
    { label: '右固定', value: 'fixedRight' },
    { label: '取消固定', value: 'fixedNone' },
    { label: '隐藏', value: 'hide' },
    { label: '显示', value: 'visible' },
    { label: '恢复默认', value: 'resetHeader' },
];

```
