# Tree Selection

## Column

-   `type=tree-selection` or `type=selection-tree` enables tree selection

| Parameter | Description | Type | Default |
|-----------|-------------|------|---------|
| type | Selection type | `index,selection,index-selection,tree-selection,selection-tree` | — |

## Config

| Parameter | Description | Type | Default |
|-----------|-------------|------|---------|
| TREE_SELECT_MODE | Tree selection mode | `'auto' \| 'cautious' \| 'strictly'` | 'auto' |

## Selection Modes

### Auto Mode

Default mode, child selection is treated as indeterminate selection. When child items are selected, parent items automatically become indeterminate.

### Cautious Mode

Parent items are only selected when all child items are selected. When parent items are selected, all child items will also be selected. When fully selected, clicking parent items clears all child and parent selections.

### Strictly Mode

Parent and child items are independent of each other. Parent and child selection states are completely independent.

## Basic Example

::: demo

tree-selection/base
h:340px
:::

## Using tree-selection Type

The `tree-selection` type renders the tree icon first, then the checkbox, suitable for scenarios where tree hierarchy display takes priority.

::: demo

tree-selection/tree-selection-type
h:340px
:::

## Auto Mode

::: demo

tree-selection/auto
h:340px
:::

## Cautious Mode

::: demo

tree-selection/cautious
h:340px
:::

## Strictly Mode

::: demo

tree-selection/strictly
h:340px
::: 