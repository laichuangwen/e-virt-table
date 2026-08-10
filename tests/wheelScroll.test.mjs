import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const loaderUrl = new URL('./fixtures/resolveJsExtension.mjs', import.meta.url).href;
const fixtureUrl = new URL('./fixtures/wheelScroll.mjs', import.meta.url).href;

test('normalizes horizontal wheel input across platforms', () => {
    const result = spawnSync(
        process.execPath,
        ['--experimental-loader', loaderUrl, '--input-type=module', '--eval', `await import(${JSON.stringify(fixtureUrl)});`],
        {
            encoding: 'utf8',
        },
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
});
