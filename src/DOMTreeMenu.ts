import { computePosition, autoUpdate, flip, shift, offset } from '@floating-ui/dom';
import { MenuItem } from './types';
import { expandSvg } from './Icons';
import { html, render } from 'lit-html';

export interface MenuOptions {
    onClick?: (itemData: MenuItem, value: string) => void;
}

interface MenuElement extends HTMLElement {
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
        this.boundMouseEnterHandler = (e: MouseEvent) => this.handleMouseEvent(e, 'enter');
        this.boundMouseLeaveHandler = (e: MouseEvent) => this.handleMouseEvent(e, 'leave');
        this.boundClickHandler = (e: MouseEvent) => this.handleClick(e);

        this.renderMenu();
        this.bindEvents();
    }

    private renderMenu(): void {
        this.container.className = 'e-virt-table-main-menu';
        render(
            html`
                ${this.menuData.map((item) => this.menuItemTemplate(item))}
                ${this.flatSubmenuTemplates(this.menuData)}
            `,
            this.container,
        );
        this.patchMenuHtml();
        this.container.style.display = 'block';
    }

    private menuItemTemplate(item: MenuItem, isSubmenu = false) {
        const value = item.value;
        const itemClass = isSubmenu ? 'e-virt-table-submenu-item' : 'e-virt-table-menu-item';
        const disabledClass = item.disabled ? ' disabled' : '';
        const contentClass = item.icon
            ? 'e-virt-table-menu-item-content'
            : 'e-virt-table-menu-item-content menu-item-no-icon';

        if (isSubmenu) {
            return html`
                <div class="${itemClass}${disabledClass}" data-submenu=${value}>
                    <div class="${contentClass}">
                        ${item.icon ? html`<span class="e-virt-table-menu-item-icon"></span>` : null}
                        <span class="e-virt-table-menu-item-text">${item.label || ''}</span>
                    </div>
                    ${item.children?.length ? html`<span class="e-virt-table-menu-arrow"></span>` : null}
                </div>
            `;
        }

        return html`
            <div class="${itemClass}${disabledClass}" data-menu=${value}>
                <div class="${contentClass}">
                    ${item.icon ? html`<span class="e-virt-table-menu-item-icon"></span>` : null}
                    <span class="e-virt-table-menu-item-text">${item.label || ''}</span>
                </div>
                ${item.children?.length ? html`<span class="e-virt-table-menu-arrow"></span>` : null}
            </div>
        `;
    }

    private patchMenuHtml(items: MenuItem[] = this.menuData, isSubmenu = false): void {
        for (const item of items) {
            const attr = isSubmenu ? 'data-submenu' : 'data-menu';
            const el = this.container.querySelector(`[${attr}="${item.value}"]`);
            if (el) {
                if (item.icon) {
                    const iconEl = el.querySelector('.e-virt-table-menu-item-icon');
                    if (iconEl) {
                        iconEl.innerHTML = item.icon;
                    }
                }
                if (item.children?.length) {
                    const arrowEl = el.querySelector('.e-virt-table-menu-arrow');
                    if (arrowEl) {
                        arrowEl.innerHTML = expandSvg;
                    }
                }
            }
            if (item.children?.length) {
                this.patchMenuHtml(item.children, true);
            }
        }
    }

    private flatSubmenuTemplates(items: MenuItem[]): ReturnType<typeof html>[] {
        const templates: ReturnType<typeof html>[] = [];
        for (const item of items) {
            if (item.children?.length) {
                templates.push(this.submenuTemplate(item.value, item.children));
                templates.push(...this.flatSubmenuTemplates(item.children));
            }
        }
        return templates;
    }

    private submenuTemplate(parentValue: string, submenuData: MenuItem[]) {
        return html`
            <div class="e-virt-table-submenu" data-submenu-for=${parentValue}>
                ${submenuData.map((item) => this.menuItemTemplate(item, true))}
            </div>
        `;
    }

    private getSubmenuForMenuItem(menuItem: MenuElement): HTMLElement | null {
        const menuValue = menuItem.getAttribute('data-menu') || menuItem.getAttribute('data-submenu');
        if (!menuValue) return null;
        return this.container.querySelector(`[data-submenu-for="${menuValue}"]`) as HTMLElement | null;
    }

    private bindEvents(): void {
        this.container.addEventListener('mouseenter', this.boundMouseEnterHandler, true);
        this.container.addEventListener('mouseleave', this.boundMouseLeaveHandler, true);
        this.container.addEventListener('click', this.boundClickHandler);
    }

    private handleMouseEvent(e: MouseEvent, type: 'enter' | 'leave'): void {
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

        const submenu = this.getSubmenuForMenuItem(menuItem);
        if (submenu) {
            this.hideSiblingSubmenus(menuItem);
            this.showSubmenu(menuItem, submenu);
        }
    }

    private handleLeave(menuItem: MenuElement): void {
        const submenu = this.getSubmenuForMenuItem(menuItem);

        setTimeout(() => {
            const submenuEl = submenu;
            if (submenuEl && !submenuEl.matches(':hover') && !menuItem.matches(':hover')) {
                this.hideSubmenu(submenuEl);
                if (menuItem.classList.contains('e-virt-table-menu-item')) {
                    menuItem.classList.remove('active');
                }
            }
        }, 150);
    }

    private hideSiblingSubmenus(menuItem: MenuElement): void {
        let siblings: NodeListOf<MenuElement>;

        if (menuItem.classList.contains('e-virt-table-menu-item')) {
            siblings = this.container.querySelectorAll('.e-virt-table-menu-item') as NodeListOf<MenuElement>;
        } else {
            const parentSubmenu = menuItem.closest('.e-virt-table-submenu');
            if (parentSubmenu) {
                siblings = parentSubmenu.querySelectorAll('.e-virt-table-submenu-item') as NodeListOf<MenuElement>;
            } else {
                return;
            }
        }

        siblings.forEach((sibling) => {
            if (sibling !== menuItem) {
                const submenu = this.getSubmenuForMenuItem(sibling);
                if (submenu) {
                    this.hideSubmenu(submenu);
                }
            }
        });
    }

    private async showSubmenu(trigger: HTMLElement, submenu: HTMLElement): Promise<void> {
        if (this.activeSubmenus.has(submenu)) return;

        this.activeSubmenus.add(submenu);
        submenu.classList.add('show');

        const cleanup = autoUpdate(trigger, submenu, async () => {
            const containerRect = this.container.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const submenuWidth = submenu.offsetWidth || 200;

            const rightSpace = viewportWidth - containerRect.right;
            const leftSpace = containerRect.left;

            const placement = rightSpace >= submenuWidth || rightSpace >= leftSpace ? 'right-start' : 'left-start';

            const { x, y } = await computePosition(trigger, submenu, {
                placement,
                middleware: [offset(8), shift({ padding: 8 })],
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
            const childSubmenu = this.getSubmenuForMenuItem(menuItem);
            if (childSubmenu && this.activeSubmenus.has(childSubmenu)) {
                this.activeSubmenus.delete(childSubmenu);
                childSubmenu.classList.remove('show');

                const menuElement = childSubmenu as MenuElement;
                if (menuElement._cleanup) {
                    menuElement._cleanup();
                    delete menuElement._cleanup;
                }

                this.hideAllChildSubmenus(childSubmenu);
            }
        });
    }

    private handleClick(e: MouseEvent): void {
        e.stopPropagation();

        const menuItem = (e.target as HTMLElement).closest(
            '.e-virt-table-menu-item, .e-virt-table-submenu-item',
        ) as MenuElement;
        if (!menuItem) return;
        if (menuItem.classList.contains('disabled')) return;

        if (menuItem.classList.contains('e-virt-table-menu-item')) {
            const submenu = this.getSubmenuForMenuItem(menuItem);
            if (submenu) {
                this.showSubmenu(menuItem, submenu);
                return;
            }
        }

        const menuValue = menuItem.getAttribute('data-menu') || menuItem?.getAttribute('data-submenu');
        const itemData = this.findMenuItem(menuValue || '');

        if (itemData) {
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

    private removeFromMenuData(value: string, items: MenuItem[]): boolean {
        const index = items.findIndex((item) => item.value === value);
        if (index !== -1) {
            items.splice(index, 1);
            return true;
        }
        for (const item of items) {
            if (item.children && this.removeFromMenuData(value, item.children)) {
                if (item.children.length === 0) {
                    delete item.children;
                }
                return true;
            }
        }
        return false;
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

    public destroy(): void {
        this.container.removeEventListener('mouseenter', this.boundMouseEnterHandler, true);
        this.container.removeEventListener('mouseleave', this.boundMouseLeaveHandler, true);
        this.container.removeEventListener('click', this.boundClickHandler);
        this.cleanupAllSubmenus(this.container);
        this.container.style.display = 'none';
        render(html``, this.container);
    }

    public removeMenuItem(value: string): boolean {
        if (!this.removeFromMenuData(value, this.menuData)) {
            return false;
        }
        this.renderMenu();
        return true;
    }

    public removeSubMenuItem(value: string): boolean {
        if (!this.removeFromMenuData(value, this.menuData)) {
            return false;
        }
        this.pruneEmptyParents(this.menuData);
        this.renderMenu();
        return true;
    }

    private pruneEmptyParents(items: MenuItem[]): void {
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            if (item.children) {
                this.pruneEmptyParents(item.children);
                if (item.children.length === 0) {
                    items.splice(i, 1);
                }
            }
        }
    }

    private cleanupAllSubmenus(container: HTMLElement): void {
        const submenus = container.querySelectorAll('.e-virt-table-submenu') as NodeListOf<MenuElement>;
        submenus.forEach((submenu) => {
            if (submenu._cleanup) {
                submenu._cleanup();
                delete submenu._cleanup;
            }
        });
    }
}
