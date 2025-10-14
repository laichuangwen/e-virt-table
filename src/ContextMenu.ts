import { Column, MenuItem } from './types';
import Context from './Context';
import Cell from './Cell';
import CellHeader from './CellHeader';
import { DOMTreeMenu } from './DOMTreeMenu';
import { toLeaf } from './util';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
export default class ContextMenu {
    private ctx: Context;
    private contextMenuEl: HTMLDivElement;
    private currentDOMTreeMenu?: DOMTreeMenu;
    private isCustom = false;
    constructor(ctx: Context) {
        this.ctx = ctx;
        if (this.ctx.contextMenuElement) {
            this.contextMenuEl = this.ctx.contextMenuElement;
            this.contextMenuEl.className = 'e-virt-table-main-menu';
            this.isCustom = true;
        } else {
            this.contextMenuEl = document.createElement('div');
            this.isCustom = false;
        }
        this.ctx.containerElement.appendChild(this.contextMenuEl);
        this.init();
    }
    private init() {
        this.ctx.on('outsideMousedown', () => {
            this.hide();
        });
        this.ctx.on('cellContextMenuClick', (cell: Cell, e: MouseEvent) => {
            if (this.isCustom) {
                this.contextMenuEl.style.display = 'block';
                this.positionMenu(e);
                return;
            }
            const { ENABLE_CONTEXT_MENU, CUSTOM_BODY_CONTEXT_MENU, CONTEXT_MENU } = this.ctx.config;
            const list = [...CONTEXT_MENU, ...CUSTOM_BODY_CONTEXT_MENU];
            if (!ENABLE_CONTEXT_MENU || list.length === 0) return;
            e.preventDefault();
            const { xArr, yArr } = this.ctx.selector;
            const [minX, maxX] = xArr;
            const [minY, maxY] = yArr;
            const { rowIndex, colIndex } = cell;
            //判断是否在范围内
            const isInRange = rowIndex >= minY && rowIndex <= maxY && colIndex >= minX && colIndex <= maxX;
            if (!isInRange) {
                this.ctx.emit('setSelectorCell', cell, e);
            }
            // 先清理之前的菜单实例
            if (this.currentDOMTreeMenu) {
                this.currentDOMTreeMenu.destroy();
            }
            this.ctx.contextMenuIng = true;
            this.currentDOMTreeMenu = new DOMTreeMenu(this.contextMenuEl, list, {
                onClick: (_itemData: MenuItem, value: string) => {
                    if (value === 'copy') {
                        this.ctx.emit('contextMenuCopy');
                        this.hide();
                    } else if (value === 'paste') {
                        this.ctx.emit('contextMenuPaste');
                        this.hide();
                    } else if (value === 'cut') {
                        this.ctx.emit('contextMenuCut');
                        this.hide();
                    } else if (value === 'clearSelected') {
                        this.ctx.emit('contextMenuClearSelected');
                        this.hide();
                    }
                },
            });
            this.currentDOMTreeMenu.positionMenu(e);
        });
        this.ctx.on('cellHeaderContextMenuClick', (cell: CellHeader, e: MouseEvent) => {
            if (this.isCustom) {
                this.contextMenuEl.style.display = 'block';
                this.positionMenu(e);
                return;
            }
            // 判断是否在范围内
            const { SELECTOR_AREA_MIN_X, SELECTOR_AREA_MAX_X, SELECTOR_AREA_MAX_X_OFFSET } = this.ctx.config;
            const areaMinX = SELECTOR_AREA_MIN_X;
            const areaMaxX = SELECTOR_AREA_MAX_X || this.ctx.maxColIndex - SELECTOR_AREA_MAX_X_OFFSET;
            if (cell.colIndex < areaMinX || cell.colIndex > areaMaxX) {
                return;
            }
            const { HEADER_CONTEXT_MENU, CUSTOM_HEADER_CONTEXT_MENU, ENABLE_HEADER_CONTEXT_MENU } = this.ctx.config;
            const list = [...HEADER_CONTEXT_MENU, ...CUSTOM_HEADER_CONTEXT_MENU];
            if (!ENABLE_HEADER_CONTEXT_MENU || list.length === 0) return;
            e.preventDefault();
            const { xArr } = this.ctx.selector;
            const [minX, maxX] = xArr;
            const { colIndex } = cell;
            //判断是否在范围内
            const isInRange = colIndex >= minX && colIndex <= maxX;
            if (!isInRange) {
                this.ctx.focusCellHeader = cell;
                this.ctx.emit('selectCols', cell);
            }
            if (this.currentDOMTreeMenu) {
                this.currentDOMTreeMenu.destroy();
            }
            const columns = this.ctx.database.getColumns();
            const menuData = list.map((item) => {
                if (item.value === 'visible') {
                    return {
                        ...item,
                        children: this.filterColumns(columns),
                    };
                }
                return item;
            });
            this.ctx.contextMenuIng = true;
            this.currentDOMTreeMenu = new DOMTreeMenu(this.contextMenuEl, menuData, {
                onClick: (_itemData: MenuItem, value: string) => {
                    const { xArr } = this.ctx.selector;
                    const [minX, maxX] = xArr;
                    if (value === 'fixedLeft' || value === 'fixedRight' || value === 'fixedNone') {
                        const fixedKeys = this.ctx.header.allCellHeaders
                            .filter((item) => item.colIndex >= minX && item.colIndex <= maxX)
                            .filter((item) => item.level === 0)
                            .filter((item) => !item.column.fixedDisabled)
                            .map((item) => item.key);
                        this.ctx.database.setCustomHeaderFixedData(
                            fixedKeys,
                            value === 'fixedLeft' ? 'left' : value === 'fixedRight' ? 'right' : '',
                        );
                        this.hide();
                    } else if (value === 'hide') {
                        const hideKeys = this.ctx.header.leafCellHeaders
                            .filter((item) => item.colIndex >= minX && item.colIndex <= maxX)
                            .filter((item) => !item.children.length)
                            .filter((item) => !item.column.hideDisabled)
                            .map((item) => item.key);
                        if (hideKeys.length > 0) {
                            this.ctx.database.setCustomHeaderHideData(hideKeys, true);
                        }
                        this.hide();
                    } else if (value === 'visible') {
                        // 这个分支不应该被触发，因为 visible 是父菜单项
                    } else if (value.startsWith('visible_')) {
                        // 处理取消隐藏特定列
                        const columnKey = value.replace('visible_', '');
                        this.ctx.database.setCustomHeaderHideData([columnKey], false);
                        // 直接删除对应的子菜单项
                        if (this.currentDOMTreeMenu) {
                            this.currentDOMTreeMenu.removeSubMenuItem(value);
                        }
                        // 检查是否还有隐藏的列
                        const columns = this.ctx.database.getColumns();
                        const leafColumns = toLeaf(columns);
                        const remainingHideColumns = leafColumns.filter((item) => item.hide);
                        if (remainingHideColumns.length === 0) {
                            // 如果没有隐藏的列了，隐藏菜单
                            this.hide();
                        }
                    } else if (value === 'resetHeader') {
                        this.ctx.database.resetCustomHeader();
                        this.hide();
                    }
                },
            });
            this.positionMenu(e);
        });
        this.ctx.on('click', () => {
            this.hide();
        });
        this.ctx.on('onScroll', this.hide.bind(this));
        this.ctx.on('resize', this.hide.bind(this));
    }
    private positionMenu(e: MouseEvent): void {
        const virtualReference = {
            getBoundingClientRect: () => ({
                width: 0,
                height: 0,
                top: e.clientY,
                left: e.clientX,
                right: e.clientX,
                bottom: e.clientY,
                x: e.clientX,
                y: e.clientY,
            }),
            contextElement: document.body,
        };
        autoUpdate(virtualReference, this.contextMenuEl, () => {
            computePosition(virtualReference, this.contextMenuEl, {
                placement: 'right-start',
                middleware: [offset(), shift(), flip()],
            }).then(({ x, y }) => {
                if (this.contextMenuEl) {
                    Object.assign(this.contextMenuEl.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    });
                }
            });
        });
    }
    private filterColumns(columns: Column[]): MenuItem[] {
        const result: MenuItem[] = [];

        for (const col of columns) {
            // 有 children，递归过滤
            if (col.children && col.children.length > 0) {
                const filteredChildren = this.filterColumns(col.children);
                if (filteredChildren.length > 0) {
                    result.push({
                        label: col.title,
                        value: `visible_${col.key}`,
                        disabled: true, // 非末级，且有子项保留 → disabled
                        children: filteredChildren,
                    });
                }
            }
            // 末级节点，保留 hide===true 的
            else if (col.hide) {
                result.push({ label: col.title, value: `visible_${col.key}` });
            }
        }

        return result;
    }
    hide() {
        if (this.currentDOMTreeMenu) {
            this.currentDOMTreeMenu.destroy();
            this.currentDOMTreeMenu = undefined;
        }
        this.contextMenuEl.style.display = 'none';
        this.ctx.contextMenuIng = false;
    }
    destroy() {
        this.hide();
        this.contextMenuEl?.remove();
    }
}
