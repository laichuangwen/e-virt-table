import test from 'node:test';
import assert from 'node:assert/strict';

import { Paint } from '../dist/lib/Paint.js';

function createPaint() {
    const calls = [];
    const context = {
        save: () => calls.push('save'),
        beginPath: () => calls.push('beginPath'),
        fillRect: (...args) => calls.push(['fillRect', ...args]),
        rect: (...args) => calls.push(['rect', ...args]),
        moveTo: (...args) => calls.push(['moveTo', ...args]),
        arcTo: (...args) => calls.push(['arcTo', ...args]),
        fill: () => calls.push('fill'),
        stroke: () => calls.push('stroke'),
        restore: () => calls.push('restore'),
    };
    return { paint: new Paint({ getContext: () => context }), calls };
}

test('fills square rectangles without the stroke half-pixel offset', () => {
    const { paint, calls } = createPaint();
    paint.drawRect(10, 20, 30, 40, { borderColor: 'transparent', fillColor: '#f2f3f6' });

    assert.ok(calls.some((call) => Array.isArray(call) && call[0] === 'fillRect' && call[1] === 10));
    assert.ok(calls.some((call) => Array.isArray(call) && call[0] === 'rect' && call[1] === 9.5));
    assert.equal(calls.includes('fill'), false);
});

test('keeps rounded rectangle fills on the rounded path', () => {
    const { paint, calls } = createPaint();
    paint.drawRect(10, 20, 30, 40, { borderColor: '#border', fillColor: '#bg', radius: 4 });

    assert.equal(calls.some((call) => Array.isArray(call) && call[0] === 'fillRect'), false);
    assert.equal(calls.includes('fill'), true);
    assert.equal(calls.includes('stroke'), true);
});
