document.addEventListener('DOMContentLoaded', () => {
    const gridWrapper = document.getElementById('grid-wrapper');
    const gridContainer = document.getElementById('grid-container');
    const moduleLayer = document.getElementById('module-layer');
    const tooltip = document.getElementById('tooltip');

    // Get grid dimensions from CSS variables.
    const gridColumns = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--grid-columns')
    );
    const gridRows = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--grid-rows')
    );

    // Initialize grid state as a 2D array (null = empty; otherwise holds { id }).
    let gridState = [];
    for (let r = 0; r < gridRows; r++) {
        gridState[r] = [];
        for (let c = 0; c < gridColumns; c++) {
            gridState[r][c] = null;
        }
    }

    // Generate grid cells (each cell always exists with a centered plus sign).
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridColumns; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            const plus = document.createElement('span');
            plus.classList.add('plus');
            plus.textContent = '+';
            cell.appendChild(plus);
            // Right-clicking a cell opens the tooltip menu.
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showTooltipForCell(e, cell);
            });
            gridContainer.appendChild(cell);
        }
    }

    let selectedCell = null;
    let tileCounter = 1;

    // Define tooltip options for grid cells.
    const cellTooltipOptions = [
        { label: '2x1 Upcoming Cue Display (Recommended)', width: 2, height: 1, type: 'UpcomingCueDisplay' },
        { label: '2x2 Script Follow (Required)', width: 2, height: 2, type: 'ScriptFollow' },
        { label: '2x3 Script Follow (Required)', width: 2, height: 3, type: 'ScriptFollow' },
        { label: '1x1 Live Feed', width: 1, height: 1, type: 'LiveFeed' },
        { label: '2x1 Live Feed', width: 2, height: 1, type: 'LiveFeed' },
        { label: '2x2 Live Feed', width: 2, height: 2, type: 'LiveFeed' },
        { label: '2x3 Live Feed', width: 2, height: 3, type: 'LiveFeed' },
        { label: '1x1 Audio Level Monitor', width: 1, height: 1, type: 'AudioLevelMonitor' },
        { label: '1x1 Timer Display', width: 1, height: 1, type: 'TimerDisplay' },
        { label: '2x1 Timer Display', width: 2, height: 1, type: 'TimerDisplay' },
        { label: '2x1 Prompt Display (Recommended)', width: 2, height: 1, type: 'PromptDisplay' },
        { label: 'Delete Tile', action: 'delete' }
    ];

    // Tooltip options for modules (only the delete option).
    const moduleTooltipOptions = [
        { label: 'Delete Tile', action: 'delete' }
    ];

    // Show tooltip for grid cells.
    function showTooltipForCell(e, cell) {
        selectedCell = cell;
        generateTooltip(e, cellTooltipOptions, cell, false);
    }

    // Show tooltip for modules.
    function showTooltipForModule(e, moduleEl) {
        selectedCell = moduleEl;
        generateTooltip(e, moduleTooltipOptions, moduleEl, true);
    }

    // Generate tooltip with given options.
    function generateTooltip(e, options, targetEl, fromModule) {
        tooltip.innerHTML = '';
        options.forEach((option) => {
            const div = document.createElement('div');
            div.classList.add('tooltip-option');
            div.textContent = option.label;
            div.addEventListener('click', () => {
                if (option.action === 'delete') {
                    if (fromModule) {
                        const row = targetEl.dataset.row;
                        const col = targetEl.dataset.col;
                        const cell = getCell(row, col);
                        deleteTile(cell);
                    } else {
                        deleteTile(targetEl);
                    }
                    hideTooltip();
                } else {
                    addTile(targetEl, option.width, option.height, option.type);
                    hideTooltip();
                }
            });
            tooltip.appendChild(div);
        });
        // Add dismiss option.
        const dismissDiv = document.createElement('div');
        dismissDiv.classList.add('tooltip-option');
        dismissDiv.textContent = 'Dismiss';
        dismissDiv.addEventListener('click', hideTooltip);
        tooltip.appendChild(dismissDiv);

        tooltip.style.display = 'block';
        adjustTooltipPosition(e);
    }

    // Adjust tooltip position so it never goes off-screen.
    function adjustTooltipPosition(e) {
        tooltip.style.left = e.pageX + 'px';
        tooltip.style.top = e.pageY + 'px';
        setTimeout(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            let left = e.pageX;
            let top = e.pageY;
            if (left + tooltipRect.width > window.innerWidth) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top + tooltipRect.height > window.innerHeight) {
                top = window.innerHeight - tooltipRect.height - 10;
            }
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        }, 0);
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    document.addEventListener('click', (e) => {
        if (!tooltip.contains(e.target)) {
            hideTooltip();
        }
    });

    // Helper: get a grid cell element by row and column.
    function getCell(row, col) {
        return document.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
    }

    // Add a tile (module) starting at the given cell with specified width, height, and module type.
    function addTile(cell, tileWidth, tileHeight, moduleType) {
        const startRow = parseInt(cell.dataset.row);
        const startCol = parseInt(cell.dataset.col);

        // Ensure the tile fits within grid bounds.
        if (startCol + tileWidth > gridColumns || startRow + tileHeight > gridRows) {
            alert('Tile does not fit in the grid.');
            return;
        }
        // Ensure the target area is free.
        for (let r = startRow; r < startRow + tileHeight; r++) {
            for (let c = startCol; c < startCol + tileWidth; c++) {
                if (gridState[r][c] !== null) {
                    alert('Space is already occupied.');
                    return;
                }
            }
        }
        const tileId = 'tile' + tileCounter++;
        // Mark gridState cells as occupied by this tile.
        for (let r = startRow; r < startRow + tileHeight; r++) {
            for (let c = startCol; c < startCol + tileWidth; c++) {
                gridState[r][c] = { id: tileId };
            }
        }
        // Remove plus signs from affected cells.
        for (let r = startRow; r < startRow + tileHeight; r++) {
            for (let c = startCol; c < startCol + tileWidth; c++) {
                const cellEl = getCell(r, c);
                cellEl.innerHTML = '';
            }
        }
        // Calculate absolute position and dimensions.
        const containerWidth = gridContainer.clientWidth;
        const containerHeight = gridContainer.clientHeight;
        const cellWidth = containerWidth / gridColumns;
        const cellHeight = containerHeight / gridRows;
        const left = startCol * cellWidth;
        const top = startRow * cellHeight;
        const width = tileWidth * cellWidth;
        const height = tileHeight * cellHeight;

        // Create the module element.
        const moduleEl = document.createElement('div');
        moduleEl.classList.add('module');
        moduleEl.style.left = left + 'px';
        moduleEl.style.top = top + 'px';
        moduleEl.style.width = width + 'px';
        moduleEl.style.height = height + 'px';
        // Create a content container inside the module.
        const contentEl = document.createElement('div');
        contentEl.classList.add('module-content');
        if (moduleType === 'TimerDisplay') {
            // Two lines with labels for IRL Time and Show Time.
            contentEl.innerHTML = `<div>IRL Time: 00:00:00</div><div>Show Time: 00:00:00</div>`;
        } else {
            contentEl.textContent = `${tileId} (${tileWidth}x${tileHeight})`;
        }
        moduleEl.appendChild(contentEl);

        // Store grid coordinates, dimensions, and type on the module.
        moduleEl.dataset.row = startRow;
        moduleEl.dataset.col = startCol;
        moduleEl.dataset.tileWidth = tileWidth;
        moduleEl.dataset.tileHeight = tileHeight;
        moduleEl.dataset.moduleType = moduleType;

        // Call the appropriate module function.
        switch (moduleType) {
            case 'UpcomingCueDisplay':
                upcomingCueDisplay(moduleEl);
                break;
            case 'ScriptFollow':
                scriptFollow(moduleEl);
                break;
            case 'LiveFeed':
                liveFeed(moduleEl);
                break;
            case 'AudioLevelMonitor':
                audioLevelMonitor(moduleEl);
                break;
            case 'TimerDisplay':
                timerDisplay(moduleEl);
                break;
            case 'PromptDisplay':
                promptDisplay(moduleEl);
                break;
            default:
                break;
        }

        // Add right-click functionality.
        moduleEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showTooltipForModule(e, moduleEl);
        });

        moduleEl.id = tileId;
        moduleLayer.appendChild(moduleEl);
    }

    // Delete the tile occupying the given cell.
    function deleteTile(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellState = gridState[row][col];
        if (!cellState) {
            alert('No tile to delete here.');
            return;
        }
        const tileId = cellState.id;
        let minRow = gridRows, maxRow = -1, minCol = gridColumns, maxCol = -1;
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridColumns; c++) {
                if (gridState[r][c] && gridState[r][c].id === tileId) {
                    minRow = Math.min(minRow, r);
                    maxRow = Math.max(maxRow, r);
                    minCol = Math.min(minCol, c);
                    maxCol = Math.max(maxCol, c);
                }
            }
        }
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (gridState[r][c] && gridState[r][c].id === tileId) {
                    gridState[r][c] = null;
                    const cellEl = getCell(r, c);
                    cellEl.innerHTML = '';
                    const plus = document.createElement('span');
                    plus.classList.add('plus');
                    plus.textContent = '+';
                    cellEl.appendChild(plus);
                }
            }
        }
        const moduleEl = document.getElementById(tileId);
        if (moduleEl) {
            moduleEl.remove();
        }
    }

    // Recalculate positions and sizes on window resize.
    function recalcModules() {
        const containerWidth = gridContainer.clientWidth;
        const containerHeight = gridContainer.clientHeight;
        const cellWidth = containerWidth / gridColumns;
        const cellHeight = containerHeight / gridRows;
        document.querySelectorAll('.module').forEach((moduleEl) => {
            const startRow = parseInt(moduleEl.dataset.row);
            const startCol = parseInt(moduleEl.dataset.col);
            const tileWidth = parseInt(moduleEl.dataset.tileWidth);
            const tileHeight = parseInt(moduleEl.dataset.tileHeight);
            moduleEl.style.left = (startCol * cellWidth) + 'px';
            moduleEl.style.top = (startRow * cellHeight) + 'px';
            moduleEl.style.width = (tileWidth * cellWidth) + 'px';
            moduleEl.style.height = (tileHeight * cellHeight) + 'px';
            if (moduleEl.dataset.moduleType === 'TimerDisplay') {
                const contentEl = moduleEl.querySelector('.module-content');
                if (contentEl) {
                    contentEl.innerHTML = `<div>IRL Time: ${formatTime(window.globalTimer)}</div><br/><div>Show Time: ${formatTime(window.showTimer)}</div>`;
                }
            }
        });
    }

    window.addEventListener('resize', recalcModules);

    // --- Blank Module Functions ---
    function upcomingCueDisplay(moduleEl) {
        console.log('Upcoming Cue Display initialized:', moduleEl.id);
    }

    function scriptFollow(moduleEl) {
        console.log('Script Follow initialized:', moduleEl.id);

        // Ensure global state for synchronizing all script modules.
        if (!window.globalScriptModules) {
            window.globalScriptModules = [];
        }
        if (typeof window.globalScriptIndex === 'undefined') {
            window.globalScriptIndex = 0;
        }
        if (!window.globalScriptData) {
            window.globalScriptData = null;
            window.globalNavData = null;
            // Fetch and parse the Fountain script once.
            fetch("Big-Fish.fountain.txt") // Adjust the path as needed.
                .then(response => response.text())
                .then(text => {
                    const parsed = parseFountainScript(text);
                    // Global parsed data holds everything.
                    window.globalScriptData = parsed;
                    // Navigation data: skip scene headings.
                    window.globalNavData = parsed.filter(line => line.type !== "scene_heading");
                    // After loading, update all modules.
                    updateAllScriptModules();
                })
                .catch(err => console.error("Error loading script:", err));
        }

        // Create the container for this module.
        const container = document.createElement("div");
        container.classList.add("script-container");
        moduleEl.innerHTML = "";
        moduleEl.appendChild(container);

        // Store this module's update function so global updates can re-render all instances.
        const instance = { updateDisplay };
        window.globalScriptModules.push(instance);

        // Update display using globalNavData and globalScriptIndex.
        function updateDisplay() {
            if (!window.globalNavData) return;
            container.innerHTML = "";

            const navData = window.globalNavData;
            const current = window.globalScriptIndex;

            // For each navigation line, display the character name (if any) and the text.
            // We'll display all lines – if there are few, they fill the container;
            // if many, we show a window with the active line centered.
            let visibleCount = navData.length;
            // Optionally, if there are many lines, show a window (here we choose 11 lines; adjust as needed).
            if (navData.length > 11) {
                visibleCount = 11;
            }
            const half = Math.floor(visibleCount / 2);
            let start = current - half;
            let end = current + half;
            if (start < 0) {
                start = 0;
                end = visibleCount - 1;
            }
            if (end >= navData.length) {
                end = navData.length - 1;
                start = Math.max(0, end - visibleCount + 1);
            }

            // Create a fragment to build the display.
            const frag = document.createDocumentFragment();
            for (let i = start; i <= end; i++) {
                const line = navData[i];
                const lineWrapper = document.createElement("div");
                lineWrapper.classList.add("line-wrapper");
                // If this is the active line, mark it.
                if (i === current) {
                    lineWrapper.classList.add("active-line-wrapper");
                }
                // Every line gets its character name above it.
                const charDiv = document.createElement("div");
                charDiv.classList.add("line-character");
                // Names are black.
                charDiv.innerHTML = line.character ? `<span style="color:black;">${line.character}</span>` : "";
                lineWrapper.appendChild(charDiv);

                // Now create the text element.
                const textEl = document.createElement("p");
                textEl.classList.add("line-text");
                // Apply formatting based on type.
                switch (line.type) {
                    case "dual_dialogue":
                        textEl.innerHTML = `
            <div class="dual-dialogue">
              <div class="dual-dialogue-header">
                <span class="line-character" style="color:black;">${line.dual[0].character || ""}</span> | <span class="line-character" style="color:black;">${line.dual[1].character || ""}</span>
              </div>
              <div class="dual-dialogue-content">
                <span>${line.dual[0].text}</span> | <span>${line.dual[1].text}</span>
              </div>
          </div>`;
                        break;
                    case "transition":
                        textEl.classList.add("transition");
                        textEl.innerHTML = `<b>${line.text}</b>`;
                        textEl.style.textAlign = "right";
                        break;
                    case "centered":
                        textEl.classList.add("centered");
                        textEl.innerHTML = `<b>${line.text}</b>`;
                        break;
                    default:
                        // For dialogue, stage direction, lyrics, action, etc.
                        textEl.innerHTML = line.text;
                }
                lineWrapper.appendChild(textEl);
                frag.appendChild(lineWrapper);
            }
            container.appendChild(frag);

            // If the number of nav lines is small, fill the container height.
            if (window.globalNavData.length <= 11) {
                container.classList.add("fill-container");
            } else {
                container.classList.remove("fill-container");
            }

            // Scroll the container so the active line is vertically centered.
            const activeEl = container.querySelector(".active-line-wrapper");
            if (activeEl) {
                container.scrollTo({
                    top: activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2,
                    behavior: "smooth"
                });
            }
        }

        // Expose this module's update function.
        function updateAll() {
            updateDisplay();
        }

        // Immediately update this instance.
        updateDisplay();

        // Global update function to update all script modules.
        function updateAllScriptModules() {
            if (!window.globalScriptModules) return;
            window.globalScriptModules.forEach(mod => {
                if (mod.updateDisplay) mod.updateDisplay();
            });
        }

        // Register global update function if not already registered.
        if (!window.__scriptModuleKeydownRegistered) {
            document.addEventListener("keydown", globalKeyHandler);
            window.__scriptModuleKeydownRegistered = true;
        }

        // Global keydown handler to navigate and synchronize all modules.
        function globalKeyHandler(e) {
            if (!window.globalNavData) return;
            if (e.key === "ArrowDown") {
                if (window.globalScriptIndex < window.globalNavData.length - 1) {
                    window.globalScriptIndex++;
                    updateAllScriptModules();
                }
            } else if (e.key === "ArrowUp") {
                if (window.globalScriptIndex > 0) {
                    window.globalScriptIndex--;
                    updateAllScriptModules();
                }
            } else if (e.key.toLowerCase() === "r") {
                // Return to top.
                window.globalScriptIndex = 0;
                updateAllScriptModules();
            }
        }

        //#region PARSER FUNCTIONS
        function parseFountainScript(script) {
            const lines = script.split("\n");
            const parsedLines = [];
            let lastCharacter = "";
            let dualBuffer = null;

            lines.forEach(line => {
                line = line.trim();
                if (!line) return;
                // Skip metadata lines (title, author, date, etc.)
                if (/^(Title:|Author:|Date:)/i.test(line)) return;

                // New feature: Lines starting with "." as scene headings.
                if (line.startsWith(".")) {
                    parsedLines.push({
                        type: "scene_heading",
                        text: formatText(line.slice(1).trim())
                    });
                    return;
                }

                // Existing scene headings starting with INT. or EXT.
                if (/^(INT\.|EXT\.)/.test(line)) {
                    parsedLines.push({
                        type: "scene_heading",
                        text: formatText(line)
                    });
                    return;
                }

                // New feature: Lines starting with "!" as action.
                if (line.startsWith("!")) {
                    parsedLines.push({
                        type: "action",
                        text: formatText(line.slice(1).trim()),
                        character: lastCharacter
                    });
                    return;
                }

                // New feature: Lines starting with "@" as character.
                if (line.startsWith("@")) {
                    lastCharacter = formatText(line.slice(1).trim());
                    return;
                }

                // Check for character lines: all uppercase and not containing "(".
                if (line === line.toUpperCase() && !line.includes("(")) {
                    lastCharacter = formatText(line);
                    return;
                }

                // If the line is a stage direction (wrapped in parentheses).
                if (line.startsWith("(") && line.endsWith(")")) {
                    parsedLines.push({
                        type: "stage_direction",
                        text: formatText(line),
                        character: lastCharacter
                    });
                    return;
                }

                // If the line is marked as lyrics (starts with "~").
                if (line.startsWith("~")) {
                    parsedLines.push({
                        type: "lyrics",
                        text: `<i>${formatText(line.slice(1).trim())}</i>`,
                        character: lastCharacter
                    });
                    return;
                }

                // If the line is a transition (keywords like FADE TO, CUT TO, etc.).
                if (/FADE TO BLACK|CUT TO BLACK|DISSOLVE TO BLACK|FADE OUT/i.test(line)) {
                    parsedLines.push({
                        type: "transition",
                        text: formatText(line)
                    });
                    return;
                }

                // If the line is centered (starts with ">").
                if (line.startsWith(">")) {
                    parsedLines.push({
                        type: "centered",
                        text: formatText(line.slice(1).trim()),
                        character: lastCharacter
                    });
                    return;
                }

                // Otherwise, it's dialogue.
                // Check for dual dialogue marker (e.g., ending with "^").
                let isDual = false;
                if (line.endsWith("^")) {
                    isDual = true;
                    line = line.slice(0, -1).trim();
                }
                const dialogueObj = {
                    type: "dialogue",
                    text: formatText(line),
                    character: lastCharacter
                };
                if (isDual) {
                    if (dualBuffer) {
                        // Combine dual dialogue: store both dialogue objects in an array.
                        parsedLines.push({
                            type: "dual_dialogue",
                            dual: [dualBuffer, dialogueObj]
                        });
                        dualBuffer = null;
                    } else {
                        dualBuffer = dialogueObj;
                    }
                } else {
                    if (dualBuffer) {
                        // Flush the dual buffer if it exists.
                        parsedLines.push(dualBuffer);
                        dualBuffer = null;
                    }
                    parsedLines.push(dialogueObj);
                }
            });
            if (dualBuffer) {
                parsedLines.push(dualBuffer);
                dualBuffer = null;
            }
            return parsedLines;
        }
        //#endregion PARSER FUNCTIONS

        // Format text: supports *bold*, _italics_, **bold italics**, __underline__.
        function formatText(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<b><i>$1</i></b>')
                .replace(/\*(.*?)\*/g, '<b>$1</b>')
                .replace(/__(.*?)__/g, '<u>$1</u>')
                .replace(/_(.*?)_/g, '<i>$1</i>');
        }
    }


    // TODO: DO
    function promptDisplay(moduleEl) {
        console.log('Prompt Display initialized:', moduleEl.id);
    }

    function timerDisplay(moduleEl) {
        // Create a content container inside the module if not already present.
        let contentEl = moduleEl.querySelector('.module-content');
        if (!contentEl) {
            contentEl = document.createElement('div');
            contentEl.classList.add('module-content');
            moduleEl.innerHTML = '';
            moduleEl.appendChild(contentEl);
        }

        // Global initialization (only once)
        if (!window.timerInitialized) {
            window.timerInitialized = true;
            window.showTimer = 0;
            window.timerStarted = false;
            window.showTimeRunning = false;
            window.timerInterval = null;
            window.timerModuleElements = [];

            // Key controls for timer (applied once globally)
            window.addEventListener('keydown', function keyHandler(e) {
                if (e.code === 'Space') {
                    if (!window.timerStarted) {
                        startTimer();
                    }
                } else if (e.key.toLowerCase() === 'p') {
                    togglePauseTimer();
                } else if (e.key.toLowerCase() === 'r') {
                    resetTimer();
                }
            });

            // Define the timer functions on the window object.
            window.startTimer = function() {
                window.timerStarted = true;
                window.showTimeRunning = true;
                window.timerInterval = setInterval(() => {
                    if (window.showTimeRunning) {
                        window.showTimer += 10;
                    }
                    updateTimerDisplay();
                }, 10);
            };

            window.togglePauseTimer = function() {
                window.showTimeRunning = !window.showTimeRunning;
            };

            window.resetTimer = function() {
                window.showTimer = 0;
                if (window.timerStarted) {
                    clearInterval(window.timerInterval);
                    window.startTimer();
                }
                updateTimerDisplay();
            };

            window.formatTime = function(ms) {
                const hours = Math.floor(ms / 3600000);
                const minutes = Math.floor((ms % 3600000) / 60000);
                const seconds = Math.floor((ms % 60000) / 1000);
                const pad = (n) => n.toString().padStart(2, '0');
                return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
            };

            window.updateTimerDisplay = function() {
                const timeStr = window.formatTime(window.showTimer);
                window.timerModuleElements.forEach((el) => {
                    const cnt = el.querySelector('.module-content');
                    if (cnt) {
                        cnt.innerHTML = timeStr;
                    }
                });
            };
        }

        // Register this module for timer updates.
        window.timerModuleElements.push(moduleEl);
        // Initialize the display.
        window.updateTimerDisplay();

        console.log('Timer Display initialized:', moduleEl.id);
    }

});
