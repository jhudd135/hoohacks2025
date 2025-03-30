export function preprocess(code: string, tracker: string[]): string {
    let statementToLine: number[] = [];
    let statementsPerLine: number[] = [];
    let lines: string[] = code.split('\n');

    let lineCounter = 0;
    let statementCounter = 0;
    for (let i = 0; i < lines.length; i ++) {
        if (lines[i].match(';') != null) {
            if (lines[i].indexOf('for') !== -1) {
                statementsPerLine.push(0);
            } else {
                let occurrences = lines[i].split(';').length - 1;
                statementsPerLine.push(occurrences);
                for (let j = 0; j < occurrences; j ++) {
                    statementToLine.push(lineCounter);
                    statementCounter ++;
                }
            }
        } else {
            statementsPerLine.push(0);
        }
        lineCounter ++;
    }

    statementCounter = 0;    

    for (let i = 0; i < lines.length; i ++) {
        let occurrences = statementsPerLine[i];
        let cur = 0;
        for (let j = 0; j < occurrences; j ++) {
            let line = `\ngetValuesIfPresent(${statementToLine[statementCounter] + 1});\n`;
            cur = lines[i].indexOf(';', cur) + 1;
            lines[i] = lines[i].slice(0, cur) + line + lines[i].slice(cur);
            cur = lines[i].indexOf(';', cur) + 1;
            statementCounter ++;
        }
    }

    let funcDef: string = `
    function getValuesIfPresent(funkyCoolLineNumber) {
        let values = ["${tracker.join("\", \"")}"];
        let returnObject = {funkyCoolLineNumber: funkyCoolLineNumber, reallyCoolConsoleLogs: reallyCoolConsoleLogs};

        for (let v of values) {
            try {
                returnObject[v] = eval(v);
            } catch(error) {
            }
        }

        mainWindow.postMessage(returnObject, "*");
    }
    `;

    let finalCall: string = `
    mainWindow.postMessage("done", "*");
    `

    return funcDef + lines.join("\n") + finalCall;
}