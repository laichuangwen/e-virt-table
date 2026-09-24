import { CellType, Padding, PaddingInput } from "../types";
import Cell from "./Cell";
import Context from "./Context";
import { ColNode, RowNode } from "./Store";
import Text from "./Text";
import { Paint } from "./Paint";
import { Icon } from "./Icon";
export interface CellHeaderConfig {
    cellType: CellType,
    colNode: ColNode,
}
export default class CellBody extends Cell {
    private colNode: ColNode;
    private rowNode: RowNode;
    private checkIcon: Icon | null = null;
    private expandIcon: Icon | null = null;
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
        const { cellAlign, cellVerticalAlign, cellPadding, bodyTextColor, cellTextWidgetGap } = this.context.config;
        const { maxLineClamp, align, verticalAlign } = this.colNode.column;
        const checkState = this.rowNode.getCheckState();
        const { checkboxSize, expandIconSize } = this.context.config;
        const icon = this.context.config.getIcon(`checkbox-${checkState}`);
        this.checkIcon = new Icon(this.context, {
            name: 'check',
            x: this.x,
            y: this.y,
            width: checkboxSize,
            height: checkboxSize,
            source: icon?.source,
            color: icon?.color || '',
            visible: this.checkboxVisible,
            on: {
                'click:self': () => {
                    const checkState = this.rowNode.getCheckState();
                    if (checkState === 'disabled') return;
                    this.rowNode.setChecked(checkState === 'checked' ? 'unchecked' : 'checked');
                    this.context.draw();
                },
            },
        });
        const expandIcon = this.context.config.getIcon('expand');
        this.expandIcon = new Icon(this.context, {
            name: 'expand',
            x: this.x,
            y: this.y,
            width: expandIconSize,
            height: expandIconSize,
            source: expandIcon?.source,
            color: expandIcon?.color || '',
            visible: this.expandVisible,
            rotate: this.isExpanded ? 90 : 0,
            reserveSpace: this.hasExpand && !this.expandVisible,
            on: {
                'click:self': () => {
                    this.context.store.setExpand(this.rowNode.key, !this.isExpanded);
                    this.context.draw();
                },
            },
        });
        this.text = new Text(this.context, {
            beforeWidgets: [this.checkIcon, this.expandIcon],
            afterWidgets: [],
            maxLineClamp,
            align: align || cellAlign,
            verticalAlign: verticalAlign || cellVerticalAlign,
            padding: cellPadding,
            selectionKey: `body:${this.colNode.key}:${this.rowNode.key}`,
            text: this.getText(),
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            color: bodyTextColor,
            offsetLeft: this.expandOffsetLeft,
            widgetGap: cellTextWidgetGap,
        });
        this.setChildren([this.text]);
        this.on('click:self', () => {
            console.log('click:self', this.colNode.key, this.rowNode.key);
        });
        this.on('pointerenter:self', () => {
            this.context.store.setHoverRowNode(this.rowNode);
        });
    }
    get isCurrentRowHovered(): boolean {
        return this.rowNode === this.context.store.getHoverRowNode();
    }
    get isChecked(): boolean {
        return this.rowNode.getCheckState() === 'checked';
    }
    get hasExpand() {
        const { type } = this.colNode.column;
        return type === 'tree' || type === 'selection-tree' || type === 'tree-selection';
    }
    get expandVisible(): boolean {
        if (!this.rowNode.hasChildren) return false;
        if (this.hasExpand) return true;
        return false;
    }
    get expandOffsetLeft(): number {
        const { expandIconSize } = this.context.config;
        if (!this.hasExpand) return 0;
        return expandIconSize * this.rowNode.level;
    }
    get checkboxVisible(): boolean {
        const { type } = this.colNode.column;
        if (type === 'selection') return true;
        if (type === 'selection-text') return true;
        if (type === 'index-selection' && this.isChecked) return true;
        if (type === 'index-selection' && this.isCurrentRowHovered) return true;
        return false;
    }
    get isExpanded(): boolean {
        return this.rowNode.getExpand();
    }
    get displayText(): string {
        return this.rowNode.getTextValue(this.colNode.column.key);
    }
    getText(): string {
        const { type } = this.colNode.column;
        if (type === 'selection') return '';
        if (type === 'index-selection' && this.isCurrentRowHovered) return '';
        if (type === 'index-selection' && this.isChecked) return '';
        if (type === 'index' || type === 'index-selection') return String(this.rowNode.rowIndex + 1) || '';
        return this.displayText;
    }
    update(): void {
        super.update();
    }
    draw(): void {
        if (!this.visible) return;
        const paint = this.context.paint;
        this.render(paint);
        this.drawTreeLine(paint);
        for (const child of this.getChildren()) child.draw();
    }
    private drawTreeLine(paint: Paint): void {
        const { treeLine, treeLineColor } = this.context.config;
        if (!treeLine || !this.hasExpand) return;
        const icon = this.expandIcon;
        if (!icon) return;
        const row = this.rowNode;
        const level = row.level;
        const treeIndent = icon.width;
        const iconCenterX = icon.x + icon.width / 2;
        const iconCenterY = icon.y + icon.height / 2;
        const baseX = icon.x - level * treeIndent;
        const line = {
            borderColor: treeLineColor,
            borderWidth: 1,
            lineDash: [4, 4],
            lineDashOffset: 0,
        };
        const parentRowKeys = row.parentRowKeys;
        if (level > 0) {
            for (let i = 0; i < level - 1; i += 1) {
                const nextKey = parentRowKeys[i + 2];
                const nextRow = nextKey ? this.context.store.getRowNode(nextKey) : undefined;
                if (nextRow?.isLastChild) continue;
                const vx = Math.round(icon.x - (level - i) * treeIndent + icon.width / 2);
                paint.drawLine([vx, this.y, vx, this.y + this.height], line);
            }
            const vxParent = Math.round(icon.x - treeIndent + icon.width / 2);
            const y2 = row.isLastChild ? iconCenterY : this.y + this.height;
            paint.drawLine([vxParent, this.y, vxParent, y2], line);
            const currVX = Math.round(baseX + (level - 1) * treeIndent + icon.width / 2);
            paint.drawLine([currVX, iconCenterY, iconCenterX, iconCenterY], line);
        }
        if (row.hasChildren && row.expand) {
            paint.drawLine(
                [iconCenterX, icon.y + icon.height, iconCenterX, this.y + this.height],
                line,
            );
        }
    }
    render(paint: Paint): void {
        const { bodyBgColor, borderColor } = this.context.config;
        paint.drawRect(this.x, this.y, this.width, this.height, {
            fillColor: bodyBgColor,
            borderColor,
        });
    }
}