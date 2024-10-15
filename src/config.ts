import { IconType } from "./Icons";
import {
  CellEditorTypeMethod,
  CellHoverIconMethod,
  CellReadonlyMethod,
  CellRenderMethod,
  CellRulesMethod,
  CellStyleMethod,
  CellTypeMethod,
  ExpandLazyMethod,
  MenuItem,
  SelectableMethod,
  SpanMethod,
} from "./types";

export default class Config {
  PROCESSOR_NUM: number = 50;
  CSS_PREFIX: string = "evirt-table";
  ICONS: IconType[] = [];
  ROW_KEY: string = "";
  HEAD_FONTFAMILY: string = "Arial";
  HEAD_LINE_HEIGHT: number = 1.2;
  HEAD_FONT_SIZE: number = 12;
  HEAD_FONT_STYLE: "normal" | "bold" | "italic" | "bold italic" = "normal";
  BODY_FONTFAMILY: string = "Arial";
  BODY_FONT_SIZE: number = 12;
  BODY_FONT_STYLE: "normal" | "bold" | "italic" | "bold italic" = "normal";
  BODY_LINE_HEIGHT: number = 1.2;
  BORDER_COLOR: string = "#e1e6eb";
  WIDTH: number = 0;
  HEIGHT: number = 0;
  EMPTY_BODY_HEIGHT: number = 120;
  MAX_HEIGHT: number = 1000;
  BORDER_RADIUS: number = 8;
  ENABLE_OFFSET_HEIGHT: boolean = false;
  OFFSET_HEIGHT: number = 0;
  HEADER_HEIGHT: number = 36;
  HEADER_BG_COLOR: string = "#F8FAFF";
  BODY_BG_COLOR: string = "#FFF";
  HEADER_TEXT_COLOR: string = "#1D2129";
  LOADING_ICON_SVG: string = "";
  LOADING_ICON_COLOR: string = "#4E5969";
  EXPAND_ICON_SVG: string = "";
  SHRINK_ICON_SVG: string = "";
  EXPAND_ICON_COLOR: string = "#4E5969";
  SHRINK_ICON_COLOR: string = "#4E5969";
  ERROR_TIP_ICON_COLOR: string = "red";
  ERROR_TIP_ICON_SIZE: number = 6;
  EXPAND_LAZY: boolean = true;
  DEFAULT_EXPAND_ALL: boolean = false;
  CELL_WIDTH: number = 100;
  CELL_HEIGHT: number = 36;
  CELL_PADDING: number = 8;
  CELL_HOVER_ICON_SIZE: number = 20;
  SCROLLER_TRACK_SIZE: number = 14;
  SCROLLER_SIZE: number = 8;
  SCROLLER_COLOR: string = "#dee0e3";
  SCROLLER_TRACK_COLOR: string = "#fff";
  SCROLLER_FOCUS_COLOR: string = "#bbbec4";
  SELECT_BORDER_COLOR: string = "rgb(82,146,247)";
  SELECT_AREA_COLOR: string = "rgba(82,146,247,0.1)";
  SELECT_BG_COLOR: string = "rgba(82,146,247,0.1)";
  EDIT_BG_COLOR: string = "#fcf6ed";
  CHECKBOX_KEY: string = "";
  CHECKBOX_COLOR: string = "rgb(82,146,247)";
  CHECKBOX_SIZE: number = 20;
  CHECKBOX_DISABLED_SVG: string = "";
  CHECKBOX_CHECK_SVG: string = "";
  CHECKBOX_UNCHECK_SVG: string = "";
  CHECKBOX_INDETERMINATE_SVG: string = "";
  READONLY_COLOR: string = "#fff";
  READONLY_TEXT_COLOR: string = "#4E5969";
  ERROR_TIP_COLOR: string = "#ED3F14";
  FOOTER_BG_COLOR: string = "#fafafa";
  FOOTER_FIXED: boolean = false;
  CELL_FOOTER_HEIGHT: number = 36;
  ENABLE_SELECTOR: boolean = false;
  ENABLE_EDIT_SINGLE_CLICK = false; // 启用单点击立马编辑
  ENABLE_SELECTOR_SINGLE: boolean = false;
  ENABLE_SELECTOR_SPAN_COL: boolean = true;
  ENABLE_SELECTOR_SPAN_ROW: boolean = true;
  ENABLE_SELECTOR_ALL_ROWS: boolean = true;
  ENABLE_SELECTOR_ALL_COLS: boolean = true;
  ENABLE_AUTOFILL: boolean = false;
  ENABLE_CONTEXTMENU: boolean = true;
  ENABLE_COPY: boolean = true;
  ENABLE_PASTER: boolean = true;
  ENABLE_RESIZE_ROW: boolean = true;
  ENABLE_RESIZE_COLUMN: boolean = true;
  RESIZE_ROW_LINE_COLOR: string = "#e1e6eb";
  RESIZE_COLUMN_LINE_COLOR: string = "#e1e6eb";
  RESIZE_ROW_MIN_HEIGHT: number = 36;
  RESIZE_COLUMN_MIN_WIDTH: number = 50;
  ENABLE_KEYBOARD: boolean = false;
  ENABLE_HISTORY: boolean = false;
  ENABLE_VALIDATOR_IMMEDIATE: boolean = true;
  HISTORY_NUM: number = 50;
  HIGHLIGHT_HOVER_ROW: boolean = false;
  HIGHLIGHT_HOVER_ROW_COLOR: string = "rgba(186,203,231,0.1)";
  HIGHLIGHT_SELECTED_ROW: boolean = false;
  HIGHLIGHT_SELECTED_ROW_COLOR: string = "rgba(82,146,247,0.1)";
  TOOLTIP_BG_COLOR: string = "#303133";
  TOOLTIP_TEXT_COLOR: string = "#fff";
  TOOLTIP_ZINDEX: number = 3000;
  TOOLTIP_CUSTOM_STYLE: Partial<CSSStyleDeclaration> = {};
  CONTEXT_MENU: MenuItem[] = [
    { label: "复制", value: "copy" },
    { label: "剪切", value: "cut" },
    { label: "粘贴", value: "paste" },
    { label: "清空选中内容", value: "clearSelected" },
  ];
  BODY_CELL_STYLE_METHOD?: CellStyleMethod;
  CELL_READONLY_METHOD?: CellReadonlyMethod;
  CELL_RULES_METHOD?: CellRulesMethod;
  CELL_TYPE_METHOD?: CellTypeMethod;
  CELL_EDITOR_TYPE_METHOD?: CellEditorTypeMethod;
  CELL_RENDER_METHOD?: CellRenderMethod;
  CELL_HOVER_ICON_METHOD?: CellHoverIconMethod;
  SPAN_METHOD?: SpanMethod;
  SELECTABLE_METHOD?: SelectableMethod;
  EXPAND_LAZY_METHOD?: ExpandLazyMethod;
  constructor(config: Partial<Config>) {
    Object.assign(this, config);
  }
}
