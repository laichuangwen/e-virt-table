import { IconType } from './Icons';
import {
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
    SpanMethod,
} from './types';

export default class Config {
    CSS_PREFIX = 'e-virt-table';
    ICONS: IconType[] = [];
    ROW_KEY = '';
    DISABLED = false; //禁用编辑,优先等级最高
    HEADER_FONT = '12px normal Arial';
    BODY_FONT = '12px normal Arial';
    BORDER_COLOR = '#e1e6eb';
    WIDTH = 0;
    RESIZE_MIN_WIDTH = 40;
    HEIGHT = 0;
    EMPTY_BODY_HEIGHT = 120;
    EMPTY_CUSTOM_STYLE: Partial<CSSStyleDeclaration> = {};
    EMPTY_TEXT = '暂无数据';
    MAX_HEIGHT = 1000;
    BORDER_RADIUS = 8;
    ENABLE_OFFSET_HEIGHT = false;
    OFFSET_HEIGHT = 0;
    HEADER_HEIGHT = 36;
    ENABLE_HEADER_STICKY = false; // 启用头部固定,需要外面实现覆盖层，或者所有表头都要是元素
    HEADER_BG_COLOR = '#F8FAFF';
    BODY_BG_COLOR = '#FFF';
    HEADER_TEXT_COLOR = '#1D2129';
    LOADING_ICON_SVG = '';
    LOADING_ICON_COLOR = '#4E5969';
    EXPAND_ICON_SVG = '';
    SHRINK_ICON_SVG = '';
    EXPAND_ICON_COLOR = '#4E5969';
    SHRINK_ICON_COLOR = '#4E5969';
    ERROR_TIP_ICON_COLOR = 'red';
    ERROR_TIP_ICON_SIZE = 6;
    EXPAND_LAZY = true;
    DEFAULT_EXPAND_ALL = false;
    CELL_WIDTH = 100;
    CELL_HEIGHT = 36;
    CELL_PADDING = 8;
    CELL_HOVER_ICON_SIZE = 20;
    SCROLLER_TRACK_SIZE = 14;
    SCROLLER_SIZE = 8;
    SCROLLER_COLOR = '#dee0e3';
    SCROLLER_TRACK_COLOR = '#fff';
    SCROLLER_FOCUS_COLOR = '#bbbec4';
    SELECT_BORDER_COLOR = 'rgb(82,146,247)';
    SELECT_AREA_COLOR = 'rgba(82,146,247,0.1)';
    SELECT_ROW_COL_BG_COLOR = 'transparent';
    AUTOFILL_POINT_BORDER_COLOR = '#fff';
    EDIT_BG_COLOR = '#fcf6ed';
    CHECKBOX_KEY = '';
    CHECKBOX_COLOR = 'rgb(82,146,247)';
    CHECKBOX_SIZE = 20;
    CHECKBOX_DISABLED_SVG = '';
    CHECKBOX_CHECK_SVG = '';
    CHECKBOX_UNCHECK_SVG = '';
    CHECKBOX_INDETERMINATE_SVG = '';
    READONLY_COLOR = '#fff';
    READONLY_TEXT_COLOR = '#4E5969';
    ERROR_TIP_COLOR = '#ED3F14';
    FOOTER_BG_COLOR = '#fafafa';
    FOOTER_FIXED = true;
    FOOTER_POSITION: FooterPosition = 'bottom';
    CELL_FOOTER_HEIGHT = 36;
    ENABLE_SELECTOR = false;
    ENABLE_EDIT_SINGLE_CLICK = false; // 启用单点击立马编辑
    ENABLE_EDIT_CLICK_SELECTOR = true; // 启用点击选择器编辑
    SELECTOR_AREA_MIN_X = 0; // 选择器X最小范围
    SELECTOR_AREA_MAX_X_OFFSET = 0; // 选择器X最大范围colMax - offset
    SELECTOR_AREA_MAX_X = 0; // 选择器X最大范围,0默认最大colMax
    SELECTOR_AREA_MIN_Y = 0; // 选择器Y最小范围
    SELECTOR_AREA_MAX_Y = 0; // 选择器Y最大范围,0默认rowMax
    SELECTOR_AREA_MAX_Y_OFFSET = 0; // 选择器Y最大范围,0默认rowMax
    ENABLE_SELECTOR_SINGLE = false;
    ENABLE_SELECTOR_SPAN_COL = true;
    ENABLE_SELECTOR_SPAN_ROW = true;
    ENABLE_SELECTOR_ALL_ROWS = true;
    ENABLE_SELECTOR_ALL_COLS = true;
    ENABLE_MERGE_CELL_LINK = false; // 启用合并选择器关联
    ENABLE_AUTOFILL = false;
    ENABLE_CONTEXT_MENU = false;
    ENABLE_COPY = true;
    ENABLE_PASTER = true;
    ENABLE_RESIZE_ROW = true;
    ENABLE_RESIZE_COLUMN = true;
    RESIZE_ROW_LINE_COLOR = '#e1e6eb';
    RESIZE_COLUMN_LINE_COLOR = '#e1e6eb';
    RESIZE_ROW_MIN_HEIGHT = 36;
    RESIZE_COLUMN_MIN_WIDTH = 40;
    ENABLE_KEYBOARD = true;
    ENABLE_HISTORY = false;
    ENABLE_VALIDATOR_IMMEDIATE = true;
    HISTORY_NUM = 50;
    HIGHLIGHT_HOVER_ROW = false;
    HIGHLIGHT_HOVER_ROW_COLOR = 'rgba(186,203,231,0.1)';
    HIGHLIGHT_SELECTED_ROW = false;
    HIGHLIGHT_SELECTED_ROW_COLOR = 'rgba(82,146,247,0.1)';
    TOOLTIP_BG_COLOR = '#303133';
    TOOLTIP_TEXT_COLOR = '#fff';
    TOOLTIP_ZINDEX = 3000;
    TOOLTIP_CUSTOM_STYLE: Partial<CSSStyleDeclaration> = {};
    CONTEXT_MENU: MenuItem[] = [
        { label: '复制', value: 'copy' },
        { label: '剪切', value: 'cut' },
        { label: '粘贴', value: 'paste' },
        { label: '清空选中内容', value: 'clearSelected' },
    ];
    HEADER_CELL_STYLE_METHOD?: CellHeaderStyleMethod;
    BODY_CELL_STYLE_METHOD?: CellStyleMethod;
    FOOTER_CELL_STYLE_METHOD?: CellStyleMethod;
    BODY_CELL_READONLY_METHOD?: CellReadonlyMethod;
    BODY_CELL_FORMATTER_METHOD?: FormatterMethod;
    BODY_CELL_RULES_METHOD?: CellRulesMethod;
    BODY_CELL_TYPE_METHOD?: CellTypeMethod;
    BODY_CELL_EDITOR_METHOD?: CellEditorMethod;
    BODY_CELL_RENDER_METHOD?: CellRenderMethod;
    BODY_CELL_HOVER_ICON_METHOD?: CellHoverIconMethod;
    SPAN_METHOD?: SpanMethod;
    SELECTABLE_METHOD?: SelectableMethod;
    EXPAND_LAZY_METHOD?: ExpandLazyMethod;
    BEFORE_VALUE_CHANGE_METHOD?: BeforeCellValueChangeMethod;
    BEFORE_PASTE_DATA_METHOD?: BeforePasteDataMethod;
    BEFORE_AUTOFILL_DATA_METHOD?: BeforeAutofillDataMethod;
    BEFORE_SET_SELECTOR_METHOD?: BeforeSetSelectorMethod;
    BEFORE_SET_AUTOFILL_METHOD?: BeforeSetAutofillMethod;
    BEFORE_COPY_METHOD?: BeforeCopyMethod;
    constructor(config: Partial<Config>) {
        Object.assign(this, config);
    }

    init(config: ConfigType) {
        Object.assign(this, config);
    }
}
