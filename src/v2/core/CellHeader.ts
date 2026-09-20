import { Type } from './../../types';
import { CellType } from "../types";
import Cell from "./Cell";
import Context from "./Context";
import { Icon } from "./Icon";
import { ColNode } from "./Store";
import Text from "./Text";
import checkboxCheck from "../svg/checkbox-check.svg?raw";
import checkboxUnchecked from "../svg/checkbox-uncheck.svg?raw";
import checkboxIndeterminate from "../svg/checkbox-indeterminate.svg?raw";
import { Paint } from "./Paint";
export interface CellHeaderConfig {
    cellType: CellType,
    colNode: ColNode,
}
const checkStateMap = {
    unchecked: checkboxUnchecked,
    checked: checkboxCheck,
    indeterminate: checkboxIndeterminate,
}
export default class CellHeader extends Cell {
    private colNode: ColNode;
    private checkIcon: Icon | null = null;
    private text: Text | null = null;
    constructor(context: Context, colNode: ColNode, zIndex: number) {
        super(context, {
            x: colNode.x,
            y: colNode.y,
            width: colNode.width,
            height: colNode.height,
            fixed: colNode.fixed,
            cellType: 'header',
        });
        this.colNode = colNode;
        this.zIndex = zIndex;
        if (['left', 'right'].includes(this.colNode.fixed)) {
            this.zIndex += 100;
        }

        const checkState = this.context.store.getStoreCheckState();
        
        this.checkIcon = new Icon(this.context, {
            name: 'check',
            x: this.x,
            y: this.y,
            width: 18,
            height: 18,
            source: checkStateMap[checkState],
            color: 'red',
            zIndex: this.zIndex,
            visible: colNode.column.type?.includes('selection') ?? false,
        });
        this.checkIcon.on('click:self', () => {
            const checkState = this.context.store.getStoreCheckState();
            const isCheckAll = checkState !== 'checked';
            this.context.store.setCheckAll(isCheckAll);
            this.context.draw();
        });
        // this.checkIcon.source = checkboxUnchecked;
        this.text = new Text(this.context, {
            zIndex: this.zIndex,
            beforeIcons: [this.checkIcon],
            afterIcons: [],
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
        this.setChildren([this.text, this.checkIcon]);
        this.text.on('click:self', () => {
            console.log('click-text');
        });

    }
    update(): void {
        super.update();
        console.log('cell header', this.zIndex);
    }
    render(paint: Paint): void {
        const { headerBgColor, borderColor } = this.context.config;
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: headerBgColor,
            borderColor,
        });
        this.text?.draw();
        this.checkIcon?.draw();
    }
}