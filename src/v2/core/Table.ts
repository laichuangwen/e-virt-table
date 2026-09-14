import Context from "./Context";
import { Text } from "./Text";
import { Icon } from "./Icon";
import checkboxCheck from "../svg/checkbox-check.svg?raw";
import { IconWithShadow } from "./IconWithShadow";
import { throttle } from "../../util";
import { Widget } from "./Widget";
import { Paint } from "./Paint";
import Header from "./Header";
import Body from "./Body";

export default class Table extends Widget {
    private header: Header;
    private body: Body;
    constructor(context: Context) {
        super(context);
        this.header = new Header(context);
        this.body = new Body(context);
        this.context.listener.on('resizeObserver',
            () => context.draw()
        );
        // this.createDemoWidgets();
    }
    render(paint: Paint) {
        // const { BORDER_RADIUS, BORDER_COLOR } = this.context.config;
        // paint.drawRect(0, 0, this.context.stageWidth , this.context.stageHeight, {
        //     borderWidth: 1,
        //     radius: BORDER_RADIUS,
        //     borderColor: BORDER_COLOR,
        // });
    }
    // private createDemoWidgets() {
    //     const afterIcons1 = [
    //         new Icon(this.context, {
    //             name: 'checkbox-check',
    //             source: checkboxCheck,
    //             x: 0,
    //             y: 0,
    //             width: 20,
    //             height: 20,
    //             color: 'blue',
    //         }),
    //         new IconWithShadow(this.context, {
    //             name: 'checkbox-check1',
    //             source: checkboxCheck,
    //             x: 0,
    //             y: 0,
    //             width: 20,
    //             height: 20,
    //             color: 'red',
    //             radius: 4,
    //             borderColor: '#DDE0EA',
    //             fillColor: '#fff',
    //         }),
    //     ]
    //     new Text(this.context, {
    //         text: '123132123233111111111111111111你都',
    //         x: 100,
    //         y: 10,
    //         width: 100,
    //         height: 100,
    //         fontSize: 16,
    //         color: 'red',
    //         align: 'center',
    //         verticalAlign: 'middle',
    //         padding: 8,
    //         autoRowHeight: false,
    //         debug: true,
    //         afterIcons: afterIcons1,
    //         onAutoHeight: (h) => {
    //             console.log('onAutoHeight', h);
    //         },
    //     })
    // }
}
