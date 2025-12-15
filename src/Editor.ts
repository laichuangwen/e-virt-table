import type Cell from './Cell';
import type Context from './Context';

export default class Editor {
    private editorEl!: HTMLDivElement;
    private inputEl!: HTMLTextAreaElement;
    private enable = false;
    private cellTarget: Cell | null = null;
    private selectorArrStr = '';
    ctx: Context;
    private drawY = 0;
    private drawX = 0;
    private cancel = false;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.initTextEditor();
        this.init();
    }
    private init() {
        // 容器不聚焦，清除选择器
        this.ctx.on('outsideMousedown', () => {
            if (!this.cellTarget) {
                return;
            }
            if (this.cellTarget.editorType === 'text') {
                this.clearEditor();
            }
        });
        this.ctx.on('moveFocus', (cell) => {
            this.cellTarget = cell;
            const { xArr, yArr } = this.ctx.selector;
            this.selectorArrStr = JSON.stringify(xArr) + JSON.stringify(yArr);
        });
        // 滚动时，结束编辑
        this.ctx.on('onScroll', () => {
            if (this.enable) {
                this.doneEdit();
            }
        });
        this.ctx.on('hoverIconClick', (cell) => {
            if (this.ctx.disableHoverIconClick) {
                return;
            }
            this.editCell(cell.rowIndex, cell.colIndex);
        });
        this.ctx.on('cellMousedown', () => {
            this.inputEl.focus({ preventScroll: true });
        });
        this.ctx.on('keydown', (e) => {
            if (!this.ctx.isTarget(e)) {
                return;
            }
            if (!this.ctx.focusCell) {
                return;
            }
            if (this.ctx.finding) {
                return;
            }
            if (e.code === 'Escape' && this.ctx.editing) {
                this.cancel = true;
                const { focusCell } = this.ctx;
                if (focusCell) {
                    this.ctx.emit('setSelectorCell', focusCell);
                    this.cellTarget = focusCell;
                }
                this.doneEdit();
                return;
            }
            if ((e.altKey || e.metaKey) && e.key === 'Enter' && this.ctx.editing && this.inputEl) {
                e.preventDefault();
                const cursorPos = this.inputEl.selectionStart; // 获取光标位置
                const textBefore = this.inputEl.value.substring(0, cursorPos); // 光标前的文本
                const textAfter = this.inputEl.value.substring(cursorPos); // 光标后的文本
                // 更新 textarea 的内容，在光标位置插入换行符
                this.inputEl.value = textBefore + '\n' + textAfter;
                // 设置光标位置到新行
                this.inputEl.selectionStart = this.inputEl.selectionEnd = cursorPos + 1;
                this.autoSize();
                return;
            }
            if (e.code === 'Tab' && this.ctx.editing) {
                e.preventDefault();
                this.doneEdit();
                if (e.shiftKey) {
                    this.ctx.emit('setMoveFocus', 'LEFT');
                    return;
                }
                this.ctx.emit('setMoveFocus', 'RIGHT');
                return;
            }
            if (e.key === 'Enter' && this.ctx.editing) {
                e.preventDefault();
                this.doneEdit();
                if (e.shiftKey) {
                    this.ctx.emit('setMoveFocus', 'TOP');
                    return;
                }
                this.ctx.emit('setMoveFocus', 'BOTTOM');
                return;
            }
            if (e.key === 'Enter' && !this.ctx.editing) {
                e.preventDefault();
                this.startEdit();
                return;
            }
            const key = e.key;
            const isCtrl = e.ctrlKey;
            const isAlt = e.altKey;
            const isShift = e.shiftKey;
            const isMeta = e.metaKey;
            // 检测是否按下了组合键（Ctrl、Alt、Shift、Meta）
            if (isCtrl || isAlt || isShift || isMeta) {
                return;
            }
            // 检测功能键（比如 F1, Escape,Tab 等）
            const functionKeys = [
                'Enter',
                'Escape',
                'Tab',
                'Backspace',
                'Delete',
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
                'Home',
                'End',
                'PageUp',
                'PageDown',
                'Insert',
                'F1',
                'F2',
                'F3',
                'F4',
                'F5',
                'F6',
                'F7',
                'F8',
                'F9',
                'F10',
                'F11',
                'F12',
            ];
            if (functionKeys.includes(key)) {
                return;
            }
            this.startEdit(true);
        });
        // 重绘可能会导致cellClick事件不能触发，调整用按下cellMouseup按下延时赋值cellTarget
        this.ctx.on('cellMouseup', (cell: Cell) => {
            // 如果是选择器，不进入编辑模式
            if (this.ctx.isPointer) {
                return;
            }
            // 不在区域内
            if (!this.isInSelectorRange(cell.rowIndex, cell.colIndex)) {
                return;
            }
            const { xArr, yArr } = this.ctx.selector;
            const selectorArrStr = JSON.stringify(xArr) + JSON.stringify(yArr);
            if (this.selectorArrStr === selectorArrStr && this.cellTarget) {
                // 启用合并单元格关联&&只有合并单元格时才进入编辑模式
                if (this.ctx.config.ENABLE_MERGE_CELL_LINK && this.ctx.onlyMergeCell) {
                    this.startEdit();
                    return;
                }
                // 只有一个的情况下才进入编辑模式
                if (
                    this.ctx.selectOnlyOne &&
                    cell.rowKey === this.cellTarget.rowKey &&
                    cell.key === this.cellTarget.key
                ) {
                    this.startEdit();
                    return;
                }
            }
            this.selectorArrStr = selectorArrStr;
            this.doneEdit();
            this.cellTarget = cell;
            // 单击单元格进入编辑模式
            if (this.ctx.config.ENABLE_EDIT_SINGLE_CLICK) {
                // 启用合并单元格关联&&只有合并单元格时才进入编辑模式
                if (this.ctx.config.ENABLE_MERGE_CELL_LINK && this.ctx.onlyMergeCell) {
                    this.startEdit();
                    return;
                }
                // 只有一个的情况下才进入编辑模式
                if (this.ctx.selectOnlyOne) {
                    this.startEdit();
                }
            }
        });
        this.ctx.on('mousedownBodyOutside', () => {
            if (this.enable) {
                this.doneEdit();
            }
            this.cellTarget = null;
        });
    }
    private isInSelectorRange(rowIndex: number, colIndex: number) {
        const { xArr, yArr } = this.ctx.selector;
        const [minX, maxX] = xArr;
        const [minY, maxY] = yArr;
        if (colIndex < minX) {
            return false;
        }
        if (colIndex > maxX) {
            return false;
        }
        if (rowIndex < minY) {
            return false;
        }
        if (rowIndex > maxY) {
            return false;
        }
        return true;
    }
    private initTextEditor() {
        // 初始化文本编辑器
        this.inputEl = document.createElement('textarea');
        this.inputEl.id = 'e-virt-table-editor-textarea';
        this.inputEl.setAttribute('rows', '1');
        this.inputEl.setAttribute('tabindex', '-1');
        // 监听输入事件，自动调整高度
        this.inputEl.addEventListener('input', this.autoSize.bind(this));
        this.editorEl = this.ctx.editorElement;
        this.inputEl.className = 'e-virt-table-editor-textarea';
        this.editorEl.appendChild(this.inputEl);
        this.ctx.containerElement.appendChild(this.editorEl);
    }
    private autoSize() {
        // 针对数字类型提示错误信息
        const value = this.inputEl.value;
        if (this.cellTarget && this.cellTarget.type === 'number' && value !== '') {
            this.ctx.emit('cellHideTooltip');
            if (!/^-?\d+(\.\d+)?$/.test(value)) {
                this.ctx.emit('cellShowTooltip', this.cellTarget, this.ctx.config.NUMBER_ERROR_TIP);
            }
        }
        this.inputEl.style.height = 'auto'; // 重置高度
        let scrollHeight = this.inputEl.scrollHeight;
        let maxHeight = this.ctx.body.visibleHeight;
        if (scrollHeight > maxHeight) {
            scrollHeight = maxHeight;
        }
        const {
            stageHeight,
            footer,
            header,
            config: { SCROLLER_TRACK_SIZE },
        } = this.ctx;
        const bottomY = stageHeight - footer.height - SCROLLER_TRACK_SIZE;
        this.editorEl.style.bottom = `auto`;
        if (this.drawY < header.height) {
            this.editorEl.style.top = `${header.height - 1}px`;
        }
        if (this.drawY + scrollHeight > bottomY) {
            this.editorEl.style.left = `${this.drawX - 1}px`;
            this.editorEl.style.top = `auto`;
            this.editorEl.style.bottom = `${stageHeight - bottomY}px`;
        }
        this.inputEl.style.height = `${scrollHeight}px`; // 设置为内容的高度
    }
    private startEditByInput(cell: Cell, ignoreValue = false) {
        const value = ignoreValue ? null : cell.getValue();
        const { editorType } = cell;
        // 没有编辑器的情况下不进入编辑模式
        if (editorType === 'none') {
            return;
        }
        cell.update(); // 更新单元格信息
        if (this.ctx.config.ENABLE_MERGE_CELL_LINK) {
            cell.updateSpanInfo(); // 更新合并单元格信息
        }
        let { height, width, drawY, drawX } = cell;
        this.drawX = drawX;
        this.drawY = drawY;
        const {
            config: { CELL_PADDING },
            header,
        } = this.ctx;
        let maxHeight = this.ctx.body.visibleHeight;
        if (height > maxHeight) {
            height = maxHeight;
        }
        // 显示编辑器
        this.editorEl.style.display = 'inline-block';
        this.editorEl.style.zIndex = '100';
        this.editorEl.style.left = `${this.drawX - 1}px`;
        this.editorEl.style.top = `${this.drawY - 1}px`;
        this.editorEl.style.bottom = `auto`;
        this.editorEl.style.maxHeight = `${maxHeight}px`;
        if (editorType === 'text') {
            this.inputEl.style.display = 'inline-block';
            this.inputEl.style.minWidth = `${width - 1}px`;
            this.inputEl.style.minHeight = `${height - 1}px`;
            this.inputEl.style.maxHeight = `${maxHeight}px`;
            this.inputEl.style.width = `${width - 1}px`;
            this.inputEl.style.height = `auto`;
            this.inputEl.style.padding = `${CELL_PADDING}px`;
            this.inputEl.value = ''; // 清空
            if (value !== null) {
                this.inputEl.value = value;
                this.inputEl.focus({ preventScroll: true });
            }
        } else {
            this.inputEl.style.display = 'none';
        }

        if (this.inputEl.scrollHeight > height || this.drawY < header.height) {
            this.autoSize();
        }
    }
    private doneEditByInput() {
        if (!this.cellTarget) {
            return;
        }
        // 如果是文本编辑器
        if (this.cellTarget.editorType === 'text') {
            const { rowKey, key } = this.cellTarget;
            const value = this.cellTarget.getValue();
            const textContent = this.inputEl.value;
            // !(text.textContent === '' && value === null)剔除点击编辑后未修改会把null变为''的情况
            if (textContent !== value && !(textContent === '' && value === null) && !this.cancel) {
                this.ctx.setItemValueByEditor(rowKey, key, textContent, true);
                // this.cellTarget.setValue(textContent);
            }
        }
    }
    startEdit(ignoreValue = false) {
        this.cancel = false;
        // 如果不启用点击选择器编辑
        const { ENABLE_EDIT_CLICK_SELECTOR } = this.ctx.config;
        if (!ENABLE_EDIT_CLICK_SELECTOR) {
            return;
        }
        const focusCell = this.ctx.focusCell;
        if (!focusCell) {
            return;
        }

        // 如果是index或者index-selection,selection类型的单元格，不允许编辑
        if (['index', 'index-selection', 'selection'].includes(focusCell.type)) {
            return;
        }
        if (this.enable) {
            return;
        }
        // 可视区可见
        const isVisible = focusCell.isVerticalVisible() && focusCell.isHorizontalVisible();
        if (!isVisible) {
            return;
        }
        const { rowKey, key } = focusCell;

        const readonly = this.ctx.database.getReadonly(rowKey, key);
        if (focusCell && !readonly) {
            this.enable = true;
            this.ctx.editing = true;
            this.cellTarget = focusCell;
            this.startEditByInput(this.cellTarget, ignoreValue);
            this.ctx.emit('startEdit', this.cellTarget);
            // 触发绘制，刷新
            this.ctx.emit('draw');
        }
    }
    editCell(rowIndex: number, colIndex: number) {
        const row = this.ctx.body.renderRows.find((row) => row.rowIndex === rowIndex);
        if (!row) {
            return;
        }
        const cell = row.cells.find((cell: Cell) => cell.colIndex === colIndex);
        if (!cell) {
            return;
        }
        this.ctx.emit('setSelectorCell', cell);
        const focusCell = this.ctx.focusCell;
        if (!focusCell) {
            return;
        }
        // 如果是index或者index-selection,selection类型的单元格，不允许编辑
        if (['index', 'index-selection', 'selection'].includes(focusCell.type)) {
            return;
        }
        if (this.enable) {
            return;
        }
        const { rowKey, key } = focusCell;
        const readonly = this.ctx.database.getReadonly(rowKey, key);
        if (focusCell && !readonly) {
            this.enable = true;
            this.ctx.editing = true;
            this.cellTarget = focusCell;
            this.startEditByInput(this.cellTarget);
            this.ctx.emit('startEdit', this.cellTarget);
            // 触发绘制，刷新
            this.ctx.emit('draw');
        }
    }
    doneEdit() {
        if (!this.enable) {
            return;
        }
        const {
            header,
            config: { CELL_HEIGHT },
        } = this.ctx;
        this.doneEditByInput();
        this.ctx.emit('cellHideTooltip');
        this.ctx.emit('doneEdit', this.cellTarget);
        this.enable = false;
        this.ctx.editing = false;
        this.inputEl.style.display = 'inline-block';
        this.editorEl.style.left = '0px';
        this.editorEl.style.top = `${header.height}px`;
        this.editorEl.style.maxHeight = `${CELL_HEIGHT}px`;
        this.editorEl.style.zIndex = '-1';
        setTimeout(() => {
            this.inputEl.focus({ preventScroll: true });
        }, 0);
        this.ctx.emit('draw');
    }
    clearEditor() {
        this.doneEdit();
        this.cellTarget = null;
        this.selectorArrStr = '';
        this.ctx.clearSelector();
        this.ctx.focusCell = undefined;
        this.ctx.emit('draw');
    }
    destroy() {
        this.editorEl?.remove();
    }
}
