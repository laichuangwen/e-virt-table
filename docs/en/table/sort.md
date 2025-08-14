# Table Header Sorting

## Config

| Parameter      | Description                                    | Type     | Default |
| -------------- | ---------------------------------------------- | -------- | ------- |
| SORT_STRICTLY  | Enable strict sorting, false supports multi-column sorting | boolean | true    |

## Column

| Parameter         | Description      | Type                                                                   | Default |
| ----------------- | ---------------- | ---------------------------------------------------------------------- | ------- |
| sortBy            | Sorting type     | `'number'`, `'string'`, `'date'`, `(a: rowData, b: rowData) => number` | -       |
| sortIconName      | Default sort icon | `string`                                                               | -       |
| sortAscIconName   | Ascending sort icon | `string`                                                               | -       |
| sortDescIconName  | Descending sort icon | `string`                                                               | -       |

## Events

| Event Name   | Description                                    | Callback Parameters                    |
| ------------ | ---------------------------------------------- | -------------------------------------- |
| sortChange   | Triggered when table sorting conditions change | Map<string, SortStateMapItem>         |

## Sorting Types

### Number Sorting

Use `sortBy: 'number'` for numeric column sorting. Comparison uses standard numeric comparison.

```javascript
{
    title: 'Age',
    key: 'age',
    sortBy: 'number'
}
```

### String Sorting

Use `sortBy: 'string'` for text column sorting. Comparison uses `localeCompare()` for proper string sorting.

```javascript
{
    title: 'Name',
    key: 'name',
    sortBy: 'string'
}
```

### Date Sorting

Use `sortBy: 'date'` for date column sorting.
> Built-in universal time format conversion sorting, not all formats are supported. For other formats, please use custom sorting!

| Format Type      | Example Format       | Description        |
| ---------------- | -------------------- | ------------------ |
| Date             | Date                 | Date format        |
| Year-Month-Day   | YYYY-MM-DD           | Standard ISO format |
| Year/Month/Day   | YYYY/MM/DD           | Slash separated format |
| Year.Month.Day   | YYYY.MM.DD           | Dot separated format |
| Day-Month-Year   | DD-MM-YYYY           | European date format |
| Day/Month/Year   | DD/MM/YYYY           | European slash format |
| Day.Month.Year   | DD.MM.YYYY           | European dot format |
| Month-Day-Year   | MM-DD-YYYY           | US date format |
| Month/Day/Year   | MM/DD/YYYY           | US slash format |
| Month.Day.Year   | MM.DD.YYYY           | US dot format |
| Pure Numbers     | YYYYMMDD             | Continuous number format |
| With Time        | YYYY-MM-DD HH:mm:ss  | Including hours, minutes, seconds |
| With Time Slash  | YYYY/MM/DD HH:mm:ss  | Slash format with time |

```javascript
{
    title: 'Join Date',
    key: 'joinDate',
    sortBy: 'date'
}
```

### Custom Sorting Function

Use custom functions for complex sorting logic.

```javascript
{
    title: 'Rating',
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

## Basic Usage

When a column is configured with the `sortBy` property, the table header will display a sort icon. Clicking the icon cycles through: no sorting → ascending → descending → no sorting.

::: demo

sort/base
h:400px
:::

## Multi-Column Sorting
<!-- 表格支持多列排序。当多个列被排序时，会按照点击顺序（越晚的升降序越是主要排序依据）依次应用排序 -->
When `SORT_STRICTLY=false`, the table support multi-column sorting. When multiple columns are sorted, sorting will be applied in order of clicking (the later ascending and descending order is more stronger)..

::: demo

sort/multiple
h:400px
:::

## Sort Icons

Different sorting types display different icons. You need to configure SVG icons yourself.

::: demo

sort/icon
h:400px
:::

## Tree Data Support

The sorting feature supports tree data structures. When sorting is applied, it recursively sorts all levels of the tree while maintaining the hierarchical structure.

::: demo

sort/tree
h:400px
:::

## Server-Side Sorting

When a column is configured with `sortBy: api`, server-side sorting is enabled. Server-side sorting does not process data on the frontend, but interacts with the backend through the `sortChange` event. The backend returns data directly to loadData.

::: demo

sort/api
h:400px
:::
