# Inner Scrollbar Hover-Only Design

Date: 2026-07-10
Branch: `f/inner-scrollbar`

## Goal

Remove inner-scrollbar collapse and expand controls. Inner scrollbars remain overlay scrollbars that appear after the configured hover delay and disappear when the pointer leaves the table.

## Scope

Included:

- Remove the vertical and horizontal toggle button DOM elements.
- Remove collapsed state, toggle geometry, and toggle event handling.
- Remove toggle-only CSS and documentation.
- Preserve hover delay, focus, dragging, wheel, touch, and scroll-position behavior.

Excluded:

- Scrollbar geometry and table width or height calculations.
- Dynamic row-height behavior.
- `outer` scrollbar behavior.
- New configuration options or compatibility flags.

## Runtime Behavior

1. An inner scrollbar starts hidden.
2. Pointer movement inside the table starts `SCROLLBAR_SHOW_DELAY` for both axes.
3. After the delay, available inner scrollbars are drawn over the table content.
4. Focus or dragging keeps the active scrollbar visible.
5. Leaving the table clears a pending timer and hides both inner scrollbars, except while dragging.
6. No collapse or expand control is created, drawn, positioned, or made interactive.
7. `outer` mode continues drawing and interacting exactly as before.

## Implementation

### `src/Scroller.ts`

- Delete `innerCollapsed` and all toggle button fields.
- Stop creating toggle button elements in the scrollbar constructor.
- Delete toggle geometry, DOM creation, click handling, and style synchronization methods.
- Simplify inner visibility to `innerVisible || isFocus || isDragging`.
- Keep existing hover timer and mouseout cleanup, removing only collapsed-state checks.
- Leave scrollbar size, track, thumb, and scroll calculations unchanged.

### `src/style.css`

- Delete `.e-virt-table-scrollbar-toggle` rules.

### Documentation

- Update English and Chinese scrollbar pages to describe hover-only behavior.
- Keep `scrollbarMode` and `SCROLLBAR_SHOW_DELAY` API documentation unchanged.

## Testing

- Add a failing behavior test for inner visibility before production edits.
- Verify inner mode is hidden before hover state and visible for hover, focus, or drag state.
- Verify outer mode remains visible independent of inner hover state.
- Build the library and documentation.
- In the documentation example, verify no toggle button DOM exists, both axes appear after hover, mouseout hides them, and wheel or thumb dragging still updates the table.

## Risks

- Stale toggle DOM could remain if only CSS is removed. Removing element creation eliminates this risk.
- A pending show timer could reveal a scrollbar after mouseout. Existing timer cancellation remains required.
- Geometry regressions are avoided by leaving all track, thumb, width, height, and scroll-distance calculations untouched.
