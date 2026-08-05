import test from 'node:test';
import assert from 'node:assert/strict';

import { Paint } from '../dist/lib/Paint.js';

function createPaint() {
    const calls = [];
    const context = {
        save() {},
        restore() {},
        measureText: (text) => ({ width: text.length * 6 }),
        fillText(text, x, y) {
            calls.push({ text, x, y, textBaseline: this.textBaseline });
        },
    };
    return { paint: new Paint({ getContext: () => context }), calls };
}

test('draws middle-aligned text on the center of its line box', () => {
    const { paint, calls } = createPaint();
    let layout;

    paint.drawText('Center', 0, 10, 100, 40, {
        font: '12px Arial',
        verticalAlign: 'middle',
        lineHeight: 1.2,
        layoutCallback: (value) => {
            layout = value;
        },
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].textBaseline, 'middle');
    assert.equal(calls[0].y, 30);
    assert.equal(layout.lines[0].drawY, 22.8);
    assert.ok(Math.abs(layout.lineHeight - 14.4) < Number.EPSILON * 100);
});
