import type Cell from './Cell';
import type CellHeader from './CellHeader';
import type Context from './Context';
import type { OverlayerContainer, OverlayerView, OverlayerWrapper } from './types';
import { throttle } from './util';
import { getLayoutScrollerTrackSize } from './ScrollbarMode';

type HeaderSortIconLayout = {
    cell: CellHeader;
    cellEl: HTMLDivElement;
    sortIconEl: HTMLImageElement;
};

export default class Overlayer {
    ctx: Context;
    observer?: MutationObserver;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }
    private arerMapsEqual(m1: Map<string, number>, m2: Map<string, number>): boolean {
        if (m1.size !== m2.size) return false;

        for (let [key, value] of m1) {
            if (!m2.has(key)) return false;
            if (m2.get(key) !== value) return false;
        }

        return true;
    }
    private init() {
        // 监听覆盖层变化,用于自动高度计算
        this.observer = new MutationObserver(
            throttle(() => {
                // 当 DOM 发生变化时执行的回调
                const elements = this.ctx.overlayerElement.querySelectorAll('[data-auto-height="true"]');
                const map = new Map<string, number>();
                elements.forEach((element: Element) => {
                    const rowIndex = Number(element.getAttribute('data-row-index'));
                    const colIndex = Number(element.getAttribute('data-col-index'));
                    if (isNaN(rowIndex) || isNaN(colIndex)) {
                        return;
                    }
                    const rect = element.getBoundingClientRect();
                    const key = `${rowIndex}\u200b_${colIndex}`;
                    map.set(key, Math.round(rect.height));
                });
                const overlayerAutoHeightMap = this.ctx.database.getOverlayerAutoHeightMap();
                const isNeedUpdate = !this.arerMapsEqual(overlayerAutoHeightMap, map);
                if (isNeedUpdate) {
                    this.ctx.database.setOverlayerAutoHeightMap(map);
                    if (overlayerAutoHeightMap.size === 0 && map.size === 0) {
                        return;
                    }
                    this.ctx.emit('draw');
                }
            }, 16.67),
        );
        this.observer.observe(this.ctx.overlayerElement, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });
        // 自定义覆盖层时，不监听覆盖层变化
        if (this.ctx.overlayerElement.getAttribute('data-overlayer') === 'default') {
            this.ctx.on('overlayerChange', (container) => {
                const overlayerEl = this.ctx.overlayerElement;
                const headerSortIconLayouts: HeaderSortIconLayout[] = [];
                // 移除所有子元素
                overlayerEl.replaceChildren();
                Object.assign(overlayerEl.style, container.style);
                container.views.forEach((typeView: OverlayerWrapper) => {
                    const typeDiv = document.createElement('div');
                    typeDiv.className = typeView.class;
                    Object.assign(typeDiv.style, typeView.style);
                    typeView.views.forEach((cellWrapView) => {
                        const cellWrap = document.createElement('div');
                        Object.assign(cellWrap.style, cellWrapView.style);
                        cellWrapView.cells.forEach((cell) => {
                            const cellEl = document.createElement('div');
                            Object.assign(cellEl.style, cell.style);
                            Object.keys(cell.domDataset || {}).forEach((key) => {
                                cellEl.setAttribute(key, cell.domDataset[key]);
                            });

                            if (typeView.type === 'header') {
                                this.reserveHeaderSortIconSpace(cellEl, cell as CellHeader);
                            }

                            if (typeof cell.render === 'function') {
                                cell.render(cellEl, cell);
                            }
                            cellWrap.appendChild(cellEl);
                            if (typeView.type === 'header') {
                                const headerCell = cell as CellHeader;
                                const sortIconEl = this.appendHeaderSortIcon(cellWrap, headerCell);
                                if (sortIconEl) {
                                    headerSortIconLayouts.push({ cell: headerCell, cellEl, sortIconEl });
                                }
                            }
                        });
                        typeDiv.appendChild(cellWrap);
                    });
                    overlayerEl.appendChild(typeDiv);
                });
                this.layoutHeaderSortIcons(headerSortIconLayouts);
            });
        }
    }
    private reserveHeaderSortIconSpace(cellEl: HTMLDivElement, cell: CellHeader) {
        const sortImage = cell.getImage('sort');
        if (!sortImage?.source) {
            return;
        }
        cellEl.style.boxSizing = 'border-box';
        if (cell.renderHeaderType === 'both' && cell.textInfo) {
            const leftInset = sortImage.x - cell.drawX + sortImage.width + 4;
            cellEl.style.paddingLeft = `${leftInset}px`;
            return;
        }
        cellEl.style.paddingRight = `${this.ctx.config.CELL_PADDING + sortImage.width + 4}px`;
    }
    private appendHeaderSortIcon(cellWrap: HTMLDivElement, cell: CellHeader) {
        const sortImage = cell.getImage('sort');
        if (!sortImage?.visible || !sortImage.source) {
            return;
        }
        const decorationEl = document.createElement('div');
        decorationEl.className = `${this.ctx.config.CSS_PREFIX}-overlayer-header-decoration`;
        Object.assign(decorationEl.style, cell.style, {
            pointerEvents: 'none',
            zIndex: '1',
        });

        const sortIconEl = document.createElement('img');
        sortIconEl.className = `${this.ctx.config.CSS_PREFIX}-overlayer-header-sort-icon`;
        sortIconEl.dataset.columnKey = cell.key;
        sortIconEl.src = sortImage.source.src;
        sortIconEl.alt = '';
        sortIconEl.draggable = false;
        sortIconEl.setAttribute('aria-hidden', 'true');
        sortIconEl.addEventListener('click', (event) => {
            event.stopPropagation();
            this.ctx.clickCellHeader = cell;
            this.ctx.emit('cellHeaderClick', cell, event);
        });
        Object.assign(sortIconEl.style, {
            position: 'absolute',
            left: `${sortImage.x - cell.drawX}px`,
            top: `${sortImage.y - cell.drawY - 1}px`,
            width: `${sortImage.width}px`,
            height: `${sortImage.height}px`,
            cursor: 'pointer',
            pointerEvents: 'auto',
            userSelect: 'none',
        });
        decorationEl.appendChild(sortIconEl);
        cellWrap.appendChild(decorationEl);
        return sortIconEl;
    }
    private layoutHeaderSortIcons(layouts: HeaderSortIconLayout[]) {
        layouts.forEach(({ cell, cellEl, sortIconEl }) => {
            if (cell.renderHeaderType === 'both' && cell.textInfo) {
                return;
            }
            const contentRight = this.getHeaderContentRight(cellEl);
            const sortImage = cell.getImage('sort');
            if (contentRight === undefined || !sortImage) {
                return;
            }
            const cellRect = cellEl.getBoundingClientRect();
            const maxLeft = cell.width - this.ctx.config.CELL_PADDING - sortImage.width;
            const left = Math.max(
                this.ctx.config.CELL_PADDING,
                Math.min(contentRight - cellRect.left + 4, maxLeft),
            );
            sortIconEl.style.left = `${left}px`;
            sortImage.x = cell.drawX + left;
        });
    }
    private getHeaderContentRight(cellEl: HTMLDivElement) {
        const childRights = Array.from(cellEl.children)
            .map((child) => child.getBoundingClientRect())
            .filter((rect) => rect.width > 0 || rect.height > 0)
            .map((rect) => rect.right);
        if (childRights.length) {
            return Math.max(...childRights);
        }
        if (!cellEl.textContent) {
            return undefined;
        }
        const range = document.createRange();
        range.selectNodeContents(cellEl);
        const right = range.getBoundingClientRect().right;
        range.detach();
        return right;
    }
    draw() {
        const overlayer = this.getContainer();
        this.ctx.emit('overlayerChange', overlayer);
    }
    destroy() {
        // 清除MutationObserver
        if (this.observer) {
            this.observer.disconnect();
        }
        this.ctx.emit('overlayerChange', {
            style: {},
            views: [],
        });
    }
    private getContainer(): OverlayerContainer {
        const header = this.getHeader();
        const body = this.getBody();
        const footer = this.getFooter();
        let views: OverlayerWrapper[] = [];
        // 不是固定底部的时候，不用加入footer，因为footer是在body的下面的
        const { FOOTER_FIXED, FOOTER_POSITION } = this.ctx.config;
        if (!FOOTER_FIXED) {
            views = [header, body];
        } else {
            if (FOOTER_POSITION === 'top') {
                views = [header, footer, body];
            } else {
                views = [header, body, footer];
            }
        }
        return {
            views,
        };
    }
    private getHeader() {
        const {
            fixedLeftWidth,
            fixedRightWidth: _fixedRightWidth,
            config: { CSS_PREFIX },
        } = this.ctx;
        const layoutScrollerTrackSize = getLayoutScrollerTrackSize(this.ctx.config);
        const { visibleWidth, visibleHeight, renderCellHeaders } = this.ctx.header;
        let centerCells: CellHeader[] = [];
        let leftCells: CellHeader[] = [];
        let rightCells: CellHeader[] = [];
        renderCellHeaders.forEach((cellHeader) => {
            if (cellHeader.render) {
                if (cellHeader.fixed === 'left') {
                    leftCells.push(cellHeader);
                } else if (cellHeader.fixed === 'right') {
                    rightCells.push(cellHeader);
                } else {
                    centerCells.push(cellHeader);
                }
            }
        });
        // 减去滚动条的宽度
        const fixedRightWidth = _fixedRightWidth - layoutScrollerTrackSize;
        const left: OverlayerView = {
            key: 'left',
            style: {
                position: 'absolute',
                top: `${0}px`,
                left: `${0}px`,
                overflow: 'hidden',
                width: `${fixedLeftWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: leftCells,
        };
        const center: OverlayerView = {
            key: 'center',
            style: {
                position: 'absolute',
                top: `${0}px`,
                left: `${fixedLeftWidth}px`,
                overflow: 'hidden',
                width: `${visibleWidth - fixedLeftWidth - fixedRightWidth + 1}px`,
                height: `${visibleHeight}px`,
            },
            cells: centerCells,
        };
        const right: OverlayerView = {
            key: 'right',
            style: {
                position: 'absolute',
                top: `${0}px`,
                right: `${0}px`,
                overflow: 'hidden',
                width: `${fixedRightWidth + 1}px`,
                height: `${visibleHeight}px`,
            },
            cells: rightCells,
        };
        const header: OverlayerWrapper = {
            type: 'header',
            class: `${CSS_PREFIX}-overlayer-header`,
            style: {
                position: 'relative',
                overflow: 'hidden',
                width: `${visibleWidth}px`,
                height: `${visibleHeight}px`,
            },
            views: [left, center, right],
        };
        return header;
    }
    private getBody() {
        const centerCells: Cell[] = [];
        const leftCells: Cell[] = [];
        const rightCells: Cell[] = [];
        let renderRows = this.ctx.body.renderRows;
        // 合计如果不是固定在底部，就加入到渲染行中
        if (!this.ctx.config.FOOTER_FIXED) {
            renderRows = renderRows.concat(this.ctx.footer.renderRows);
        }
        renderRows.forEach((row: { cells: Cell[] }) => {
            row.cells.forEach((cell: Cell) => {
                if (cell.cellType === 'footer') {
                    cell.render = cell.renderFooter;
                }
                if (cell.render) {
                    if (cell.fixed === 'left') {
                        leftCells.push(cell);
                    } else if (cell.fixed === 'right') {
                        rightCells.push(cell);
                    } else {
                        centerCells.push(cell);
                    }
                }
            });
        });
        const {
            fixedLeftWidth,
            fixedRightWidth: _fixedRightWidth,
            config: { CSS_PREFIX },
        } = this.ctx;
        const layoutScrollerTrackSize = getLayoutScrollerTrackSize(this.ctx.config);
        const { visibleWidth, visibleHeight } = this.ctx.body;
        // 减去滚动条的宽度
        const fixedRightWidth = _fixedRightWidth - layoutScrollerTrackSize;
        const left: OverlayerView = {
            key: 'left',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${0.5}px`,
                overflow: 'hidden',
                width: `${fixedLeftWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: leftCells,
        };
        const center: OverlayerView = {
            key: 'center',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${fixedLeftWidth - 0.5}px`,
                overflow: 'hidden',
                width: `${visibleWidth - fixedLeftWidth - fixedRightWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: centerCells,
        };
        const right: OverlayerView = {
            key: 'right',
            style: {
                position: 'absolute',
                top: `${0}px`,
                right: `${0}px`,
                overflow: 'hidden',
                width: `${fixedRightWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: rightCells,
        };
        const body: OverlayerWrapper = {
            type: 'body',
            class: `${CSS_PREFIX}-overlayer-body`,
            style: {
                position: 'relative',
                overflow: 'hidden',
                width: `${visibleWidth}px`,
                height: `${visibleHeight}px`,
            },
            views: [left, center, right],
        };
        return body;
    }
    private getFooter() {
        const centerCells: Cell[] = [];
        const leftCells: Cell[] = [];
        const rightCells: Cell[] = [];
        this.ctx.footer.renderRows.forEach((row: { cells: Cell[] }) => {
            row.cells.forEach((cell: Cell) => {
                if (cell.cellType === 'footer' && cell.renderFooter) {
                    // 把转renderFooter成render统一出口
                    cell.render = cell.renderFooter;
                    if (cell.fixed === 'left') {
                        leftCells.push(cell);
                    } else if (cell.fixed === 'right') {
                        rightCells.push(cell);
                    } else {
                        centerCells.push(cell);
                    }
                }
            });
        });
        const {
            fixedLeftWidth,
            fixedRightWidth: _fixedRightWidth,
            config: { CSS_PREFIX },
        } = this.ctx;
        const layoutScrollerTrackSize = getLayoutScrollerTrackSize(this.ctx.config);
        const { visibleWidth, visibleHeight } = this.ctx.footer;
        // 减去滚动条的宽度
        const fixedRightWidth = _fixedRightWidth - layoutScrollerTrackSize;
        const left: OverlayerView = {
            key: 'left',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${0.5}px`,
                overflow: 'hidden',
                width: `${fixedLeftWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: leftCells,
        };
        const center: OverlayerView = {
            key: 'center',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${fixedLeftWidth - 0.5}px`,
                overflow: 'hidden',
                width: `${visibleWidth - fixedLeftWidth - fixedRightWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: centerCells,
        };
        const right: OverlayerView = {
            key: 'right',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                right: `${0.5}px`,
                overflow: 'hidden',
                width: `${fixedRightWidth}px`,
                height: `${visibleHeight}px`,
            },
            cells: rightCells,
        };
        const footer: OverlayerWrapper = {
            type: 'footer',
            class: `${CSS_PREFIX}-overlayer-footer`,
            style: {
                position: 'relative',
                overflow: 'hidden',
                width: `${visibleWidth}px`,
                height: `${visibleHeight}px`,
            },
            views: [left, center, right],
        };
        return footer;
    }
}
