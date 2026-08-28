import { EVirtTableOptions } from "../../types";
import Context from "./Context";
import { Text } from "./Text";
import { Icon } from "./Icon";
import checkboxCheck from "../svg/checkbox-check.svg?raw";
import { IconWithShadow } from "./IconWithShadow";

export class EVirtTable {
    private context: Context;
    constructor(target: HTMLDivElement, options: EVirtTableOptions) {
        this.context = new Context(target, options);
        const afterIcons = [
            new Icon(this.context.paint, {
                name: 'checkbox-check',
                source: checkboxCheck,
                x: 0,
                y: 0,
                width: 20,
                height: 20,
                color: 'blue',
            }),
            new IconWithShadow(this.context.paint, {
                name: 'checkbox-check1',
                source: checkboxCheck,
                x: 0,
                y: 0,
                width: 20,
                height: 20,
                color: 'red',
                radius: 4,
                borderColor: '#DDE0EA',
                fillColor: '#fff',
            }),
        ]
        const text = new Text(this.context.paint, {
            text: '123132123',
            x: 100,
            y: 10,
            width: 100,
            height: 100,
            fontSize: 16,
            // font: 'Arial, sans-serif',
            color: 'red',
            align: 'left',
            verticalAlign: 'top',
            padding: 8,
            autoRowHeight: false,
            debug: true,
            afterIcons,
            onAutoHeight: (h) => {
                console.log('onAutoHeight', h);
            },

        })
        this.context.draw();
    }
}

export default EVirtTable
