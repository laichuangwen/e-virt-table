import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const loader = new URL('./fixtures/resolveJsExtension.mjs', import.meta.url).href;
const fixture = new URL('./fixtures/selectorKeyboard.mjs', import.meta.url).href;

for (const [scenario, description] of [
    ['navigation', 'returns to the first virtual row after downward navigation at one- and two-pixel boundaries'],
    ['variable-height', 'navigates back through virtual rows with different heights'],
    ['top', 'corrects one- and two-pixel overflow above the body'],
    ['bottom', 'corrects one- and two-pixel overflow below the body'],
    ['horizontal', 'preserves the horizontal border-offset tolerance'],
    ['independent-axes', 'does not introduce a horizontal nudge while correcting vertical overflow'],
    ['fixed', 'corrects vertical overflow for fixed columns without moving them horizontally'],
    ['footer', 'respects fixed footer boundaries at the top and bottom'],
    ['legacy', 'keeps the original scroll tolerance for mouse and programmatic selection'],
    ['oversized', 'does not scroll an already aligned cell taller than the viewport'],
]) {
    test(description, () => {
        const result = spawnSync(
            process.execPath,
            [
                '--experimental-loader',
                loader,
                '--input-type=module',
                '--eval',
                `process.env.SELECTOR_SCENARIO = ${JSON.stringify(scenario)}; await import(${JSON.stringify(fixture)});`,
            ],
            { encoding: 'utf8' },
        );
        assert.equal(result.status, 0, result.stderr || result.stdout);
    });
}
