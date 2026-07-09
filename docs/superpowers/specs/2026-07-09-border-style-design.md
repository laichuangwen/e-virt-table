# Border Style Design

## Goal

EVirtTable needs configurable Canvas border styles matching the referenced images:

- `default`: draw the full grid, including outer border, row lines, and column lines.
- `outer`: draw only the table outer border.
- `inner`: draw only internal horizontal row separators.
- `none`: draw no table border lines.

The existing `BORDER` boolean remains supported for compatibility:

- `true` maps to `default`.
- `false` maps to `inner`, preserving the current behavior where `BORDER: false` still draws horizontal row separators.

## Non-Goals

- Border width remains `1`.
- Border color remains `BORDER_COLOR`.
- Column width, row height, and auto-row-height calculations do not include border width.
- Selection, autofill, validation, drag, resize, hover-icon, and tree guide lines are not controlled by this table border style.

## Architecture

Add a small pure helper module that normalizes `BORDER` and answers drawing questions:

- Normalize `boolean | 'default' | 'outer' | 'inner' | 'none'` to a `BorderStyle`.
- Decide whether to draw full cell borders.
- Decide whether to draw internal horizontal separators.
- Decide whether to draw the table outer frame.
- Decide whether to show the DOM stage border.

Canvas drawing stays in existing render classes. `Cell`, `CellHeader`, `Header`, `Footer`, and `Scroller` call the helper instead of branching directly on `BORDER`.

## Rendering Rules

`default`:

- Body/footer cells draw full rectangle borders.
- Header cells draw full rectangle borders.
- Header bottom line and footer top line draw.
- Stage DOM border is visible for the outer frame.
- Scroller track borders and split lines draw.

`outer`:

- Body/footer/header cells draw backgrounds with transparent borders.
- Header bottom line and footer top line do not draw.
- Stage DOM border is visible for the outer frame.
- Scroller track borders and split lines do not draw.

`inner`:

- Body/footer/header cells draw backgrounds with transparent borders.
- Body/footer cells draw their bottom horizontal separator.
- Header bottom line and footer top line draw as internal separators.
- Stage DOM border is hidden.
- Scroller track borders and split lines draw only where they act as internal separators.

`none`:

- Body/footer/header cells draw backgrounds with transparent borders.
- No horizontal table separators draw.
- Stage DOM border is hidden.
- Scroller track borders and split lines do not draw.

## Layout And Auto Height

Canvas line drawing does not affect:

- `Header.init()` width or height totals.
- `Body.update()` row positions.
- `Database.getData()` row positions and `sumHeight`.
- `Paint.calculateTextHeight()`.
- `Row.updateCalculatedHeight()`.

The implementation must avoid adding or subtracting pixels from column width, row height, text width, or text height for the new border modes.

## Verification

Required checks:

- A unit test proves border normalization and drawing decisions for all modes.
- The TypeScript build succeeds.
- API docs mention the new `BORDER` values.
- Example files exist for all four modes.
