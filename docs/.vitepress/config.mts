import { defineConfig } from 'vitepress';
import { markdownConfig } from './plugins/markdown-plugin';
// https://vitepress.dev/reference/site-config
export default defineConfig({
    appearance: false,
    title: 'e-virt-table',
    description: '一个canvas实现的数据表格',
    markdown: {
        config: markdownConfig,
    },
    locales: {
        root: {
            label: '中文',
            lang: 'zh',
            link: '/zh/intro',
            themeConfig: {
                // https://vitepress.dev/reference/default-theme-config
                nav: [{ text: '文档', link: '/zh/intro' }],

                sidebar: [
                    {
                        text: '开发调试',
                        link: '/zh/develop',
                    },
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
                        text: '例子',
                        items: [
                            { text: '虚拟滚动', link: '/zh/examples/virtualScroll' },
                            { text: '滚动条', link: '/zh/examples/scroller' },
                            { text: '宽度', link: '/zh/examples/width' },
                            { text: '高度', link: '/zh/examples/height' },
                            { text: '固定', link: '/zh/examples/fixed' },
                            { text: '空数据', link: '/zh/examples/empty' },
                            { text: '高亮', link: '/zh/examples/highlight' },
                            { text: '对齐', link: '/zh/examples/align' },
                            { text: '索引', link: '/zh/examples/index' },
                            { text: '多选', link: '/zh/examples/selection' },
                            { text: '树形', link: '/zh/examples/tree' },
                            { text: '溢出提示', link: '/zh/examples/tooltip' },
                            { text: '表头', link: '/zh/examples/header' },
                            { text: 'footer合计', link: '/zh/examples/footer' },
                            { text: '单元格合并', link: '/zh/examples/span' },
                            { text: '单元格编辑', link: '/zh/examples/readonly' },
                            { text: '单元格选择', link: '/zh/examples/selector' },
                            { text: '单元格填充', link: '/zh/examples/autofill' },
                            { text: '键盘事件', link: '/zh/examples/keyboard' },
                            { text: '历史回退', link: '/zh/examples/history' },
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
                nav: [
                    { text: 'Home', link: '/' },
                    { text: '文档', link: '/docs' },
                ],

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
