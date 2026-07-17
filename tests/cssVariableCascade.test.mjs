import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');

test('keeps injected theme defaults at zero selector specificity', () => {
    assert.match(css, /:where\(:root\)\s*\{/);
    assert.match(css, /:where\(\.dark\)\s*\{/);
    assert.doesNotMatch(css, /(?:^|\n):root\s*\{/);
    assert.doesNotMatch(css, /(?:^|\n)\.dark\s*\{/);
});
