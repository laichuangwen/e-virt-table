import EVirtTable from './EVirtTable';
import defaultLang from './lang/zh-CN';
export type LangConfig = typeof defaultLang;

export default class Locale {
    private langConfig?: LangConfig;
    use(langConfig: LangConfig) {
        this.langConfig = langConfig;
    }
    getText(key: string) {
        const config = { ...defaultLang };
        // 合并全局默认语言配置
        Object.assign(config, EVirtTable.locale, this.langConfig);
        const text = config[key as keyof LangConfig];
        if (!text) {
            return '';
        }
        return text;
    }
}
