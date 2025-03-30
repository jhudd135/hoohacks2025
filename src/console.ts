export function setConsoleText(logs: string[]) {
    let resultString = "<span> \> "+  logs.join(`</span> <span> \> `) + "</span>";
    document.getElementById("consoleOutput").innerHTML = resultString;
}