import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [configSource, styleSource, paintSource, headerSource, bodySource, footerSource] = await Promise.all([
    readFile(new URL('../src/Config.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/style.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/Paint.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/Header.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/Body.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/Footer.ts', import.meta.url), 'utf8'),
]);

function getMethodSource(source, methodName, nextMethodName) {
    const start = source.indexOf(methodName);
    const end = source.indexOf(nextMethodName, start + methodName.length);
    assert.notEqual(start, -1, `${methodName} not found`);
    assert.notEqual(end, -1, `${nextMethodName} not found after ${methodName}`);
    return source.slice(start, end);
}

test('exposes fixed-column shadow colors as CSS-backed config and width as numeric config', () => {
    assert.match(configSource, /FIXED_COLUMN_SHADOW_COLOR = 'rgba\(0,0,0,0\.1\)'/);
    assert.match(configSource, /FIXED_COLUMN_SHADOW_FADE_COLOR = 'rgba\(0,0,0,0\)'/);
    assert.match(configSource, /FIXED_COLUMN_SHADOW_WIDTH = 4/);
    assert.match(styleSource, /--evt-fixed-column-shadow-color: rgba\(0, 0, 0, 0\.1\)/);
    assert.match(styleSource, /--evt-fixed-column-shadow-fade-color: rgba\(0, 0, 0, 0\)/);
    assert.doesNotMatch(styleSource, /--evt-fixed-column-shadow-width/);
});

test('uses the shared shadow config in header, body, and footer', () => {
    for (const source of [headerSource, bodySource, footerSource]) {
        const method = getMethodSource(source, 'private drawFixedShadow()', 'update()');
        assert.match(method, /shadowWidth: FIXED_COLUMN_SHADOW_WIDTH/);
        assert.match(method, /colorStart: FIXED_COLUMN_SHADOW_COLOR/);
        assert.match(method, /colorEnd: FIXED_COLUMN_SHADOW_FADE_COLOR/);
        assert.match(method, /colorStart: FIXED_COLUMN_SHADOW_FADE_COLOR/);
        assert.match(method, /colorEnd: FIXED_COLUMN_SHADOW_COLOR/);
        assert.doesNotMatch(method, /shadowWidth: 4|rgba\(0,0,0/);
    }
});

test('keeps fixed backgrounds while allowing zero-width shadows', () => {
    const drawShadow = getMethodSource(paintSource, 'drawShadow(', '    // 绘制线条');
    assert.ok(drawShadow.indexOf('this.ctx.fillRect') < drawShadow.indexOf('shadowWidth <= 0'));
    assert.match(drawShadow, /!Number\.isFinite\(shadowWidth\) \|\| shadowWidth <= 0/);
});
