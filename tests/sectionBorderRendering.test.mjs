import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cellHeaderSource = await readFile(new URL('../src/CellHeader.ts', import.meta.url), 'utf8');
const headerSource = await readFile(new URL('../src/Header.ts', import.meta.url), 'utf8');
const cellSource = await readFile(new URL('../src/Cell.ts', import.meta.url), 'utf8');
const footerSource = await readFile(new URL('../src/Footer.ts', import.meta.url), 'utf8');
const configSource = await readFile(new URL('../src/Config.ts', import.meta.url), 'utf8');

function getMethodSource(source, methodName, nextMethodName) {
    const start = source.indexOf(methodName);
    const end = source.indexOf(nextMethodName, start + methodName.length);
    assert.notEqual(start, -1, `${methodName} not found`);
    assert.notEqual(end, -1, `${nextMethodName} not found after ${methodName}`);
    return source.slice(start, end);
}

test('uses the resize divider color only for header column dividers', () => {
    const headerColumnDivider = getMethodSource(cellHeaderSource, 'private drawColumnDivider()', 'private drawHorizontalDivider()');
    const footerColumnDivider = getMethodSource(cellSource, 'private drawFooterColumnDivider()', 'drawHorizontalBorder()');

    assert.match(headerColumnDivider, /resolveResizeColumnDividerColor\(config\)/);
    assert.match(headerColumnDivider, /getColumnDividerSide/);
    assert.match(footerColumnDivider, /config\.BORDER_COLOR/);
    assert.match(footerColumnDivider, /getColumnDividerSide/);
    assert.doesNotMatch(footerColumnDivider, /resolveResizeColumnDividerColor|RESIZE_COLUMN_DIVIDER_COLOR/);
});

test('keeps the static divider color separate from the active resize guide', () => {
    const resizeGuide = getMethodSource(headerSource, 'private drawTipLine()', 'private drawDragTip()');

    assert.match(resizeGuide, /RESIZE_COLUMN_LINE_COLOR/);
    assert.doesNotMatch(resizeGuide, /RESIZE_COLUMN_DIVIDER_COLOR/);
    assert.match(configSource, /RESIZE_COLUMN_DIVIDER_COLOR/);
    assert.doesNotMatch(configSource, /HEADER_BORDER_COLOR|FOOTER_BORDER_COLOR/);
});

test('uses BORDER_COLOR for header and footer horizontal boundaries', () => {
    const headerBottom = getMethodSource(headerSource, 'drawBottomLine()', 'draw()');
    const footerTop = getMethodSource(footerSource, 'drawTopLine()', 'draw()');
    const headerHorizontalDivider = getMethodSource(cellHeaderSource, 'private drawHorizontalDivider()', 'private drawText()');
    const footerHorizontalDivider = getMethodSource(cellSource, 'drawHorizontalBorder()', 'private drawAutofillPiont()');

    for (const source of [headerBottom, footerTop, headerHorizontalDivider, footerHorizontalDivider]) {
        assert.match(source, /BORDER_COLOR/);
        assert.doesNotMatch(source, /resolveResizeColumnDividerColor/);
    }
});

test('fills section cells separately from their dividers', () => {
    const headerEdge = getMethodSource(cellHeaderSource, 'private drawEdge()', 'private drawColumnDivider()');
    const footerContainer = getMethodSource(cellSource, 'drawContainer()', 'private drawFooterColumnDivider()');

    assert.doesNotMatch(headerEdge, /borderColor/);
    assert.match(headerEdge, /this\.drawColumnDivider\(\)/);
    assert.match(footerContainer, /this\.cellType !== 'footer'/);
    assert.doesNotMatch(footerContainer, /borderColor: 'transparent'/);
    assert.match(footerContainer, /this\.drawFooterColumnDivider\(\)/);
});
