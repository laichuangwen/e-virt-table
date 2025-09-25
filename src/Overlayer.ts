import Cell from './Cell';
import type CellHeader from './CellHeader';
import type Context from './Context';
import type { OverlayerContainer, OverlayerView, OverlayerWrapper } from './types';
import { throttle } from './util';
export default class Overlayer {
    ctx: Context;
    observer: MutationObserver;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.observer = new MutationObserver(
            throttle(() => {
                // 当 DOM 发生变化时执行的回调
                const elements = this.ctx.overlayerElement.querySelectorAll('[data-auto-height="true"]');
                const map = new Map<string, number>();
                elements.forEach((element) => {
                    const rowIndex = Number(element.getAttribute('data-row-index'));
                    const colIndex = Number(element.getAttribute('data-col-index'));
                    if (isNaN(rowIndex)) {
                        return;
                    }
                    if (isNaN(colIndex)) {
                        return;
                    }
                    if (!(element instanceof HTMLElement)) {
                        return;
                    }
                    if (element.offsetWidth === 0) {
                        return;
                    }
                    const key = `${rowIndex}\u200b_${colIndex}`;
                    map.set(key, Math.round(element.offsetHeight));
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
        this.observer.observe(this.ctx.overlayerElement, { childList: true, subtree: true, attributes: true });
    }
    private arerMapsEqual(m1: Map<string, number>, m2: Map<string, number>): boolean {
        if (m1.size !== m2.size) return false;

        for (let [key, value] of m1) {
            if (!m2.has(key)) return false;
            if (m2.get(key) !== value) return false;
        }

        return true;
    }
    draw() {
        const overlayer = this.getContainer();
        this.ctx.emit('overlayerChange', overlayer);
        
        // 为扩展容器添加事件处理
        this.setupExtendContainerEvents();
    }
    
    /**
     * 为扩展容器设置事件处理，防止点击穿透引发滚动
     */
    private setupExtendContainerEvents() {
        // 延迟执行，确保 DOM 已经渲染
        setTimeout(() => {
            // 查找所有扩展单元格的容器
            const extendCells = this.ctx.overlayerElement.querySelectorAll('[data-extend-content="true"]');
            extendCells.forEach((cellElement) => {
                // 移除之前的事件监听器（如果存在）
                cellElement.removeEventListener('mousedown', this.preventScrollEvent);
                cellElement.removeEventListener('click', this.preventScrollEvent);
                
                // 只添加必要的事件监听器，不阻止滚轮
                cellElement.addEventListener('mousedown', this.preventScrollEvent);
                cellElement.addEventListener('click', this.preventScrollEvent);
            });
        }, 0);
    }
    
    /**
     * 阻止滚动事件的处理函数
     */
    private preventScrollEvent = (e: Event) => {
        // 只阻止 mousedown 和 click 事件的冒泡，保留滚轮功能
        if (e.type === 'mousedown' || e.type === 'click') {
            e.stopPropagation();
        }
        // 不阻止滚轮事件，让它正常传播以保持滚动功能
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
            config: { SCROLLER_TRACK_SIZE, CSS_PREFIX },
        } = this.ctx;
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
        const fixedRightWidth = _fixedRightWidth - SCROLLER_TRACK_SIZE;
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
        const extendCells: Cell[] = []; // 专门为 ExtendRow 创建的全宽单元格数组
        let renderRows = this.ctx.body.renderRows;
        // 合计如果不是固定在底部，就加入到渲染行中
        if (!this.ctx.config.FOOTER_FIXED) {
            renderRows = renderRows.concat(this.ctx.footer.renderRows);
        }
        renderRows.forEach((row: any) => {
            row.cells.forEach((cell: Cell) => {
                if (cell.cellType === 'footer') {
                    cell.render = cell.renderFooter;
                }
                if (cell.render) {
                    // ExtendRow 的单元格单独处理，不受固定列影响
                    if (row.rowType === 'extend' || (cell as any).isExtendContent) {
                        extendCells.push(cell);
                    } else if (cell.fixed === 'left') {
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
            config: { SCROLLER_TRACK_SIZE, CSS_PREFIX },
        } = this.ctx;
        const { visibleWidth, visibleHeight } = this.ctx.body;
        // 减去滚动条的宽度
        const fixedRightWidth = _fixedRightWidth - SCROLLER_TRACK_SIZE;
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
        // 为 ExtendRow 创建独立的全宽容器，不受固定列限制
        const extend: OverlayerView = {
            key: 'extend',
            style: {
                position: 'absolute',
                top: `${0.5}px`,
                left: `${0.5}px`, // 从最左边开始
                overflow: 'hidden',
                width: `${visibleWidth}px`, // 占据整个可视宽度
                height: `${visibleHeight}px`,
                zIndex: '10', // 确保在固定列之上
                pointerEvents: 'auto', // 允许扩展容器响应点击事件，防止穿透
            },
            cells: extendCells,
        };
        
        const views = [left, center, right];
        // 只有当存在扩展单元格时才添加扩展容器
        if (extendCells.length > 0) {
            views.push(extend);
        }
        
        const body: OverlayerWrapper = {
            type: 'body',
            class: `${CSS_PREFIX}-overlayer-body`,
            style: {
                position: 'relative',
                overflow: 'hidden',
                width: `${visibleWidth}px`,
                height: `${visibleHeight}px`,
            },
            views: views,
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
            config: { SCROLLER_TRACK_SIZE, CSS_PREFIX },
        } = this.ctx;
        const { visibleWidth, visibleHeight } = this.ctx.footer;
        // 减去滚动条的宽度
        const fixedRightWidth = _fixedRightWidth - SCROLLER_TRACK_SIZE;
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
