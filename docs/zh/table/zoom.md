# 内容缩放

缩放的是表格**内容**，容器/舞台的物理尺寸保持不变。放大后单行单列占用更多像素、可见行列变少；缩小后可见行列变多。Canvas 通过原生分辨率重绘，覆盖层 DOM 同步缩放，避免 CSS 拉伸导致的模糊。

## Config

| 参数      | 说明             | 类型   | 默认值 |
| --------- | ---------------- | ------ | ------ |
| MIN_ZOOM  | 内容缩放最小比例 | number | 0.5    |
| MAX_ZOOM  | 内容缩放最大比例 | number | 2      |
| ENABLE_ZOOM_WHEEL | 启用 Ctrl + 滚轮内容缩放 | boolean | true |

## Methods

| 方法名称 | 说明             | 参数                 |
| -------- | ---------------- | -------------------- |
| setZoom  | 设置内容缩放比例 | `(zoom: number) => void` |
| getZoom  | 获取当前缩放比例 | `() => number`       |

## Events

| 事件名称   | 说明           | 回调参数   |
| ---------- | -------------- | ---------- |
| zoomChange | 缩放比例改变时 | `zoom`     |

## 基础示例

点击按钮或使用 **Ctrl + 滚轮**（Mac 为 **⌘ + 滚轮**）缩放表格内容。可通过 `ENABLE_ZOOM_WHEEL` 关闭滚轮缩放：

::: demo

zoom/base
h:420px

:::

## 关闭滚轮缩放

```js
const grid = new EVirtTable(target, {
    data,
    columns,
    config: {
        ENABLE_ZOOM_WHEEL: false,
    },
});
```

## 限制缩放范围

通过 `MIN_ZOOM`、`MAX_ZOOM` 配置允许的最小/最大比例：

```js
const grid = new EVirtTable(target, {
    data,
    columns,
    config: {
        MIN_ZOOM: 0.8,
        MAX_ZOOM: 1.5,
    },
});

grid.setZoom(3); // 会被限制为 1.5
```

## 监听缩放变化

```js
grid.on('zoomChange', (zoom) => {
    console.log('当前缩放:', zoom);
});
```
