import type Context from './Context';
import { generateShortUUID } from './util';
import type { Align, CellHeaderStyleMethod, Column, Fixed, Render, Type, VerticalAlign } from './types';
import BaseCell from './BaseCell';
import { Rule, Rules } from './Validator';
export default class CellHeader extends BaseCell {
    align: Align;
    hideHeaderSelection = false;
    verticalAlign: VerticalAlign = 'middle';
    fixed?: Fixed;
    minWidth?: number;
    maxWidth?: number;
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
    ellipsis = false;
    overflowTooltipShow = true;
    children: Column[] = [];
    column: Column;
    colIndex: number;
    rowKey: string;
    rules?: Rules | Rule;
    hasChildren: boolean;
    render: Render;
    style: Partial<CSSStyleDeclaration> = {};
    drawX = 0;
    drawY = 0;
    visibleWidth = 0;
    visibleHeight = 0;
    drawTextX = 0;
    drawTextY = 0;
    drawTextWidth = 0;
    drawTextHeight = 0;
    drawCellBgColor = '';
    drawTextColor = '';
    drawSelectionImageX = 0;
    drawSelectionImageY = 0;
    drawSelectionImageWidth = 0;
    drawSelectionImageHeight = 0;
    drawSelectionImageName = '';
    drawSelectionImageSource: HTMLImageElement | undefined;
    selectionTextX?: number;
    selectionTextWidth?: number;
    constructor(ctx: Context, colIndex: number, x: number, y: number, width: number, height: number, column: Column) {
        super(ctx, x, y, width, height, 'header', column.fixed);
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visibleWidth = width;
        this.visibleHeight = height;
        this.colIndex = colIndex;
        this.key = column.key;
        this.minWidth = column.minWidth;
        this.maxWidth = column.maxWidth;
        this.type = column.type || '';
        this.editorType = column.editorType || 'text';
        this.hideHeaderSelection = column.hideHeaderSelection || false;
        this.align = column.headerAlign || column.align || this.ctx.config.COLUMNS_ALIGN;
        this.verticalAlign =
            column.headerVerticalAlign || column.verticalAlign || this.ctx.config.COLUMNS_VERTICAL_ALIGN;
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
        this.overflowTooltipShow = column.overflowTooltipHeaderShow === false ? false : true;
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
        this.drawTextX = this.drawX;
        this.drawTextY = this.drawY;
        this.drawTextWidth = this.width;
        this.drawTextHeight = this.height;
        this.updateStyle();
    }
    draw() {
        const {
            paint,
            config: { BORDER_COLOR, BORDER },
        } = this.ctx;
        const { drawX, drawY } = this;
        // 有边框的情况下，绘制边框
        paint.drawRect(drawX, drawY, this.width, this.height, {
            borderColor: BORDER ? BORDER_COLOR : 'transparent',
            fillColor: this.drawCellBgColor,
        });

        // 先绘制复选框，再绘制文本
        this.drawSelection();
        this.drawText();
        this.drawSelector();
    }
    private drawText() {
        const {
            paint,
            config: { HEADER_FONT, CELL_PADDING },
        } = this.ctx;
        this.ellipsis = paint.drawText(
            this.displayText,
            this.drawTextX,
            this.drawTextY,
            this.drawTextWidth,
            this.drawTextHeight,
            {
                font: HEADER_FONT,
                padding: CELL_PADDING,
                color: this.drawTextColor,
                align: this.align,
                verticalAlign: this.verticalAlign,
            },
        );
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
        if (this.hideHeaderSelection) {
            return;
        }
        const { width, height, type } = this;
        // 选中框类型
        if (['index-selection', 'selection', 'selection-tree', 'tree-selection'].includes(type)) {
            const { indeterminate, check, selectable } = this.ctx.database.getCheckedState();
            const { CHECKBOX_SIZE = 0, CELL_PADDING } = this.ctx.config;
            // 默认居中
            let iconX = this.drawX + (width - CHECKBOX_SIZE) / 2;
            let iconY = this.drawY + (height - CHECKBOX_SIZE) / 2;
            this.drawTextX = iconX + CHECKBOX_SIZE - CELL_PADDING / 2;
            this.drawTextWidth = this.drawX + this.visibleWidth - this.drawTextX;
            if (this.align === 'left' || this.align === 'right') {
                iconX = this.drawX + CELL_PADDING;
                this.drawTextX = iconX + CHECKBOX_SIZE - CELL_PADDING / 2;
                this.drawTextWidth = this.drawX + this.visibleWidth - this.drawTextX;
            }
            if (this.verticalAlign === 'top') {
                iconY = this.drawY + CELL_PADDING / 2;
            } else if (this.verticalAlign === 'bottom') {
                iconY = this.drawY + height - CHECKBOX_SIZE - CELL_PADDING / 2;
            }

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
                this.drawSelectionImageX = iconX;
                this.drawSelectionImageY = iconY;
                this.drawSelectionImageWidth = CHECKBOX_SIZE;
                this.drawSelectionImageHeight = CHECKBOX_SIZE;
                this.drawSelectionImageName = checkboxName;
                this.drawSelectionImageSource = checkboxImage;
                this.ctx.paint.drawImage(
                    this.drawSelectionImageSource,
                    this.drawSelectionImageX,
                    this.drawSelectionImageY,
                    this.drawSelectionImageWidth,
                    this.drawSelectionImageHeight,
                );
            }

            // 不再需要保存文本位置信息，直接在 draw 方法中计算
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
