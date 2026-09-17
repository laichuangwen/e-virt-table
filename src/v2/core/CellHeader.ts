import { CellType } from "../types";
import Cell from "./Cell";
import Context from "./Context";
import { ColNode } from "./Store";
import Text from "./Text";
export interface CellHeaderConfig {
    cellType: CellType,
    colNode: ColNode,
}
export default class CellHeader extends Cell {
    private colNode: ColNode;
    private text: Text;
    constructor(context: Context, colNode: ColNode) {
        super(context, {
            x: colNode.x,
            y: colNode.y,
            width: colNode.width,
            height: colNode.height,
            fixed: colNode.fixed,
            cellType: 'header',
        });
        this.colNode = colNode;
        this.text = new Text(this.context, {
            align: 'left',
            verticalAlign: 'middle',
            padding: 8,
            selectionKey: `header:${this.colNode.key}`,
            text: this.colNode.column.title,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        });
        this.children.push(this.text);
        this.on('click:self', () => {
            console.log('click', this.colNode.column.title);
        }, {
            stopPropagation: true,
        });
    }
    update(): void {
        super.update();
    }
    draw(): void {
        const { headerBgColor, borderColor } = this.context.config;
        this.context.paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: headerBgColor,
            borderColor,
        });
        this.text.draw();
    }
}