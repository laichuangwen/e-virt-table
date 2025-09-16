import type Context from './Context';
import type Cell from './Cell';
import type CellHeader from './CellHeader';
import { BeforePasteDataMethod, BeforeSetSelectorMethod, ChangeItem, ErrorType, BeforeCopyMethod } from './types';
import { throttle, decodeSpreadsheetStr, encodeToSpreadsheetStr } from './util';
export default class Selector {
    private isCut = false;
    private isMultipleRow = false;
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }
    private init() {
        this.ctx.on('setMoveFocus', (dir: 'LEFT' | 'TOP' | 'RIGHT' | 'BOTTOM') => {
            this.moveFocus(dir);
        });
        // 鼠标移动fixed边界时，调整滚动条位置
        this.ctx.on(
            'mousemove',
            throttle((e) => {
                // focus为fixed的不处理
                if (this.ctx.focusCell?.fixed || this.ctx.focusCellHeader?.fixed) {
                    return;
                }
                if (!this.ctx.dragHeaderIng && this.ctx.selectorMove) {
                    this.ctx.startAdjustPosition(e);
                }
            }, 100),
        );
        this.ctx.on('cellHoverChange', (cell) => {
            // 如果是自动填充移动就不处理
            if (this.ctx.autofillMove) {
                return;
            }
            if (cell.operation) {
                this.selectRows(cell, false);
                // 如果是自动填充就不处理
                return;
            }
            // 多选行
            if (this.isMultipleRow) {
                return;
            }
            this.mouseenter();
        });
        this.ctx.on('cellMousedown', (cell, e) => {
            if (!this.ctx.isTarget(e)) {
                return;
            }
            // 如果是选中就不处理，比如chexkbox
            if (this.ctx.stageElement.style.cursor === 'pointer') {
                return;
            }
            if (this.ctx.isPointer) {
                return;
            }
            // 如果是填充返回
            if (this.ctx.stageElement.style.cursor === 'crosshair') {
                return;
            }
            if (cell.operation) {
                this.isMultipleRow = true;
                this.selectRows(cell);
                return;
            }
            // 解决dom文档选中问题
            const style = window.getComputedStyle(e.target);
            if (style.userSelect !== 'text') {
                e.preventDefault();
            }
            this.isMultipleRow = false;
            this.click(e.shiftKey);
            this.ctx.emit('selectorClick', cell);
        });
        this.ctx.on('mouseup', () => {
            this.ctx.selectorMove = false;
            this.ctx.stopAdjustPosition();
            // mousedown销毁dom会导致click事件清除
            // 加个setTimeout小延迟一下，使得editor cellClick 判断adjustPositioning正常
            const timer = setTimeout(() => {
                this.ctx.adjustPositioning = false;
                clearTimeout(timer);
            }, 0);
        });
        this.ctx.on('cellHeaderHoverChange', (cell) => {
            if (this.ctx.mousedown) {
                this.selectCols(cell);
            }
        });
        this.ctx.on('cellHoverChange', (cell) => {
            if (this.ctx.mousedown) {
                this.selectCols(cell);
            }
        });
        this.ctx.on('cellHeaderMousedown', (cell, e) => {
            // 如果是选中就不处理，比如chexkbox
            if (this.ctx.stageElement.style.cursor === 'pointer') {
                return;
            }
            if (this.ctx.isPointer) {
                return;
            }
            // 解决dom文档选中问题
            const style = window.getComputedStyle(e.target);
            if (style.userSelect !== 'text') {
                e.preventDefault();
            }
            this.ctx.clearSelector();
            if (cell.operation) {
                this.selectAll();
            } else {
                this.selectCols(cell);
            }
        });
        this.ctx.on('keydown', (e) => {
            if (this.ctx.editing) {
                return;
            }
            // CTRL+C／Command+C
            if ((e.ctrlKey && e.code === 'KeyV') || (e.metaKey && e.code === 'KeyV')) {
                this.paste();
                return;
            }
            if ((e.ctrlKey && e.code === 'KeyC') || (e.metaKey && e.code === 'KeyC')) {
                this.copy();
                this.isCut = false;
                return;
            }
            // CTRL+X／Command+X
            if ((e.ctrlKey && e.code === 'KeyX') || (e.metaKey && e.code === 'KeyX')) {
                this.isCut = true;
                this.copy();
                return;
            }
            // CTRL+A／Command+A
            if ((e.ctrlKey && e.code === 'KeyA') || (e.metaKey && e.code === 'KeyA')) {
                e.preventDefault();
                this.selectAll();
            }
            if (e.code === 'ArrowLeft' || (e.shiftKey && e.code === 'Tab')) {
                e.preventDefault();
                this.moveFocus('LEFT');
                return;
            }
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                this.moveFocus('TOP');
                return;
            }
            if (e.code === 'ArrowRight' || e.code === 'Tab') {
                e.preventDefault();
                this.moveFocus('RIGHT');
                return;
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                this.moveFocus('BOTTOM');
                return;
            }
            if (e.code === 'Delete' || e.code === 'Backspace') {
                e.preventDefault();
                const { xArr, yArr } = this.ctx.selector;
                this.clearSelectedData(xArr, yArr);
                return;
            }
        });
        this.ctx.on('contextMenuClearSelected', () => {
            const { xArr, yArr } = this.ctx.selector;
            this.clearSelectedData(xArr, yArr);
        });
        this.ctx.on('contextMenuCopy', () => {
            this.copy();
        });
        this.ctx.on('contextMenuPaste', () => {
            this.paste();
        });
        this.ctx.on('contextMenuCut', () => {
            this.isCut = true;
            this.copy();
        });
        //解耦：外部调用选择单元格
        this.ctx.on('setSelectorCell', (cell: Cell) => {
            this.ctx.setFocusCell(cell);
            this.click();
        });
    }
    private setSelector(xArr: number[], yArr: number[]) {
        if (this.ctx.dragHeaderIng) {
            return;
        }
        const { ENABLE_SELECTOR_SPAN_COL, ENABLE_SELECTOR_SPAN_ROW } = this.ctx.config;
        let _xArr = xArr;
        let _yArr = yArr;
        if (!ENABLE_SELECTOR_SPAN_ROW) {
            const [rowstart] = _yArr;
            _yArr = [rowstart, rowstart];
        }
        if (!ENABLE_SELECTOR_SPAN_COL) {
            const [colstart] = _xArr;
            _xArr = [colstart, colstart];
        }
        // 减少渲染
        if (
            JSON.stringify(this.ctx.selector.xArr) !== JSON.stringify(_xArr) ||
            JSON.stringify(this.ctx.selector.yArr) !== JSON.stringify(_yArr)
        ) {
            if (this.ctx.mousedown) {
                this.ctx.selectorMove = true;
            }
            this.ctx.selector.enable = true;
            const {
                SELECTOR_AREA_MIN_X,
                SELECTOR_AREA_MAX_X,
                SELECTOR_AREA_MIN_Y,
                SELECTOR_AREA_MAX_Y,
                SELECTOR_AREA_MAX_X_OFFSET,
                SELECTOR_AREA_MAX_Y_OFFSET,
            } = this.ctx.config;
            const areaMinX = SELECTOR_AREA_MIN_X;
            const areaMaxX = SELECTOR_AREA_MAX_X || this.ctx.maxColIndex - SELECTOR_AREA_MAX_X_OFFSET;
            const areaMinY = SELECTOR_AREA_MIN_Y;
            const areaMaxY = SELECTOR_AREA_MAX_Y || this.ctx.maxRowIndex - SELECTOR_AREA_MAX_Y_OFFSET;
            let [minX, maxX] = _xArr;
            let [minY, maxY] = _yArr;
            if (minX < areaMinX) {
                return;
            }
            if (maxX > areaMaxX) {
                return;
            }
            if (minY < areaMinY) {
                return;
            }
            if (maxY > areaMaxY) {
                return;
            }
            // 聚焦，解决iframe键盘事件不触发
            this.ctx.stageElement.focus({ preventScroll: true });
            // 启用合并单元格关联
            if (this.ctx.config.ENABLE_MERGE_CELL_LINK) {
                const adjustMerge = this.adjustMergeCells(_xArr, _yArr);
                // 合并单元格时，调整选择器的位置
                minY = adjustMerge.yArr[0];
                maxY = adjustMerge.yArr[1];
                minX = adjustMerge.xArr[0];
                maxX = adjustMerge.xArr[1];
                // 只有一个合并单元格时
                this.ctx.onlyMergeCell = adjustMerge.onlyMergeCell;
            }
            if (minX === maxX && minY === maxY) {
                this.ctx.selectOnlyOne = true;
            } else {
                this.ctx.selectOnlyOne = false;
            }
            _xArr = [Math.max(areaMinX, minX), Math.min(areaMaxX, maxX)];
            _yArr = [Math.max(areaMinY, minY), Math.min(areaMaxY, maxY)];
            // 调整选择器的位置前回调
            const { BEFORE_SET_SELECTOR_METHOD } = this.ctx.config;
            if (typeof BEFORE_SET_SELECTOR_METHOD === 'function') {
                const beforeSetSelectorMethod: BeforeSetSelectorMethod = BEFORE_SET_SELECTOR_METHOD;
                const res = beforeSetSelectorMethod({
                    focusCell: this.ctx.focusCell,
                    xArr: _xArr,
                    yArr: _yArr,
                });
                if (!res) {
                    return;
                }
                _xArr = res.xArr;
                _yArr = res.yArr;
            }
            this.ctx.selector.xArr = _xArr;
            this.ctx.selector.yArr = _yArr;
            // 判断是否选择列中
            if (maxY === this.ctx.maxRowIndex && minY === 0) {
                this.ctx.selectColsIng = true;
            } else {
                this.ctx.selectColsIng = false;
            }
            // 判断是否选择行中
            if (maxX === this.ctx.maxColIndex && minX === 0) {
                this.ctx.selectRowsIng = true;
            } else {
                this.ctx.selectRowsIng = false;
            }
            this.ctx.emit('setSelector', this.ctx.selector);
            this.ctx.emit('drawView');
        }
    }
    private adjustMergeCells(xArr: number[], yArr: number[]) {
        const [minY, maxY] = yArr;
        const [minX, maxX] = xArr;
        // 如果是选择行或列中就不处理，因为会导致性能问题
        if ((maxY === this.ctx.maxRowIndex && minY === 0) || (maxX === this.ctx.maxColIndex && minX === 0)) {
            return {
                xArr,
                yArr,
                onlyMergeCell: false,
            };
        }
        let topBottomCells: Cell[] = [];
        let leftRightCells: Cell[] = [];
        // 遍历选择中的单元格
        for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
            for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
                const rowIndex = ri + yArr[0];
                const colIndex = ci + xArr[0];
                const cell = this.ctx.database.getVirtualBodyCell(rowIndex, colIndex);
                if (cell) {
                    // 顶部和底部的单元格
                    if (rowIndex === minY || rowIndex === maxY) {
                        topBottomCells.push(cell);
                    }
                    // 左右的单元格
                    if (colIndex === minX || colIndex === maxX) {
                        leftRightCells.push(cell);
                    }
                }
            }
        }
        const topBottomBoundary = topBottomCells.reduce(
            (prev, cell) => {
                const { yArr } = cell.getSpanInfo();
                const [topIndex, bottomIndex] = yArr;
                prev.minY = Math.min(prev.minY, topIndex);
                prev.maxY = Math.max(prev.maxY, bottomIndex);
                return prev;
            },
            {
                minY,
                maxY,
            },
        );
        const leftRightBoundary = leftRightCells.reduce(
            (prev, cell) => {
                const { xArr } = cell.getSpanInfo();
                const [leftIndex, rightIndex] = xArr;
                prev.minX = Math.min(prev.minX, leftIndex);
                prev.maxX = Math.max(prev.maxX, rightIndex);
                return prev;
            },
            {
                minX,
                maxX,
            },
        );
        const _xArr = [leftRightBoundary.minX, leftRightBoundary.maxX];
        const _yArr = [topBottomBoundary.minY, topBottomBoundary.maxY];
        let onlyMergeCell = false;
        // Check if the selected area is a single merged cell
        if (leftRightBoundary.minX !== leftRightBoundary.maxX || topBottomBoundary.minY !== topBottomBoundary.maxY) {
            const selectorStr = JSON.stringify(_xArr) + JSON.stringify(_yArr);
            const spanInfo = this.ctx.focusCell?.getSpanInfo();
            const spanStr = spanInfo && JSON.stringify(spanInfo.xArr) + JSON.stringify(spanInfo.yArr);
            onlyMergeCell = spanStr === selectorStr;
        }
        return {
            xArr: _xArr,
            yArr: _yArr,
            onlyMergeCell,
        };
    }
    private selectCols(cell: CellHeader | Cell) {
        // 启用单选就不能批量选中
        if (this.ctx.config.ENABLE_SELECTOR_SINGLE) {
            return;
        }
        if (!this.ctx.config.ENABLE_SELECTOR_ALL_ROWS) {
            return;
        }
        if (this.ctx.autofillMove) {
            return;
        }
        // 如果是拖拽改变列宽就不处理
        if (this.ctx.columnResizing) {
            return;
        }
        // 编辑中
        if (this.ctx.editing) {
            return;
        }
        const { SELECTOR_AREA_MIN_Y, SELECTOR_AREA_MAX_Y, SELECTOR_AREA_MAX_Y_OFFSET } = this.ctx.config;
        const minY = SELECTOR_AREA_MIN_Y;
        const maxY = SELECTOR_AREA_MAX_Y || this.ctx.maxRowIndex - SELECTOR_AREA_MAX_Y_OFFSET;
        if (this.ctx.mousedown && this.ctx.focusCellHeader) {
            const { colIndex } = this.ctx.focusCellHeader;
            this.ctx.clearSelector();
            if (cell.colIndex >= colIndex) {
                const xArr = [colIndex, cell.colIndex + cell.colspan - 1];
                const yArr = [minY, maxY];
                this.setSelector(xArr, yArr);
            } else {
                const xArr = [cell.colIndex, colIndex];
                const yArr = [minY, maxY];
                this.setSelector(xArr, yArr);
            }
        }
    }
    private selectAll() {
        if (this.ctx.autofillMove) {
            return;
        }
        // 编辑中
        if (this.ctx.editing) {
            return;
        }
        // 只有两个全选启用了才能全选
        const { ENABLE_SELECTOR_ALL_ROWS, ENABLE_SELECTOR_ALL_COLS } = this.ctx.config;
        if (ENABLE_SELECTOR_ALL_ROWS && ENABLE_SELECTOR_ALL_COLS) {
            const {
                SELECTOR_AREA_MIN_X,
                SELECTOR_AREA_MAX_X,
                SELECTOR_AREA_MIN_Y,
                SELECTOR_AREA_MAX_Y,
                SELECTOR_AREA_MAX_X_OFFSET,
                SELECTOR_AREA_MAX_Y_OFFSET,
            } = this.ctx.config;
            const minX = SELECTOR_AREA_MIN_X;
            const maxX = SELECTOR_AREA_MAX_X || this.ctx.maxColIndex - SELECTOR_AREA_MAX_X_OFFSET;
            const minY = SELECTOR_AREA_MIN_Y;
            const maxY = SELECTOR_AREA_MAX_Y || this.ctx.maxRowIndex - SELECTOR_AREA_MAX_Y_OFFSET;
            const xArr = [minX, maxX];
            const yArr = [minY, maxY];
            this.setSelector(xArr, yArr);
        }
    }
    private selectRows(cell: Cell, isSetFocus = true) {
        // 启用单选就不能批量选中
        if (this.ctx.config.ENABLE_SELECTOR_SINGLE) {
            return;
        }
        if (!this.ctx.config.ENABLE_SELECTOR_ALL_COLS) {
            return;
        }
        if (this.ctx.autofillMove) {
            return;
        }
        // 编辑中
        if (this.ctx.editing) {
            return;
        }
        const { SELECTOR_AREA_MIN_X, SELECTOR_AREA_MAX_X, SELECTOR_AREA_MAX_X_OFFSET } = this.ctx.config;
        const maxX = SELECTOR_AREA_MAX_X || this.ctx.maxColIndex - SELECTOR_AREA_MAX_X_OFFSET;
        const minX = SELECTOR_AREA_MIN_X;
        if (isSetFocus) {
            this.ctx.setFocusCell(cell);
            const xArr = [minX, maxX];
            const yArr = [cell.rowIndex, cell.rowIndex];
            this.setSelector(xArr, yArr);
        }
        if (this.ctx.focusCell && this.ctx.mousedown) {
            const { rowIndex } = this.ctx.focusCell;
            if (cell.rowIndex >= rowIndex) {
                const xArr = [minX, maxX];
                const yArr = [rowIndex, cell.rowIndex];
                this.setSelector(xArr, yArr);
            } else {
                const xArr = [minX, maxX];
                const yArr = [cell.rowIndex, rowIndex];
                this.setSelector(xArr, yArr);
            }
        }
    }

    private mouseenter() {
        if (this.ctx.config.ENABLE_SELECTOR_SINGLE) {
            return;
        }
        // 编辑中
        if (this.ctx.editing) {
            return;
        }
        const { mousedown, focusCell, hoverCell } = this.ctx;
        if (mousedown && focusCell && hoverCell) {
            const { rowIndex, colIndex } = focusCell;
            const minX = Math.min(hoverCell.colIndex, colIndex);
            const maxX = Math.max(hoverCell.colIndex, colIndex);
            const minY = Math.min(hoverCell.rowIndex, rowIndex);
            const maxY = Math.max(hoverCell.rowIndex, rowIndex);
            const xArr = [minX, maxX];
            const yArr = [minY, maxY];
            this.setSelector(xArr, yArr);
        }
    }
    private click(shiftKey = false) {
        const { focusCell, clickCell } = this.ctx;
        if (!focusCell) {
            return;
        }
        // 超过范围值就不处理
        if (!this.isInSettingRange(focusCell.rowIndex, focusCell.colIndex)) {
            return;
        }
        this.ctx.selector.enable = true;
        if (clickCell && shiftKey) {
            // 启用单选就不能批量选中
            if (this.ctx.config.ENABLE_SELECTOR_SINGLE) {
                return;
            }
            // shiftKey快捷选中
            const { colIndex, rowIndex } = clickCell;
            const { colIndex: oldX, rowIndex: oldY } = focusCell;
            const minX = Math.min(oldX, colIndex);
            const maxX = Math.max(oldX, colIndex);
            const minY = Math.min(oldY, rowIndex);
            const maxY = Math.max(oldY, rowIndex);
            const xArr = [minX, maxX];
            const yArr = [minY, maxY];
            this.setSelector(xArr, yArr);
        } else {
            this.ctx.emit('cellSelectedClick', focusCell);
            const xArr = [focusCell.colIndex, focusCell.colIndex];
            const yArr = [focusCell.rowIndex, focusCell.rowIndex];
            this.setSelector(xArr, yArr);
            this.adjustBoundaryPosition();
        }
    }

    private clearCopyLine() {
        this.ctx.selector.xArrCopy = [-1, -1];
        this.ctx.selector.yArrCopy = [-1, -1];
    }
    /**
     * 获取选中单元格
     * @param rowIndex
     * @param colIndex
     * @returns
     */
    private getCell(rowIndex: number, colIndex: number) {
        // 设置选中FocusCell
        const row = this.ctx.body.renderRows.find((row) => row.rowIndex === rowIndex);
        const cell = row?.cells.find((cell: { colIndex: number }) => cell.colIndex === colIndex);
        return cell;
    }
    /**
     * 复制
     * @returns
     */
    private copy() {
        if (!this.ctx.config.ENABLE_COPY) {
            return;
        }
        // dom选中时会阻止复制
        if (this.ctx.domSelectionStr) {
            return;
        }
        let { value, xArr, yArr } = this.ctx.getSelectedData();
        if (this.ctx.config.ENABLE_MERGE_CELL_LINK && this.ctx.database.hasMergeCell(xArr, yArr)) {
            if (this.ctx.onlyMergeCell && this.ctx.focusCell) {
                const cell = this.ctx.focusCell;
                value = [[cell.getValue()]];
                xArr = [cell.colIndex, cell.colIndex];
                yArr = [cell.rowIndex, cell.rowIndex];
            } else {
                const err: ErrorType = {
                    code: 'ERR_MERGED_CELLS_COPY',
                    message: 'Merged cells cannot span copy data',
                };
                if (this.ctx.hasEvent('error')) {
                    this.ctx.emit('error', err);
                } else {
                    alert(err.message);
                }
                return;
            }
        }
        // 复制前回调
        const { BEFORE_COPY_METHOD } = this.ctx.config;
        if (typeof BEFORE_COPY_METHOD === 'function') {
            const beforeCopyMethod: BeforeCopyMethod = BEFORE_COPY_METHOD;
            const res = beforeCopyMethod({
                focusCell: this.ctx.focusCell,
                data: value,
                xArr,
                yArr,
            });
            if (!res) {
                return;
            }
            value = res.data;
        }
        const text = encodeToSpreadsheetStr(value);
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    // 处理复制线
                    this.ctx.selector.xArrCopy = this.ctx.selector.xArr.slice();
                    this.ctx.selector.yArrCopy = this.ctx.selector.yArr.slice();
                    this.ctx.emit('copyChange', {
                        xArr: this.ctx.selector.xArrCopy,
                        yArr: this.ctx.selector.yArrCopy,
                        data: value,
                    });
                    this.ctx.emit('draw');
                })
                .catch((error) => console.error('Copy Failure:', error));
        } else {
            console.error('current browser does not support the Clipboard API');
        }
    }
    clearSelectedData(xArr: number[], yArr: number[], ignoreSet = false, value = null) {
        let changeList: ChangeItem[] = [];
        const rowKeyList: Set<string> = new Set();
        for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
            for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
                const _rowIndex = ri + yArr[0];
                const _colIndex = ci + xArr[0];
                const itemValue = this.ctx.database.getItemValueForRowIndexAndColIndex(_rowIndex, _colIndex);
                if (itemValue) {
                    const { rowKey, key } = itemValue;
                    // 只读就跳过
                    if (!this.ctx.database.getReadonly(rowKey, key)) {
                        rowKeyList.add(rowKey);
                        changeList.push({
                            rowKey,
                            key,
                            value,
                            row: {}, //内部有设置
                        });
                    }
                }
            }
        }
        // 没有变化就返回
        if (!changeList.length) {
            return [];
        }
        // 忽略设置，只返回数据，用于cut
        if (ignoreSet) {
            return changeList;
        }
        // 批量设置数据，并记录历史
        this.ctx.database.batchSetItemValue(changeList, true);
        let rows: any[] = [];
        rowKeyList.forEach((rowKey) => {
            rows.push(this.ctx.database.getRowDataItemForRowKey(rowKey));
        });
        this.ctx.emit('clearSelectedDataChange', changeList, rows);
        return changeList;
    }
    private paste() {
        if (!navigator.clipboard) {
            console.error('current browser does not support the Clipboard API');
            return;
        }
        const { ENABLE_PASTER } = this.ctx.config;
        if (this.ctx.selector.enable && ENABLE_PASTER) {
            const rowIndex = this.ctx.selector.yArr[0];
            const colIndex = this.ctx.selector.xArr[0];
            const rowKeyList: Set<string> = new Set();
            navigator.clipboard
                .readText()
                .then(async (val) => {
                    let textArr = decodeSpreadsheetStr(val);
                    const _xArr = [colIndex, colIndex + textArr[0].length - 1];
                    const _yArr = [rowIndex, rowIndex + textArr.length - 1];
                    const [minY, maxY] = _yArr;
                    const [minX, maxX] = _xArr;
                    const overflowRowCount = maxY - this.ctx.maxRowIndex;
                    const overflowColCount = maxX - this.ctx.maxColIndex;
                    // 粘贴溢出回调处理
                    if (overflowRowCount > 0 || overflowColCount > 0) {
                        this.ctx.emit('onPastedDataOverflow', {
                            maxY,
                            maxX,
                            minY,
                            minX,
                            overflowRowCount,
                            overflowColCount,
                            textArr,
                        });
                    }
                    // textArr只有一个
                    const isOneData = textArr.length === 1 && textArr[0].length === 1;
                    // 启用合并时禁用粘贴填充
                    if (
                        this.ctx.config.ENABLE_MERGE_CELL_LINK &&
                        this.ctx.database.hasMergeCell(_xArr, _yArr) &&
                        !isOneData
                    ) {
                        const err: ErrorType = {
                            code: 'ERR_MERGED_CELLS_PASTE',
                            message: 'Merged cells cannot span paste data',
                        };
                        if (this.ctx.hasEvent('error')) {
                            this.ctx.emit('error', err);
                        } else {
                            alert(err.message);
                        }
                        return;
                    }
                    let changeList: ChangeItem[] = [];
                    for (let ri = 0; ri <= textArr.length - 1; ri++) {
                        const len = textArr[ri].length;
                        for (let ci = 0; ci <= len - 1; ci++) {
                            const _rowIndex = ri + rowIndex;
                            const _colIndex = ci + colIndex;
                            const value = textArr[ri][ci];
                            const itemValue = this.ctx.database.getItemValueForRowIndexAndColIndex(
                                _rowIndex,
                                _colIndex,
                            );
                            if (itemValue) {
                                const { rowKey, key } = itemValue;
                                // 只读就跳过
                                if (!this.ctx.database.getReadonly(rowKey, key)) {
                                    rowKeyList.add(rowKey);
                                    changeList.push({
                                        rowKey,
                                        key,
                                        value,
                                        row: {}, //内部有设置
                                    });
                                }
                            }
                        }
                    }
                    // 剪切时清除选中数据
                    if (this.isCut) {
                        const cutList = this.clearSelectedData(
                            this.ctx.selector.xArrCopy,
                            this.ctx.selector.yArrCopy,
                            true, // 忽略设置，只返回数据，用于cut，实现历史回退需要返回两次问题
                        );
                        const changeListRowkeys = changeList.map((item) => `${item.rowKey}-${item.key}`);
                        // 剔除剪切的数据
                        cutList.forEach((item) => {
                            if (!changeListRowkeys.includes(`${item.rowKey}-${item.key}`)) {
                                // 剪切的数据放在最前面
                                changeList.unshift(item);
                            }
                        });
                        this.isCut = false;
                    }
                    // 没有变化就返回
                    if (!changeList.length) {
                        return;
                    }
                    // 剪贴板内容改变前回调
                    const { BEFORE_PASTE_DATA_METHOD } = this.ctx.config;
                    if (typeof BEFORE_PASTE_DATA_METHOD === 'function') {
                        const beforePasteDataMethod: BeforePasteDataMethod = BEFORE_PASTE_DATA_METHOD;
                        const _changeList = changeList.map((item) => ({
                            rowKey: item.rowKey,
                            key: item.key,
                            value: item.value,
                            oldValue: this.ctx.database.getItemValue(item.rowKey, item.key),
                            row: this.ctx.database.getRowDataItemForRowKey(item.rowKey),
                        }));
                        changeList = await beforePasteDataMethod(_changeList, _xArr, _yArr, textArr);
                        if (changeList && !changeList.length) {
                            return;
                        }
                    }
                    // 清除复制线
                    this.clearCopyLine();
                    // 批量设置数据，并记录历史
                    this.ctx.batchSetItemValueByEditor(changeList, true);
                    let rows: any[] = [];
                    rowKeyList.forEach((rowKey) => {
                        rows.push(this.ctx.database.getRowDataItemForRowKey(rowKey));
                    });
                    this.ctx.emit('pasteChange', changeList, rows);
                    this.ctx.emit('draw');
                })
                .catch((error) => {
                    console.error('Failed to get the clipboard content:', error);
                });
        }
    }
    /**键盘上下左右切换
     * @param dir
     */
    private moveFocus(dir: 'LEFT' | 'TOP' | 'RIGHT' | 'BOTTOM') {
        // 编辑状态不处理
        if (this.ctx.editing) {
            return;
        }
        const { focusCell } = this.ctx;
        if (!focusCell) {
            return;
        }
        let { colIndex = 0, rowIndex = 0 } = focusCell;
        const minX = 0;
        const minY = 0;
        const maxX = this.ctx.maxColIndex;
        const maxY = this.ctx.maxRowIndex;
        switch (dir) {
            case 'LEFT':
                if (colIndex > minX) {
                    colIndex--;
                }
                break;
            case 'TOP':
                if (rowIndex > minY) {
                    rowIndex--;
                }
                break;
            case 'RIGHT':
                if (colIndex < maxX) {
                    colIndex++;
                }
                break;
            case 'BOTTOM':
                if (rowIndex < maxY) {
                    rowIndex++;
                }
                break;
            default:
        }
        const xArr = [colIndex, colIndex];
        const yArr = [rowIndex, rowIndex];
        const cell = this.getCell(rowIndex, colIndex);
        if (!cell) {
            return;
        }
        // 操作列不处理
        if (cell.operation) {
            return;
        }
        // 超过范围值就不处理，防止跳动
        if (!this.isInSettingRange(cell.rowIndex, cell.colIndex)) {
            return;
        }
        this.ctx.setFocusCell(cell);
        this.setSelector(xArr, yArr);
        this.adjustBoundaryPosition();
        this.ctx.emit('moveFocus', cell);
        this.ctx.emit('draw');
    }
    // 判断是否在设置范围内
    private isInSettingRange(rowIndex: number, colIndex: number) {
        const {
            SELECTOR_AREA_MIN_X,
            SELECTOR_AREA_MAX_X,
            SELECTOR_AREA_MIN_Y,
            SELECTOR_AREA_MAX_Y,
            SELECTOR_AREA_MAX_X_OFFSET,
            SELECTOR_AREA_MAX_Y_OFFSET,
        } = this.ctx.config;
        const areaMinX = SELECTOR_AREA_MIN_X;
        const areaMaxX = SELECTOR_AREA_MAX_X || this.ctx.maxColIndex - SELECTOR_AREA_MAX_X_OFFSET;
        const areaMinY = SELECTOR_AREA_MIN_Y;
        const areaMaxY = SELECTOR_AREA_MAX_Y || this.ctx.maxRowIndex - SELECTOR_AREA_MAX_Y_OFFSET;
        if (colIndex < areaMinX) {
            return false;
        }
        if (colIndex > areaMaxX) {
            return false;
        }
        if (rowIndex < areaMinY) {
            return false;
        }
        if (rowIndex > areaMaxY) {
            return false;
        }
        return true;
    }
    /**
     * 调整滚动条位置，让焦点单元格始终出现在可视区域内
     */
    private adjustBoundaryPosition() {
        const {
            stageHeight,
            stageWidth,
            focusCell,
            fixedRightWidth,
            fixedLeftWidth,
            header,
            footer,
            body,
            scrollX,
            scrollY,
            config: { SCROLLER_TRACK_SIZE, FOOTER_FIXED, FOOTER_POSITION, ENABLE_MERGE_CELL_LINK },
        } = this.ctx;
        if (!focusCell) {
            return;
        }
        // 处理合并的单元格的移动
        if (ENABLE_MERGE_CELL_LINK && this.ctx.onlyMergeCell) {
            focusCell.updateSpanInfo();
        }
        const { drawX, drawY, width, height, fixed } = focusCell;
        // 加1补选中框的边框,且可以移动滚动，以为getCell是获取渲染的cell
        const diffLeft = fixedLeftWidth - drawX + 1;
        const diffRight = focusCell.drawX + width - (stageWidth - fixedRightWidth) + 1;
        let diffTop = header.height - drawY;
        // 格子大于可视高度就取可视高度，防止上下跳动
        let cellheight = height;
        if (cellheight > body.visibleHeight) {
            cellheight = body.visibleHeight;
        }
        let footerHeight = 0;
        if (FOOTER_FIXED) {
            if (FOOTER_POSITION === 'top') {
                diffTop = header.height + footer.height - drawY;
            } else {
                footerHeight = footer.visibleHeight;
            }
        }
        const diffBottom = drawY + cellheight - (stageHeight - footerHeight - SCROLLER_TRACK_SIZE);
        let _scrollX = scrollX;
        let _scrollY = scrollY;
        // fixed禁用左右横向移动
        if (diffRight > 0 && !fixed) {
            _scrollX = Math.floor(scrollX + diffRight);
        } else if (diffLeft > 0 && !fixed) {
            _scrollX = Math.floor(scrollX - diffLeft);
        }
        if (diffTop > 0) {
            _scrollY = Math.floor(scrollY - diffTop);
        } else if (diffBottom > 0) {
            _scrollY = Math.floor(scrollY + diffBottom);
        }
        // >1是因为上面为了可移动加1，所以这里要大于2(保险一点)
        if (Math.abs(scrollX - _scrollX) > 2 || Math.abs(scrollY - _scrollY) > 2) {
            this.ctx.adjustPositioning = true;
            this.ctx.setScroll(_scrollX, _scrollY);
            // fix:处理移动后编辑器，需要再点击一次,编辑器那边有监听
            this.ctx.emit('adjustBoundaryPosition', focusCell);
        }
    }
    destroy() {}
}
