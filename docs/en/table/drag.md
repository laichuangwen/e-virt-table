# Drag and Drop

## Config

| Parameter         | Description                  | Type    | Default |
| ----------------- | ---------------------------- | ------- | ------- |
| ENABLE_DRAG_ROW   | Enable row dragging          | boolean | false   |
| ENABLE_DRAG_COLUMN| Enable column dragging       | boolean | false   |
| DRAG_ICON_SIZE    | Drag icon size               | number  | 16      |
| DRAG_ICON_OPACITY | Drag icon opacity            | number  | 0.6     |

## Events

| Event Name  | Description                          | Callback Parameters      |
| ----------- | ------------------------------------ | ------------------------ |
| rowMove     | Triggered when a row is dragged     | RowMoveEventData         |
| columnMove  | Triggered when a column is dragged  | ColumnMoveEventData      |
| dragStart   | Triggered when dragging starts      | DragEventData            |
| dragEnd     | Triggered when dragging ends        | DragEventData            |

## Event Data Types

### RowMoveEventData
```typescript
interface RowMoveEventData {
    source: any;              // Source row data
    target: any | null;       // Target row data, null means move to first position
    sourceRowKey: string;     // Source row key
    targetRowKey: string | null; // Target row key, null means move to first position
}
```

### ColumnMoveEventData
```typescript
interface ColumnMoveEventData {
    source: Column;           // Source column configuration
    target: Column | null;    // Target column configuration, null means move to first position
    sourceColumnKey: string;  // Source column key
    targetColumnKey: string | null; // Target column key, null means move to first position
}
```

## Row Dragging

Row dragging allows users to reorder table rows by dragging. When enabled, a drag icon appears on row hover, and blue horizontal drop indicators show during dragging.

### Basic Row Dragging

The simplest row dragging implementation, handling row reordering by listening to the `rowMove` event.

::: demo

drag/row-basic
h:400px
:::

### Row Dragging with Data Update

Real-world row dragging example showing how to generate new data and reload it into the table after dragging.

::: demo

drag/row-data-update
h:400px
:::

### Tree Data Row Dragging

Supports row dragging in tree structures, allowing changes to parent-child relationships and hierarchy levels.

::: demo

drag/row-tree
h:450px
:::

## Column Dragging

Column dragging allows users to reorder table columns by dragging. When enabled, a drag icon appears on header hover, and yellow vertical drop indicators show during dragging.

### Basic Column Dragging

The simplest column dragging implementation, handling column reordering by listening to the `columnMove` event.

::: demo

drag/column-basic
h:400px
:::

### Column Dragging with Reorder Update

Real-world column dragging example showing how to reorganize column configuration and update table display after dragging.

::: demo

drag/column-reorder
h:400px
:::

### Multi-level Header Column Dragging

Supports column dragging in multi-level header structures, allowing dragging of parent or child headers to reorganize column structure.

::: demo

drag/column-multilevel
h:450px
:::

## Drag Interaction Guide

### Row Dragging Process
1. Hover over a table row to show the drag icon (usually on the left side of the first column)
2. Click and hold the drag icon to start dragging
3. During dragging, blue horizontal indicators show valid drop positions
4. Release the mouse to complete the drag and trigger the `rowMove` event

### Column Dragging Process
1. Hover over a header cell to show the drag icon (usually at the top center of the header)
2. Click and hold the drag icon to start dragging
3. During dragging, yellow vertical indicators show valid drop positions
4. Release the mouse to complete the drag and trigger the `columnMove` event

### Drag Constraints
- Row and column dragging are independent and don't interfere with each other
- Only corresponding type indicators are shown during dragging
- Supports auto-scrolling when dragging near table boundaries
- Can drag to first position (target is null)

## Advanced Usage

### Drag Started

```javascript
eVirtTable.on('dragStart', (eventData) => {
    if (eventData.type === 'row' && someCondition) {
    }
});
```

### Data Processing After Drag Completion

```javascript
eVirtTable.on('rowMove', (eventData) => {
    const { source, target, sourceRowKey, targetRowKey } = eventData;
    
    // Reorganize data
    const newData = reorganizeData(currentData, sourceRowKey, targetRowKey);
    
    // Update table data
    eVirtTable.loadData(newData);
    
    // Save to server
    saveToServer(newData);
});

eVirtTable.on('columnMove', (eventData) => {
    const { source, target, sourceColumnKey, targetColumnKey } = eventData;
    
    // Reorganize column configuration
    const newColumns = reorganizeColumns(currentColumns, sourceColumnKey, targetColumnKey);
    
    // Update table column configuration
    eVirtTable.loadColumns(newColumns);
    
    // Save user column preferences
    saveColumnPreference(newColumns);
});
```

### Tree Data Drag Handling

For tree data, dragging may involve hierarchy relationship changes:

```javascript
eVirtTable.on('rowMove', (eventData) => {
    const { source, target } = eventData;
    
    if (target === null) {
        // Move to root level
        source.parentId = null;
        source.level = 0;
    } else {
        // Move after target node, maintaining same level
        source.parentId = target.parentId;
        source.level = target.level;
    }
    
    // Rebuild tree structure
    const newTreeData = rebuildTreeStructure(currentData);
    eVirtTable.loadData(newTreeData);
});
```
