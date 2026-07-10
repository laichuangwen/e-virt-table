# Inner Scrollbar Hover-Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove inner-scrollbar collapse and expand controls while preserving delayed hover visibility and all existing scrolling behavior.

**Architecture:** Keep scrollbar geometry and event routing in `Scroller.ts`. Move the small draw-visibility decision into the existing `ScrollbarMode.ts` helper module so it can be tested without Canvas or DOM setup. Delete toggle-only DOM, state, CSS, and documentation.

**Tech Stack:** TypeScript, Canvas 2D, Node.js test runner, Vite, VitePress.

## Global Constraints

- Do not change scrollbar track, thumb, distance, width, or height calculations.
- Do not change table layout reservation or dynamic row-height behavior.
- Do not change `outer` scrollbar behavior.
- Do not add configuration options or compatibility flags.
- Preserve hover delay, focus, dragging, wheel, touch, and scroll-position behavior.

## File Map

- `src/ScrollbarMode.ts`: pure mode and visibility decisions.
- `src/Scroller.ts`: scrollbar events, drawing, and state; remove toggle controls here.
- `tests/scrollbarMode.test.mjs`: visibility decision regression coverage.
- `tests/innerScrollbar.test.mjs`: constructor regression proving no toggle DOM is created.
- `src/style.css`: remove toggle-only styles.
- `docs/en/table/scroller.md`: English hover-only description.
- `docs/zh/table/scroller.md`: Chinese hover-only description.

---

### Task 1: Remove Toggle Runtime With TDD

**Files:**
- Modify: `src/ScrollbarMode.ts`
- Modify: `src/Scroller.ts:1-439`
- Modify: `tests/scrollbarMode.test.mjs`
- Create: `tests/innerScrollbar.test.mjs`

**Interfaces:**
- Consumes: `ScrollbarModeConfig`, `isInnerScrollbarMode(config)`.
- Produces: `ScrollbarVisibilityState` and `shouldDrawScrollbar(config, state): boolean`.
- Preserves: `Scroller` default export and all existing scroll event methods.

- [ ] **Step 1: Add the failing visibility-rule test**

Append to `tests/scrollbarMode.test.mjs`:

```js
test('draws inner scrollbars only while visible, focused, or dragging', () => {
    const config = { scrollbarMode: 'inner' };

    assert.equal(
        mod.shouldDrawScrollbar(config, { innerVisible: false, isFocus: false, isDragging: false }),
        false,
    );
    assert.equal(
        mod.shouldDrawScrollbar(config, { innerVisible: true, isFocus: false, isDragging: false }),
        true,
    );
    assert.equal(
        mod.shouldDrawScrollbar(config, { innerVisible: false, isFocus: true, isDragging: false }),
        true,
    );
    assert.equal(
        mod.shouldDrawScrollbar(config, { innerVisible: false, isFocus: false, isDragging: true }),
        true,
    );
    assert.equal(
        mod.shouldDrawScrollbar({}, { innerVisible: false, isFocus: false, isDragging: false }),
        true,
    );
});
```

- [ ] **Step 2: Build and verify the test fails for the missing decision helper**

Run:

```powershell
npm run build
node --test tests/scrollbarMode.test.mjs
```

Expected: build passes; test fails with `TypeError: mod.shouldDrawScrollbar is not a function`.

- [ ] **Step 3: Add the minimal visibility helper**

Append to `src/ScrollbarMode.ts`:

```ts
export type ScrollbarVisibilityState = {
    innerVisible: boolean;
    isFocus: boolean;
    isDragging: boolean;
};

export function shouldDrawScrollbar(
    config: ScrollbarModeConfig,
    state: ScrollbarVisibilityState,
): boolean {
    if (!isInnerScrollbarMode(config)) {
        return true;
    }
    return state.innerVisible || state.isFocus || state.isDragging;
}
```

- [ ] **Step 4: Build and verify the visibility test passes**

Run:

```powershell
npm run build
node --test tests/scrollbarMode.test.mjs
```

Expected: 4 tests pass, 0 fail.

- [ ] **Step 5: Add the failing no-toggle-DOM test**

Create `tests/innerScrollbar.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';

const { default: Scroller } = await import('../dist/lib/Scroller.js');

test('does not append inner scrollbar toggle controls', () => {
    const originalDocument = globalThis.document;
    let appendedElements = 0;

    globalThis.document = {
        createElement() {
            return {
                style: {},
                setAttribute() {},
                addEventListener() {},
            };
        },
    };

    try {
        new Scroller({
            scrollX: 0,
            scrollY: 0,
            containerElement: {
                appendChild() {
                    appendedElements += 1;
                },
            },
            on() {},
        });
        assert.equal(appendedElements, 0);
    } finally {
        if (originalDocument === undefined) {
            delete globalThis.document;
        } else {
            globalThis.document = originalDocument;
        }
    }
});
```

- [ ] **Step 6: Build and verify the constructor test catches current toggle creation**

Run:

```powershell
npm run build
node --test tests/innerScrollbar.test.mjs
```

Expected: test fails with `2 !== 0` because vertical and horizontal buttons are appended.

- [ ] **Step 7: Remove toggle state, DOM, positioning, and events**

Update the `src/Scroller.ts` import and visibility method:

```ts
import Context from './Context';
import {
    getLayoutScrollerTrackSize,
    getOverlayScrollerTrackSize,
    isInnerScrollbarMode,
    shouldDrawScrollbar,
} from './ScrollbarMode';

private shouldDrawInnerScrollbar(): boolean {
    return shouldDrawScrollbar(this.ctx.config, {
        innerVisible: this.innerVisible,
        isFocus: this.isFocus,
        isDragging: this.isDragging,
    });
}
```

Delete these declarations and assignments:

```diff
-type Rect = { x: number; y: number; width: number; height: number };
-    private innerCollapsed = false;
-    private collapseButton: Rect = { x: 0, y: 0, width: 0, height: 0 };
-    private expandButton: Rect = { x: 0, y: 0, width: 0, height: 0 };
-    private toggleButton: HTMLButtonElement;
-        this.toggleButton = this.createToggleButton();
```

Simplify timer guards:

```ts
private startInnerShowTimer() {
    if (!this.isInnerMode() || this.innerVisible || this.innerShowTimer) {
        return;
    }
    const delay = Math.max(0, this.ctx.config.SCROLLBAR_SHOW_DELAY || 0);
    this.innerShowTimer = window.setTimeout(() => {
        this.innerVisible = true;
        this.innerShowTimer = 0;
        this.ctx.emit('draw');
    }, delay);
}

hideInnerScrollbar() {
    if (!this.isInnerMode() || this.isDragging) {
        return;
    }
    if (this.innerShowTimer) {
        clearTimeout(this.innerShowTimer);
        this.innerShowTimer = 0;
    }
    this.innerVisible = false;
    this.isFocus = false;
}
```

Delete the `this.updateToggleButtons()` call and these complete methods:

```ts
private updateToggleButtons()
private createToggleButton()
private toggleInnerScrollbar()
private updateToggleButtonStyle()
```

Reduce the inner-mode draw guard to:

```ts
if (this.isInnerMode() && !this.shouldDrawInnerScrollbar()) {
    return this.isFocus || this.isDragging;
}
```

Delete both `this.updateToggleButtonStyle()` calls and the separate `innerCollapsed` draw branch. Leave every geometry calculation in `updatedSize()` unchanged.

- [ ] **Step 8: Build and run both focused tests**

Run:

```powershell
npm run build
node --test tests/scrollbarMode.test.mjs tests/innerScrollbar.test.mjs
```

Expected: 5 tests pass, 0 fail.

- [ ] **Step 9: Commit the runtime change**

```powershell
git add src/ScrollbarMode.ts src/Scroller.ts tests/scrollbarMode.test.mjs tests/innerScrollbar.test.mjs
git commit -m "refactor: remove inner scrollbar toggles"
```

---

### Task 2: Remove Toggle Styles and Documentation

**Files:**
- Modify: `src/style.css:111-130`
- Modify: `docs/en/table/scroller.md:25`
- Modify: `docs/zh/table/scroller.md:25`

**Interfaces:**
- Consumes: existing `scrollbarMode` and `SCROLLBAR_SHOW_DELAY` configuration.
- Produces: hover-only documentation; no runtime interface changes.

- [ ] **Step 1: Delete toggle-only CSS**

Remove this complete block from `src/style.css`:

```css
.e-virt-table-scrollbar-toggle {
    position: fixed;
    display: none;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    border: 1px solid var(--evt-scroller-focus-color);
    border-radius: 4px;
    background: var(--evt-scroller-track-color);
    color: var(--evt-body-text-color);
    box-sizing: border-box;
    font: 12px/1 Arial, sans-serif;
    cursor: pointer;
    user-select: none;
    z-index: 120;
}
.e-virt-table-scrollbar-toggle:hover {
    background: var(--evt-header-bg-color);
}
```

- [ ] **Step 2: Replace the English interaction description**

Use this text in `docs/en/table/scroller.md`:

```md
Set `config.scrollbarMode` to `inner` to let the header, cells, and footer use the full visible area. The scrollbars appear over the right and bottom edges after a hover delay and hide when the pointer leaves the table.
```

- [ ] **Step 3: Replace the Chinese interaction description**

Use this text in `docs/zh/table/scroller.md`:

```md
设置 `config.scrollbarMode` 为 `inner` 后，表头、单元格和表尾会使用完整可视区域。滚动条在悬停延迟后覆盖在右侧和底部，鼠标移出表格后隐藏。
```

- [ ] **Step 4: Verify all toggle artifacts are gone**

Run:

```powershell
rg -n "innerCollapsed|toggleButton|updateToggleButtons|createToggleButton|toggleInnerScrollbar|updateToggleButtonStyle|e-virt-table-scrollbar-toggle|arrow buttons on the scrollbars|滚动条上的箭头" src tests docs/en/table/scroller.md docs/zh/table/scroller.md
```

Expected: no matches. `rg` exits with code 1 because nothing matches.

- [ ] **Step 5: Verify formatting and commit cleanup**

Run:

```powershell
git diff --check
git add src/style.css docs/en/table/scroller.md docs/zh/table/scroller.md
git commit -m "refactor: remove inner scrollbar toggle artifacts"
```

Expected: `git diff --check` prints nothing; commit succeeds.

---

### Task 3: Full Verification

**Files:**
- Verify: `src/Scroller.ts`
- Verify: `src/ScrollbarMode.ts`
- Verify: `src/style.css`
- Verify: `docs/examples/scroller/inner.html`
- Verify: `tests/scrollbarMode.test.mjs`
- Verify: `tests/innerScrollbar.test.mjs`

**Interfaces:**
- Consumes: completed Tasks 1 and 2.
- Produces: build, test, documentation, and browser evidence.

- [ ] **Step 1: Run focused regression tests from a fresh build**

Run:

```powershell
npm run build
node --test tests/scrollbarMode.test.mjs tests/innerScrollbar.test.mjs
```

Expected: build exits 0; 5 tests pass, 0 fail.

- [ ] **Step 2: Build documentation against the local bundle**

Run:

```powershell
npm run copy-dist
npm run build:docs
```

Expected: both commands exit 0. VitePress may print existing Sass deprecation and chunk-size warnings, but no errors.

- [ ] **Step 3: Start the documentation server**

Run in a persistent terminal:

```powershell
Set-Location docs
npm run dev -- --host 127.0.0.1 --port 5178
```

Expected: VitePress serves `http://127.0.0.1:5178/e-virt-table/zh/table/scroller.html`.

- [ ] **Step 4: Verify hover-only behavior in a browser**

Open the Chinese scrollbar page and its inner-scrollbar example. Verify:

```js
document.querySelectorAll('.e-virt-table-scrollbar-toggle').length
```

Expected: `0` in the page and example iframe.

Then perform these checks:

1. Move the pointer over the table and wait longer than `300ms`: right and bottom overlay scrollbars appear.
2. Move the pointer outside the table: both overlay scrollbars disappear.
3. Drag the vertical thumb: rows move and the thumb follows the drag.
4. Drag the horizontal thumb: columns move and the thumb follows the drag.
5. Use wheel and Shift+wheel: vertical and horizontal positions update without any toggle control appearing.
6. Capture screenshots before hover, after hover, and after mouseout for comparison.

- [ ] **Step 5: Stop the server and inspect final repository state**

Stop the persistent server with `Ctrl+C`, then run:

```powershell
git status --short --branch
git log -4 --oneline
```

Expected: no uncommitted files; branch contains the design, plan, runtime, and documentation commits.
