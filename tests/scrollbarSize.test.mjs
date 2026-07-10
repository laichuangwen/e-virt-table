import test from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../dist/lib/ScrollbarSize.js');

test('hides scrollbar thumb when there is no scroll distance', () => {
    assert.equal(mod.getScrollbarThumbSize(0, 180, 180), 0);
    assert.equal(mod.getScrollbarThumbSize(-1, 180, 180), 0);
});

test('keeps a minimum thumb size only when scrolling is possible', () => {
    assert.equal(mod.getScrollbarThumbSize(1, 180, 2000), 30);
});
