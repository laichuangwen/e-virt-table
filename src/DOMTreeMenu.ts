import { computePosition, autoUpdate, flip, shift, offset } from '@floating-ui/dom';
import { MenuItem } from './types';
import { expandSvg } from './Icons';

export interface MenuOptions {
    onClick?: (itemData: MenuItem, value: string) => void;
}

interface MenuElement extends HTMLElement {
    _submenu?: HTMLElement;
    _cleanup?: () => void;
}

export class DOMTreeMenu {
    private container: HTMLElement;
    private menuData: MenuItem[];
    private onClick?: (itemData: MenuItem, value: string) => void;
    private activeSubmenus = new Set<HTMLElement>();
    private boundMouseEnterHandler: (e: MouseEvent) => void;
    private boundMouseLeaveHandler: (e: MouseEvent) => void;
    private boundClickHandler: (e: MouseEvent) => void;

    constructor(container: HTMLElement, menuData: MenuItem[] = [], options: MenuOptions = {}) {
        this.container = container;
        this.menuData = menuData;
        this.onClick = options.onClick;
        // 绑定事件处理器
        this.boundMouseEnterHandler = (e: MouseEvent) => this.handleMouseEvent(e, 'enter');
        this.boundMouseLeaveHandler = (e: MouseEvent) => this.handleMouseEvent(e, 'leave');
        this.boundClickHandler = (e: MouseEvent) => this.handleClick(e);

        this.createMenu();
        this.bindEvents();
    }

    private createMenu(): void {
        this.container.className = 'e-virt-table-main-menu';
        // 确保菜单可见
        this.container.style.display = 'block';
        const mainMenu = document.createDocumentFragment();
        this.menuData.forEach((item) => {
            mainMenu.appendChild(this.createMenuItem(item));
        });
        this.container.appendChild(mainMenu);
    }

    private createMenuItem(item: MenuItem, isSubmenu = false): HTMLElement {
        const menuItem = this.createElement(
            'div',
            isSubmenu ? 'e-virt-table-submenu-item' : 'e-virt-table-menu-item',
        ) as MenuElement;

        menuItem.setAttribute(isSubmenu ? 'data-submenu' : 'data-menu', item.value);

        if (item.disabled) menuItem.classList.add('disabled');

        const contentContainer = this.createElement('div', 'menu-item-content');

        if (item.icon) {
            const iconContainer = this.createElement('span', 'menu-item-icon');
            iconContainer.innerHTML = item.icon;
            contentContainer.appendChild(iconContainer);
        } else {
            contentContainer.classList.add('menu-item-no-icon');
        }

        const textSpan = this.createElement('span', 'menu-item-text');
        textSpan.textContent = item.label;
        contentContainer.appendChild(textSpan);
        menuItem.appendChild(contentContainer);

        if (item.children?.length) {
            const arrowContainer = this.createElement('span', 'e-virt-table-menu-arrow');
            arrowContainer.innerHTML = expandSvg;
            menuItem.appendChild(arrowContainer);
            const submenu = this.createSubmenu(item.children);
            menuItem._submenu = submenu;
            this.container.appendChild(submenu);
        }

        return menuItem;
    }

    private createSubmenu(submenuData: MenuItem[]): HTMLElement {
        const submenu = this.createElement('div', 'e-virt-table-submenu');
        submenuData.forEach((item) => {
            submenu.appendChild(this.createMenuItem(item, true));
        });
        return submenu;
    }

    private createElement(tagName: string, className = ''): HTMLElement {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        return element;
    }

    private bindEvents(): void {
        this.container.addEventListener('mouseenter', this.boundMouseEnterHandler, true);
        this.container.addEventListener('mouseleave', this.boundMouseLeaveHandler, true);
        this.container.addEventListener('click', this.boundClickHandler);
    }

    private handleMouseEvent(e: MouseEvent, type: 'enter' | 'leave'): void {
        // 阻止事件冒泡，防止触发外部的鼠标事件
        e.stopPropagation();

        const target = e.target as HTMLElement;
        const menuItem = target.closest('.e-virt-table-menu-item, .e-virt-table-submenu-item') as MenuElement;

        if (
            menuItem &&
            (this.container.contains(menuItem) || menuItem.classList.contains('e-virt-table-submenu-item'))
        ) {
            if (type === 'enter') {
                this.handleHover(menuItem);
            } else {
                this.handleLeave(menuItem);
            }
        }
    }

    private handleHover(menuItem: MenuElement): void {
        if (menuItem.classList.contains('e-virt-table-menu-item')) {
            this.container
                .querySelectorAll('.e-virt-table-menu-item')
                .forEach((item) => item.classList.remove('active'));
            if (!menuItem.classList.contains('disabled')) {
                menuItem.classList.add('active');
            }
        }

        const submenu = menuItem._submenu || (menuItem.querySelector('.e-virt-table-submenu') as HTMLElement | null);
        if (submenu) {
            this.showSubmenu(menuItem, submenu);
        }
    }

    private handleLeave(menuItem: MenuElement): void {
        const submenu = menuItem._submenu || menuItem.querySelector('.e-virt-table-submenu');

        setTimeout(() => {
            const submenuEl = submenu as HTMLElement | null;
            if (submenuEl && !submenuEl.matches(':hover') && !menuItem.matches(':hover')) {
                this.hideSubmenu(submenuEl);
                if (menuItem.classList.contains('e-virt-table-menu-item')) {
                    menuItem.classList.remove('active');
                }
            }
        }, 150);
    }

    private async showSubmenu(trigger: HTMLElement, submenu: HTMLElement): Promise<void> {
        if (this.activeSubmenus.has(submenu)) return;

        this.activeSubmenus.add(submenu);
        submenu.classList.add('show');

        const cleanup = autoUpdate(trigger, submenu, async () => {
            const { x, y } = await computePosition(trigger, submenu, {
                placement: 'right-start',
                middleware: [offset(8), flip(), shift({ padding: 8 })],
            });

            Object.assign(submenu.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });

        (submenu as MenuElement)._cleanup = cleanup;
    }

    private hideSubmenu(submenu: HTMLElement): void {
        if (!this.activeSubmenus.has(submenu)) return;

        this.activeSubmenus.delete(submenu);
        submenu.classList.remove('show');

        this.hideAllChildSubmenus(submenu);

        const menuElement = submenu as MenuElement;
        if (menuElement._cleanup) {
            menuElement._cleanup();
            delete menuElement._cleanup;
        }
    }

    private hideAllChildSubmenus(parentSubmenu: HTMLElement): void {
        const childMenuItems = parentSubmenu.querySelectorAll('.e-virt-table-submenu-item') as NodeListOf<MenuElement>;
        childMenuItems.forEach((menuItem) => {
            if (menuItem._submenu) {
                const childSubmenu = menuItem._submenu;
                if (this.activeSubmenus.has(childSubmenu)) {
                    this.activeSubmenus.delete(childSubmenu);
                    childSubmenu.classList.remove('show');

                    const menuElement = childSubmenu as MenuElement;
                    if (menuElement._cleanup) {
                        menuElement._cleanup();
                        delete menuElement._cleanup;
                    }

                    this.hideAllChildSubmenus(childSubmenu);
                }
            }
        });
    }

    private handleClick(e: MouseEvent): void {
        // 阻止事件冒泡，防止触发外部的点击事件
        e.stopPropagation();

        const menuItem = (e.target as HTMLElement).closest(
            '.e-virt-table-menu-item, .e-virt-table-submenu-item',
        ) as MenuElement;
        if(!menuItem) return;
        if (menuItem.classList.contains('disabled')) return;

        // 如果点击的是有子菜单的菜单项，先显示子菜单
        if (menuItem.classList.contains('e-virt-table-menu-item')) {
            const submenu =
                menuItem._submenu || (menuItem.querySelector('.e-virt-table-submenu') as HTMLElement | null);
            if (submenu) {
                this.showSubmenu(menuItem, submenu);
                return; // 不执行点击回调，只是显示子菜单
            }
        }

        const menuValue = menuItem.getAttribute('data-menu') || menuItem?.getAttribute('data-submenu');
        const itemData = this.findMenuItem(menuValue || '');

        if (itemData) {
            if (itemData.event) {
                itemData.event(e, this.hide.bind(this));
            }
            if (this.onClick) {
                this.onClick(itemData, menuValue || '');
            }
        }
    }

    private findMenuItem(value: string, items: MenuItem[] = this.menuData): MenuItem | null {
        for (const item of items) {
            if (item.value === value) return item;
            if (item.children) {
                const found = this.findMenuItem(value, item.children);
                if (found) return found;
            }
        }
        return null;
    }

    public positionMenu(e: MouseEvent): void {
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
        autoUpdate(virtualReference, this.container, () => {
            computePosition(virtualReference, this.container, {
                placement: 'right-start',
                middleware: [offset(), shift(), flip()],
            }).then(({ x, y }) => {
                if (this.container) {
                    Object.assign(this.container.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    });
                }
            });
        });
    }

    private hide(): void {
        // 隐藏菜单
        this.cleanupAllSubmenus(this.container);
        this.container.style.display = 'none';
    }

    public destroy(): void {
        // 移除事件监听器
        this.container.removeEventListener('mouseenter', this.boundMouseEnterHandler, true);
        this.container.removeEventListener('mouseleave', this.boundMouseLeaveHandler, true);
        this.container.removeEventListener('click', this.boundClickHandler);
        // 递归清理所有子菜单
        this.cleanupAllSubmenus(this.container);

        // 隐藏菜单
        this.container.style.display = 'none';

        // 清理容器
        this.container.replaceChildren();
    }

    /**
     * 删除指定值的菜单项
     * @param value 要删除的菜单项的值
     * @returns 是否成功删除
     */
    public removeMenuItem(value: string): boolean {
        // 查找要删除的菜单项
        const menuItem = this.container.querySelector(`[data-menu="${value}"]`) as HTMLElement;
        if (!menuItem) {
            return false;
        }

        // 如果菜单项有子菜单，先清理子菜单
        const submenu = menuItem.querySelector('.e-virt-table-submenu') as HTMLElement;
        if (submenu) {
            this.cleanupSubmenuRecursively(submenu);
        }
        // 从 DOM 中移除菜单项
        menuItem.remove();
        return true;
    }

    /**
     * 删除指定值的子菜单项
     * @param value 要删除的子菜单项的值
     * @returns 是否成功删除
     */
    public removeSubMenuItem(value: string): boolean {
        // 查找要删除的子菜单项
        const subMenuItem = this.container.querySelector(`[data-submenu="${value}"]`) as HTMLElement;
        if (!subMenuItem) {
            return false;
        }

        // 从 DOM 中移除子菜单项
        subMenuItem.remove();
        return true;
    }

    private cleanupAllSubmenus(container: HTMLElement): void {
        // 清理所有菜单项的子菜单
        const menuItems = container.querySelectorAll('.e-virt-table-menu-item') as NodeListOf<MenuElement>;
        menuItems.forEach((menuItem) => {
            if (menuItem._submenu) {
                this.cleanupSubmenuRecursively(menuItem._submenu);
                menuItem._submenu = undefined;
            }
        });
    }

    private cleanupSubmenuRecursively(submenu: HTMLElement): void {
        // 清理当前子菜单的清理函数
        const menuElement = submenu as MenuElement;
        if (menuElement._cleanup) {
            menuElement._cleanup();
            delete menuElement._cleanup;
        }

        // 递归清理子菜单中的子菜单
        const childMenuItems = submenu.querySelectorAll('.e-virt-table-submenu-item') as NodeListOf<MenuElement>;
        childMenuItems.forEach((menuItem) => {
            if (menuItem._submenu) {
                this.cleanupSubmenuRecursively(menuItem._submenu);
            }
        });

        // 从 DOM 中移除子菜单
        submenu.remove();
    }
}
