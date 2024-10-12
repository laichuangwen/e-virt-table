# 多选

- `type=selection`
- `consfig.SELECTABLE_METHOD` 自定义选择禁用

## 多选

- `type=selection`
::: demo
<iframe src="/selection/base.html" style="min-height:210px"></iframe>
:::

## 有下标的多选

- `type=index-selection`
::: demo
<iframe src="/selection/index.html" style="min-height:210px"></iframe>
:::

## 通过rows设置选中/清空选中

- `clearSelection` 清除
- `setSelectionByRows` 设置选中
- `toggleRowSelection` 取反
::: demo
<iframe src="/selection/setting.html" style="min-height:240px"></iframe>
:::

## 通过rowKeys设置选中/清空选中
- 注意设置`config.ROW_KEY`
- `clearSelection` 清除
- `setSelectionByRowKeys` 设置选中
::: demo
<iframe src="/selection/settingRowKeys.html" style="min-height:240px"></iframe>
:::

## 获取选中

- `getSelectionRows` 获取选中数据
::: demo
<iframe src="/selection/get.html" style="min-height:240px"></iframe>
:::


## 禁用

- `config.SELECTABLE_METHOD` 可选禁用方法
::: demo
<iframe src="/selection/disabled.html" style="min-height:240px"></iframe>
:::


## 合并单元格多选

- `config.CHECKBOX_KEY` 选中key
- `config.SPAN_METHOD` 合并方法
::: demo
<iframe src="/selection/span.html" style="min-height:430px"></iframe>
:::
