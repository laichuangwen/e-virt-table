# 行拖拽

## Config

| 参数 | 说明 | 类型 | 默认值 |
| ------------------ | ---------- | ------- | ------ |
| ENABLE_DRAG_ROW | 启用拖拽行 | boolean | false |
| ENABLE_DRAG_ROW_CROSS_LEVEL | 启用拖拽行跨级（针对 tree 数据结构） | boolean | false |
| ENABLE_DRAG_ROW_CUSTOM | 启用拖拽行自定义（为 true 时不会自动更新数据，需在 BEFORE_DRAG_ROW_METHOD 或 dragRowChange 中自行处理） | boolean | false |
| DRAG_ROW_TIP_LINE_COLOR | 拖拽提示线颜色 | string | `rgb(82,146,247)` |
| DRAG_ROW_ICON_SVG | 拖拽行手柄图标（SVG 字符串，空则使用内置） | string | - |
| DRAG_ROW_ICON_SIZE | 拖拽行图标大小 | number | 18 |
| DRAG_ROW_ICON_COLOR | 拖拽行图标颜色 | string | `#bec4c7` |
| BEFORE_DRAG_ROW_METHOD | 行拖拽前回调，返回 false 可阻止本次拖拽生效 | `BeforeDragRowMethod` | - |

## Column

| 参数 | 说明 | 类型 | 默认值 |
| ------------------ | ---------- | ------- | ------ |
| dragRow | 在该列显示拖拽手柄，用于触发行拖拽（需配合 ENABLE_DRAG_ROW: true） | boolean | false |

## Events

| 事件名称 | 说明 | 回调参数 |
| ------------------ | -------------- | ----------------------- |
| dragRowChange | 拖拽行松手完成时触发；若未使用 ENABLE_DRAG_ROW_CUSTOM，内部会先执行树形移动再触发 loadData | `BeforeDragRowParams`（source, target, position） |

## 行拖拽说明

- 设置 `ROW_KEY`
- 将 `ENABLE_DRAG_ROW` 设为 `true` 启用行拖拽。
- 至少有一列配置 `dragRow: true` 时，该列会显示拖拽手柄，用户从手柄开始拖拽整行。
- 未开启 `ENABLE_DRAG_ROW_CROSS_LEVEL` 时，仅支持**同级**拖拽（源行与目标行 `parentRowKey` 相同）；开启后支持跨级（如拖入某节点内部）。
- 拖拽落点位置由 `position` 表示：`'before'`（目标行前）、`'after'`（目标行后）、`'inside'`（仅树形时，作为目标行子节点）。
- 若需完全自定义逻辑，设置 `ENABLE_DRAG_ROW_CUSTOM: true`，在 `dragRowChange` 或 `BEFORE_DRAG_ROW_METHOD` 中自行更新数据并刷新表格。

### 基础行拖拽

平铺数据下开启 `ENABLE_DRAG_ROW`，在列上设置 `dragRow: true` 即可通过拖拽手柄调整行顺序。

::: demo

row-drag/base
h:400px
:::

### BEFORE_DRAG_ROW_METHOD 控制是否允许移动

通过配置 `BEFORE_DRAG_ROW_METHOD` 在拖拽结束前拦截：返回 `false` 时本次拖拽不生效，数据不更新。可用于全局开关（如权限）、或按行数据条件限制（如仅允许某 state 的行被拖动）。

::: demo

row-drag/method
h:480px
:::

### 树形行拖拽（跨级）

树形数据需设置 `ROW_KEY`，并给每个节点唯一 id；树列使用 `type: 'tree'` 且可配置 `dragRow: true`。开启 `ENABLE_DRAG_ROW_CROSS_LEVEL: true` 后，可将节点拖到目标行**前/后**或拖入目标行**内部**作为子节点。

::: demo

row-drag/tree
h:420px
:::

## 类型

``` ts
export type TreeUtilPosition = 'none' | 'before' | 'after' | 'inside';

export type BeforeDragRowParams = {
    source: Cell;
    target: Cell;
    position: TreeUtilPosition;
};

export type BeforeDragRowMethod = (
    params: BeforeDragRowParams
) => boolean | Promise<boolean>;
```
