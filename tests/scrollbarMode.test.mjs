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

test('draws scrollbar track borders only in outer mode', () => {
    assert.equal(mod.shouldDrawScrollbarTrackBorder({}), true);
    assert.equal(mod.shouldDrawScrollbarTrackBorder({ scrollbarMode: 'outer' }), true);
    assert.equal(mod.shouldDrawScrollbarTrackBorder({ scrollbarMode: 'inner' }), false);
    assert.equal(mod.shouldDrawScrollbarTrackBorder({ SCROLLBAR_MODE: 'inner' }), false);
});

test('draws scrollbar track backgrounds only in outer mode', () => {
    assert.equal(mod.shouldDrawScrollbarTrackBackground({}), true);
    assert.equal(mod.shouldDrawScrollbarTrackBackground({ scrollbarMode: 'outer' }), true);
    assert.equal(mod.shouldDrawScrollbarTrackBackground({ scrollbarMode: 'inner' }), false);
    assert.equal(mod.shouldDrawScrollbarTrackBackground({ SCROLLBAR_MODE: 'inner' }), false);
});

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
