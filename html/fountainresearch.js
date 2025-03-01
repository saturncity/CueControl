const fs = require('fs');
const path = require('path');

// Set manual path to Fountain script
const FOUNTAIN_FILE_PATH = path.join(__dirname, 'sample.fountain'); // Change this to your actual file

// Read and parse the file
fs.readFile(FOUNTAIN_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading the Fountain file:", err);
        return;
    }

    const parsedHTML = parseFountainScript(data);
    const outputFile = path.join(__dirname, 'output.html');

    // Write the output to an HTML file
    fs.writeFile(outputFile, generateHTML(parsedHTML), (err) => {
        if (err) {
            console.error("Error writing the output file:", err);
        } else {
            console.log(`Fountain script successfully parsed! Open ${outputFile} in a browser.`);
        }
    });
});

// Function to parse Fountain script manually
function parseFountainScript(script) {
    const lines = script.split("\n");
    let htmlLines = [];

    lines.forEach(line => {
        line = line.trim();
        if (!line) return; // Skip empty lines

        if (line.match(/^INT\.|EXT\./)) {
            // Scene Heading
            htmlLines.push(`<h2 class="scene-heading">${line}</h2>`);
        } else if (line.match(/^\[.*CUE.*\]$/)) {
            // Cues (e.g., [LIGHT CUE 5])
            htmlLines.push(`<p class="cue">${line}</p>`);
        } else if (line === line.toUpperCase() && !line.includes("(")) {
            // Character Name
            htmlLines.push(`<p class="character">${line}</p>`);
        } else if (line.startsWith("(") && line.endsWith(")")) {
            // Stage Directions
            htmlLines.push(`<p class="stage-direction">${line}</p>`);
        } else {
            // Dialogue
            htmlLines.push(`<p class="dialogue">${line}</p>`);
        }
    });

    return htmlLines.join("\n");
}

// Function to generate an HTML file with CSS
function generateHTML(content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fountain Script Viewer</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f8f8f8;
            }
            .scene-heading {
                font-weight: bold;
                color: #2a5db0;
                margin-top: 20px;
            }
            .character {
                font-weight: bold;
                text-transform: uppercase;
                margin-top: 10px;
            }
            .dialogue {
                margin-left: 20px;
                font-style: italic;
            }
            .cue {
                color: #e63946;
                font-weight: bold;
                margin-left: 10px;
            }
            .stage-direction {
                color: #666;
                font-style: italic;
                margin-left: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Fountain Script Viewer</h1>
        ${content}
    </body>
    </html>`;
}
