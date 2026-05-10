// =====================
// SETUP
// =====================

const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 32;
const COLS = canvas.width / TILE_SIZE;
const ROWS = canvas.height / TILE_SIZE;

const TILE = {
  EMPTY: "empty",
  ROAD: "road",
  BUILDING: "building",
  PARK: "park"
};

const TILE_COLORS = {
  [TILE.EMPTY]: "#ffffff",
  [TILE.ROAD]: "#555555",
  [TILE.BUILDING]: "#a0522d",
  [TILE.PARK]: "#7cba7c"
};

// =====================
// WORLD STATE
// =====================

// 2D array — every cell starts as empty
const world = [];
for (let row = 0; row < ROWS; row++) {
  const rowArray = [];
  for (let col = 0; col < COLS; col++) {
    rowArray.push(TILE.EMPTY);
  }
  world.push(rowArray);
}

// Currently-selected tile type. Default to road.
let selectedTile = TILE.ROAD;

// Interaction mode: "paint", "set-start", or "set-end"
let mode = "paint";

// The start and end cells for pathfinding (each is { row, col } or null)
let startCell = null;
let endCell = null;

// Currently-hovered cell, or null if mouse isn't over the canvas
let hoveredCell = null;

// Track whether the mouse button is held down
let isPainting = false;

// =====================
// RENDERING
// =====================

function drawTile(row, col) {
  const tileType = world[row][col];
  const color = TILE_COLORS[tileType];
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
}

function drawCellOutline(row, col, color, thickness) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.strokeRect(x + thickness / 2, y + thickness / 2,
                 TILE_SIZE - thickness, TILE_SIZE - thickness);
}

function drawGrid() {
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;

  for (let col = 0; col <= COLS; col++) {
    const x = col * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let row = 0; row <= ROWS; row++) {
    const y = row * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function render() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      drawTile(row, col);
    }
  }
  drawGrid();

  // Draw start cell marker (green ring)
  if (startCell !== null) {
    drawCellOutline(startCell.row, startCell.col, "#22aa22", 4);
  }

  // Draw end cell marker (red ring)
  if (endCell !== null) {
    drawCellOutline(endCell.row, endCell.col, "#cc2222", 4);
  }

  // Hover preview: translucent square over the cell under the mouse
  if (hoveredCell !== null) {
    const x = hoveredCell.col * TILE_SIZE;
    const y = hoveredCell.row * TILE_SIZE;
    ctx.fillStyle = TILE_COLORS[selectedTile];
    ctx.globalAlpha = 0.4;       // 40% opaque
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.globalAlpha = 1.0;       // reset to fully opaque for future drawing
  }
}

// =====================
// INTERACTION
// =====================

function eventToCell(event) {
  const rect = canvas.getBoundingClientRect();
  const pixelX = event.clientX - rect.left;
  const pixelY = event.clientY - rect.top;

  const col = Math.floor(pixelX / TILE_SIZE);
  const row = Math.floor(pixelY / TILE_SIZE);

  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
    return null;
  }
  return { row, col };
}

function handleCanvasClick(event) {
  const cell = eventToCell(event);
  if (cell === null) return;

  if (mode === "set-start") {
    startCell = cell;
    mode = "paint";
    updateModeButtons();
    render();
    return;
  }

  if (mode === "set-end") {
    endCell = cell;
    mode = "paint";
    updateModeButtons();
    render();
    return;
  }

  // Default: paint mode
  if (world[cell.row][cell.col] === selectedTile) return;
  world[cell.row][cell.col] = selectedTile;
  render();
}

canvas.addEventListener("mousedown", (event) => {
  if (mode === "paint") {
    isPainting = true;
  }
  handleCanvasClick(event);
});

canvas.addEventListener("mousemove", (event) => {
  const cell = eventToCell(event);
  hoveredCell = cell;

  if (isPainting && mode === "paint") {
    handleCanvasClick(event);
  } else {
    render();
  }
});

canvas.addEventListener("mouseup", () => {
  isPainting = false;
});

canvas.addEventListener("mouseleave", () => {
  isPainting = false;
  hoveredCell = null;
  render();
});

function updateModeButtons() {
  const startBtn = document.getElementById("set-start-btn");
  const endBtn = document.getElementById("set-end-btn");

  startBtn.classList.toggle("active", mode === "set-start");
  endBtn.classList.toggle("active", mode === "set-end");
}

// =====================
// TOOLBAR (TILE BUTTONS)
// =====================

// Only the tile-selection buttons (those with data-tile),
// not Save/Load/Clear or mode buttons.
const toolbarButtons = document.querySelectorAll("#toolbar button[data-tile]");

toolbarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedTile = button.dataset.tile;
    mode = "paint";
    updateModeButtons();

    toolbarButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
  });
});

// Highlight the default-selected button on load
document.querySelector(`#toolbar button[data-tile="${selectedTile}"]`)
  .classList.add("active");

// =====================
// MODE BUTTONS (START / END / FIND PATH)
// =====================

document.getElementById("set-start-btn").addEventListener("click", () => {
  mode = "set-start";
  updateModeButtons();
});

document.getElementById("set-end-btn").addEventListener("click", () => {
  mode = "set-end";
  updateModeButtons();
});

document.getElementById("find-path-btn").addEventListener("click", () => {
  console.log("Find Path clicked — pathfinding not yet implemented");
  // We'll fill this in during F2
});

// =====================
// SAVE / LOAD / CLEAR
// =====================

document.getElementById("save-btn").addEventListener("click", () => {
  const json = JSON.stringify(world);
  localStorage.setItem("map-builder-world", json);
  console.log("Map saved");
});

document.getElementById("load-btn").addEventListener("click", () => {
  const json = localStorage.getItem("map-builder-world");
  if (json === null) {
    console.log("No saved map found");
    return;
  }
  const loaded = JSON.parse(json);

  // Replace the contents of `world` in place, so the rest of the code
  // still has the same array reference.
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      world[row][col] = loaded[row][col];
    }
  }
  render();
  console.log("Map loaded");
});

document.getElementById("clear-btn").addEventListener("click", () => {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      world[row][col] = TILE.EMPTY;
    }
  }
  render();
  console.log("Map cleared");
});

// =====================
// KEYBOARD SHORTCUTS
// =====================

const KEY_TO_TILE = {
  "1": TILE.EMPTY,
  "2": TILE.ROAD,
  "3": TILE.BUILDING,
  "4": TILE.PARK
};

window.addEventListener("keydown", (event) => {
  const tile = KEY_TO_TILE[event.key];
  if (tile === undefined) return;

  selectedTile = tile;
  mode = "paint";
  updateModeButtons();

  toolbarButtons.forEach((b) => b.classList.remove("active"));
  document.querySelector(`#toolbar button[data-tile="${tile}"]`)
    .classList.add("active");
});

// =====================
// GO
// =====================

render();
console.log(`World initialized: ${ROWS} rows x ${COLS} cols`);