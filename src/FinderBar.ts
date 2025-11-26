import Context from './Context';
import { expandSvg, svgLoading } from './Icons';

export interface FinderResult {
    type: 'header' | 'body';
    rowIndex: number;
    colIndex: number;
    text: string;
    colKey?: string;
}

export class FinderBar {
    private ctx: Context;
    private container: HTMLElement;
    private input!: HTMLInputElement;
    private prevBtn!: HTMLElement;
    private nextBtn!: HTMLElement;
    private closeBtn!: HTMLElement;
    private countEl!: HTMLElement;
    private loadingEl!: HTMLElement;
    private isVisible = false;
    private searchResults: FinderResult[] = [];
    private currentIndex = -1;
    private searchData: FinderResult[] = [];
    private isComposing = false;

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.container = this.createContainer();
        this.ctx.containerElement.appendChild(this.container);
        this.bindEvents();
        this.ctx.on('keydown', (e: KeyboardEvent) => {
            if (!this.ctx.config.ENABLE_FINDER) {
                return;
            }
            if (this.ctx.editing) {
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.code === 'KeyF') {
                e.preventDefault();
                this.show();
                return;
            }
            if (this.ctx.finding) {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    this.hide();
                    return;
                }
                if (e.code === 'ArrowUp') {
                    e.preventDefault();
                    this.navigatePrevious();
                    return;
                }
                if (e.code === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateNext();
                    return;
                }
            }
        });
        this.ctx.on('setSelector', () => {
            this.hide();
        });
        this.ctx.on('outsideMousedown', () => {
            this.hide();
        });
    }

    private async initSearchData(): Promise<void> {
        this.showLoading();
        this.searchData = [];
        const { allCellHeaders } = this.ctx.header;
        await this.batchRun(
            allCellHeaders.length,
            0,
            10000,
            (i) => {
                const header = allCellHeaders[i];
                if (header && ['string', 'number'].includes(typeof header.text)) {
                    this.searchData.push({
                        rowIndex: 0,
                        colIndex: header.colIndex,
                        text: `${header.text}`,
                        type: 'header',
                        colKey: header.key,
                    });
                }
            },
            10,
        );
        const { maxColIndex, maxRowIndex } = this.ctx;
        await this.batchRun(
            maxRowIndex,
            maxColIndex,
            10000,
            (i, j) => {
                const cell = this.ctx.database.getVirtualBodyCell(i, j, false);
                const text = cell?.getText();
                if (['string', 'number'].includes(typeof text)) {
                    this.searchData.push({
                        rowIndex: i,
                        colIndex: j,
                        text: `${text}`,
                        type: 'body',
                    });
                }
            },
            10,
        );
        this.hideLoading();
    }

    private createContainer(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'e-virt-table-finder-bar';
        // 创建输入框容器
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'e-virt-table-finder-bar-input-wrapper';
        // 创建输入框
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'e-virt-table-finder-bar-input';
        this.input.placeholder = '';
        inputWrapper.appendChild(this.input);

        // 创建 loading 指示器（放在输入框容器内）
        this.loadingEl = document.createElement('div');
        this.loadingEl.className = 'e-virt-table-finder-bar-loading';
        const loadingSvg = svgLoading;
        this.loadingEl.innerHTML = loadingSvg;
        inputWrapper.appendChild(this.loadingEl);
        // 创建计数文本
        this.countEl = document.createElement('span');
        this.countEl.className = 'e-virt-table-finder-bar-count';
        // 创建导航按钮容器
        const navContainer = document.createElement('div');
        navContainer.className = 'e-virt-table-finder-bar-nav';
        // 创建上一个按钮（向上箭头）
        this.prevBtn = document.createElement('button');
        this.prevBtn.className = 'e-virt-table-finder-bar-nav-btn prev-btn';
        this.prevBtn.innerHTML = expandSvg;
        // 创建下一个按钮（向下箭头）
        this.nextBtn = document.createElement('button');
        this.nextBtn.className = 'e-virt-table-finder-bar-nav-btn next-btn';
        this.nextBtn.innerHTML = expandSvg;
        navContainer.appendChild(this.prevBtn);
        navContainer.appendChild(this.nextBtn);

        // 创建关闭按钮
        this.closeBtn = document.createElement('button');
        this.closeBtn.className = 'e-virt-table-finder-bar-nav-btn close-btn';
        this.closeBtn.innerHTML = '×';

        container.appendChild(inputWrapper);
        container.appendChild(this.countEl);
        container.appendChild(navContainer);
        container.appendChild(this.closeBtn);

        return container;
    }

    private bindEvents(): void {
        // 输入框输入事件
        this.input.addEventListener('input', () => {
            if (!this.isComposing) this.performSearch();
        });
        this.input.addEventListener('compositionstart', () => {
            this.isComposing = true;
        });

        this.input.addEventListener('compositionend', () => {
            this.isComposing = false;
            this.performSearch();
        });
        // 导航按钮事件
        this.prevBtn.addEventListener('click', () => {
            this.navigatePrevious();
        });

        this.nextBtn.addEventListener('click', () => {
            this.navigateNext();
        });

        // 关闭按钮事件
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
    }

    private performSearch(): void {
        const searchText = this.input.value.trim();
        this.searchResults = [];
        this.currentIndex = -1;

        if (!searchText) {
            this.updateCount();
            return;
        }

        this.showLoading();
        this.searchResults = this.searchData.filter((item) => item.text.includes(searchText));
        // 如果找到结果，定位到第一个
        if (this.searchResults.length > 0) {
            this.currentIndex = 0;
            this.scrollToCurrentResult();
        } else {
            // 清空
            this.ctx.finderBar = {
                rowIndex: -1,
                colIndex: -1,
                text: '',
                type: 'header',
            };
            this.ctx.emit('draw');
        }
        this.updateCount();
        this.hideLoading();
    }

    private scrollToCurrentResult(): void {
        if (this.currentIndex < 0 || this.currentIndex >= this.searchResults.length) {
            return;
        }
        const result = this.searchResults[this.currentIndex];
        this.ctx.finderBar = result;
        const { rowIndex, colIndex } = result;
        this.ctx.emit('scrollToIndex', rowIndex, colIndex);
    }

    private navigateNext(): void {
        if (this.searchResults.length === 0) return;

        this.currentIndex = (this.currentIndex + 1) % this.searchResults.length;
        this.scrollToCurrentResult();
        this.updateCount();
    }

    private navigatePrevious(): void {
        if (this.searchResults.length === 0) return;

        this.currentIndex = this.currentIndex <= 0 ? this.searchResults.length - 1 : this.currentIndex - 1;
        this.scrollToCurrentResult();
        this.updateCount();
    }

    private updateCount(): void {
        if (this.searchResults.length === 0) {
            if (this.input.value.trim()) {
                this.countEl.textContent = '0/0';
                this.countEl.classList.add('no-results');
            } else {
                this.countEl.textContent = '';
                this.countEl.classList.remove('no-results');
            }
        } else {
            const current = this.currentIndex + 1;
            const total = this.searchResults.length;
            this.countEl.textContent = `${current}/${total}`;
            this.countEl.classList.remove('no-results');
        }
    }

    public show(): void {
        if (this.isVisible) return;
        this.isVisible = true;
        this.ctx.finding = true;
        this.container.classList.add('show');
        this.input.focus();
        this.initSearchData();
    }

    private showLoading(): void {
        this.loadingEl.classList.add('show');
        this.loadingEl.parentElement?.classList.add('loading');
        this.input.readOnly = true;
    }

    private hideLoading(): void {
        this.loadingEl.classList.remove('show');
        this.loadingEl.parentElement?.classList.remove('loading');
        this.input.readOnly = false;
    }
    private async batchRun(
        maxRow: number,
        maxCol: number,
        batchSize: number,
        fn: (i: number, j: number) => void | Promise<void>,
        interval = 0,
    ) {
        for (let rowStart = 0; rowStart <= maxRow; rowStart += batchSize) {
            const rowEnd = Math.min(rowStart + batchSize - 1, maxRow);
            const tasks: Promise<void>[] = [];
            // 遍历当前批次的行
            for (let i = rowStart; i <= rowEnd; i++) {
                for (let j = 0; j <= maxCol; j++) {
                    tasks.push(Promise.resolve(fn(i, j)));
                }
            }
            // 并行执行当前批次（更快）
            await Promise.all(tasks);
            // 批次之间休息，避免长时间阻塞
            if (interval > 0) {
                await new Promise((r) => setTimeout(r, interval));
            }
        }
    }

    public hide(): void {
        if (!this.isVisible) return;

        this.isVisible = false;
        this.container.classList.remove('show');
        this.ctx.finding = false;
        this.input.value = '';
        this.searchResults = [];
        this.currentIndex = -1;
        this.hideLoading();
        this.ctx.finderBar = {
            rowIndex: -1,
            colIndex: -1,
            text: '',
            type: 'header',
        };
        this.updateCount();
    }

    public destroy(): void {
        this.hide();
        this.container.remove();
    }
}
