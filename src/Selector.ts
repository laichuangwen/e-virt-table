import type Context from './Context';
import type Cell from './Cell';
import type CellHeader from './CellHeader';
import { ChangeItem } from './types';
import { throttle, decodeSpreadsheetStr, encodeToSpreadsheetStr } from './util';
export default class Selector {
    private isCut = false;
    private isMultipleRow = false;
    private ctx: Context;
    private adjustPositionX = '';
    private adjustPositionY = '';
    private timerX = 0; // 水平滚动定时器
    private timerY = 0; // 垂直滚动定时器
    private adjustTimer = 0;

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }
    private init() {
        // 鼠标移动fixed边界时，调整滚动条位置
        this.ctx.on(
            'mousemove',
            throttle((e) => {
                const { offsetY, offsetX } = this.ctx.getOffset(e);
                const isInsideBody =
                    this.ctx.isTarget() &&
                    offsetX > 0 &&
                    offsetX < this.ctx.body.visibleWidth &&
                    offsetY > this.ctx.header.visibleHeight &&
                    offsetY < this.ctx.header.visibleHeight + this.ctx.body.visibleHeight;
                if (this.ctx.selectorMove || this.ctx.autofillMove) {
                    // 如果是body外部就调整位置
                    if (!isInsideBody) {
                        this.startAdjustPosition(e);
                    } else {
                        this.stopAdjustPosition();
                    }
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
            if (!this.ctx.isTarget()) {
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
            this.isMultipleRow = false;
            this.click(e.shiftKey);
        });
        this.ctx.on('cellHeaderHoverChange', (cell) => {
            if (this.ctx.mousedown) {
                this.selectCols(cell);
            }
        });
        this.ctx.on('cellHeaderMousedown', (cell) => {
            // 如果是选中就不处理，比如chexkbox
            if (this.ctx.stageElement.style.cursor === 'pointer') {
                return;
            }
            if (this.ctx.isPointer) {
                return;
            }
            this.selectCols(cell);
        });
        this.ctx.on('keydown', (e) => {
            // CTRL+C／Command+C
            if ((e.ctrlKey && e.code === 'KeyV') || (e.metaKey && e.code === 'KeyV')) {
                e.preventDefault();
                this.paste();
                return;
            }
            if ((e.ctrlKey && e.code === 'KeyC') || (e.metaKey && e.code === 'KeyC')) {
                e.preventDefault();
                this.copy();
                this.isCut = false;
                return;
            }
            // CTRL+X／Command+X
            if ((e.ctrlKey && e.code === 'KeyX') || (e.metaKey && e.code === 'KeyX')) {
                e.preventDefault();
                this.isCut = true;
                this.copy();
                return;
            }
            // CTRL+A／Command+A
            if ((e.ctrlKey && e.code === 'KeyA') || (e.metaKey && e.code === 'KeyA')) {
                e.preventDefault();
                this.selectAll();
            }
            if (e.code === 'ArrowLeft') {
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
        this.ctx.on('mouseup', () => {
            this.ctx.selectorMove = false;
            this.stopAdjustPosition();
        });
    }
    private setSelector(xArr: number[], yArr: number[]) {
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
            this.ctx.selector.xArr = [Math.max(areaMinX, minX), Math.min(areaMaxX, maxX)];
            this.ctx.selector.yArr = [Math.max(areaMinY, minY), Math.min(areaMaxY, maxY)];
            this.ctx.emit('setSelector', this.ctx.selector);
            this.ctx.emit('drawView');
        }
    }

    private selectCols(cell: CellHeader) {
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
        // 是可操作列就全选
        if (cell.operation) {
            this.selectAll();
            return;
        }
        const { SELECTOR_AREA_MIN_Y, SELECTOR_AREA_MAX_Y, SELECTOR_AREA_MAX_Y_OFFSET } = this.ctx.config;
        const minY = SELECTOR_AREA_MIN_Y;
        const maxY = SELECTOR_AREA_MAX_Y || this.ctx.maxRowIndex - SELECTOR_AREA_MAX_Y_OFFSET;
        if (this.ctx.mousedown && this.ctx.focusCellHeader) {
            const { colIndex } = this.ctx.focusCellHeader;
            //
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
        } else {
            // this.setFocusCellHeader(cell);
            const xArr = [cell.colIndex, cell.colIndex + cell.colspan - 1];
            const yArr = [minY, maxY];
            this.setSelector(xArr, yArr);
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
        const { value } = this.ctx.getSelectedData();

        const text = encodeToSpreadsheetStr(value);
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    // 处理复制线
                    this.ctx.selector.xArrCopy = this.ctx.selector.xArr.slice();
                    this.ctx.selector.yArrCopy = this.ctx.selector.yArr.slice();
                    this.ctx.emit('setCopy', this.ctx.selector);
                    this.ctx.emit('drawView');
                })
                .catch((error) => console.error('复制失败：', error));
        } else {
            console.error('当前浏览器不支持Clipboard API');
        }
    }
    private clearSelectedData(xArr: number[], yArr: number[], ignoreSet = false) {
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
                            value: null,
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
        this.ctx.emit('drawView');
        return changeList;
    }
    private paste() {
        if (!navigator.clipboard) {
            console.error('当前浏览器不支持Clipboard API');
            return;
        }
        const { ENABLE_PASTER } = this.ctx.config;
        if (this.ctx.selector.enable && ENABLE_PASTER) {
            const rowIndex = this.ctx.selector.yArr[0];
            const colIndex = this.ctx.selector.xArr[0];
            const rowKeyList: Set<string> = new Set();
            navigator.clipboard
                .readText()
                .then((val) => {
                    let textArr = decodeSpreadsheetStr(val);
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
                    // 批量设置数据，并记录历史
                    this.ctx.database.batchSetItemValue(changeList, true);
                    let rows: any[] = [];
                    rowKeyList.forEach((rowKey) => {
                        rows.push(this.ctx.database.getRowDataItemForRowKey(rowKey));
                    });
                    this.ctx.emit('pasteChange', changeList, rows);
                    // 清除复制线
                    this.clearCopyLine();
                    this.ctx.emit('drawView');
                })
                .catch((error) => {
                    console.error('获取剪贴板内容失败：', error);
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
        this.ctx.emit('drawView');
    }
    private stopAdjustPosition() {
        this.adjustPositionX = '';
        this.adjustPositionY = '';
        if (this.timerX) {
            clearInterval(this.timerX);
            this.timerX = 0;
        }
        if (this.timerY) {
            clearInterval(this.timerY);
            this.timerY = 0;
        }
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
     * 调整滚动条位置，让到达边界时自动滚动
     */
    private startAdjustPosition(e: MouseEvent) {
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        let positionX = '';
        let positionY = '';
        if (offsetX < 0) {
            positionX = 'left';
        } else if (offsetX > this.ctx.body.visibleWidth) {
            positionX = 'right';
        }
        if (offsetY < this.ctx.header.visibleHeight) {
            positionY = 'top';
        } else if (offsetY > this.ctx.header.visibleHeight + this.ctx.body.visibleHeight) {
            positionY = 'bottom';
        }
        if (positionX && this.adjustPositionX !== positionX) {
            this.adjustPositionX = positionX;
            const position = positionX === 'left' ? -1 : 1;
            let scrollSpeedX = 10 * position; // 滚动速度
            if (this.timerX) {
                clearInterval(this.timerX);
                this.timerX = 0;
            }
            this.timerX = setInterval(() => {
                // 增加滚动速度
                scrollSpeedX *= 1.5; // 加速因子
                const { scrollX } = this.ctx;
                const num = scrollX + scrollSpeedX;
                if (num < 0 || num > this.ctx.body.width) {
                    clearInterval(this.timerX);
                    this.timerX = 0;
                }
                this.ctx.setScrollX(num);
            }, 100); // 每100毫秒执行一次
        }

        if (positionY && this.adjustPositionY !== positionY) {
            this.adjustPositionY = positionY;
            const position = positionY === 'top' ? -1 : 1;
            let scrollSpeedY = 10 * position; // 滚动速度
            if (this.timerY) {
                clearInterval(this.timerY);
                this.timerY = 0;
            }
            this.timerY = setInterval(() => {
                // 增加滚动速度
                scrollSpeedY *= 1.5; // 加速因子
                const { scrollY } = this.ctx;
                const num = scrollY + scrollSpeedY;
                if (num < 0 || num > this.ctx.body.height) {
                    clearInterval(this.timerY);
                    this.timerY = 0;
                }
                this.ctx.setScrollY(num);
            }, 100); // 每100毫秒执行一次
        }
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
            scrollX,
            scrollY,
        } = this.ctx;
        if (!focusCell) {
            return;
        }
        // 格子大于可视高度不给滚动
        if (focusCell.height > stageHeight) {
            return;
        }
        const { SCROLLER_TRACK_SIZE = 0, FOOTER_FIXED } = this.ctx.config;
        let footerHeight = 0;
        if (FOOTER_FIXED) {
            footerHeight = footer.visibleHeight;
        }
        // 加1补选中框的边框,且可以移动滚动，以为getCell是获取渲染的cell
        const diffLeft = fixedLeftWidth - focusCell.drawX + 1;
        const diffRight = focusCell.drawX + focusCell.width - (stageWidth - fixedRightWidth) + 1;
        const diffTop = header.height - focusCell.drawY;
        const diffBottom = focusCell.drawY + focusCell.height - (stageHeight - footerHeight - SCROLLER_TRACK_SIZE);
        // 边界移动会导致重回，使事件无法冒泡，所以移动视图延时一下等待click事件冒泡后才执行draw

        if (this.adjustTimer) {
            clearTimeout(this.adjustTimer);
            this.adjustTimer = 0;
        }
        this.adjustTimer = setTimeout(() => {
            // 编辑状态不处理
            if (this.ctx.editing) {
                return;
            }
            // fixed禁用左右横向移动
            if (diffRight > 0 && !focusCell.fixed) {
                this.ctx.setScrollX(scrollX + diffRight);
            } else if (diffLeft > 0 && !focusCell.fixed) {
                this.ctx.setScrollX(scrollX - diffLeft);
            }
            if (diffTop > 0) {
                this.ctx.setScrollY(scrollY - diffTop);
            } else if (diffBottom > 0) {
                this.ctx.setScrollY(scrollY + diffBottom);
            }
        }, 167); // 每100毫秒执行一次
    }
    destroy() {
        if (this.timerX) {
            clearTimeout(this.timerX);
            this.timerX = 0;
        }
        if (this.timerY) {
            clearTimeout(this.timerY);
            this.timerY = 0;
        }
    }
}
