import { ScrollerMode } from "../types";
export default class Config {
    /** CSS 类名前缀 */
    classPrefix = 'e-virt-table';
    /** 是否启用 offsetHeight */
    enableOffsetHeight = true;
    /** offsetHeight 值 */
    offsetHeight = 0;
    /** 边框圆角 */
    borderRadius = 8;
    /** 边框颜色 */
    borderColor = '#e1e6eb';
    /** 滚动条模式，outer 为外部预留区域，inner 为覆盖在内容上 */
    scrollbarMode: ScrollerMode = 'outer';
    /** 滚动条轨道尺寸 */
    scrollbarTrackSize = 14;
    /** 滚动条轨道颜色 */
    scrollbarTrackColor = '#fff'; // #fff,
    /** 滚动条滑块尺寸 */
    scrollbarThumbSize = 8;
    /** 滚动条滑块颜色 */
    scrollbarThumbColor = '#dee0e3';
    /** 滚动条滑块聚焦时的颜色 */
    scrollbarThumbFocusColor = '#bbbec4';
    HEADER_BG_COLOR = '#F8FAFF';
    BODY_BG_COLOR = '#FFF';
}