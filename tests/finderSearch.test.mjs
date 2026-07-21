import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('uses independent finder formatters for header, body, and footer', async () => {
    const [typesSource, cellSource, headerSource, finderSource, scrollerSource] = await Promise.all([
        readFile(new URL('../src/types.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/Cell.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/CellHeader.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/FinderBar.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/Scroller.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(typesSource, /formatterFinderValue\?: FinderFormatterMethod/);
    assert.match(typesSource, /formatterFinderHeaderValue\?: FinderHeaderFormatterMethod/);
    assert.match(typesSource, /formatterFinderFooterValue\?: FinderFormatterMethod/);
    assert.match(typesSource, /displayText: string/);
    assert.match(cellSource, /this\.formatterFinderValue = column\.formatterFinderValue/);
    assert.match(cellSource, /this\.formatterFinderFooterValue = column\.formatterFinderFooterValue/);
    assert.match(cellSource, /this\.cellType === 'footer' \? this\.formatterFinderFooterValue : this\.formatterFinderValue/);
    assert.match(cellSource, /this\.getDisplayText\(this\.getText\(\)\)/);
    assert.match(cellSource, /this\.cellType === 'footer' \? this\.row\[this\.key\] : this\.getValue\(\)/);
    assert.match(cellSource, /finderText === undefined \|\| finderText === null \? displayText/);
    assert.match(headerSource, /this\.formatterFinderHeaderValue = column\.formatterFinderHeaderValue/);
    assert.match(headerSource, /value: this\.text/);
    assert.match(headerSource, /finderText === undefined \|\| finderText === null \? displayText/);
    assert.match(finderSource, /getVirtualBodyCell/);
    assert.match(finderSource, /this\.ctx\.footer\.renderRows/);
    assert.match(finderSource, /type: 'header'/);
    assert.match(finderSource, /type: 'body'/);
    assert.match(finderSource, /type: 'footer'/);
    assert.match(cellSource, /type === 'footer'/);
    assert.match(scrollerSource, /cellType === 'body'/);
    assert.match(scrollerSource, /cellType === 'footer'/);
});
