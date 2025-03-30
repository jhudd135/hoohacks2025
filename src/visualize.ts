import { Drawable, Circle, Arrow, DText, Camera } from "./camera.ts";
import { Cartesian, Polar } from "./coordinates.ts";

const trackingMap: Map<any, { name: string, location: Cartesian }> = new Map();
// function register()

const SCALE = 10;
const DISTANCE = 10 * SCALE;
const RADIUS = 2.5 * SCALE;
var primitiveDisplay: HTMLElement;

function getInitialPlacements(tracked: string[], states: Object[]): Map<string, Cartesian> {
    const boundingStates: Map<string, Drawable[]> = new Map(tracked.map(s => [s, []]));
    for (let state of states) {
        // console.log("gIP for state", state);
        for (let entry of Object.entries(state)) {
            if (entry[1] instanceof Object) {
                const drawables = visualize(entry[1], new Cartesian(0, 0), new Set());
                const box = boundingBox(drawables);
                // console.log("gIP forfor drawables", drawables, "box", box);
                boundingStates.get(entry[0]).push(new Arrow(box[0],  box[1]));
            } else {
                boundingStates.get(entry[0]).push(new Circle(new Cartesian(0, 0), 0));
            }
        }
    }
    // console.log("gIP boundingStates", boundingStates);
    const trackedBounds = new Map(Array.from(boundingStates.entries()).map(entry => [entry[0], boundingBox(entry[1])]));
    // console.log("gIP trackedBounds", trackedBounds);
    const trackedStarts: Map<string, Cartesian> = new Map();
    let currentStart = new Cartesian(0, 0);
    for (let entry of trackedBounds) {
        trackedStarts.set(entry[0], currentStart);
        // console.log("gIP", entry[0]);
        currentStart = currentStart.transform(0, entry[1][1].y - entry[1][0].y + DISTANCE);
    }
    return trackedStarts;
}

function boundingBox(items: Drawable[]): [Cartesian, Cartesian] {
    if (!items) {
        console.log("no items!");
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

function ccArrow(tail: Cartesian, head: Cartesian, text: string = null): Drawable[] {
    const forwardAngle = head.transform(tail.scale(-1)).polar().angle;
    const result: Drawable[] = [new Arrow(
        tail.transform((new Polar(forwardAngle, RADIUS)).cartesian()),
        head.transform((new Polar(forwardAngle, RADIUS)).scale(-1).cartesian())
    )];
    if (text !== null) {
        result.push(new DText((result[0] as Arrow).tail.transform((new Polar(forwardAngle, SCALE)).cartesian()), text, forwardAngle));
    }
    return result;
}

function visualize(obj: Object, start: Cartesian, seen: Set<Object>): Drawable[] {
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
            result.push(...ccArrow(start, nextStart, entry[0]));
            // result.push(new DText(nextStart.transform(-RADIUS + SCALE, 0), entry[0]));
            const drawables = visualize(entry[1], nextStart, seen);
            const box = boundingBox(drawables);
            nextStart = new Cartesian(nextStart.x, (!box ? 0 : box[1].y) + DISTANCE);
            result.push(...drawables);
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

function testObj2() {
    let foo = {};
    let bar = {};
    foo["bar"] = bar;
    let foobar = {};
    bar["foobar"] = foobar;
    return foo;
}

function topVisualize(topObj: Object, fullySpacedStarts: Map<string, Cartesian>) {
    // {a: 1, b: "hello", c: {d: {}, e: {}}}
    const result: Drawable[] = [];
    // let start = new Cartesian(0, 0);
    const seen: Set<Object> = new Set();
    let primitives: string = "";
    for (let item of Object.entries(topObj)) {
        if (item[1] as Object instanceof Object) {
            const start = fullySpacedStarts.get(item[0]);
            result.push(new DText(start.transform(-RADIUS + SCALE, 0), item[0]));
            const drawables = visualize(item[1], start, seen);
            const box = boundingBox(drawables);
            // start = new Cartesian(0, (!box ? 0 : box[1].y) + DISTANCE);
            result.push(...drawables);
        } else {
            primitives += `<span> ${item[0]}: ${item[1]} </span>\n`;
            console.log(primitives);
        }
    }
    primitiveDisplay.innerHTML = primitives;
    return result;
}

export function testVisualize() {
    // const states = [{bewc: testObj(), hudd: {a: 1, b: "hello", c: {d: {}, e: {}}}, d: {}}];
    const states = [testObj2()];
    const tracked = ["foo", "bar"];
    const fss = getInitialPlacements(tracked, states);
    console.log("fss", fss);
    return topVisualize(states[0], fss);
}

let visualizations: Drawable[][];

export function setupVisualize(tracked: string[], states: Object[], displayField: HTMLElement) {
    primitiveDisplay = displayField;
    console.log("tracked", tracked);
    const prunedStates = states.map(state => Object.fromEntries(Object.entries(state).filter(entry => tracked.includes(entry[0]))));
    const fullySpacedStarts = getInitialPlacements(tracked, prunedStates);
    visualizations = [];
    prunedStates.forEach((state, i) => {
        visualizations.push(topVisualize(state, fullySpacedStarts));
    });
}

export function drawState(stateNumber: number, camera: Camera) {
    camera.image = visualizations[stateNumber];
    camera.draw();
}