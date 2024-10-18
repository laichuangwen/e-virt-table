import { ChangeItem, Column, ConfigType, EventCallback, EVirtTableOptions, FilterMethod, Position } from './types';
import Context from './Context';
import Scroller from './Scroller';
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import Selector from './Selector';
import Autofill from './Autofill';
import Tooltip from './Tooltip';
import Editor from './Editor';
export default class VirtTable {
    private targetContainer: HTMLDivElement;
    private target: HTMLCanvasElement;
    private scroller: Scroller;
    private header: Header;
    private body: Body;
    private footer: Footer;
    private selector: Selector;
    private autofill: Autofill;
    private tooltip: Tooltip;
    private editor: Editor;
    ctx: Context;
    constructor(target: HTMLDivElement, options: EVirtTableOptions) {
        this.target = document.createElement('canvas');
        this.targetContainer = target;
        this.targetContainer.style.position = 'relative';
        this.targetContainer.appendChild(this.target);
        this.ctx = new Context(this.targetContainer, this.target, options);
        this.header = new Header(this.ctx);
        this.body = new Body(this.ctx);
        this.footer = new Footer(this.ctx);
        this.scroller = new Scroller(this.ctx);
        this.selector = new Selector(this.ctx);
        this.autofill = new Autofill(this.ctx);
        this.tooltip = new Tooltip(this.ctx);
        this.editor = new Editor(this.ctx);
        this.ctx.on('draw', this.draw.bind(this));
        this.draw();
    }
    draw() {
        requestAnimationFrame(() => {
            this.header.update();
            this.footer.update();
            this.body.update();
            this.ctx.paint.clear();
            this.body.draw();
            this.footer.draw();
            this.header.draw();
            this.scroller.draw();
        });
    }
    loadConfig(_config: ConfigType) {
        // this.config = { ...config, ..._config };
        // this.ctx.database.init();
        // this.ctx.emit("draw");
    }
    loadColumns(columns: Column[]) {
        // 先关闭编辑
        this.editor.doneEdit();
        this.ctx.database.setColumns(columns);
        this.header.init();
        this.ctx.emit('draw');
    }
    loadData(data: any[]) {
        // 先关闭编辑
        this.editor.doneEdit();
        this.ctx.database.setData(data);
        this.ctx.emit('draw');
    }
    loadFooterData(data: any[]) {
        this.ctx.database.setFooterData(data);
        this.ctx.emit('draw');
    }

    setLoading(ladong: boolean) {
        this.ctx.database.setLoading(ladong);
    }
    on(event: string, callback: EventCallback) {
        this.ctx.on(event, callback);
    }
    off(event: string, callback: EventCallback) {
        this.ctx.off(event, callback);
    }
    filterMethod(func: FilterMethod) {
        this.ctx.setScrollY(0);
        this.ctx.setScrollX(0);
        this.ctx.database.init();
        this.ctx.database.setFilterMethod(func);
        this.ctx.emit('draw');
    }
    setItemValue(rowKey: string, key: string, value: any, history = true, reDraw = true, isEditor = false) {
        this.ctx.database.setItemValue(rowKey, key, value, history, reDraw, isEditor);
    }
    batchSetItemValue(list: ChangeItem[], history = true, reDraw = true) {
        this.ctx.database.batchSetItemValue(list, history);
        if (reDraw) {
            this.ctx.emit('draw');
        }
    }
    setItemValueByEditor(rowKey: string, key: string, value: any, history = true, reDraw = true) {
        this.ctx.database.setItemValue(rowKey, key, value, history, reDraw, true);
        this.editor.doneEdit();
    }
    doLayout() {
        this.ctx.emit('draw');
    }
    getChangedData() {
        return this.ctx.database.getChangedData();
    }
    getChangedRows() {
        return this.ctx.database.getChangedRows();
    }
    clearValidate() {
        this.ctx.database.clearValidate();
        this.ctx.emit('draw');
    }
    async validate(scrollError = true) {
        // 先关闭编辑
        this.editor.doneEdit();
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.getValidations();
                resolve(res);
            } catch (errors) {
                // 滚动到错误位置，取第一个错误
                if (scrollError && Array.isArray(errors) && errors.length) {
                    const [err] = errors;
                    if (Array.isArray(err) && err.length) {
                        const [_err] = err;
                        const { rowKey, key } = _err;
                        this.scrollToRowkey(rowKey);
                        this.scrollToColkey(key);
                    }
                }
                reject(errors);
            }
        });
    }
    getValidations() {
        return new Promise(async (resolve, reject) => {
            const data = this.ctx.database.getAllRowsData();
            const leafCellHeaders = this.ctx.header.leafCellHeaders;
            let errors: any[] = [];
            for (let i = 0; i < data.length; i++) {
                for (let y = 0; y < leafCellHeaders.length; y++) {
                    const rowKey = this.ctx.database.getRowKeyByItem(data[i]);
                    const leafCellHeader = leafCellHeaders[y];
                    const key = leafCellHeader.key;
                    const _errors = await this.ctx.database.getValidator(rowKey, key);
                    if (Array.isArray(_errors) && _errors.length) {
                        errors.push(_errors);
                    }
                }
            }
            if (errors.length) {
                reject(errors);
                this.ctx.emit('draw');
            } else {
                resolve([]);
                this.ctx.emit('draw');
            }
        });
    }
    scrollTo(x: number, y: number) {
        this.scrollXTo(x);
        this.scrollYTo(y);
    }

    scrollXTo(x: number) {
        this.ctx.setScrollX(x);
    }

    scrollToColkey(key: string) {
        this.scroller.scrollToColkey(key);
    }
    scrollToRowkey(key: string) {
        this.scroller.scrollToRowKey(key);
    }
    scrollToColIndex(colIndex: number) {
        this.scroller.scrollToColIndex(colIndex);
    }
    scrollToRowIndex(rowIndex: number) {
        this.scroller.scrollToRowIndex(rowIndex);
    }
    scrollYTo(y: number) {
        this.ctx.setScrollY(y);
    }
    clearSelection() {
        this.ctx.database.clearSelection();
        this.ctx.emit('draw');
    }
    toggleRowSelection(row: any) {
        const rowKey = this.ctx.database.getRowKeyByItem(row);
        this.ctx.database.toggleRowSelection(rowKey);
        this.ctx.emit('draw');
    }
    setSelectionByRows(rows: any[], selected = true) {
        rows.forEach((row) => {
            const rowKey = this.ctx.database.getRowKeyByItem(row);
            this.ctx.database.setRowSelection(rowKey, selected);
        });
        this.ctx.emit('selectionChange', this.getSelectionRows());
        this.ctx.emit('draw');
    }
    setSelectionByRowKeys(keys: string[], selected = true) {
        keys.forEach((key) => {
            this.ctx.database.setRowSelection(key, selected);
        });
        this.ctx.emit('selectionChange', this.getSelectionRows());
        this.ctx.emit('draw');
    }
    toggleAllSelection() {
        this.ctx.database.toggleAllSelection();
        this.ctx.emit('draw');
    }
    getSelectionRows() {
        return this.ctx.database.getSelectionRows();
    }
    getPositionForRowIndex(rowIndex: number): Position {
        return this.ctx.database.getPositionForRowIndex(rowIndex);
    }
    /**
     * 销毁
     */
    destroy() {
        this.editor.destroy();
        this.tooltip.destroy();
        this.selector.destroy();
        this.autofill.destroy();
        this.ctx.destroy();
        this.target.remove();
        console.log('销毁');
    }
}
