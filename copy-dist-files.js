const fs = require('fs');
const path = require('path');

// 目标目录
const targetDir = path.join(__dirname, 'docs', 'public', 'js');
const sourceDir = path.join(__dirname, 'dist');

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`创建目录: ${targetDir}`);
}

// 获取dist目录下的所有文件
function copyDistFiles() {
    try {
        const files = fs.readdirSync(sourceDir);
        let copiedCount = 0;
        
        files.forEach(file => {
            const filePath = path.join(sourceDir, file);
            const stats = fs.statSync(filePath);
            
            // 只处理文件，不处理目录
            if (stats.isFile()) {
                // 只复制.js文件，排除.map文件
                if (file.endsWith('.js') && !file.endsWith('.map')) {
                    // 检查文件路径是否包含lib
                    if (!filePath.includes(path.sep + 'lib' + path.sep)) {
                        const targetPath = path.join(targetDir, file);
                        fs.copyFileSync(filePath, targetPath);
                        console.log(`复制文件: ${file} -> docs/public/js/${file}`);
                        copiedCount++;
                    }
                }
            }
        });
        
        console.log(`\n完成！共复制了 ${copiedCount} 个文件到 docs/public/js/ 目录`);
        
    } catch (error) {
        console.error('复制文件时出错:', error.message);
        process.exit(1);
    }
}

// 执行复制
copyDistFiles(); 