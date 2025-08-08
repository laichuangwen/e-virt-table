import type CellHeader from './CellHeader';
import Validator, { RuleParam, ValidateResult } from './Validator';
import type Context from './Context';
import type {
    CellReadonlyMethod,
    CellRulesMethod,
    ChangeItem,
    Column,
    FilterMethod,
    Position,
    SelectableMethod,
    EVirtTableOptions,
    BeforeCellValueChangeMethod,
    SpanInfo,
    SelectionMap,
    ErrorType,
    BeforeChangeItem,
    HistoryAction,
    BeforeValueChangeItem,
} from './types';
import { generateShortUUID, toLeaf } from './util';
import { HistoryItemData } from './History';
import Cell from './Cell';
export default class Database {
    private loading = false;
    private ctx: Context;
    private data: any[];
    private columns: Column[];
    private footerData: any[] = [];
    private rowKeyMap = new Map<string, any>();
    private colIndexKeyMap = new Map<number, string>();
    private headerMap = new Map<string, CellHeader>();
    private rowIndexRowKeyMap = new Map<number, string>();
    private rowKeyRowIndexMap = new Map<string, number>();
    private checkboxKeyMap = new Map<string, string[]>();
    private selectionMap = new Map<string, SelectionMap>();
    private expandMap = new Map<string, boolean>();
    private originalDataMap = new Map<string, any>();
    private changedDataMap = new Map<string, any>();
    private validationErrorMap = new Map<string, ValidateResult>();
    private itemRowKeyMap = new WeakMap();
    private bufferData: any[] = [];
    private bufferCheckState = {
        buffer: false,
        check: false,
        indeterminate: false,
        selectable: true,
    };
    private sumHeight = 0;
    private filterMethod: FilterMethod | undefined;
    private positions: Position[] = []; //虚拟滚动位置
    constructor(ctx: Context, options: EVirtTableOptions) {
        this.ctx = ctx;
        const { data = [], columns = [], footerData = [] } = options;
        this.data = data;
        this.footerData = footerData;
        this.columns = columns;
        this.setLoading(true);
        this.init();
    }
    // 初始化默认不忽略清空改变值和校验map
    init(isClear = true) {
        this.clearBufferData();
        this.rowKeyMap.clear();
        this.checkboxKeyMap.clear();
        this.colIndexKeyMap.clear();
        this.rowIndexRowKeyMap.clear();
        this.rowKeyRowIndexMap.clear();
        // 判断是否有选择和树形结构
        const _columns = this.getColumns();
        const leafColumns = toLeaf(_columns);
        this.ctx.hasSelection = leafColumns.some((item) => item.type === 'selection');
        this.ctx.hasTree = leafColumns.some((item) => item.type === 'tree');
        if (isClear) {
            this.originalDataMap.clear();
            this.changedDataMap.clear();
            this.validationErrorMap.clear();
            const { ROW_KEY } = this.ctx.config;
            // 清除选中和展开状态，如果没有ROW_KEY清除
            if (!ROW_KEY) {
                // 无行主键时直接清除所有状态
                this.selectionMap.clear();
                this.expandMap.clear();
            } else {
                // 有行主键，根据上下文条件清除部分状态
                if (!this.ctx.hasSelection) {
                    this.selectionMap.clear();
                }
                if (!this.ctx.hasTree) {
                    this.expandMap.clear();
                }
            }
        }
        this.itemRowKeyMap = new WeakMap();
        this.initData(this.data);
        this.getData();
        this.bufferCheckState.buffer = false;
    }
    /**
     * 清除缓存数据
     */
    clearBufferData() {
        this.bufferData = [];
    }
    /**
     * 初始化数据
     * @param dataList
     * @param level
     */
    private initData(dataList: any[], level: number = 0, parentRowKeys: string[] = []) {
        dataList.forEach((item, index) => {
            const { ROW_KEY = '', DEFAULT_EXPAND_ALL, CELL_HEIGHT, SELECTABLE_METHOD, CHECKBOX_KEY } = this.ctx.config;
            const _rowKey = item[ROW_KEY]; // 行唯一标识,否则就rowKey
            const rowKey = _rowKey !== undefined && _rowKey !== null ? `${_rowKey}` : generateShortUUID();
            this.itemRowKeyMap.set(item, rowKey);
            const height = item._height || CELL_HEIGHT;
            const readonly = item._readonly;
            let selectable: SelectableMethod | boolean = true;
            if (typeof SELECTABLE_METHOD === 'function') {
                const selectableMethod: SelectableMethod = SELECTABLE_METHOD;
                selectable = selectableMethod;
            }
            // 存储checkboxKey，处理合并单元格选中
            if (CHECKBOX_KEY) {
                const checkboxKey = item[CHECKBOX_KEY];
                if (this.checkboxKeyMap.has(checkboxKey)) {
                    const checkboxKeys = this.checkboxKeyMap.get(checkboxKey) || [];
                    checkboxKeys.push(rowKey);
                    this.checkboxKeyMap.set(checkboxKey, checkboxKeys);
                } else {
                    this.checkboxKeyMap.set(checkboxKey, [rowKey]);
                }
            }
            // 存key
            this.selectionMap.set(rowKey, {
                key: CHECKBOX_KEY ? item[CHECKBOX_KEY] : rowKey,
                row: item,
                check: this.selectionMap.get(rowKey)?.check || false,
            });
            const expand = DEFAULT_EXPAND_ALL || this.expandMap.get(rowKey) || item._expand || false;
            this.expandMap.set(rowKey, expand);
            this.rowKeyMap.set(rowKey, {
                readonly,
                index,
                rowIndex: index,
                level,
                height,
                check: false,
                selectable,
                expand,
                expandLazy: false,
                hasChildren: item._hasChildren || (Array.isArray(item.children) ? item.children.length > 0 : false),
                expandLoading: false,
                item,
                parentRowKeys,
            });
            if (Array.isArray(item.children)) {
                if (item.children.length) {
                    this.initData(item.children, level + 1, [...parentRowKeys, rowKey]);
                }
            }
        });
    }
    /**
     *
     * @param rowKey 设置Row高度
     * @param height
     */
    setRowHeight(rowIndex: number, height: number) {
        const rowKey = this.rowIndexRowKeyMap.get(rowIndex);
        if (rowKey === undefined) {
            return;
        }
        const row = this.rowKeyMap.get(rowKey);
        row.height = height;
        row.item._height = height;
        this.clearBufferData(); // 清除缓存数据
    }
    /**
     *
     * @returns 获取转化平铺数据
     */
    getAllRowsData() {
        let list: any[] = [];
        const recursiveData = (data: any[]) => {
            data.forEach((item) => {
                list.push(item);
                if (Array.isArray(item.children)) {
                    recursiveData(item.children);
                }
            });
        };
        recursiveData(this.data);
        return list;
    }
    private filterColumns(columns: Column[]) {
        return columns.reduce((acc: Column[], column) => {
            // 检查当前列的 hide 属性
            const shouldHide = typeof column.hide === 'function' ? column.hide() : column.hide;
            // 如果当前列不应该隐藏，则添加到结果中
            if (!shouldHide) {
                const newColumn = { ...column }; // 复制当前列
                // 递归处理子列
                if (newColumn.children && Array.isArray(newColumn.children)) {
                    newColumn.children = this.filterColumns(newColumn.children);
                }
                acc.push(newColumn);
            }
            return acc;
        }, []);
    }
    getColumns() {
        return this.filterColumns(this.columns);
    }
    setColumns(columns: Column[]) {
        this.columns = columns;
        this.clearBufferData();
    }
    setData(data: any[]) {
        this.data = data;
        if (this.columns.length) {
            this.init();
        }
    }
    /**
     * 统一转化数据，给画body使用，包括过滤树状等，统一入口
     * @returns
     */
    getData() {
        if (this.bufferData.length > 0) {
            return {
                data: this.bufferData,
                sumHeight: this.sumHeight,
                positions: this.positions,
            };
        }
        let list: any[] = [];
        let rowIndex = 0;
        this.sumHeight = 0;
        this.positions = [];
        const recursiveData = (data: any[]) => {
            data.forEach((item) => {
                list.push(item);
                const rowKey = this.itemRowKeyMap.get(item);
                const { expand, hasChildren, height } = this.rowKeyMap.get(rowKey);
                const top = this.sumHeight;
                this.sumHeight += height;
                this.rowIndexRowKeyMap.set(rowIndex, rowKey);
                this.rowKeyRowIndexMap.set(rowKey, rowIndex);
                this.positions.push({
                    top,
                    height,
                    bottom: this.sumHeight,
                });
                rowIndex += 1;
                if (expand && hasChildren) {
                    recursiveData(item.children);
                }
            });
        };
        this.rowIndexRowKeyMap.clear();
        this.rowKeyRowIndexMap.clear();
        let _data = this.data;
        if (typeof this.filterMethod === 'function') {
            _data = this.filterMethod(_data);
        }
        recursiveData(_data);
        this.bufferData = list;
        return {
            data: list,
            sumHeight: this.sumHeight,
            positions: this.positions,
        };
    }
    setFooterData(data: any[]) {
        this.footerData = data;
    }
    getFooterData() {
        return this.footerData;
    }

    /**
     * 设置过滤方法
     */
    setFilterMethod(filterMethod: FilterMethod) {
        this.filterMethod = filterMethod;
    }
    /**
     * 清空过滤方法
     */
    clearFilterMethod() {
        this.filterMethod = undefined;
    }
    /**
     * 根据rowKey,控制指定展开行
     * @param rowKey
     * @param expand
     */
    expandItem(rowKey: string, expand = false) {
        const row = this.rowKeyMap.get(rowKey);
        row.expand = expand;
        this.expandMap.set(rowKey, expand);
        this.clearBufferData(); // 清除缓存数据
        this.ctx.emit('draw');
    }
    setExpandRowKeys(rowKeys: any[], expand = true) {
        this.expandMap.clear();
        rowKeys.forEach((rowkey) => {
            const row = this.rowKeyMap.get(rowkey);
            this.expandMap.set(rowkey, expand);
            row.expand = expand;
        });
        this.clearBufferData(); // 清除缓存数据
        this.ctx.emit('draw');
    }
    getExpandRowKeys() {
        let list: string[] = [];
        this.rowKeyMap.forEach((row: any, key: string) => {
            if (row.expand) {
                list.push(key);
            }
        });
        return list;
    }
    expandAll(expand: boolean) {
        this.expandMap.clear();
        this.rowKeyMap.forEach((row: any) => {
            row.expand = expand;
            this.expandMap.set(row.key, expand);
        });
        this.clearBufferData(); // 清除缓存数据
        this.ctx.emit('draw');
    }
    expandLoading(rowKey: string, loading = false) {
        const row = this.rowKeyMap.get(rowKey);
        row.expandLoading = loading;
        this.clearBufferData(); // 清除缓存数据
        this.ctx.emit('draw');
    }
    setExpandChildren(rowKey: string, children: any[]) {
        const row = this.rowKeyMap.get(rowKey);
        row.expand = true;
        this.expandMap.set(rowKey, true);
        row.expandLazy = true;
        row.item.children = children;
        this.initData(row.item.children, row.level + 1);
        this.clearBufferData(); // 清除缓存数据
    }
    getIsExpandLoading(rowKey: string) {
        const row = this.rowKeyMap.get(rowKey);
        return row.expandLoading;
    }
    getIsExpandLazy(rowKey: string) {
        const row = this.rowKeyMap.get(rowKey);
        return row.expandLazy;
    }
    /**
     * 根据rowKey获取是否展开
     * @param rowKey
     * @returns
     */
    getIsExpand(rowKey: string) {
        const row = this.rowKeyMap.get(rowKey);
        return row.expand;
    }
    /**
     * 根据rowKey获取行数据
     * @param rowKey
     * @returns
     */
    getRowForRowKey(rowKey: string) {
        return this.rowKeyMap.get(rowKey);
    }
    getRowForRowIndex(rowIndex: number) {
        const rowKey = this.getRowKeyForRowIndex(rowIndex);
        return this.rowKeyMap.get(rowKey);
    }
    /**
     * 根据rowIndex获取rowKey
     * @param rowKey
     * @returns
     */
    getRowKeyForRowIndex(rowIndex: number) {
        return this.rowIndexRowKeyMap.get(rowIndex) || '';
    }
    getRowKeyByItem(item: any) {
        return this.itemRowKeyMap.get(item);
    }
    getRowIndexForRowKey(rowKey: string) {
        return this.rowKeyRowIndexMap.get(rowKey);
    }
    /**
     * 根据rowIndex和colIndex获取单元格数据
     * @param rowIndex
     * @param colIndex
     * @returns
     */
    getItemValueForRowIndexAndColIndex(rowIndex: number, colIndex: number) {
        const has = this.rowIndexRowKeyMap.has(rowIndex) && this.colIndexKeyMap.get(colIndex);
        if (!has) {
            return null;
        }
        const rowKey = this.rowIndexRowKeyMap.get(rowIndex);
        const key = this.colIndexKeyMap.get(colIndex);
        if (rowKey === undefined || key === undefined) {
            return null;
        }
        return {
            rowKey,
            key,
            value: this.getItemValue(rowKey, key),
        };
    }
    /**
     * 根据rowKey和key获取单元格数据
     * @param rowKey
     * @param key
     * @returns
     */
    getItemValue(rowKey: string, key: string) {
        const row = this.rowKeyMap.get(rowKey);

        if (row && row.item) {
            if (row.item[key] === undefined) {
                return null;
            }
            return row.item[key];
        }
        return null;
    }
    /**
     * 批量设置数据
     * @param list
     * @param history
     * @returns
     */
    async batchSetItemValue(
        _list: ChangeItem[],
        history = false,
        checkReadonly = true,
        historyAcion: HistoryAction = 'none',
    ) {
        let historyList: HistoryItemData[] = [];
        let _checkReadonly = checkReadonly;
        const rowKeyList: Set<string> = new Set();
        let errList: ChangeItem[] = [];
        let changeList: BeforeValueChangeItem[] = _list.map((item) => {
            const { rowKey, key } = item;
            let _value = item.value;
            let value = _value;
            const row = this.getRowDataItemForRowKey(rowKey);
            const oldValue = this.getItemValue(rowKey, key);
            // 判断数字
            const cell = this.getVirtualBodyCellByKey(rowKey, key);
            if (cell?.type === 'number') {
                // 处理数字
                if (['', undefined, null].includes(_value)) {
                    value = null;
                } else if (/^-?\d+(\.\d+)?$/.test(`${_value}`)) {
                    value = Number(_value);
                } else {
                    value = oldValue;
                    errList.push({
                        ...item,
                        value,
                        oldValue,
                        row,
                    });
                }
            }
            return {
                ...item,
                value,
                oldValue,
                row,
            };
        });
        // 过滤错误的
        changeList = changeList.filter((item) => {
            return !errList.some((err) => item.rowKey === err.rowKey && item.key === err.key);
        });
        if (errList.length) {
            const err: ErrorType = {
                code: 'ERR_BATCH_SET_NUMBER_VALUE',
                message: 'Assignment failed, not a numeric type',
                data: errList,
            };
            this.ctx.emit('error', err);
        }
        if (!changeList.length) {
            return;
        }
        const { BEFORE_VALUE_CHANGE_METHOD } = this.ctx.config;
        if (historyAcion === 'none' && typeof BEFORE_VALUE_CHANGE_METHOD === 'function') {
            const beforeCellValueChange: BeforeCellValueChangeMethod = BEFORE_VALUE_CHANGE_METHOD;
            const values = await beforeCellValueChange(changeList);
            changeList = values;
            _checkReadonly = false; // 允许编辑只读
        }
        changeList.forEach((data) => {
            const { value, rowKey, key } = data;
            const oldValue = this.getItemValue(rowKey, key);
            rowKeyList.add(rowKey);
            // 不加历史，不重绘，不是编辑器，不检验只读
            this.setItemValue(rowKey, key, value, false, false, false, _checkReadonly);
            historyList.push({
                rowKey,
                key,
                oldValue,
                newValue: value,
            });
        });
        // 触发change事件
        let rows: any[] = [];
        rowKeyList.forEach((rowKey) => {
            rows.push(this.ctx.database.getRowDataItemForRowKey(rowKey));
        });
        const promsieValidators = changeList.map(({ rowKey, key }) => this.getValidator(rowKey, key));
        Promise.all(promsieValidators).then(() => {
            if (this.validationErrorMap.size === 0 && this.changedDataMap.size > 0) {
                this.ctx.emit('validateChangedData', this.getChangedData());
            }
        });
        this.ctx.emit('change', changeList, rows);
        // 推历史记录
        if (history) {
            this.ctx.history.pushState({
                changeList: historyList,
                scrollX: this.ctx.scrollX,
                scrollY: this.ctx.scrollY,
                type: 'multiple',
            });
        }
        this.ctx.emit('draw');
    }
    /**
     *设置单一数据
     * @param rowKey
     * @param key
     * @param value
     * @param history 是否添加历史记录
     * @param reDraw 是否刷新重绘
     * @param isEditor 是否是编辑器
     * @param checkReadonly 是否检查只读
     * @returns
     */
    async setItemValue(
        rowKey: string,
        key: string,
        _value: any,
        history = false,
        reDraw = false,
        isEditor = false,
        checkReadonly = true,
    ) {
        // 异常情况
        if (!this.rowKeyMap.has(rowKey)) {
            return {};
        }

        const { item } = this.rowKeyMap.get(rowKey);
        let oldValue = item[key];
        let value = _value;

        // 只读返回旧值
        if (checkReadonly && this.ctx.database.getReadonly(rowKey, key)) {
            return {
                oldValue,
                newValue: oldValue,
            };
        }
        // 处理对象
        if (item[key] !== null && typeof item[key] === 'object') {
            oldValue = JSON.parse(JSON.stringify(item[key]));
        }
        const changeKey = `${rowKey}\u200b_${key}`;
        // 设置原始值,只设置一次
        if (!this.originalDataMap.has(changeKey)) {
            this.originalDataMap.set(changeKey, oldValue);
        }
        const originalValue = this.originalDataMap.get(changeKey);
        const row = this.getRowDataItemForRowKey(rowKey);
        // 是否是否是编辑器进来的
        if (isEditor) {
            const cell = this.getVirtualBodyCellByKey(rowKey, key);
            if (cell?.type === 'number') {
                // 处理数字
                if (['', undefined, null].includes(_value)) {
                    value = null;
                } else if (/^-?\d+(\.\d+)?$/.test(`${_value}`)) {
                    value = Number(_value);
                } else {
                    value = oldValue;
                    const err: ErrorType = {
                        code: 'ERR_SET_NUMBER_VALUE',
                        message: 'Assignment failed, not a numeric type',
                        data: [
                            {
                                rowKey,
                                key,
                                value,
                                oldValue,
                                row,
                            },
                        ],
                    };
                    this.ctx.emit('error', err);
                }
            }
            if (value === oldValue) {
                return {
                    oldValue,
                    newValue: oldValue,
                };
            }
            let changeList: BeforeChangeItem[] = [
                {
                    rowKey,
                    key,
                    value,
                    oldValue,
                    row,
                },
            ];
            this.batchSetItemValue(changeList, history, false);
            this.ctx.emit('editChange', {
                rowKey,
                key,
                oldValue,
                value,
                originalValue,
                row,
            });
        } else {
            this.changedDataMap.set(changeKey, value);
            item[key] = value;
        }
        // 迭代改变值事件,有改变一次值就触发，包括批量的
        if (this.ctx.hasEvent('iterationChange')) {
            this.ctx.emit('iterationChange', {
                rowKey,
                key,
                oldValue,
                value,
                originalValue: this.originalDataMap.get(changeKey),
                row,
            });
        }
        // 重绘
        if (reDraw) {
            this.ctx.emit('draw');
        }
        return {
            oldValue,
            newValue: value,
        };
    }
    /**
     * 根据rowKey 获取行数据
     * @param rowKey
     * @returns
     */
    getRowDataItemForRowKey(rowKey: string) {
        if (!this.rowKeyMap.has(rowKey)) {
            return {};
        }
        const { item } = this.rowKeyMap.get(rowKey);
        return item;
    }
    /**
     *
     * @param rowKey 设置选中状态ByCheckboxKey，用于合并Checkbox单元格时声明唯一key
     * @param check
     */
    private setRowSelectionByCheckboxKey(rowKey: string, check: boolean) {
        const { CHECKBOX_KEY } = this.ctx.config;
        if (CHECKBOX_KEY) {
            if (!this.rowKeyMap.has(rowKey)) {
                return false;
            }
            const { item } = this.rowKeyMap.get(rowKey);
            const checkboxKey = item[CHECKBOX_KEY];
            if (this.checkboxKeyMap.has(checkboxKey)) {
                const rowKeys = this.checkboxKeyMap.get(checkboxKey) || [];
                rowKeys.forEach((rowKey: string) => {
                    const selection = this.selectionMap.get(rowKey);
                    if (selection) {
                        selection.check = check;
                    }
                });
            }
        }
    }
    /**
     * 根据rowKey 取反选中
     * @param rowKey
     */
    toggleRowSelection(rowKey: string, cellType?: string) {
        const row = this.rowKeyMap.get(rowKey);
        const selection = this.selectionMap.get(rowKey);
        if (!selection) {
            return;
        }

        // 检查是否是树形选择列
        if (cellType === 'selection-tree' || cellType === 'tree-selection') {
            this.toggleTreeSelection(rowKey);
        } else {
            selection.check = !selection.check;
            this.setRowSelectionByCheckboxKey(rowKey, selection.check);
        }

        this.ctx.emit('toggleRowSelection', row);
        const rows = this.getSelectionRows();
        this.ctx.emit('selectionChange', rows);
        // 清除缓存
        this.bufferCheckState.buffer = false;
        this.ctx.emit('draw');
    }

    // 切换树形选择状态
    toggleTreeSelection(rowKey: string) {
        const treeState = this.getTreeSelectionState(rowKey);
        const mode = this.ctx.config.TREE_SELECT_MODE;
        if (mode === 'auto') {
            // auto模式：子项全不选->父项不勾选，子项全选->父项勾选，子项都有->父项半选
            // 父项选中的情况点击清空父项选择和所有子项选择，其他情况点击父项，勾选父项和所有子项选择（递归）
            if (treeState.checked && !treeState.indeterminate) {
                // 如果已全选，则取消选中
                this.setRowSelection(rowKey, false, false);
                // 递归取消所有子项
                this.clearTreeSelectionRecursive(rowKey);
            } else {
                // 如果未选中或半选，则选中
                this.setRowSelection(rowKey, true, false);
                // 递归选中所有子项
                this.selectTreeSelectionRecursive(rowKey);
            }
        } else if (mode === 'cautious') {
            // cautious模式：交互上相同，但是半选是不算在数据里面的
            if (treeState.checked && !treeState.indeterminate) {
                // 如果已全选，则取消选中
                this.setRowSelection(rowKey, false, false);
                // 递归取消所有子项
                this.clearTreeSelectionRecursive(rowKey);
            } else {
                // 如果未选中或半选，则选中
                this.setRowSelection(rowKey, true, false);
                // 递归选中所有子项
                this.selectTreeSelectionRecursive(rowKey);
            }
        } else if (mode === 'strictly') {
            // strictly模式：父子各选各的互相不干扰，没有半选模式
            const selection = this.selectionMap.get(rowKey);
            if (selection) {
                selection.check = !selection.check;
                this.setRowSelectionByCheckboxKey(rowKey, selection.check);
            }
        }
        
        // 触发选择变化事件
        this.ctx.emit('selectionChange', this.getSelectionRows());
        this.ctx.emit('draw');
    }

    // 递归选中树形选择
    private selectTreeSelectionRecursive(rowKey: string) {
        const children = this.getTreeChildren(rowKey);
        children.forEach(childKey => {
            this.setRowSelection(childKey, true, false);
            this.selectTreeSelectionRecursive(childKey);
        });
    }

    // 递归取消树形选择
    private clearTreeSelectionRecursive(rowKey: string) {
        const children = this.getTreeChildren(rowKey);
        children.forEach(childKey => {
            this.setRowSelection(childKey, false, false);
            this.clearTreeSelectionRecursive(childKey);
        });
    }
    
    // 向上递归更新父项状态
    private updateParentTreeSelection(rowKey: string) {
        const parentKey = this.getTreeParent(rowKey);
        if (!parentKey) {
            return;
        }
        
        // 获取父项的所有直接子项
        const children = this.getTreeChildren(parentKey);
        const childSelections = children.map(childKey => this.selectionMap.get(childKey));
        const checkedChildren = childSelections.filter(s => s?.check).length;
        const totalChildren = childSelections.length;
        
        // 计算父项应该的状态
        let parentShouldBeChecked = false;
        if (totalChildren > 0) {
            if (checkedChildren === 0) {
                // 所有子项都未选中，父项应该未选中
                parentShouldBeChecked = false;
            } else if (checkedChildren === totalChildren) {
                // 所有子项都选中，父项应该选中
                parentShouldBeChecked = true;
            } else {
                // 部分子项选中，父项应该半选
                if (this.ctx.config.TREE_SELECT_MODE === 'auto') {
                    // auto模式下半选算作选中
                    parentShouldBeChecked = true;
                } else if (this.ctx.config.TREE_SELECT_MODE === 'cautious') {
                    // cautious模式下半选不算作选中
                    parentShouldBeChecked = false;
                }
            }
        }
        
        // 更新父项状态
        const parentSelection = this.selectionMap.get(parentKey);
        if (parentSelection && parentSelection.check !== parentShouldBeChecked) {
            parentSelection.check = parentShouldBeChecked;
            this.setRowSelectionByCheckboxKey(parentKey, parentShouldBeChecked);
            
            // 递归更新更上层的父项
            this.updateParentTreeSelection(parentKey);
        }
    }
    /**
     * 根据rowKey 设置选中状态
     * @param rowKey
     */
    setRowSelection(rowKey: string, check: boolean, draw = true) {
        const selection = this.selectionMap.get(rowKey);
        if (!selection) {
            return;
        }
        selection.check = check;
        this.setRowSelectionByCheckboxKey(rowKey, selection.check);
        this.ctx.emit('setRowSelection', check, selection.row);
        
        // 如果是树形选择模式，需要向上递归更新父项状态
        if (this.ctx.config.TREE_SELECT_MODE === 'auto' || this.ctx.config.TREE_SELECT_MODE === 'cautious') {
            this.updateParentTreeSelection(rowKey);
        }
        
        if (draw) {
            // 清除缓存
            this.bufferCheckState.buffer = false;
            this.ctx.emit('draw');
        }
    }
    getSelectionRows() {
        let rows: any[] = [];
        this.selectionMap.forEach((selection: any) => {
            if (selection.check) {
                rows.push(selection.row);
            }
        });
        return rows;
    }
    /**
     * 根据rowKey 获取选中状态
     * @param rowKey
     */
    getRowSelection(rowKey: string) {
        const selection = this.selectionMap.get(rowKey);
        if (!selection) {
            return false;
        }
        return selection.check;
    }

    // 获取树形选择状态
    getTreeSelectionState(rowKey: string) {
        const row = this.getRowForRowKey(rowKey);
        if (!row) {
            return { checked: false, indeterminate: false };
        }

        const selectionMap = this.selectionMap.get(rowKey);
        const checked = selectionMap?.check || false;
        
        // 计算半选状态
        const children = this.getTreeChildren(rowKey);
        if (children.length === 0) {
            return { checked, indeterminate: false };
        }

        let indeterminate = false;
        let finalChecked = checked;
        
        if (this.ctx.config.TREE_SELECT_MODE === 'auto') {
            // auto模式：子项全不选->父项不勾选，子项全选->父项勾选，子项都有->父项半选
            // 其中半选是算在最终选择的数据里面的
            
            // 递归计算所有后代的状态
            const getAllDescendantsRecursive = (parentKey: string): string[] => {
                const children = this.getTreeChildren(parentKey);
                let allDescendants: string[] = [];
                for (const childKey of children) {
                    allDescendants.push(childKey);
                    allDescendants.push(...getAllDescendantsRecursive(childKey));
                }
                return allDescendants;
            };
            
            const allDescendants = getAllDescendantsRecursive(rowKey);
            const descendantSelections = allDescendants.map(descKey => this.selectionMap.get(descKey));
            const checkedDescendants = descendantSelections.filter(s => s?.check).length;
            const totalDescendants = descendantSelections.length;
            
            const someChecked = checkedDescendants > 0;
            const allChecked = checkedDescendants === totalDescendants;
            indeterminate = someChecked && !allChecked;
            finalChecked = checked || someChecked; // 自身选中或有后代选中就算选中（包括半选）
            
            // 特殊处理：如果父项被选中但所有后代都被取消选中，则父项也取消选中
            if (checked && totalDescendants > 0 && checkedDescendants === 0) {
                finalChecked = false;
                indeterminate = false;
            }
            

        } else if (this.ctx.config.TREE_SELECT_MODE === 'cautious') {
            // cautious模式：交互上相同，但是半选是不算在数据里面的
            // 递归计算所有后代的状态
            const getAllDescendantsRecursive = (parentKey: string): string[] => {
                const children = this.getTreeChildren(parentKey);
                let allDescendants: string[] = [];
                for (const childKey of children) {
                    allDescendants.push(childKey);
                    allDescendants.push(...getAllDescendantsRecursive(childKey));
                }
                return allDescendants;
            };
            
            const allDescendants = getAllDescendantsRecursive(rowKey);
            const descendantSelections = allDescendants.map(descKey => this.selectionMap.get(descKey));
            const checkedDescendants = descendantSelections.filter(s => s?.check).length;
            const totalDescendants = descendantSelections.length;
            
            const someChecked = checkedDescendants > 0;
            const allChecked = checkedDescendants === totalDescendants;
            indeterminate = someChecked && !allChecked;
            finalChecked = checked || allChecked; // 只有全选才算选中，半选不算选中
            
            // 特殊处理：如果父项被选中但所有后代都被取消选中，则父项也取消选中
            if (checked && totalDescendants > 0 && checkedDescendants === 0) {
                finalChecked = false;
                indeterminate = false;
            }
        } else if (this.ctx.config.TREE_SELECT_MODE === 'strictly') {
            // strictly模式：父子各选各的互相不干扰，没有半选模式
            indeterminate = false;
            finalChecked = checked;
        }

                            const result = { checked: finalChecked, indeterminate };
                    return result;
    }

    // 获取树形子节点
    getTreeChildren(rowKey: string): string[] {
        const row = this.getRowForRowKey(rowKey);
        if (!row || !row.item || !row.item.children) {
            return [];
        }

        const children: string[] = [];
        const collectChildren = (items: any[]) => {
            for (const item of items) {
                const itemKey = this.getRowKeyByItem(item);
                if (itemKey) {
                    children.push(itemKey);
                }
                if (item.children && item.children.length > 0) {
                    collectChildren(item.children);
                }
            }
        };

        collectChildren(row.item.children);
        return children;
    }

    // 获取树形父节点
    getTreeParent(rowKey: string): string | null {
        const findParent = (data: any[], targetKey: string): string | null => {
            for (const item of data) {
                const itemKey = this.getRowKeyByItem(item);
                if (item.children) {
                    for (const child of item.children) {
                        const childKey = this.getRowKeyByItem(child);
                        if (childKey === targetKey) {
                            return itemKey;
                        }
                        const result = findParent(item.children, targetKey);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
            return null;
        };

        return findParent(this.data, rowKey);
    }
    /**
     * 根据rowKey 获取选中状态
     * @param rowKey
     */
    getRowSelectable(rowKey: string) {
        const { selectable, item, rowIndex } = this.rowKeyMap.get(rowKey);
        if (typeof selectable === 'function') {
            return selectable({
                row: item,
                rowIndex,
            });
        }
        return selectable;
    }
    /**
     * 全选
     * @param rowKey
     */
    toggleAllSelection() {
        // 检查是否是树形选择模式
        const isTreeSelectionMode = this.ctx.config.TREE_SELECT_MODE === 'auto' || this.ctx.config.TREE_SELECT_MODE === 'cautious';
        
        if (isTreeSelectionMode) {
            // 树形选择模式：只从上到下设置，跳过递归计算
            this.rowKeyMap.forEach((row: any, rowKey: string) => {
                let _selectable = row.selectable;
                if (typeof _selectable === 'function') {
                    _selectable = _selectable({
                        row: row.item,
                        rowIndex: row.rowIndex,
                    });
                }
                if (_selectable) {
                    // 直接设置选中状态，跳过递归计算
                    const selection = this.selectionMap.get(rowKey);
                    if (selection) {
                        selection.check = true;
                        this.setRowSelectionByCheckboxKey(rowKey, true);
                    }
                }
            });
        } else {
            // 普通选择模式：使用原有逻辑
            this.rowKeyMap.forEach((row: any, rowKey: string) => {
                let _selectable = row.selectable;
                if (typeof _selectable === 'function') {
                    _selectable = _selectable({
                        row: row.item,
                        rowIndex: row.rowIndex,
                    });
                }
                if (_selectable) {
                    this.setRowSelection(rowKey, true, false);
                }
            });
        }
        
        const rows = this.getSelectionRows();
        this.ctx.emit('toggleAllSelection', rows);
        this.ctx.emit('selectionChange', rows);
        // 清除缓存
        this.bufferCheckState.buffer = false;
        this.ctx.emit('draw');
    }
    /**
     * 清除选中
     * @param rowKey
     */
    clearSelection(ignoreReserve = false) {
        // 检查是否是树形选择模式
        const isTreeSelectionMode = this.ctx.config.TREE_SELECT_MODE === 'auto' || this.ctx.config.TREE_SELECT_MODE === 'cautious';
        
        // 清除选中,点击表头清除时要忽略跨页选的
        if (ignoreReserve) {
            if (isTreeSelectionMode) {
                // 树形选择模式：只从上到下设置，跳过递归计算
                this.rowKeyMap.forEach((_, rowKey: string) => {
                    const selection = this.selectionMap.get(rowKey);
                    if (selection) {
                        selection.check = false;
                        this.setRowSelectionByCheckboxKey(rowKey, false);
                    }
                });
            } else {
                // 普通选择模式：使用原有逻辑
                this.rowKeyMap.forEach((_, rowKey: string) => {
                    this.setRowSelection(rowKey, false, false);
                });
            }
        } else {
            this.selectionMap.clear();
            this.rowKeyMap.forEach((row, rowKey: string) => {
                this.selectionMap.set(rowKey, {
                    check: false,
                    row: row.item,
                    key: rowKey,
                });
            });
        }
        const rows = this.getSelectionRows();
        this.ctx.emit('clearSelection');
        this.ctx.emit('selectionChange', rows);
        // 清除缓存
        this.bufferCheckState.buffer = false;
        this.ctx.emit('draw');
    }
    /**
     * 获取选中状态，表头用
     * @param rowKey
     */
    getCheckedState() {
        // 缓存，解决性能问题
        const { buffer, ...bufferState } = this.bufferCheckState;
        if (buffer) {
            return bufferState;
        }
        const total = this.rowKeyMap.size;
        let totalChecked = 0;
        let totalSelectable = 0;
        const reserveTotal = this.selectionMap.size;
        const reserveHasChecked = Array.from(this.selectionMap.values()).some((item) => item.check);
        this.rowKeyMap.forEach((row: any, rowKey: string) => {
            if (this.selectionMap.get(rowKey)?.check) {
                totalChecked += 1;
            }
            let _selectable = row.selectable;
            if (typeof _selectable === 'function') {
                _selectable = _selectable({
                    row: row.item,
                    rowIndex: row.rowIndex,
                });
            }
            if (_selectable) {
                totalSelectable += 1;
            }
        });
        // 存在跨页时，变更半选中
        const reserveIndeterminate = reserveTotal > total && totalChecked === 0 && reserveHasChecked;
        const indeterminate =
            (totalSelectable && totalSelectable > totalChecked && totalChecked > 0) || reserveIndeterminate;
        const selectable = totalSelectable !== 0;
        const check = !!totalSelectable && totalSelectable === totalChecked;
        // 缓存
        this.bufferCheckState = {
            buffer: true,
            check,
            indeterminate,
            selectable,
        };

        return {
            check,
            indeterminate,
            selectable,
        };
    }
    /**
     * 更新列索引
     * @param list 表头末级列表
     */
    updateColIndexKeyMap(list: CellHeader[] = []) {
        this.colIndexKeyMap.clear();
        list.forEach((column) => {
            this.colIndexKeyMap.set(column.colIndex, column.key);
        });
    }
    getColumnByColIndex(colIndex: number) {
        const key = this.colIndexKeyMap.get(colIndex);
        if (key && this.headerMap.has(key)) {
            return this.headerMap.get(key)?.column;
        }
    }
    getColumnByKey(key: string) {
        const column = this.headerMap.get(key);
        if (column) {
            return column;
        }
    }
    getColIndexForKey(key: string) {
        if (key && this.headerMap.has(key)) {
            return this.headerMap.get(key)?.colIndex;
        }
    }
    getColHeaderByIndex(colIndex: number) {
        const key = this.colIndexKeyMap.get(colIndex);
        if (key && this.headerMap.has(key)) {
            return this.headerMap.get(key);
        }
        return undefined;
    }
    /**
     * 获取以改变数据
     */
    getChangedData() {
        let list: {
            rowKey: string;
            colKey: string;
            row: any;
            originalValue: any;
            value: any;
        }[] = [];
        this.changedDataMap.forEach((value, key) => {
            const originalValue = this.originalDataMap.get(key);
            const rowKey = key.split('\u200b_')[0];
            const colKey = key.split('\u200b_')[1];
            if (originalValue !== value) {
                list.push({
                    rowKey,
                    colKey,
                    originalValue,
                    row: this.ctx.database.getRowDataItemForRowKey(rowKey),
                    value,
                });
            }
        });
        return list;
    }
    getChangedRows() {
        const rowKeyList: Set<string> = new Set();
        this.changedDataMap.forEach((value, key) => {
            const originalValue = this.originalDataMap.get(key);
            const rowKey = key.split('\u200b_')[0];
            if (originalValue !== value) {
                rowKeyList.add(rowKey);
            }
        });
        let rows: any[] = [];
        rowKeyList.forEach((rowKey) => {
            rows.push(this.ctx.database.getRowDataItemForRowKey(rowKey));
        });
        return rows;
    }
    /**
     * 获取改变值是否已经改变
     * @param rowKey
     * @param key
     * @returns
     */
    isHasChangedData(rowKey: string, key: string) {
        const changedKey = `${rowKey}\u200b_${key}`;
        if (!this.changedDataMap.has(changedKey)) {
            return false;
        }
        const originalValue = this.originalDataMap.get(changedKey);
        const changedValue = this.changedDataMap.get(changedKey);
        return originalValue !== changedValue;
    }
    getPositionForRowIndex(rowIndex: number): Position {
        if (rowIndex < this.positions.length) {
            return this.positions[rowIndex];
        }
        return {
            height: 0,
            top: 0,
            bottom: 0,
        };
    }

    setHeader(key: string, cellHeader: CellHeader): boolean {
        if (!key) {
            return false;
        }
        this.headerMap.set(key, cellHeader);
        return true;
    }
    getReadonly(rowKey: string, key: string) {
        const { DISABLED } = this.ctx.config;
        // 禁用编辑
        if (DISABLED) {
            return true;
        }
        const row = this.rowKeyMap.get(rowKey);
        const colHeader = this.headerMap.get(key);
        if (!row || !colHeader) {
            return true;
        }
        const rowReadonly = row.readonly;
        const colReadonly = colHeader.readonly;
        const { BODY_CELL_READONLY_METHOD } = this.ctx.config;
        // 自定义只读
        if (typeof BODY_CELL_READONLY_METHOD === 'function' && colHeader) {
            const cellReadonlyMethod: CellReadonlyMethod = BODY_CELL_READONLY_METHOD;
            const readonly = cellReadonlyMethod({
                row: row.item,
                rowIndex: row.rowIndex,
                colIndex: colHeader.colIndex,
                column: colHeader.column,
                value: this.getItemValue(rowKey, key),
            });
            if (readonly !== undefined) {
                return readonly;
            }
        }
        return colReadonly || rowReadonly;
    }
    clearValidate() {
        this.validationErrorMap.clear();
    }
    hasValidationError() {
        return this.validationErrorMap.size !== 0;
    }
    getValidator(rowKey: string, key: string) {
        return new Promise((resolve) => {
            const row = this.rowKeyMap.get(rowKey);
            const colHeader = this.headerMap.get(key);
            const { BODY_CELL_RULES_METHOD } = this.ctx.config;
            if (colHeader === undefined) {
                return resolve([]);
            }
            const column = colHeader.column;
            let rules = column.rules;
            // 自定义只读
            if (typeof BODY_CELL_RULES_METHOD === 'function') {
                const cellRulesMethod: CellRulesMethod = BODY_CELL_RULES_METHOD;
                const _rules = cellRulesMethod({
                    row: row.item,
                    rowIndex: row.rowIndex,
                    colIndex: colHeader.colIndex,
                    column,
                    value: this.getItemValue(rowKey, key),
                });
                if (_rules) {
                    rules = _rules;
                }
            }
            if (rules) {
                const ruleParam: RuleParam = {
                    row: row.item,
                    rowIndex: row.rowIndex,
                    colIndex: colHeader.colIndex,
                    column,
                    key,
                    rowKey,
                    value: this.getItemValue(rowKey, key),
                    field: key,
                    fieldValue: this.getItemValue(rowKey, key),
                };
                const validator = new Validator(rules);
                const _errors = validator.validate(ruleParam);
                this.setValidationError(rowKey, key, _errors);
                resolve(_errors);
            } else {
                this.clearValidationError(rowKey, key);
                resolve([]);
            }
        });
    }
    getHeightByRowIndexRowSpan(rowIndex: number, rowSpan: number) {
        let sumHeight = 0;
        for (let i = 0; i < rowSpan; i++) {
            const position = this.positions[rowIndex + i];
            if (position) {
                sumHeight += position.height;
            }
        }
        return sumHeight;
    }
    getSpanInfo(cell: Cell): SpanInfo {
        const {
            rowIndex,
            key,
            rowKey,
            row,
            value,
            colIndex,
            relationRowKeys,
            relationColKeys,
            rowspan,
            height,
            width,
            colspan,
            mergeRow,
            mergeCol,
        } = cell;
        if (rowspan === 1 && colspan === 1) {
            return {
                xArr: [colIndex, colIndex],
                yArr: [rowIndex, rowIndex],
                rowspan,
                colspan,
                height,
                width,
                offsetTop: 0,
                offsetLeft: 0,
                dataList: [
                    {
                        rowKey,
                        key,
                        row,
                        value,
                    },
                ],
            };
        }
        let topIndex = rowIndex;
        let bottomIndex = rowIndex;
        let leftIndex = colIndex;
        let rightIndex = colIndex;
        let dataList: ChangeItem[] = [];
        let offsetTop = 0;
        let offsetLeft = 0;
        let mergeHeight = 0;
        let mergeWidth = 0;
        // 列合并的
        if (rowspan !== 1 && mergeRow) {
            mergeWidth = width;
            const curValue = relationRowKeys.reduce((acc, key) => {
                const value = this.getItemValue(rowKey, key) ?? '';
                return `${acc}${value}`;
            }, '');
            // 先查找向上的相同值，根据关联值查询
            for (let i = rowIndex - 1; i >= 0; i--) {
                const _rowKey = this.rowIndexRowKeyMap.get(i) || '';
                const pValue = relationRowKeys.reduce((acc, key) => {
                    const value = this.getItemValue(_rowKey, key) ?? '';
                    return `${acc}${value}`;
                }, '');
                if (curValue === pValue) {
                    topIndex = i;
                } else {
                    break;
                }
            }

            // 再查找向下的相同值，根据关联值查询
            for (let i = rowIndex; i <= this.ctx.maxRowIndex; i++) {
                const _rowKey = this.rowIndexRowKeyMap.get(i) || '';
                const pValue = relationRowKeys.reduce((acc, key) => {
                    const value = this.getItemValue(_rowKey, key) ?? '';
                    return `${acc}${value}`;
                }, '');
                if (curValue === pValue) {
                    bottomIndex = i;
                } else {
                    break;
                }
            }
            for (let i = topIndex; i < rowIndex; i++) {
                const { height } = this.positions[i];
                offsetTop += height;
            }
            for (let i = topIndex; i <= bottomIndex; i++) {
                const { height } = this.positions[i];
                // 合并高度
                mergeHeight += height;

                // 根据下标查找rowkey
                const _rowKey = this.rowIndexRowKeyMap.get(i) || '';
                const { item } = this.rowKeyMap.get(_rowKey);
                const value = this.getItemValue(_rowKey, key);
                // 需要改变值
                dataList.push({
                    rowKey: _rowKey,
                    key,
                    value,
                    row: item,
                });
            }
        }
        // 行合并的
        if (colspan !== 1 && mergeCol) {
            mergeHeight = height;
            // 向左
            for (let i = colIndex - 1; i >= 0; i--) {
                const column = this.getColumnByColIndex(i);
                if (!column) {
                    break;
                }
                const curValue = this.getItemValue(rowKey, key);
                const pValue = this.getItemValue(rowKey, column.key);
                if (curValue === pValue && relationColKeys.includes(column.key)) {
                    leftIndex = i;
                } else {
                    break;
                }
            }
            // 向右
            for (let i = colIndex; i <= this.ctx.maxColIndex; i++) {
                const column = this.getColumnByColIndex(i);
                if (!column) {
                    break;
                }
                const curValue = this.getItemValue(rowKey, key);
                const pValue = this.getItemValue(rowKey, column.key);
                if (curValue === pValue && relationColKeys.includes(column.key)) {
                    rightIndex = i;
                } else {
                    break;
                }
            }
            for (let i = leftIndex; i < colIndex; i++) {
                const column = this.getColumnByColIndex(i);
                if (!column) {
                    break;
                }
                // 合并宽度
                offsetLeft += column.width || 100;
            }
            for (let i = leftIndex; i <= rightIndex; i++) {
                const column = this.getColumnByColIndex(i);
                if (!column) {
                    break;
                }
                // 合并宽度
                mergeWidth += column.width || 100;
                // 需要改变值
                dataList.push({
                    rowKey,
                    key: column.key,
                    value: this.getItemValue(rowKey, column.key),
                    row,
                });
            }
        }
        return {
            xArr: [leftIndex, rightIndex],
            yArr: [topIndex, bottomIndex],
            rowspan,
            colspan,
            height: mergeHeight,
            width: mergeWidth,
            offsetTop,
            offsetLeft,
            dataList,
        };
    }
    setLoading(loading: boolean) {
        this.loading = loading;
        this.ctx.emit('loadingChange', loading);
    }
    getLoading() {
        return this.loading;
    }
    setValidationErrorByRowIndex(rowIndex: number, key: string, message: string) {
        const rowKey = this.rowIndexRowKeyMap.get(rowIndex);
        const _key = `${rowKey}\u200b_${key}`;
        const row = this.getRowForRowIndex(rowIndex);
        const cellHeader = this.getColumnByKey(key);
        if (!rowKey || !cellHeader || !row) {
            return;
        }
        const value = this.getItemValue(rowKey, key);
        const errors: ValidateResult = [
            {
                key,
                rowKey,
                rowIndex,
                colIndex: cellHeader.colIndex,
                column: cellHeader.column,
                row,
                value,
                message,
                field: key,
                fieldValue: value,
            },
        ];
        this.validationErrorMap.set(_key, errors);
    }
    setValidationError(rowKey: string, key: string, errors: ValidateResult) {
        const _key = `${rowKey}\u200b_${key}`;
        this.validationErrorMap.set(_key, errors);
    }
    clearValidationError(rowKey: string, key: string) {
        const _key = `${rowKey}\u200b_${key}`;
        if (this.validationErrorMap.has(_key)) {
            this.validationErrorMap.delete(_key);
        }
    }
    getValidationError(rowKey: string, key: string) {
        const _key = `${rowKey}\u200b_${key}`;
        return this.validationErrorMap.get(_key) || [];
    }
    // 获取虚拟单元格,只针对可见的
    getVirtualBodyCell(rowIndex: number, colIndex: number) {
        const column = this.getColumnByColIndex(colIndex);
        const row = this.getRowForRowIndex(rowIndex);
        if (!column || !row) {
            return;
        }
        const cell = new Cell(this.ctx, rowIndex, colIndex, 0, 0, 0, 0, column, row.item, 'body');
        return cell;
    }
    getVirtualBodyCellByKey(rowKey: string, key: string) {
        const rowIndex = this.getRowIndexForRowKey(rowKey);
        const colIndex = this.getColIndexForKey(key);
        if (rowIndex === undefined || colIndex === undefined) {
            return;
        }
        return this.getVirtualBodyCell(rowIndex, colIndex);
    }
    hasMergeCell(xArr: number[], yArr: number[]) {
        let hasMergeCell = false;
        for (let i = yArr[0]; i <= yArr[1]; i++) {
            for (let j = xArr[0]; j <= xArr[1]; j++) {
                const cell = this.getVirtualBodyCell(i, j);
                if (cell && (cell.rowspan !== 1 || cell.colspan !== 1)) {
                    hasMergeCell = true;
                    break;
                }
            }
        }
        return hasMergeCell;
    }
    
    /**
     * 计算树形数据的最大深度
     * @param data 树形数据
     * @param currentDepth 当前深度
     * @returns 最大深度
     */
    private calculateMaxTreeDepth(data: any[], currentDepth: number = 0): number {
        let maxDepth = currentDepth;
        
        data.forEach(item => {
            if (Array.isArray(item.children) && item.children.length > 0) {
                const childMaxDepth = this.calculateMaxTreeDepth(item.children, currentDepth + 1);
                maxDepth = Math.max(maxDepth, childMaxDepth);
            }
        });
        
        return maxDepth;
    }
}
