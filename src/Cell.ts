import type {
    Column,
    Fixed,
    Type,
    Align,
    VerticalAlign,
    CellType,
    Render,
    FormatterMethod,
    CellTypeMethod,
    CellRenderMethod,
    CellEditorMethod,
    SpanMethod,
    CellHoverIconMethod,
    CellStyleMethod,
    OverflowTooltipPlacement,
    SpanInfo,
    SelectorCellValueType,
    LineClampType,
} from './types';
import Context from './Context';
import BaseCell from './BaseCell';
import { Rule, Rules } from './Validator';
export default class Cell extends BaseCell {
    formatter?: FormatterMethod;
    formatterFooter?: FormatterMethod;
    hoverIconName?: string = '';
    operation = false;
    align: Align;
    verticalAlign: VerticalAlign;
    fixed?: Fixed;
    type: Type | '';
    editorType: string;
    editorProps: any;
    cellType: CellType;
    level: number;
    colspan = 1;
    rowspan = 1;
    mergeRow = false;
    mergeCol = false;
    relationRowKeys: string[] = []; // 合并单元格关联key
    relationColKeys: string[] = []; // 合并单元格关联key
    key: string;
    column: Column;
    rowIndex: number;
    colIndex: number;
    rowKey: string;
    row: any;
    value: any;
    render: Render;
    renderFooter: Render;
    style: any = {};
    domDataset: any = {};
    rules: Rules | Rule = [];
    message: string = '';
    text: string = '';
    displayText: string = '';
    visibleWidth = 0;
    visibleHeight = 0;
    isHasChanged = false;
    drawX = 0;
    drawY = 0;
    drawCellBgColor = '';
    drawCellSkyBgColor = '';
    drawTextColor = '';
    drawTextFont = '';
    drawTextX = 0;
    drawTextY = 0;
    drawTextWidth = 0;
    drawTextHeight = 0;
    // 画tree图标
    drawTreeImageX = 0;
    drawTreeImageY = 0;
    drawTreeImageWidth = 0;
    drawTreeImageHeight = 0;
    drawTreeImageName = '';
    drawTreeImageSource?: HTMLImageElement;
    // 画selection图标
    drawSelectionImageX = 0;
    drawSelectionImageY = 0;
    drawSelectionImageWidth = 0;
    drawSelectionImageHeight = 0;
    drawSelectionImageName = '';
    drawSelectionImageSource?: HTMLImageElement;
    // 画hover图标
    drawHoverImageX = 0;
    drawHoverImageY = 0;
    drawHoverImageWidth = 0;
    drawHoverImageHeight = 0;
    drawHoverImageName = '';
    drawHoverImageSource?: HTMLImageElement;
    autoRowHeight = false; // 是否启用行高自适应
    calculatedHeight = 0; // 计算出的自适应高度
    ellipsis = false;
    rowExpand = false;
    rowHasChildren = false;
    overflowTooltipShow = true;
    selectorCellValueType: SelectorCellValueType = 'value';
    overflowTooltipMaxWidth = 500;
    overflowTooltipPlacement: OverflowTooltipPlacement = 'top';
    maxLineClamp: LineClampType = 'auto';
    
    // 扩展渲染相关属性
    extendRender?: Function | string;
    hasExtendIcon = false;
    isExtendContent = false;
    sourceCell?: Cell;
    _originalRender?: Render;
    _originalGetAutoHeight?: () => number;

    constructor(
        ctx: Context,
        rowIndex: number,
        colIndex: number,
        x: number,
        y: number,
        width: number,
        height: number,
        column: Column,
        row: any,
        cellType: CellType = 'body',
    ) {
        super(ctx, x, y, width, height, cellType, column.fixed);
        this.visibleWidth = this.width;
        this.visibleHeight = this.height;
        this.colIndex = colIndex;
        this.rowIndex = rowIndex;
        this.key = column.key;
        this.type = column.type || '';
        this.editorType = column.editorType || 'text';
        this.selectorCellValueType =
            column.selectorCellValueType || this.ctx.config.SELECTOR_CELL_VALUE_TYPE || 'value';
        this.editorProps = column.editorProps || {};
        this.cellType = cellType;
        this.align = column.align || this.ctx.config.COLUMNS_ALIGN;
        this.verticalAlign = column.verticalAlign || this.ctx.config.COLUMNS_VERTICAL_ALIGN;
        this.fixed = column.fixed;
        this.level = column.level || 0;
        this.operation = column.operation || false;
        this.column = column;
        this.rules = column.rules || [];
        this.row = row;
        this.rowKey =
            this.cellType === 'body'
                ? this.ctx.database.getRowKeyForRowIndex(rowIndex)
                : `${this.cellType}_${this.rowIndex}`;
        this.value = this.getValue();
        this.render = column.render;
        this.overflowTooltipShow = column.overflowTooltipShow === false ? false : true;
        this.autoRowHeight =
            column.autoRowHeight !== undefined ? column.autoRowHeight : this.ctx.config.AUTO_ROW_HEIGHT;
        this.overflowTooltipMaxWidth = column.overflowTooltipMaxWidth || 500;
        this.overflowTooltipPlacement = column.overflowTooltipPlacement || 'top';
        this.renderFooter = column.renderFooter;
        this.hoverIconName = column.hoverIconName;
        this.formatter = column.formatter;
        this.formatterFooter = column.formatterFooter;
        this.maxLineClamp = column.maxLineClamp || 'auto';
        
        // 初始化扩展渲染相关属性
        this.extendRender = column.extendRender;
        this.hasExtendIcon = this.shouldShowExtendIcon();
        
        this.update();
    }
    setWidthHeight(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
    getValidationMessage() {
        const errors = this.ctx.database.getValidationError(this.rowKey, this.key);
        if (Array.isArray(errors) && errors.length) {
            const [err] = errors;
            this.message = err.message || '';
        }
        return this.message;
    }
    update() {
        this.drawX = this.getDrawX();
        this.drawY = this.getDrawY();
        this.drawTextX = this.drawX;
        this.drawTextY = this.drawY;
        this.isHasChanged = this.ctx.database.isHasChangedData(this.rowKey, this.key);
        this.updateSpan();
        this.drawTextWidth = this.visibleWidth;
        this.drawTextHeight = this.visibleHeight;
        this.updateStyle();
        this.updateType();
        this.updateHoverIcon();
        this.updateSelection();
        this.updateTree();
        this.updateExtend();
        this.updateEditor();
        this.updateRender();
        this.getValidationMessage();
        this.updateContainer();
        this.text = this.getText();
        this.displayText = this.getDisplayText();
    }
    updateSpan() {
        // 合计不合并
        if (this.cellType === 'footer') {
            return;
        }
        const { SPAN_METHOD } = this.ctx.config;
        if (typeof SPAN_METHOD === 'function') {
            const spanMethod: SpanMethod = SPAN_METHOD;
            const {
                colspan = 1,
                rowspan = 1,
                relationRowKeys,
                relationColKeys,
                mergeRow = false,
                mergeCol = false,
            } = spanMethod({
                row: this.row,
                rowIndex: this.rowIndex,
                colIndex: this.colIndex,
                column: this.column,
                value: this.getValue(),
                headIndex: this.ctx.body.headIndex,
                headPosition: this.ctx.database.getPositionForRowIndex(this.ctx.body.headIndex),
                visibleRows: this.ctx.body.visibleRows,
                visibleLeafColumns: this.ctx.header.visibleLeafColumns,
                rows: this.ctx.body.data,
            }) || {};
            if (Array.isArray(relationRowKeys) && relationRowKeys.length > 0) {
                this.relationRowKeys = relationRowKeys;
            } else {
                this.relationRowKeys = [this.key];
            }
            if (Array.isArray(relationColKeys) && relationColKeys.length > 0) {
                this.relationColKeys = relationColKeys;
            } else {
                this.relationColKeys = [this.key];
            }
            this.mergeCol = mergeCol;
            this.mergeRow = mergeRow;
            this.colspan = colspan;
            this.rowspan = rowspan;
            this.visibleWidth = this.getWidthByColIndexColSpan(this.colIndex, this.colspan);
            this.visibleHeight = this.ctx.database.getHeightByRowIndexRowSpan(this.rowIndex, this.rowspan);
        }
    }
    updateSpanInfo() {
        // 列合并单元格
        if (this.mergeRow || this.mergeCol) {
            const spanInfo = this.getSpanInfo();
            this.height = spanInfo.height;
            this.width = spanInfo.width;
            this.drawX = this.getDrawX();
            this.drawY = this.getDrawY();
            this.drawY -= spanInfo.offsetTop;
            this.drawX -= spanInfo.offsetLeft;
        }
    }
    updateType() {
        // 更改类型
        const { BODY_CELL_TYPE_METHOD } = this.ctx.config;
        if (typeof BODY_CELL_TYPE_METHOD === 'function') {
            const cellTypeMethod: CellTypeMethod = BODY_CELL_TYPE_METHOD;
            const type = cellTypeMethod({
                row: this.row,
                rowIndex: this.rowIndex,
                colIndex: this.colIndex,
                column: this.column,
                value: this.getValue(),
            });
            // 可以动态改变类型
            if (type !== undefined) {
                this.type = type;
            }
        }
    }
    updateEditor() {
        // 更改类型
        const { BODY_CELL_EDITOR_METHOD } = this.ctx.config;
        if (typeof BODY_CELL_EDITOR_METHOD === 'function') {
            const CellEditorMethod: CellEditorMethod = BODY_CELL_EDITOR_METHOD;
            const editorProps = CellEditorMethod({
                row: this.row,
                rowIndex: this.rowIndex,
                colIndex: this.colIndex,
                column: this.column,
                value: this.getValue(),
            });
            // 可以动态改变类型
            if (editorProps !== undefined) {
                const { type, props = {} } = editorProps;
                this.editorType = type;
                this.editorProps = props;
            }
        }
    }
    updateRender() {
        const { BODY_CELL_RENDER_METHOD } = this.ctx.config;
        if (typeof BODY_CELL_RENDER_METHOD === 'function') {
            const cellRenderMethod: CellRenderMethod = BODY_CELL_RENDER_METHOD;
            const render = cellRenderMethod({
                row: this.row,
                rowIndex: this.rowIndex,
                colIndex: this.colIndex,
                column: this.column,
                value: this.getValue(),
            });
            // 可以动态改变类型
            if (render !== undefined) {
                this.render = render;
            }
        }
    }
    validate() {
        this.ctx.database
            .getValidator(this.rowKey, this.key)
            .then(() => {
                this.ctx.database.setValidationError(this.rowKey, this.key, []);
                this.message = '';
            })
            .catch((errors) => {
                if (Array.isArray(errors) && errors.length) {
                    const [err] = errors;
                    this.message = err.message;
                    this.ctx.database.setValidationError(this.rowKey, this.key, errors);
                }
            })
            .finally(() => {
                this.ctx.emit('draw');
            });
    }

    /**
     * 更新样式
     */
    updateStyle() {
        if (this.autoRowHeight) {
            // 自适应行高
            this.domDataset = {
                'data-auto-height': true,
                'data-row-index': this.rowIndex,
                'data-col-index': this.colIndex,
            };
        }
        this.style = this.getOverlayerViewsStyle();
    }
    private updateTree() {
        const { CELL_PADDING = 0 } = this.ctx.config;
        const { rowKey, cellType } = this;
        let icon = undefined;
        let iconOffsetX = 0;
        let iconName = '';
        if (!(['tree', 'selection-tree', 'tree-selection'].includes(this.type) && cellType === 'body')) {
            return;
        }

        const row = this.ctx.database.getRowForRowKey(rowKey);
        const { expand = false, hasChildren = false, expandLoading = false, level = 0 } = row || {};
        this.rowExpand = expand;
        this.rowHasChildren = hasChildren;

        // 计算树形图标的偏移量
        const { TREE_INDENT = 16, CHECKBOX_SIZE, TREE_ICON_SIZE } = this.ctx.config;
        iconOffsetX = level * TREE_INDENT;

        if (expandLoading) {
            const loadingIcon = this.ctx.icons.get('loading');
            iconName = 'loading';
            icon = loadingIcon;
        } else if (hasChildren) {
            const expandIcon = this.ctx.icons.get('expand');
            const shrinkIcon = this.ctx.icons.get('shrink');
            icon = !expand ? expandIcon : shrinkIcon;
            iconName = !expand ? 'expand' : 'shrink';
        }

        let iconWidth = TREE_ICON_SIZE;
        let iconHeight = TREE_ICON_SIZE;
        let drawX = this.drawX;
        if (this.align === 'center' || this.align === 'right') {
            drawX = this.drawX + (this.visibleWidth - iconWidth - 2 * CELL_PADDING) / 2;
            // 居中对齐，改成左对齐
            this.align = 'left';
        }
        let iconX = drawX + iconOffsetX + CELL_PADDING;
        let iconY = this.drawY + (this.visibleHeight - iconHeight) / 2;
        let drawTextX = iconOffsetX + this.drawX + iconWidth - 0.5;
        if (this.type === 'selection-tree') {
            // 树形图标在左侧，checkbox 在树形图标右侧
            iconX = iconOffsetX + this.drawSelectionImageX + this.drawSelectionImageWidth;
            drawTextX = iconX + iconWidth - CELL_PADDING / 2;
        } else if (this.type === 'tree-selection') {
            // 树形选择,两个图标宽度，文本已经有CELL_PADDING间距,/2看起来好看些
            drawTextX = iconX + CHECKBOX_SIZE + iconWidth - CELL_PADDING / 2;
        } else {
            // 普通tree,文本已经有CELL_PADDING间距,/2看起来好看些
            drawTextX = iconX + iconWidth - CELL_PADDING / 2;
        }
        // 更改文本距离
        this.drawTextX = drawTextX;
        this.drawTextWidth = this.drawX + this.visibleWidth - drawTextX; // 减去树形图标的宽度
        // 判断是否溢出格子
        if (iconX + iconWidth + CELL_PADDING > this.drawX + this.visibleWidth) {
            return;
        }
        if (iconY + iconHeight + CELL_PADDING > this.drawY + this.visibleHeight) {
            return;
        }

        // 不论是否需要绘制图标，都更新图标的“基准位置”，供树线使用
        this.drawTreeImageX = iconX;
        this.drawTreeImageY = iconY;
        this.drawTreeImageWidth = iconWidth;
        this.drawTreeImageHeight = iconHeight;
        if (icon) {
            this.drawTreeImageName = iconName;
            this.drawTreeImageSource = icon;
        } else {
            this.drawTreeImageName = '';
            this.drawTreeImageSource = undefined;
        }
        // 树连线仅在绘制阶段调用，避免在 update 阶段被清屏
    }
    
    /**
     * 更新扩展图标
     */
    private updateExtend() {
        if (!this.hasExtendIcon) {
            return;
        }

        const { CELL_PADDING = 0, TREE_ICON_SIZE } = this.ctx.config;
        const { rowKey } = this;
        
        // 判断当前是否展开
        const isExtended = this.ctx.isRowExtended(rowKey, this.key);
        
        // 使用和树形一样的图标
        const expandIcon = this.ctx.icons.get('expand');
        const shrinkIcon = this.ctx.icons.get('shrink');
        const icon = !isExtended ? expandIcon : shrinkIcon;
        const iconName = !isExtended ? 'expand' : 'shrink';

        let iconWidth = TREE_ICON_SIZE;
        let iconHeight = TREE_ICON_SIZE;
        let drawX = this.drawX;
        
        // 参考树形图标的对齐逻辑
        if (this.align === 'center' || this.align === 'right') {
            drawX = this.drawX + (this.visibleWidth - iconWidth - 2 * CELL_PADDING) / 2;
            // 居中对齐，改成左对齐
            this.align = 'left';
        }
        
        let iconX = drawX + CELL_PADDING;
        let iconY = this.drawY + (this.visibleHeight - iconHeight) / 2;
        let drawTextX = iconX + iconWidth - CELL_PADDING / 2;

        // 判断是否溢出格子（参考树形图标的逻辑）
        if (iconX + iconWidth + CELL_PADDING > this.drawX + this.visibleWidth) {
            return;
        }
        if (iconY + iconHeight + CELL_PADDING > this.drawY + this.visibleHeight) {
            return;
        }

        // 更改文本距离
        this.drawTextX = drawTextX;
        this.drawTextWidth = this.drawX + this.visibleWidth - drawTextX; // 减去扩展图标的宽度
        
        // 不论是否需要绘制图标，都更新图标的"基准位置"，供扩展功能使用
        this.drawTreeImageX = iconX;
        this.drawTreeImageY = iconY;
        this.drawTreeImageWidth = iconWidth;
        this.drawTreeImageHeight = iconHeight;
        if (icon) {
            this.drawTreeImageName = iconName;
            this.drawTreeImageSource = icon;
        } else {
            this.drawTreeImageName = '';
            this.drawTreeImageSource = undefined;
        }
        
    }
    
    /**
     * 判断是否应该显示扩展图标
     */
    shouldShowExtendIcon(): boolean {
        if (this.isExtendContent) {
            return false;
        }
        if (this.cellType !== 'body' || !this.extendRender) {
            return false;
        }
        if (!this.ctx.config.AUTO_ROW_HEIGHT) {
            return false;
        }
        if (['tree', 'selection-tree', 'tree-selection'].includes(this.type)) {
            return false;
        }
        return true;
    }
    
    private drawTreeLine() {
        const { TREE_LINE, TREE_INDENT = 16, TREE_ICON_SIZE = 16, TREE_LINE_COLOR = '#e1e6eb' } = this.ctx.config;
        // 仅 body 且树类型才绘制
        if (!TREE_LINE || this.cellType !== 'body') return;
        if (!['tree', 'selection-tree', 'tree-selection'].includes(this.type)) return;
        if (this.rowspan === 0 || this.colspan === 0) return;

        const row = this.ctx.database.getRowForRowKey(this.rowKey) || {};
        const level: number = row.level ?? 0;

        // 以当前树图标为中心点
        const iconCenterX = this.drawTreeImageX + this.drawTreeImageWidth / 2;
        const iconCenterY = this.drawTreeImageY + this.drawTreeImageHeight / 2;

        // 基于已计算的树图标位置反推基准点：当前图标左侧减去 level * TREE_INDENT
        // 这样无论对齐方式如何（left/center/right），都以实际图标为基准定位所有竖线
        let baseX = this.drawTreeImageX - level * TREE_INDENT;

        // 逐层画竖线（仅当 level > 0 才需要祖先连线）
        const parentRowKeys: string[] = Array.isArray(row.parentRowKeys) ? row.parentRowKeys : [];
        if (level > 0) {
            // 祖先层（0..level-2）：是否继续取决于该层“下一层链路节点”是否为最后子项
            // 例如当前节点 0-2-1：
            //  - 对 i=0（根 0 对应竖线），应看其下一层链路节点 0-2 是否为最后子项。
            //    若 0-2 是最后子项（没有 0-3），则 i=0 的竖线在本行不应出现。
            for (let i = 0; i < level - 1; i += 1) {
                const nextKey = parentRowKeys[i + 1];
                const nextRow = nextKey ? this.ctx.database.getRowForRowKey(nextKey) || {} : {};
                const nextIsLast = !!nextRow.isLastChild;
                if (nextIsLast) continue;
                // 以当前树图标 X 为基准向左回推
                const vx = Math.round(this.drawTreeImageX - (level - i) * TREE_INDENT + TREE_ICON_SIZE / 2);
                this.ctx.paint.drawLine([vx, this.drawY, vx, this.drawY + this.visibleHeight], {
                    borderColor: TREE_LINE_COLOR,
                    borderWidth: 1,
                    lineDash: [4, 4],
                    lineDashOffset: 0,
                });
            }
            // 父层（level-1）：无论父是不是末尾，都需要连接当前节点形成 L 型
            const vxParent = Math.round(this.drawTreeImageX - TREE_INDENT + TREE_ICON_SIZE / 2);
            const toCenter = !!row.isLastChild;
            const y2 = toCenter ? iconCenterY : this.drawY + this.visibleHeight;
            this.ctx.paint.drawLine([vxParent, this.drawY, vxParent, y2], {
                borderColor: TREE_LINE_COLOR,
                borderWidth: 1,
                lineDash: [4, 4],
                lineDashOffset: 0,
            });
            // 当前层的横线：从当前层竖线到图标中心
            const currVX = Math.round(baseX + (level - 1) * TREE_INDENT + TREE_ICON_SIZE / 2);
            this.ctx.paint.drawLine([currVX, iconCenterY, iconCenterX, iconCenterY], {
                borderColor: TREE_LINE_COLOR,
                borderWidth: 1,
                lineDash: [4, 4],
                lineDashOffset: 0,
            });
        }

        // 1) 父节点行：在图标正下画一段短竖线（展开时绘制，符合视觉预期）
        if (row.hasChildren && row.expand) {
            const shortTop = this.drawTreeImageY + this.drawTreeImageHeight;
            const shortBottom = this.drawY + this.visibleHeight;
            this.ctx.paint.drawLine([iconCenterX, shortTop, iconCenterX, shortBottom], {
                borderColor: TREE_LINE_COLOR,
                borderWidth: 1,
                lineDash: [4, 4],
                lineDashOffset: 0,
            });
        }
    }
    private updateContainer() {
        const {
            BODY_BG_COLOR,
            EDIT_BG_COLOR,
            BODY_CELL_STYLE_METHOD,
            FOOTER_CELL_STYLE_METHOD,
            READONLY_TEXT_COLOR,
            BODY_TEXT_COLOR,
            FOOTER_TEXT_COLOR,
            FOOTER_BG_COLOR,
            HIGHLIGHT_SELECTED_ROW,
            HIGHLIGHT_SELECTED_ROW_COLOR,
            HIGHLIGHT_HOVER_ROW,
            HIGHLIGHT_HOVER_ROW_COLOR,
            STRIPE,
            STRIPE_COLOR,
        } = this.ctx.config;
        if (this.cellType === 'footer') {
            let bgColor = FOOTER_BG_COLOR;
            let textColor = FOOTER_TEXT_COLOR;
            if (typeof FOOTER_CELL_STYLE_METHOD === 'function') {
                const footerCellStyleMethod: CellStyleMethod = FOOTER_CELL_STYLE_METHOD;
                const { backgroundColor, color,font } =
                    footerCellStyleMethod({
                        row: this.row,
                        rowIndex: this.rowIndex,
                        colIndex: this.colIndex,
                        column: this.column,
                        value: this.getValue(),
                    }) || {};
                if (backgroundColor) {
                    bgColor = backgroundColor;
                }
                // 文字颜色
                if (color) {
                    textColor = color;
                }
                if(font){
                    this.drawTextFont = font;
                }
            }
            // 合计底部背景色
            this.drawCellSkyBgColor = 'transparent';
            this.drawCellBgColor = bgColor;
            this.drawTextColor = textColor;
            return;
        }
        // 高亮行,在背景色上加一层颜色
        let drawCellSkyBgColor = 'transparent';
        // 高亮行
        const hoverCell = this.ctx.hoverCell;
        const currentCell = this.ctx.currentCell;
        // 合并单元格
        let minY = this.rowIndex;
        let maxY = this.rowIndex;
        if (this.rowspan !== 1 && (HIGHLIGHT_HOVER_ROW || HIGHLIGHT_SELECTED_ROW)) {
            const spanInfo = this.getSpanInfo();
            const { yArr } = spanInfo;
            minY = yArr[0];
            maxY = yArr[1];
        }
        if (HIGHLIGHT_HOVER_ROW && hoverCell) {
            if (hoverCell.rowKey === this.rowKey) {
                drawCellSkyBgColor = HIGHLIGHT_HOVER_ROW_COLOR;
            }
            if (hoverCell.rowIndex >= minY && hoverCell.rowIndex <= maxY) {
                drawCellSkyBgColor = HIGHLIGHT_HOVER_ROW_COLOR;
            }
        }

        if (HIGHLIGHT_SELECTED_ROW && currentCell) {
            if (currentCell.rowKey === this.rowKey) {
                drawCellSkyBgColor = HIGHLIGHT_SELECTED_ROW_COLOR;
            }
            if (currentCell.rowIndex >= minY && currentCell.rowIndex <= maxY) {
                drawCellSkyBgColor = HIGHLIGHT_SELECTED_ROW_COLOR;
            }
        }

        this.drawCellSkyBgColor = drawCellSkyBgColor;
        // 恢复默认背景色
        let bgColor = BODY_BG_COLOR;
        let textColor = BODY_TEXT_COLOR;

        // 只读
        if (!this.ctx.database.getReadonly(this.rowKey, this.key)) {
            bgColor = EDIT_BG_COLOR;
            textColor = READONLY_TEXT_COLOR;
        }
        // 斑马纹,编辑背景色下会失效
        if (STRIPE) {
            if (this.rowIndex % 2) {
                bgColor = STRIPE_COLOR;
            } else {
                bgColor = BODY_BG_COLOR;
            }
        }

        if (typeof BODY_CELL_STYLE_METHOD === 'function') {
            const cellStyleMethod: CellStyleMethod = BODY_CELL_STYLE_METHOD;
            const { backgroundColor, color, font } =
                cellStyleMethod({
                    row: this.row,
                    rowIndex: this.rowIndex,
                    colIndex: this.colIndex,
                    column: this.column,
                    isHasChanged: this.isHasChanged,
                    value: this.getValue(),
                }) || {};
            if (backgroundColor) {
                bgColor = backgroundColor;
            }
            // 文字颜色
            if (color) {
                textColor = color;
            }
            if(font){
                this.drawTextFont = font;
            }
        }
        this.drawCellBgColor = bgColor;
        this.drawTextColor = textColor;
    }
    private updateSelection() {
        const { visibleWidth, visibleHeight, rowspan, colspan, cellType, type, rowIndex, rowKey } = this;
        //合并的选框不显示
        if (rowspan === 0 || colspan === 0) {
            return;
        }
        // 合计不显示
        if (cellType === 'footer') {
            return;
        }
        if (!['index-selection', 'selection', 'selection-tree', 'tree-selection'].includes(type)) {
            return;
        }
        const selectable = this.ctx.database.getRowSelectable(rowKey);
        const { CHECKBOX_SIZE = 0, CELL_PADDING } = this.ctx.config;
        let drawX = this.drawX + CELL_PADDING;
        if (this.align === 'center' || this.align === 'right') {
            drawX = this.drawX + (visibleWidth - CHECKBOX_SIZE) / 2;
        }
        let iconX = drawX;
        let iconY = this.drawY + (visibleHeight - CHECKBOX_SIZE) / 2;

        // 对于 selection-tree 类型，checkbox 应该居中显示
        if (type === 'selection-tree') {
        } else if (type === 'tree-selection') {
            // 更新选择器的位置
            const { TREE_INDENT = 16, TREE_ICON_SIZE } = this.ctx.config;
            const row = this.ctx.database.getRowForRowKey(rowKey);
            const { level = 0 } = row || {};
            const iconOffsetX = level * TREE_INDENT;
            iconX = drawX + TREE_ICON_SIZE + iconOffsetX; // 树形图标右侧 + 间距
        }

        let checkboxImage: HTMLImageElement | undefined = this.ctx.icons.get('checkbox-uncheck');
        let checkboxName = 'checkbox-uncheck';

        if (type === 'selection-tree' || type === 'tree-selection') {
            // 树形选择逻辑
            const treeState = this.ctx.database.getTreeSelectionState(rowKey);
            if (treeState.indeterminate && selectable) {
                checkboxImage = this.ctx.icons.get('checkbox-indeterminate');
                checkboxName = 'checkbox-indeterminate';
            } else if (treeState.checked && selectable) {
                checkboxImage = this.ctx.icons.get('checkbox-check');
                checkboxName = 'checkbox-check';
            } else if (!treeState.checked && selectable) {
                checkboxImage = this.ctx.icons.get('checkbox-uncheck');
                checkboxName = 'checkbox-uncheck';
            } else {
                checkboxImage = this.ctx.icons.get('checkbox-disabled');
                checkboxName = 'checkbox-disabled';
            }
        } else {
            // 普通选择逻辑
            const check = this.ctx.database.getRowSelection(rowKey);
            if (check && selectable) {
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
        }
        // 判断是否溢出格子
        if (iconX + CHECKBOX_SIZE + CELL_PADDING > this.drawX + this.visibleWidth) {
            return;
        }
        if (iconY + CHECKBOX_SIZE + CELL_PADDING > this.drawY + this.visibleHeight) {
            return;
        }
        if (type === 'index-selection') {
            if (
                (this.ctx.hoverCell && this.ctx.hoverCell.rowIndex === rowIndex) ||
                ['checkbox-disabled', 'checkbox-check'].includes(checkboxName)
            ) {
                this.drawSelectionImageX = iconX;
                this.drawSelectionImageY = iconY;
                this.drawSelectionImageWidth = CHECKBOX_SIZE;
                this.drawSelectionImageHeight = CHECKBOX_SIZE;
                this.drawSelectionImageName = checkboxName;
                this.drawSelectionImageSource = checkboxImage;
            }
        } else {
            this.drawSelectionImageX = iconX;
            this.drawSelectionImageY = iconY;
            this.drawSelectionImageWidth = CHECKBOX_SIZE;
            this.drawSelectionImageHeight = CHECKBOX_SIZE;
            this.drawSelectionImageName = checkboxName;
            this.drawSelectionImageSource = checkboxImage;
        }
    }
    private updateHoverIcon() {
        const readonly = this.ctx.database.getReadonly(this.rowKey, this.key);
        if (readonly) {
            return;
        }
        const { BODY_CELL_HOVER_ICON_METHOD, CELL_HOVER_ICON_SIZE, CELL_PADDING, ENABLE_MERGE_CELL_LINK } =
            this.ctx.config;
        if (typeof BODY_CELL_HOVER_ICON_METHOD === 'function') {
            const hoverIconMethod: CellHoverIconMethod = BODY_CELL_HOVER_ICON_METHOD;
            const hoverIconName = hoverIconMethod({
                row: this.row,
                rowIndex: this.rowIndex,
                colIndex: this.colIndex,
                column: this.column,
                value: this.getValue(),
            });
            // 可以动态改变hoverIconName
            if (hoverIconName !== undefined) {
                this.hoverIconName = hoverIconName;
            }
        }
        // 永远放在右边
        const { hoverCell } = this.ctx;
        if (this.hoverIconName && !this.ctx.editing && hoverCell) {
            let _x = 0;
            let _y = 0;
            if (hoverCell.rowKey === this.rowKey) {
                _x = this.drawX + this.width - CELL_HOVER_ICON_SIZE - CELL_PADDING;
                _y = this.drawY + (this.height - CELL_HOVER_ICON_SIZE) / 2;
            }
            // 合并单元格
            if (this.rowspan !== 1 && ENABLE_MERGE_CELL_LINK) {
                const spanInfo = this.getSpanInfo();
                const { yArr } = spanInfo;
                const minY = yArr[0];
                const maxY = yArr[1];
                if (hoverCell.rowIndex >= minY && hoverCell.rowIndex <= maxY) {
                    const { width, height, offsetTop, offsetLeft } = spanInfo;
                    _x = this.drawX - offsetLeft + width - CELL_HOVER_ICON_SIZE - CELL_PADDING;
                    _y = this.drawY - offsetTop + (height - CELL_HOVER_ICON_SIZE) / 2;
                }
            }
            const drawImageSource = this.ctx.icons.get(this.hoverIconName);
            this.drawHoverImageX = _x;
            this.drawHoverImageY = _y;
            this.drawHoverImageWidth = CELL_HOVER_ICON_SIZE;
            this.drawHoverImageHeight = CELL_HOVER_ICON_SIZE;
            this.drawHoverImageName = this.hoverIconName;
            this.drawHoverImageSource = drawImageSource;
        }
    }
    /**
     * 获取自动高度
     * @returns
     */
    getAutoHeight() {
        if (this.cellType !== 'body') {
            return 0;
        }
        if (!this.autoRowHeight) {
            return 0;
        }
        if (this.rowspan === 0) {
            return 0;
        }
        // 如果有渲染函数，使用渲染函数计算高度
        if (this.render) {
            const renderHeight = this.ctx.database.getOverlayerAutoHeight(this.rowIndex, this.colIndex);
            if (this.rowspan > 1) {
                // 如果计算高度小于可见高度，返回0，表示不显示
                if (renderHeight < this.visibleHeight) {
                    return 0;
                }
                return Math.round(renderHeight - (this.visibleHeight - this.height));
            }
            return Math.round(renderHeight);
        }
        if (!(this.displayText && typeof this.displayText === 'string')) {
            return 0;
        }

        const { BODY_FONT, CELL_PADDING, CELL_LINE_HEIGHT } = this.ctx.config;
        const cacheTextKey = `${this.displayText}_${this.drawTextWidth}_${this.drawTextFont}`;
        const calculatedHeight = this.ctx.paint.calculateTextHeight(this.displayText, this.drawTextWidth, {
            font: this.drawTextFont || BODY_FONT,
            padding: CELL_PADDING,
            align: this.align,
            verticalAlign: this.verticalAlign,
            color: this.drawTextColor,
            autoRowHeight: this.autoRowHeight,
            lineHeight: CELL_LINE_HEIGHT,
            maxLineClamp: this.maxLineClamp,
            cacheTextKey,
        });
        // 合并单元格处理
        if (this.rowspan > 1) {
            // 如果计算高度小于可见高度，返回0，表示不显示
            if (calculatedHeight < this.visibleHeight) {
                return 0;
            }
            return Math.round(calculatedHeight - (this.visibleHeight - this.height));
        }
        // 转成整数
        return Math.round(calculatedHeight);
    }
    // 过去跨度配置
    getSpanInfo(): SpanInfo {
        return this.ctx.database.getSpanInfo(this);
    }
    /**
     * 获取显示文本
     * @returns
     */
    getDisplayText() {
        if (this.cellType === 'footer') {
            // 插槽不显示文本
            if (this.renderFooter) {
                return '';
            }
            if (this.text === null || this.text === undefined) {
                return '';
            }
            return this.text;
        } else {
            // cellType === "body"
            // 被跨度单元格
            if (this.rowspan === 0 || this.colspan === 0) {
                return '';
            }
            // 插槽不显示文本
            if (this.render) {
                return '';
            }
            //
            if (
                this.type === 'index-selection' &&
                ((this.ctx.hoverCell && this.ctx.hoverCell.rowIndex === this.rowIndex) ||
                    ['checkbox-disabled', 'checkbox-check'].includes(this.drawSelectionImageName))
            ) {
                return '';
            }
            if (this.text === null || this.text === undefined) {
                return '';
            }
            return `${this.text}`;
        }
    }
    /**
     * 获取文本
     * @returns
     */
    getText() {
        if (this.cellType === 'footer') {
            if (typeof this.formatterFooter === 'function') {
                const _text = this.formatterFooter({
                    row: this.row,
                    rowIndex: this.rowIndex,
                    colIndex: this.colIndex,
                    column: this.column,
                    value: this.row[this.key],
                });
                return _text;
            }
            return this.row[this.key];
        }
        // cellType === "body"

        // formatter优先等级比较高
        if (typeof this.formatter === 'function') {
            const _text = this.formatter({
                row: this.row,
                rowIndex: this.rowIndex,
                colIndex: this.colIndex,
                column: this.column,
                value: this.getValue(),
            });
            return _text;
        }
        const { BODY_CELL_FORMATTER_METHOD } = this.ctx.config;
        if (typeof BODY_CELL_FORMATTER_METHOD === 'function') {
            const formatterMethod: FormatterMethod = BODY_CELL_FORMATTER_METHOD;
            const _text = formatterMethod({
                row: this.row,
                rowIndex: this.rowIndex,
                colIndex: this.colIndex,
                column: this.column,
                value: this.getValue(),
            });
            return _text;
        }
        if (['index-selection', 'index'].includes(this.type)) {
            const str = `${this.rowIndex + 1}`; // 索引
            return str; // 索引
        }
        this.value = this.ctx.database.getItemValue(this.rowKey, this.key);
        return this.value;
    }
    getValue() {
        return this.ctx.database.getItemValue(this.rowKey, this.key);
    }
    // 拓展格子可设置数据
    setValue(value: any) {
        this.ctx.setItemValueByEditor(this.rowKey, this.key, value);
    }
    /**
     * 获取样式
     */
    getOverlayerViewsStyle() {
        let left = `${this.drawX - this.ctx.fixedLeftWidth}px`;
        let top = `${this.drawY - this.ctx.body.y}px`;
        // 固定列
        if (this.fixed === 'left') {
            left = `${this.drawX}px`;
        } else if (this.fixed === 'right') {
            left = `${this.drawX - (this.ctx.stageWidth - this.ctx.fixedRightWidth)}px`;
        }
        // 合计
        if (this.cellType === 'footer') {
            if (this.ctx.config.FOOTER_FIXED) {
                top = `${this.drawY - this.ctx.footer.y}px`;
            }
        }
        // 防止闪烁（但扩展内容不应该被隐藏）
        if (this.autoRowHeight && !this.isExtendContent && this.ctx.database.getOverlayerAutoHeight(this.rowIndex, this.colIndex) === 0) {
            left = '-99999px';
            top = '-99999px';
        }
        return {
            position: 'absolute',
            overflow: 'hidden',
            left,
            top,
            width: `${this.visibleWidth}px`,
            height: this.autoRowHeight ? `auto` : `${this.visibleHeight}px`,
            // height: `${this.visibleHeight}px`,
            // minHeight: `${this.visibleHeight}px`,
            pointerEvents: 'initial',
            userSelect: 'none',
        };
    }
    drawContainer() {
        const {
            paint,
            config: { BORDER_COLOR, BORDER },
        } = this.ctx;
        const { drawX, drawY } = this;
        paint.drawRect(drawX, drawY, this.visibleWidth, this.visibleHeight, {
            borderColor: BORDER ? BORDER_COLOR : 'transparent',
            fillColor: this.drawCellBgColor,
        });
        // 列合并单元格
        paint.drawRect(drawX, drawY, this.width, this.height, {
            borderColor: 'transparent',
            fillColor: this.drawCellSkyBgColor,
        });

        if (!BORDER) {
            this.ctx.paint.drawLine(
                [drawX, drawY + this.visibleHeight, drawX + this.visibleWidth, drawY + this.visibleHeight],
                {
                    borderColor: BORDER_COLOR,
                    fillColor: BORDER_COLOR,
                    borderWidth: 1,
                    lineCap: 'round',
                    lineJoin: 'round',
                },
            );
        }
    }
    private drawAutofillPiont() {
        if (this.cellType === 'footer') {
            return;
        }
        const { SELECT_BORDER_COLOR, ENABLE_AUTOFILL, ENABLE_SELECTOR, AUTOFILL_POINT_BORDER_COLOR } = this.ctx.config;
        if (!ENABLE_SELECTOR) {
            return;
        }
        if (!ENABLE_AUTOFILL) {
            return;
        }
        if (this.ctx.editing) {
            return;
        }
        const show = true;
        const { xArr, yArr } = this.ctx.selector;
        const maxX = xArr[1];
        const maxY = yArr[1];
        const { colIndex, rowIndex, drawX, drawY } = this;
        // 绘制自动填充点
        if (show && colIndex === maxX && rowIndex === maxY) {
            const isOffset =
                colIndex === this.ctx.maxColIndex ||
                rowIndex === this.ctx.maxRowIndex ||
                colIndex === this.ctx.lastCenterColIndex;
            const offset = isOffset ? 6 : 4;
            this.ctx.paint.drawRect(drawX + this.width - offset, drawY + this.height - offset, 6, 6, {
                borderColor: AUTOFILL_POINT_BORDER_COLOR,
                fillColor: SELECT_BORDER_COLOR,
            });
        }
    }
    draw() {
        // 树连线（需在文本之前绘制，避免覆盖图标但不遮挡文本）
        this.drawTreeLine();
        // 文字与图标
        this.drawText();
        this.drawImage();
        this.drawSelector();
        this.drawAutofillPiont();
        this.drawErrorTip();
    }
    /**
     * 根据列的索引获取列的宽度
     * @param {Number} colIndex
     */
    private getWidthByColIndexColSpan(colIndex: number, colSpan: number) {
        if (colSpan === 0) {
            return 0;
        }
        
        // 扩展内容单元格特殊处理
        if (this.isExtendContent || colSpan >= 999) {
            return this.ctx.body.visibleWidth;
        }
        
        let width = 0;
        const maxIndex = Math.min(colIndex + colSpan, this.ctx.header.leafCellHeaders.length);
        for (let i = colIndex; i < maxIndex; i++) {
            const cellHeader = this.ctx.header.leafCellHeaders[i];
            if (!cellHeader) {
                console.warn(`Cell header not found at index ${i}`);
                continue;
            }
            width += cellHeader.width;
        }
        
        // 如果是大 colspan，返回整个可视宽度
        if (colSpan > this.ctx.header.leafCellHeaders.length) {
            return this.ctx.body.visibleWidth;
        }
        
        return width;
    }
    private drawText() {
        const { CELL_PADDING, BODY_FONT, PLACEHOLDER_COLOR, CELL_LINE_HEIGHT } = this.ctx.config;
        const { placeholder } = this.column;
        let text = this.displayText;
        let color = this.drawTextColor;
        // 更改颜色
        const isReadonly = this.ctx.database.getReadonly(this.rowKey, this.key);
        if (
            !isReadonly &&
            placeholder &&
            ['', null, undefined].includes(this.text) &&
            this.cellType === 'body' &&
            !(this.rowspan === 0 || this.colspan === 0)
        ) {
            text = placeholder;
            color = PLACEHOLDER_COLOR;
        }
        if (['', null, undefined].includes(text)) {
            return false;
        }
        // 如果text 不是字符串,则转换为字符串
        if (typeof text !== 'string') {
            text = `${text}`;
        }
        const cacheTextKey = `${text}_${this.drawTextWidth}_${this.drawTextFont}`;
        this.ellipsis = this.ctx.paint.drawText(
            text,
            this.drawTextX,
            this.drawTextY,
            this.drawTextWidth,
            this.drawTextHeight,
            {
                font: this.drawTextFont || BODY_FONT,
                padding: CELL_PADDING,
                align: this.align,
                verticalAlign: this.verticalAlign,
                color,
                autoRowHeight: this.autoRowHeight,
                lineHeight: CELL_LINE_HEIGHT,
                maxLineClamp: this.maxLineClamp,
                cacheTextKey,
            },
        );
        return this.ellipsis;
    }
    private drawImage() {
        if (this.drawSelectionImageSource) {
            this.ctx.paint.drawImage(
                this.drawSelectionImageSource,
                this.drawSelectionImageX,
                this.drawSelectionImageY,
                this.drawSelectionImageWidth,
                this.drawSelectionImageHeight,
            );
        }
        if (this.drawTreeImageSource) {
            this.ctx.paint.drawImage(
                this.drawTreeImageSource,
                this.drawTreeImageX,
                this.drawTreeImageY,
                this.drawTreeImageWidth,
                this.drawTreeImageHeight,
            );
        }
        if (this.drawHoverImageSource) {
            // 绘制hover图标背景
            const { CELL_HOVER_ICON_BG_COLOR, CELL_HOVER_ICON_BORDER_COLOR } = this.ctx.config;
            this.ctx.paint.drawRect(
                this.drawHoverImageX - 2,
                this.drawHoverImageY - 2,
                this.drawHoverImageWidth + 4,
                this.drawHoverImageHeight + 4,
                {
                    borderColor: CELL_HOVER_ICON_BORDER_COLOR,
                    radius: 4,
                    borderWidth: 1,
                    fillColor: CELL_HOVER_ICON_BG_COLOR,
                },
            );
            this.ctx.paint.drawImage(
                this.drawHoverImageSource,
                this.drawHoverImageX,
                this.drawHoverImageY,
                this.drawHoverImageWidth,
                this.drawHoverImageHeight,
            );
        }
    }
    private drawSelector() {
        if (this.cellType === 'footer') {
            return;
        }
        const { ENABLE_SELECTOR } = this.ctx.config;
        if (!ENABLE_SELECTOR) {
            return;
        }
        const { xArr, yArr, xArrCopy, yArrCopy } = this.ctx.selector;
        // 复制线
        this.drawBorder({
            xArr: xArrCopy,
            yArr: yArrCopy,
            borderColor: this.ctx.config.SELECT_BORDER_COLOR || 'rgb(82,146,247)',
            fillColor: 'transparent',
            borderWidth: 1,
            lineDash: [4, 4],
        });
        // 填充线
        this.drawBorder({
            xArr: this.ctx.autofill.xArr,
            yArr: this.ctx.autofill.yArr,
            borderColor: this.ctx.config.SELECT_BORDER_COLOR || 'rgb(82,146,247)',
            fillColor: 'transparent',
            borderWidth: 1,
            lineDash: [4, 4],
        });
        // 选择线
        this.drawBorder({
            xArr,
            yArr,
            borderColor: this.ctx.config.SELECT_BORDER_COLOR || 'rgb(82,146,247)',
            fillColor: 'transparent',
            borderWidth: 1,
        });
        // 选择区背景颜色
        const [minX, maxX] = xArr;
        const [minY, maxY] = yArr;
        const isOne = minX === maxX && minY === maxY;
        if (
            !isOne &&
            this.colIndex >= minX &&
            this.colIndex <= maxX &&
            this.rowIndex >= minY &&
            this.rowIndex <= maxY
        ) {
            this.ctx.paint.drawRect(this.drawX, this.drawY, this.width, this.height, {
                borderColor: 'transparent',
                fillColor: this.ctx.config.SELECT_AREA_COLOR || 'rgba(82,146,247,0.1)',
            });
        }
        if (this.operation && this.rowIndex >= minY && this.rowIndex <= maxY) {
            this.ctx.paint.drawRect(this.drawX, this.drawY, this.visibleWidth, this.visibleHeight, {
                borderColor: 'transparent',
                fillColor: this.ctx.config.SELECT_ROW_COL_BG_COLOR || 'transparent',
            });
        }
    }
    private drawErrorTip() {
        // 合计不显示
        if (this.cellType === 'footer') {
            return;
        }
        // 没有错误消息
        if (!this.message) {
            return;
        }
        if (this.rowspan === 0 || this.colspan === 0) {
            return;
        }
        const { ERROR_TIP_ICON_SIZE, ERROR_TIP_COLOR } = this.ctx.config;
        const { width } = this;
        const x = this.drawX;
        const y = this.drawY;
        const points = [
            x + width - ERROR_TIP_ICON_SIZE - 0.5,
            y,
            x + width - 0.5,
            y,
            x + width - 0.5,
            y + ERROR_TIP_ICON_SIZE,
        ];
        this.ctx.paint.drawLine(points, {
            borderColor: ERROR_TIP_COLOR,
            fillColor: ERROR_TIP_COLOR,
            borderWidth: 1,
            lineCap: 'round',
            lineJoin: 'round',
        });
    }
    private drawBorder(options: {
        xArr: number[];
        yArr: number[];
        borderColor: string;
        fillColor: string;
        borderWidth: number;
        lineDash?: number[];
    }) {
        const { drawX, drawY, rowIndex, colIndex, height, width } = this;
        let x = drawX;
        let y = drawY;
        const { xArr, yArr, lineDash = [], borderWidth = 1, borderColor, fillColor } = options;
        const minX = xArr[0];
        const maxX = xArr[1];
        const minY = yArr[0];
        const maxY = yArr[1];
        // top border
        if (colIndex >= minX && colIndex <= maxX && rowIndex === minY) {
            const offsetW = colIndex === maxX ? 1 : 0;
            const offsetX = colIndex === minX ? 1 : 0;
            this.ctx.paint.drawLine([x + offsetX, y + 1, x + width - offsetW, y + 1], {
                borderColor,
                fillColor,
                borderWidth,
                lineCap: 'round',
                lineJoin: 'round',
                lineDash,
            });
        }
        // right border
        if (colIndex === maxX && rowIndex >= minY && rowIndex <= maxY) {
            const offsetY = rowIndex === minY ? 1 : 0;
            const offsetH = rowIndex === maxY ? 1 : 0;
            this.ctx.paint.drawLine([x + width - 1, y + offsetY, x + width - 1, y + height - offsetH], {
                borderColor,
                fillColor,
                borderWidth,
                lineCap: 'round',
                lineJoin: 'round',
                lineDash,
            });
        }
        // bottom border
        if (colIndex >= minX && colIndex <= maxX && rowIndex === maxY) {
            const offsetW = colIndex === maxX ? 1 : 0;
            const offsetX = colIndex === minX ? 1 : 0;
            this.ctx.paint.drawLine([x + offsetX, y + height - 1, x + width - offsetW, y + height - 1], {
                borderColor,
                fillColor,
                borderWidth,
                lineCap: 'round',
                lineJoin: 'round',
                lineDash,
            });
        }
        // left border
        if (colIndex === minX && rowIndex >= minY && rowIndex <= maxY) {
            const offsetH = rowIndex === maxY ? 1 : 0;
            const offsetY = rowIndex === minY ? 1 : 0;
            this.ctx.paint.drawLine([x + 1, y + offsetY, x + 1, y + height - offsetH], {
                borderColor,
                fillColor,
                borderWidth,
                lineCap: 'round',
                lineJoin: 'round',
                lineDash,
            });
        }
    }
}
