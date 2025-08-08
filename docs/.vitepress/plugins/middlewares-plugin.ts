import express from 'express';
import path from 'path';
import fs from 'fs';

// 手动加载环境变量
function loadEnvFile(envPath: string) {
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        console.log('[Env Load] Raw content:', content);
        const lines = content.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=');
                    process.env[key] = value;
                    console.log(`[Env Load] Set ${key} = ${value}`);
                }
            }
        });
    } else {
        console.log('[Env Load] File not found:', envPath);
    }
}

// examples 目录作为静态资源目录, 仅在开发环境启用,demo 例子的源码文件放在 examples 目录下
export default function PublicDirPlugin() {
    return {
        name: 'public-examples-dir',
        configureServer(server) {
            if (process.env.NODE_ENV !== 'development') return; // 仅在开发环境启用
            
            // 加载环境变量文件
            const envPath = path.resolve(process.cwd(), '.env.development');
            loadEnvFile(envPath);
            console.log('[Env Load] Loaded environment variables from .env.development');
            console.log('[Env Load] VITE_JS_REF:', process.env.VITE_JS_REF);
            
            const dir = 'examples';
            const resolvedPath = path.resolve(process.cwd(), dir);
            
            // 添加中间件来处理HTML文件中的环境变量替换
            server.middlewares.use(`/${dir}`, (req, res, next) => {
                if (req.url && req.url.endsWith('.html')) {
                    const filePath = path.join(resolvedPath, req.url);
                    if (fs.existsSync(filePath)) {
                        let content = fs.readFileSync(filePath, 'utf-8');
                        
                        // 根据环境变量替换CDN链接
                        const jsRef = process.env.VITE_JS_REF || '/js/index.umd.js';
                        console.log(`[Env Replace] Processing: ${req.url}`);
                        console.log(`[Env Replace] VITE_JS_REF: ${jsRef}`);
                        
                        const originalContent = content;
                        content = content.replace(
                            /https:\/\/unpkg\.com\/e-virt-table\/dist\/index\.umd\.js/g,
                            jsRef
                        );
                        
                        if (originalContent !== content) {
                            console.log(`[Env Replace] Replaced CDN link in: ${req.url}`);
                        }
                        
                        res.setHeader('Content-Type', 'text/html');
                        res.end(content);
                        return;
                    }
                }
                next();
            });
            
            server.middlewares.use(`/${dir}`, express.static(resolvedPath));
        },
    };
}
