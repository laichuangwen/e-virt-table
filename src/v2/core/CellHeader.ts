import Cell from "./Cell";
import Context from "./Context";
import { Icon } from "./Icon";
import { ColNode } from "./Store";
import Text from "./Text";
import { Paint } from "./Paint";
export default class CellHeader extends Cell {
    private colNode: ColNode;
    private checkIcon: Icon | null = null;
    private text: Text | null = null;
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
        if (['left', 'right'].includes(this.colNode.fixed)) {
            this.zIndex = 100;
        }
        const checkState = this.context.store.getStoreCheckState();
        const { checkboxSize } = this.context.config;
        const icon = this.context.config.getIcon(`checkbox-${checkState}`);
        this.checkIcon = new Icon(this.context, {
            name: 'check',
            x: this.x,
            y: this.y,
            width: checkboxSize,
            height: checkboxSize,
            source: icon?.source,
            color: 'red',
            visible: this.hasSelection,
            on: {
                'click:self': () => {
                    const checkState = this.context.store.getStoreCheckState();
                    const isCheckAll = checkState !== 'checked';
                    this.context.store.setCheckAll(isCheckAll);
                    this.context.draw();
                },
            },
        });
        const { cellAlign, cellVerticalAlign, cellPadding, headerTextColor,cellTextWidgetGap } = this.context.config;
        const { maxLineClampHeader, headerAlign, headerVerticalAlign, title, align, verticalAlign } = this.colNode.column;
        this.text = new Text(this.context, {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            beforeWidgets: [this.checkIcon],
            afterWidgets: [],
            padding: cellPadding,
            selectionKey: `header:${this.colNode.key}`,
            text: title,
            align: headerAlign || align || cellAlign,
            verticalAlign: headerVerticalAlign || verticalAlign || cellVerticalAlign,
            maxLineClamp: maxLineClampHeader,
            color: headerTextColor,
            widgetGap: cellTextWidgetGap,
        });
        this.setChildren([this.text]);
        this.on('click:self', () => {
            console.log('click-header=>>>>>>', this.colNode.column.title);
        });
    }
    get hasSelection(): boolean {
        return this.colNode.column.type?.includes('selection') ?? false;
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
    }
}