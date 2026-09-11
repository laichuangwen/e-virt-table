import Context from "./Context";
import { Text } from "./Text";
import { Icon } from "./Icon";
import checkboxCheck from "../svg/checkbox-check.svg?raw";
import { IconWithShadow } from "./IconWithShadow";
import { throttle } from "../../util";
import { Widget } from "./Widget";

export default class Table extends Widget {
    constructor(context: Context) {
        super(context);
        this.context.listener.on('resizeObserver', throttle(() => {
            context.draw();
        }, 167));
        this.createDemoWidgets();
    }
    render() {
  
    }
    private createDemoWidgets() {
        const afterIcons1 = [
            new Icon(this.context, {
                name: 'checkbox-check',
                source: checkboxCheck,
                x: 0,
                y: 0,
                width: 20,
                height: 20,
                color: 'blue',
            }),
            new IconWithShadow(this.context, {
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
        new Text(this.context, {
            text: '123132123233111111111111111111你都',
            x: 100,
            y: 10,
            width: 100,
            height: 100,
            fontSize: 16,
            color: 'red',
            align: 'center',
            verticalAlign: 'middle',
            padding: 8,
            autoRowHeight: false,
            debug: true,
            afterIcons: afterIcons1,
            onAutoHeight: (h) => {
                console.log('onAutoHeight', h);
            },
        })
    }
}
