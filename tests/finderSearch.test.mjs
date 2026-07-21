import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const mod = await import('../dist/lib/FinderSearch.js');

test('merges regular and custom finder text into one cell search value', () => {
    assert.equal(mod.mergeFinderSearchText('ASSET-0016', '已上传'), 'ASSET-0016\n已上传');
});

test('deduplicates finder text and ignores unsupported values', () => {
    assert.equal(mod.mergeFinderSearchText('same', 'same'), 'same');
    assert.equal(mod.mergeFinderSearchText(0, undefined, null, false), '0');
    assert.equal(mod.mergeFinderSearchText(undefined, null, false), undefined);
});

test('wires formatterFinderValue through Column, Cell, and FinderBar', async () => {
    const [typesSource, cellSource, finderSource] = await Promise.all([
        readFile(new URL('../src/types.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/Cell.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/FinderBar.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(typesSource, /formatterFinderValue\?: FormatterMethod/);
    assert.match(cellSource, /this\.formatterFinderValue = column\.formatterFinderValue/);
    assert.match(cellSource, /getFinderText\(\)/);
    assert.match(finderSource, /mergeFinderSearchText\(cell\?\.getText\(\), cell\?\.getFinderText\(\)\)/);
});
