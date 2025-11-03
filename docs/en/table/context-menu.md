# Context Menu

## Config

| Parameter                       | Description                          | Type       | Default |
| ------------------------------- | ------------------------------------ | ---------- | ------- |
| ENABLE_CONTEXT_MENU             | Enable body area context menu        | boolean    | false   |
| ENABLE_HEADER_CONTEXT_MENU      | Enable header area context menu      | boolean    | false   |
| CONTEXT_MENU                    | Body area default context menu items | MenuItem[] | See below |
| HEADER_CONTEXT_MENU             | Header area default context menu items | MenuItem[] | See below |
| CUSTOM_BODY_CONTEXT_MENU        | Custom body area context menu items  | MenuItem[] | []      |
| CUSTOM_HEADER_CONTEXT_MENU      | Custom header area context menu items | MenuItem[] | []      |

> Note:  
> - `CONTEXT_MENU` and `HEADER_CONTEXT_MENU` provide default context menu items that can be customized or extended through configuration.  
> - `CUSTOM_BODY_CONTEXT_MENU` and `CUSTOM_HEADER_CONTEXT_MENU` are used to completely customize menu items, and will append menus when set.

## Methods

| Method Name     | Description       | Parameters |
| --------------- | ----------------- | ---------- |
| contextMenuHide | Hide context menu | —          |
| emit            | Emit event        | —          |

### Built-in Operation Methods

Built-in support for the following context menu operations, set the corresponding value:

-   Copy: `copy`
-   Paste: `paste`
-   Cut: `cut`
-   Clear selected content: `clearSelected`
-   Fixed columns (header): `fixedLeft`, `fixedRight`
-   Unfix (header): `fixedNone`
-   Hide column (header): `hide`
-   Show column (header): `visible`
-   Reset default (header): `resetHeader`

## Context Menu for Header & Body

::: demo

context-menu/enable 
h:320px
:::

## Multi-level & Icons

-   `CONTEXT_MENU` and `HEADER_CONTEXT_MENU` provide default context menu items, no need to clear manually
-   Context menu sub-items support multi-level and SVG icons
-   Event callback can be closed, by default it doesn't close automatically and needs to be called manually

::: demo

context-menu/level 
h:320px
:::

## Custom Context Menu

-   Pass contextMenuElement to the constructor

::: demo

context-menu/custom
h:320px 

:::

## Typings

``` ts
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
    { label: 'Copy', value: 'copy' },
    { label: 'Cut', value: 'cut' },
    { label: 'Paste', value: 'paste' },
    { label: 'Clear Selected', value: 'clearSelected' },
];

const HEADER_CONTEXT_MENU: MenuItem[] = [
    { label: 'Fixed Left', value: 'fixedLeft' },
    { label: 'Fixed Right', value: 'fixedRight' },
    { label: 'Unfix', value: 'fixedNone' },
    { label: 'Hide', value: 'hide' },
    { label: 'Show', value: 'visible' },
    { label: 'Reset Default', value: 'resetHeader' },
];

```
