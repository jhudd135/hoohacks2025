import { Canvas } from "./render.ts";
import { Cartesian, Polar } from "./coordinates.ts";

const FONTSIZE = 10;

export interface Drawable {
    draw(pointMapper: (point: Cartesian) => Cartesian, canvas: Canvas);
}

export class Circle implements Drawable {
    constructor(public center: Cartesian, public radius: number) {}
    draw(pointMapper: (point: Cartesian) => Cartesian, canvas: Canvas) {
        let transEdge = pointMapper(this.center.transform([this.radius, 0]));
        let transCenter = pointMapper(this.center);
        let transRadius = transEdge.x - transCenter.x;
        canvas.drawCircle(transCenter.arr, transRadius);
    }
}
export class Arrow implements Drawable {
    constructor(public tail: Cartesian, public head: Cartesian) {}
    draw(pointMapper: (point: Cartesian) => Cartesian, canvas: Canvas) {
        canvas.drawLine(pointMapper(this.tail).arr, pointMapper(this.head).arr);
        const backAngle = this.tail.transform(this.head.scale(-1)).polar().angle;
        canvas.drawLine(pointMapper(this.head).arr, pointMapper(this.head.transform(new Polar(backAngle, 15).rotate(Math.PI / 4).cartesian())).arr);
        canvas.drawLine(pointMapper(this.head).arr, pointMapper(this.head.transform(new Polar(backAngle, 15).rotate(-Math.PI / 4).cartesian())).arr);
    }
}
export class DText implements Drawable {
    constructor(public bottomleft: Cartesian, public text: string, public rotation: number = null) {}
    draw(pointMapper: (point: Cartesian) => Cartesian, canvas: Canvas) {
        let transTopLeft = pointMapper(this.bottomleft.transform([0, -FONTSIZE]));
        let transBottomLeft = pointMapper(this.bottomleft)
        let transHeight = transBottomLeft.y - transTopLeft.y;
        canvas.drawText(pointMapper(this.bottomleft).arr, this.text, transHeight + "px Arial", this.rotation);
    }
}


export class Camera {
    position: Cartesian;
    zoom: number;
    apertureAngles: [number, number];
    constructor(public canvas: Canvas, public height: number) {
        const radius = [this.canvas.width / 2, this.canvas.height / 2];
        this.apertureAngles = [Math.atan(radius[0] / this.height), Math.atan(radius[1] / this.height)];
        this.position = new Cartesian(0, 0);
    }
    adjustedRadius(distance: number): [number, number] {
        return [(this.height + distance) * Math.tan(this.apertureAngles[0]), (this.height + distance) * Math.tan(this.apertureAngles[1])];
    }
    realToCanvas(coords: [number, number] | { x: number, y: number } | Cartesian | number, distance: number = 0): Cartesian {
        coords = new Cartesian(coords);
        const adjustedRadius = this.adjustedRadius(distance);
        const horMin = this.position.x - adjustedRadius[0], verMin = this.position.y - adjustedRadius[1];
        return new Cartesian(
            ((coords.x - horMin) / (2 * adjustedRadius[0])) * this.canvas.width,
            ((coords.y - verMin) / (2 * adjustedRadius[1])) * this.canvas.height
        );
    }
    canvasToReal(coords: Cartesian, cameraPosOverride: Cartesian = null): Cartesian {
        const pos = cameraPosOverride == null ? this.position : cameraPosOverride;
        const adjustedRadius = this.adjustedRadius(0);
        const horMin = pos.x - adjustedRadius[0], verMin = pos.y - adjustedRadius[1];
        return new Cartesian(
            (coords.x / this.canvas.width) * (2 * adjustedRadius[0]) + horMin,
            (coords.y / this.canvas.height) * (2 * adjustedRadius[1]) + verMin
        );
    }
    image: Drawable[];
    draw(adjustment: Cartesian = new Cartesian(0, 0)) {
        this.canvas.cleanCanvas();
        this.canvas.borderCanvas();
        for (let d of this.image) {
            d.draw((point: Cartesian) => this.realToCanvas(point).transform(adjustment), this.canvas);
        }
    }
}
export function processCanvas(htmlCanvas: HTMLCanvasElement) {
    htmlCanvas.width = htmlCanvas.offsetWidth;
    htmlCanvas.height = htmlCanvas.offsetHeight;
    return new Canvas(htmlCanvas);
}

export function testCamera(): Camera {
    let canvas = processCanvas(document.getElementsByTagName("canvas")[0]);
    let camera = new Camera(canvas, 500);
    camera.image = [
        new Circle(new Cartesian(0, 0), 50),
        new Arrow(new Cartesian(50, 0), new Cartesian(150, 0)),
        new DText(new Cartesian(150, 10), "Greeting fellow nerds")
    ]
    camera.draw();
    return camera;
}