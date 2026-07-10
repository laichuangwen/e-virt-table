import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const loaderUrl = new URL('./fixtures/resolveJsExtension.mjs', import.meta.url).href;
const fixtureUrl = new URL('./fixtures/innerScrollbarConstructor.mjs', import.meta.url).href;

test('does not append inner scrollbar toggle controls', () => {
    const result = spawnSync(
        process.execPath,
        ['--experimental-loader', loaderUrl, '--input-type=module', '--eval', `await import(${JSON.stringify(fixtureUrl)});`],
        {
            encoding: 'utf8',
        },
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
});
