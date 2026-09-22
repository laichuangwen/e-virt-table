import { ScrollerMode, VerticalAlign, Align, PaddingInput } from "../types";
import checkboxCheck from "../svg/checkbox-check.svg?raw";
import checkboxUnchecked from "../svg/checkbox-uncheck.svg?raw";
import checkboxIndeterminate from "../svg/checkbox-indeterminate.svg?raw";
import checkboxDisabled from "../svg/checkbox-disabled.svg?raw";

export type RenderIcon = {
    name: string;
    color: string;
    svg: string;
    source?: HTMLImageElement;
}
export default class Config {
    private icons: RenderIcon[] = [];
    customIcons: RenderIcon[] = [];
    /** CSS 类名前缀 */
    classPrefix = 'e-virt-table';
    /** 是否启用 offsetHeight */
    enableOffsetHeight = true;
    /** offsetHeight 值 */
    offsetHeight = 0;
    /** 是否启用边框 */
    border = true;
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
    /** 固定列阴影靠近边界的颜色 */
    fixedShadowColor = 'rgba(0,0,0,0.1)';
    /** 固定列阴影渐隐末端的颜色 */
    fixedShadowFadeColor = 'rgba(0,0,0,0)';
    /** 固定列阴影宽度 */
    fixedShadowWidth = 4;
    /** 单元格对齐方式 */
    cellAlign: Align = 'left';
    /** 单元格垂直对齐方式 */
    cellVerticalAlign: VerticalAlign = 'middle';
    /** 表头单元格高度 */
    cellHeaderHeight = 32;
    /** 单元格内边距 */
    cellPadding: PaddingInput = 8;
    /** 表头背景色 */
    headerBgColor = '#F8FAFF';
    /** 表头文本颜色 */
    headerTextColor = '#1D2129';
    /** 主体背景色 */
    bodyBgColor = '#fff';
    /** 主体文本颜色 */
    bodyTextColor = '#4E5969';
    /** 选择框大小 */
    checkboxSize = 18;
    /** 选择框颜色 */
    checkboxColor = '#5292F7';
    /** 选择框禁用颜色 */
    checkboxDisabledColor = '#F1F2F4';
    /** 选择框选中颜色 */
    checkboxCheckedColor = '#5292F7';
    /** 选择框未选中颜色 */
    checkboxUncheckedColor = '#DDE0EA';
    /** 选择框半选中颜色 */
    checkboxIndeterminateColor = '#5292F7';
    /** 选择框选中图标 */
    checkboxCheckedSvg = checkboxCheck;
    /** 选择框未选中图标 */
    checkboxUncheckedSvg = checkboxUnchecked;
    /** 选择框半选中图标 */
    checkboxIndeterminateSvg = checkboxIndeterminate;
    /** 选择框禁用图标 */
    checkboxDisabledSvg = checkboxDisabled;
    /** 合计行底部固定 */
    footerFixed = true;
    constructor(config: Partial<Config> = {}) {
        Object.assign(this, config);
        this.initCssVar();
        this.initIcons();
        if (!this.border) {
            this.borderColor = 'transparent';
        }
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
    private generateSource(svg: string, color: string) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        if (color) {
            // 控制填充颜色
            svgElement.querySelectorAll('*').forEach((element) => {
                const attrValue = element.getAttribute('fill');
                if (attrValue === 'currentColor' || attrValue === null) {
                    element.setAttribute('fill', color);
                }
            });
        }
        const img = new Image();
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svgElement));
        img.src = url;
        return img;
    }
    private initIcons() {
        this.icons = [
            ...this.customIcons,
            {
                name: 'checkbox-checked',
                color: this.checkboxColor,
                svg: this.checkboxCheckedSvg,
            },
            {
                name: 'checkbox-unchecked',
                color: this.checkboxUncheckedColor,
                svg: checkboxUnchecked,
            },
            {
                name: 'checkbox-indeterminate',
                color: this.checkboxIndeterminateColor,
                svg: checkboxIndeterminate,
            },
            {
                name: 'checkbox-disabled',
                color: this.checkboxDisabledColor,
                svg: checkboxDisabled,
            },
        ].map((item) => {
            return {
                ...item,
                source: this.generateSource(item.svg, item.color),
            };
        });
    }
    getIcon(name: string) {
        return this.icons.find((item) => item.name === name);
    }
}