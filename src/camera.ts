import { Canvas } from "./render.ts";
import { Cartesian } from "./coordinates.ts";

const FONTSIZE = 10;

interface Drawable {
    draw(pointMapper: (point: Cartesian) => Cartesian, canvas: Canvas);
}

class Circle implements Drawable {
    constructor(public center: Cartesian, public radius: number) {}
    draw(pointMapper: (point: Cartesian) => Cartesian, canvas: Canvas) {
        let transEdge = pointMapper(this.center.transform([this.radius, 0]));
        let transCenter = pointMapper(this.center);
        let transRadius = transEdge.x - transCenter.x;
        canvas.drawCircle(transCenter.arr, transRadius);
    }
}
class Arrow implements Drawable {
    constructor(public tail: Cartesian, public head: Cartesian) {}
    draw(pointMapper: (point: Cartesian) => Cartesian, canvas: Canvas) {
        canvas.drawLine(pointMapper(this.tail).arr, pointMapper(this.head).arr);
    }
}
class DText implements Drawable {
    constructor(public bottomleft: Cartesian, public text: string) {}
    draw(pointMapper: (point: Cartesian) => Cartesian, canvas: Canvas) {
        let transTopLeft = pointMapper(this.bottomleft.transform([0, -FONTSIZE]));
        let transBottomLeft = pointMapper(this.bottomleft)
        let transHeight = transBottomLeft.y - transTopLeft.y;
        canvas.drawText(pointMapper(this.bottomleft).arr, this.text, transHeight + "px Arial");
    }
}


class Camera {
    position: Cartesian;
    zoom: number;
    apertureAngles: [number, number];
    constructor(public canvas: Canvas, public height: number) {
        const radius = [this.canvas.width / 2, this.canvas.height / 2];
        this.apertureAngles = [Math.atan(radius[0] / this.height), Math.atan(radius[1] / this.height)];
        this.position = new Cartesian(0, 0);
        console.log(this.adjustedRadius(0));
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
        new Circle(new Cartesian(100, 100), 100),
        new Arrow(new Cartesian(200, 200), new Cartesian(300, 300)),
        new DText(new Cartesian(300, 310), "greeting fellow nerds")
    ]
    camera.draw();
    return camera;
}