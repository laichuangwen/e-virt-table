import {
  CellEditorTypeMethod,
  CellReadonlyMethod,
  CellRenderMethod,
  CellRulesMethod,
  CellStyleMethod,
  CellTypeMethod,
  ExpandLazyMethod,
  MenuItem,
  SelectableMethod,
} from "./types";

const PROCESSOR_NUM = 50; // 处理器分批数，把耗时放后执行分批的数量
const CSS_PREFIX = "jn-data-grid";
const ROW_KEY = "";
const HEAD_FONTFAMILY = "Arial"; // 表头字体
const HEAD_LINE_HEIGHT = 1.2; // 表头字体行高
const HEAD_FONT_SIZE = 12; // 表头字体大小
const HEAD_FONT_STYLE: "normal" | "bold" | "italic" | "bold italic" = "normal"; // 表头字体样式
const BODY_FONTFAMILY = "Arial"; // 单元格字体
const BODY_FONT_SIZE = 12; // 单元格字体大小
const BODY_FONT_STYLE: "normal" | "bold" | "italic" | "bold italic" = "normal"; // 单元格字体样式
const BODY_LINE_HEIGHT = 1.2; // 单元格字体行高
const BORDER_COLOR = "#e1e6eb"; // 区域边框颜色
const WIDTH = 0; // 高度,0为自适应高度,可根据OFFSET_HEIGHT设置距离底部高度
const HEIGHT = 0; // 高度,0为自适应高度,可根据OFFSET_HEIGHT设置距离底部高度
const EMPTY_BODY_HEIGHT = 120; // 数据空时表格body高度
const MAX_HEIGHT = 1000; // 最大高度
const BORDER_RADIUS = 8; // 区域边框圆角
const ENABLE_OFFSET_HEIGHT = false; // 固定高度
const OFFSET_HEIGHT = 0; // 距离底部偏移量,不设置高度内部会自动根据数据和屏幕进行计算,这个时候可以根据这个来调整底部距离
const HEADER_HEIGHT = 36; // 表头行高
const HEADER_BG_COLOR = "#F8FAFF"; // 表头背景色
const BODY_BG_COLOR = "#FFF"; // 表头背景色
const HEADER_TEXT_COLOR = "#1D2129"; // 表头文本颜色
const LOADING_ICON_SVG = ""; // 加载图标
const LOADING_ICON_COLOR = "#4E5969"; // 加载图标颜色
const EXPAND_ICON_SVG = ""; // tree展开图标
const SHRINK_ICON_SVG = ""; // tree收缩图标
const EXPAND_ICON_COLOR = "#4E5969"; // 展开图标颜色
const SHRINK_ICON_COLOR = "#4E5969"; // 展开图标颜色
const ERROR_TIP_ICON_COLOR = "red"; // 错误提示颜色
const ERROR_TIP_ICON_SIZE = 6; // 错误提示颜色
const EXPAND_LAZY = true; // tree是否懒加载
const DEFAULT_EXPAND_ALL = false; // tree默认是否全部展开
const CELL_WIDTH = 100; // 表格body部分的宽度
const CELL_HEIGHT = 36; // 表格body部分的行高
const CELL_PADDING = 8; // 表格body部分的padding
const SCROLLER_TRACK_SIZE = 14; // 滚动条轨道尺寸
const SCROLLER_SIZE = 8; // 滚动条滑块尺寸
const SCROLLER_COLOR = "#dee0e3"; // 滚动条滑块颜色
const SCROLLER_TRACK_COLOR = "#fff"; // 滚动条轨道颜色
const SCROLLER_FOCUS_COLOR = "#bbbec4"; // 滚动条滑块聚焦时的颜色
const SELECT_BORDER_COLOR = "rgb(82,146,247)"; // 选中区域边框颜色
const SELECT_AREA_COLOR = "rgba(82,146,247,0.1)"; // 选中区域背景颜色
const SELECT_BG_COLOR = "rgba(82,146,247,0.1)"; // 当前焦点单元格所在行、列的背景色
const EDIT_BG_COLOR = "#fcf6ed"; // 可编辑背景色
// const EDIT_BG_COLOR = "#fff"; // 可编辑背景色
const CHECKBOX_KEY = ""; // 选择框key
const CHECKBOX_COLOR = "rgb(82,146,247)"; // 选择框颜色
const CHECKBOX_SIZE = 20; // 选择框大小
const CHECKBOX_DISABLED_SVG = ""; // checkbox禁用图标
const CHECKBOX_CHECK_SVG = ""; // checkbox选中图标
const CHECKBOX_UNCHECK_SVG = ""; // checkbox未选中图标
const CHECKBOX_INDETERMINATE_SVG = ""; // checkbox半选中图标
const READONLY_COLOR = "#fff"; // 单元格只读背景色#f8f8f9
const READONLY_TEXT_COLOR = "#4E5969"; // 单元格只读文本颜色
const ERROR_TIP_COLOR = "#ED3F14"; // 单元格错误提示文本颜色
const FOOTER_BG_COLOR = "#fafafa"; // 合计底部背景色#fafafa
const FOOTER_FIXED = false; // 合计底部固定
const CELL_FOOTER_HEIGHT = 36; // 表格footer部分的行高
const ENABLE_SELECTOR = false; // 启用选择器
const ENABLE_SELECTOR_SINGLE = false; // 启用选择器-选择器单选
const ENABLE_SELECTOR_SPAN_COL = true; // 启用选择器-批量跨列选择
const ENABLE_SELECTOR_SPAN_ROW = true; // 启用选择器-批量跨行选择
const ENABLE_SELECTOR_ALL_ROWS = true; // 启用选择器-批量选中行
const ENABLE_SELECTOR_ALL_COLS = true; // 启用选择器-批量选中列
const ENABLE_AUTOFILL = false; // 启用填充
const ENABLE_CONTEXTMENU = true; // 启用右键
const ENABLE_COPY = true; // 启用复制
const ENABLE_PASTER = true; // 启用粘贴
const ENABLE_RESIZE_ROW = true; // 启用调整行高
const ENABLE_RESIZE_COLUMN = true; // 启用调整列宽
const RESIZE_ROW_LINE_COLOR = "#e1e6eb"; // 调整行高线颜色
const RESIZE_COLUMN_LINE_COLOR = "#e1e6eb"; // 调整行高线颜色
const RESIZE_ROW_MIN_HEIGHT = 36; // 调整行高最小高度
const RESIZE_COLUMN_MIN_WIDTH = 50; // 调整列宽最小宽度
const ENABLE_KEYBOARD = true; // 启用键盘
const ENABLE_HISTORY = true; // 启用历史记录，可回退
const ENABLE_VALIDATOR_IMMEDIATE = true; // 检验器数据更改立马校验
const HISTORY_NUM = 50; // 启用历史记录数量
const HIGHLIGHT_HOVER_ROW = false; // hover高亮当前行
const HIGHLIGHT_HOVER_ROW_COLOR = "rgba(186,203,231,0.1)"; // hover高亮当前行颜色
const HIGHLIGHT_SELECTED_ROW = false; // 高亮选中当前行
const HIGHLIGHT_SELECTED_ROW_COLOR = "rgba(82,146,247,0.1)"; // 高亮当前行颜色
const TOOLTIP_BG_COLOR = "#000"; // 提示背景颜色
const TOOLTIP_TEXT_COLOR = "#fff"; // 提示文本颜色
const TOOLTIP_CUSTOM = true; // 自定义提示，建议是自定义提示因为用内部画布画，会被插槽覆盖，所以默认是自定义
const CONTEXT_MENU: MenuItem[] = [
  {
    label: "复制",
    value: "copy",
  },
  {
    label: "剪切",
    value: "cut",
  },
  {
    label: "粘贴",
    value: "paste",
  },
  {
    label: "清空选中内容",
    value: "clearSelected",
  },
]; // 自定义右键菜单label菜单名，value,菜单key

const BODY_CELL_STYLE_METHOD: CellStyleMethod | undefined = undefined; // 自定义单元格样式
const CELL_READONLY_METHOD: CellReadonlyMethod | undefined = undefined; // 自定义只读
const CELL_RULES_METHOD: CellRulesMethod | undefined = undefined; // 自定义校验规则
const CELL_TYPE_METHOD: CellTypeMethod | undefined = undefined; // 自定义类型
const CELL_EDITOR_TYPE_METHOD: CellEditorTypeMethod | undefined = undefined; // 自定义编辑器类型
const CELL_RENDER_METHOD: CellRenderMethod | undefined = undefined; // 自定义渲染
const SPAN_METHOD: CellRenderMethod | undefined = undefined; // 自定义合并单元格
const SELECTABLE_METHOD: SelectableMethod | undefined = undefined; // 自定义选择禁用
const EXPAND_LAZY_METHOD: ExpandLazyMethod | undefined = undefined; // tree懒加载数据
export default {
  PROCESSOR_NUM,
  CSS_PREFIX,
  ROW_KEY,
  WIDTH,
  HEIGHT,
  MAX_HEIGHT,
  BODY_BG_COLOR,
  EMPTY_BODY_HEIGHT,
  BORDER_COLOR,
  BORDER_RADIUS,
  ENABLE_OFFSET_HEIGHT,
  OFFSET_HEIGHT,
  HEADER_HEIGHT,
  CELL_WIDTH,
  CELL_PADDING,
  CELL_HEIGHT,
  SCROLLER_TRACK_SIZE,
  SCROLLER_TRACK_COLOR,
  SCROLLER_SIZE,
  SCROLLER_COLOR,
  SCROLLER_FOCUS_COLOR,
  SELECT_BORDER_COLOR,
  SELECT_AREA_COLOR,
  SELECT_BG_COLOR,
  EDIT_BG_COLOR,
  READONLY_COLOR,
  READONLY_TEXT_COLOR,
  ERROR_TIP_COLOR,
  FOOTER_BG_COLOR,
  CELL_FOOTER_HEIGHT,
  CHECKBOX_KEY,
  CHECKBOX_COLOR,
  CHECKBOX_SIZE,
  CHECKBOX_CHECK_SVG,
  CHECKBOX_UNCHECK_SVG,
  CHECKBOX_DISABLED_SVG,
  CHECKBOX_INDETERMINATE_SVG,
  FOOTER_FIXED,
  ENABLE_SELECTOR,
  ENABLE_SELECTOR_SPAN_COL,
  ENABLE_SELECTOR_SPAN_ROW,
  ENABLE_SELECTOR_ALL_ROWS,
  ENABLE_SELECTOR_ALL_COLS,
  ENABLE_SELECTOR_SINGLE,
  ENABLE_AUTOFILL,
  ENABLE_CONTEXTMENU,
  ENABLE_COPY,
  ENABLE_PASTER,
  ENABLE_RESIZE_ROW,
  ENABLE_RESIZE_COLUMN,
  RESIZE_ROW_LINE_COLOR,
  RESIZE_COLUMN_LINE_COLOR,
  RESIZE_ROW_MIN_HEIGHT,
  RESIZE_COLUMN_MIN_WIDTH,
  ENABLE_KEYBOARD,
  ENABLE_HISTORY,
  ENABLE_VALIDATOR_IMMEDIATE,
  HISTORY_NUM,
  HEADER_BG_COLOR,
  HEADER_TEXT_COLOR,
  HEAD_FONTFAMILY,
  HEAD_LINE_HEIGHT,
  HEAD_FONT_SIZE,
  HEAD_FONT_STYLE,
  BODY_FONTFAMILY,
  BODY_FONT_SIZE,
  BODY_FONT_STYLE,
  BODY_LINE_HEIGHT,
  LOADING_ICON_SVG,
  LOADING_ICON_COLOR,
  EXPAND_ICON_SVG,
  SHRINK_ICON_SVG,
  ERROR_TIP_ICON_COLOR,
  ERROR_TIP_ICON_SIZE,
  EXPAND_ICON_COLOR,
  SHRINK_ICON_COLOR,
  DEFAULT_EXPAND_ALL,
  EXPAND_LAZY,
  HIGHLIGHT_HOVER_ROW,
  HIGHLIGHT_HOVER_ROW_COLOR,
  HIGHLIGHT_SELECTED_ROW,
  HIGHLIGHT_SELECTED_ROW_COLOR,
  TOOLTIP_TEXT_COLOR,
  TOOLTIP_BG_COLOR,
  TOOLTIP_CUSTOM,
  CONTEXT_MENU,
  BODY_CELL_STYLE_METHOD,
  CELL_READONLY_METHOD,
  CELL_RULES_METHOD,
  CELL_TYPE_METHOD,
  CELL_EDITOR_TYPE_METHOD,
  CELL_RENDER_METHOD,
  SPAN_METHOD,
  SELECTABLE_METHOD,
  EXPAND_LAZY_METHOD,
};
