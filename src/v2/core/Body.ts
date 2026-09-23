import CellBody from "./CellBody";
import Context from "./Context";
import FixedShadow from "./FixedShadow";
import { Paint } from "./Paint";
import { ColNode, RowNode } from "./Store";
import { Widget } from "./Widget";

export default class Body extends Widget {
    private fixedLeftShadow: FixedShadow | null = null;
    private fixedShadowRight: FixedShadow | null = null;
    constructor(context: Context) {
        super(context);
    }
    private getLeafColNodes(colNodes: ColNode[]) {
        // 递归遍历取最末级数
        const leaves: ColNode[] = [];
        const walk = (nodes: ColNode[]): void => {
            for (const child of nodes){
                if (child.hasChildren) {
                    walk(child.childrenNodes);
                } else {
                    leaves.push(child);
                }
            };
        };
        walk(colNodes);
        return leaves;
    }
    update() {
        const headerHeight = this.context.store.headerHeight;
        const { scrollbarGutter, stageWidth, stageHeight } = this.context;
        const { centerColNodes, leftColNodes, rightColNodes, rowNodes, fixedLeftWidth, fixedRightWidth } = this.context.store;
        const { startRowIndex, endRowIndex, startCenterIndex, endCenterIndex } = this.context;
        const visibleCenterColNodes = centerColNodes.slice(startCenterIndex, endCenterIndex + 1);
        const visibleColNodes = [...leftColNodes, ...visibleCenterColNodes, ...rightColNodes];
        const leafColNodes = this.getLeafColNodes(visibleColNodes);
        const visibleRowNodes = rowNodes.slice(startRowIndex, endRowIndex + 1);
        this.x = 0;
        this.y = headerHeight;
        this.width = stageWidth - scrollbarGutter;
        this.height = stageHeight - headerHeight - scrollbarGutter;
        this.fixedLeftShadow = new FixedShadow(this.context, {
            fixed: 'left',
            x: 0,
            y: headerHeight,
            width: fixedLeftWidth,
            height: this.height,
            zIndex: 50,
        });
        this.fixedShadowRight = new FixedShadow(this.context, {
            fixed: 'right',
            x: stageWidth - fixedRightWidth - scrollbarGutter,
            y: headerHeight,
            width: fixedRightWidth,
            height: this.height,
            zIndex: 50,
        });
        let list: CellBody[] = [];
        const generateCells = (rowNodes: RowNode[]) => {
            for (const rowNode of rowNodes) {
                for (const colNode of leafColNodes) {
                    const cell = new CellBody(this.context, colNode, rowNode);
                    list.push(cell);
                }
                if (rowNode.hasChildren) {
                    generateCells(rowNode.childrenNodes);
                }
            }
        }
        generateCells(visibleRowNodes);
        this.setChildren([this.fixedLeftShadow, this.fixedShadowRight, ...list]);
    }
    render(paint: Paint) {
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: this.context.config.bodyBgColor,
        });
    }
}