# 表头排序

## Column

| 参数   | 说明     | 类型                                                           | 默认值 |
| ------ | -------- | -------------------------------------------------------------- | ------ |
| sortBy | 排序类型 | `'number'`, `'string'`, `'date'`, `['date', string]`, `(a: any, b: any) => number` | -      |

## 基础用法

当列配置了 `sortBy` 属性时，表头会显示排序图标。点击图标可以循环切换：不排序 → 升序 → 降序 → 不排序。

::: demo

sort/header-sort-zh
h:400px
:::

## 排序类型

### 数字排序

使用 `sortBy: 'number'` 进行数字列排序。比较使用标准数字比较。

```javascript
{
    title: '年龄',
    key: 'age',
    sortBy: 'number'
}
```

### 字符串排序

使用 `sortBy: 'string'` 进行文本列排序。比较使用 `localeCompare()` 进行正确的字符串排序。

```javascript
{
    title: '姓名',
    key: 'name',
    sortBy: 'string'
}
```

### 日期排序

使用 `sortBy: 'date'` 进行日期列排序。比较使用 dayjs 进行日期比较。

```javascript
{
    title: '入职日期',
    key: 'joinDate',
    sortBy: 'date'
}
```

### 带格式的日期排序

使用 `sortBy: ['date', 'YYYY-MM-DD']` 进行特定格式的日期排序。

```javascript
{
    title: '出生日期',
    key: 'birthDate',
    sortBy: ['date', 'YYYY-MM-DD']
}
```

### 自定义排序函数

使用自定义函数进行复杂的排序逻辑。

```javascript
{
    title: '评分',
    key: 'score',
    sortBy: (a, b) => {
        // 自定义排序逻辑
        if (a.status !== b.status) {
            return a.status === '在职' ? -1 : 1;
        }
        return a.score - b.score;
    }
}
```

## 多列排序

表格支持多列排序。当多个列被排序时，会按照点击顺序（基于时间戳的优先级）依次应用排序。

## 排序图标

不同的排序类型显示不同的图标：

- **数字**: `sort-by-number-asc`, `sort-by-number-desc`
- **字符串**: `sort-by-character-asc`, `sort-by-character-desc`
- **日期**: `sort-by-date-asc`, `sort-by-date-desc`
- **自定义函数**: `sort-asc`, `sort-desc`
- **未排序**: `sortable`

## 图标位置

排序图标的位置根据文本对齐方式遵循以下规则：

- **左对齐**: 先绘制文字，图标紧跟文字
- **居中对齐**: 先居中绘制文字，然后图标紧跟文字
- **右对齐**: 先绘制图标靠右，然后文字根据图标绘制后的位置紧贴在图标的左侧

## 树形数据支持

排序功能支持树形数据结构。当应用排序时，会递归地对树的所有层级进行排序，保持层次结构。

## 服务端排序

当列配置了 `apiSortable: true` 时，会启用服务端排序功能。服务端排序不会在前端进行数据处理，而是通过事件机制与后端进行交互。
::: demo

sort/backend-sort
h:400px
:::
### 使用方法

```javascript
{
    title: '姓名',
    key: 'name',
    apiSortable: true
}
```

### 事件监听

```javascript
// 监听排序查询事件
eVirtTable.on('sortQuery', (sortData) => {
    // sortData 格式: [{ field: 'name', direction: 'asc' }, ...]
    // 调用后端接口获取排序后的数据
    fetchSortedData(sortData).then(data => {
        eVirtTable.loadData(data);
        eVirtTable.setSortQueryData(sortData);
    });
});
```

### API 方法

- `setSortQueryData(sortData: { field: string, direction: 'asc' | 'desc' }[])`: 设置服务端排序状态（不会触发 sortQuery 事件）

## API

### Database 方法

- `getSortState(key: string)`: 获取列的当前排序状态
- `setSortState(key: string, direction: 'asc' | 'desc' | 'none')`: 设置列的排序状态
- `clearSortState()`: 清除所有排序状态 