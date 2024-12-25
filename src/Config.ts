import { IconType } from './Icons';
import {
    BeforeAutofillChangeMethod,
    BeforeCellValueChangeMethod,
    BeforePasteChangeMethod,
    CellEditorTypeMethod,
    CellHeaderStyleMethod,
    CellHoverIconMethod,
    CellReadonlyMethod,
    CellRenderMethod,
    CellRulesMethod,
    CellStyleMethod,
    CellTypeMethod,
    ConfigType,
    ExpandLazyMethod,
    FormatterMethod,
    MenuItem,
    SelectableMethod,
    SpanMethod,
} from './types';

export default class Config {
    PROCESSOR_NUM: number = 50;
    CSS_PREFIX: string = 'e-virt-table';
    ICONS: IconType[] = [];
    ROW_KEY: string = '';
    HEADER_FONT: string = '12px normal Arial';
    BODY_FONT: string = '12px normal Arial';
    BORDER_COLOR: string = '#e1e6eb';
    WIDTH: number = 0;
    RESIZE_MIN_WIDTH: number = 40;
    HEIGHT: number = 0;
    EMPTY_BODY_HEIGHT: number = 120;
    EMPTY_CUSTOM_STYLE: Partial<CSSStyleDeclaration> = {};
    EMPTY_TEXT = '暂无数据';
    MAX_HEIGHT: number = 1000;
    BORDER_RADIUS: number = 8;
    ENABLE_OFFSET_HEIGHT: boolean = false;
    OFFSET_HEIGHT: number = 0;
    HEADER_HEIGHT: number = 36;
    ENABLE_HEADER_STICKY = false; // 启用头部固定,需要外面实现覆盖层，或者所有表头都要是元素
    HEADER_BG_COLOR: string = '#F8FAFF';
    BODY_BG_COLOR: string = '#FFF';
    HEADER_TEXT_COLOR: string = '#1D2129';
    LOADING_ICON_SVG: string = '';
    LOADING_ICON_COLOR: string = '#4E5969';
    EXPAND_ICON_SVG: string = '';
    SHRINK_ICON_SVG: string = '';
    EXPAND_ICON_COLOR: string = '#4E5969';
    SHRINK_ICON_COLOR: string = '#4E5969';
    ERROR_TIP_ICON_COLOR: string = 'red';
    ERROR_TIP_ICON_SIZE: number = 6;
    EXPAND_LAZY: boolean = true;
    DEFAULT_EXPAND_ALL: boolean = false;
    CELL_WIDTH: number = 100;
    CELL_HEIGHT: number = 36;
    CELL_PADDING: number = 8;
    CELL_HOVER_ICON_SIZE: number = 20;
    SCROLLER_TRACK_SIZE: number = 14;
    SCROLLER_SIZE: number = 8;
    SCROLLER_COLOR: string = '#dee0e3';
    SCROLLER_TRACK_COLOR: string = '#fff';
    SCROLLER_FOCUS_COLOR: string = '#bbbec4';
    SELECT_BORDER_COLOR: string = 'rgb(82,146,247)';
    SELECT_AREA_COLOR: string = 'rgba(82,146,247,0.1)';
    SELECT_BG_COLOR: string = 'rgba(82,146,247,0.1)';
    EDIT_BG_COLOR: string = '#fcf6ed';
    CHECKBOX_KEY: string = '';
    CHECKBOX_COLOR: string = 'rgb(82,146,247)';
    CHECKBOX_SIZE: number = 20;
    CHECKBOX_DISABLED_SVG: string = '';
    CHECKBOX_CHECK_SVG: string = '';
    CHECKBOX_UNCHECK_SVG: string = '';
    CHECKBOX_INDETERMINATE_SVG: string = '';
    READONLY_COLOR: string = '#fff';
    READONLY_TEXT_COLOR: string = '#4E5969';
    ERROR_TIP_COLOR: string = '#ED3F14';
    FOOTER_BG_COLOR: string = '#fafafa';
    FOOTER_FIXED: boolean = true;
    CELL_FOOTER_HEIGHT: number = 36;
    ENABLE_SELECTOR: boolean = false;
    ENABLE_EDIT_SINGLE_CLICK = false; // 启用单点击立马编辑
    ENABLE_EDIT_CLICK_SELECTOR = true; // 启用点击选择器编辑
    SELECTOR_AREA_MIN_X = 0; // 选择器X最小范围
    SELECTOR_AREA_MAX_X_OFFSET = 0; // 选择器X最大范围colMax - offset
    SELECTOR_AREA_MAX_X = 0; // 选择器X最大范围,0默认最大colMax
    SELECTOR_AREA_MIN_Y = 0; // 选择器Y最小范围
    SELECTOR_AREA_MAX_Y = 0; // 选择器Y最大范围,0默认rowMax
    SELECTOR_AREA_MAX_Y_OFFSET = 0; // 选择器Y最大范围,0默认rowMax
    ENABLE_SELECTOR_SINGLE: boolean = false;
    ENABLE_SELECTOR_SPAN_COL: boolean = true;
    ENABLE_SELECTOR_SPAN_ROW: boolean = true;
    ENABLE_SELECTOR_ALL_ROWS: boolean = true;
    ENABLE_SELECTOR_ALL_COLS: boolean = true;
    ENABLE_AUTOFILL: boolean = false;
    ENABLE_CONTEXT_MENU: boolean = false;
    ENABLE_COPY: boolean = true;
    ENABLE_PASTER: boolean = true;
    ENABLE_RESIZE_ROW: boolean = true;
    ENABLE_RESIZE_COLUMN: boolean = true;
    RESIZE_ROW_LINE_COLOR: string = '#e1e6eb';
    RESIZE_COLUMN_LINE_COLOR: string = '#e1e6eb';
    RESIZE_ROW_MIN_HEIGHT: number = 36;
    RESIZE_COLUMN_MIN_WIDTH: number = 40;
    ENABLE_KEYBOARD: boolean = true;
    ENABLE_HISTORY: boolean = false;
    ENABLE_VALIDATOR_IMMEDIATE: boolean = true;
    HISTORY_NUM: number = 50;
    HIGHLIGHT_HOVER_ROW: boolean = false;
    HIGHLIGHT_HOVER_ROW_COLOR: string = 'rgba(186,203,231,0.1)';
    HIGHLIGHT_SELECTED_ROW: boolean = false;
    HIGHLIGHT_SELECTED_ROW_COLOR: string = 'rgba(82,146,247,0.1)';
    TOOLTIP_BG_COLOR: string = '#303133';
    TOOLTIP_TEXT_COLOR: string = '#fff';
    TOOLTIP_ZINDEX: number = 3000;
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
    BODY_CELL_EDITOR_TYPE_METHOD?: CellEditorTypeMethod;
    BODY_CELL_RENDER_METHOD?: CellRenderMethod;
    BODY_CELL_HOVER_ICON_METHOD?: CellHoverIconMethod;
    SPAN_METHOD?: SpanMethod;
    SELECTABLE_METHOD?: SelectableMethod;
    EXPAND_LAZY_METHOD?: ExpandLazyMethod;
    BEFORE_VALUE_CHANGE_METHOD?: BeforeCellValueChangeMethod;
    BEFORE_PASTE_CHANGE_METHOD?: BeforePasteChangeMethod;
    BEFORE_AUTOFILL_CHANGE_METHOD?: BeforeAutofillChangeMethod;
    constructor(config: Partial<Config>) {
        Object.assign(this, config);
    }

    init(config: ConfigType) {
        Object.assign(this, config);
    }
}
