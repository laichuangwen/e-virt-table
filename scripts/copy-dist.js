const fs = require('fs-extra');
const path = require('path');

// 目标目录
const targetDir = path.join(process.cwd(), 'docs', 'public');
const sourceDir = path.join(process.cwd(), 'dist');

console.log('源目录:', sourceDir);
console.log('目标目录:', targetDir);

// 检查源目录是否存在
if (!fs.existsSync(sourceDir)) {
    console.error(`错误：源目录不存在: ${sourceDir}`);
    console.log('请先运行构建命令生成dist目录');
    process.exit(1);
}

// 删除目标目录下的dist文件夹（如果存在）
const distInTarget = path.join(targetDir, 'dist');
if (fs.existsSync(distInTarget)) {
    fs.removeSync(distInTarget);
    console.log(`删除目录: ${distInTarget}`);
}

// 确保目标目录存在
fs.ensureDirSync(targetDir);
console.log(`确保目录存在: ${targetDir}`);

// 复制整个dist目录
function copyDistFiles() {
    try {
        // 使用fs-extra的copySync方法复制整个目录
        fs.copySync(sourceDir, distInTarget, {
            filter: (src, dest) => {
                // 排除.map文件和lib目录
                const fileName = path.basename(src);
                const relativePath = path.relative(sourceDir, src);
                
                // 排除.map文件
                if (fileName.endsWith('.map')) {
                    return false;
                }
                
                // 排除lib目录
                if (relativePath.startsWith('lib') || relativePath.startsWith('lib/')) {
                    return false;
                }
                
                return true;
            }
        });
        
        console.log(`\n完成！已复制dist目录到 ${distInTarget}`);
        
        // 列出复制的文件
        const copiedFiles = [];
        function listFiles(dir, prefix = '') {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    copiedFiles.push(`${prefix}${item}/`);
                    listFiles(fullPath, prefix + '  ');
                } else {
                    copiedFiles.push(`${prefix}${item}`);
                }
            });
        }
        
        if (fs.existsSync(distInTarget)) {
            console.log('\n复制的文件列表:');
            listFiles(distInTarget);
            copiedFiles.forEach(file => console.log(file));
        }
        
    } catch (error) {
        console.error('复制文件时出错:', error.message);
        process.exit(1);
    }
}

// 执行复制
copyDistFiles();
