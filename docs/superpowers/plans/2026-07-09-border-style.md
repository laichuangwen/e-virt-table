# Border Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add EVirtTable border modes `default`, `outer`, `inner`, and `none` without changing column width, row height, or dynamic row-height calculations.

**Architecture:** Introduce a pure border helper module that normalizes `Config.BORDER` and centralizes draw decisions. Existing Canvas render classes keep their current responsibilities and call helper functions for border visibility.

**Tech Stack:** TypeScript, Vite library build, pnpm 11, Node built-in test runner for pure helper tests.

## Global Constraints

- Keep `BORDER: true` behavior equivalent to `default`.
- Keep `BORDER: false` behavior equivalent to current horizontal-separator behavior, exposed as `inner`.
- Do not include border width in any width, height, text, row-position, or auto-row-height calculation.
- Use existing `BORDER_COLOR`, `BORDER_RADIUS`, and `--evt-border-color`.
- Do not change selection, autofill, validation, resize, drag, hover-icon, or tree guide-line rendering.

---

### Task 1: Pure Border Style Contract

**Files:**
- Create: `src/BorderStyle.ts`
- Test: `tests/borderStyle.test.mjs`

**Interfaces:**
- Produces: `type BorderStyle = 'default' | 'outer' | 'inner' | 'none'`
- Produces: `type BorderConfigValue = boolean | BorderStyle`
- Produces: `normalizeBorderStyle(value: BorderConfigValue): BorderStyle`
- Produces: `shouldDrawFullCellBorder(value: BorderConfigValue): boolean`
- Produces: `shouldDrawInternalHorizontalBorder(value: BorderConfigValue): boolean`
- Produces: `shouldDrawOuterBorder(value: BorderConfigValue): boolean`
- Produces: `shouldDrawScrollerBorder(value: BorderConfigValue): boolean`

- [ ] **Step 1: Write failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../dist/lib/BorderStyle.js');

test('normalizes border config values', () => {
  assert.equal(mod.normalizeBorderStyle(true), 'default');
  assert.equal(mod.normalizeBorderStyle(false), 'inner');
  assert.equal(mod.normalizeBorderStyle('default'), 'default');
  assert.equal(mod.normalizeBorderStyle('outer'), 'outer');
  assert.equal(mod.normalizeBorderStyle('inner'), 'inner');
  assert.equal(mod.normalizeBorderStyle('none'), 'none');
});

test('maps border modes to draw decisions', () => {
  assert.equal(mod.shouldDrawFullCellBorder('default'), true);
  assert.equal(mod.shouldDrawFullCellBorder('outer'), false);
  assert.equal(mod.shouldDrawFullCellBorder('inner'), false);
  assert.equal(mod.shouldDrawFullCellBorder('none'), false);

  assert.equal(mod.shouldDrawInternalHorizontalBorder('default'), true);
  assert.equal(mod.shouldDrawInternalHorizontalBorder('outer'), false);
  assert.equal(mod.shouldDrawInternalHorizontalBorder('inner'), true);
  assert.equal(mod.shouldDrawInternalHorizontalBorder('none'), false);

  assert.equal(mod.shouldDrawOuterBorder('default'), true);
  assert.equal(mod.shouldDrawOuterBorder('outer'), true);
  assert.equal(mod.shouldDrawOuterBorder('inner'), false);
  assert.equal(mod.shouldDrawOuterBorder('none'), false);

  assert.equal(mod.shouldDrawScrollerBorder('default'), true);
  assert.equal(mod.shouldDrawScrollerBorder('outer'), false);
  assert.equal(mod.shouldDrawScrollerBorder('inner'), true);
  assert.equal(mod.shouldDrawScrollerBorder('none'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsc && node --test tests/borderStyle.test.mjs`

Expected: FAIL because `../dist/lib/BorderStyle.js` does not exist.

- [ ] **Step 3: Implement helper**

```ts
export type BorderStyle = 'default' | 'outer' | 'inner' | 'none';
export type BorderConfigValue = boolean | BorderStyle;

export function normalizeBorderStyle(value: BorderConfigValue): BorderStyle {
    if (value === true) return 'default';
    if (value === false) return 'inner';
    return value;
}

export function shouldDrawFullCellBorder(value: BorderConfigValue): boolean {
    return normalizeBorderStyle(value) === 'default';
}

export function shouldDrawInternalHorizontalBorder(value: BorderConfigValue): boolean {
    const style = normalizeBorderStyle(value);
    return style === 'default' || style === 'inner';
}

export function shouldDrawOuterBorder(value: BorderConfigValue): boolean {
    const style = normalizeBorderStyle(value);
    return style === 'default' || style === 'outer';
}

export function shouldDrawScrollerBorder(value: BorderConfigValue): boolean {
    const style = normalizeBorderStyle(value);
    return style === 'default' || style === 'inner';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec tsc && node --test tests/borderStyle.test.mjs`

Expected: PASS with both tests passing.

### Task 2: Config And Type Surface

**Files:**
- Modify: `src/Config.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Consumes: `BorderConfigValue` from `src/BorderStyle.ts`
- Produces: `Config.BORDER: BorderConfigValue`

- [ ] **Step 1: Write failing type check**

Add imports and assign `BORDER: BorderConfigValue = true` in `src/Config.ts`; run `pnpm exec tsc`.

Expected before helper export: FAIL if `BorderConfigValue` is missing from `src/BorderStyle.ts`.

- [ ] **Step 2: Implement type wiring**

```ts
import { BorderConfigValue } from './BorderStyle';

// in Config class
BORDER: BorderConfigValue = true;
```

No `types.ts` change is required because `ConfigType` is `Partial<Config>`.

- [ ] **Step 3: Verify type check**

Run: `pnpm exec tsc`

Expected: PASS.

### Task 3: Canvas Border Rendering

**Files:**
- Modify: `src/Cell.ts`
- Modify: `src/CellHeader.ts`
- Modify: `src/Header.ts`
- Modify: `src/Footer.ts`
- Modify: `src/Scroller.ts`
- Modify: `src/EVirtTable.ts`

**Interfaces:**
- Consumes: `shouldDrawFullCellBorder`, `shouldDrawInternalHorizontalBorder`, `shouldDrawOuterBorder`, `shouldDrawScrollerBorder`
- Produces: render behavior matching the four border modes

- [ ] **Step 1: Add draw decision imports**

```ts
import {
    shouldDrawFullCellBorder,
    shouldDrawInternalHorizontalBorder,
    shouldDrawOuterBorder,
    shouldDrawScrollerBorder,
} from './BorderStyle';
```

- [ ] **Step 2: Update body and footer cell container drawing**

Use `shouldDrawFullCellBorder(BORDER)` for rectangle borders.

Use `shouldDrawInternalHorizontalBorder(BORDER)` for bottom row separators.

- [ ] **Step 3: Update header cell edge drawing**

Use `shouldDrawFullCellBorder(BORDER)` for header rectangle borders.

- [ ] **Step 4: Update header/footer separator drawing**

Skip `Header.drawBottomLine()` and `Footer.drawTopLine()` unless `shouldDrawInternalHorizontalBorder(BORDER)` is true.

- [ ] **Step 5: Update stage DOM border**

In EVirtTable container creation or context setup, set a `data-border-style` attribute or inline style so the CSS outer border is visible only when `shouldDrawOuterBorder(BORDER)` is true.

- [ ] **Step 6: Update scroller borders**

Use `shouldDrawScrollerBorder(BORDER)` for scroller track borders and split lines.

- [ ] **Step 7: Verify build**

Run: `pnpm run build`

Expected: PASS.

### Task 4: Docs And Examples

**Files:**
- Modify: `docs/zh/api.md`
- Modify: `docs/en/api.md`
- Create: `docs/examples/border/default.html`
- Create: `docs/examples/border/outer.html`
- Create: `docs/examples/border/inner.html`
- Create: `docs/examples/border/none.html`

**Interfaces:**
- Produces: documented `BORDER` values and runnable examples.

- [ ] **Step 1: Update API docs**

Add `BORDER` row:

```md
| BORDER | Border style. `true` equals `default`; `false` equals `inner`. | `boolean \| "default" \| "outer" \| "inner" \| "none"` | true |
```

- [ ] **Step 2: Add examples**

Each example creates the same table and changes only `config.BORDER`.

- [ ] **Step 3: Verify docs and examples are included**

Run: `rg -n "BORDER|outer|inner|none" docs/zh/api.md docs/en/api.md docs/examples/border`

Expected: output includes API docs and all four example files.

### Task 5: Completion Verification

**Files:**
- Review: `src/BorderStyle.ts`
- Review: `src/Cell.ts`
- Review: `src/CellHeader.ts`
- Review: `src/Header.ts`
- Review: `src/Footer.ts`
- Review: `src/Scroller.ts`
- Review: `src/EVirtTable.ts`
- Review: `docs/zh/api.md`
- Review: `docs/en/api.md`
- Review: `docs/examples/border/*.html`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: evidence that the requested border feature is complete.

- [ ] **Step 1: Run unit test**

Run: `pnpm exec tsc && node --test tests/borderStyle.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `pnpm run build`

Expected: PASS.

- [ ] **Step 3: Inspect relevant diff**

Run: `git diff -- src docs pnpm-workspace.yaml package.json pnpm-lock.yaml`

Expected: diff only contains border feature work and pnpm build approval.
