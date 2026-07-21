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

| 参数                       | 说明                    | 类型                                                                            | 默认值 |
| -------------------------- | ----------------------- | ------------------------------------------------------------------------------- | ------ |
| formatterFinderValue       | 自定义 Body 查找文本    | `({row, column, rowIndex, colIndex, value, displayText}) => string \| void`      | —      |
| formatterFinderHeaderValue | 自定义 Header 查找文本  | `({column, rowIndex, colIndex, value, displayText}) => string \| void`           | —      |
| formatterFinderFooterValue | 自定义 Footer 查找文本  | `({row, column, rowIndex, colIndex, value, displayText}) => string \| void`      | —      |

自定义回调返回字符串时替换该区域的默认查找文本；返回 `undefined` 时回退到 Canvas 显示文本；返回空字符串时该单元格不参与查找。`value` 是原始值，`displayText` 是 Canvas 显示文本。

## 基础例子

::: demo 查找器

finder-bar/base
h:700px
:::

## 查找覆盖层内容

覆盖层只渲染可视区域，因此查找器不会扫描 DOM。分别使用 `formatterFinderHeaderValue`、`formatterFinderValue` 和 `formatterFinderFooterValue` 提供 Header、Body、Footer 覆盖层的完整语义文本。三类覆盖层都可搜索，Body 也支持未渲染到视口的行。

::: demo 查找覆盖层内容

finder-bar/layer
h:520px
:::
