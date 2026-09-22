import Context from "./Context";
import { Widget } from "./Widget";
import Header from "./Header";
import Body from "./Body";
import Scrollbar from "./Scrollbar";
import { ColNode, RowNode } from "./Store";

export default class Table extends Widget {
    private header: Header;
    private body: Body;
    private verticalScrollbar: Scrollbar;
    private horizontalScrollbar: Scrollbar;
    constructor(context: Context) {
        super(context);
        this.header = new Header(context);
        this.body = new Body(context);
        this.verticalScrollbar = new Scrollbar(context, 'vertical');
        this.horizontalScrollbar = new Scrollbar(context, 'horizontal');
        this.setChildren([this.header, this.body, this.verticalScrollbar, this.horizontalScrollbar]);
        this.context.listener.on('resizeObserver',
            () => {
                // 重新设置滚动条位置,防止溢出了
                this.setScrollX(context.scrollX);
                this.setScrollY(context.scrollY);
                context.draw()
            }
        );
        this.on('pointerenter:self', (e) => {
            this.context.listener.emit('pointerenter:table', e);
            this.context.isTableHovering = true;
        });
        this.on('pointerleave:self', (e) => {
            this.context.listener.emit('pointerleave:table', e);
            this.context.isTableHovering = false;
        });
    }
    private binarySearch(nodes: ColNode[] | RowNode[], value: number) {
        let start = 0;
        let end = nodes.length - 1;
        let tempIndex = -1;
        while (start <= end) {
            const midIndex = Math.floor((start + end) / 2);
            const node = nodes[midIndex];
            let midValue = 0;
            let inside = false;
            if (node instanceof ColNode) {
                midValue = node.x;
                inside = node.x <= value && node.x + node.width >= value;
            } else if (node instanceof RowNode) {
                midValue = node.y;
                inside = node.y <= value && node.y + node.height >= value;
            }
            if (inside) {
                return midIndex;
            } else if (midValue < value) {
                start = midIndex + 1;
            } else {
                tempIndex = midIndex;
                end = midIndex - 1;
            }
        }
        return tempIndex;
    }
    setScrollY(scrollY: number) {
        const _scrollY = Math.max(0, Math.min(Math.round(scrollY), this.verticalScrollbar.maxScroll));
        if (this.context.scrollY === _scrollY) return;
        this.context.scrollY = _scrollY;
        this.context.draw();
    }
    setScrollX(scrollX: number) {
        const _scrollX = Math.max(0, Math.min(Math.round(scrollX), this.horizontalScrollbar.maxScroll));
        if (this.context.scrollX === _scrollX) return;
        this.context.scrollX = _scrollX;
        this.context.draw();
    }
    update() {
        this.context.scrollbarGutter = this.verticalScrollbar.scrollbarGutter;
        this.context.maxScrollY = this.verticalScrollbar.maxScroll;
        this.context.maxScrollX = this.horizontalScrollbar.maxScroll;
        const { centerColNodes, rowNodes } = this.context.store;
        const { scrollX, stageWidth, scrollbarGutter, stageHeight, scrollY } = this.context;
        const { fixedRightWidth, fixedLeftWidth, headerHeight } = this.context.store;
        this.height = stageHeight;
        this.width = stageWidth;
        this.context.startCenterIndex = this.binarySearch(centerColNodes, scrollX - fixedLeftWidth);
        this.context.endCenterIndex = this.binarySearch(centerColNodes, scrollX + stageWidth - scrollbarGutter - fixedRightWidth);
        this.context.startRowIndex = this.binarySearch(rowNodes, scrollY + headerHeight);
        this.context.endRowIndex = this.binarySearch(rowNodes, scrollY + stageHeight - scrollbarGutter);
        super.update();
        console.log('table update', this.getChildren());
    }
}
