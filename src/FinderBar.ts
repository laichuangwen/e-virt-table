import Context from './Context';
import { expandSvg, svgLoading } from './Icons';
import { html, render } from 'lit-html';

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
    private prevBtn!: HTMLButtonElement;
    private nextBtn!: HTMLButtonElement;
    private closeBtn!: HTMLButtonElement;
    private countEl!: HTMLSpanElement;
    private loadingEl!: HTMLDivElement;
    private inputWrapper!: HTMLDivElement;
    private barEl!: HTMLDivElement;
    private isVisible = false;
    private searchResults: FinderResult[] = [];
    private currentIndex = -1;
    private searchData: FinderResult[] = [];
    private isComposing = false;

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.container = document.createElement('div');
        this.ctx.containerElement.appendChild(this.container);
        this.render();
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
                if (e.code === 'ArrowUp' || (e.shiftKey && e.key === 'Enter')) {
                    e.preventDefault();
                    this.navigatePrevious();
                    return;
                }
                if (e.code === 'ArrowDown' || e.key === 'Enter') {
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

    private render(): void {
        render(
            html`
                <div class="e-virt-table-finder-bar">
                    <div class="e-virt-table-finder-bar-input-wrapper">
                        <input type="text" class="e-virt-table-finder-bar-input" placeholder="" />
                        <div class="e-virt-table-finder-bar-loading"></div>
                    </div>
                    <span class="e-virt-table-finder-bar-count"></span>
                    <div class="e-virt-table-finder-bar-nav">
                        <button class="e-virt-table-finder-bar-nav-btn prev-btn"></button>
                        <button class="e-virt-table-finder-bar-nav-btn next-btn"></button>
                    </div>
                    <button class="e-virt-table-finder-bar-nav-btn close-btn">×</button>
                </div>
            `,
            this.container,
        );
        this.barEl = this.container.querySelector('.e-virt-table-finder-bar') as HTMLDivElement;
        this.inputWrapper = this.container.querySelector('.e-virt-table-finder-bar-input-wrapper') as HTMLDivElement;
        this.input = this.container.querySelector('.e-virt-table-finder-bar-input') as HTMLInputElement;
        this.loadingEl = this.container.querySelector('.e-virt-table-finder-bar-loading') as HTMLDivElement;
        this.countEl = this.container.querySelector('.e-virt-table-finder-bar-count') as HTMLSpanElement;
        this.prevBtn = this.container.querySelector('.prev-btn') as HTMLButtonElement;
        this.nextBtn = this.container.querySelector('.next-btn') as HTMLButtonElement;
        this.closeBtn = this.container.querySelector('.close-btn') as HTMLButtonElement;
        this.loadingEl.innerHTML = svgLoading;
        this.prevBtn.innerHTML = expandSvg;
        this.nextBtn.innerHTML = expandSvg;
        this.updateView();
    }

    private getCountText(): string {
        if (this.searchResults.length === 0) {
            if (this.input.value.trim()) {
                return '0/0';
            }
            return '';
        }
        return `${this.currentIndex + 1}/${this.searchResults.length}`;
    }

    private updateView(): void {
        this.barEl.classList.toggle('show', this.isVisible);
        this.inputWrapper.classList.toggle('loading', this.loadingEl.classList.contains('show'));
        this.countEl.textContent = this.getCountText();
        this.countEl.classList.toggle('no-results', this.searchResults.length === 0 && !!this.input.value.trim());
    }

    private bindEvents(): void {
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
        this.prevBtn.addEventListener('click', () => {
            this.navigatePrevious();
        });
        this.nextBtn.addEventListener('click', () => {
            this.navigateNext();
        });
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
    }

    private async initSearchData(): Promise<void> {
        this.showLoading();
        this.searchData = [];
        setTimeout(() => {
            const { allCellHeaders } = this.ctx.header;
            for (let i = 0; i < allCellHeaders.length; i++) {
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
            }
            const { maxColIndex, maxRowIndex } = this.ctx;
            for (let i = 0; i <= maxRowIndex; i++) {
                for (let j = 0; j <= maxColIndex; j++) {
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
                }
            }
            this.hideLoading();
        }, 0);
    }

    private performSearch(): void {
        const searchText = this.input.value.trim();
        this.searchResults = [];
        this.currentIndex = -1;

        if (!searchText) {
            this.cearFinderBar();
            this.updateView();
            return;
        }

        this.showLoading();
        setTimeout(() => {
            this.searchResults = this.searchData.filter((item) =>
                item.text.toLowerCase().includes(searchText.toLowerCase()),
            );
            if (this.searchResults.length > 0) {
                this.currentIndex = 0;
                this.scrollToCurrentResult();
            } else {
                this.cearFinderBar();
            }
            this.hideLoading();
            this.updateView();
        }, 0);
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
        this.updateView();
    }

    private navigatePrevious(): void {
        if (this.searchResults.length === 0) return;

        this.currentIndex = this.currentIndex <= 0 ? this.searchResults.length - 1 : this.currentIndex - 1;
        this.scrollToCurrentResult();
        this.updateView();
    }

    public show(): void {
        if (this.isVisible) return;
        this.isVisible = true;
        this.ctx.finding = true;
        this.updateView();
        this.input.focus();
        this.initSearchData();
    }

    private showLoading(): void {
        this.loadingEl.classList.add('show');
        this.input.readOnly = true;
        this.updateView();
    }

    private hideLoading(): void {
        this.loadingEl.classList.remove('show');
        this.input.readOnly = false;
        this.updateView();
    }

    private cearFinderBar(): void {
        this.ctx.finderBar = {
            rowIndex: -1,
            colIndex: -1,
            text: '',
            type: 'header',
        };
        this.ctx.emit('draw');
    }

    public hide(): void {
        if (!this.isVisible) return;

        this.isVisible = false;
        this.ctx.finding = false;
        this.input.value = '';
        this.searchResults = [];
        this.searchData = [];
        this.currentIndex = -1;
        this.loadingEl.classList.remove('show');
        this.input.readOnly = false;
        this.ctx.finderBar = {
            rowIndex: -1,
            colIndex: -1,
            text: '',
            type: 'header',
        };
        this.updateView();
        this.ctx.emit('draw');
    }

    public destroy(): void {
        this.hide();
        this.container.remove();
    }
}
