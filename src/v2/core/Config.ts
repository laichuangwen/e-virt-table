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
    /** 合计底部固定 */
    footerFixed = true;
    /** 表头高度 */
    cellHeaderHeight = 36;
    /** 表头背景色 */
    headerBgColor = '#F8FAFF';
    /** 固定列阴影靠近边界的颜色 */
    fixedShadowColor = 'rgba(0,0,0,0.1)';
    /** 固定列阴影渐隐末端的颜色 */
    fixedShadowFadeColor = 'rgba(0,0,0,0)';
    /** 固定列阴影宽度 */
    fixedShadowWidth = 4;
    /** 主体背景色 */
    bodyBgColor = '#FFF';
    constructor(config: Partial<Config> = {}) {
        Object.assign(this, config);
        this.initCssVar();
    }
    private getCssVar(name: string, el: HTMLElement = document.documentElement): string {
        const key = name.startsWith('--') ? name : `--${name}`;
        const styles = getComputedStyle(el);
        return styles.getPropertyValue(key).trim();
    }
    private initCssVar() {
        Object.keys(this).forEach((key) => {
            if (key.endsWith('Color') || key.endsWith('Font')) {
                // 把驼峰转换为短横线
                const cssKey = `--evt-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                const val = this.getCssVar(cssKey);
                if (val) {
                    (this as any)[key] = val;
                }
            }
        });
    }
}