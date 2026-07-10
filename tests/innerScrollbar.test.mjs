import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith('.') && !specifier.endsWith('.js')) {
            return nextResolve(`${specifier}.js`, context);
        }
        return nextResolve(specifier, context);
    },
});

const { default: Scroller } = await import('../dist/lib/Scroller.js');

test('does not append inner scrollbar toggle controls', () => {
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
});
