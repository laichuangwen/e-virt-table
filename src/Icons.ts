import Context from './Context';
import expandSvg from './svg/expand.svg?raw';
import svgcheckboxCheck from './svg/checkbox-check.svg?raw';
import svgSelect from './svg/select.svg?raw';
import svgSortable from './svg/sortable.svg?raw';
import svgLoading from './svg/loading.svg?raw';
import svgDrag from './svg/drag.svg?raw';
import svgCheckboxUncheck from './svg/checkbox-uncheck.svg?raw';
import svgCheckboxIndeterminate from './svg/checkbox-indeterminate.svg?raw';
import svgCheckboxDisabled from './svg/checkbox-disabled.svg?raw';
import svgIconEdit from './svg/icon-edit.svg?raw';

type ConfigColorNameType =
    | 'LOADING_ICON_COLOR'
    | 'EXPAND_ICON_COLOR'
    | 'SHRINK_ICON_COLOR'
    | 'CHECKBOX_COLOR'
    | 'SORT_ICON_COLOR'
    | 'ICON_EDIT_COLOR'
    | 'ICON_SELECT_COLOR'
    | 'CHECKBOX_DISABLED_COLOR'
    | 'CHECKBOX_UNCHECK_COLOR';
type ConfigTypeName =
    | 'LOADING_ICON_SVG'
    | 'EXPAND_ICON_SVG'
    | 'SHRINK_ICON_SVG'
    | 'CHECKBOX_UNCHECK_SVG'
    | 'CHECKBOX_CHECK_SVG'
    | 'CHECKBOX_DISABLED_SVG'
    | 'ICON_EDIT_SVG'
    | 'ICON_SELECT_SVG'
    | 'CHECKBOX_CHECK_DISABLED_SVG'
    | 'CHECKBOX_INDETERMINATE_SVG'
    | 'SORT_ASC_ICON_SVG'
    | 'SORT_DESC_ICON_SVG'
    | 'SORTABLE_ICON_SVG'
    | 'DRAG_ROW_ICON_SVG';

interface SvgIcon extends IconType {
    configName?: ConfigTypeName;
    configColorName?: ConfigColorNameType;
}
export interface IconType {
    name: string;
    svg: string;
    color: string;
    isBlob?: boolean;
}
// 用替换节约点打包体积
const svgSortAsc = svgSortable.replace(`fill="currentColor" p-id="2016"`, `fill="#bec4c7" p-id="2016"`);
const svgSortDesc = svgSortable.replace(`fill="currentColor" p-id="2015"`, `fill="#bec4c7" p-id="2015"`);
export { expandSvg, svgcheckboxCheck, svgSelect, svgSortable, svgSortAsc, svgSortDesc, svgLoading, svgDrag };

export default class Icons {
    private ctx: Context;
    private list: SvgIcon[] = [
        {
            name: 'loading',
            configName: 'LOADING_ICON_SVG',
            configColorName: 'LOADING_ICON_COLOR',
            svg: svgLoading,
            color: '#4E5969',
        },
        {
            name: 'expand',
            configName: 'EXPAND_ICON_SVG',
            configColorName: 'EXPAND_ICON_COLOR',
            svg: expandSvg,
            color: '#4E5969',
        },
        {
            name: 'shrink',
            configName: 'SHRINK_ICON_SVG',
            configColorName: 'SHRINK_ICON_COLOR',
            svg: svgSelect,
            color: '#4E5969',
        },
        {
            name: 'checkbox-uncheck',
            configName: 'CHECKBOX_UNCHECK_SVG',
            configColorName: 'CHECKBOX_UNCHECK_COLOR',
            svg: svgCheckboxUncheck,
            color: '',
        },
        {
            name: 'checkbox-check',
            configName: 'CHECKBOX_CHECK_SVG',
            configColorName: 'CHECKBOX_COLOR',
            svg: svgcheckboxCheck,
            color: 'rgb(82,146,247)',
        },
        {
            name: 'checkbox-indeterminate',
            configName: 'CHECKBOX_INDETERMINATE_SVG',
            configColorName: 'CHECKBOX_COLOR',
            svg: svgCheckboxIndeterminate,
            color: 'rgb(82,146,247)',
        },
        {
            name: 'checkbox-check-disabled',
            configName: 'CHECKBOX_CHECK_DISABLED_SVG',
            svg: svgcheckboxCheck,
            color: '#DDE0EA',
        },
        {
            name: 'checkbox-disabled',
            configName: 'CHECKBOX_DISABLED_SVG',
            configColorName: 'CHECKBOX_DISABLED_COLOR',
            svg: svgCheckboxDisabled,
            color: '#F1F2F4',
        },
        {
            name: 'icon-edit',
            configName: 'ICON_EDIT_SVG',
            configColorName: 'ICON_EDIT_COLOR',
            svg: svgIconEdit,
            color: '#4E5969',
        },
        {
            name: 'icon-select',
            configName: 'ICON_SELECT_SVG',
            configColorName: 'ICON_SELECT_COLOR',
            svg: svgSelect,
            color: '#4E5969',
        },
        {
            name: 'sort-asc',
            configName: 'SORT_ASC_ICON_SVG',
            configColorName: 'SORT_ICON_COLOR',
            svg: svgSortAsc,
            color: 'rgb(82,146,247)',
        },
        {
            name: 'sort-desc',
            configName: 'SORT_DESC_ICON_SVG',
            configColorName: 'SORT_ICON_COLOR',
            svg: svgSortDesc,
            color: 'rgb(82,146,247)',
        },
        {
            name: 'sort-default',
            configName: 'SORTABLE_ICON_SVG',
            svg: svgSortable,
            color: '#bec4c7',
        },
        {
            name: 'drag',
            configName: 'DRAG_ROW_ICON_SVG',
            svg: svgDrag,
            color: '#4E5969',
        },
    ];
    icons = new Map<string, HTMLImageElement>();
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }
    async init() {
        const promises = [];
        for (let i = 0; i < this.list.length; i++) {
            const item = this.list[i];
            let color = item.color;
            let svg = item.svg;
            if (item.configColorName) {
                // 从配置中获取颜色
                const configColor = this.ctx.config[item.configColorName];
                if (configColor) {
                    color = configColor;
                }
            }
            // 替换svg
            if (item.configName) {
                const configSvg = this.ctx.config[item.configName];
                if (configSvg) {
                    svg = configSvg;
                }
            }

            // 将异步操作推入 promises 数组
            const promise = this.createImageFromSVG(svg, color).then((icon) => {
                this.icons.set(item.name, icon);
            });
            promises.push(promise);
        }
        // 额外的图标
        for (let i = 0; i < this.ctx.config.ICONS.length; i++) {
            const item = this.ctx.config.ICONS[i];
            let color = item.color;
            // 将异步操作推入 promises 数组
            const promise = this.createImageFromSVG(item.svg, color, item.isBlob).then((icon) => {
                this.icons.set(item.name, icon);
            });
            promises.push(promise);
        }
        // 并行执行所有异步操作
        await Promise.all(promises);
        // 加载完成后触发绘制
        this.ctx.emit('draw');
    }
    private async createImageFromSVG(svgContent: string, fill?: string, isBlob = false) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svg = svgDoc.documentElement;
        if (fill) {
            // 控制填充颜色
            svg.querySelectorAll('*').forEach((element) => {
                const attrValue = element.getAttribute('fill');
                if (attrValue === 'currentColor' || attrValue === null) {
                    element.setAttribute('fill', fill);
                }
            });
        }
        const img = new Image();
        let url = '';
        if (isBlob) {
            const svgBlob = new Blob([new XMLSerializer().serializeToString(svg)], {
                type: 'image/svg+xml',
            });
            url = URL.createObjectURL(svgBlob);
        } else {
            url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
        }
        img.src = url;
        return new Promise<HTMLImageElement>((resolve, reject) => {
            img.onerror = () => reject(new Error('Failed to load image:' + svgContent));
            img.onload = () => {
                resolve(img);
            };
        });
    }
    get(name: string) {
        return this.icons.get(name);
    }
    getSvg(name: string) {
        return this.list.find((item) => item.name === name);
    }
}
