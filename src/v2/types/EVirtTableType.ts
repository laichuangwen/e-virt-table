import { Column } from "./ColumnType";
import Config from "../core/Config";

type ConfigType = Partial<Config>;

export type EVirtTableOptions = {
    columns: Column[];
    data: Record<string, any>[];
    footerData?: Record<string, any>[];
    config?: ConfigType;
    // overlayerElement?: HTMLDivElement;
    // editorElement?: HTMLDivElement;
    // emptyElement?: HTMLDivElement;
    // contextMenuElement?: HTMLDivElement;
    // loadingElement?: HTMLDivElement;
}