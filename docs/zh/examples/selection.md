# 多选

## Column

-   type= `selection`或`index-selection`开启

| 参数 | 说明     | 类型   | 可选值                                 | 默认值 |
| ---- | -------- | ------ | -------------------------------------- | ------ |
| type | 选择类型 | string | `index,selection,index-selection,tree` | —      |

## Config

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| SELECTABLE_METHOD | 自定义选择禁用 | ^[Function]`({row, column, rowIndex, colIndex,value})=>boolean` | — | — |
| CHECKBOX_KEY | 选择 key | string | — | — |

## Methods

| 方法名称              | 说明                  | 参数                       |
| --------------------- | --------------------- | -------------------------- |
| clearSelection        | 清除选中              | `()=>void`                 |
| toggleRowSelection    | 取反                  | `row`                      |
| setSelectionByRows    | 设置选中              | `(rows,selected)=>void`    |
| setSelectionByRowKeys | 通过 RowKeys 设置选中 | `(rowKeys,selected)=>void` |
| getSelectionRows      | 获取选中              | `()=>[]`                   |
| toggleAllSelection    | 切换所有行的选中状态  | `()=>void`                 |

## Events

| 事件名称           | 说明              | 回调参数 |
| ------------------ | ----------------- | -------- |
| toggleRowSelection | 行选择回调        | `row`    |
| toggleAllSelection | 全选/取消全选回调 | `rows`   |
| clearSelection     | 清除回调          | `rows`   |
| setRowSelection    | 行选择回调        | `rows`   |
| selectionChange    | 选择改变回调      | `rows`   |

## 多选

-   `type=selection`
-   控制台有回调输出

::: demo

<iframe src="/selection/base.html" style="min-height:220px"></iframe>
:::

## 有下标的多选

-   `type=index-selection`

::: demo

<iframe src="/selection/index.html" style="min-height:220px"></iframe>
:::

## 通过 rows 设置选中/清空选中

-   `clearSelection` 清除
-   `setSelectionByRows` 设置选中
-   `toggleRowSelection` 取反

::: demo

<iframe src="/selection/setting.html" style="min-height:240px"></iframe>
:::

## 通过 rowKeys 设置选中/清空选中

-   注意设置`config.ROW_KEY`
-   `clearSelection` 清除
-   `setSelectionByRowKeys` 设置选中

::: demo

<iframe src="/selection/settingRowKeys.html" style="min-height:240px"></iframe>
:::

## 获取选中

-   `getSelectionRows` 获取选中数据

::: demo

<iframe src="/selection/get.html" style="min-height:240px"></iframe>
:::

## 禁用

-   `config.SELECTABLE_METHOD` 可选禁用方法

::: demo

<iframe src="/selection/disabled.html" style="min-height:240px"></iframe>
:::

## 合并单元格多选

-   `config.CHECKBOX_KEY` 选中 key
-   `config.SPAN_METHOD` 合并方法
-   会根据可视区合并，这样不会因为合并行过多超过合并行时导致合并格子显示不出

::: demo

<iframe src="/selection/span.html" style="min-height:625px"></iframe>
:::
