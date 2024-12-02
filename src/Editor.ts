import type Cell from './Cell';
import type Context from './Context';

export default class Editor {
    private editorEl!: HTMLDivElement;
    private inputEl!: HTMLDivElement;
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
        const { CSS_PREFIX, SELECT_BORDER_COLOR } = this.ctx.config;
        this.inputEl = document.createElement('div');
        // 监听键盘事件
        this.inputEl.addEventListener('keydown', (e) => {
            if (!this.enable) {
                return;
            }
            // 模拟excel  altKey enter换行
            if ((e.altKey || e.metaKey) && e.code === 'Enter') {
                e.preventDefault();
                const inputEl = this.inputEl;
                const selection = window.getSelection();
                if (!inputEl || !selection) return;
                if (!selection.rangeCount) return; // 如果没有选区，直接返回
                const range = selection.getRangeAt(0); // 获取光标所在的 Range
                // 如果光标已经在内容的最后
                const isAtEnd = range.startContainer === inputEl && range.startOffset === inputEl.childNodes.length;
                if (isAtEnd) {
                    // 直接追加换行符到内容末尾
                    inputEl.textContent += '\n\n';
                    selection.selectAllChildren(this.inputEl); // 清除选区并选择指定节点的所有子节点
                    selection.collapseToEnd(); // 光标移至最后
                } else {
                    // 中间插入换行符的情况
                    // 创建换行符的文本节点
                    const newLine = document.createTextNode('\n');
                    range.insertNode(newLine); // 在光标位置插入换行符
                    range.setStartAfter(newLine); // 将光标移到新换行符之后
                    range.collapse(false); // 折叠到插入点末尾
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                return;
            }
            if (e.code === 'Escape' || e.code === 'Enter') {
                e.preventDefault();
                this.inputEl.blur();
            }
        });
        this.inputEl.addEventListener('blur', () => {
            this.doneEdit();
        });
        this.editorEl = document.createElement('div');
        this.editorEl.className = `${CSS_PREFIX}-self-editor`;
        this.inputEl.className = `${CSS_PREFIX}-self-editor-input`;
        const editorStyle = {
            position: 'absolute',
            top: '-10000px',
            left: '-10000px',
            textAlign: 'left',
            lineHeight: '0',
            zIndex: 100,
            overflow: 'hidden',
            backgroundColor: '#fff',
            border: `2px solid ${SELECT_BORDER_COLOR}`,
            boxSizing: 'border-box',
            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 6px 16px',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
        };
        Object.assign(this.editorEl.style, editorStyle);
        const inputStyle = {
            width: '100%',
            boxSizing: 'border-box',
            padding: '8px',
            outline: 'none',
            fontWeight: '400',
            fontSize: '12px',
            color: 'inherit',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            wordBreak: 'break-all',
            lineHeight: '18px',
            margin: '0',
            background: '#fff',
            cursor: 'text',
        };
        Object.assign(this.inputEl.style, inputStyle);
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox'); // 判断是否是火狐浏览器
        // https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/contenteditable
        this.inputEl.contentEditable = isFirefox ? 'true' : 'plaintext-only';
        this.editorEl.appendChild(this.inputEl);
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
        if (cell.height > this.ctx.body.visibleHeight) {
            height = this.ctx.body.visibleHeight;
            drawY = this.ctx.header.visibleHeight;
        }
        const { CELL_PADDING } = this.ctx.config;
        this.editorEl.style.left = `${drawX}px`;
        this.editorEl.style.top = `${drawY}px`;
        this.inputEl.style.minWidth = `${width - 1}px`;
        this.inputEl.style.minHeight = `${height - 1}px`;
        this.inputEl.style.padding = `${CELL_PADDING}px`;
        if (value !== null) {
            this.inputEl.textContent = value;
        }
        this.inputEl.focus();
        const selection = window.getSelection(); // 创建selection
        selection?.selectAllChildren(this.inputEl); // 清除选区并选择指定节点的所有子节点
        selection?.collapseToEnd(); // 光标移至最后
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
        const textContent = this.inputEl.textContent;
        // !(text.textContent === '' && value === null)剔除点击编辑后未修改会把null变为''的情况
        if (textContent !== value && !(textContent === '' && value === null)) {
            this.ctx.database.setItemValue(rowKey, key, textContent, true, true, true);
        }
        this.inputEl.textContent = null;
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
    destroy() {}
}
