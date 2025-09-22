# Column Drag

## Config

| Parameter              | Description         | Type   | Default            |
| ----------------- | ------------ | ------ | ----------------- |
| ENABLE_DRAG_COLUMN     | Enable column drag     | boolean | false                |

## Column

| Parameter  | Description       | Type                | Default |
| ----- | ---------- | ------------------- | ------ |
| columnDragDisabled | Disable column drag | boolean | false    |

## Events

| Event Name    | Description       | Callback Parameters                                      |
| ----------- | ---------- | --------------------------------------------- |
| columnDragChange | Column drag event | `ColumnDragChangeEvent` |
| customHeaderChange | Custom header event | `CustomHeaderType` |

## Methods

| Method Name             | Description                             | Parameters                                                  |
| -------------------- | -------------------------------- | ----------------------------------------------------- |
| setCustomHeader | Set custom header | `CustomHeaderType` |
| getCustomHeader | Get custom header data | `{CustomHeaderType，Column[]}` |

## Column Drag

- Set ENABLE_DRAG_COLUMN to true to enable column header drag
- Column header drag only supports same-level dragging
- columnDragDisabled disables dragging

::: demo

column-drag/base
h:400px
:::

## Custom Header
- Implement custom header by combining column width adjustment and header dragging
- 
::: demo

column-drag/customHeader
h:400px
:::

## Types

``` ts
export type CustomHeaderType = {
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