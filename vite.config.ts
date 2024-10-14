import { defineConfig } from "vite";
import copy from "rollup-plugin-copy";
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts", // 入口文件
      name: "EVirtTable",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs", "umd"], // 生成 ES Module 和 CommonJS 格式
    },
    sourcemap: true, // 生成 sourcemap 文件
    rollupOptions: {
      plugins: [
        copy({
          targets: [
            { src: "dist/index.umd.js", dest: "./docs/public" }, // 指定需要复制的路径
          ],
          hook: "writeBundle", // 确保在打包输出后进行复制
          overwrite: true, // 设置为 true 来覆盖目标目录中已有的文件
        }),
      ],
    },
  },
});
