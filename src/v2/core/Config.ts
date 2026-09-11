import { ScrollerMode } from "../types";
export default class Config {
    /** CSS 类名前缀 */
    classPrefix = 'e-virt-table';
    enableOffsetHeight = true;
    offsetHeight = 0;
    BORDER_COLOR = '#e1e6eb';
    /** 滚动条轨道尺寸 */
    SCROLLER_TRACK_SIZE = 14;
    /** 滚动条模式，outer 为外部预留区域，inner 为覆盖在内容上 */
    scrollbarMode: ScrollerMode = 'outer';
    /** 内部滚动条悬停后显示延迟 */
    SCROLLBAR_SHOW_DELAY = 300;
    /** 滚动条滑块尺寸 */
    SCROLLER_SIZE = 8;
    /** 滚动条滑块颜色 */
    SCROLLER_COLOR = '#dee0e3';
    /** 轨道颜色 */
    SCROLLER_TRACK_COLOR = '#f2f2f2'; // #fff,
    /** 滚动条滑块聚焦时的颜色 */
    SCROLLER_FOCUS_COLOR = '#bbbec4';
}