import Cell from './Cell';
import Context from './Context';
import Row from './Row';
import type { Render } from './types';

/**
 * 扩展行类 - 用于渲染扩展内容
 * 与普通行不同，扩展行占据整个可视宽度，不受固定列影响
 */
export default class ExtendRow extends Row {
    extendColKey: string;
    extendRender: Render;
    sourceRowKey: string;

    constructor(
        ctx: Context,
        sourceRowKey: string,
        extendColKey: string,
        extendRender: Render,
        sourceRowIndex: number,
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        data: any,
    ) {
        // 使用 .5 的 rowIndex 来表示扩展行
        // 例如：行1的扩展行为1.5，行2的扩展行为2.5
        const extendRowIndex = sourceRowIndex + 0.5;
        
        // 使用特殊的rowKey来标识这是一个扩展行
        super(ctx, extendRowIndex, x, y, width, height, data, 'extend');
        this.sourceRowKey = sourceRowKey;
        this.extendColKey = extendColKey;
        this.extendRender = extendRender;
        
        // 扩展行的rowKey基于源行
        this.rowKey = `${sourceRowKey}_extend_${extendColKey}`;
        
        // 确保 sourceRowKey 不为空
        if (!sourceRowKey) {
            console.error('❌ ExtendRow 创建失败: sourceRowKey 为空');
            throw new Error('ExtendRow 创建失败: sourceRowKey 不能为空');
        }

        // 创建一个占据整行宽度的单元格来渲染扩展内容
        const extendCell = new Cell(
            this.ctx,
            this.rowIndex,
            0, // 使用有效的colIndex，避免-1导致的问题
            0, // x相对于ExtendRow
            0, // y相对于ExtendRow
            this.width, // 占据ExtendRow的整个宽度
            this.height, // 初始高度
            {
                key: `${this.extendColKey}_extend_content`,
                title: '',
                render: this.extendRender,
                autoRowHeight: true, // 启用自动高度
                // 添加特殊标记，表示这是扩展内容
                colspan: 999, // 使用大的colspan确保占据整行
            },
            this.data,
            'body'
        );
        
        // 在构造函数调用后立即设置扩展内容标记
        extendCell.isExtendContent = true;
        
        // 设置扩展单元格的特殊样式，确保内容不超出
        extendCell.style = {
            ...extendCell.style,
            overflow: 'hidden', // 防止内容超出
            boxSizing: 'border-box', // 包含边框和内边距
        };
        
        // 重新更新单元格，确保扩展内容标记生效
        extendCell.update();
        
        // 扩展行只有一个单元格，且不受固定列影响
        this.cells.push(extendCell);
        this.noFixedCells.push(extendCell); // 扩展内容不固定
        this.calculatedHeightCells.push(extendCell); // 用于自动行高计算
        
        this.update();
    }

    /**
     * 更新扩展行
     */
    update() {
        // 更新单元格的位置和大小
        this.cells.forEach(cell => {
            cell.x = this.x;
            cell.y = this.y;
            cell.width = this.width;
            cell.height = this.height;
            cell.update();
        });
        
        // 更新计算高度
        this.updateCalculatedHeight();
        
        // 如果计算高度发生变化，需要通知 Body 更新
        if (this.calculatedHeight !== this.height && this.calculatedHeight > 0) {
            const oldHeight = this.height;
            const newHeight = this.calculatedHeight;
            
            // 检查高度变化是否显著（避免微小变化导致的循环）
            const heightDiff = Math.abs(newHeight - oldHeight);
            if (heightDiff < 1) {
                return; // 忽略小于1px的变化
            }
            
            this.height = newHeight;
            
            // 使用 setTimeout 避免同步循环
            setTimeout(() => {
                this.ctx.emit('extendRowHeightChange', {
                    sourceRowKey: this.sourceRowKey,
                    extendRowKey: this.rowKey,
                    oldHeight,
                    newHeight: this.height,
                    rowIndex: Math.floor(this.rowIndex)
                });
            }, 0);
        }
    }

    /**
     * 绘制扩展行的中心内容
     */
    drawCenter() {
        this.noFixedCells.forEach(cell => cell.draw());
    }

    /**
     * 扩展行没有固定列容器
     */
    drawFixedContainer() {
        // 扩展行不需要固定列容器
    }

    /**
     * 扩展行没有固定列内容
     */
    drawFixed() {
        // 扩展行不需要固定列内容
    }

    /**
     * 绘制扩展行的容器背景
     */
    drawContainer() {
        const { paint, config: { BORDER_COLOR, BORDER } } = this.ctx;
        
        // ExtendRow 使用整个可视宽度，不受固定列限制
        const fullWidth = this.ctx.body.visibleWidth;
        
        // 绘制扩展行的背景和边框，占据整个可视宽度
        paint.drawRect(0, this.y, fullWidth, this.height, {
            borderColor: BORDER ? BORDER_COLOR : '#e0e0e0', // 确保有边框
            fillColor: '#f8f9fa', // 扩展行使用稍微不同的背景色
            borderWidth: 1,
        });
    }
}
