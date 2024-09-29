import type Context from "./Context";
export type HistoryItemData = {
  oldValue: any;
  newValue: any;
  key: string;
  rowKey: string;
};
export type HistoryItem = {
  changeList: HistoryItemData[];
  type: "single" | "multiple";
};
/**
 * 数据历史堆栈
 */
export default class History {
  ctx: Context;
  history: HistoryItem[] = [];
  historyIndex = -1;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  pushState(changeList: HistoryItem) {
    const { HISTORY_NUM = 0, ENABLE_HISTORY } = this.ctx.config;
    // 是否启动历史
    if (!ENABLE_HISTORY) {
      return;
    }
    this.history.push(changeList);
    if (this.history.length > HISTORY_NUM) {
      this.history.splice(0, 1);
    }
    this.historyIndex = this.history.length - 1;
  }
  // 回退
  backState() {
    if (this.historyIndex >= 0) {
      const { changeList } = this.history[this.historyIndex];
      const data = changeList.map(
        (item: { rowKey: string; key: string; oldValue: any }) => {
          return {
            rowKey: item.rowKey,
            key: item.key,
            value: item.oldValue,
            row: {},
          };
        }
      );
      // 不需要添加历史记录
      this.ctx.database.batchSetItemValue(data, false);
      this.historyIndex -= 1;
      // this.ctx?.rendererView?.reDraw();
    }
  }
  // 前进
  forwardState() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex += 1;
      const { changeList } = this.history[this.historyIndex];
      const data = changeList.map(
        (item: { rowKey: string; key: string; newValue: any }) => {
          return {
            rowKey: item.rowKey,
            key: item.key,
            value: item.newValue,
            row: {},
          };
        }
      );
      // 不需要添加历史记录
      this.ctx.database.batchSetItemValue(data, false);
      // this.ctx?.rendererView?.reDraw();
    }
  }
  // 清空历史
  clear() {
    this.history = [];
    this.historyIndex = -1;
  }
}
