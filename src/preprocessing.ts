export function preprocess(code: string, tracker: string[]): string {
    let lines: string[] = code.split('\n');

    console.log(`${tracker}`);

    for (let i = 0, linesAdded = 0; i < lines.length; i ++) {
        if (lines[i].indexOf(';') !== -1) {
            let line = "getValuesIfPresent()";
            lines.splice(i+1, 0, line);
            linesAdded ++;
            i ++;
        }
    }

    let funcDef: string = `
    function getValuesIfPresent() {
        let values = ["${tracker.join("\", \"")}"];
        let returnObject = {};

        for (let v of values) {
            try {
                returnObject[v] = eval(v);
            } catch(error) {
                console.log(error);
            }
        }

        mainWindow.postMessage(returnObject, "*");
    }
    `;

    return funcDef + lines.join("\n");
}