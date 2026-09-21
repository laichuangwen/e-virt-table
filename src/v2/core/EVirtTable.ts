import { EVirtTableOptions } from "../../types";
import Context from "./Context";
export class EVirtTable {
    private context: Context;
    constructor(target: HTMLDivElement, options: EVirtTableOptions) {
        this.context = new Context(target, options);
    }
}

export default EVirtTable
