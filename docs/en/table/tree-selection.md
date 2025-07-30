# Tree Selection

Tree selection functionality allows for complex selection logic in tree structures, supporting parent-child node linkage selection.

## Basic Usage

```javascript
const columns = [
    {
        title: 'Selection',
        type: 'tree-selection',
        key: 'selection',
        width: 60,
        readonly: true
    },
    {
        title: 'Name',
        key: 'name',
        width: 200
    }
];

const data = [
    {
        id: '1',
        name: 'Department A',
        children: [
            {
                id: '1-1',
                name: 'Sub Department A1',
                children: [
                    { id: '1-1-1', name: 'Employee A1-1' },
                    { id: '1-1-2', name: 'Employee A1-2' }
                ]
            }
        ]
    }
];
```

## Selection Modes

### Auto Mode

Default mode, child selection is treated as indeterminate selection.

```javascript
const config = {
    TREE_SELECT_MODE: 'auto'
};
```

**Features:**
- When child items are selected, parent items automatically become indeterminate
- Clicking parent items selects/deselects all child items
- Indeterminate state indicates partial child selection

### Cautious Mode

Parent items are only selected when all child items are selected.

```javascript
const config = {
    TREE_SELECT_MODE: 'cautious'
};
```

**Features:**
- Parent items are only selected when all child items are selected
- Clicking parent items selects/deselects all child items
- When fully selected, clicking parent items clears all child and parent selections

### Strictly Mode

Parent and child items are independent of each other.

```javascript
const config = {
    TREE_SELECT_MODE: 'strictly'
};
```

**Features:**
- Parent and child selection states are completely independent
- Clicking parent items doesn't affect child selection states
- Clicking child items doesn't affect parent selection states

## Configuration

| Parameter | Description | Type | Default |
|-----------|-------------|------|---------|
| TREE_SELECT_MODE | Tree selection mode | 'auto' \| 'cautious' \| 'strictly' | 'auto' |

## Events

| Event Name | Description | Callback Parameters |
|------------|-------------|-------------------|
| selectionChange | Triggered when selection state changes | (selectedRows: any[]) |

## Examples

### Basic Example

<iframe src="/examples/tree-selection/base.html" style="width: 100%; height: 400px; border: none;"></iframe>

### Auto Mode

<iframe src="/examples/tree-selection/auto.html" style="width: 100%; height: 400px; border: none;"></iframe>

### Cautious Mode

<iframe src="/examples/tree-selection/cautious.html" style="width: 100%; height: 400px; border: none;"></iframe>

### Strictly Mode

<iframe src="/examples/tree-selection/strictly.html" style="width: 100%; height: 400px; border: none;"></iframe> 