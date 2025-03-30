import { pythag } from "./utils.ts";

export type CartesianParsable = [number, number] | { x: number, y: number } | Cartesian | number;
export type PolarParsable = [number, number] | { angle: number, radius: number } | Polar | number;

export class Cartesian {
    x: number;
    y: number;
    constructor(coords: CartesianParsable, y: number = 0) {
        if (typeof coords === "number") {
            this.x = coords;
            this.y = y;
        } else if (Object.keys(coords).includes("transform")) {
            this.x = (coords as Cartesian).x;
            this.y = (coords as Cartesian).y;
        } else if (Object.keys(coords).includes("0") && Object.keys(coords).includes("1")) {
            this.x = coords[0];
            this.y = coords[1];
        } else {
            this.x = (coords as { x: number, y: number }).x;
            this.y = (coords as { x: number, y: number }).y;
        }
    }
    polar(): Polar {
        return new Polar(Math.atan2(this.y, this.x), pythag(this.x, this.y));
    }
    transform(coords: [number, number] | { x: number, y: number } | Cartesian | number, y: number = 0): Cartesian {
        const transform = new Cartesian(coords, y);
        return new Cartesian(this.x + transform.x, this.y + transform.y);
    }
    get arr(): [number, number] {
        return [this.x, this.y];
    }
    toString(): string {
        return "[x: " + this.x + ", y: " + this.y + "]";
    }
    eq(other: Cartesian): boolean {
        return this.x === other.x && this.y === other.y;
    }
    scale(xscl: number, yscl: number = null) {
        if (yscl == null) {
            this.x *= xscl;
            this.y *= xscl;
        } else {
            this.x *= xscl;
            this.y *= yscl;
        }
        return this;
    }
}
export class Polar {
    angle: number;
    radius: number;
    constructor(coords: PolarParsable, radius: number = 0) {
        if (typeof coords === "number") {
            this.angle = coords;
            this.radius = radius;
        } else if (Object.keys(coords).includes("transform")) {
            this.angle = (coords as Polar).angle;
            this.radius = (coords as Polar).radius;
        } else if (Object.keys(coords).includes("0") && Object.keys(coords).includes("1")) {
            this.angle = coords[0]; 
            this.radius = coords[1];
        } else {
            this.angle = (coords as { angle: number, radius: number }).angle;
            this.radius = (coords as { angle: number, radius: number }).radius;
        }
    }
    cartesian(): Cartesian {
        return new Cartesian(this.radius * Math.cos(this.angle), this.radius * Math.sin(this.angle));
    }
    transform(angle: [number, number] | { angle: number, radius: number } | Polar | number, radius: number = 0): Polar {
        const transform = new Polar(angle, radius).cartesian();
        return this.cartesian().transform(transform).polar();
    }
    rotate(angle: number): Polar {
        return new Polar(this.angle + angle, this.radius);
    }
    toString(): string {
        return "(Θ: " + this.angle + ", r: " + this.radius + ")";
    }
    scale(scalar: number): Polar {
        return new Polar(this.angle, this.radius * scalar);
    }
}