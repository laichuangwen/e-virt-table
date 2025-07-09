import { Column } from './types';

export type Rule = {
    required?: boolean;
    pattern?: RegExp;
    validator?: RuleValidator;
    message?: string;
};
export type RuleParam = {
    field: string; // 兼容旧版
    fieldValue: string; // 兼容旧版
    value: string;
    column: Column;
    colIndex: number;
    rowIndex: number;
    row: any;
    key: string;
    rowKey: string;
} & Rule;
export type RuleValidator = (rule: Rule, value: any, callback: (message?: string) => void) => void;
export type Rules = Rule[];

export type ValidateResult = RuleParam[];

export default class Validator {
    private rules: Rules | Rule;

    constructor(rules: Rules | Rule) {
        this.rules = rules;
    }

    validate(params: RuleParam) {
        const errors: ValidateResult = [];
        const { column, row, key, rowKey, colIndex, rowIndex, value, field, fieldValue } = params;
        if (!Array.isArray(this.rules)) {
            this.rules = [this.rules];
        }
        for (const rule of this.rules) {
            if (rule.validator) {
                const ruleParam: RuleParam = {
                    field,
                    fieldValue,
                    value,
                    column,
                    colIndex,
                    rowIndex,
                    row,
                    key,
                    rowKey,
                    ...rule,
                };
                rule.validator(ruleParam, value, (message) => {
                    if (message) {
                        errors.push({
                            ...ruleParam,
                            message: message,
                        });
                    }
                });
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push({
                    value,
                    column,
                    row,
                    key,
                    rowKey,
                    colIndex,
                    rowIndex,
                    field,
                    fieldValue,
                    message: rule.message || `${key} is pattern validation error`,
                });
            }
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push({
                    value,
                    column,
                    row,
                    key,
                    rowKey,
                    colIndex,
                    rowIndex,
                    field,
                    fieldValue,
                    message: rule.message || `${key} is required`,
                });
            }
        }
        return errors;
    }
}
