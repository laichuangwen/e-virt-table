import { IconType } from './Icons';
import {
    Align,
    BeforeAutofillDataMethod,
    BeforeCellValueChangeMethod,
    BeforeCopyMethod,
    BeforePasteDataMethod,
    BeforeSetAutofillMethod,
    BeforeSetSelectorMethod,
    CellEditorMethod,
    CellHeaderStyleMethod,
    CellHoverIconMethod,
    CellReadonlyMethod,
    CellRenderMethod,
    CellRulesMethod,
    CellStyleMethod,
    CellTypeMethod,
    ConfigType,
    ExpandLazyMethod,
    FooterPosition,
    FormatterMethod,
    MenuItem,
    SelectableMethod,
    SelectorCellValueType,
    SpanMethod,
    TreeSelectMode,
    VerticalAlign,
} from './types';
import { getCssVar } from './util';

export default class Config {
    private _config: ConfigType = {};
    /** CSS 类名前缀 */
    CSS_PREFIX = 'e-virt-table';
    /** 图标集合 */
    ICONS: IconType[] = [];
    /** 行的唯一标识键 */
    ROW_KEY = '';
    /** 禁用编辑,优先等级最高 */
    DISABLED = false;
    /** 表头字体 */
    HEADER_FONT = '12px normal Arial';
    /** 单元格字体 */
    BODY_FONT = '12px normal Arial';
    /** 边框 */
    BORDER = true;
    /** 斑马纹 */
    STRIPE = false;
    /** 斑马纹颜色 */
    STRIPE_COLOR = '#fafafa';
    /** 区域边框颜色 */
    BORDER_COLOR = '#e1e6eb';
    /** 宽度为 0 表示自适应100% */
    WIDTH = 0;
    /** 最小可调整宽度 */
    RESIZE_MIN_WIDTH = 40;
    /** 高度，为 0 表示自适应 */
    HEIGHT = 0;
    /** 占位文本颜色 */
    PLACEHOLDER_COLOR = '#CDD0DC';
    /** 空数据 body 高度 */
    EMPTY_BODY_HEIGHT = 120;
    /** 自定义空样式 */
    EMPTY_CUSTOM_STYLE: Partial<CSSStyleDeclaration> = {};
    /** 空数据文本 */
    EMPTY_TEXT = '暂无数据';
    /** 最大高度，为 0 表示自适应高度根据 HEIGHT	 */
    MAX_HEIGHT = 1000;
    /** 区域边框圆角 */
    BORDER_RADIUS = 8;
    /** 启用偏移高度内部计算表格高度 */
    ENABLE_OFFSET_HEIGHT = false;
    /** 偏移高度 */
    OFFSET_HEIGHT = 0;
    /** 表头高度 */
    HEADER_HEIGHT = 36;
    /** 启用头部固定,需要外面实现覆盖层，或者所有表头都要是元素 */
    ENABLE_HEADER_STICKY = false;
    /** 表头背景色 */
    HEADER_BG_COLOR = '#F8FAFF';
    /** body 背景色 */
    BODY_BG_COLOR = '#FFF';
    /** 表头文本颜色 */
    HEADER_TEXT_COLOR = '#1D2129';
    /** body文本颜色 */
    BODY_TEXT_COLOR = '#4E5969';
    /** footer文本颜色 */
    FOOTER_TEXT_COLOR = '#4E5969';
    /** 加载 svg 图标 */
    LOADING_ICON_SVG = '';
    /** 加载 svg 图标颜色 */
    LOADING_ICON_COLOR = '#4E5969';
    /** 树形展开svg 图标 */
    EXPAND_ICON_SVG = '';
    /** 树形收缩svg 图标 */
    SHRINK_ICON_SVG = '';
    /** 展开图标颜色 */
    EXPAND_ICON_COLOR = '#4E5969';
    SHRINK_ICON_COLOR = '#4E5969';
    /** 错误提示颜色 */
    ERROR_TIP_ICON_COLOR = 'red';
    /** 错误提示图标大小 */
    ERROR_TIP_ICON_SIZE = 6;
    /** 所有列对齐方式 */
    COLUMNS_ALIGN: Align = 'left';
    /** 所有列垂直对齐方式 */
    COLUMNS_VERTICAL_ALIGN: VerticalAlign = 'middle';
    /** 是否开启懒加载	 */
    EXPAND_LAZY = true;
    /** 默认展开全部	 */
    DEFAULT_EXPAND_ALL = false;
    /** 表格 body 部分的宽度 */
    CELL_WIDTH = 100;
    /** body 单元格默认行高 */
    CELL_HEIGHT = 36;
    /** 表格 body 部分的 padding */
    CELL_PADDING = 8;
    /** hover编辑图标大小 */
    CELL_HOVER_ICON_SIZE = 14;
    /** hover编辑图标背景色 */
    CELL_HOVER_ICON_BG_COLOR = '#fff';
    /** hover编辑图标边框颜色 */
    CELL_HOVER_ICON_BORDER_COLOR = '#DDE0EA';
    /** 滚动条轨道尺寸 */
    SCROLLER_TRACK_SIZE = 14;
    /** 滚动条滑块尺寸 */
    SCROLLER_SIZE = 8;
    /** 滚动条滑块颜色 */
    SCROLLER_COLOR = '#dee0e3';
    /** 轨道颜色 */
    SCROLLER_TRACK_COLOR = '#fff';
    /** 滚动条滑块聚焦时的颜色 */
    SCROLLER_FOCUS_COLOR = '#bbbec4';
    /** 选中区域边框颜色 */
    SELECT_BORDER_COLOR = 'rgb(82,146,247)';
    /** 选中区域背景颜色 */
    SELECT_AREA_COLOR = 'rgba(82,146,247,0.1)';
    /** 当前焦点单元格所在行、列的背景色 */
    SELECT_ROW_COL_BG_COLOR = 'transparent';
    /** 填充点的边框颜色 */
    AUTOFILL_POINT_BORDER_COLOR = '#fff';
    /** 可编辑背景色 */
    EDIT_BG_COLOR = '#fcf6ed';
    /** 选择 key,合并时用 */
    CHECKBOX_KEY = '';
    /** 选择框颜色 */
    CHECKBOX_COLOR = 'rgb(82,146,247)';
    /** 选择框大小 */
    CHECKBOX_SIZE = 20;
    /** 选择框禁用图标 */
    CHECKBOX_DISABLED_SVG = '';
    /** 选择框选中图标 */
    CHECKBOX_CHECK_SVG = '';
    /** 选择框未中图标 */
    CHECKBOX_UNCHECK_SVG = '';
    /** 选择框半选中图标 */
    CHECKBOX_INDETERMINATE_SVG = '';
    /** 启用严格排序，即不支持多列排序 */
    SORT_STRICTLY = true;
    /** 排序升序图标 */
    SORT_ASC_ICON_SVG = '';
    /** 排序降序图标 */
    SORT_DESC_ICON_SVG = '';
    /** 排序默认图标 */
    SORTABLE_ICON_SVG = '';
    /** 排序图标颜色 */
    SORT_ICON_COLOR = 'rgb(82,146,247)';
    /** 拖拽图标 */
    DRAGGABLE_ICON_SVG = '';
    /** 启用列拖拽 */
    ENABLE_DRAG_COLUMN = false;
    /** 启用行拖拽 */  
    ENABLE_DRAG_ROW = false;
    /** 拖拽图标大小 */
    DRAG_ICON_SIZE = 16;
    /** 拖拽图标透明度 */
    DRAG_ICON_OPACITY = 0.6;
    /** 单元格只读背景色 */
    READONLY_COLOR = '#fff';
    /** 单元格只读文本颜色 */
    READONLY_TEXT_COLOR = '#4E5969';
    /** 单元格错误提示文本颜色 */
    ERROR_TIP_COLOR = '#ED3F14';
    /** 合计底部背景色 */
    FOOTER_BG_COLOR = '#fafafa';
    /** 合计底部固定 */
    FOOTER_FIXED = true;
    /** 合计底部位置 */
    FOOTER_POSITION: FooterPosition = 'bottom';
    /** 单元格底部高度 */
    CELL_FOOTER_HEIGHT = 36;
    /** 启用选择器 */
    ENABLE_SELECTOR = true;
    /** 树形选择模式 */
    TREE_SELECT_MODE: TreeSelectMode = 'auto';
    /** 树形缩进宽度 */
    TREE_INDENT = 20;
    /** 树形图标大小 */
    TREE_ICON_SIZE = 20;
    /**树形划线 */
    TREE_LINE = false;
    /** 树形划线颜色 */
    TREE_LINE_COLOR = '#e1e6eb';
    /** 启用单点击立马编辑 */
    ENABLE_EDIT_SINGLE_CLICK = false;
    /** 启用点击选择器编辑 */
    ENABLE_EDIT_CLICK_SELECTOR = true;
    /** 选择器X最小范围 */
    SELECTOR_AREA_MIN_X = 0;
    /** 选择器X最大范围colMax - offset */
    SELECTOR_AREA_MAX_X_OFFSET = 0;
    /** 选择器X最大范围,0默认最大colMax */
    SELECTOR_AREA_MAX_X = 0;
    /** 选择器Y最小范围 */
    SELECTOR_AREA_MIN_Y = 0;
    /** 选择器Y最大范围,0默认rowMax */
    SELECTOR_AREA_MAX_Y = 0;
    /** 选择器Y最大范围,0默认rowMax */
    SELECTOR_AREA_MAX_Y_OFFSET = 0;
    /** 选择器值类型，value，displayText,区别displayText受format影响 */
    SELECTOR_CELL_VALUE_TYPE: SelectorCellValueType = 'value'; // displayText | value
    /** 启用自动主题 */
    ENABLE_AUTO_THEME = true;
    /** 启用选择器-选择器单选 */
    ENABLE_SELECTOR_SINGLE = false;
    /** 启用选择器-批量跨列选择 */
    ENABLE_SELECTOR_SPAN_COL = true;
    /** 启用选择器-批量跨行选择 */
    ENABLE_SELECTOR_SPAN_ROW = true;
    /** 启用选择器-批量选中列 */
    ENABLE_SELECTOR_ALL_ROWS = true;
    /** 启用选择器-批量选中行 */
    ENABLE_SELECTOR_ALL_COLS = true;
    /** 启用合并格子数据关联 */
    ENABLE_MERGE_CELL_LINK = false;
    /** 启用填充器 */
    ENABLE_AUTOFILL = false;
    /** 启用右键菜单 */
    ENABLE_CONTEXT_MENU = false;
    /** 启用复制 */
    ENABLE_COPY = true;
    /** 启用粘贴 */
    ENABLE_PASTER = true;
    /** 启用调整行高 */
    ENABLE_RESIZE_ROW = true;
    /** 启用列宽可调整 */
    ENABLE_RESIZE_COLUMN = true;
    /** 行调整线颜色 */
    RESIZE_ROW_LINE_COLOR = '#e1e6eb';
    /** 列调整线颜色 */
    RESIZE_COLUMN_LINE_COLOR = '#e1e6eb';
    /** 最小调整行高 */
    RESIZE_ROW_MIN_HEIGHT = 36;
    /** 列宽最小值 */
    RESIZE_COLUMN_MIN_WIDTH = 40;
    /** 启用键盘 */
    ENABLE_KEYBOARD = true;
    /** 启用历史 */
    ENABLE_HISTORY = false;
    ENABLE_VALIDATOR_IMMEDIATE = true;
    /** 历史栈数量 */
    HISTORY_NUM = 50;
    /** 启用悬浮高亮 */
    HIGHLIGHT_HOVER_ROW = false;
    /** 悬浮颜色 */
    HIGHLIGHT_HOVER_ROW_COLOR = 'rgba(186,203,231,0.1)';
    /** 高亮选中当前行 */
    HIGHLIGHT_SELECTED_ROW = false;
    /** 高亮当前行颜色 */
    HIGHLIGHT_SELECTED_ROW_COLOR = 'rgba(82,146,247,0.1)';
    /** 提示背景颜色 */
    TOOLTIP_BG_COLOR = '#303133';
    /** 提示文本颜色 */
    TOOLTIP_TEXT_COLOR = '#fff';
    /** 提示层级 */
    TOOLTIP_ZINDEX = 3000;
    /** 自定义提示样式 */
    TOOLTIP_CUSTOM_STYLE: Partial<CSSStyleDeclaration> = {};
    /** 自定义右键菜单 */
    CONTEXT_MENU: MenuItem[] = [
        { label: '复制', value: 'copy' },
        { label: '剪切', value: 'cut' },
        { label: '粘贴', value: 'paste' },
        { label: '清空选中内容', value: 'clearSelected' },
    ];
    /** header 格子样式 */
    HEADER_CELL_STYLE_METHOD?: CellHeaderStyleMethod;
    /** body 格子样式 */
    BODY_CELL_STYLE_METHOD?: CellStyleMethod;
    /** footer 格子样式 */
    FOOTER_CELL_STYLE_METHOD?: CellStyleMethod;
    /** 自定义只读 */
    BODY_CELL_READONLY_METHOD?: CellReadonlyMethod;
    /** 格式化方法更改（formatter优先等级比较高） */
    BODY_CELL_FORMATTER_METHOD?: FormatterMethod;
    /** 自定义校验规则 */
    BODY_CELL_RULES_METHOD?: CellRulesMethod;
    /** 自定义只读 */
    BODY_CELL_TYPE_METHOD?: CellTypeMethod;
    /** 自定义编辑器类型 */
    BODY_CELL_EDITOR_METHOD?: CellEditorMethod;
    /** 自定义只读 */
    BODY_CELL_RENDER_METHOD?: CellRenderMethod;
    /** 自定义只读 */
    BODY_CELL_HOVER_ICON_METHOD?: CellHoverIconMethod;
    /** 自定义跨列/行渲染 */
    SPAN_METHOD?: SpanMethod;
    /** 自定义选择禁用 */
    SELECTABLE_METHOD?: SelectableMethod;
    /** 自定义选择禁用 */
    EXPAND_LAZY_METHOD?: ExpandLazyMethod;
    /** 数值改变前回调 */
    BEFORE_VALUE_CHANGE_METHOD?: BeforeCellValueChangeMethod;
    /** 粘贴前回调 */
    BEFORE_PASTE_DATA_METHOD?: BeforePasteDataMethod;
    /** 数值填充前回调 */
    BEFORE_AUTOFILL_DATA_METHOD?: BeforeAutofillDataMethod;
    /** 设置选择器前回调 */
    BEFORE_SET_SELECTOR_METHOD?: BeforeSetSelectorMethod;
    /** 设置填充器前回调 */
    BEFORE_SET_AUTOFILL_METHOD?: BeforeSetAutofillMethod;
    /** 数据复制前回调 */
    BEFORE_COPY_METHOD?: BeforeCopyMethod;
    /** 启用列拖拽 */
    ENABLE_DRAG_COLUMN = false;
    /** 启用行拖拽 */
    ENABLE_DRAG_ROW = false;
    /** 拖拽触发阈值 */
    DRAG_THRESHOLD = 5;
    /** 拖拽预览透明度 */
    DRAG_PREVIEW_OPACITY = 0.8;
    constructor(config: Partial<Config>) {
        this._config = config;
        this.updateCssVar();
    }
    /** 初始化 */
    init(config: ConfigType) {
        this._config = config;
        this.updateCssVar();
    }
    /** 同步css 样式变量 */
    updateCssVar() {
        let obj: any = {};
        Object.keys(this).forEach((key) => {
            if (key.endsWith('_COLOR') || key.endsWith('_FONT')) {
                const cssKey = `--evt-${key.toLocaleLowerCase().replace(/_/g, '-')}`;
                const val = getCssVar(cssKey);
                if (val) {
                    obj[key] = val;
                }
            }
        });
        Object.assign(this, obj, this._config);
    }
}
