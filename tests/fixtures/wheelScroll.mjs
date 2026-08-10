import assert from 'node:assert/strict';

const { default: Scroller, getHorizontalWheelDelta } = await import('../../dist/lib/Scroller.js');

assert.equal(getHorizontalWheelDelta({ deltaX: 0, deltaY: 24, shiftKey: true }), 24);
assert.equal(getHorizontalWheelDelta({ deltaX: 24, deltaY: 0, shiftKey: true }), 24);
assert.equal(getHorizontalWheelDelta({ deltaX: 30, deltaY: 4, shiftKey: true }), 30);
assert.equal(getHorizontalWheelDelta({ deltaX: 4, deltaY: 30, shiftKey: true }), 30);
assert.equal(getHorizontalWheelDelta({ deltaX: 18, deltaY: 50, shiftKey: false }), 18);

const context = {
    scrollX: 0,
    scrollY: 0,
    on() {},
};
const scroller = new Scroller(context);
const horizontalScrollbar = scroller.horizontalScrollbar;
horizontalScrollbar.distance = 100;
horizontalScrollbar.barWidth = 20;

function wheel(event) {
    let prevented = false;
    horizontalScrollbar.onWheel({
        ...event,
        preventDefault() {
            prevented = true;
        },
    });
    return prevented;
}

horizontalScrollbar.scroll = 0;
assert.equal(wheel({ deltaX: 0, deltaY: 20, shiftKey: true }), true);
assert.equal(horizontalScrollbar.scroll, 20);

horizontalScrollbar.scroll = 0;
assert.equal(wheel({ deltaX: 20, deltaY: 0, shiftKey: true }), true);
assert.equal(horizontalScrollbar.scroll, 20);

horizontalScrollbar.scroll = 100;
assert.equal(wheel({ deltaX: 20, deltaY: 0, shiftKey: true }), false);
assert.equal(horizontalScrollbar.scroll, 100);

horizontalScrollbar.scroll = 0;
assert.equal(wheel({ deltaX: -20, deltaY: 0, shiftKey: true }), false);
assert.equal(horizontalScrollbar.scroll, 0);
