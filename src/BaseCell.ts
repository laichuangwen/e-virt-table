import Context from "./Context";
import { Fixed } from "./types";

export default class BaseCell {
  ctx: Context;
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  fixed: Fixed | undefined;
  constructor(
    ctx: Context,
    x: number,
    y: number,
    width: number,
    height: number,
    fixed: Fixed
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fixed = fixed;
  }
  isHorizontalVisible() {
    if (this.fixed) {
      return true;
    }
    const { target, fixedLeftWidth, scrollX, fixedRightWidth } = this.ctx;
    const offsetWidth = target.offsetWidth;
    return !(
      this.x + this.width - fixedLeftWidth - scrollX <= 0 ||
      this.x - scrollX >= offsetWidth - fixedRightWidth
    );
  }
  isVerticalVisible() {
    const { target, scrollY } = this.ctx;
    const offsetHeight = target.offsetHeight;
    return !(
      this.y + this.height - scrollY <= 0 || this.y - scrollY >= offsetHeight
    );
  }
  getDrawX() {
    if (this.fixed === "left") {
      return this.x;
    }
    if (this.fixed === "right") {
      // 可见区域宽度 -到右边界的距离即(表头宽度 - x坐标)
      const x = this.ctx.header.visibleWidth - (this.ctx.header.width - this.x);
      return x;
    }
    return this.x - this.ctx.scrollX;
  }
  getDrawY() {
    return this.y - this.ctx.scrollY;
  }
  getLeftFixedX() {
    return this.x - this.ctx.scrollX;
  }
  /**
   * RightFixed时相对StageX
   * @returns
   */
  getRightFixedX() {
    // const { SCROLLER_TRACK_SIZE } = this.grid.config;
    // if (!this.grid.header) {
    //   return 0;
    // }
    // return (
    //   this.grid.header.width -
    //   this.x -
    //   this.grid.layer.x() -
    //   (this.grid.header.width - this.x) +
    //   this.grid.stage.width() -
    //   SCROLLER_TRACK_SIZE -
    //   (this.grid.header.width - this.x)
    // );
  }
}
