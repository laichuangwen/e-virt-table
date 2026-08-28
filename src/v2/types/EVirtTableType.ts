import { Column } from "./ColumnType";
import { ConfigType } from "./index";

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