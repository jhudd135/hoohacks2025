import { testCamera } from "./camera.ts";
import { Cartesian } from "./coordinates.ts";

let panStart: [number, number];
let panning: boolean;

export function initControls() {
    let camera = testCamera();
    camera.canvas.canvas.addEventListener("mousedown", (ev: MouseEvent) => {
        panStart = [ev.clientX, ev.clientY];
        panning = true;
    });
    camera.canvas.canvas.addEventListener("mousemove", (ev: MouseEvent) => {
        if (panning) {
            camera.draw(new Cartesian(ev.clientX - panStart[0], ev.clientY - panStart[1]));
        }
    });
    camera.canvas.canvas.addEventListener("keydown", (ev: KeyboardEvent) => {
        if (ev.key == "-") {
            camera.height *= 1.25;
            camera.draw();
        } else if (ev.key == "=") {
            camera.height *= 0.8;
            camera.draw();
        }
    });
    window.addEventListener("mouseup", (ev: MouseEvent) => {
        if (panning) {
            panning = false;
            camera.position = camera.position.transform(new Cartesian(panStart[0] - ev.clientX, panStart[1] - ev.clientY));
            camera.draw();
        }
    });
}

