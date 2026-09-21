import type { Fixed, Column } from "../types";
import Context from "./Context";

export type RowNodeProps = {
    data: Record<string, any>;
    store: Store;
};
type RowNodeKey = string | number;
type ColNodeKey = string | number;
export type CheckState = 'unchecked' | 'checked' | 'indeterminate' | 'disabled';
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
}
export type ColNodeProps = {
    column: Column;
    store: Store;
};
export class ColNode {
    private store: Store;
    private colStore: ColStore;
    x = -1;
    y = -1;
    colIndex = -1;
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
            this.colStore.width = this.column.width ?? 100;
            this.colStore.height = this.column.height ?? this.store.defaultColHeight;
            this.colStore.hide = typeof this.column.hide === 'function' ? this.column.hide({}) : this.column.hide ?? false;
            this.colStore.sort = this.column.sort ?? 0;
            this.colStore.fixed = this.column.fixed ?? '';
        }
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
    /** 列自身高度（不含跨行撑满） */
    get ownHeight(): number {
        if (this.isRoot || this.hide) return 0;
        return this.colStore.height;
    }
    get height(): number {
        if (this.isRoot || this.hide) return 0;
        // 父级只占自身一层；叶子撑满到表头底部
        if (this.hasChildren) return this.ownHeight;
        if (this.store.headerHeight <= 0) return this.ownHeight;
        return Math.max(this.ownHeight, this.store.headerHeight - this.y);
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
    setX(x: number) {
        this.x = x;
    }
    setY(y: number) {
        this.y = y;
    }
    setColIndex(colIndex: number) {
        this.colIndex = colIndex;
    }
    setHide(hide: boolean) {
        this.colStore.hide = hide;
    }
    setSort(sort: number) {
        this.colStore.sort = sort;
        this.parentNode?.sortChildren();
    }
    setFixed(fixed: Fixed) {
        this.colStore.fixed = fixed;
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
    getRenderNodes(): ColNode[] {
        if (this.hide) return [];
        if (!this.hasChildren) return [this];
        return this.childrenNodes.flatMap(child => child.getRenderNodes());
    }
    getSumWidth(): number {
        let sumWidth = 0;
        for (const child of this.childrenNodes) {
            if (child.hide) continue;
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
        if (!this.getSelectable()) {
            return 'disabled';
        }
        return this.rowStore.checkState;
    }
    setChecked(state: CheckState, ignoreChild: boolean = false, ignoreParent: boolean = false) {
        if (!this.getSelectable()) {
            this.rowStore.checkState = 'disabled';
            return;
        }
        this.rowStore.checkState = state;
        if (!ignoreChild) {
            for (const child of this.childrenNodes) {
                child.setChecked(state, false, ignoreParent);
            }
        }
        if (this.parentNode && !ignoreParent) {
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

export type StoreProps = {
    context: Context;
    columns: Column[];
    data: any[];
}

class Store {
    private rootRowNode!: RowNode;
    private rootColNode!: ColNode;
    private context!: Context;
    rootKey = 'root_evt';
    uuidKey = 'id';
    childrenKey = 'children';
    rootColKey = 'root_col_evt';
    childrenColKey = 'children';
    hasTree = true;
    hasSelection = false;
    debug = true;
    defaultRowHeight = 36;
    defaultColHeight = 36;
    maxColLevel = 0;
    headerHeight = 0;
    sumHeight = 0;
    sumWidth = 0;
    fixedLeftWidth = 0;
    fixedRightWidth = 0;
    columns: Column[] = [];
    data: any[] = [];
    // flatRows: FlatRow[] = [];
    leftColNodes: ColNode[] = [];
    rightColNodes: ColNode[] = [];
    centerColNodes: ColNode[] = [];
    leafColNodes: ColNode[] = [];
    renderColNodes: ColNode[] = [];
    rowStoreMaps: Map<RowNodeKey, RowStore> = new Map();
    colStoreMaps: Map<string, ColStore> = new Map();
    rowNodeMaps: Map<RowNodeKey, RowNode> = new Map();
    colNodeMaps: Map<string, ColNode> = new Map();
    rowSelectable: RowSelectable | undefined;
    constructor(props: { context: Context; columns: Column[]; data: any[]; defaultRowHeight?: number; uuidKey?: string; childrenKey?: string; hasTree?: boolean }) {
        const { context, columns, data } = props;
        this.context = context;
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
        // this.rowSelectable = (params: RowSelectableParams) => {
        //     return false;
        // }
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
    clearSelection() {
        this.rootRowNode.setChecked('unchecked', false, true);
    }
    toggleRowSelection() {
        const checkState = this.context.store.getStoreCheckState();
        if (checkState === 'checked') {
            this.rootRowNode.setChecked('unchecked', false, true);
        } else {
            this.rootRowNode.setChecked('checked', false, true);
        }
    }
    setCheckAll(checked: boolean) {
        // 忽略向上查找父级
        this.rootRowNode.setChecked(checked ? 'checked' : 'unchecked', false, true);
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
    /** 一次遍历生成 colIndex 与 x/y：父级 colIndex 取第一个可见叶子；y 用 ownHeight 下推 */
    generateColLayout(nodes: ColNode[], originX: number, originY: number) {
        let index = 0;
        const walk = (list: ColNode[], x: number, y: number): void => {
            let everyOffsetX = x;
            for (const child of list) {
                if (child.hide) continue;
                child.setX(everyOffsetX);
                child.setY(y);
                if (child.hasChildren) {
                    child.setColIndex(index);
                    walk(child.childrenNodes, everyOffsetX, y + child.ownHeight);
                } else {
                    child.setColIndex(index++);
                }
                everyOffsetX += child.width;
            }
        };
        walk(nodes, originX, originY);
    }
    /** 按叶子路径 y + ownHeight 取最大，作为表头总高 */
    computeHeaderHeight(): number {
        let max = 0;
        for (const leaf of this.leafColNodes) {
            max = Math.max(max, leaf.y + leaf.ownHeight);
        }
        return max;
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
    buildLCRColNodes() {
        const leftColNodes = [];
        const rightColNodes = [];
        const centerColNodes = [];
        for (const colNode of this.colNodes) {
            // if (colNode.hide) continue;
            if (colNode.fixed === 'left') {
                leftColNodes.push(colNode);
            } else if (colNode.fixed === 'right') {
                rightColNodes.push(colNode);
            } else {
                centerColNodes.push(colNode);
            }
        }
        return {
            leftColNodes,
            rightColNodes,
            centerColNodes,
        };
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
    private getLeafWidth(colNodes: ColNode[]): number {
        return colNodes.reduce((acc, colNode) => {
            if (!colNode.hide && !colNode.hasChildren) {
                return acc + colNode.width;
            }
            return acc;
        }, 0);
    }
    // 更新数据,比如总高度、宽度，最大层级，和对应的rowIndex、colIndex等
    update() {
        if (this.debug) console.time('store update');
        this.generateRowIndex();
        this.sumHeight = this.rootRowNode.getSumHeight();
        this.sumWidth = this.rootColNode.getSumWidth();
        this.maxColLevel = this.rootColNode.getMaxColLevel();
        this.leafColNodes = this.buildLeafColNodes();
        const { leftColNodes, rightColNodes, centerColNodes } = this.buildLCRColNodes();
        this.leftColNodes = leftColNodes;
        this.rightColNodes = rightColNodes;
        this.centerColNodes = centerColNodes;
        this.renderColNodes = [...leftColNodes, ...centerColNodes, ...rightColNodes];
        this.fixedLeftWidth = this.getLeafWidth(leftColNodes);
        this.fixedRightWidth = this.getLeafWidth(rightColNodes);
        // 布局前清空，避免叶子 height 依赖旧的 headerHeight
        this.headerHeight = 0;
        this.generateColLayout(this.renderColNodes, 0, 0);
        this.headerHeight = this.computeHeaderHeight();
        console.log(this);

        if (this.debug) {
            console.log('rowNodes SIZE:', this.rowNodeMaps.size);
            console.log('sumHeight', this.sumHeight);
            console.log('sumWidth', this.sumWidth);
            console.log('maxColLevel', this.maxColLevel);
            console.log('maxColLevel', this.maxColLevel);
            console.log('leafColNodes', this.renderColNodes);
            this.setChecked('1', 'checked')

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