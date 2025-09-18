# 列拖拽

## Config

| 参数              | 说明         | 类型   | 默认值            |
| ----------------- | ------------ | ------ | ----------------- |
| ENABLE_DRAG_COLUMN     | 启用拖拽     | boolean | false                |

## Column

| 参数  | 说明       | 类型                | 默认值 |
| ----- | ---------- | ------------------- | ------ |
| columnDragDisabled | 禁用列拖动 | boolean | false    |

## Events

| 事件名称    | 说明       | 回调参数                                      |
| ----------- | ---------- | --------------------------------------------- |
| columnDragChange | 列拖拽事件 | `ColumnDragChangeEvent` |
| customHeaderChange | 自定义表头事件 | `CustomHeader` |

## Methods

| 方法名称             | 说明                             | 参数                                                  |
| -------------------- | -------------------------------- | ----------------------------------------------------- |
| setCustomHeader | 设置自定义表头 | `CustomHeader` |
| getCustomHeader | 更新数据方法可实现拓展任意编辑器 | `{CustomHeader，Column[]}` |

## 列拖拽

- ENABLE_DRAG_COLUMN为true启用拖拽表头
- 表头拖拽只支持同级拖拽
- columnDragDisabled 禁用拖动

::: demo

column-drag/base
h:400px
:::

## 自定义表头
- 配合调整列宽和拖动表头实现自定义表头
- 
::: demo

column-drag/customHeader
h:400px
:::

## 类型

``` ts
export type CustomHeader = {
    fixedData?: Record<string, Fixed>;
    sortData?: Record<string, number>;
    hideData?: Record<string, boolean>;
    resizableData?: Record<string, number>;
};

export interface ColumnDragChangeEvent {
    source: CellHeader;
    target: CellHeader;
    columns: Column[];
}
```