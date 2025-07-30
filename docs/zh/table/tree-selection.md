# 树形选择

树形选择功能允许在树形结构中实现复杂的选择逻辑，支持父子节点的联动选择。

## 基本用法

```javascript
const columns = [
    {
        title: '选择',
        type: 'tree-selection',
        key: 'selection',
        width: 60,
        readonly: true
    },
    {
        title: '名称',
        key: 'name',
        width: 200
    }
];

const data = [
    {
        id: '1',
        name: '部门A',
        children: [
            {
                id: '1-1',
                name: '子部门A1',
                children: [
                    { id: '1-1-1', name: '员工A1-1' },
                    { id: '1-1-2', name: '员工A1-2' }
                ]
            }
        ]
    }
];
```

## 选择模式

### Auto 模式

默认模式，子项选中即是半选当做选中。

```javascript
const config = {
    TREE_SELECT_MODE: 'auto'
};
```

**特点：**
- 当子项被选中时，父项自动变为半选状态
- 点击父项会选中/取消选中所有子项
- 半选状态表示部分子项被选中

### Cautious 模式

只有子项全选时父项选中，父项选中也会使子项全选。

```javascript
const config = {
    TREE_SELECT_MODE: 'cautious'
};
```

**特点：**
- 只有所有子项都被选中时，父项才会被选中
- 点击父项会选中/取消选中所有子项
- 全选时父项点击则清空子项和父项取消勾选

### Strictly 模式

父子项互不干扰各选各的。

```javascript
const config = {
    TREE_SELECT_MODE: 'strictly'
};
```

**特点：**
- 父项和子项的选择状态完全独立
- 点击父项不会影响子项的选择状态
- 点击子项不会影响父项的选择状态

## 配置项

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| TREE_SELECT_MODE | 树形选择模式 | 'auto' \| 'cautious' \| 'strictly' | 'auto' |

## 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| selectionChange | 选择状态改变时触发 | (selectedRows: any[]) |

## 示例

### 基础示例

<iframe src="/examples/tree-selection/base.html" style="width: 100%; height: 400px; border: none;"></iframe>

### Auto 模式

<iframe src="/examples/tree-selection/auto.html" style="width: 100%; height: 400px; border: none;"></iframe>

### Cautious 模式

<iframe src="/examples/tree-selection/cautious.html" style="width: 100%; height: 400px; border: none;"></iframe>

### Strictly 模式

<iframe src="/examples/tree-selection/strictly.html" style="width: 100%; height: 400px; border: none;"></iframe> 