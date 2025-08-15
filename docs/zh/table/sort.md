# 表头排序

## Config

| 参数          | 说明                            | 类型    | 默认值 |
| ------------- | ------------------------------- | ------- | ------ |
| SORT_STRICTLY | 启用严格排序，false支持多列排序 | boolean | true   |

## Column

| 参数             | 说明         | 类型                                                                   | 默认值 |
| ---------------- | ------------ | ---------------------------------------------------------------------- | ------ |
| sortBy           | 排序类型     | `'number'`, `'string'`, `'date'`, `(a: rowData, b: rowData) => number` | -      |
| sortIconName     | 默认排序图标 | `string`                                                               | -      |
| sortAscIconName  | 升序排序图标 | `string`                                                               | -      |
| sortDescIconName | 降序排序图标 | `string`                                                               | -      |

## Events

| 事件名称   | 说明                                       | 回调参数                      |
| ---------- | ------------------------------------------ | ----------------------------- |
| sortChange | 当表格的排序条件发生变化的时候会触发该事件 | Map<string, SortStateMapItem> |


## Methods

| 方法名称  | 说明     | 参数 |
| --------- | -------- | ---- |
| clearSort | 清除排序 | -    |

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

使用 `sortBy: 'date'` 进行日期列排序。
>内置通用时间格式转换排序，不是所有格式都支持，如有其他的请用自定义！ 

| 格式类型   | 示例格式            | 说明           |
| ---------- | ------------------- | -------------- |
| Date       | Date                | Date格式       |
| 年-月-日   | YYYY-MM-DD          | 标准ISO格式    |
| 年/月/日   | YYYY/MM/DD          | 斜杠分隔格式   |
| 年.月.日   | YYYY.MM.DD          | 点分隔格式     |
| 日-月-年   | DD-MM-YYYY          | 欧洲日期格式   |
| 日/月/年   | DD/MM/YYYY          | 欧洲斜杠格式   |
| 日.月.年   | DD.MM.YYYY          | 欧站点分隔格式 |
| 月-日-年   | MM-DD-YYYY          | 美国日期格式   |
| 月/日/年   | MM/DD/YYYY          | 美国斜杠格式   |
| 月.日.年   | MM.DD.YYYY          | 美站点分隔格式 |
| 纯数字     | YYYYMMDD            | 连续数字格式   |
| 带时间     | YYYY-MM-DD HH:mm:ss | 包含时分秒     |
| 带时间斜杠 | YYYY/MM/DD HH:mm:ss | 斜杠格式带时间 |

```javascript
{
    title: '入职日期',
    key: 'joinDate',
    sortBy: 'date'
}
```

### 自定义排序函数

使用自定义函数进行复杂的排序逻辑。

```javascript
{
    title: '状态',
    key: 'status',
    sortBy: (a, b) => {
        // 自定义排序逻辑
        return (a.status === '在职' ? -1 : 1) - (b.status === '在职' ? -1 : 1);
    }
}
```

## 基础用法

当列配置了 `sortBy` 属性时，表头会显示排序图标。点击图标可以循环切换：不排序 → 升序 → 降序 → 不排序。

::: demo

sort/base
h:400px
:::


## 多列排序

`SORT_STRICTLY=false`表格支持多列排序。当多个列被排序时，会按照点击顺序（越晚的升降序越是主要排序依据）依次应用排序。

::: demo

sort/multiple
h:400px
:::

## 排序图标

不同的排序类型显示不同的图标,需要自己配置svg

::: demo

sort/icon
h:400px
:::

## 树形数据支持

排序功能支持树形数据结构。当应用排序时，会递归地对树的所有层级进行排序，保持层次结构。

::: demo

sort/tree
h:400px
:::



## 服务端排序

当列配置了 `sortBy: api` 时，会启用服务端排序功能。服务端排序不会在前端进行数据处理，而是通过`sortChange`事件与后端进行交互。后端返回数据直接loadData
::: demo

sort/api
h:400px
:::
