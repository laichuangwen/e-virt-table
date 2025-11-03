# Custom Header

## Config

| Parameter                       | Description                          | Type       | Default |
| ------------------------------- | ------------------------------------ | ---------- | ------- |
| ENABLE_HEADER_CONTEXT_MENU      | Enable header area context menu      | boolean    | false   |
| HEADER_CONTEXT_MENU             | Header area default context menu items | MenuItem[] | See below |
| ENABLE_RESIZE_COLUMN            | Resize column width                  | boolean    | true    |
| ENABLE_DRAG_COLUMN              | Enable column drag                   | boolean    | false   |

## Methods

| Method Name        | Description                             | Parameters                        |
| ------------------ | --------------------------------------- | --------------------------------- |
| setCustomHeader    | Set custom header                       | `(CustomHeader,ignoreEmit)`       |
| getCustomHeader    | Get custom header data                  | `{CustomHeader，Column[]}`        |

## Events

| Event Name           | Description           | Callback Parameters |
| -------------------- | --------------------- | ------------------- |
| customHeaderChange   | Custom header event   | `CustomHeader`      |

## Custom Header
- Support hide/show
- Support left/right/unfix
- Support drag to adjust position
- Support drag to change width
- All changes will trigger `customHeaderChange` logic convergence

::: demo

custom-header/base
h:420px 

:::

## Typings

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

const HEADER_CONTEXT_MENU: MenuItem[] = [
    { label: 'Fixed Left', value: 'fixedLeft' },
    { label: 'Fixed Right', value: 'fixedRight' },
    { label: 'Unfix', value: 'fixedNone' },
    { label: 'Hide', value: 'hide' },
    { label: 'Show', value: 'visible' },
    { label: 'Reset Default', value: 'resetHeader' },
];

export type CustomHeader = {
    fixedData?: Record<string, Fixed | ''>;
    sortData?: Record<string, number>;
    hideData?: Record<string, boolean>;
    resizableData?: Record<string, number>;
};

```