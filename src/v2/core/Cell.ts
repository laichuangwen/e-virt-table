import { CellType, Fixed } from "../../types";
import { CellConfig } from "../types";
import Context from "./Context";
import { Widget } from "./Widget";
export default class Cell extends Widget {
    fixed: Fixed
    cellType: CellType
    constructor(context: Context, config: CellConfig) {
        super(context, config);
        this.fixed = config.fixed;
        this.cellType = config.cellType;
        this.initPosition();
    }
    private initPosition() {
        this.x = this.getDrawX();
        this.y = this.getDrawY();
    }
    update(): void {
        this.initPosition();
        super.update();
    }
    isHorizontalVisible() {
        if (this.fixed) {
            return true;
        }
        const { fixedLeftWidth, fixedRightWidth } = this.context.store;
        const { stageWidth } = this.context;
        return !(
            this.x + this.width - fixedLeftWidth <= 0 || this.x >= stageWidth - fixedRightWidth
        );
    }
    isVerticalVisible() {
        const { stageHeight } = this.context;
        return !(this.y + this.height <= 0 || this.y >= stageHeight);
    }
    private getDrawX() {
        if (this.fixed === 'left') {
            return this.x;
        }
        if (this.fixed === 'right') {
            // 可见区域宽度 -到右边界的距离即(表头宽度 - x坐标)
            const { stageWidth, scrollbarGutter } = this.context;
            const x = stageWidth - scrollbarGutter - (this.context.store.sumWidth - this.x);
            return x;
        }
        return this.x - this.context.scrollX;
    }
    private getDrawY() {
        if (this.cellType === 'header') {
            return this.y;
        }
        // footer固定时
        if (this.cellType === 'footer' && this.context.config.footerFixed) {
            return this.y;
        }
        return this.y - this.context.scrollY;
    }
}