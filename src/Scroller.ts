import Context from "./Context";
export type ScrollbarType = "horizontal" | "vertical";

class Scrollbar {
  private ctx: Context;
  private type: ScrollbarType;
  private isFocus = false;
  private trackX = 0;
  private trackY = 0;
  private trackWidth = 0;
  private trackHeight = 0;
  private splitPoints: number[] = []; //分割线
  private barX = 0;
  private barY = 0;
  private barWidth = 0;
  private barHeight = 0;
  private distance = 0; // 滚动条的长度
  private visibleDistance = 0; //可见区域的长度
  private offsetX = 0;
  private offsetY = 0;
  private dragStart = 0; // 拖拽开始的位置
  isDragging = false;
  scroll = 0;

  constructor(ctx: Context, type: ScrollbarType) {
    this.ctx = ctx;
    this.type = type;
    if (this.type === "vertical") {
      this.scroll = this.ctx.scrollY;
    } else {
      this.scroll = this.ctx.scrollX;
    }
  }

  onWheel(e: WheelEvent) {
    this.updateScroll(e);
  }

  onMouseDown(e: MouseEvent) {
    const { offsetX, offsetY } = e;
    if (offsetX == this.offsetX && offsetY == this.offsetY) return;
    if (this.isOnScrollbar(offsetX, offsetY)) {
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.isDragging = true;
      this.isFocus = true;
      this.dragStart = this.scroll;
    } else if (this.isOnTrack(offsetX, offsetY)) {
      // 点击轨道滚动
      let scroll = 0;
      if (this.type === "vertical") {
        // 滚动条位置=（鼠标位置-滚动条的高度/2-头部的高度）/（可见区域的长度-滚动条的高度）*滚动条的长度
        // 滚动到中间所以减去滚动条的高度/2
        const offset = offsetY - this.ctx.header.height - this.barHeight / 2;
        scroll =
          (offset / (this.visibleDistance - this.barHeight)) * this.distance;
      } else {
        const offset = offsetX - this.barWidth / 2;
        scroll =
          (offset / (this.visibleDistance - this.barWidth)) * this.distance;
      }
      this.scroll = Math.max(0, Math.min(scroll, this.distance));
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.isFocus = false;
    this.offsetY = 0;
    this.offsetX = 0;
  }

  onMouseMove(e: MouseEvent) {
    const { offsetX, offsetY } = e;
    // 悬浮提示
    if (this.isOnScrollbar(offsetX, offsetY) && e.target === this.ctx.target) {
      this.isFocus = true;
    } else {
      this.isFocus = false;
    }
    // 拖拽移动滚动条
    if (offsetX == this.offsetX && offsetY == this.offsetY) return;
    let offset = 0;
    if (this.type === "horizontal") {
      offset = offsetX - this.offsetX;
    } else {
      offset = offsetY - this.offsetY;
    }
    if (this.isDragging && offset !== 0) {
      // scroll= 开始滚动条位置+（鼠标移动的距离/可见区域的长度）*滚动条的长度
      let scroll = 0;
      if (this.type === "vertical") {
        scroll =
          this.dragStart +
          (offset / (this.visibleDistance - this.barHeight)) * this.distance;
      } else {
        scroll =
          this.dragStart +
          (offset / (this.visibleDistance - this.barWidth)) * this.distance;
      }
      this.scroll = Math.max(0, Math.min(scroll, this.distance));
    }
  }

  private isPointInElement(
    pointX: number,
    pointY: number,
    elementX: number,
    elementY: number,
    elementWidth: number,
    elementHeight: number
  ): boolean {
    return (
      pointX >= elementX &&
      pointX <= elementX + elementWidth &&
      pointY >= elementY &&
      pointY <= elementY + elementHeight
    );
  }

  private isOnScrollbar(x: number, y: number): boolean {
    return this.isPointInElement(
      x,
      y,
      this.barX,
      this.barY,
      this.barWidth,
      this.barHeight
    );
  }
  private isOnTrack(x: number, y: number): boolean {
    return this.isPointInElement(
      x,
      y,
      this.trackX,
      this.trackY,
      this.trackWidth,
      this.trackHeight
    );
  }

  private updateScroll(e: WheelEvent) {
    e.preventDefault();
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    if (this.type === "vertical" && e.shiftKey === false) {
      this.scroll = Math.max(0, Math.min(this.scroll + deltaY, this.distance));
    } else if (this.type === "horizontal") {
      if (e.shiftKey) {
        this.scroll = Math.max(
          0,
          Math.min(this.scroll + deltaY, this.distance)
        );
      } else {
        this.scroll = Math.max(
          0,
          Math.min(this.scroll + deltaX, this.distance)
        );
      }
    }
  }
  private updatedSize() {
    const {
      body,
      header,
      config: { SCROLLER_TRACK_SIZE = 0, SCROLLER_SIZE = 0 },
    } = this.ctx;
    const visibleWidth = this.ctx.target.offsetWidth;
    const visibleHeight = this.ctx.target.offsetHeight;
    const headerHeight = header.height;
    const headerWidth = header.width;
    const bodyHeight = body.height;
    if (this.type === "vertical") {
      this.visibleDistance = visibleHeight - SCROLLER_TRACK_SIZE - headerHeight;
      this.distance = bodyHeight - this.visibleDistance;
      this.trackX = visibleWidth - SCROLLER_TRACK_SIZE;
      this.trackY = 0;
      // 分割线
      this.splitPoints = [
        this.trackX,
        headerHeight,
        this.trackX + SCROLLER_TRACK_SIZE,
        headerHeight,
      ];
      this.trackWidth = SCROLLER_TRACK_SIZE;
      this.trackHeight = visibleHeight;
      // 滚动条的X位置=轨道的X位置+（轨道的宽度-滚动条的宽度）/2
      this.barX = this.trackX + (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2;
      this.barWidth = SCROLLER_SIZE;
      this.barHeight = Math.max(
        SCROLLER_TRACK_SIZE,
        (this.visibleDistance / this.distance) * this.visibleDistance
      );
      this.barY =
        headerHeight +
        (this.scroll / this.distance) * (this.visibleDistance - this.barHeight);
    } else {
      this.visibleDistance = visibleWidth - SCROLLER_TRACK_SIZE;
      this.distance = headerWidth - this.visibleDistance;
      // 分割线
      this.splitPoints = [
        visibleWidth - SCROLLER_TRACK_SIZE,
        visibleHeight - SCROLLER_TRACK_SIZE,
        visibleWidth - SCROLLER_TRACK_SIZE,
        visibleHeight,
      ];
      this.trackX = 0;
      this.trackY = visibleHeight - SCROLLER_TRACK_SIZE;
      this.trackWidth = visibleWidth;
      this.trackHeight = SCROLLER_TRACK_SIZE;
      this.barWidth = SCROLLER_SIZE;
      this.barY = this.trackY + (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2;
      this.barWidth = Math.max(
        SCROLLER_TRACK_SIZE,
        (this.visibleDistance / this.distance) * this.visibleDistance
      );
      this.barHeight = SCROLLER_SIZE;
      this.barX =
        (this.scroll / this.distance) * (this.visibleDistance - this.barWidth);
    }
  }
  draw() {
    const {
      config: {
        SCROLLER_FOCUS_COLOR,
        SCROLLER_COLOR,
        BORDER_COLOR,
        SCROLLER_TRACK_COLOR,
      },
    } = this.ctx;
    this.updatedSize();
    // 轨道
    this.ctx.paint.drawRect(
      this.trackX,
      this.trackY,
      this.trackWidth,
      this.trackHeight,
      {
        borderColor: BORDER_COLOR,
        fillColor: SCROLLER_TRACK_COLOR,
      }
    );
    // 滚动条
    this.ctx.paint.drawRect(
      this.barX,
      this.barY,
      this.barWidth,
      this.barHeight,
      {
        fillColor:
          this.isFocus || this.isDragging
            ? SCROLLER_FOCUS_COLOR
            : SCROLLER_COLOR,
        radius: 4,
      }
    );
    // 分割线范围外
    if (this.splitPoints.length > 0) {
      this.ctx.paint.drawLine(this.splitPoints, {
        borderColor: BORDER_COLOR,
        borderWidth: 1,
      });
    }
  }
}

export default class Scroller {
  private ctx: Context;
  private verticalScrollbar: Scrollbar;
  private horizontalScrollbar: Scrollbar;

  constructor(ctx: Context) {
    this.ctx = ctx;
    this.verticalScrollbar = new Scrollbar(ctx, "vertical");
    this.horizontalScrollbar = new Scrollbar(ctx, "horizontal");

    this.ctx.on("wheel", (e) => this.onWheel(e));
    this.ctx.on("mousedown", (e) => this.onMouseDown(e));
    this.ctx.on("mousemove", (e) => this.onMouseMove(e));
    this.ctx.on("mouseup", () => this.onMouseUp());
  }

  onWheel(e: WheelEvent) {
    this.verticalScrollbar.onWheel(e);
    this.horizontalScrollbar.onWheel(e);
    this.draw();
  }

  onMouseDown(e: MouseEvent) {
    this.verticalScrollbar.onMouseDown(e);
    this.horizontalScrollbar.onMouseDown(e);
    this.draw();
  }

  onMouseMove(e: MouseEvent) {
    this.verticalScrollbar.onMouseMove(e);
    this.horizontalScrollbar.onMouseMove(e);
    this.draw();
  }

  onMouseUp() {
    this.verticalScrollbar.onMouseUp();
    this.horizontalScrollbar.onMouseUp();
  }

  draw() {
    this.verticalScrollbar.draw();
    this.horizontalScrollbar.draw();
    const scrollX = Math.floor(this.horizontalScrollbar.scroll);
    const scrollY = Math.floor(this.verticalScrollbar.scroll);
    // 只有滚动条发生变化才触发绘制
    if (scrollX !== this.ctx.scrollX || scrollY !== this.ctx.scrollY) {
      this.ctx.scrollX = scrollX;
      this.ctx.scrollY = scrollY;
      this.ctx.emit("draw");
      this.ctx.emit("onScroll", scrollX, scrollY);
      if (scrollX !== this.ctx.scrollX) {
        this.ctx.emit("onScrollX", scrollX);
      }
      if (scrollY !== this.ctx.scrollY) {
        this.ctx.emit("onScrollY", scrollY);
      }
    }
  }
}
