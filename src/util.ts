import { Column, SpanParams } from './types';

function generateShortUUID(): string {
    return 'xxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function throttle<T extends (...args: any) => any>(func: T, delay: number | (() => number)): T {
    let lastCalledTime = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined {
        const now = new Date().getTime();
        const elapsedTime = now - lastCalledTime;
        const wait = typeof delay === 'function' ? delay() : delay;
        if (!lastCalledTime || elapsedTime >= wait) {
            func.apply(this, args);
            lastCalledTime = now;
        } else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastCalledTime = new Date().getTime();
                timeoutId = undefined;
            }, wait - elapsedTime);
        }

        return undefined;
    } as T;
}
/**
 * 根据children获取最大深度
 * @param data
 * @returns
 */
function getMaxRow(data: Column[] = []): number {
    if (data.length) {
        return data.map((item) => getMaxRow(item.children) + 1).sort((a, b) => b - a)[0];
    }
    return 0;
}
function sortFixed(arr: Column[] = []) {
    let lefts: Column[] = [];
    let centers: Column[] = [];
    let right: Column[] = [];
    arr.forEach((item) => {
        if (item.fixed === 'left') {
            lefts.push(item);
        } else if (item.fixed === 'right') {
            right.push(item);
        } else {
            centers.push(item);
        }
    });
    return [
        ...lefts.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
        ...centers.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
        ...right.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
    ];
}
function calCrossSpan(arr: Column[] = [], maxRow: number = 1, level: number = 0): Column[] {
    return arr.map((config) => {
        if (config.children) {
            let colspan = 0;
            let fixed = config.fixed;
            config.children.forEach((item) => {
                item.fixed = fixed;
            });
            const children = calCrossSpan(config.children, maxRow - 1, level + 1);
            if (children) {
                children.forEach((item) => {
                    colspan += item.colspan ?? 0;
                });
            }
            return {
                ...config,
                width: config.width,
                level,
                rowspan: 1,
                colspan,
                children: children.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
            };
        }
        return {
            ...config,
            level,
            rowspan: maxRow,
            colspan: 1,
        };
    });
}
function toLeaf(arr: Column[] = []): Column[] {
    let tmp: Column[] = [];
    arr.forEach((item) => {
        if (item.children) {
            tmp = tmp.concat(toLeaf(item.children));
        } else {
            tmp.push(item);
        }
    });
    return tmp;
}

function filterHiddenColumns(columns: Column[]): Column[] {
    return columns
        .filter((col) => !col.hide) // 先过滤掉自己 hide 的列
        .map((col: Column) => {
            // 如果有子列
            if (Array.isArray(col.children) && col.children.length > 0) {
                return {
                    ...col,
                    children: filterHiddenColumns(col.children), // 递归处理
                };
            }
            return { ...col };
        });
}

type DebouncedFunction<F extends (...args: any[]) => any> = (...args: Parameters<F>) => void;
function debounce<F extends (...args: any[]) => any>(func: F, delay: number): DebouncedFunction<F> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return function (...args: Parameters<F>): void {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}
const regUniversalNewLine = /^(\r\n|\n\r|\r|\n)/;
const regNextCellNoQuotes = /^[^\t\r\n]+/;
const regNextEmptyCell = /^\t/;
/**
 * @decodeSpreadsheetStr
 * @desc Decode spreadsheet string into array.  refer from http://github.com/warpech/sheetclip/
 * @param {string} str The string to parse.
 * @returns {array}
 */
function decodeSpreadsheetStr(str: string) {
    let arr = [['']];

    if (str.length === 0) {
        return arr;
    }

    let column = 0;
    let row = 0;
    let lastLength;

    while (str.length > 0) {
        if (lastLength === str.length) {
            // In the case If in last cycle we didn't match anything, we have to leave the infinite loop
            break;
        }

        lastLength = str.length;

        if (str.match(regNextEmptyCell)) {
            str = str.replace(regNextEmptyCell, '');

            column += 1;
            arr[row][column] = '';
        } else if (str.match(regUniversalNewLine)) {
            str = str.replace(regUniversalNewLine, '');
            column = 0;
            row += 1;

            arr[row] = [''];
        } else {
            let nextCell = '';

            if (str.startsWith('"')) {
                let quoteNo = 0;
                let isStillCell = true;

                while (isStillCell) {
                    const nextChar = str.slice(0, 1);

                    if (nextChar === '"') {
                        quoteNo += 1;
                    }

                    nextCell += nextChar;

                    str = str.slice(1);

                    if (str.length === 0 || (str.match(/^[\t\r\n]/) && quoteNo % 2 === 0)) {
                        isStillCell = false;
                    }
                }

                nextCell = nextCell
                    .replace(/^"/, '')
                    .replace(/"$/, '')
                    .replace(/["]*/g, (match) => new Array(Math.floor(match.length / 2)).fill('"').join(''));
            } else {
                const matchedText = str.match(regNextCellNoQuotes);

                nextCell = matchedText ? matchedText[0] : '';
                str = str.slice(nextCell.length);
            }

            arr[row][column] = nextCell;
        }
    }
    // 去除 excel 最后一个多余的换行数据
    if (Array.isArray(arr) && arr.length > 1) {
        if (arr[arr.length - 1].length === 1 && arr[arr.length - 1][0] === '') {
            arr = arr.slice(0, arr.length - 1);
        }
    }

    return arr;
}

/**
 * @decodeSpreadsheetStr
 * @desc encode array to spreadsheet string.  refer from http://github.com/warpech/sheetclip/
 * @param {array} str The string to parse.
 * @returns {string}
 */
function encodeToSpreadsheetStr(arr: string[][]) {
    let r;
    let rLen;
    let c;
    let cLen;
    let str = '';
    let val;

    for (r = 0, rLen = arr.length; r < rLen; r += 1) {
        cLen = arr[r].length;

        for (c = 0; c < cLen; c += 1) {
            if (c > 0) {
                str += '\t';
            }
            val = arr[r][c];

            if (typeof val === 'string') {
                if (val.indexOf('\n') > -1) {
                    str += `"${val.replace(/"/g, '""')}"`;
                } else {
                    str += val;
                }
            } else if (val === null || val === void 0) {
                // void 0 resolves to undefined
                str += '';
            } else {
                str += val;
            }
        }

        if (r !== rLen - 1) {
            str += '\n';
        }
    }

    return str;
}
// 获取合并单元格的spanArr,针对行数据相同key合并
function getSpanArrByRow(list: any, key: string, relationRowKeys: string[] = []) {
    let contactDot = 0;
    const spanArr: number[] = [];
    list.forEach((item: any, index: number) => {
        if (index === 0) {
            spanArr.push(1);
        } else {
            const curValue = relationRowKeys.reduce((acc, key) => `${acc}${item[key] ?? ''}`, '') || item[key];
            const pValue =
                relationRowKeys.reduce((acc, key) => `${acc}${list[index - 1][key] ?? ''}`, '') || list[index - 1][key];
            if (curValue === pValue) {
                spanArr[contactDot] += 1;
                spanArr.push(0);
            } else {
                spanArr.push(1);
                contactDot = index;
            }
        }
    });
    return spanArr;
}
function getSpanObjByColumn(row: any, columns: any) {
    let keyPre = '';
    let keyDot = '';
    const spanObj: any = {};
    columns.forEach((item: any, index: number) => {
        if (index === 0) {
            keyPre = item.key;
            keyDot = item.key;
            spanObj[item.key] = 1;
        } else {
            // eslint-disable-next-line no-undef
            if (row[item.key] === row[keyPre]) {
                spanObj[item.key] = 0;
                spanObj[keyDot] += 1;
            } else {
                spanObj[item.key] = 1;
                keyPre = item.key;
                keyDot = item.key;
            }
        }
    });
    return spanObj;
}
// 合并行单元格
function mergeRowCell(params: SpanParams, mergeRowkey: string, relationRowKeys: string[] = []) {
    // 合并单元格
    const { visibleRows, rowIndex, headIndex } = params;
    const spanArr = getSpanArrByRow(visibleRows, mergeRowkey, relationRowKeys);
    if (spanArr[rowIndex - headIndex] === 0) {
        return {
            rowspan: 0,
            colspan: 0,
            relationRowKeys,
            mergeRow: true,
        };
    }
    return {
        rowspan: spanArr[rowIndex - headIndex],
        colspan: 1,
        relationRowKeys,
        mergeRow: true,
    };
}
function mergeColCell(params: SpanParams, mergeColKeys: string[] = []) {
    const { column, row, visibleLeafColumns } = params;
    const columns = visibleLeafColumns.filter((item) => mergeColKeys.includes(item.key));
    // 合并动态列单元格
    if (mergeColKeys.includes(column.key)) {
        const spanObj = getSpanObjByColumn(row, columns);
        if (spanObj[column.key] === 0) {
            return {
                rowspan: 0,
                colspan: 0,
                relationColKeys: mergeColKeys,
                mergeCol: true,
            };
        }
        return {
            rowspan: 1,
            colspan: spanObj[column.key],
            relationColKeys: mergeColKeys,
            mergeCol: true,
        };
    }
}
/**
 * 获取某个 CSS 变量的实际值
 * @param name 变量名（可以带或不带前缀，例如 "color-primary" 或 "--color-primary"）
 * @param el 可选元素，默认为 document.documentElement
 * @returns CSS 变量的计算值（如 "#1e90ff"）
 */
function getCssVar(name: string, el: HTMLElement = document.documentElement): string {
    const key = name.startsWith('--') ? name : `--${name}`;
    const styles = getComputedStyle(el);
    return styles.getPropertyValue(key).trim();
}

/**
 * 解析日期字符串，支持多种常见格式
 * @param dateStr 日期字符串
 * @returns Date 对象
 */
function parseDate(dateStr: any): Date {
    if (!dateStr) return new Date(0);

    // 如果是数字（时间戳），直接创建Date对象
    if (typeof dateStr === 'number') {
        return new Date(dateStr);
    }

    const str = String(dateStr).trim();

    // 尝试直接解析
    const directDate = new Date(str);
    if (!isNaN(directDate.getTime())) {
        return directDate;
    }

    // 支持多种常见格式
    const patterns = [
        // YYYY-MM-DD
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        // YYYY/MM/DD
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
        // YYYY.MM.DD
        /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/,
        // DD-MM-YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        // DD/MM/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // DD.MM.YYYY
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
        // MM-DD-YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        // MM/DD/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // MM.DD.YYYY
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
        // YYYYMMDD
        /^(\d{4})(\d{2})(\d{2})$/,
        // 带时间的格式 YYYY-MM-DD HH:mm:ss
        /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/,
        // 带时间的格式 YYYY/MM/DD HH:mm:ss
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/,
    ];

    for (const pattern of patterns) {
        const match = str.match(pattern);
        if (match) {
            const groups = match.slice(1).map(Number);

            if (
                pattern.source.includes('YYYY-MM-DD') ||
                pattern.source.includes('YYYY/MM/DD') ||
                pattern.source.includes('YYYY.MM.DD')
            ) {
                // YYYY-MM-DD 格式
                const [year, month, day, hour = 0, minute = 0, second = 0] = groups;
                return new Date(year, month - 1, day, hour, minute, second);
            } else if (
                pattern.source.includes('DD-MM-YYYY') ||
                pattern.source.includes('DD/MM/YYYY') ||
                pattern.source.includes('DD.MM.YYYY')
            ) {
                // DD-MM-YYYY 格式
                const [day, month, year, hour = 0, minute = 0, second = 0] = groups;
                return new Date(year, month - 1, day, hour, minute, second);
            } else if (
                pattern.source.includes('MM-DD-YYYY') ||
                pattern.source.includes('MM/DD/YYYY') ||
                pattern.source.includes('MM.DD.YYYY')
            ) {
                // MM-DD-YYYY 格式
                const [month, day, year, hour = 0, minute = 0, second = 0] = groups;
                return new Date(year, month - 1, day, hour, minute, second);
            } else if (pattern.source.includes('YYYYMMDD')) {
                // YYYYMMDD 格式
                const [year, month, day] = groups;
                return new Date(year, month - 1, day);
            }
        }
    }

    // 如果都不匹配，返回无效日期
    return new Date(NaN);
}

/**
 * 比较两个日期值，支持多种常见格式
 * @param a 第一个日期值
 * @param b 第二个日期值
 * @returns 比较结果：-1 表示 a < b，0 表示 a = b，1 表示 a > b
 */
function compareDates(a: any, b: any): number {
    const aDate = parseDate(a);
    const bDate = parseDate(b);

    if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) {
        return 0; // 都是无效日期
    }
    if (isNaN(aDate.getTime())) {
        return -1; // a 是无效日期，排在前面
    }
    if (isNaN(bDate.getTime())) {
        return 1; // b 是无效日期，排在前面
    }

    return aDate.getTime() - bDate.getTime();
}

export {
    debounce,
    throttle,
    generateShortUUID,
    toLeaf,
    sortFixed,
    calCrossSpan,
    getMaxRow,
    decodeSpreadsheetStr,
    encodeToSpreadsheetStr,
    mergeRowCell,
    mergeColCell,
    getSpanArrByRow,
    getSpanObjByColumn,
    getCssVar,
    parseDate,
    compareDates,
    filterHiddenColumns,
};
