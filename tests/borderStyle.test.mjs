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
