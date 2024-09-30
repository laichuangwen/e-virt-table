import Database from "./Database";
import History from "./History";
import EventBrowser from "./EventBrowser";
import EventBus, { EventCallback } from "./EventBus";
import Paint from "./Paint";
import config from "./config";
import { Column, EVirtTableOptions } from "./types";
import Icons from "./Icons";
import CellHeader from "./CellHeader";
import Row from "./Row";
import { generateShortUUID } from "./util";
export type ConfigType = Partial<typeof config>;
export type HeaderOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  visibleHeight: number;
  visibleWidth: number;
  visibleLeafColumns: Column[];
  leafCellHeaders: CellHeader[];
  renderLeafCellHeaders: CellHeader[];
};
export type BodyOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  visibleHeight: number;
  visibleWidth: number;
  headIndex: number;
  tailIndex: number;
  visibleRows: any[];
  renderRows: Row[];
};
export default class Context {
  private eventBus: EventBus;
  private eventBrowser: EventBrowser;
  private uuid = generateShortUUID();
  target: HTMLCanvasElement;
  paint: Paint;
  icons: Icons;
  mousedown = false;
  scrollY = 0;
  scrollX = 0;
  fixedLeftWidth = 0;
  fixedRightWidth = 0;
  maxColIndex = 0;
  maxRowIndex = 0;
  body: BodyOptions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visibleHeight: 0,
    visibleWidth: 0,
    headIndex: 0,
    tailIndex: 0,
    visibleRows: [],
    renderRows: [],
  };
  header: HeaderOptions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visibleHeight: 0,
    visibleWidth: 0,
    visibleLeafColumns: [],
    leafCellHeaders: [],
    renderLeafCellHeaders: [],
  };
  database: Database;
  history: History;
  config: ConfigType;

  constructor(target: HTMLCanvasElement, options: EVirtTableOptions) {
    this.target = target;
    this.target.setAttribute("uuid", this.uuid);
    this.config = { ...config, ...options.config };
    this.eventBus = new EventBus();
    this.eventBrowser = new EventBrowser(this);
    this.paint = new Paint(target);
    this.database = new Database(this, options);
    this.history = new History(this);
    this.icons = new Icons(this);
  }
  isTarget(target: HTMLCanvasElement): boolean {
    if(target === null) return false;
    const uuid = target.getAttribute("uuid");
    return this.uuid === uuid;
  }
  hasEvent(event: string): boolean {
    return this.eventBus.has(event);
  }
  on(event: string, callback: EventCallback): void {
    this.eventBus.on(event, callback);
  }
  once(event: string, callback: EventCallback): void {
    this.eventBus.once(event, callback);
  }
  off(event: string, callback: EventCallback): void {
    this.eventBus.off(event, callback);
  }
  emit(event: string, ...args: any[]): void {
    this.eventBus.emit(event, ...args);
  }
  setHeader(headerOptions: HeaderOptions): void {
    this.header = headerOptions;
  }
  setBody(bodyOptions: BodyOptions): void {
    this.body = bodyOptions;
  }
  destroy(): void {
    this.eventBrowser.destroy();
    this.eventBus.destroy();
  }
}
