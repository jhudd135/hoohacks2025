import {Polar, Cartesian, CartesianParsable} from "./coordinates.ts";

/** Encapsulates HTMLCanvasElement. */
export class Canvas {
    canvas: HTMLCanvasElement;
    get context(): CanvasRenderingContext2D {return this.canvas.getContext("2d");}
    get width(): number {return this.canvas.width;}
    get height(): number {return this.canvas.height;}
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }
    cleanCanvas() {
        this.context.clearRect(0, 0, this.width, this.height);
    }
    drawLine(begin: [number, number], end: [number, number], stroke: string = "black", width: number = 1): void {
        const ctx = this.context;
        if (stroke) {
            ctx.strokeStyle = stroke;
        }
        if (width) {
            ctx.lineWidth = width;
        }
        ctx.beginPath();
        ctx.moveTo(begin[0], begin[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.stroke();
    }
    drawPolygon(points: [number, number][], fill: string = "black"): void {
        const ctx = this.context;
        if (fill) {
            ctx.fillStyle = fill;
        }
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(...points[i]);
        }
        ctx.fill();
    }
    drawPolyline(points: [number, number][], stroke: string = "black"): void {
        const ctx = this.context;
        if (stroke) {
            ctx.strokeStyle = stroke;
        }
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(...points[i]);
        }
        ctx.stroke();
    }
    drawRect(topLeft: [number, number], sideLengths: [number, number] | number, stroke: string = "black", width: number = 1): void {
        let ver = 0, hor = 0;
        if (typeof sideLengths === "number") {
            ver = sideLengths;
            hor = sideLengths;
        } else {
            hor = sideLengths[0];
            ver = sideLengths[1];
        }
        this.drawLine(topLeft, [topLeft[0] + hor, topLeft[1]], stroke, width);
        this.drawLine(topLeft, [topLeft[0], topLeft[1] + ver], stroke, width);
        this.drawLine([topLeft[0] + hor, topLeft[1] + ver], [topLeft[0] + hor, topLeft[1]], stroke, width);
        this.drawLine([topLeft[0] + hor, topLeft[1] + ver], [topLeft[0], topLeft[1] + ver], stroke, width);
    }
    drawArc(center: [number, number], radius: number, startAngle: number, endAngle: number, stroke: string = "black", width: number = 1): void {
        const ctx = this.context;
        if (stroke) {
            ctx.strokeStyle = stroke;
        }
        if (width) {
            ctx.lineWidth = width;
        }
        ctx.beginPath();
        ctx.ellipse(center[0], center[1], radius, radius, 0, startAngle, endAngle);
        ctx.stroke();
    }
    drawCircle(center: [number, number], radius: number, stroke: string = "black", width: number = 1): void {
        this.drawArc(center, radius, 0, 2 * Math.PI, stroke, width);
    }
    drawText(point: [number, number], text: string, font: string = "10px Arial", rotation = null): void {
        const ctx = this.context;
        if (font) {
            ctx.font = font;
        }
        if (rotation != null) {
            ctx.save();
            ctx.translate(point[0], point[1]);
            ctx.rotate(rotation);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        } else {
            ctx.fillText(text, point[0], point[1]);
        }
        
    }
    borderCanvas(): void {
        this.drawRect([0, 0], [this.width, this.height], "black", 2);
    }
}