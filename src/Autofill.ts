import type Context from './Context';
import type Cell from './Cell';
import { BeforeSetAutofillMethod, ErrorType } from './types';
export default class Autofill {
    private ctx: Context;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }
    private init() {
        this.ctx.on('cellMouseenter', (cell, e) => {
            if (this.ctx.stageElement.style.cursor === 'crosshair') {
                this.ctx.stageElement.style.cursor = 'default';
            }
            const { offsetX, offsetY } = this.ctx.getOffset(e);
            const { xArr, yArr } = this.ctx.selector;
            const maxX = xArr[1];
            const maxY = yArr[1];
            const { colIndex, rowIndex, drawX, drawY, width, height } = cell;
            // 绘制自动填充点
            if (this.ctx.config.ENABLE_AUTOFILL && colIndex === maxX && rowIndex === maxY) {
                const pointWh = 6;
                const pointX = drawX + width - pointWh;
                const pointY = drawY + height - pointWh;
                if (offsetX > pointX && offsetY > pointY) {
                    // 引进到点
                    this.ctx.stageElement.style.cursor = 'crosshair';
                }
            }
            this.mouseenter(cell);
        });
        this.ctx.on('cellMousedown', () => {
            if (this.ctx.stageElement.style.cursor === 'crosshair') {
                this.setMousedown();
            }
        });
        this.ctx.on('mouseup', () => {
            this.setMouseUp();
        });
    }
    /**
     * 是否在填充
     * @returns
     */
    private isAutofillIng() {
        const { xArr, yArr } = this.ctx.selector;
        // 两个相等
        if (
            JSON.stringify(this.ctx.autofill.xArr) === JSON.stringify(xArr) &&
            JSON.stringify(this.ctx.autofill.yArr) === JSON.stringify(yArr)
        ) {
            return false;
        }
        return true;
    }
    private setMousedown() {
        this.ctx.autofill.enable = true;
        this.ctx.autofillMove = true;
    }
    private setMouseUp() {
        if (!this.ctx.autofill.enable) {
            return;
        }
        const isAutofillIng = this.isAutofillIng();
        if (isAutofillIng) {
            this.autofillData();
        }
        this.ctx.autofill.enable = false;
        this.ctx.autofillMove = false;
        this.ctx.autofill.xArr = [-1, -1];
        this.ctx.autofill.yArr = [-1, -1];
    }
    private setAutofill(xArr: number[], yArr: number[]) {
        const { ENABLE_AUTOFILL, ENABLE_SELECTOR_SPAN_COL, ENABLE_SELECTOR_SPAN_ROW } = this.ctx.config;
        if (!ENABLE_AUTOFILL) {
            return;
        }
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
            JSON.stringify(this.ctx.autofill.xArr) !== JSON.stringify(_xArr) ||
            JSON.stringify(this.ctx.autofill.yArr) !== JSON.stringify(_yArr)
        ) {
            // 范围值和选择器的一致
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
            if (minY < areaMinY) {
                return;
            }
            _xArr = [Math.max(areaMinX, minX), Math.min(areaMaxX, maxX)];
            _yArr = [Math.max(areaMinY, minY), Math.min(areaMaxY, maxY)];
            // 调整选择器的位置前回调
            const { BEFORE_SET_AUTOFILL_METHOD } = this.ctx.config;
            if (typeof BEFORE_SET_AUTOFILL_METHOD === 'function') {
                const beforeSetAutofillMethod: BeforeSetAutofillMethod = BEFORE_SET_AUTOFILL_METHOD;
                const res = beforeSetAutofillMethod({
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
            this.ctx.autofill.xArr = _xArr;
            this.ctx.autofill.yArr = _yArr;
            this.ctx.emit('setAutofill', this.ctx.autofill);
            this.ctx.emit('draw');
        }
    }
    /**
     * 填充数据
     */
    private async autofillData() {
        const rowKeyList: Set<string> = new Set();
        const selector = this.ctx.getSelectedData();
        // 存复制赋值的位置,用于剔除填充
        const selectorIndexMap = new Map();
        for (let ri = 0; ri <= selector.yArr[1] - selector.yArr[0]; ri++) {
            for (let ci = 0; ci <= selector.xArr[1] - selector.xArr[0]; ci++) {
                const rowIndex = ri + selector.yArr[0];
                const colIndex = ci + selector.xArr[0];
                selectorIndexMap.set(`${rowIndex}-${colIndex}`, true);
            }
        }
        const { value } = selector;
        const xStep = value[0].length;
        const yStep = value.length;
        const xArr = this.ctx.autofill.xArr;
        const yArr = this.ctx.autofill.yArr;
        const isOneValue = xStep === 1 && yStep === 1;
        // 禁用跨越填充
        if (this.ctx.config.ENABLE_MERGE_CELL_LINK && this.ctx.database.hasMergeCell(xArr, yArr) && !isOneValue) {
            const err: ErrorType = {
                code: 'ERR_MERGED_CELLS_AUTOFILL',
                message: 'Merged cells cannot span autofill data',
            };
            if (this.ctx.hasEvent('error')) {
                this.ctx.emit('error', err);
            } else {
                alert(err.message);
            }
            return;
        }
        let changeList = [];
        for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
            for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
                const colIndex = ci + xArr[0];
                const rowIndex = ri + yArr[0];
                const val = value[ri % yStep][ci % xStep];
                const itemValue = this.ctx.database.getItemValueForRowIndexAndColIndex(rowIndex, colIndex);
                const selectorIndexKey = `${rowIndex}-${colIndex}`;
                if (itemValue && !selectorIndexMap.has(selectorIndexKey)) {
                    const { rowKey, key } = itemValue;
                    // 只读就跳过
                    if (!this.ctx.database.getReadonly(rowKey, key)) {
                        rowKeyList.add(rowKey);
                        changeList.push({
                            rowKey,
                            key,
                            value: val,
                            row: {},
                        });
                    }
                }
            }
        }
        // 没有变化就返回
        if (!changeList.length) {
            return;
        }
        // 设置选择器为填充位置
        this.ctx.selector.xArr = this.ctx.autofill.xArr;
        this.ctx.selector.yArr = this.ctx.autofill.yArr;
        // 填充内容改变前回调
        const { BEFORE_AUTOFILL_DATA_METHOD } = this.ctx.config;
        if (typeof BEFORE_AUTOFILL_DATA_METHOD === 'function') {
            const beforeAutofillDataMethod = BEFORE_AUTOFILL_DATA_METHOD;
            const _changeList = changeList.map((item) => ({
                rowKey: item.rowKey,
                key: item.key,
                value: item.value,
                oldValue: this.ctx.database.getItemValue(item.rowKey, item.key),
                row: this.ctx.database.getRowDataItemForRowKey(item.rowKey),
            }));
            changeList = await beforeAutofillDataMethod(_changeList, xArr, yArr);
            if (changeList && !changeList.length) {
                return;
            }
        }
        // 批量设置数据，并记录历史
        this.ctx.batchSetItemValueByEditor(changeList, true);
        let rows: any[] = [];
        rowKeyList.forEach((rowKey) => {
            rows.push(this.ctx.database.getRowDataItemForRowKey(rowKey));
        });
        this.ctx.emit('autofillChange', changeList, rows);
    }
    private mouseenter(cell: Cell) {
        if (['index', 'selection', 'index-selection'].includes(cell.type)) {
            return;
        }
        const { selector, autofill } = this.ctx;
        if (this.ctx.mousedown && selector.enable && autofill.enable) {
            const { rowIndex, colIndex } = cell;
            const xArr = selector.xArr.slice();
            const yArr = selector.yArr.slice();
            if (rowIndex >= selector.yArr[0] && rowIndex <= selector.yArr[1]) {
                if (colIndex > selector.xArr[1]) {
                    xArr.splice(1, 1, colIndex);
                } else if (colIndex < selector.xArr[0]) {
                    xArr.splice(0, 1, colIndex);
                }
            } else if (rowIndex > selector.yArr[1]) {
                yArr.splice(1, 1, rowIndex);
            } else if (rowIndex < selector.yArr[0]) {
                yArr.splice(0, 1, rowIndex);
            }
            this.setAutofill(xArr, yArr);
        }
    }
    destroy() {}
}
