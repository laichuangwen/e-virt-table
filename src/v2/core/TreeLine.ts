import Context from "./Context";
import { Icon } from "./Icon";
import { Paint } from "./Paint";
import { RowNode } from "./Store";
import { Widget } from "./Widget";
import Text from "./Text";

export class TreeLine extends Widget {
    private readonly text: Text;
    private readonly row: RowNode;
    private readonly enabled: boolean;
    constructor(context: Context, text: Text, row: RowNode, enabled: boolean) {
        super(context, { x: 0, y: 0, width: 0, height: 0, zIndex: -1 });
        this.text = text;
        this.row = row;
        this.enabled = enabled;
    }
    render(paint: Paint): void {
        const { treeLine, treeLineColor } = this.context.config;
        const cell = this.parent;
        if (!treeLine || !this.enabled || !cell) return;
        const icon = this.text.getBeforeWidgets().find((widget) => widget instanceof Icon && widget.name === 'expand');
        if (!icon) return;
        const left = icon.x;
        const treeIndent = icon.width;
        const iconCenterX = left + icon.width / 2;
        const iconCenterY = icon.y + icon.height / 2;
        const level = this.row.level;
        const baseX = left - level * treeIndent;
        const line = {
            borderColor: treeLineColor,
            borderWidth: 1,
            lineDash: [4, 4],
            lineDashOffset: 0,
        };
        const parentRowKeys = this.row.parentRowKeys;
        if (level > 0) {
            for (let i = 0; i < level - 1; i += 1) {
                const nextKey = parentRowKeys[i + 2];
                const nextRow = nextKey ? this.context.store.getRowNode(nextKey) : undefined;
                if (nextRow?.isLastChild) continue;
                const vx = Math.round(left - (level - i) * treeIndent + icon.width / 2);
                paint.drawLine([vx, cell.y, vx, cell.y + cell.height], line);
            }
            const vxParent = Math.round(left - treeIndent + icon.width / 2);
            const y2 = this.row.isLastChild ? iconCenterY : cell.y + cell.height;
            paint.drawLine([vxParent, cell.y, vxParent, y2], line);
            const currVX = Math.round(baseX + (level - 1) * treeIndent + icon.width / 2);
            paint.drawLine([currVX, iconCenterY, iconCenterX, iconCenterY], line);
        }
        if (this.row.hasChildren && this.row.expand) {
            paint.drawLine(
                [iconCenterX, icon.y + icon.height, iconCenterX, cell.y + cell.height],
                line,
            );
        }
    }
}