import { CellType } from "../types";
import Cell from "./Cell";
import Context from "./Context";
import { ColNode, RowNode } from "./Store";
import Text from "./Text";
import { Paint } from "./Paint";
export interface CellHeaderConfig {
    cellType: CellType,
    colNode: ColNode,
}
export default class CellBody extends Cell {
    private colNode: ColNode;
    private rowNode: RowNode;
    private text: Text | null = null;
    constructor(context: Context, colNode: ColNode, rowNode: RowNode) {
        super(context, {
            x: colNode.x,
            y: rowNode.y,
            width: colNode.width,
            height: rowNode.height,
            fixed: colNode.fixed,
            cellType: 'body',
        });
        this.colNode = colNode;
        this.rowNode = rowNode;
        if (['left', 'right'].includes(this.colNode.fixed)) {
            this.zIndex = 100;
        }
        const { cellAlign, cellVerticalAlign, cellPadding, bodyTextColor } = this.context.config;
        const { maxLineClamp } = this.colNode.column;
        this.text = new Text(this.context, {
            beforeIcons: [],
            afterIcons: [],
            maxLineClamp,
            align: cellAlign,
            verticalAlign: cellVerticalAlign,
            padding: cellPadding,
            selectionKey: `body:${this.colNode.key}:${this.rowNode.key}`,
            text: this.getText(),
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            color: bodyTextColor,
        });
        this.setChildren([this.text]);
    }
    getText(): string {
        return this.rowNode.getTextValue(this.colNode.column.key);
    }
    update(): void {
        super.update();
    }
    render(paint: Paint): void {
        const { bodyBgColor, borderColor } = this.context.config;
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: bodyBgColor,
            borderColor,
        });
    }
}