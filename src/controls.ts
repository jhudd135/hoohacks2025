import { setupCamera } from "./camera.ts";
import { Cartesian } from "./coordinates.ts";

let panMousePrev: Cartesian;
let panning: boolean;

export function initControls() {
    const camera = setupCamera();
    const currentRealMousePos: (ev: MouseEvent) => Cartesian = (ev: MouseEvent) => {
        return camera.canvasToReal(new Cartesian(
            ev.clientX - camera.canvas.canvas.getBoundingClientRect().left, 
            ev.clientY - camera.canvas.canvas.getBoundingClientRect().top
        ));
    }
    camera.canvas.canvas.addEventListener("mousedown", (ev: MouseEvent) => {
        panMousePrev = currentRealMousePos(ev);
        panning = true;
    });
    camera.canvas.canvas.addEventListener("mousemove", (ev: MouseEvent) => {
        if (panning) {
            let panMouseCur = currentRealMousePos(ev);
            camera.position = camera.position.transform(panMousePrev.transform(panMouseCur.scale(-1)));
            camera.draw();
        }
    });
    camera.canvas.canvas.addEventListener("wheel", (ev: WheelEvent) => {
        if (ev.deltaY < 0) {
            camera.height *= 0.9;
            camera.draw();
        } else {
            camera.height *= 1.1111111111111111111111;
            camera.draw();
        }
    });
    window.addEventListener("mouseup", (ev: MouseEvent) => {
        if (panning) {
            panning = false;
            camera.draw();
        }
    });
    return camera;
}

