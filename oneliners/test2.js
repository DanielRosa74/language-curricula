const fs = require('fs');

function analyzeScript(jsFilePath, outputJsonFilePath) {
    fs.readFile(jsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        const lines = data.split('\n');
        let dialogues = [];
        let currentFunction = '';
        let currentCharTalksArgs = [];

        for (let line of lines) {
            if (line.includes('charTalks') || line.includes('sayLine')) {
                currentFunction = line.trim();
                if (!line.trim().endsWith(');')) {
                    continue;
                }
            } else if (currentFunction) {
                currentFunction += line.trim();
                if (!line.trim().endsWith(');')) {
                    continue;
                }
            }

            if (currentFunction) {
                if (currentFunction.startsWith('charTalks')) {
                    currentCharTalksArgs = parseFunctionArguments(currentFunction);
                } else if (currentFunction.startsWith('sayLine')) {
                    let sayLineArgs = parseFunctionArguments(currentFunction);
                    if (sayLineArgs && currentCharTalksArgs) {
                        const dialogue = {
                            character: sayLineArgs[1],
                            startTime: parseFloat(sayLineArgs[3]),
                            finishTime: parseFloat(sayLineArgs[3]) + parseFloat(currentCharTalksArgs[4]),
			    dialogue: {
                                text: sayLineArgs[2],
                                align: sayLineArgs[0] === 'char1' ? 'left' : 'right'
                            }
                        };
                        dialogues.push(dialogue);
                    }
                }
                currentFunction = '';
            }
        }

        fs.writeFile(outputJsonFilePath, JSON.stringify(dialogues, null, 2), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('JSON file created successfully.');
        });
    });
}

function parseFunctionArguments(functionCall) {
    let args = [];
    let currentArg = '';
    let inString = false;

    for (let i = functionCall.indexOf('(') + 1; i < functionCall.lastIndexOf(')'); i++) {
        let char = functionCall[i];

        if (char === '"' && functionCall[i - 1] !== '\\') {
            inString = !inString;
        }

        if (char === ',' && !inString) {
            args.push(currentArg.trim());
            currentArg = '';
        } else {
            currentArg += char;
        }
    }

    if (currentArg) {
        args.push(currentArg.trim());
    }

    // Cleaning and processing arguments
    return args.map(arg => {
        // Remove quotes from string arguments
        if (arg.startsWith('"') && arg.endsWith('"')) {
            return arg.slice(1, -1);
        }
        return arg;
    });
}

// Example usage
const jsFilePath = './script.js'; // Replace with your JavaScript file path
const outputJsonFilePath = './output_dialogues_test2.json'; // The output JSON file
analyzeScript(jsFilePath, outputJsonFilePath);
