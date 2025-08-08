import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export default function EnvReplacePlugin(): Plugin {
    return {
        name: 'env-replace-plugin',
        transform(code, id) {
            // 只处理HTML文件
            if (!id.endsWith('.html')) return;
            
            // 替换环境变量
            const jsRef = (import.meta as any).env?.VITE_JS_REF || 'https://unpkg.com/e-virt-table/dist/index.umd.js';
            
            // 替换CDN链接
            const transformedCode = code.replace(
                /https:\/\/unpkg\.com\/e-virt-table\/dist\/index\.umd\.js/g,
                jsRef
            );
            
            return {
                code: transformedCode,
                map: null
            };
        },
        // 处理静态HTML文件
        generateBundle(options, bundle) {
            for (const fileName in bundle) {
                const file = bundle[fileName];
                if (file.type === 'asset' && fileName.endsWith('.html')) {
                    const jsRef = process.env.VITE_JS_REF || 'https://unpkg.com/e-virt-table/dist/index.umd.js';
                    
                    if (typeof file.source === 'string') {
                        file.source = file.source.replace(
                            /https:\/\/unpkg\.com\/e-virt-table\/dist\/index\.umd\.js/g,
                            jsRef
                        );
                    }
                }
            }
        }
    };
} 