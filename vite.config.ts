import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [cssInjectedByJsPlugin()],
    build: {
        lib: {
            entry: 'src/index.ts', // 入口文件
            name: 'EVirtTable',
            fileName: (format) => `index.${format}.js`,
            formats: ['es', 'cjs', 'umd'], // 生成 ES Module 和 CommonJS 格式
        },
        sourcemap: true, // 生成 sourcemap 文件
    },
});
