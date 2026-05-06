// Get a reference to the canvas element in the HTML
const canvas = document.getElementById("map");

// Get the 2D drawing context — this is the object we actually draw with
const ctx = canvas.getContext("2d");

// Configuration: how big each grid cell is, in pixels
const TILE_SIZE = 32;

// Calculate how many columns and rows fit in the canvas
const COLS = canvas.width / TILE_SIZE;   // 640 / 32 = 20
const ROWS = canvas.height / TILE_SIZE;  // 480 / 32 = 15

// Tile types: each tile is one of these strings.
// Centralizing them as constants prevents typos like "rode" vs "road".
const TILE = {
  EMPTY: "empty",
  ROAD: "road",
  BUILDING: "building",
  PARK: "park"
};

// Color for each tile type
const TILE_COLORS = {
  [TILE.EMPTY]: "#ffffff",     // white
  [TILE.ROAD]: "#555555",      // dark gray
  [TILE.BUILDING]: "#a0522d",  // brown
  [TILE.PARK]: "#7cba7c"       // green
};

// THE WORLD: a 2D array of tile types.
// world[row][col] gives you the tile at that position.
// We initialize every cell to "empty".
const world = [];
for (let row = 0; row < ROWS; row++) {
  const rowArray = [];
  for (let col = 0; col < COLS; col++) {
    rowArray.push(TILE.EMPTY);
  }
  world.push(rowArray);
}

// TEMPORARY: hardcode a few tiles so we can see rendering work.
// We'll remove this once clicking is implemented in Step D.
world[2][3] = TILE.ROAD;
world[2][4] = TILE.ROAD;
world[2][5] = TILE.ROAD;
world[5][7] = TILE.BUILDING;
world[8][10] = TILE.PARK;

// Draw a single tile (a filled square) at the given grid position
function drawTile(row, col) {
  const tileType = world[row][col];
  const color = TILE_COLORS[tileType];

  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
}

// Draw the grid lines on top of tiles
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

// Render the whole world: draw every tile, then the grid lines on top.
// This is the function we'll call whenever the world changes.
function render() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      drawTile(row, col);
    }
  }
  drawGrid();
}

render();

console.log(`World initialized: ${ROWS} rows x ${COLS} cols`);