import { MenuItem } from './types';
import Context from './Context';
import { computePosition, offset, flip, shift } from '@floating-ui/dom';
import Cell from './Cell';
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
        this.createContextMenu();
        this.init();
    }
    private init() {
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
            computePosition(virtualReference, this.contextMenuEl, {
                placement: 'right-start',
                middleware: [offset(), shift(), flip()],
            }).then(({ x, y }) => {
                this.show(x, y);
            });
        });
        this.ctx.on('click', this.hide.bind(this));
        this.ctx.on('onScroll', this.hide.bind(this));
        this.ctx.on('resize', this.hide.bind(this));
    }
    //创建右键菜单，绑定子项点击事件
    private createContextMenu() {
        this.contextMenuEl.className = 'e-virt-table-context-menu';
        this.ctx.containerElement.appendChild(this.contextMenuEl);
        // 如果是自定义右键菜单，则不创建默认子菜单
        if(this.custom) return;
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
    //创建右键菜单子项元素
    private createContextMenuItems(items: MenuItem[], callback: (e: MenuItem) => void) {
        this.contextMenuEl.replaceChildren();
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
            this.contextMenuEl.appendChild(menuItemEl);
        });
    }
    private show(x: Number, y: Number) {
        Object.assign(this.contextMenuEl.style, {
            left: `${x}px`,
            top: `${y}px`,
        });
    }
    hide() {
        Object.assign(this.contextMenuEl.style, {
            left: '-99999px',
            top: '-99999px',
        });
    }
    updated() {
        this.createContextMenu();
    }
    destroy() {
        this.contextMenuEl.remove();
    }
}
