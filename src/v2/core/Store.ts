import type { Column, Fixed, FlatRow, RowNodeKey } from '../types';

export type RowNodeProps = {
    data: Record<string, any>;
    store: Store;
};
type ColNodeKey = string | number;
export type CheckState = 'unchecked' | 'checked' | 'indeterminate';
type RowData = Record<string, any>;
type RowSelectableParams = {
    row: RowData;
    rowIndex: number;
}
type RowSelectable = (params: RowSelectableParams) => boolean;
function generateShortUUID(): string {
    return 'xxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
class RowStore {
    dataIndex = 0;
    rowIndex = -1;
    height = 36;
    calculatedHeight = 0;
    expand = false;
    expandLazy = false;
    expandLoading = false;
    visible = true;
    checkState: CheckState = 'unchecked';
    colHeights: Map<number, ColNodeKey[]> = new Map();
    constructor() { }
    get maxColHeight() {
        return Math.max(...this.colHeights.keys());
    }

}
class ColStore {
    width = 100;
    height = 36;
    hide = false;
    fixed: Fixed = '';
    sort = 0;
    constructor() {
    }
    setWidth(width: number) {
        this.width = width;
    }
    setHeight(height: number) {
        this.height = height;
    }
    setHide(hide: boolean) {
        this.hide = hide;
    }
    setSort(sort: number) {
        this.sort = sort;
    }
    setFixed(fixed: Fixed) {
        this.fixed = fixed;
    }
}
export type ColNodeProps = {
    column: Column;
    store: Store;
};
export class ColNode {
    private store: Store;
    private colStore: ColStore;
    column: Column;
    parentNode: ColNode | null = null;
    childrenNodes: ColNode[] = [];
    constructor(props: ColNodeProps) {
        this.store = props.store;
        this.column = props.column;
        const colStore = this.store.getColStore(this.key);
        if (colStore) {
            this.colStore = colStore;
        } else {
            this.colStore = new ColStore();
            this.store.setColStore(this.key, this.colStore);
        }
        this.colStore.setWidth(this.column.width ?? 100);
        this.colStore.setHeight(this.column.height ?? 16);
        this.colStore.setHide(this.column.hide ?? false);
        this.colStore.setSort(this.column.sort ?? 0);
        this.colStore.setFixed(this.column.fixed ?? '');
        this.initChildrenNodes(props.column);
    }
    get rowspan(): number {
        if (this.isRoot || this.hasChildren || this.hide) return 1;
        return this.store.maxColLevel - this.level + 1;
    }
    get colspan(): number {
        if (this.hide) return 0;
        if (!this.hasChildren) return 1;
        return this.childrenNodes.reduce((acc, child) => acc + child.colspan, 0);
    }
    get isRoot(): boolean {
        return this.key === this.store.rootColKey;
    }
    get key(): string {
        return this.column.key;
    }
    get width(): number {
        if (this.isRoot || this.hide) return 0;
        // 如果是有子节点，则返回子节点宽度之和
        if (this.hasChildren) {
            return this.childrenNodes.reduce((acc, child) => acc + child.width, 0);
        }
        return this.colStore.width;
    }
    get hide(): boolean {
        if (this.colStore.hide) return true;
        if (this.hasChildren) {
            return this.childrenNodes.every((child) => child.hide);
        }
        return false;
    }
    get sort(): number {
        return this.colStore.sort;
    }
    get fixed(): Fixed {
        return this.colStore.fixed;
    }
    get level(): number {
        if (this.isRoot) return -1;
        return this.parentNode ? this.parentNode.level + 1 : 0;
    }
    get parentColKeys(): string[] {
        return this.parentNode ? this.parentNode.parentColKeys.concat(this.parentNode.key) : [];
    }
    get hasChildren(): boolean {
        return this.childrenNodes.length > 0;
    }
    get parentColKey(): string {
        return this.parentNode?.key ?? '';
    }
    get isLastChild(): boolean {
        if (!this.parentNode) return false;
        return this.parentNode.childrenNodes.length === this.parentNode.childrenNodes.indexOf(this) + 1;
    }
    setHide(hide: boolean) {
        this.colStore.setHide(hide);
    }
    setSort(sort: number) {
        this.colStore.setSort(sort);
        this.parentNode?.sortChildren();
    }
    setFixed(fixed: Fixed) {
        this.colStore.setFixed(fixed);
    }
    sortChildren() {
        this.childrenNodes.sort((a, b) => a.sort - b.sort);
    }
    private initChildrenNodes(column: Column) {
        const { children } = column;
        if (!Array.isArray(children)) return;
        for (const child of children) {
            const colNode = new ColNode({
                column: child,
                store: this.store,
            });
            this.addChildNode(colNode);
        }
        this.sortChildren();
    }

    private addChildNode(child: ColNode) {
        child.parentNode = this;
        this.childrenNodes.push(child);
        this.store!.addColNodeMap(child);
    }
    getSumWidth(): number {
        let sumWidth = 0;
        for (const child of this.childrenNodes) {
            sumWidth += child.width;
        }
        return sumWidth;
    }
    getMaxColLevel(): number {
        if (!this.isRoot && this.hide) return -1;
        let maxLevel = this.level;
        for (const child of this.childrenNodes) {
            if (child.hide) continue;
            maxLevel = Math.max(maxLevel, child.getMaxColLevel());
        }
        return maxLevel;
    }
}
export class RowNode {
    private store: Store;
    private rowStore: RowStore;
    data: RowData = {};
    parentNode: RowNode | null = null;
    childrenNodes: RowNode[] = [];
    constructor(props: RowNodeProps) {
        this.data = props.data;
        this.store = props.store;
        const rowStore = this.store.getRowStore(this.key);
        if (rowStore) {
            this.rowStore = rowStore;
        } else {
            this.rowStore = new RowStore();
            this.rowStore.height = this.store.defaultRowHeight;
            this.store.setRowStore(this.key, this.rowStore);
        }
        this.initChildrenNodes(props.data);
    }
    get rowIndex(): number {
        return this.rowStore.rowIndex;
    }
    get height(): number {
        return this.rowStore.height;
    }
    get isRoot(): boolean {
        return this.key === this.store.rootKey;
    }
    get key(): RowNodeKey {
        const { uuidKey } = this.store;
        if (uuidKey && this.data[uuidKey] != null && this.data[uuidKey] !== '') {
            return this.data[uuidKey];
        }
        if (!this.data.__evt_key) {
            this.data.__evt_key = generateShortUUID();
        }
        return this.data.__evt_key;
    }
    get readonly(): boolean {
        return this.data?._readonly ?? false;
    }
    get level(): number {
        if (this.isRoot) return -1;
        return this.parentNode ? this.parentNode.level + 1 : 0;
    }
    get parentRowKeys(): RowNodeKey[] {
        return this.parentNode ? this.parentNode.parentRowKeys.concat(this.parentNode.key) : [];
    }
    get hasChildren(): boolean {
        return this.childrenNodes.length > 0;
    }
    get parentRowKey(): RowNodeKey {
        return this.parentNode?.key ?? '';
    }
    get isLastChild(): boolean {
        if (!this.parentNode) return false;
        return this.parentNode.childrenNodes.length === this.parentNode.childrenNodes.indexOf(this) + 1;
    }
    set expand(expand: boolean) {
        this.rowStore.expand = expand;
    }
    get expand(): boolean {
        return this.rowStore.expand;
    }
    private initChildrenNodes(data: Record<string, any>) {
        if (!this.store.hasTree && !this.isRoot) return;
        const { childrenKey } = this.store;
        const children = data[childrenKey];
        if (!Array.isArray(children)) return;
        for (const child of children) {
            const rowNode = new RowNode({
                data: child,
                store: this.store,
            });
            this.addChildNode(rowNode);
        }
    }

    private addChildNode(child: RowNode) {
        child.parentNode = this;
        this.childrenNodes.push(child);
        this.store!.addRowNodeMap(child);
    }
    setRowIndex(index: number) {
        this.rowStore.rowIndex = index;
    }
    getSumHeight(): number {
        let sumHeight = 0;
        // 先计算子节点高度
        for (const child of this.childrenNodes) {
            sumHeight += child.height;
            if (child.expand) {
                sumHeight += child.getSumHeight();
            }
        }
        return sumHeight;
    }
    getExpand(): boolean {
        return this.rowStore.expand;
    }
    setExpand(expand: boolean) {
        this.rowStore.expand = expand;
    }
    getCheckState(): CheckState {
        return this.rowStore.checkState;
    }
    setChecked(state: CheckState, ignoreChild: boolean = false) {
        if (!this.getSelectable()) {
            return;
        }
        this.rowStore.checkState = state;
        if (!ignoreChild) {
            for (const child of this.childrenNodes) {
                child.setChecked(state);
            }
        }
        if (this.parentNode) {
            const siblings = this.parentNode.childrenNodes;
            const enabledSiblings = siblings.filter((s: RowNode) => s.getSelectable());
            const totalEnabled = enabledSiblings.length;
            const checkedCount = enabledSiblings.filter((s: RowNode) => s.getCheckState() === 'checked').length;
            const hasIndeterminate = enabledSiblings.some((s: RowNode) => s.getCheckState() === 'indeterminate');
            let checkState: CheckState = 'unchecked';
            if (checkedCount === totalEnabled) {
                checkState = 'checked';
            } else if (checkedCount > 0 || hasIndeterminate) {
                checkState = 'indeterminate';
            }
            this.parentNode.setChecked(checkState, true);
        }
    }
    getSelectable(): boolean {
        if (this.store?.rowSelectable && typeof this.store.rowSelectable === 'function') {
            return this.store.rowSelectable({ row: this.data, rowIndex: this.rowStore.rowIndex });
        }
        return true;
    }
    setValue(key: string, value: any) {
        this.data[key] = value;
    }
}


class Store {
    private rootRowNode!: RowNode;
    private rootColNode!: ColNode;
    rootKey = 'root_evt';
    uuidKey = 'id';
    childrenKey = 'children';
    rootColKey = 'root_col_evt';
    childrenColKey = 'children';
    hasTree = true;
    hasSelection = false;
    debug = false;
    defaultRowHeight = 36;
    maxColLevel = 0;
    sumHeight = 0;
    sumWidth = 0;
    columns: Column[] = [];
    data: any[] = [];
    flatRows: FlatRow[] = [];
    leafColNodes: ColNode[] = [];
    rowStoreMaps: Map<RowNodeKey, RowStore> = new Map();
    colStoreMaps: Map<string, ColStore> = new Map();
    rowNodeMaps: Map<RowNodeKey, RowNode> = new Map();
    colNodeMaps: Map<string, ColNode> = new Map();
    rowSelectable: RowSelectable | undefined;
    constructor(props: { columns: Column[]; data: any[]; defaultRowHeight?: number; uuidKey?: string; childrenKey?: string; hasTree?: boolean }) {
        const { columns, data } = props;
        this.columns = columns;
        this.data = data;
        if (props.defaultRowHeight != null) this.defaultRowHeight = props.defaultRowHeight;
        if (props.uuidKey) this.uuidKey = props.uuidKey;
        if (props.childrenKey) this.childrenKey = props.childrenKey;
        if (props.hasTree != null) this.hasTree = props.hasTree;
        const rootColData = {
            key: this.rootColKey,
            title: '',
            children: this.columns,
        };
        this.rootColNode = new ColNode({
            column: rootColData,
            store: this,
        });
        const rootRowData = {
            [this.uuidKey]: this.rootKey,
            [this.childrenKey]: this.data,
        };
        this.rootRowNode = new RowNode({
            data: rootRowData,
            store: this,
        });
        this.update();
    }
    get rowNodes(): RowNode[] {
        return this.rootRowNode.childrenNodes;
    }
    get colNodes(): ColNode[] {
        return this.rootColNode.childrenNodes;
    }
    getMaxColLevel(): number {
        return this.rootColNode.getMaxColLevel();
    }
    getSumHeight(): number {
        return this.rootRowNode.getSumHeight();
    }
    getRowStore(key: RowNodeKey) {
        return this.rowStoreMaps.get(key);
    }
    setRowStore(key: RowNodeKey, rowStore: RowStore) {
        this.rowStoreMaps.set(key, rowStore);
    }
    getRowNode(key: RowNodeKey) {
        if (!this.rowNodeMaps.has(key)) {
            console.error(`Node not found: ${key}`);
            return;
        }
        return this.rowNodeMaps.get(key);
    }
    addRowNodeMap(node: RowNode) {
        if (this.rowNodeMaps.has(node.key)) {
            console.warn(`Duplicate keys detected: ${node.key}`);
        };
        this.rowNodeMaps.set(node.key, node);
    }
    getColStore(key: string) {
        return this.colStoreMaps.get(key);
    }
    setColStore(key: string, colStore: ColStore) {
        this.colStoreMaps.set(key, colStore);
    }
    getColNode(key: string) {
        return this.colNodeMaps.get(key);
    }
    addColNodeMap(node: ColNode) {
        if (this.colNodeMaps.has(node.key)) {
            console.warn(`Duplicate keys detected: ${node.key}`);
        };
        this.colNodeMaps.set(node.key, node);
    }
    setChecked(key: RowNodeKey, state: CheckState) {
        const node = this.getRowNode(key);
        if (node) node.setChecked(state);
    }
    getStoreCheckState(): CheckState {
        return this.rootRowNode.getCheckState();
    }
    setExpand(key: RowNodeKey, expanded: boolean) {
        const node = this.getRowNode(key);
        if (node) {
            node.setExpand(expanded);
            this.update();
        }
    }
    setColHide(key: string, hide: boolean) {
        const node = this.getColNode(key);
        if (node) {
            node.setHide(hide);
            this.update();
        }
    }
    setColSort(key: string, sort: number) {
        const node = this.getColNode(key);
        if (node) {
            node.setSort(sort);
            this.update();
        }
    }
    setColFixed(key: string, fixed: Fixed) {
        const node = this.getColNode(key);
        if (node) {
            node.setFixed(fixed);
            this.update();
        }
    }
    // 生成rowIndex
    generateRowIndex() {
        let index = 0;
        const walk = (node: RowNode): void => {
            if (!node.expand && !node.isRoot) return;
            for (const child of node.childrenNodes) {
                const rowIndex = (node.expand || node.isRoot) ? index++ : -1;
                child.setRowIndex(rowIndex);
                walk(child);
            }
        };
        walk(this.rootRowNode);
    }
    loadData(data: any[]) {
        this.data = data;
        this.rowNodeMaps.clear();
        const rootRowData = {
            [this.uuidKey]: this.rootKey,
            [this.childrenKey]: this.data,
        };
        this.rootRowNode = new RowNode({
            data: rootRowData,
            store: this,
        });
        this.update();
    }
    loadColumns(columns: Column[]) {
        this.columns = columns;
        this.colNodeMaps.clear();
        const rootColData = {
            key: this.rootColKey,
            title: '',
            children: this.columns,
        };
        this.rootColNode = new ColNode({
            column: rootColData,
            store: this,
        });
        this.update();
    }
    expandAll(expand = true) {
        this.rowNodeMaps.forEach((node) => {
            if (!node.isRoot && node.hasChildren) node.setExpand(expand);
        });
        this.update();
    }
    buildFlatRows(): FlatRow[] {
        const rows: FlatRow[] = [];
        let y = 0;
        const walk = (node: RowNode): void => {
            for (const child of node.childrenNodes) {
                rows.push({
                    node: child,
                    key: child.key,
                    y,
                    height: child.height,
                    rowIndex: child.rowIndex,
                    level: child.level,
                });
                y += child.height;
                if (child.expand) walk(child);
            }
        };
        walk(this.rootRowNode);
        return rows;
    }
    buildLeafColNodes(): ColNode[] {
        const leaves: ColNode[] = [];
        const walk = (node: ColNode): void => {
            if (node.hide) return;
            if (!node.hasChildren) {
                if (!node.isRoot) leaves.push(node);
                return;
            }
            for (const child of node.childrenNodes) walk(child);
        };
        walk(this.rootColNode);
        return leaves;
    }
    firstVisibleLeaf(node: ColNode): ColNode | null {
        if (node.hide) return null;
        if (!node.hasChildren) return node.isRoot ? null : node;
        for (const child of node.childrenNodes) {
            const found = this.firstVisibleLeaf(child);
            if (found) return found;
        }
        return null;
    }
    // 更新数据,比如总高度、宽度，最大层级，和对应的rowIndex、colIndex等
    update() {
        if (this.debug) console.time('store update');
        this.generateRowIndex();
        this.sumHeight = this.rootRowNode.getSumHeight();
        this.sumWidth = this.rootColNode.getSumWidth();
        this.maxColLevel = this.rootColNode.getMaxColLevel();
        this.flatRows = this.buildFlatRows();
        this.leafColNodes = this.buildLeafColNodes();
        if (this.debug) {
            console.log('rowNodes SIZE:', this.rowNodeMaps.size);
            console.log('sumHeight', this.sumHeight);
            console.log('sumWidth', this.sumWidth);
            console.log('maxColLevel', this.maxColLevel);
            console.timeEnd('store update');
        }
    }
    /** 根据当前树生成扁平/树形节点数据，用于展示或调试 */
    getNodeDataTree(): TreeNodeData[] {
        const toData = (node: RowNode): TreeNodeData => ({
            key: node.key,
            level: node.level,
            checkState: node.getCheckState(),
            hasChildren: node.hasChildren,
            expand: node.getExpand(),
            rowIndex: node.rowIndex,
            parentKey: node.parentRowKey || null,
            children: node.childrenNodes.map(toData),
        });
        return this.rowNodes.map(toData);
    }
}

export type TreeNodeData = {
    key: RowNodeKey;
    level: number;
    rowIndex: number;
    checkState: CheckState;
    hasChildren: boolean;
    expand: boolean;
    parentKey: RowNodeKey | null;
    children: TreeNodeData[];
};

export default Store;