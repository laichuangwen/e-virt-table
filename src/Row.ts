import Cell from './Cell';
import Context from './Context';
import type { RowType } from './types';
export default class Row {
    private ctx: Context;
    x = 0;
    y: number = 0;
    width = 0;
    height: number;
    cells: Cell[] = [];
    fixedCells: Cell[] = [];
    noFixedCells: Cell[] = [];
    calculatedHeightCells: Cell[] = [];
    rowIndex = 0;
    rowKey = '';
    rowType: RowType = 'body';
    data: any;
    calculatedHeight: number = -1;
    constructor(
        ctx: Context,
        rowIndex: number,
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        data: any,
        rowType: RowType = 'body',
    ) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rowIndex = rowIndex;
        this.rowKey = ctx.database.getRowKeyForRowIndex(rowIndex) || '';
        this.rowType = rowType;
        this.data = data;
        this.update();
    }
    update() {
        const { header } = this.ctx;
        const cells: Cell[] = [];
        const fixedCells: Cell[] = [];
        const noFixedCells: Cell[] = [];
        const calculatedHeightCells: Cell[] = [];
        header.renderLeafCellHeaders.forEach((header) => {
            const cell = new Cell(
                this.ctx,
                this.rowIndex,
                header.colIndex,
                header.x,
                this.y,
                header.width,
                this.height,
                header.column,
                this.data,
                this.rowType,
            );
            if (cell.fixed) {
                fixedCells.push(cell);
            } else {
                noFixedCells.push(cell);
            }
            cells.push(cell);
            if (cell.isAutoRowHeight) {
                calculatedHeightCells.push(cell);
            }
        });
        this.cells = cells;
        this.calculatedHeightCells = calculatedHeightCells;
        this.fixedCells = fixedCells;
        this.noFixedCells = noFixedCells;
        const heights = calculatedHeightCells.map((cell) => {
            return cell.getAutoHeight();
        });
        this.calculatedHeight = heights.length ? Math.max(...heights) : -1;
    }
    drawCenter() {
        this.noFixedCells.forEach((cell) => {
            cell.draw();
        });
    }
    drawFixed() {
        this.fixedCells.forEach((cell) => {
            cell.draw();
        });
    }
    drawContainer() {
        this.noFixedCells.forEach((cell) => {
            cell.drawContainer();
        });
    }
    drawFixedContainer() {
        this.fixedCells.forEach((cell) => {
            cell.drawContainer();
        });
    }
}
