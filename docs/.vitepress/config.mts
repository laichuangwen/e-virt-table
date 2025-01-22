import { defineConfig } from 'vitepress';
import { markdownConfig } from './plugins/markdown-plugin';
import middlewaresPlugin from './plugins/middlewares-plugin';
// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/e-virt-table/',
    outDir: './.vitepress/dist',
    appearance: false,
    title: 'e-virt-table',
    description:
        'A powerful data table based on canvas. You can use it as data grid、Microsoft Excel or Google sheets. It supports virtual scroll、cell edit etc.',
    markdown: {
        config: markdownConfig,
    },
    vite: {
        plugins: [middlewaresPlugin()],
    },
    locales: {
        zh: {
            label: '中文',
            lang: 'zh',
            themeConfig: {
                // https://vitepress.dev/reference/default-theme-config
                search: {
                    provider: 'local',
                },
                socialLinks: [
                    { icon: 'github', link: 'https://github.com/laichuangwen/e-virt-table' }, // 替换为您的 GitHub 仓库链接
                ],
                sidebar: [
                    {
                        text: '简介',
                        link: '/zh/intro',
                    },
                    {
                        text: '快速开始',
                        link: '/zh/start',
                    },
                    {
                        text: 'API',
                        link: '/zh/api',
                    },
                    {
                        text: '表格例子',
                        items: [
                            { text: '虚拟滚动', link: '/zh/table/virtualScroll' },
                            { text: '过滤&排序', link: '/zh/table/filter' },
                            { text: '滚动条', link: '/zh/table/scroller' },
                            { text: '主题', link: '/zh/table/theme' },
                            { text: '宽度', link: '/zh/table/width' },
                            { text: '高度', link: '/zh/table/height' },
                            { text: '固定', link: '/zh/table/fixed' },
                            { text: '空数据', link: '/zh/table/empty' },
                            { text: '高亮', link: '/zh/table/highlight' },
                            { text: '对齐', link: '/zh/table/align' },
                            { text: '索引', link: '/zh/table/row-index' },
                            { text: '多选', link: '/zh/table/selection' },
                            { text: '树形', link: '/zh/table/tree' },
                            { text: '溢出提示', link: '/zh/table/tooltip' },
                            { text: '多级表头', link: '/zh/table/header' },
                            { text: 'footer合计', link: '/zh/table/footer' },
                            { text: '合并', link: '/zh/table/span' },
                            { text: '格式化', link: '/zh/table/formatter' },
                            { text: '样式', link: '/zh/table/cell-style' },
                            { text: '编辑', link: '/zh/table/readonly' },
                            { text: '校验', link: '/zh/table/validator' },
                            { text: '选择', link: '/zh/table/selector' },
                            { text: '填充', link: '/zh/table/autofill' },
                            { text: '键盘', link: '/zh/table/keyboard' },
                            { text: '复制&粘贴', link: '/zh/table/paste' },
                            { text: '右键菜单', link: '/zh/table/context-menu' },
                            { text: '历史回退', link: '/zh/table/history' },
                            { text: '插槽（覆盖层）', link: '/zh/table/overlayer' },
                        ],
                    },
                    {
                        text: '框架例子',
                        items: [
                            {
                                text: 'Vue2',
                                link: '/zh/framework/vue2',
                            },
                            {
                                text: 'Vue3',
                                link: '/zh/framework/vue3',
                            },
                            {
                                text: 'React',
                                link: '/zh/framework/react',
                            },
                        ],
                    },
                ],
            },
        },
        en: {
            label: 'English',
            lang: 'en',
            themeConfig: {
                // https://vitepress.dev/reference/default-theme-config

                sidebar: [
                    {
                        text: 'Introduction',
                        link: '/en/intro',
                    },
                    {
                        text: 'Quick Start',
                        link: '/en/start',
                    },
                    {
                        text: 'API',
                        link: '/en/api',
                    },
                    {
                        text: 'Table',
                        items: [
                            { text: 'Virtual Scroll', link: '/en/table/virtualScroll' },
                            { text: 'filter&sort', link: '/en/table/filter' },
                            { text: 'Scrollbar', link: '/en/table/scroller' },
                            { text: 'Theme', link: '/en/table/theme' },
                            { text: 'Width', link: '/en/table/width' },
                            { text: 'Height', link: '/en/table/height' },
                            { text: 'Fixed', link: '/en/table/fixed' },
                            { text: 'Empty', link: '/en/table/empty' },
                            { text: 'Highlight', link: '/en/table/highlight' },
                            { text: 'Align', link: '/en/table/align' },
                            { text: 'Row Index', link: '/en/table/row-index' },
                            { text: 'Selection', link: '/en/table/selection' },
                            { text: 'Tree', link: '/en/table/tree' },
                            { text: 'Overflow Tooltip', link: '/en/table/tooltip' },
                            { text: 'Header Grouping', link: '/en/table/header' },
                            { text: 'Footer', link: '/en/table/footer' },
                            { text: 'Merge', link: '/en/table/span' },
                            { text: 'Formatter', link: '/en/table/formatter' },
                            { text: 'Cell Style', link: '/en/table/cell-style' },
                            { text: 'Edit', link: '/en/table/readonly' },
                            { text: 'Validation', link: '/en/table/validator' },
                            { text: 'Selector', link: '/en/table/selector' },
                            { text: 'Autofill', link: '/en/table/autofill' },
                            { text: 'Keyboard', link: '/en/table/keyboard' },
                            { text: 'Copy & Paste', link: '/en/table/paste' },
                            { text: 'Context Menu', link: '/en/table/context-menu' },
                            { text: 'History', link: '/en/table/history' },
                            { text: 'Slot (Overlay)', link: '/en/table/overlayer' },
                        ],
                    },
                    {
                        text: 'Framework',
                        items: [
                            { text: 'Vue2', link: '/en/framework/vue2' },
                            { text: 'Vue3', link: '/en/framework/vue3' },
                            { text: 'React', link: '/en/framework/react' },
                        ],
                    },
                ],

                socialLinks: [
                    {
                        icon: 'github',
                        link: 'https://github.com/laichuangwen/e-virt-table',
                    },
                ],
            },
        },
    },
});
