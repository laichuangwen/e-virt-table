import { MenuItem } from './types';
import Context from './Context';
import { computePosition, offset, flip, shift, autoUpdate } from '@floating-ui/dom';
import Cell from './Cell';
import CellHeader from './CellHeader';
export default class ContextMenu {
    private ctx: Context;
    private contextMenuEl: HTMLDivElement;
    private custom = false;
    constructor(ctx: Context) {
        this.ctx = ctx;
        if (this.ctx.contextMenuElement) {
            this.custom = true;
            this.contextMenuEl = this.ctx.contextMenuElement;
        } else {
            this.custom = false;
            this.contextMenuEl = document.createElement('div');
        }
        this.init();
    }
    private onClickOutside = (e: MouseEvent) => {
        if (!this.contextMenuEl?.contains(e.target as Node)) {
            this.hide();
        }
    };
    private init() {
        document.addEventListener('click', this.onClickOutside);
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
            this.createContextMenu(cell);
            this.handleMenuElPosition(e);
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
            this.createContextMenu(cell);
            this.handleMenuElPosition(e);
        });
        this.ctx.on('click', this.hide.bind(this));
        this.ctx.on('onScroll', this.hide.bind(this));
        this.ctx.on('resize', this.hide.bind(this));
    }
    //创建右键菜单，绑定子项点击事件
    private createContextMenu(cell?: Cell | CellHeader) {
        this.contextMenuEl.className = 'e-virt-table-context-menu';
        this.contextMenuEl.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        this.ctx.contextMenuIng = true;
        this.ctx.containerElement.appendChild(this.contextMenuEl);
        // 如果是自定义右键菜单，则不创建默认子菜单
        if (this.custom) return;
        if (cell instanceof CellHeader) {
            const { CONTEXT_HEADER_MENU } = this.ctx.config;
            const { xArr } = this.ctx.selector;
            const [minX, maxX] = xArr;
            const fixedKeys = this.ctx.header.allCellHeaders
                .filter((item) => item.colIndex >= minX && item.colIndex <= maxX)
                .filter((item) => item.level === 0)
                .map((item) => item.key);
            const hideKeys = this.ctx.header.leafCellHeaders
                .filter((item) => item.colIndex >= minX && item.colIndex <= maxX)
                .filter((item) => !item.children.length)
                .map((item) => item.key);

            this.createContextMenuItems(CONTEXT_HEADER_MENU, (item: MenuItem) => {
                if (item.value === 'cancelHide') {
                    // 显示子菜单
                    return;
                }
                switch (item.value) {
                    case 'fixedLeft':
                        this.ctx.database.setCustomHeaderFixedData(fixedKeys, 'left');
                        break;
                    case 'fixedRight':
                        this.ctx.database.setCustomHeaderFixedData(fixedKeys, 'right');
                        break;
                    case 'noFixed':
                        this.ctx.database.setCustomHeaderFixedData(fixedKeys, '');
                        break;
                    case 'hide':
                        this.ctx.database.setCustomHeaderHideData(hideKeys, true);
                        break;
                    case 'resetHeader':
                        this.ctx.database.resetCustomHeader();
                        break;
                }
                this.ctx.emit('resetHeader');
                this.hide();
            });
        } else {
            const { CONTEXT_MENU } = this.ctx.config;
            this.createContextMenuItems(CONTEXT_MENU, (item: MenuItem) => {
                switch (item.value) {
                    case 'copy':
                        this.ctx.emit('contextMenuCopy');
                        break;
                    case 'paste':
                        this.ctx.emit('contextMenuPaste');
                        break;
                    case 'cut':
                        this.ctx.emit('contextMenuCut');
                        break;
                    case 'clearSelected':
                        this.ctx.emit('contextMenuClearSelected');
                        break;
                    default:
                }
                this.hide();
            });
        }
    }
    //创建右键菜单子项元素
    private createContextMenuItems(items: MenuItem[], callback: (e: MenuItem) => void) {
        this.contextMenuEl.replaceChildren();
        // 使用 DocumentFragment 批量添加子元素，避免多次 DOM 操作
        const fragment = document.createDocumentFragment();
        items.forEach((item: MenuItem) => {
            const menuItemEl: HTMLDivElement = document.createElement('div');
            menuItemEl.className = 'e-virt-table-context-menu-item';
            menuItemEl.innerText = item.label;
            if (item.event) {
                menuItemEl.onclick = () => {
                    item.event && item.event();
                    callback(item);
                };
            } else {
                menuItemEl.onclick = () => callback(item);
            }
            fragment.appendChild(menuItemEl);
        });

        // 一次性添加所有子元素
        this.contextMenuEl.appendChild(fragment);
    }
    private handleMenuElPosition(e: MouseEvent) {
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
    hide() {
        this.contextMenuEl?.remove();
        this.ctx.contextMenuIng = false;
    }
    destroy() {
        this.contextMenuEl?.remove();
        document.removeEventListener('click', this.onClickOutside);
    }
}
