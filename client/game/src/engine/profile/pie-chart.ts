function drawPieSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
}

function drawQuad(ctx, startX, startY, width, height, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(startX, startY, width, height);
    ctx.fill();
}

interface PieChatOptions {
    canvas:HTMLCanvasElement;
    data:{[key:string]:number};
    doughnutHoleSize:number;
    center?:number[];
    radius?:number;
}

export class PieChart {
    public canvas:HTMLCanvasElement;
    public options:PieChatOptions;
    public ctx:CanvasRenderingContext2D;
    public centerX:number;
    public centerY:number;
    public pieRadius:number;

    public colors = ['#E65100', '#EF6C00', '#F57C00', '#FB8C00', '#5E35B1', '#673AB7', '#7E57C2',
                    '#78909c', '#607d8b', '#546e7a', '#455a64', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20',
                    '#7986cb', '#5c6bc0', '#3f51b5', '#3949ab', '#303f9f', '#283593', '#1a237e'];

    constructor(opts:PieChatOptions) {
        this.options = opts;
        this.canvas = opts.canvas;
        this.ctx = <CanvasRenderingContext2D>(this.canvas.getContext('2d'));
        this.centerX = opts.center === undefined ? this.canvas.width / 2 : opts.center[0];
        this.centerY = opts.center === undefined ? this.canvas.width / 2 : opts.center[0];
        this.pieRadius = opts.radius === undefined ? Math.min(this.canvas.width / 2, this.canvas.height / 2) : opts.radius;
    }

    public clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public draw() {
        let sum = 0;
        let colorIdx = 0;
        for (const categ in this.options.data) {
            sum += this.options.data[categ];
        }
        const pieRadius = this.pieRadius;
        const centerX = this.centerX;
        const centerY = this.centerY;

        let startAngle = 0;
        for (const categ in this.options.data) {
            const value = this.options.data[categ];
            if (value === 0) {
                continue;
            }
            const sliceAngle = 2 * Math.PI * value / sum;
            drawPieSlice(
                this.ctx,
                centerX,
                centerY,
                pieRadius,
                startAngle,
                startAngle + sliceAngle,
                this.colors[colorIdx % this.colors.length],
            );
            startAngle += sliceAngle;
            colorIdx++;
        }

        if (this.options.doughnutHoleSize) {
            drawPieSlice(
                this.ctx,
                centerX,
                centerY,
                this.options.doughnutHoleSize * pieRadius,
                0,
                2 * Math.PI,
                '#fff',
            );
        }

        for (const categ in this.options.data) {
            const value = this.options.data[categ];
            if (value === 0) {
                continue;
            }
            const sliceAngle = 2 * Math.PI * value / sum;
            let labelOffset = 0;
            if (this.options.doughnutHoleSize > 0) {
                labelOffset = (pieRadius * this.options.doughnutHoleSize) / 2;
            }
            const labelX = centerX + (labelOffset + pieRadius / 2) * Math.cos(startAngle + sliceAngle / 2);
            const labelY = centerY + (labelOffset + pieRadius / 2) * Math.sin(startAngle + sliceAngle / 2);

            const labelText = Number(100 * value / sum).toFixed(2);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(labelText + '%', labelX, labelY);

            startAngle += sliceAngle;
        }
    }

    public drawTag() {
        const startPosX = this.canvas.width - 170;
        const startPosY = 10;

        let idx = 0;
        for (const categ in this.options.data) {
            const value = this.options.data[categ];
            if (value === 0) {
                continue;
            }
            drawQuad(
                this.ctx,
                startPosX,
                startPosY + idx * 25,
                20, 20,
                this.colors[idx % this.colors.length],
            );
            this.ctx.fillStyle = 'black';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(categ, startPosX + 25, startPosY + idx * 25 + 14);
            idx++;
        }
    }

    public toPicture() {
        const image = this.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        window.open(image);
    }
}
