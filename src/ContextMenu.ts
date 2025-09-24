import { MenuItem } from './types';
import Context from './Context';
import Cell from './Cell';
import CellHeader from './CellHeader';
import { DOMTreeMenu } from './DOMTreeMenu';
import { toLeaf } from './util';
export default class ContextMenu {
    private ctx: Context;
    private contextMenuEl: HTMLDivElement;
    private currentDOMTreeMenu?: DOMTreeMenu;
    constructor(ctx: Context) {
        this.ctx = ctx;
        if (this.ctx.contextMenuElement) {
            this.contextMenuEl = this.ctx.contextMenuElement;
        } else {
            this.contextMenuEl = document.createElement('div');
        }
        this.ctx.containerElement.appendChild(this.contextMenuEl);
        this.init();
    }
    private init() {
        this.ctx.on('outsideMousedown', () => {
            this.hide();
        });
        this.ctx.on('cellContextMenuClick', (cell: Cell, e: MouseEvent) => {
            if (!this.ctx.config.ENABLE_CONTEXT_MENU) return;
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
            this.currentDOMTreeMenu = new DOMTreeMenu(this.contextMenuEl, this.ctx.config.CONTEXT_MENU, {
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
            if (!this.ctx.config.ENABLE_CONTEXT_MENU) return;
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
            const leafColumns = toLeaf(columns);
            const hideColumns = leafColumns.filter((item) => item.hide);
            const menuData = this.ctx.config.CONTEXT_HEADER_MENU.map((item) => {
                if (item.value === 'cancelHide') {
                    return {
                        ...item,
                        children: hideColumns.map((column) => ({
                            label: column.title,
                            value: `cancelHide_${column.key}`, // 使用唯一的值来标识每个隐藏的列
                        })),
                    };
                }
                return item;
            });
            this.ctx.contextMenuIng = true;
            this.currentDOMTreeMenu = new DOMTreeMenu(this.contextMenuEl, menuData, {
                onClick: (_itemData: MenuItem, value: string) => {
                    const { xArr } = this.ctx.selector;
                    const [minX, maxX] = xArr;
                    if (value === 'fixedLeft' || value === 'fixedRight' || value === 'noFixed') {
                        const fixedKeys = this.ctx.header.allCellHeaders
                            .filter((item) => item.colIndex >= minX && item.colIndex <= maxX)
                            .filter((item) => item.level === 0)
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
                            .map((item) => item.key);
                        this.ctx.database.setCustomHeaderHideData(hideKeys, true);
                        this.hide();
                    } else if (value === 'cancelHide') {
                        // 这个分支不应该被触发，因为 cancelHide 是父菜单项
                    } else if (value.startsWith('cancelHide_')) {
                        // 处理取消隐藏特定列
                        const columnKey = value.replace('cancelHide_', '');
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
            this.currentDOMTreeMenu.positionMenu(e);
        });
        this.ctx.on('click', () => {
            this.hide();
        });
        this.ctx.on('onScroll', this.hide.bind(this));
        this.ctx.on('resize', this.hide.bind(this));
    }

    hide() {
        if (this.currentDOMTreeMenu) {
            this.currentDOMTreeMenu.hide();
            this.currentDOMTreeMenu.destroy();
            this.currentDOMTreeMenu = undefined;
        }
        this.ctx.contextMenuIng = false;
    }
    destroy() {
        if (this.currentDOMTreeMenu) {
            this.currentDOMTreeMenu.destroy();
            this.currentDOMTreeMenu = undefined;
        }
        this.contextMenuEl?.remove();
    }
}
