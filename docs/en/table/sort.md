# Header Sort

## Column

| Parameter | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| sortBy | Sort type | `'number'`, `'string'`, `'date'`, `['date', string]`, `(a: any, b: any) => number` | - |

## Basic Usage

When a column has the `sortBy` property, a sort icon will appear in the header. Click the icon to cycle through: unsorted → ascending → descending → unsorted.

::: demo

sort/header-sort
h:400px
:::

## Sort Types

### Number Sort

Use `sortBy: 'number'` for numeric columns. The comparison uses standard numeric comparison.

```javascript
{
    title: 'Age',
    key: 'age',
    sortBy: 'number'
}
```

### String Sort

Use `sortBy: 'string'` for text columns. The comparison uses `localeCompare()` for proper string sorting.

```javascript
{
    title: 'Name',
    key: 'name',
    sortBy: 'string'
}
```

### Date Sort

Use `sortBy: 'date'` for date columns. The comparison uses dayjs for date comparison.

```javascript
{
    title: 'Join Date',
    key: 'joinDate',
    sortBy: 'date'
}
```

### Date with Format

Use `sortBy: ['date', 'YYYY-MM-DD']` for dates with specific formats.

```javascript
{
    title: 'Birth Date',
    key: 'birthDate',
    sortBy: ['date', 'YYYY-MM-DD']
}
```

### Custom Sort Function

Use a custom function for complex sorting logic.

```javascript
{
    title: 'Score',
    key: 'score',
    sortBy: (a, b) => {
        // Custom sorting logic
        if (a.status !== b.status) {
            return a.status === 'Active' ? -1 : 1;
        }
        return a.score - b.score;
    }
}
```

## Multi-Column Sorting

The table supports multi-column sorting. When multiple columns are sorted, they are applied in the order they were clicked (timestamp-based priority).

## Sort Icons

Different sort types display different icons:

- **Number**: `sort-by-number-asc`, `sort-by-number-desc`
- **String**: `sort-by-character-asc`, `sort-by-character-desc`
- **Date**: `sort-by-date-asc`, `sort-by-date-desc`
- **Custom Function**: `sort-asc`, `sort-desc`
- **Unsorted**: `sortable`

## Icon Positioning

The sort icon positioning follows these rules based on text alignment:

- **Left-aligned**: Text first, icon immediately follows text
- **Center-aligned**: Text centered, icon immediately follows text
- **Right-aligned**: Icon right-aligned, text immediately to the left of the icon

## Tree Data Support

Sorting works with tree data structures. When sorting is applied, it recursively sorts all levels of the tree, maintaining the hierarchical structure.

## Backend Sorting

When a column is configured with `apiSortable: true`, backend sorting is enabled. Backend sorting does not process data on the frontend, but interacts with the backend through event mechanisms.
::: demo

sort/backend-sort-en
h:400px
:::
### Usage

```javascript
{
    title: 'Name',
    key: 'name',
    apiSortable: true
}
```

### Event Listening

```javascript
// Listen for sort query events
eVirtTable.on('sortQuery', (sortData) => {
    // sortData format: [{ field: 'name', direction: 'asc' }, ...]
    // Call backend API to get sorted data
    fetchSortedData(sortData).then(data => {
        eVirtTable.loadData(data);
        eVirtTable.setSortQueryData(sortData);
    });
});
```

### API Methods

- `setSortQueryData(sortData: { field: string, direction: 'asc' | 'desc' }[])`: Set backend sort state (won't trigger sortQuery event)

## API

### Database Methods

- `getSortState(key: string)`: Get current sort state for a column
- `setSortState(key: string, direction: 'asc' | 'desc' | 'none')`: Set sort state for a column
- `clearSortState()`: Clear all sort states
