# 拖拽功能

## Config

| 参数              | 说明               | 类型    | 默认值 |
| ----------------- | ------------------ | ------- | ------ |
| ENABLE_DRAG_ROW   | 启用行拖拽功能     | boolean | false  |
| ENABLE_DRAG_COLUMN| 启用列拖拽功能     | boolean | false  |
| DRAG_ICON_SIZE    | 拖拽图标大小       | number  | 16     |
| DRAG_ICON_OPACITY | 拖拽图标透明度     | number  | 0.6    |

## Events

| 事件名称    | 说明                                 | 回调参数                 |
| ----------- | ------------------------------------ | ------------------------ |
| rowMove     | 当行被拖拽移动时触发                 | RowMoveEventData         |
| columnMove  | 当列被拖拽移动时触发                 | ColumnMoveEventData      |
| dragStart   | 拖拽开始时触发                       | DragEventData            |
| dragEnd     | 拖拽结束时触发                       | DragEventData            |

## 事件数据类型

### RowMoveEventData
```typescript
interface RowMoveEventData {
    source: any;              // 源行数据
    target: any | null;       // 目标行数据，null表示移动到第一位
    sourceRowKey: string;     // 源行的rowKey
    targetRowKey: string | null; // 目标行的rowKey，null表示移动到第一位
}
```

### ColumnMoveEventData
```typescript
interface ColumnMoveEventData {
    source: Column;           // 源列配置
    target: Column | null;    // 目标列配置，null表示移动到第一位
    sourceColumnKey: string;  // 源列的key
    targetColumnKey: string | null; // 目标列的key，null表示移动到第一位
}
```

## 行拖拽

行拖拽允许用户通过拖拽来重新排列表格行的顺序。启用后，鼠标悬停在行上时会显示拖拽图标，拖拽过程中会显示蓝色的水平放置指示线。

### 基础行拖拽

最简单的行拖拽实现，通过监听 `rowMove` 事件来处理行的重新排序。

::: demo

drag/row-basic
h:400px
:::

### 行拖拽数据更新

实际应用中的行拖拽，演示如何在拖拽后生成新的数据并重新加载到表格中。

::: demo

drag/row-data-update
h:400px
:::

### 树形数据行拖拽

支持树形数据的行拖拽，可以改变节点的父子关系和层级结构。

::: demo

drag/row-tree
h:450px
:::

## 列拖拽

列拖拽允许用户通过拖拽来重新排列表格列的顺序。启用后，鼠标悬停在表头时会显示拖拽图标，拖拽过程中会显示黄色的垂直放置指示线。

### 基础列拖拽

最简单的列拖拽实现，通过监听 `columnMove` 事件来处理列的重新排序。

::: demo

drag/column-basic
h:400px
:::

### 列拖拽排序更新

实际应用中的列拖拽，演示如何在拖拽后重新组织列配置并更新表格显示。

::: demo

drag/column-reorder
h:400px
:::

### 多层表头列拖拽

支持多层表头结构的列拖拽，可以拖拽父级表头或子级表头来重新组织列结构。

::: demo

drag/column-multilevel
h:450px
:::

## 拖拽交互说明

### 行拖拽操作流程
1. 鼠标悬停在表格行上，显示拖拽图标（通常在第一列左侧）
2. 点击并按住拖拽图标开始拖拽
3. 拖拽过程中，可放置的位置会显示蓝色水平指示线
4. 释放鼠标完成拖拽，触发 `rowMove` 事件

### 列拖拽操作流程
1. 鼠标悬停在表头单元格上，显示拖拽图标（通常在表头中央顶部）
2. 点击并按住拖拽图标开始拖拽
3. 拖拽过程中，可放置的位置会显示黄色垂直指示线
4. 释放鼠标完成拖拽，触发 `columnMove` 事件

### 拖拽限制
- 行拖拽和列拖拽相互独立，不会互相干扰
- 拖拽过程中只显示对应类型的放置指示器
- 支持自动滚动：拖拽到边界时会自动滚动表格
- 可以拖拽到第一位（target为null的情况）

## 高级用法

### 拖拽权限控制

可以通过业务逻辑来控制某些行或列是否允许拖拽：

```javascript
eVirtTable.on('dragStart', (eventData) => {
    // 根据业务逻辑决定是否允许拖拽
    if (eventData.type === 'row' && someCondition) {
        // 阻止拖拽开始
        return false;
    }
});
```

### 拖拽完成后的数据处理

```javascript
eVirtTable.on('rowMove', (eventData) => {
    const { source, target, sourceRowKey, targetRowKey } = eventData;
    
    // 重新组织数据
    const newData = reorganizeData(currentData, sourceRowKey, targetRowKey);
    
    // 更新表格数据
    eVirtTable.loadData(newData);
    
    // 发送到服务器保存
    saveToServer(newData);
});

eVirtTable.on('columnMove', (eventData) => {
    const { source, target, sourceColumnKey, targetColumnKey } = eventData;
    
    // 重新组织列配置
    const newColumns = reorganizeColumns(currentColumns, sourceColumnKey, targetColumnKey);
    
    // 更新表格列配置
    eVirtTable.setColumns(newColumns);
    
    // 保存用户的列配置偏好
    saveColumnPreference(newColumns);
});
```

### 树形数据拖拽处理

对于树形数据，拖拽可能涉及层级关系的改变：

```javascript
eVirtTable.on('rowMove', (eventData) => {
    const { source, target } = eventData;
    
    if (target === null) {
        // 移动到根级别
        source.parentId = null;
        source.level = 0;
    } else {
        // 移动到目标节点后面，保持同级
        source.parentId = target.parentId;
        source.level = target.level;
    }
    
    // 重新计算树形结构
    const newTreeData = rebuildTreeStructure(currentData);
    eVirtTable.loadData(newTreeData);
});
```
