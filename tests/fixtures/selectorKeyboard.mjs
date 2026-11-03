import assert from 'node:assert/strict';
import Selector from '../../dist/lib/Selector.js';

function createContext({ height = 478, rowHeight = 86, rowHeights, scrollX = 0, scrollY = 0 } = {}) {
    const heights = rowHeights ?? Array(100).fill(rowHeight);
    let totalHeight = 0;
    const positions = heights.map((height) => {
        const top = totalHeight;
        totalHeight += height;
        return { top, bottom: totalHeight, height };
    });
    const calls = [];
    const ctx = {
        config: {
            SCROLLER_TRACK_SIZE: 14,
            ENABLE_SELECTOR_SPAN_COL: true,
            ENABLE_SELECTOR_SPAN_ROW: true,
            SELECTOR_AREA_MIN_X: 0,
            SELECTOR_AREA_MAX_X: 0,
            SELECTOR_AREA_MIN_Y: 0,
            SELECTOR_AREA_MAX_Y: 0,
            SELECTOR_AREA_MAX_X_OFFSET: 0,
            SELECTOR_AREA_MAX_Y_OFFSET: 0,
            FOOTER_FIXED: false,
            FOOTER_POSITION: 'bottom',
            ENABLE_MERGE_CELL_LINK: false,
        },
        stageWidth: 600,
        stageHeight: height,
        fixedLeftWidth: 0,
        fixedRightWidth: 0,
        maxColIndex: 0,
        maxRowIndex: heights.length - 1,
        header: { height: 36 },
        footer: { height: 24, visibleHeight: 24 },
        body: { visibleHeight: height - 36 - 14, renderRows: [] },
        selector: { enable: true, xArr: [0, 0], yArr: [0, 0] },
        scrollX,
        scrollY,
        emit() {},
        setFocusCell(cell) {
            this.focusCell = cell;
        },
        setScroll(x, y) {
            calls.push([x, y]);
            this.scrollX = x;
            this.scrollY = Math.max(0, Math.min(y, totalHeight - this.body.visibleHeight));
            render();
        },
    };
    // Match the viewport contract: one extra row below, no prefetched row above.
    function render() {
        let first = positions.findIndex((position) => position.bottom >= ctx.scrollY);
        if (first < 0) first = heights.length - 1;
        let last = positions.findIndex((position) => position.bottom >= ctx.scrollY + ctx.body.visibleHeight);
        if (last < 0) last = heights.length - 1;
        last = Math.min(heights.length - 1, last + 1);
        ctx.body.renderRows = positions.slice(first, last + 1).map((position, index) => ({
            rowIndex: first + index,
            cells: [
                {
                    rowIndex: first + index,
                    colIndex: 0,
                    rowKey: String(first + index),
                    key: 'name',
                    drawX: 20,
                    drawY: ctx.header.height + position.top - ctx.scrollY,
                    width: 100,
                    height: position.height,
                    operation: false,
                },
            ],
        }));
    }
    render();
    ctx.focusCell = ctx.body.renderRows[0].cells[0];
    const selector = Object.create(Selector.prototype);
    selector.ctx = ctx;
    return { ctx, selector, calls };
}

function assertRoundTrip(options) {
    const { ctx, selector } = createContext(options);
    for (let i = 0; i < 35; i++) selector.moveFocus('BOTTOM');
    assert.equal(ctx.focusCell.rowIndex, 35, 'downward navigation must cross the virtual viewport');
    assert.ok(ctx.scrollY > 0);
    for (let i = 0; i < 40; i++) selector.moveFocus('TOP');
    assert.equal(ctx.focusCell.rowIndex, 0, `upward navigation stopped at row ${ctx.focusCell.rowIndex}`);
    assert.equal(ctx.scrollY, 0);
}

function overflowContext() {
    const result = createContext({ scrollX: 50, scrollY: 100 });
    result.ctx.focusCell = { drawX: 20, drawY: 100, width: 100, height: 86 };
    return result;
}

switch (process.env.SELECTOR_SCENARIO) {
    case 'navigation':
        for (const rowHeight of [32, 86]) {
            for (const visibleRows of [5, 13]) {
                for (const deficit of [0, 1, 2, 5]) {
                    assertRoundTrip({ rowHeight, height: 36 + 14 + rowHeight * visibleRows - deficit });
                }
            }
        }
        break;
    case 'variable-height':
        for (const height of [478, 479, 480, 500]) {
            assertRoundTrip({ height, rowHeights: Array.from({ length: 100 }, (_, i) => [86, 104, 90, 110][i % 4]) });
        }
        break;
    case 'top':
        for (const pixels of [1, 2]) {
            const { ctx, selector, calls } = overflowContext();
            ctx.focusCell.drawY = ctx.header.height - pixels;
            selector.adjustBoundaryPosition();
            assert.deepEqual(calls, [[50, 100 - pixels]]);
        }
        break;
    case 'bottom':
        for (const pixels of [1, 2]) {
            const { ctx, selector, calls } = overflowContext();
            ctx.focusCell.drawY = ctx.stageHeight - 14 - ctx.focusCell.height + pixels;
            selector.adjustBoundaryPosition();
            assert.deepEqual(calls, [[50, 100 + pixels]]);
        }
        break;
    case 'horizontal':
        for (const pixels of [1, 2, 3]) {
            const { ctx, selector, calls } = overflowContext();
            ctx.focusCell.drawX = 1 - pixels;
            selector.adjustBoundaryPosition();
            assert.deepEqual(calls, pixels > 2 ? [[50 - pixels, 100]] : []);
        }
        break;
    case 'independent-axes': {
        const { ctx, selector, calls } = overflowContext();
        ctx.focusCell.drawX = 0;
        ctx.focusCell.drawY = ctx.header.height - 1;
        selector.adjustBoundaryPosition();
        assert.deepEqual(calls, [[50, 99]]);
        break;
    }
    case 'fixed': {
        const { ctx, selector, calls } = overflowContext();
        ctx.focusCell.fixed = 'left';
        ctx.focusCell.drawX = -20;
        ctx.focusCell.drawY = ctx.header.height - 1;
        selector.adjustBoundaryPosition();
        assert.deepEqual(calls, [[50, 99]]);
        break;
    }
    case 'footer':
        for (const position of ['top', 'bottom']) {
            const { ctx, selector, calls } = overflowContext();
            ctx.config.FOOTER_FIXED = true;
            ctx.config.FOOTER_POSITION = position;
            ctx.body.visibleHeight -= ctx.footer.height;
            ctx.focusCell.drawY =
                position === 'top'
                    ? ctx.header.height + ctx.footer.height - 1
                    : ctx.stageHeight - ctx.footer.height - 14 - ctx.focusCell.height + 1;
            selector.adjustBoundaryPosition();
            assert.deepEqual(calls, [[50, position === 'top' ? 99 : 101]]);
        }
        break;
    default:
        throw new Error(`Unknown scenario: ${process.env.SELECTOR_SCENARIO}`);
}
