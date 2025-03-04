import type Context from './Context';
import { generateShortUUID } from './util';
import type { Align, CellHeaderStyleMethod, Column, Fixed, Render, Rules, Type, VerticalAlign } from './types';
import BaseCell from './BaseCell';
export default class CellHeader extends BaseCell {
    align: Align;
    verticalAlign: VerticalAlign = 'middle';
    fixed?: Fixed;
    widthFillDisable: boolean;
    type: Type | '';
    operation = false;
    editorType: string;
    level: number;
    text: string;
    displayText: string = '';
    colspan: number;
    rowspan: number;
    row: any;
    key: string;
    required = false;
    readonly = false;
    children: Column[] = [];
    column: Column;
    colIndex: number;
    rowKey: string;
    rules?: Rules;
    hasChildren: boolean;
    render: Render;
    style: Partial<CSSStyleDeclaration> = {};
    drawX = 0;
    drawY = 0;
    drawCellBgColor = '';
    drawTextColor = '';
    drawImageX = 0;
    drawImageY = 0;
    drawImageWidth = 0;
    drawImageHeight = 0;
    drawImageName = '';
    drawImageSource: HTMLImageElement | undefined;
    constructor(ctx: Context, colIndex: number, x: number, y: number, width: number, height: number, column: Column) {
        super(ctx, x, y, width, height, 'header', column.fixed);
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colIndex = colIndex;
        this.key = column.key;
        this.type = column.type || '';
        this.editorType = column.editorType || 'text';
        this.align = column.align || 'center';
        this.verticalAlign = column.verticalAlign || 'middle';
        this.fixed = column.fixed;
        this.level = column.level || 0;
        this.operation = column.operation || false;
        this.text = column.title;
        this.column = column;
        this.colspan = column.colspan || 1;
        this.widthFillDisable = column.widthFillDisable || false;
        this.rowspan = column.rowspan || 1;
        this.rules = column.rules;
        this.readonly = column.readonly || false;
        this.required = column.required || false;
        this.rowKey = generateShortUUID();
        this.hasChildren = (column.children && column.children.length > 0) || false; // 是否有子
        this.render = column.renderHeader;
    }
    /**
     * 是否可见，覆盖基类方法，表头是跟y滚动条没有关系的所以不需要加滚动参数
     * @returns
     */
    isVerticalVisible() {
        const { stageHeight } = this.ctx;
        const offsetHeight = stageHeight;
        return !(this.y + this.height <= 0 || this.y >= offsetHeight);
    }

    /**
     * 更新样式
     */
    updateStyle() {
        this.style = this.getOverlayerViewsStyle();
    }
    updateContainer() {
        const { HEADER_CELL_STYLE_METHOD, HEADER_BG_COLOR, HEADER_TEXT_COLOR } = this.ctx.config;
        let bgColor = HEADER_BG_COLOR;
        let textColor = HEADER_TEXT_COLOR;
        if (typeof HEADER_CELL_STYLE_METHOD === 'function') {
            const headerCellStyleMethod: CellHeaderStyleMethod = HEADER_CELL_STYLE_METHOD;
            const { backgroundColor, color } =
                headerCellStyleMethod({
                    colIndex: this.colIndex,
                    column: this.column,
                }) || {};
            if (backgroundColor) {
                bgColor = backgroundColor;
            }
            // 文字颜色
            if (color) {
                textColor = color;
            }
        }
        this.drawCellBgColor = bgColor;
        this.drawTextColor = textColor;
    }
    update() {
        this.updateContainer();
        this.displayText = this.getText();
        this.drawX = this.getDrawX();
        this.drawY = this.getDrawY();
        this.updateStyle();
    }
    draw() {
        const {
            paint,
            config: { BORDER_COLOR, CELL_PADDING, HEADER_FONT },
        } = this.ctx;
        const { drawX, drawY, displayText } = this;
        paint.drawRect(drawX, drawY, this.width, this.height, {
            borderColor: BORDER_COLOR,
            fillColor: this.drawCellBgColor,
        });
        paint.drawText(displayText, drawX, drawY, this.width, this.height, {
            font: HEADER_FONT,
            padding: CELL_PADDING,
            color: this.drawTextColor,
            align: this.align,
            verticalAlign: this.verticalAlign,
        });
        this.drawSelection();
        this.drawSelector();
    }
    private drawSelector() {
        // 选择区背景颜色
        const { ENABLE_SELECTOR } = this.ctx.config;
        if (!ENABLE_SELECTOR) {
            return;
        }
        const { xArr } = this.ctx.selector;
        const [minX, maxX] = xArr;
        if (this.colIndex >= minX && this.colIndex <= maxX) {
            this.ctx.paint.drawRect(this.drawX, this.drawY, this.width, this.height, {
                borderColor: 'transparent',
                fillColor: this.ctx.config.SELECT_ROW_COL_BG_COLOR || 'transparent',
            });
        }
    }
    private drawSelection() {
        const { width, height, type } = this;
        // 选中框类型
        if (['index-selection', 'selection'].includes(type)) {
            const { indeterminate, check, selectable } = this.ctx.database.getCheckedState();
            const { CHECKBOX_SIZE = 0 } = this.ctx.config;
            const _x = this.drawX + (width - CHECKBOX_SIZE) / 2;
            const _y = this.drawY + (height - CHECKBOX_SIZE) / 2;
            let checkboxImage: HTMLImageElement | undefined = this.ctx.icons.get('checkbox-uncheck');
            let checkboxName = 'checkbox-uncheck';
            if (indeterminate) {
                checkboxImage = this.ctx.icons.get('checkbox-indeterminate');
                checkboxName = 'checkbox-indeterminate';
            } else if (check && selectable) {
                checkboxImage = this.ctx.icons.get('checkbox-check');
                checkboxName = 'checkbox-check';
            } else if (check && selectable) {
                checkboxImage = this.ctx.icons.get('checkbox-check-disabled');
                checkboxName = 'checkbox-check-disabled';
            } else if (!check && selectable) {
                checkboxImage = this.ctx.icons.get('checkbox-uncheck');
                checkboxName = 'checkbox-uncheck';
            } else {
                checkboxImage = this.ctx.icons.get('checkbox-disabled');
                checkboxName = 'checkbox-disabled';
            }
            if (checkboxImage) {
                this.drawImageX = _x;
                this.drawImageY = _y;
                this.drawImageWidth = CHECKBOX_SIZE;
                this.drawImageHeight = CHECKBOX_SIZE;
                this.drawImageName = checkboxName;
                this.drawImageSource = checkboxImage;
                this.ctx.paint.drawImage(
                    this.drawImageSource,
                    this.drawImageX,
                    this.drawImageY,
                    this.drawImageWidth,
                    this.drawImageHeight,
                );
            }
        }
    }
    getText() {
        if (this.render) {
            return '';
        }
        return this.text;
    }
    /**
     * 获取样式
     */
    getOverlayerViewsStyle() {
        let left = '';
        if (this.fixed === 'left') {
            left = `${this.drawX}px`;
        } else if (this.fixed === 'right') {
            left = `${this.drawX - (this.ctx.stageWidth - this.ctx.fixedRightWidth)}px`;
        } else {
            // 中间的，需要减去左边固定列的宽度
            left = `${this.drawX - this.ctx.fixedLeftWidth}px`;
        }
        return {
            position: 'absolute',
            overflow: 'hidden',
            left: left,
            top: `${this.drawY + 1}px`,
            width: `${this.width}px`,
            height: `${this.height - 2}px`,
            pointerEvents: 'initial',
            userSelect: 'none',
        };
    }
}
