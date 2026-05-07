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
}

// =====================
// INTERACTION
// =====================

// Convert a mouse event's pixel coordinates into a grid cell.
// Returns { row, col } or null if the click was outside the grid.
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

// When the canvas is clicked, place the selected tile at the clicked cell
canvas.addEventListener("click", (event) => {
  const cell = eventToCell(event);
  if (cell === null) return;

  world[cell.row][cell.col] = selectedTile;
  render();
});

// Wire up the toolbar buttons
const toolbarButtons = document.querySelectorAll("#toolbar button");

toolbarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Update the selected tile
    selectedTile = button.dataset.tile;

    // Update visual highlight: remove .active from all, add to this one
    toolbarButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
  });
});

// Highlight the default-selected button on load
document.querySelector(`#toolbar button[data-tile="${selectedTile}"]`)
  .classList.add("active");

// =====================
// GO
// =====================

render();
console.log(`World initialized: ${ROWS} rows x ${COLS} cols`);