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

test('resolves header and footer border colors with the shared border color as fallback', () => {
    const inherited = { BORDER_COLOR: '#shared' };
    assert.equal(mod.resolveHeaderBorderColor(inherited), '#shared');
    assert.equal(mod.resolveFooterBorderColor(inherited), '#shared');

    const customized = {
        BORDER_COLOR: '#shared',
        HEADER_BORDER_COLOR: '#header',
        FOOTER_BORDER_COLOR: '#footer',
    };
    assert.equal(mod.resolveHeaderBorderColor(customized), '#header');
    assert.equal(mod.resolveFooterBorderColor(customized), '#footer');
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

test('maps section column dividers and fixed boundaries', () => {
    assert.equal(mod.shouldDrawSectionColumnDivider('default'), true);
    assert.equal(mod.shouldDrawSectionColumnDivider('inner'), true);
    assert.equal(mod.shouldDrawSectionColumnDivider(false), true);
    assert.equal(mod.shouldDrawSectionColumnDivider('outer'), false);
    assert.equal(mod.shouldDrawSectionColumnDivider('none'), false);

    assert.equal(mod.getSectionColumnDividerSide('', 0, 100, 300), 'right');
    assert.equal(mod.getSectionColumnDividerSide('left', 0, 100, 300), 'right');
    assert.equal(mod.getSectionColumnDividerSide('right', 200, 100, 300), 'left');
    assert.equal(mod.getSectionColumnDividerSide('', 200, 100, 300), null);
    assert.equal(mod.getSectionColumnDividerSide('right', 0, 300, 300), null);
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
