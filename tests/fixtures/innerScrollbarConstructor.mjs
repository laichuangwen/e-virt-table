import assert from 'node:assert/strict';

const { default: Scroller } = await import('../../dist/lib/Scroller.js');
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
