import test from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../dist/lib/ScrollbarMode.js');

test('normalizes scrollbar mode config', () => {
    assert.equal(mod.getScrollbarMode({}), 'outer');
    assert.equal(mod.getScrollbarMode({ scrollbarMode: 'outer' }), 'outer');
    assert.equal(mod.getScrollbarMode({ scrollbarMode: 'inner' }), 'inner');
    assert.equal(mod.getScrollbarMode({ SCROLLBAR_MODE: 'inner' }), 'inner');
    assert.equal(mod.getScrollbarMode({ scrollbarMode: 'bad-value' }), 'outer');
});

test('reserves layout space only for outer scrollbars', () => {
    assert.equal(mod.getLayoutScrollerTrackSize({ SCROLLER_TRACK_SIZE: 14 }), 14);
    assert.equal(mod.getLayoutScrollerTrackSize({ scrollbarMode: 'outer', SCROLLER_TRACK_SIZE: 14 }), 14);
    assert.equal(mod.getLayoutScrollerTrackSize({ scrollbarMode: 'inner', SCROLLER_TRACK_SIZE: 14 }), 0);
    assert.equal(mod.getLayoutScrollerTrackSize({ SCROLLBAR_MODE: 'inner', SCROLLER_TRACK_SIZE: 14 }), 0);
});

test('keeps overlay scrollbar size independent from layout reservation', () => {
    assert.equal(mod.getOverlayScrollerTrackSize({ scrollbarMode: 'inner', SCROLLER_TRACK_SIZE: 14 }), 14);
    assert.equal(mod.getOverlayScrollerTrackSize({ scrollbarMode: 'outer', SCROLLER_TRACK_SIZE: 14 }), 14);
});
