# 环境变量配置说明

## 概述

本项目使用环境变量来管理不同环境下的JavaScript文件引用路径。

## 环境变量文件

### `.env.development` (开发环境)
```
VITE_JS_REF=/e-virt-table/public/js/index.umd.js
```

### `.env.production` (生产环境)
```
VITE_JS_REF=https://unpkg.com/e-virt-table@1.2.20/dist/index.umd.js
```

## 工作原理

1. **开发环境**: 使用本地复制的JavaScript文件
   - 运行 `pnpm run copy-dist` 将dist文件复制到 `docs/public/js/`
   - 开发时使用本地文件，便于调试

2. **生产环境**: 使用CDN链接
   - 构建时使用unpkg CDN链接
   - 确保生产环境的稳定性和速度

## 使用方法

### 开发环境
```bash
# 1. 复制dist文件到docs/public/js
pnpm run copy-dist

# 2. 启动开发服务器
pnpm run dev:docs
```

### 生产环境
```bash
# 构建文档（会自动使用生产环境的环境变量）
pnpm run build:docs
```

## 文件替换机制

在 `docs/.vitepress/plugins/middlewares-plugin.ts` 中实现了HTML文件的环境变量替换：

- 开发时：自动将HTML文件中的CDN链接替换为本地文件路径
- 构建时：使用生产环境的CDN链接

## 注意事项

1. 确保在开发前运行 `pnpm run copy-dist` 来复制最新的dist文件
2. 环境变量以 `VITE_` 开头才会被Vite识别
3. 修改环境变量后需要重启开发服务器 