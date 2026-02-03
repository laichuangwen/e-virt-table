import CellImage from './CellImage';
import Context from './Context';
import { CellType, Fixed } from './types';

export default class BaseCell {
    ctx: Context;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    visibleWidth = 0;
    visibleHeight = 0;
    fixed?: Fixed;
    cellType: CellType;
    drawX = 0;
    drawY = 0;
    cellImages: Map<string, CellImage> = new Map();
    constructor(ctx: Context, x: number, y: number, width: number, height: number, cellType: CellType, fixed?: Fixed) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fixed = fixed;
        this.cellType = cellType;
    }
    isHorizontalVisible() {
        if (this.fixed) {
            return true;
        }
        const { stageWidth, fixedLeftWidth, scrollX, fixedRightWidth } = this.ctx;
        const offsetWidth = stageWidth;
        return !(
            this.x + this.width - fixedLeftWidth - scrollX <= 0 || this.x - scrollX >= offsetWidth - fixedRightWidth
        );
    }
    isVerticalVisible() {
        const { stageHeight, scrollY } = this.ctx;
        const offsetHeight = stageHeight;
        return !(this.y + this.height - scrollY <= 0 || this.y - scrollY >= offsetHeight);
    }
    getDrawX() {
        if (this.fixed === 'left') {
            return this.x;
        }
        if (this.fixed === 'right') {
            // 可见区域宽度 -到右边界的距离即(表头宽度 - x坐标)
            const {
                stageWidth,
                config: { SCROLLER_TRACK_SIZE },
            } = this.ctx;
            const x = stageWidth - (this.ctx.header.width - this.x) - SCROLLER_TRACK_SIZE;
            return x;
        }
        return this.x - this.ctx.scrollX;
    }
    getDrawY() {
        if (this.cellType === 'header') {
            return this.y;
        }
        // footer固定时
        if (this.cellType === 'footer' && this.ctx.config.FOOTER_FIXED) {
            return this.y;
        }
        return this.y - this.ctx.scrollY;
    }
    getLeftFixedX() {
        return this.x - this.ctx.scrollX;
    }
    isInside(x: number, y: number) {
        return x >= this.drawX && x <= this.drawX + this.width && y >= this.drawY && y <= this.drawY + this.height;
    }
    /**
     * 判断是否在可见区域,合并单元格用
     * @param x 
     * @param y 
     * @returns 
     */
    isInsideVisible(x: number, y: number) {
        return x >= this.drawX && x <= this.drawX + this.visibleWidth && y >= this.drawY && y <= this.drawY + this.visibleHeight && this.isInside(x, y);
    }
    setImage(key: string, image: CellImage) {
        this.cellImages.set(key, image);
    }
    getImages() {
        return this.cellImages;
    }
    getImage(key: string) {
        return this.cellImages.get(key);
    }
    isImageInside(key: string, e: MouseEvent) {
        const { offsetX, offsetY } = this.ctx.getOffset(e);
        const image = this.getImage(key);
        if (image) {
            return image.isInside(offsetX, offsetY);
        }
        return false;
    }
}
