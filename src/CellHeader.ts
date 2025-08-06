import type Context from './Context';
import { generateShortUUID } from './util';
import type { Align, CellHeaderStyleMethod, Column, Fixed, Render, Type, VerticalAlign } from './types';
import BaseCell from './BaseCell';
import { Rule, Rules } from './Validator';
export default class CellHeader extends BaseCell {
    align: Align;
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
    drawCellBgColor = '';
    drawTextColor = '';
    drawImageX = 0;
    drawImageY = 0;
    drawImageWidth = 0;
    drawImageHeight = 0;
    drawImageName = '';
    drawImageSource: HTMLImageElement | undefined;
    drawSelectionImageX = 0;
    drawSelectionImageY = 0;
    drawSelectionImageWidth = 0;
    drawSelectionImageHeight = 0;
    drawSelectionImageName = '';
    drawSelectionImageSource: HTMLImageElement | undefined;
    selectionTextX?: number;
    selectionTextWidth?: number;
    // 排序相关
    sortIconX = 0;
    sortIconY = 0;
    sortIconWidth = 0;
    sortIconHeight = 0;
    sortIconName = '';
    sortIconSource: HTMLImageElement | undefined;
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
        this.updateStyle();
    }
    draw() {
        const {
            paint,
            config: { BORDER_COLOR, HEADER_FONT, BORDER, CELL_PADDING },
        } = this.ctx;
        const { drawX, drawY, displayText } = this;
        // 有边框的情况下，绘制边框
        paint.drawRect(drawX, drawY, this.width, this.height, {
            borderColor: BORDER ? BORDER_COLOR : 'transparent',
            fillColor: this.drawCellBgColor,
        });

        // 先绘制复选框，再绘制文本
        this.drawSelection();

        // 对于 selection 类型的列，文本在复选框右侧显示
        let textX = drawX;
        let textWidth = this.width;
        if (['selection', 'index-selection', 'selection-tree', 'tree-selection'].includes(this.type)) {
            const { CHECKBOX_SIZE } = this.ctx.config;
            if (this.align === 'left' || this.align === 'right') {
                textX = drawX + CHECKBOX_SIZE + 4;
                textWidth = this.width - textX + drawX;
            } else {
                // 复选框居中位置
                const checkboxCenterX = drawX + (this.width - CHECKBOX_SIZE) / 2;
                textX = checkboxCenterX + CHECKBOX_SIZE + 1; // 复选框右侧，最小间距
                // 确保文本有足够的显示空间
                textWidth = this.width - textX + drawX;
            }
        }

        // 如果有排序图标，调整文本位置
        if (this.column.sortBy || this.column.apiSortable) {
            const iconSize = 16;
            const iconMargin = 4;

            if (this.align === 'right') {
                // 居右时，文本需要为图标留出空间
                textWidth = this.width - CELL_PADDING - iconSize - iconMargin;
                textX = drawX + CELL_PADDING;
            } else if (this.align === 'center') {
                // 居中时，文本宽度需要考虑图标
                const textWidthNeeded = this.measureTextWidth(this.displayText, this.ctx.config.HEADER_FONT);
                const totalWidth = textWidthNeeded + iconSize + iconMargin;
                if (totalWidth > this.width - CELL_PADDING * 2) {
                    textWidth = this.width - CELL_PADDING * 2 - iconSize - iconMargin;
                }
            }
        }

        this.ellipsis = paint.drawText(displayText, textX, drawY, textWidth, this.height, {
            font: HEADER_FONT,
            padding: CELL_PADDING, // 减少 padding，让文本有更多空间
            color: this.drawTextColor,
            align: this.align, // 使用动态对齐方式
            verticalAlign: this.verticalAlign,
        });

        this.drawSelector();
        this.drawSortIcon();
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
        if (['index-selection', 'selection', 'selection-tree', 'tree-selection'].includes(type)) {
            const { indeterminate, check, selectable } = this.ctx.database.getCheckedState();
            const { CHECKBOX_SIZE = 0, CELL_PADDING } = this.ctx.config;
            // 默认居中
            let _x = this.drawX + (width - CHECKBOX_SIZE) / 2;
            let _y = this.drawY + (height - CHECKBOX_SIZE) / 2;
            if (this.align === 'left' || this.align === 'right') {
                _x = this.drawX + CELL_PADDING;
            }
            if (this.verticalAlign === 'top') {
                _y = this.drawY + CELL_PADDING / 2;
            } else if (this.verticalAlign === 'bottom') {
                _y = this.drawY + height - CHECKBOX_SIZE - CELL_PADDING / 2;
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
                this.drawSelectionImageX = _x;
                this.drawSelectionImageY = _y;
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
        if (!this.column.sortBy && !this.column.apiSortable) {
            return;
        }

        const { CELL_PADDING = 0 } = this.ctx.config;
        const iconSize = 16;
        const iconMargin = 4;

        let iconName = 'sortable';

        if (this.column.apiSortable) {
            // 后端排序
            const sortState = this.ctx.database.getBackendSortState(this.key);
            if (sortState.direction === 'asc') {
                iconName = 'sort-backend-asc';
            } else if (sortState.direction === 'desc') {
                iconName = 'sort-backend-desc';
            } else {
                iconName = 'sortable-backend';
            }
        } else {
            // 前端排序
            const sortState = this.ctx.database.getSortState(this.key);
            if (sortState.direction === 'asc') {
                if (this.column.sortBy === 'number') {
                    iconName = 'sort-by-number-asc';
                } else if (this.column.sortBy === 'string') {
                    iconName = 'sort-by-character-asc';
                } else if (this.column.sortBy === 'date') {
                    iconName = 'sort-by-date-asc';
                } else if (Array.isArray(this.column.sortBy) && this.column.sortBy[0] === 'date') {
                    iconName = 'sort-by-date-asc';
                } else if (typeof this.column.sortBy === 'function') {
                    iconName = 'sort-asc';
                }
            } else if (sortState.direction === 'desc') {
                if (this.column.sortBy === 'number') {
                    iconName = 'sort-by-number-desc';
                } else if (this.column.sortBy === 'string') {
                    iconName = 'sort-by-character-desc';
                } else if (this.column.sortBy === 'date') {
                    iconName = 'sort-by-date-desc';
                } else if (Array.isArray(this.column.sortBy) && this.column.sortBy[0] === 'date') {
                    iconName = 'sort-by-date-desc';
                } else if (typeof this.column.sortBy === 'function') {
                    iconName = 'sort-desc';
                }
            }
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
        this.sortIconX = iconX;
        this.sortIconY = iconY;
        this.sortIconWidth = iconSize;
        this.sortIconHeight = iconSize;
        this.sortIconName = iconName;
        this.sortIconSource = icon;

        // 绘制图标
        this.ctx.paint.drawImage(
            this.sortIconSource,
            this.sortIconX,
            this.sortIconY,
            this.sortIconWidth,
            this.sortIconHeight,
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
