import { Column } from './types';

function generateShortUUID(): string {
    return 'xxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function throttle<T extends (...args: any) => any>(func: T, delay: number): T {
    let lastCalledTime = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined {
        const now = new Date().getTime();
        const elapsedTime = now - lastCalledTime;

        if (!lastCalledTime || elapsedTime >= delay) {
            func.apply(this, args);
            lastCalledTime = now;
        } else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastCalledTime = new Date().getTime();
                timeoutId = undefined;
            }, delay - elapsedTime);
        }

        return undefined;
    } as T;
}
/**
 * 根据children获取最大深度
 * @param data
 * @returns
 */
function getMaxRow(data: Column[]): number {
    if (data) {
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
        ...lefts.sort((a, b) => a.sort - b.sort),
        ...centers.sort((a, b) => a.sort - b.sort),
        ...right.sort((a, b) => a.sort - b.sort),
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
                    colspan += item.colspan;
                });
            }
            return {
                ...config,
                width: config.width,
                level,
                rowspan: 1,
                colspan,
                children,
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
};
