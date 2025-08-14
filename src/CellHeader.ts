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
    sortIconName = 'sort-default';
    sortAscIconName = 'sort-asc';
    sortDescIconName = 'sort-desc';
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
    drawSelectionImageSource?: HTMLImageElement;
    // 排序相关
    drawSortImageX = 0;
    drawSortImageY = 0;
    drawSortImageWidth = 0;
    drawSortImageHeight = 0;
    drawSortImageName = '';
    drawSortImageSource?: HTMLImageElement;
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
        this.sortIconName = column.sortIconName || 'sort-default';
        this.sortAscIconName = column.sortAscIconName || 'sort-asc';
        this.sortDescIconName = column.sortDescIconName || 'sort-desc';
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
        this.drawEdge();
        this.drawSelection();
        this.recalculateTextPosition();
        this.drawText();
        this.drawSelector();
        this.drawSortIcon();
    }
    private drawEdge() {
        const {
            paint,
            config: { BORDER_COLOR, BORDER },
        } = this.ctx;

        // 有边框的情况下，绘制边框
        paint.drawRect(this.drawX, this.drawY, this.width, this.height, {
            borderColor: BORDER ? BORDER_COLOR : 'transparent',
            fillColor: this.drawCellBgColor,
        });
    }
    private recalculateTextPosition() {
        // 对于 selection 类型的列，文本在复选框右侧显示
        let textX = this.drawX;
        let textWidth = this.width;
        if (['selection', 'index-selection', 'selection-tree', 'tree-selection'].includes(this.type)) {
            const { CHECKBOX_SIZE } = this.ctx.config;
            if (this.align === 'left' || this.align === 'right') {
                textX = this.drawX + CHECKBOX_SIZE + 4;
                textWidth = this.width - textX + this.drawX;
            } else {
                // 复选框居中位置
                const checkboxCenterX = this.drawX + (this.width - CHECKBOX_SIZE) / 2;
                textX = checkboxCenterX + CHECKBOX_SIZE + 1; // 复选框右侧，最小间距
                // 确保文本有足够的显示空间
                textWidth = this.width - textX + this.drawX;
            }
        }

        // 如果有排序图标，调整文本位置
        if (this.column.sortBy) {
            const iconSize = 16;
            const iconMargin = 4;

            if (this.align === 'right') {
                // 居右时，文本需要为图标留出空间
                textWidth = this.width - this.ctx.config.CELL_PADDING - iconSize - iconMargin;
                textX = this.drawX + this.ctx.config.CELL_PADDING;
            } else if (this.align === 'center') {
                // 居中时，文本宽度需要考虑图标
                const textWidthNeeded = this.measureTextWidth(this.displayText, this.ctx.config.HEADER_FONT);
                const totalWidth = textWidthNeeded + iconSize + iconMargin;
                if (totalWidth > this.width - this.ctx.config.CELL_PADDING * 2) {
                    textWidth = this.width - this.ctx.config.CELL_PADDING * 2 - iconSize - iconMargin;
                }
            }
        }
        this.drawTextX = textX;
        this.drawTextWidth = textWidth;
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

        // 选中框类型
        if (['index-selection', 'selection', 'selection-tree', 'tree-selection'].includes(this.type)) {
            const { indeterminate, check, selectable } = this.ctx.database.getCheckedState();
            const { CHECKBOX_SIZE = 0, CELL_PADDING } = this.ctx.config;
            // 默认居中
            let iconX = this.drawX + (this.width - CHECKBOX_SIZE) / 2;
            let iconY = this.drawY + (this.height - CHECKBOX_SIZE) / 2;
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
                iconY = this.drawY + this.height - CHECKBOX_SIZE - CELL_PADDING / 2;
            }

            let checkboxImage: HTMLImageElement | undefined = this.ctx.icons.get('checkbox-uncheck');
            let checkboxName = 'checkbox-uncheck';
            if (indeterminate) {
                checkboxImage = this.ctx.icons.get('checkbox-indeterminate');
                checkboxName = 'checkbox-indeterminate';
            } else if (check && selectable) {
                checkboxImage = this.ctx.icons.get('checkbox-check');
                checkboxName = 'checkbox-check';
            } else if (check && !selectable) {
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
    private drawSortIcon() {
        // 如果没有sortBy配置且不是后端排序，不显示排序图标
        if (!this.column.sortBy) {
            return;
        }

        const { CELL_PADDING = 0 } = this.ctx.config;
        const iconSize = 16;
        const iconMargin = 4;
        let iconName = this.sortIconName;
        // 前端排序
        const sortState = this.ctx.database.getSortState(this.key);
        if (sortState.direction === 'asc') {
            iconName = this.sortAscIconName;
        } else if (sortState.direction === 'desc') {
            iconName = this.sortDescIconName;
        }
        const icon = this.ctx.icons.get(iconName);
        if (!icon) {
            return;
        }
        // 计算图标位置
        let iconX = 0;
        let iconY = this.drawY + (this.height - iconSize) / 2;

        if (this.align === 'left') {
            // 居左：先绘制文字，图标紧跟文字
            const textWidth = this.measureTextWidth(this.displayText, this.ctx.config.HEADER_FONT);
            iconX = this.drawX + CELL_PADDING + textWidth + iconMargin;
        } else if (this.align === 'center') {
            // 居中：先居中绘制文字，然后图标紧跟文字
            const textWidth = this.measureTextWidth(this.displayText, this.ctx.config.HEADER_FONT);
            const textCenterX = this.drawX + this.width / 2;
            const textStartX = textCenterX - textWidth / 2;
            iconX = textStartX + textWidth + iconMargin;
        } else if (this.align === 'right') {
            // 居右：先绘制图标靠右，然后文字根据图标绘制后的位置紧贴在图标的左侧
            iconX = this.drawX + this.width - CELL_PADDING - iconSize;
        }

        // 保存图标信息
        this.drawSortImageX = iconX;
        this.drawSortImageY = iconY;
        this.drawSortImageWidth = iconSize;
        this.drawSortImageHeight = iconSize;
        this.drawSortImageName = iconName;
        this.drawSortImageSource = icon;

        // 绘制图标
        this.ctx.paint.drawImage(
            this.drawSortImageSource,
            this.drawSortImageX,
            this.drawSortImageY,
            this.drawSortImageWidth,
            this.drawSortImageHeight,
        );
    }
    private measureTextWidth(text: string, font: string): number {
        const canvas = this.ctx.canvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return 0;

        ctx.font = font;
        return ctx.measureText(text).width;
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
