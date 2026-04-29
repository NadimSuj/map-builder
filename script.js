// Get a reference to the canvas element in the HTML
const canvas = document.getElementById("map");

// Get the 2D drawing context — this is the object we actually draw with
const ctx = canvas.getContext("2d");

// Configuration: how big each grid cell is, in pixels
const TILE_SIZE = 32;

// Calculate how many columns and rows fit in the canvas
const COLS = canvas.width / TILE_SIZE;   // 640 / 32 = 20
const ROWS = canvas.height / TILE_SIZE;  // 480 / 32 = 15

// Draw the grid by drawing a bunch of lines
function drawGrid() {
  ctx.strokeStyle = "#ddd";  // light gray lines
  ctx.lineWidth = 1;

  // Vertical lines
  for (let col = 0; col <= COLS; col++) {
    const x = col * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let row = 0; row <= ROWS; row++) {
    const y = row * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

drawGrid();

console.log(`Grid drawn: ${COLS} columns x ${ROWS} rows`);