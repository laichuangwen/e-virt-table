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
    drawTextX = 0;
    drawTextY = 0;
    drawImageX = 0;
    drawImageY = 0;
    drawImageWidth = 0;
    drawImageHeight = 0;
    drawImageName = '';
    drawImageSource?: HTMLImageElement;
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
    ellipsis = false;
    rowExpand = false;
    rowHasChildren = false;
    overflowTooltipShow = true;
    selectorCellValueType: SelectorCellValueType = 'value';
    overflowTooltipMaxWidth = 500;
    overflowTooltipPlacement: OverflowTooltipPlacement = 'top';

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
        this.align = column.align || 'center';
        this.verticalAlign = column.verticalAlign || 'middle';
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
        this.overflowTooltipMaxWidth = column.overflowTooltipMaxWidth || 500;
        this.overflowTooltipPlacement = column.overflowTooltipPlacement || 'top';
        this.renderFooter = column.renderFooter;
        this.hoverIconName = column.hoverIconName;
        this.formatter = column.formatter;
        this.formatterFooter = column.formatterFooter;
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
        this.updateStyle();
        this.updateType();
        this.updateHoverIcon();
        this.updateSelection();
        this.updateTree();
        // 根据类型决定渲染顺序
        // if (this.type === 'tree-selection') {
        //     // tree-selection: 先渲染树形图标，再渲染勾选框
        //     this.updateTree();
        //     this.updateSelection();
        // } else {
        //     // 其他类型: 先渲染勾选框，再渲染树形图标
        //     this.updateSelection();
        //     this.updateTree();
        // }
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
        let iconX = this.drawX + iconOffsetX + CELL_PADDING;
        let iconY = this.drawY + (this.visibleHeight - iconHeight) / 2;
        let drawTextX = iconOffsetX + this.drawX + iconWidth - 0.5;
        if (this.type === 'selection-tree') {
            // 树形图标在左侧，checkbox 在树形图标右侧
            iconX = iconOffsetX + this.drawSelectionImageX + this.drawSelectionImageWidth + 2;
            drawTextX = iconX + 16;
        } else if (this.type === 'tree-selection') {
            iconX = this.drawX + iconOffsetX + this.drawTreeImageX + this.drawTreeImageWidth + 2;
            drawTextX = iconX + CHECKBOX_SIZE + 16;
        } else {
            // 普通tree
            drawTextX = this.drawX + iconOffsetX + CELL_PADDING + iconWidth;
        }

        if (icon) {
            // this.ctx.paint.drawImage(icon, iconX, iconY, iconWidth, iconHeight);
            this.drawTreeImageX = iconX;
            this.drawTreeImageY = iconY;
            this.drawTreeImageWidth = iconWidth;
            this.drawTreeImageHeight = iconHeight;
            this.drawTreeImageName = iconName;
            this.drawTreeImageSource = icon;
        }
        // 更改文本距离
        this.drawTextX = drawTextX;
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
                const { backgroundColor, color } =
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
            const { backgroundColor, color } =
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
        let _x = this.drawX + (visibleWidth - CHECKBOX_SIZE) / 2;
        let _y = this.drawY + (visibleHeight - CHECKBOX_SIZE) / 2;
        // 只能左对齐及居中对齐
        if (this.align === 'left' || this.align === 'right') {
            _x = this.drawX + CELL_PADDING / 2;
        }

        // 对于 selection-tree 类型，checkbox 应该居中显示
        if (type === 'selection-tree') {
            // 保持居中显示，不改变 _x 和 _y 的计算
        } else if (type === 'tree-selection') {
            // 更新选择器的位置
            const { TREE_INDENT = 16, CHECKBOX_SIZE, TREE_ICON_SIZE } = this.ctx.config;
            const row = this.ctx.database.getRowForRowKey(rowKey);
            const { level = 0 } = row || {};
            const iconOffsetX = level * TREE_INDENT;
            _x = this.drawX + TREE_ICON_SIZE + iconOffsetX + 2; // 树形图标右侧 + 间距
            _y = this.drawY + (visibleHeight - CHECKBOX_SIZE) / 2;
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

        if (type === 'index-selection') {
            if (
                (this.ctx.hoverCell && this.ctx.hoverCell.rowIndex === rowIndex) ||
                ['checkbox-disabled', 'checkbox-check'].includes(checkboxName)
            ) {
                this.drawSelectionImageX = _x;
                this.drawSelectionImageY = _y;
                this.drawSelectionImageWidth = CHECKBOX_SIZE;
                this.drawSelectionImageHeight = CHECKBOX_SIZE;
                this.drawSelectionImageName = checkboxName;
                this.drawSelectionImageSource = checkboxImage;
            }
        } else {
            this.drawSelectionImageX = _x;
            this.drawSelectionImageY = _y;
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
        return {
            position: 'absolute',
            overflow: 'hidden',
            left,
            top,
            width: `${this.visibleWidth}px`,
            height: `${this.visibleHeight}px`,
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
        // 画选中框
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
        let width = 0;
        for (let i = colIndex; i < colIndex + colSpan; i++) {
            const cellHeader = this.ctx.header.leafCellHeaders[i];
            width += cellHeader.width;
        }
        return width;
    }
    private drawText() {
        const { CELL_PADDING, BODY_FONT, PLACEHOLDER_COLOR } = this.ctx.config;
        let visibleWidth = this.visibleWidth;
        if (this.type === 'tree' || this.type === 'selection-tree' || this.type === 'tree-selection') {
            const offsetIconX = this.drawTextX - this.drawX;
            visibleWidth = this.visibleWidth - offsetIconX; // 减去图标的宽度
        }
        const { ellipsis } = this.ctx.paint.handleEllipsis(this.displayText, visibleWidth, CELL_PADDING, BODY_FONT);
        this.ellipsis = ellipsis;
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
        return this.ctx.paint.drawText(text, this.drawTextX, this.drawTextY, visibleWidth, this.visibleHeight, {
            font: BODY_FONT,
            padding: CELL_PADDING,
            align:
                this.type === 'tree' || this.type === 'selection-tree' || this.type === 'tree-selection'
                    ? 'left'
                    : this.align,
            verticalAlign: this.verticalAlign,
            color,
        });
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
