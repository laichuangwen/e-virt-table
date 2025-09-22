import CellHeader from './CellHeader';
import Context from './Context';
import Header from './Header';
import { Column } from './types';
type HideItem = {
    label: string;
    checked: boolean;
};
export default class ContextMenu {
    private ctx: Context;
    private header: Header;
    private wrapperEl: HTMLUListElement | null = null;
    private wrapperHideEl: HTMLDivElement | null = null;
    private hideList: HideItem[] = [];
    private cellHeader: CellHeader | null = null;
    private showWrapperHideEl = false;
    private scrollTop = 0;
    constructor(ctx: Context, header: Header) {
        this.ctx = ctx;
        this.header = header;
        this.init();
    }
    private onClickOutside = (e: MouseEvent) => {
        if (!this.wrapperHideEl?.contains(e.target as Node) && !this.wrapperEl?.contains(e.target as Node)) {
            this.hideHideEl();
        }
    };
    private init() {
        document.addEventListener('click', this.onClickOutside);
        this.ctx.on('cellHeaderHoverChange', (cellHeader) => {
            if (this.showWrapperHideEl) {
                return;
            }
            if (this.ctx.dragHeaderIng) {
                this.hide();
                return;
            }
            const { drawX, drawY, visibleWidth } = cellHeader;
            const left = drawX;
            const top = drawY;
            const overflowFixed = !cellHeader.fixed && left < this.ctx.fixedLeftWidth;
            const overflowRight =
                !cellHeader.fixed && left + visibleWidth > this.ctx.stageWidth - this.ctx.fixedRightWidth;

            if (overflowFixed || overflowRight) {
                return;
            }
            this.cellHeader = cellHeader;
            this.show(left, top, cellHeader);
        });
        this.ctx.on('headerMouseleave', () => {
            this.hide();
        });
    }
    private getlevelColumns(cellHeader: CellHeader) {
        const { columns } = this.header.getCustomHeader();
        const { parentKey } = cellHeader.column;
        if (!parentKey) {
            return columns;
        }
        const column = this.ctx.database.getColumnByKey(parentKey);
        if (!column) {
            return [];
        }
        return column.children;
    }
    private show(x: Number, y: Number, cellHeader: CellHeader) {
        this.wrapperEl?.remove();
        this.wrapperEl = document.createElement('ul');
        this.wrapperEl.classList.add('e-virt-table-custom-header-wrapper');
        // 阻止冒泡
        this.wrapperEl.addEventListener('mousemove', (e: MouseEvent) => {
            e.stopPropagation();
        });
        this.wrapperEl.addEventListener('click', (e: MouseEvent) => {
            const li = (e.target as HTMLElement).closest('li');
            if (!li) return;
            const btn = li.dataset.action;
            console.log('点击', btn);
            if (btn === 'header-hiden') {
                this.ctx.database.setCustomHeaderHideData(cellHeader.column.key, true);
                this.hide();
            } else if (btn === 'header-visible') {
                this.showHideColumns(cellHeader);
            } else if (btn === 'header-fixed-left') {
                this.ctx.database.setCustomHeaderFixedData(cellHeader.column.key, 'left');
                this.hide();
            } else if (btn === 'header-fixed-right') {
                this.ctx.database.setCustomHeaderFixedData(cellHeader.column.key, 'right');
                this.hide();
            } else if (btn === 'header-no-fixed') {
                this.ctx.database.setCustomHeaderFixedData(cellHeader.column.key, '');
                this.hide();
            }
            this.ctx.database.init(false);
            this.header.init();
            this.ctx.emit('draw');
        });
        // 批量创建 li
        const fragment = document.createDocumentFragment();
        const { column } = cellHeader;
        let onlyOne = !column.parentKey && this.header.visibleColumns.length === 1;
        const pColumn = this.ctx.database.getColumnByKey(column.parentKey || '');
        const cOnlyOne =
            pColumn && pColumn.children && pColumn.children.filter((item: Column) => !item.hide).length === 1;
        if (cOnlyOne) {
            onlyOne = true;
        }
        const items = [
            {
                btn: 'header-hiden',
                hide: onlyOne || false,
            },
            {
                btn: 'header-visible',
                hide: false,
            },
            // {
            //     btn: 'header-fixed-left',
            //     hide: cellHeader.fixed === 'left' || cellHeader.level > 0,
            // },
            // {
            //     btn: 'header-no-fixed',
            //     hide: !cellHeader.fixed || cellHeader.level > 0,
            // },
            // {
            //     btn: 'header-fixed-right',
            //     hide: cellHeader.fixed === 'right' || cellHeader.level > 0,
            // },
        ];
        items
            .filter((cfg) => !cfg.hide)
            .forEach((cfg) => {
                const li = document.createElement('li');
                li.classList.add('e-virt-table-custom-header-btn');
                li.classList.add(cfg.btn);
                li.dataset.action = cfg.btn; // 用 data-* 标记行为
                const iconData = this.ctx.icons.getSvg(cfg.btn);
                if (iconData) {
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(iconData.svg, 'image/svg+xml');
                    const svg = svgDoc.documentElement;
                    li.appendChild(svg);
                }
                fragment.appendChild(li);
            });
        this.wrapperEl?.appendChild(fragment);
        // 插入到容器
        this.ctx.containerElement.appendChild(this.wrapperEl);
        Object.assign(this.wrapperEl.style, {
            left: `${x}px`,
            top: `${y}px`,
        });
    }
    private showHideColumns(cellHeader: CellHeader) {
        const columns = this.getlevelColumns(cellHeader);
        if (!columns?.length) {
            return;
        }
        console.log('showHideColumns', columns);

        const hideColumns = columns.filter((item: Column) => item.hide);
        if (!hideColumns?.length) {
            return;
        }
        this.hideList = hideColumns.map((item: Column) => ({
            label: item.title,
            checked: false,
        }));
        this.updateHideEl();
        this.showWrapperHideEl = true;
    }
    hideHideEl() {
        this.scrollTop = 0;
        this.wrapperHideEl?.remove();
        this.showWrapperHideEl = false;
    }
    updateHideEl() {
        if (!this.cellHeader) {
            return;
        }
        this.wrapperHideEl?.remove();
        this.wrapperHideEl = document.createElement('div');
        const { drawX, drawY } = this.cellHeader;
        const wrapperHideStyle = {
            left: `${drawX}px`,
            top: `${drawY + 20}px`,
        };
        this.wrapperHideEl.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            const li = (e.target as HTMLElement).closest('li');
            if (!li) return;
            const index = Number(li.dataset.index);
            this.hideList[index].checked = !this.hideList[index].checked;
            console.log(this.hideList);
            this.updateHideEl();
        });
        Object.assign(this.wrapperHideEl.style, wrapperHideStyle);
        this.wrapperHideEl.classList.add('e-virt-table-custom-header-wrapper-hide');
        const topEl = document.createElement('div');
        topEl.classList.add('e-virt-table-custom-header-wrapper-hide-top');
        this.wrapperHideEl.appendChild(topEl);
        const fragment = document.createDocumentFragment();
        console.log(this.hideList);

        this.hideList.forEach((item: HideItem, index: number) => {
            const li = document.createElement('li');
            li.dataset.index = index.toString();
            li.classList.add('e-virt-table-custom-header-wrapper-hide-li');
            let iconData = this.ctx.icons.getSvg('checkbox-uncheck');
            if (item.checked) {
                iconData = this.ctx.icons.getSvg('checkbox-check');
            }
            if (iconData) {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(iconData.svg, 'image/svg+xml');
                const svg = svgDoc.documentElement;
                li.appendChild(svg);
            }
            const span = document.createElement('span');
            span.innerText = item.label;
            li.appendChild(span);
            fragment.appendChild(li);
        });
        const ulEl = document.createElement('ul');
        ulEl.addEventListener('scroll', () => {
            this.scrollTop = ulEl.scrollTop;
        });
        ulEl.classList.add('e-virt-table-custom-header-wrapper-hide-ul');
        ulEl.appendChild(fragment);

        this.wrapperHideEl.appendChild(ulEl);
        this.ctx.containerElement.appendChild(this.wrapperHideEl);
        ulEl.scrollTop = this.scrollTop;
        console.log(this.scrollTop);
        
    }
    hide() {
        this.wrapperEl?.remove();
    }
    updated() {}
    destroy() {
        this.wrapperEl?.remove();
        document.removeEventListener('click', this.onClickOutside);
    }
}
