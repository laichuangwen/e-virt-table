import Cell from './Cell';
import { MenuItem } from './types';
import Context from './Context';
import { computePosition, offset, flip, shift } from '@floating-ui/dom';
export default class ContextMenu {
    private ctx: Context;
    private contextMenuEl: HTMLDivElement;
    private vw: number;
    private vh: number;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.contextMenuEl = document.createElement('div');
        this.contextMenuEl.className = 'e-virt-table-context-menu';
        this.ctx.targetContainer.appendChild(this.contextMenuEl);
        const { CONTEXT_MENU } = this.ctx.config;
        this.createContextMenuItems(CONTEXT_MENU, (e) => {
            console.log(e.value);

        });
        this.vw = document.documentElement.clientWidth;
        this.vh = document.documentElement.clientHeight;
        this.init();
    }
    private init() {
        this.ctx.on('contextMenu', (e: MouseEvent) => {
            const virtualReference = {
                getBoundingClientRect: () => ({
                    width: 0,
                    height: 0,
                    top: e.clientY,
                    left: e.clientX,
                    right: e.clientX,
                    bottom: e.clientY,
                    x: e.clientX,
                    y: e.clientY
                }),
                contextElement: document.body,
            };
            computePosition(virtualReference, this.contextMenuEl, {
                placement: 'right-start',
                middleware: [offset(10), shift(), flip()],
            }).then(({ x, y }) => {
                this.show()
                let posX = x
                let posY = y
                const cw = this.contextMenuEl.offsetWidth
                const ch = this.contextMenuEl.offsetHeight
                if (x > this.vw - cw) {
                    posX = x - cw;
                }
                if (y > this.vh - ch) {
                    posY = y - ch;
                }
                x = Math.min(x, posX)
                y = Math.min(y, posY)
                Object.assign(this.contextMenuEl.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                });
            });
        });
        this.ctx.on('click', this.hide.bind(this));
        this.ctx.on('wheel', this.hide.bind(this))
        this.ctx.on('resize', () => {
            this.vw = document.documentElement.clientWidth;
            this.vh = document.documentElement.clientHeight;
        })
    }
    createContextMenuItems(items: MenuItem[], callback: (e: MenuItem) => void) {
        items.forEach((item) => {
            this.contextMenuEl.appendChild(this.createContextMenuItem(item, callback));
        });
    }
    createContextMenuItem(menuItem: MenuItem, callback: (e: MenuItem) => void) {
        const item = document.createElement('div');
        item.className = 'e-virt-table-context-menu-item';
        item.innerText = menuItem.label;
        item.onclick = () => callback(menuItem);
        return item;
    }
    show(){
        this.contextMenuEl.style.display = 'block';
    }
    hide() {
        this.contextMenuEl.style.display = 'none';
    }
    destroy() {
        this.contextMenuEl.remove();
    }
}
