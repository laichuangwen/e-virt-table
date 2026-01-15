import { useData } from 'vitepress';

const messages = {
    'zh-CN': {
        copySuccess: '复制成功',
        fullScreen: '全屏',
        copyCode: '复制代码',
        viewSource: '查看源代码',
        onlineRun: '在线运行',
        hideSource: '隐藏源代码',
    },
    'en-US': {
        copySuccess: 'Copy Success',
        fullScreen: 'Full Screen',
        copyCode: 'Copy Code',
        viewSource: 'View Source',
        onlineRun: 'Online Run',
        hideSource: 'Hide Source',
    },
} as const;

type Lang = keyof typeof messages;
type MessageKey = keyof (typeof messages)['en-US'];

export function useI18n() {
    const { lang } = useData();
    const t = (key: MessageKey): string => {
        const currentLang = (lang.value as Lang) || 'en-US';
        return messages[currentLang]?.[key] ?? messages['en-US']?.[key] ?? '';
    };

    return { t, lang };
}
