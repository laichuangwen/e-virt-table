import { CellConfig } from "../types";
import Cell from "./Cell";
import Context from "./Context";

export default class CellHeader extends Cell {
    constructor(context: Context, config: CellConfig) {
        super(context, {
            ...config,
            cellType: 'header',
        });
    }
    update(): void {
        
    }
    draw(): void {
        this.context.paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: 'pink',
            borderColor: this.context.config.borderColor,
            borderWidth: 1,
        });
    }
}