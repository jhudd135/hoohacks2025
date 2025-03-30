import { Drawable, Circle, Arrow, DText } from "./camera.ts";
import { Cartesian, Polar } from "./coordinates.ts";

const trackingMap: Map<any, { name: string, location: Cartesian }> = new Map();
// function register()

const SCALE = 10;
const DISTANCE = 10 * SCALE;
const RADIUS = 2.5 * SCALE;

function boundingBox(items: Drawable[]): [Cartesian, Cartesian] {
    if (!items) {
        return null;
    }
    const getBounds: (d: Drawable) => [Cartesian, Cartesian] = (d: Drawable) => {
        if (d instanceof Circle) {
            return [d.center.transform([-d.radius, -d.radius]), d.center.transform([d.radius, d.radius])];
        } else if (d instanceof Arrow) {
            const leftHead = d.head.x < d.tail.x;
            const left = leftHead ? d.head.x : d.tail.x;
            const right = leftHead ? d.tail.x : d.head.x;
            const topHead = d.head.y < d.tail.y;
            const top = topHead ? d.head.y : d.tail.y;
            const bottom = topHead ? d.tail.y : d.head.y;
            return [new Cartesian(left, top), new Cartesian(right, bottom)];
        } else if (d instanceof DText) {
            return [d.bottomleft, d.bottomleft];
        }
    }
    const result = getBounds(items[0]);
    for (let item of items) {
        const bounds = getBounds(item);
        result[0].x = result[0].x < bounds[0].x ? result[0].x : bounds[0].x;
        result[0].y = result[0].y < bounds[0].y ? result[0].y : bounds[0].y;
        result[1].x = result[1].x > bounds[1].x ? result[1].x : bounds[1].x;
        result[1].y = result[1].y > bounds[1].y ? result[1].y : bounds[1].y;
    }
    return result;
}

function ccArrow(tail: Cartesian, head: Cartesian) {
    const forwardAngle = head.transform(tail.scale(-1)).polar().angle;
    return new Arrow(
        tail.transform((new Polar(forwardAngle, RADIUS)).cartesian()),
        head.transform((new Polar(forwardAngle, RADIUS)).scale(-1).cartesian())
    );
}

function visualize(obj: Object, start: Cartesian, seen: Set<Object>): Drawable[] {
    console.log(start.toString(), obj);
    if (seen.has(obj)) {
        console.log("circular reference!!!!", obj);
        return [];
    }
    seen.add(obj);
    const result: Drawable[] = [];
    result.push(new Circle(start, RADIUS));
    let nextStart: Cartesian = start.transform([DISTANCE, 0]);
    Object.entries(obj).forEach((entry, i) => {
        if (entry[1] instanceof Object) {
            result.push(ccArrow(start, nextStart));
            result.push(new DText(nextStart.transform(-RADIUS + SCALE, 0), entry[0]));
            const drawables = visualize(entry[1], nextStart, seen);
            const box = boundingBox(drawables);
            if (entry[0] === "d")
            nextStart = nextStart.transform(0, (!box ? 0 : box[1].y) + DISTANCE);
            result.splice(result.length, 0, ...drawables);
        }
    });
    return result;
}


function testObj() {
    let thingy4 = {};
    let thingy2 = {};
    let thingy3 = {};
    let thingy = {};
    thingy["mabob"] = thingy2;
    thingy["mabob2"] = {}
    thingy2["mabob"] = thingy3;
    thingy3["mabob"] = thingy4;
    thingy4["mabob"] = thingy;
    return thingy;
}

export function testVisualize() {
    // {a: 1, b: "hello", c: {d: {}, e: {}}}
    const result: Drawable[] = [];
    let start = new Cartesian(0, 0);
    const seen: Set<Object> = new Set()
    for (let item of Object.entries({bewc: testObj(), hudd: {a: 1, b: "hello", c: {d: {}, e: {}}}})) {
        if (item[1] as Object instanceof Object) {
            result.push(new DText(start.transform(-RADIUS + SCALE, 0), item[0]));
            const drawables = visualize(item[1], start, seen);
            const box = boundingBox(drawables);
            start = start.transform(0, (!box ? 0 : box[1].y) + DISTANCE);
            result.splice(result.length, 0, ...drawables);
        }
    }
    console.log(result);
    return result;
}