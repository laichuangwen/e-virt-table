import { Column } from "../types";
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
    update() {
        this.width = this.context.stageWidth;
        this.height = 100;
        this.x = 0;
        this.y = 0;
        const colNodes = this.context.store.renderColNodes;
        let list: CellHeader[] = [];
        console.time('cell header');
        
        const loop = (nodes: ColNode[]) => {
            for (const colNode of nodes) {
                const cell = new CellHeader(this.context, {
                    zIndex: 1005,
                    fixed: colNode.fixed,
                    cellType: 'header',
                    x: colNode.x,
                    y: colNode.y,
                    width: colNode.width,
                    height: colNode.height,
                });
                if (cell.isHorizontalVisible() && cell.isVerticalVisible()) {
                    list.push(cell);
                }
                if (colNode.hasChildren) {
                    loop(colNode.childrenNodes);
                }
            }
        }
        loop(colNodes);
        this.cells = list;
        console.log('list', list.length);
        console.timeEnd('cell header');
    }
    render(paint: Paint) {
        paint.drawRect(0, 0, this.width, this.height, {
            fillColor: this.context.config.HEADER_BG_COLOR,
        });
        for (const cell of this.cells) {
            cell.draw();
        }
    }
}