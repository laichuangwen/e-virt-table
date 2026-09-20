import CellHeader from "./CellHeader";
import Context from "./Context";
import { Paint } from "./Paint";
import { ColNode } from "./Store";
import { Widget } from "./Widget";
export default class Header extends Widget {
    cells: CellHeader[] = [];
    constructor(context: Context) {
        super(context);
        this.zIndex = 1000;
    }
    private binarySearch(colNodes: ColNode[], value: number) {
        let start = 0;
        let end = colNodes.length - 1;
        let tempIndex = -1;
        while (start <= end) {
            const midIndex = Math.floor((start + end) / 2);
            const node = colNodes[midIndex];
            const midValue = node.x;
            if (node.x <= value && node.x + node.width >= value) {
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
    update() {
        this.width = this.context.stageWidth;
        this.height = this.context.store.headerHeight;
        this.x = 0;
        this.y = 0;
        console.time('cell header');
        const { leftColNodes, rightColNodes, centerColNodes } = this.context.store;
        let list: CellHeader[] = [];
        const { scrollX, stageWidth, scrollbarGutter } = this.context;
        const { fixedRightWidth, fixedLeftWidth } = this.context.store;
        let startIndex = this.binarySearch(centerColNodes, scrollX - fixedLeftWidth);
        let endIndex = this.binarySearch(centerColNodes, scrollX + stageWidth - scrollbarGutter - fixedRightWidth);
        const visibleCenterColNodes = centerColNodes.slice(startIndex, endIndex + 1);
        const visibleColNodes = [...leftColNodes, ...visibleCenterColNodes, ...rightColNodes];
        const generateCells = (nodes: ColNode[]) => {
            for (const colNode of nodes) {
                const cell = new CellHeader(this.context, colNode, this.zIndex);
                list.push(cell);
                if (colNode.hasChildren) {
                    generateCells(colNode.childrenNodes);
                }
            }
        }
        generateCells(visibleColNodes);
        this.cells = list;
        this.setChildren(list);

        console.log('list', list.map(item => item.zIndex));
        console.timeEnd('cell header');
    }
    render(paint: Paint) {
        paint.drawRect(0, 0, this.width, this.height, {
            fillColor: this.context.config.headerBgColor,
        });
        for (const cell of this.cells) {
            if (!cell.fixed) cell.draw();
        }
        for (const cell of this.cells) {
            if (cell.fixed) cell.draw();
        }
    }
}