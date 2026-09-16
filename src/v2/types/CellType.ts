import { WidgetConfig } from "../core/Widget";
import { Fixed } from "./ColumnType";
export type CellType = 'header' | 'body' | 'footer';
export interface CellConfig extends WidgetConfig {
    fixed: Fixed
    cellType: CellType
}