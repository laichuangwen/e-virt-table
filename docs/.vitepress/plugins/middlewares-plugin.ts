import express from 'express';
import path from 'path';
// examples 目录作为静态资源目录, 仅在开发环境启用,demo 例子的源码文件放在 examples 目录下
export default function PublicDirPlugin() {
    return {
        name: 'public-examples-dir',
        configureServer(server) {
            if (process.env.NODE_ENV !== 'development') return; // 仅在开发环境启用
            const dir = 'examples';
            const resolvedPath = path.resolve(process.cwd(), dir);
            server.middlewares.use(`/${dir}`, express.static(resolvedPath));
        },
    };
}
