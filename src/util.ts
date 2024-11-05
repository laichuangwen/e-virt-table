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
    return [...lefts, ...centers, ...right];
}
function calCrossSpan(arr: Column[] = [], maxRow: number = 1, level: number = 0): Column[] {
    return arr.map((config, index) => {
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
            sort: index,
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
export { debounce, throttle, generateShortUUID, toLeaf, sortFixed, calCrossSpan, getMaxRow };
