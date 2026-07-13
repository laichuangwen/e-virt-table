import assert from 'node:assert/strict';

const { default: Scroller } = await import('../../dist/lib/Scroller.js');
const originalDocument = globalThis.document;
const originalElement = globalThis.Element;
let appendedElements = 0;
let getOffsetCalls = 0;

class FakeElement {}

globalThis.Element = FakeElement;

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
    const overlayElement = new FakeElement();
    const context = {
        scrollX: 0,
        scrollY: 0,
        config: { scrollbarMode: 'inner' },
        stageElement: { style: {} },
        canvasElement: new FakeElement(),
        scrollerMove: false,
        containerElement: {
            appendChild() {
                appendedElements += 1;
            },
            contains() {
                return true;
            },
        },
        getOffset() {
            getOffsetCalls += 1;
            return { offsetX: 95, offsetY: 20 };
        },
        isTarget() {
            return true;
        },
        on() {},
    };
    const scroller = new Scroller(context);
    assert.equal(appendedElements, 0);

    const verticalScrollbar = scroller.verticalScrollbar;
    verticalScrollbar.innerVisible = true;
    verticalScrollbar.barX = 90;
    verticalScrollbar.barY = 10;
    verticalScrollbar.barWidth = 8;
    verticalScrollbar.barHeight = 30;

    let prevented = false;
    verticalScrollbar.onMouseDown({
        target: overlayElement,
        clientX: 95,
        clientY: 20,
        offsetX: 5,
        offsetY: 5,
        preventDefault() {
            prevented = true;
        },
    });

    assert.equal(getOffsetCalls, 1);
    assert.equal(verticalScrollbar.isDragging, true);
    assert.equal(prevented, true);

    verticalScrollbar.onMouseUp();
    verticalScrollbar.onMouseMove(
        {
            target: overlayElement,
            clientX: 95,
            clientY: 20,
            offsetX: 5,
            offsetY: 5,
            buttons: 0,
        },
        true,
    );

    assert.equal(getOffsetCalls, 2);
    assert.equal(verticalScrollbar.isFocus, true);
} finally {
    if (originalDocument === undefined) {
        delete globalThis.document;
    } else {
        globalThis.document = originalDocument;
    }
    if (originalElement === undefined) {
        delete globalThis.Element;
    } else {
        globalThis.Element = originalElement;
    }
}
