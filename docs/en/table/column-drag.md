# Column Drag

## Config

| Parameter              | Description         | Type   | Default            |
| ----------------- | ------------ | ------ | ----------------- |
| ENABLE_DRAG_COLUMN     | Enable column drag     | boolean | false                |

## Column

| Parameter  | Description       | Type                | Default |
| ----- | ---------- | ------------------- | ------ |
| dragDisabled | Disable column drag | boolean | false    |

## Events

| Event Name    | Description       | Callback Parameters                                      |
| ----------- | ---------- | --------------------------------------------- |
| columnDragChange | Column drag event | `ColumnDragChangeEvent` |
| customHeaderChange | Custom header event | `CustomHeader` |

## Methods

| Method Name             | Description                             | Parameters                                                  |
| -------------------- | -------------------------------- | ----------------------------------------------------- |
| setCustomHeader | Set custom header | `CustomHeader` |
| getCustomHeader | Get custom header data | `{CustomHeader，Column[]}` |

## Column Drag

- Set ENABLE_DRAG_COLUMN to true to enable column header drag
- Column header drag only supports same-level dragging
- dragDisabled disables dragging

::: demo

column-drag/base
h:400px
:::

## Custom Header
- Refer to [Custom Header](/en/table/custom-header)

## Types

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