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
            link: '/zh/intro',
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
                            { text: '滚动条', link: '/zh/table/scroller' },

                            { text: '宽度', link: '/zh/table/width' },
                            { text: '高度', link: '/zh/table/height' },
                            { text: '固定', link: '/zh/table/fixed' },
                            { text: '空数据', link: '/zh/table/empty' },
                            { text: '高亮', link: '/zh/table/highlight' },
                            { text: '对齐', link: '/zh/table/align' },
                            { text: '索引', link: '/zh/table/index' },
                            { text: '多选', link: '/zh/table/selection' },
                            { text: '树形', link: '/zh/table/tree' },
                            { text: '溢出提示', link: '/zh/table/tooltip' },
                            { text: '表头', link: '/zh/table/header' },
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
            link: '/en/intro',
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
