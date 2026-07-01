# Content Zoom

Zoom scales **table content** only; the container/stage keeps the same physical size. When zoomed in, each row/column uses more pixels and fewer rows/columns are visible; when zoomed out, more content fits on screen. Canvas is redrawn at native resolution and overlayer DOM stays in sync, avoiding blur from CSS scaling.

## Config

| Name     | Description              | Type   | Default |
| -------- | ------------------------ | ------ | ------- |
| MIN_ZOOM | Minimum content zoom     | number | 0.5     |
| MAX_ZOOM | Maximum content zoom     | number | 2       |
| ENABLE_ZOOM_WHEEL | Enable Ctrl + wheel content zoom | boolean | true |

## Methods

| Name    | Description        | Parameters               |
| ------- | ------------------ | ------------------------ |
| setZoom | Set content zoom   | `(zoom: number) => void` |
| getZoom | Get current zoom   | `() => number`           |

## Events

| Name       | Description              | Callback |
| ---------- | ------------------------ | -------- |
| zoomChange | Fired when zoom changes  | `zoom`   |

## Basic Example

Use the buttons or **Ctrl + wheel** (Mac: **⌘ + wheel**) to zoom table content. Set `ENABLE_ZOOM_WHEEL` to `false` to disable wheel zoom:

::: demo

zoom/base
h:420px

:::

## Disable Wheel Zoom

```js
const grid = new EVirtTable(target, {
    data,
    columns,
    config: {
        ENABLE_ZOOM_WHEEL: false,
    },
});
```

## Limit Zoom Range

Use `MIN_ZOOM` and `MAX_ZOOM` to constrain the allowed range:

```js
const grid = new EVirtTable(target, {
    data,
    columns,
    config: {
        MIN_ZOOM: 0.8,
        MAX_ZOOM: 1.5,
    },
});

grid.setZoom(3); // clamped to 1.5
```

## Listen for Zoom Changes

```js
grid.on('zoomChange', (zoom) => {
    console.log('current zoom:', zoom);
});
```
