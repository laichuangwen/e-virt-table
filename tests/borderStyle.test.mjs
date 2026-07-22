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

test('resolves only an explicit header resize divider override', () => {
    const inherited = { ENABLE_RESIZE_COLUMN: true };
    assert.equal(mod.resolveResizeColumnDividerColor(inherited), undefined);

    const customized = {
        ...inherited,
        RESIZE_COLUMN_DIVIDER_COLOR: '#divider',
    };
    assert.equal(mod.resolveResizeColumnDividerColor(customized), '#divider');
    assert.equal(mod.resolveResizeColumnDividerColor({ ...customized, ENABLE_RESIZE_COLUMN: false }), undefined);
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
    assert.equal(mod.shouldDrawScrollerBorder('inner'), false);
    assert.equal(mod.shouldDrawScrollerBorder('none'), false);

    assert.equal(mod.shouldDrawRightBoundaryBorder('default'), false);
    assert.equal(mod.shouldDrawRightBoundaryBorder('outer'), false);
    assert.equal(mod.shouldDrawRightBoundaryBorder('inner'), false);
    assert.equal(mod.shouldDrawRightBoundaryBorder('none'), false);
    assert.equal(mod.shouldDrawRightBoundaryBorder(false), false);
});

test('maps column divider sides around fixed boundaries', () => {
    assert.equal(mod.getColumnDividerSide('', 0, 100, 300), 'right');
    assert.equal(mod.getColumnDividerSide('left', 0, 100, 300), 'right');
    assert.equal(mod.getColumnDividerSide('right', 200, 100, 300), 'left');
    assert.equal(mod.getColumnDividerSide('', 200, 100, 300), null);
    assert.equal(mod.getColumnDividerSide('right', 0, 300, 300), null);
});

test('omits resize dividers where fixed sections meet their shadows', () => {
    const boundaries = {
        fixedLeftEnd: 200,
        fixedRightStart: 300,
    };

    assert.equal(mod.getColumnDividerSide('left', 0, 100, 400, boundaries), 'right');
    assert.equal(mod.getColumnDividerSide('left', 100, 100, 400, boundaries), null);
    assert.equal(mod.getColumnDividerSide('right', 300, 50, 400, boundaries), null);
    assert.equal(mod.getColumnDividerSide('right', 350, 50, 400, boundaries), 'left');
});

test('keeps fixed-section dividers when their shadows are inactive', () => {
    assert.equal(mod.getColumnDividerSide('left', 100, 100, 400), 'right');
    assert.equal(mod.getColumnDividerSide('right', 300, 50, 400), 'left');
});

test('hides non-default scroller track when no scrollbar is needed', () => {
    assert.equal(mod.shouldDrawScrollerTrack('default', false), true);
    assert.equal(mod.shouldDrawScrollerTrack('outer', false), false);
    assert.equal(mod.shouldDrawScrollerTrack('inner', false), false);
    assert.equal(mod.shouldDrawScrollerTrack('none', false), false);

    assert.equal(mod.shouldDrawScrollerTrack('outer', true), true);
    assert.equal(mod.shouldDrawScrollerTrack('inner', true), true);
    assert.equal(mod.shouldDrawScrollerTrack('none', true), true);
});
