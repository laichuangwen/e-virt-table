import type Cell from './Cell';
import type Context from './Context';

export default class Editor {
    private editorEl!: HTMLDivElement;
    private inputEl!: HTMLTextAreaElement;
    private enable = false;
    private cellTarget: Cell | null = null;
    ctx: Context;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.initTextEditor();
        this.init();
    }
    private init() {
        // 滚动时，结束编辑
        this.ctx.on('onScroll', () => {
            if (this.enable) {
                this.doneEdit();
            }
        });
        this.ctx.on('cellHeaderMousedown', () => {
            if (this.enable) {
                this.doneEdit();
            }
            this.cellTarget = null;
        });
        this.ctx.on('keydown', (e) => {
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
                // "Enter",
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
            // 编辑模式按下按Enter进入编辑模式
            if (e.code === 'Enter' && !this.enable) {
                e.preventDefault();
                this.startEdit();
                return;
            }
            // 除了上面的建其他都开始编辑
            this.startEdit();
        });
        this.ctx.on('cellClick', (cell) => {
            if (cell.rowKey === this.cellTarget?.rowKey && cell.key === this.cellTarget?.key) {
                this.startEdit();
            } else {
                this.doneEdit();
                this.cellTarget = cell;
                // 单击单元格进入编辑模式
                if (this.ctx.config.ENABLE_EDIT_SINGLE_CLICK) {
                    this.startEdit();
                }
            }
        });
    }
    private initTextEditor() {
        // 初始化文本编辑器
        this.inputEl = document.createElement('textarea');
        this.inputEl.setAttribute('rows', '1');
        // 监听键盘事件
        this.inputEl.addEventListener('keydown', (e) => {
            if (!this.enable) {
                return;
            }
            e.stopPropagation();
            // 模拟excel  altKey enter换行
            if ((e.altKey || e.metaKey) && e.code === 'Enter') {
                e.preventDefault();
                // 插入换行符
                const cursorPos = this.inputEl.selectionStart; // 获取光标位置
                const textBefore = this.inputEl.value.substring(0, cursorPos); // 光标前的文本
                const textAfter = this.inputEl.value.substring(cursorPos); // 光标后的文本

                // 更新 textarea 的内容，在光标位置插入换行符
                this.inputEl.value = textBefore + '\n' + textAfter;

                // 设置光标位置到新行
                this.inputEl.selectionStart = this.inputEl.selectionEnd = cursorPos + 1;
                return;
            }
            if (e.code === 'Escape' || e.code === 'Enter') {
                e.preventDefault();
                this.inputEl.blur();
            }
        });
        // 监听输入事件，自动调整高度
        this.inputEl.addEventListener('input', function () {
            this.style.height = 'auto'; // 重置高度
            this.style.height = `${this.scrollHeight}px`; // 设置为内容的高度
        });
        this.inputEl.addEventListener('blur', () => {
            this.doneEdit();
        });
        this.editorEl = document.createElement('div');
        this.editorEl.className = 'e-virt-table-editor';
        this.inputEl.className = 'e-virt-table-editor-textarea';
        this.editorEl.appendChild(this.inputEl);
        // 父级阻止冒泡事件
        // 在捕获阶段全局监听所有事件类型
        const eventBrowserNames = this.ctx.getAllEventBrowserNames();
        eventBrowserNames.forEach((eventType) => {
            this.editorEl.addEventListener(eventType, (event) => {
                if (this.ctx.editing) {
                    event.stopPropagation();
                }
            });
        });
        this.ctx.targetContainer.appendChild(this.editorEl);
    }
    private startEditByInput(cell: Cell) {
        if (cell.editorType !== 'text') {
            return;
        }
        const value = cell.getValue();
        const { width } = cell;
        const drawX = cell.getDrawX();
        let drawY = cell.getDrawY();
        let { height } = cell;
        const { CELL_PADDING } = this.ctx.config;
        this.editorEl.style.left = `${drawX}px`;
        this.editorEl.style.top = `${drawY}px`;
        this.inputEl.style.minWidth = `${width - 1}px`;
        this.inputEl.style.minHeight = `${height - 1}px`;
        this.inputEl.style.maxHeight = `${this.ctx.body.visibleHeight - 1}px`;
        this.inputEl.style.width = `${width - 1}px`;
        this.inputEl.style.height = `${height - 1}px`;
        // this.inputEl.style.padding = `${CELL_PADDING}px`;
        if (value !== null) {
            this.inputEl.value = value;
        }
        this.inputEl.focus();
        const length = this.inputEl.value.length;
        this.inputEl.setSelectionRange(length, length);
        if (this.inputEl.scrollHeight > height) {
            this.inputEl.style.height = this.inputEl.scrollHeight + 'px';
        }
    }
    private doneEditByInput() {
        if (!this.cellTarget) {
            return;
        }
        // 如果不是是文本编辑器
        if (this.cellTarget.editorType !== 'text') {
            return;
        }
        const { rowKey, key } = this.cellTarget;
        const value = this.cellTarget.getValue();
        const textContent = this.inputEl.value;
        // !(text.textContent === '' && value === null)剔除点击编辑后未修改会把null变为''的情况
        if (textContent !== value && !(textContent === '' && value === null)) {
            this.ctx.database.setItemValue(rowKey, key, textContent, true, true, true);
        }
        this.inputEl.value = '';
        this.editorEl.style.left = `${-10000}px`;
        this.editorEl.style.top = `${-10000}px`;
    }
    startEdit() {
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
        const { rowKey, key } = focusCell;
        const readonly = this.ctx.database.getReadonly(rowKey, key);
        if (focusCell && !readonly) {
            this.enable = true;
            this.ctx.editing = true;
            this.cellTarget = focusCell;
            this.startEditByInput(this.cellTarget);
            this.ctx.emit('startEdit', this.cellTarget);
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
        }
    }
    doneEdit() {
        if (!this.enable) {
            return;
        }
        if (this.cellTarget) {
            this.ctx.emit('doneEdit', this.cellTarget);
            this.doneEditByInput();
            this.enable = false;
            this.ctx.target.focus();
            this.ctx.editing = false;
            this.cellTarget = null;
            this.ctx.emit('draw');
        }
    }
    destroy() {
        this.editorEl?.remove();
    }
}
