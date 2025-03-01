const fs = require('fs');
const path = require('path');

// Set manual path to Fountain script
const FOUNTAIN_FILE_PATH = path.join(__dirname, 'Big-Fish.fountain.txt'); // Change this to your file

// Read and parse the file
fs.readFile(FOUNTAIN_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading the Fountain file:", err);
        return;
    }

    // Parse script into structured objects
    const parsedLines = parseFountainScript(data);

    console.log("Parsed Script Objects:", parsedLines);
});

// Function to parse Fountain script manually
function parseFountainScript(script) {
    const lines = script.split("\n");
    const parsedObjects = [];

    let lastCharacter = null; // Store last seen character for dialogue grouping

    lines.forEach(line => {
        line = line.trim();
        if (!line) return; // Skip empty lines

        let obj = { type: "unknown", text: line };

        if (line.match(/^INT\.|EXT\./)) {
            obj.type = "scene_heading";
        } else if (line.match(/^\[.*CUE.*\]$/)) {
            obj.type = "cue";
        } else if (line === line.toUpperCase() && !line.includes("(")) {
            obj.type = "character";
            lastCharacter = line; // Store the character for dialogue tracking
        } else if (line.startsWith("(") && line.endsWith(")")) {
            obj.type = "stage_direction";
        } else {
            obj.type = "dialogue";
            if (lastCharacter) {
                obj.character = lastCharacter; // Attach the last known character to the dialogue
            }
        }

        parsedObjects.push(obj);
    });

    return parsedObjects;
}