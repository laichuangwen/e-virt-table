import { MenuItem } from './types';
import Context from './Context';
import { computePosition, offset, flip, shift } from '@floating-ui/dom';
export default class ContextMenu {
    private ctx: Context;
    private contextMenuEl: HTMLDivElement;
    private viewportWidth: number;
    private viewportHeight: number;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.contextMenuEl = document.createElement('div');
        this.viewportWidth = document.documentElement.clientWidth;
        this.viewportHeight = document.documentElement.clientHeight;
        this.createContextMenu()
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
                //处理边界情况
                let posX = x
                let posY = y
                const cw = this.contextMenuEl.offsetWidth
                const ch = this.contextMenuEl.offsetHeight
                if (x > this.viewportWidth - cw) {
                    posX = x - cw;
                }
                if (y > this.viewportHeight - ch) {
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
            this.viewportWidth = document.documentElement.clientWidth;
            this.viewportHeight = document.documentElement.clientHeight;
        })
    }
    //创建右键菜单，绑定子项点击事件
    createContextMenu() {
        this.contextMenuEl.className = 'e-virt-table-context-menu';
        this.ctx.targetContainer.appendChild(this.contextMenuEl);
        const { CONTEXT_MENU } = this.ctx.config;
        this.createContextMenuItems(CONTEXT_MENU, (item: MenuItem) => {
            switch (item.value) {
                case 'copy':
                    // this.ctx.copy();//todo
                    break;
                case 'paste':
                    // this.ctx.paste();//todo
                    break;
                case 'cut':
                    // this.ctx.cut();//todo
                    break;
                case 'clearSelected':
                    // this.ctx.clearSelector();
                    // this.ctx.emit("draw");
                    break;
                default:
            }
            this.hide()
        });
    }
    //创建右键菜单子项元素
    createContextMenuItems(items: MenuItem[], callback: (e: MenuItem) => void) {
        items.forEach((item: MenuItem) => {
            const menuItemEl: HTMLDivElement = document.createElement('div');
            menuItemEl.className = 'e-virt-table-context-menu-item';
            menuItemEl.innerText = item.label;
            menuItemEl.onclick = () => callback(item);
            this.contextMenuEl.appendChild(menuItemEl);
        });
    }
    show() {
        this.contextMenuEl.style.display = 'block';
    }
    hide() {
        this.contextMenuEl.style.display = 'none';
    }
    destroy() {
        this.contextMenuEl.remove();
    }
}
