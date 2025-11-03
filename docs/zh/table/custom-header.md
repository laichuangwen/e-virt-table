# 自定义表头

## Config

| 参数                       | 说明                          | 类型       | 默认值 |
| -------------------------- | ----------------------------- | ---------- | ------ |
| ENABLE_HEADER_CONTEXT_MENU | 是否启用 header 区域右键菜单  | boolean    | false  |
| HEADER_CONTEXT_MENU        | header 区域默认右键菜单项配置 | MenuItem[] | 见下文 |
| ENABLE_RESIZE_COLUMN       | 调整列宽                      | boolean    | true   |
| ENABLE_DRAG_COLUMN         | 启用拖拽列                    | boolean    | false  |



## Methods

| 方法名称        | 说明                             | 参数                        |
| --------------- | -------------------------------- | --------------------------- |
| setCustomHeader | 设置自定义表头                   | `(CustomHeader,ignoreEmit)` |
| getCustomHeader | 获取自定义表头数据 | `{CustomHeader，Column[]}`  |

## Events

| 事件名称           | 说明           | 回调参数       |
| ------------------ | -------------- | -------------- |
| customHeaderChange | 自定义表头事件 | `CustomHeader` |


## 自定义表头
- 支持隐藏\显示
- 支持左\右\取消固定
- 支持拖拽调整位置
- 支持拖拽改变宽度
- 所有改变都会触发`customHeaderChange`逻辑收敛


::: demo

custom-header/base
h:420px 
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

const HEADER_CONTEXT_MENU: MenuItem[] = [
    { label: '左固定', value: 'fixedLeft' },
    { label: '右固定', value: 'fixedRight' },
    { label: '取消固定', value: 'fixedNone' },
    { label: '隐藏', value: 'hide' },
    { label: '显示', value: 'visible' },
    { label: '恢复默认', value: 'resetHeader' },
];

export type CustomHeader = {
    fixedData?: Record<string, Fixed | ''>;
    sortData?: Record<string, number>;
    hideData?: Record<string, boolean>;
    resizableData?: Record<string, number>;
};

```
