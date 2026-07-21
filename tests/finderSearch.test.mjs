import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('indexes custom finder text for header, body, and footer inside FinderBar', async () => {
    const [typesSource, cellSource, finderSource, scrollerSource] = await Promise.all([
        readFile(new URL('../src/types.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/Cell.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/FinderBar.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/Scroller.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(typesSource, /formatterFinderValue\?: FinderFormatterMethod/);
    assert.match(typesSource, /cellType: CellType/);
    assert.match(cellSource, /this\.formatterFinderValue = column\.formatterFinderValue/);
    assert.match(cellSource, /cellType: this\.cellType/);
    assert.match(finderSource, /const getSearchText = \(\.\.\.values: unknown\[\]\)/);
    assert.match(finderSource, /cellType: 'header'/);
    assert.match(finderSource, /getVirtualBodyCell/);
    assert.match(finderSource, /this\.ctx\.footer\.renderRows/);
    assert.match(finderSource, /type: 'footer'/);
    assert.match(cellSource, /type === 'footer'/);
    assert.match(scrollerSource, /cellType === 'body'/);
    assert.match(scrollerSource, /cellType === 'footer'/);
});
