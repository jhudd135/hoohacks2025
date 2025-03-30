import { preprocess } from "./preprocessing.js"
export function submit(code: string, win: Window, tracker: string[]) {
    let finalCode: string = preprocess(code, tracker)
    win.postMessage(finalCode, "*");
}