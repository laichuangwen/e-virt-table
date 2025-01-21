import Context from './Context';
import Row from './Row';

export default class Footer {
    private ctx: Context;
    private renderRows: Row[] = [];
    private data: any[] = [];
    private x = 0;
    private y = 0;
    private width = 0;
    private height = 0;
    private visibleWidth = 0;
    private visibleHeight = 0;
    constructor(ctx: Context) {
        this.ctx = ctx;
        this.init();
    }
    private init() {
        this.data = this.ctx.database.getFooterData();
        const {
            header,
            body,
            config: { CELL_FOOTER_HEIGHT, FOOTER_FIXED, SCROLLER_TRACK_SIZE, FOOTER_POSITION },
        } = this.ctx;
        // 更新宽度
        this.width = header.width;
        this.visibleWidth = header.visibleWidth;
        // 更新高度
        this.height = this.data.reduce((sum) => {
            return sum + CELL_FOOTER_HEIGHT;
        }, 0);
        // 可视区高度
        this.visibleHeight = this.height;
        if (FOOTER_FIXED) {
            if (FOOTER_POSITION === 'top') {
                this.y = this.ctx.header.height;
            } else {
                this.y = this.ctx.stageHeight - this.height - SCROLLER_TRACK_SIZE;
            }
        } else {
            this.y = body.y + body.height;
        }
        this.ctx.footer.x = this.x;
        this.ctx.footer.y = this.y;
        this.ctx.footer.height = this.height;
        this.ctx.footer.width = this.width;
        this.ctx.footer.visibleWidth = this.visibleWidth;
        this.ctx.footer.visibleHeight = this.visibleHeight;
    }
    private drawFiexShadow() {
        const {
            fixedLeftWidth,
            fixedRightWidth,
            scrollX,
            header,
            stageWidth,
            config: { HEADER_BG_COLOR, SCROLLER_TRACK_SIZE },
        } = this.ctx;
        let y = this.y;
        // 不是footer固定时
        if (!this.ctx.config.FOOTER_FIXED) {
            y = this.y - this.ctx.scrollY;
        }
        if (scrollX > 0 && fixedLeftWidth !== 0) {
            this.ctx.paint.drawShadow(this.x, y, fixedLeftWidth, this.height, {
                fillColor: HEADER_BG_COLOR,
                side: 'right',
                shadowWidth: 4,
                colorStart: 'rgba(0,0,0,0.1)',
                colorEnd: 'rgba(0,0,0,0)',
            });
        }
        // 右边阴影
        if (scrollX < Math.floor(header.width - stageWidth - 1) && fixedRightWidth !== SCROLLER_TRACK_SIZE) {
            const x = header.width - (this.x + this.width) + stageWidth - fixedRightWidth;
            this.ctx.paint.drawShadow(x + 1, y, fixedRightWidth, this.height, {
                fillColor: HEADER_BG_COLOR,
                side: 'left',
                shadowWidth: 4,
                colorStart: 'rgba(0,0,0,0)',
                colorEnd: 'rgba(0,0,0,0.1)',
            });
        }
    }
    update() {
        this.init();
        const { CELL_FOOTER_HEIGHT } = this.ctx.config;
        let everyOffsetY = this.y;
        const rows: Row[] = [];
        this.data.forEach((data, index) => {
            const row = new Row(this.ctx, index, 0, everyOffsetY, this.width, CELL_FOOTER_HEIGHT, data, 'footer');
            everyOffsetY += CELL_FOOTER_HEIGHT;
            rows.push(row);
        });
        this.renderRows = rows;
        this.ctx.footer.renderRows = this.renderRows;
    }
    draw() {
        this.renderRows.forEach((row) => {
            row.drawCenter();
        });
        this.drawFiexShadow();
        this.renderRows.forEach((row) => {
            row.drawFixed();
        });
    }
}
