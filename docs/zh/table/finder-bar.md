# 查找器

-   由于虚拟表格无法被系统级的 Ctrl + F 检索到内容，因此需要通过自定义搜索逻辑来实现数据查找。
-   查找成功会自动滚动道指定位置并设置背景色
-   注意数据越多查找越久

## Config

| 参数                 | 说明                   | 类型    | 默认值             |
| -------------------- | ---------------------- | ------- | ------------------ |
| ENABLE_FINDER        | 启用查找器             | boolean | true               |
| FINDER_CELL_BG_COLOR | 当前查找结果格子背景色 | string  | `rgb(255,229,144)` |

## Column

| 参数                 | 说明                                                   | 类型                                                         | 默认值 |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------------------ | ------ |
| formatterFinderValue | 自定义 Header、Body、Footer 查找文本；通过 `cellType` 区分区域，与原文本合并后每个单元格只计一次 | `({cellType, row, column, rowIndex, colIndex, value}) => string \| void` | —      |

## 基础例子

::: demo 查找器

finder-bar/base
h:700px
:::

## 查找覆盖层内容

覆盖层只渲染可视区域，因此查找器不会扫描 DOM。使用 `formatterFinderValue` 提供覆盖层的语义文本，并通过 `cellType` 区分 Header、Body 和 Footer。Canvas 单元格文本和三类覆盖层文本都可搜索，Body 也支持未渲染到视口的行。

::: demo 查找覆盖层内容

finder-bar/layer
h:520px
:::
