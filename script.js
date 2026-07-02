// =====================
// SETUP
// =====================

const canvas = document.getElementById("map"); //It locks into and finds the canvas element in the HTML file with the id "map", and assigns it to the variable `canvas`. This allows the JavaScript code to interact with the canvas element, such as drawing on it or responding to user input.
const ctx = canvas.getContext("2d"); //This variable stores an object called a "CanvasRenderingContext2D" object, which gets summoned after we make the call, ".getContext('2d')" on our canvas object that we just found one line above. This object provides a set of methods and properties that allow us to draw and manipulate 2D graphics on the canvas. We can use this context to draw shapes, images, text, and more on the canvas element in our web page.


const TILE_SIZE = 32; // Each tile is 32x32 pixels
const COLS = canvas.width / TILE_SIZE; //The canvas width (found in our HTML file) is 640 pixels, divide that by the tile size (32 pixels) and we get 20 columns. This means that our grid will have 20 columns of tiles across the width of the canvas.
const ROWS = canvas.height / TILE_SIZE; //The canvas height (found in our HTML file) is 480 pixels, divide that by the tile size (32 pixels) and we get 15 rows. This means that our grid will have 15 rows of tiles down the height of the canvas.

const TILE = { //This type of object is called an object literal, or also an enum, in any case, think of it like a dictionary, the key (left side of colon) is the word you look up, the value (right side of the colon) is the definition of that word, ie, the value that you get back when you look up the key.In this case, we have 4 keys: "empty", "road", "building", and "park". Each key has a string value that is the same as the key. This allows us to use TILE.EMPTY, TILE.ROAD, etc. in our code to refer to these specific tile types, which can make our code more readable and easier to maintain. For example, When you write TILE.ROAD in your script, JavaScript looks inside the TILE object for the key ROAD, and instantly replaces it with the string value "road," which makes it easier to understand that we're referring to a road tile in our code, rather than just using the string "road" directly everywhere, which could be less clear and more error-prone. By using the TILE object, we can also easily change the underlying string values if needed, without having to update every instance in our code where we refer to those tile types.
  EMPTY: "empty",
  ROAD: "road",
  BUILDING: "building",
  PARK: "park"
};

const TILE_COLORS = { //Sets the colors for each tile type, using the keys from the TILE object to define the colors. This allows us to easily look up the color for a specific tile type when we want to draw it on the canvas. For example, when we want to draw a road tile, we can use TILE_COLORS[TILE.ROAD] to get the color "#555555" that we defined for roads. This makes our code more organized and easier to maintain, as we can change the colors for each tile type in one place (the TILE_COLORS object) without having to search through our code for every instance where we use those colors.
  [TILE.EMPTY]: "#ffffff", //For empty space 
  [TILE.ROAD]: "#555555", //For roads
  [TILE.BUILDING]: "#a0522d", //For buildings
  [TILE.PARK]: "#7cba7c"//For parks
};

// =====================
// WORLD STATE
// =====================

// In game development/software engineering, this whole entire block is known as the "Application State" or "Single Source of Truth," ie, a place in your code that stores the information of your program so that every data element is stored, updated, and maintained in exactly one place

const world = []; // This variable is a 2D array that represents the grid of tiles in our world. Each element in the world array corresponds to a cell in the grid, and it stores the type of tile that is present in that cell (e.g., empty, road, building, park). The world array is initialized as an empty array, and then we use nested loops to fill it with rows and columns of TILE.EMPTY values. After this initialization, the world variable will contain a 15x20 grid (as defined by ROWS and COLS) where every cell is set to TILE.EMPTY, indicating that the entire grid starts off as empty space. As the user interacts with the application and paints different tiles on the canvas, the corresponding cells in the world array will be updated to reflect those changes.
for (let row = 0; row < ROWS; row++) { //This loop iterates over the number of rows defined by the ROWS constant (which is 15 in this case). For each row, it creates a new array (rowArray) that will represent that row of tiles in our world. Then, it fills that rowArray with TILE.EMPTY values for each column (20 columns in this case, as defined by the COLS constant). Finally, it pushes that rowArray into the world array, effectively creating a 2D array where each element is initialized to TILE.EMPTY. After this loop runs, we will have a world array that represents a grid of 15 rows and 20 columns, with all cells initially set to empty tiles.
  const rowArray = [];
  for (let col = 0; col < COLS; col++) {
    rowArray.push(TILE.EMPTY);
  }
  world.push(rowArray);
}
// This is for when we actually design and "paint" over our grid, think of it as our "paintbrush," When you click on the grid, the application checks this variable to to see which kind of tile it should overwrite the grid with
let selectedTile = TILE.ROAD; // This variable keeps track of which tile type the user has currently selected for painting on the canvas. By default, it is set to TILE.ROAD, which means that when the user clicks on the canvas to paint, it will paint road tiles unless they select a different tile type from the toolbar. The selectedTile variable is updated whenever the user clicks on one of the tile selection buttons in the toolbar, allowing them to switch between different tile types (empty, road, building, park) as they create their map.

//This variable is quite literally for what "mode" we are in currently, it defined what a mouse click on the canvas actually means at that exact moment, the "paint" mode, which is the default, means that we're going to be drawing and placing tiles on canvas, and the 'set=start' and 'set-end' modes is for our pathfinding behaviors respectively
let mode = "paint"; // This variable keeps track of the current interaction mode that the user is in. It can have three possible values: "paint", "set-start", or "set-end". The default mode is "paint", which allows the user to paint tiles on the canvas by clicking and dragging. When the user clicks on the "Set Start" button, the mode changes to "set-start", allowing them to click on a cell in the canvas to designate it as the starting point for pathfinding. Similarly, when they click on the "Set End" button, the mode changes to "set-end", allowing them to click on a cell to designate it as the ending point for pathfinding. The mode variable is used in the event handlers for mouse clicks and movements to determine how to respond to user interactions based on the current mode.

// The start and end cells for pathfinding (each is { row, col } or null). They are initially empty, since when you boot up the program you aren't doing any pathfinding by default, but when you eventually do the pathfinding, it says, the "set-start/set-end" are located in x row and y column in on the coordinate grid
let startCell = null;
let endCell = null;

// Currently-hovered cell, or null if mouse isn't over the canvas, this variable is for tracking exactly where the mouse pointer if floating over the canvas matrix at any given milisecond, the rendering system uses this coordinate to draw that translucent preview box under your cursor before you actually click to paint
let hoveredCell = null;

// Track whether the mouse button is held down. This tracks mouse mechanics for "click-and-drag" drawing, when 'mousedown' fires, this variable becomes true, and additonally while 'mousemove' fires, the script checks if 'isPainting' is true, if it is, it continuously draws roads as your drag, and also: when 'mouseup' fires, it flips back to false so you stop drawing when you let go
let isPainting = false;

// The path found by the most recent search, or null if none. Basically, it stores the successful output of your BFS or A* algorithms, ie, the path that your algorithm found and the group of tiles that lead to that path, if a path is found, this variable get populated with an array of coordinates (i.e. [{row:0, col:1}, {row:0, col:2}, ...]). The 'render()' function keeps track of this variable, and if it isn't null, it highlights those tiles yellow
let currentPath = null;

// =====================
// RENDERING
// =====================

function drawTile(row, col) { // This function is responsible for drawing a single tile on the canvas at the specified row and column. It first looks up the type of tile at that location in the world array, then uses the TILE_COLORS object to get the corresponding color for that tile type. Next, it calculates the pixel coordinates (x, y) for where to draw the tile on the canvas based on its row and column indices. Finally, it sets the fill style to the appropriate color and draws a filled rectangle representing the tile at the calculated position with dimensions equal to TILE_SIZE.
  const tileType = world[row][col]; // e.g., "road", "park", etc.
  const color = TILE_COLORS[tileType]; // e.g., "#555555", etc.
  //Basically the first two variables functions: It looks up what string is sitting at `world[row][col]`, then feeds that string into your palette object to fetch the correct hex color code.
  const x = col * TILE_SIZE; 
  const y = row * TILE_SIZE;
  // purpose of these two variables is: Since HTML5 Canvas doesn't understand matrix indices like "Row 5, Column 2". It only understands pixel locations. This math converts grid coordinates to screen pixels. For example, if row = 2 and col = 5, then: x = 5 times 32 = 160 pixels, and y = 2 times 32 = 64 pixels. So the tile at row 2, column 5 will be drawn starting at pixel (160, 64) on the canvas. This way, each tile is placed in the correct position based on its row and column in the grid.
  ctx.fillStyle = color;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  // The fillStyle property sets the color that will be used to fill shapes drawn on the canvas. In this case, it sets the fill color to the color corresponding to the tile type at the given row and column. The fillRect method then draws a filled rectangle at the specified (x, y) pixel coordinates with a width and height equal to TILE_SIZE. This effectively draws the tile on the canvas in the correct position and with the correct color based on its type.
  // when ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE) fires, it looks at the current global fillStyle you set a line earlier, walks over to the pixel coordinates (x,y) you gave it, and stamps out a solid 32×32 square using that color.
}

function drawCellOutline(row, col, color, thickness) { // This function is for drawing the green and red rings around the start and end cells, it takes in the row and column of the cell you want to draw the outline around, as well as the color and thickness of the outline. It calculates the pixel coordinates (x, y) for the top-left corner of the cell, then uses ctx.strokeRect to draw a rectangle outline around that cell with the specified color and thickness. The math involving thickness / 2 is to ensure that the outline is drawn centered on the edges of the tile, rather than being offset by half its thickness.
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.strokeRect(x + thickness / 2, y + thickness / 2,
                 TILE_SIZE - thickness, TILE_SIZE - thickness);
}

function drawGrid() {
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1; // light gray grid lines

  for (let col = 0; col <= COLS; col++) {  // We draw the grid lines after drawing the tiles, so they appear on top. This loop iterates from 0 to COLS (inclusive) to draw vertical grid lines. For each column index, it calculates the x-coordinate for that column by multiplying the column index by TILE_SIZE. Then it uses ctx.beginPath(), ctx.moveTo(), and ctx.lineTo() to define a vertical line from the top of the canvas (y=0) to the bottom of the canvas (y=canvas.height) at that x-coordinate. Finally, ctx.stroke() is called to actually draw the line on the canvas.
    const x = col * TILE_SIZE; // The x (and y) variable(s) calculate the pixel boundaries or gaps between grid squares by multiplying the current row or column index by TILE_SIZE (32px), which steps the pen forward exactly 32 pixels on every iteration to draw clean lines separating the tiles (e.g., col 0 draws at x=0 forming the left edge, col 1 draws at x=32 forming the boundary between Tile 0 and Tile 1, col 2 draws at x=64 separating Tile 1 and Tile 2, etc., and the exact same multiplication logic applies vertically on the y-axis to draw the horizontal row lines).
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let row = 0; row <= ROWS; row++) { // This loop iterates from 0 to ROWS (inclusive) to draw horizontal grid lines. For each row index, it calculates the y-coordinate for that row by multiplying the row index by TILE_SIZE. Then it uses ctx.beginPath(), ctx.moveTo(), and ctx.lineTo() to define a horizontal line from the left of the canvas (x=0) to the right of the canvas (x=canvas.width) at that y-coordinate. Finally, ctx.stroke() is called to draw the line on the canvas.
    const y = row * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

//The render() function is responsible for drawing the entire state of the world onto the canvas. It first loops through every cell in the grid and calls drawTile() to draw the appropriate tile based on the world array. Then it calls drawGrid() to overlay the grid lines on top of the tiles. After that, it checks if there is a current path (from pathfinding) and highlights those cells with a translucent yellow rectangle. It also checks if there are start and end cells set, and if so, it draws green and red outlines around them respectively. Finally, if there is a hovered cell (where the mouse is currently pointing), it draws a semi-transparent preview of the selected tile at that location. This function is called whenever there is a change in the world state or user interaction that requires the canvas to be updated, so it is  called frequently to ensure that the visual representation on the canvas matches the underlying data in the world array and the current interaction state.
function render() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      drawTile(row, col);
    }
  }
  drawGrid();

  // Draw the path (yellow highlight on each cell of the path)
  if (currentPath !== null) {
    ctx.fillStyle = "rgba(255, 220, 0, 0.6)"; // translucent yellow
    for (const cell of currentPath) {
      const x = cell.col * TILE_SIZE;
      const y = cell.row * TILE_SIZE;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); //It uses a for...of loop to extract every individual coordinate block inside the path array. For each block, it translates the column and row indices to pixel measurements (cell.col * TILE_SIZE) and overlays a translucent yellow square directly on top of the tile. Because it is translucent, you can still see the tile texture peeking through underneath.
    }
  }

  // Draw start cell marker (green ring)
  if (startCell !== null) {
    drawCellOutline(startCell.row, startCell.col, "#22aa22", 4);
  }

  // Draw end cell marker (red ring)
  if (endCell !== null) {
    drawCellOutline(endCell.row, endCell.col, "#cc2222", 4);
  }

  // ^^ If they are not null, it calls drawCellOutline() to frame those exact grid blocks. It creates a 4-pixel thick green border (#22aa22) around the starting cell and a 4-pixel thick red border (#cc2222) around the target endpoint cell.

  // Hover preview: translucent square over the cell under the mouse, it is actually technically drawing/filling in a semi-transparent rectangle on top of the tile that your mouse is currently hovering over, using the selected tile's color but with reduced opacity (40% opaque in this case). This gives you a visual preview of what it would look like if you clicked to paint that tile, without actually changing the underlying tile until you click. As for when is it decided that the tile actually will actually become a *solid* tile when the user clicks, that happens in the next section of the code, in the event handlers for mouse clicks and movements, where it checks if the user is in "paint" mode and if the mouse button is held down, and if so, it updates the world array to set that cell to the selected tile type and then calls render() again to update the canvas with the new tile.
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

function eventToCell(event) {  // The event parameter is for mouse events that occur on the canvas, such as clicks or mouse movements. The purpose of this function is to convert the pixel coordinates of the mouse event (event.clientX and event.clientY) into grid coordinates (row and column indices) that correspond to the cells in our world array. This allows us to determine which cell the user is interacting with based on where they clicked or moved their mouse on the canvas. So basically, based on their mouse movement or click, it determines where on the canvas they are pointing, and then translates that into which in the grid they are point at, so that the rest of the code can know which cell in the world array to update or highlight based on the user's mouse position.
  const rect = canvas.getBoundingClientRect(); //It's a variable, and in it we call the getBoundingClientRect() method on our canvas element. Remember, the canvas element gets the elment in our HTML script with the id "map," so then it calls the getBoundingClientRect() method on that canvas element, which returns a DOMRect object, that provides the precise information about the size of the of an element and its position relative to the browser's viewport (i.e., the visible area of the web page). This information includes properties like left, top, right, bottom, width, and height. In our case, we are particularly interested in the left and top properties, which tell us the pixel coordinates of the top-left corner of the canvas relative to the viewport. We use this information to calculate the mouse's position relative to the canvas when handling mouse events, allowing us to determine which cell in our grid the user is interacting with based on their mouse position.
  const pixelX = event.clientX - rect.left; //event is any movement or click from the mouse, .clientX is the horizontal pixel coordinate of the mouse event relative to the viewport, and rect.left is the horizontal pixel coordinate of the left edge of the canvas relative to the viewport. By subtracting rect.left from event.clientX, we get the horizontal pixel coordinate of the mouse event relative to the canvas itself (i.e., where is it on the canvas(canvas is the element that holds our grid), is it even on the canvas?, etc.). This allows us to determine how far along the canvas (in pixels) the mouse event occurred, which we can then use to calculate which column of the grid the user is interacting with. 
  const pixelY = event.clientY - rect.top;  // Similar to pixelX, event.clientY is the vertical pixel coordinate of the mouse event relative to the viewport, and rect.top is the vertical pixel coordinate of the top edge of the canvas relative to the viewport. By subtracting rect.top from event.clientY, we get the vertical pixel coordinate of the mouse event relative to the canvas (i.e., where is it on the canvas(canvas is the element that holds our grid), is it even on the canvas?, etc.). This allows us to determine how far down the canvas (in pixels) the mouse event occurred, which we can then use to calculate which row of the grid the user is interacting with. 

  const col = Math.floor(pixelX / TILE_SIZE); //Calculates the exact column on the grid that mouse event corresponds to by dividing the pixelX coordinate (the horizontal position of the mouse event relative to the canvas) by TILE_SIZE (the size of each tile in pixels, 32) and using Math.floor() to round down to the nearest whole number. 
  const row = Math.floor(pixelY / TILE_SIZE); // Similar to col, this calculates the exact row on the grid that the mouse event corresponds to by dividing the pixelY coordinate (the vertical position of the mouse event relative to the canvas) by TILE_SIZE and rounding down with Math.floor().

  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {  //If outside the boundaries of the grid, return null. This checks if the calculated row and column indices are outside the valid range of the grid. If row is less than 0 or greater than or equal to ROWS, or if col is less than 0 or greater than or equal to COLS, it means the mouse event occurred outside the canvas area that corresponds to our grid. In such cases, we return null to indicate that there is no valid cell corresponding to that mouse event, which can be used by the rest of the code to ignore interactions that happen outside the grid.
    return null;
  }
  return { row, col }; //Returns an object containing the row and column indices of the cell that corresponds to the mouse event. This allows other parts of the code to easily access the grid coordinates of the cell that the user interacted with, which can then be used for painting tiles, setting start/end points, or any other interactions that depend on knowing which cell is being targeted by the mouse event.
}

function handleCanvasClick(event) {
  const cell = eventToCell(event);
  if (cell === null) return; // I.e.,If the click was outside the grid, do nothing.

  if (mode === "set-start") {
    startCell = cell; //ie, set the startCell variable to the cell that was clicked on, which is the object returned by eventToCell(event) containing the row and column of the clicked cell. This allows the application to remember which cell is designated as the starting point for pathfinding. After setting the startCell, it changes the mode back to "paint" so that subsequent clicks will paint tiles instead of changing the start cell, and then it calls updateModeButtons() to update the UI to reflect the current mode, and finally calls render() to visually update the canvas with the new start cell marker.
    mode = "paint";
    updateModeButtons();
    render();
    return;
  }

  if (mode === "set-end") {  //same logic as the "set-start" block above, but for the end cell instead. It sets the endCell variable to the cell that was clicked on, which allows the application to remember which cell is designated as the ending point for pathfinding. After setting the endCell, it changes the mode back to "paint", updates the mode buttons in the UI, and re-renders the canvas to show the new end cell marker.
    endCell = cell;
    mode = "paint";
    updateModeButtons();
    render();
    return;
  }

  // Default: paint mode, remember, the "cell" variable calls the "eventToCell" function as defined above, meaning, these updates that are happening in the if-statements below are based on actvity such as movement or clicks coming from the mouse, and the "cell" variable is the translated coordinate of where on the grid the mouse is currently pointing at or clicking on, so when we say "world[cell.row][cell.col] = selectedTile", it means, "look at the world array, find the exact row and column that corresponds to where the mouse is clicking or pointing at, and set that cell in the world array to whatever tile type is currently selected for painting (e.g., road, building, park, etc.)"
  if (world[cell.row][cell.col] === selectedTile) return; // If the cell already has the selected Tile (i.e., road, building, park, etc.) then do nothing (return early). This prevents unnecessary updates and re-rendering when the user clicks on a cell that already has the tile type they have selected, which can improve performance and reduce flickering on the canvas. 
  world[cell.row][cell.col] = selectedTile; // If the selected tile type is a new tile type for that cell, then update the world array to set that cell to the selected tile type. This effectively changes the underlying data representation of the world to reflect the user's action of painting a new tile on the canvas. 
  render(); //render new state of the world on the canvas after updating the world array with the new tile type for that cell. This will visually update the canvas to show the newly painted tile, as well as any other changes that may be necessary (e.g., updating the pathfinding visualization if the new tile affects the path).
}

//So, "canvas.addEventListener(.." means that we're telling the browser to keep an eye on yourcanvas and wait in anticipation for a certain action, which brings us to our next element, ' "mousedown", (event) => { ', so "mousedown" corresponds to when the user clicks down on their mouse button, this is dsitinct from "click" which is when the user presses and lets go immediately, "mousedown" quite literally is when the user has their mouse, down. "(event) => {" Okay, so this needs a bit of explanation, this is basically a shortcut for making a function, ie, when you do "function ...(..){...}," etc., so (...)=> { is another way of expressing that, but here in javascript, you do not need to exactly name your functions, that's what's unique about this, and so basically inside the parameter "canvas.addEventListener" function, we define ANOTHER function, using the arrow shortcut. And that function defined by (event)=> goes like this: if the function detects your mode for the canvas is in "paint," then it sets the "isPainting" boolean to true, it basically asks "Is the user currently trying to paint roads/buildings?" This lines up a further domino effect for the "mousemove" event listener down below, by turning the "isPainting" variable to true, you are telling the computer "The user is now holding the brush down. If they move their mouse next, draw a continuous line of tiles!" And to finish off this function, you have the "handleCanvasClick(event)," which calls the function we defined above, so that even if we let go of the mouse, then whatever tile we were hovering over and pressed our mouse button over, we still paint it with our click, even if you don't drag your mouse, you still want a tile to appear immediately where you just clicked, basically, this final line passes your mouse event straight into handleCanvasClick(event), which calls eventToCell under the hood, converts the position to a grid row/column, updates your world array, and renders the solid tile on screen instantly. And that's the function summed up... 
canvas.addEventListener("mousedown", /* On an event,*/ (event) => { 
  if (mode === "paint") {  /*...*/
    isPainting = true; /*...*/
  }
  handleCanvasClick(event); /*...*/
});    /*... do all of this, we define a whole function inside the parameter of another function! (canvas.addEventListener(...))*/

//This event listener waits for the "mousemove" action
canvas.addEventListener("mousemove", (event) => { 
  const cell = eventToCell(event); //Remember the eventToCell() function? The function uses the information from your mouse to get the exact coordinates and the location of the grid block that your mouse is hovering over? Yes, we call that function right here. The instant the mouse moves, the code immediately takes that mouse movement, ie, 'event' and feeds it into your translator function. It calculates the exact grid coordinates (e.g., { row: 4, col: 7 }) under the cursor.
  hoveredCell = cell; // It saves those coordinates directly into your global variable, 'hoveredCell'. This acts as a tracking beacon so your application always knows exactly which square the user is currently looking at.
  if (isPainting && mode === "paint") { //It checks two flags simultaneously, asking: one, Is isPainting true? (Did the user press down their mouse clicker back during the mousedown event and are still holding it?), and two, is the active tool mode set to "paint"? 
    handleCanvasClick(event); //If both are true, it treats this movement exactly like a brand-new click and fires 'handleCanvasClick(event).' This updates the underlying 'world' data array and places a solid tile onto the grid. Because mousemove fires repeatedly as you move, this creates a smooth, continuous stream of solid tiles as you drag your mouse around—like an digital paintbrush!
  } else { //If the user is not holding down the mouse button (or if they are in a different tool mode), the code falls back onto just rendering, the grid, remember, we need to continuously to have the render() because we need to have the translucent cell that appears when we hover over the grid, When render() executes here, it wipes the old frame away and stamps a fresh, see-through "ghost" square right at your new hoveredCell coordinates. This makes the translucent box follow your cursor smoothly around the screen
    render(); 
  }
});

canvas.addEventListener("mouseup", () => { // The exact moment the user releases the mouse button, stop the painting state so moving the mouse no longer draws anything
  isPainting = false;
});

canvas.addEventListener("mouseleave", () => {  //The moment the user's mouse cursor exits the boundaries of a specific html element, specifically in our case, our grid, we stop painting, ie, we set the isPainting global boolean variable to null, it fixes the "stuck brush" bug, so understand this, Imagine you click and drag to paint a road, and you accidentally drag your mouse all the way off the right side of the canvas into the empty whitespace of your webpage. If you let go of your mouse clicker outside the canvas, the canvas will never detect the 'mouseup' event we just looked at! That means isPainting would stay true. The next time you brought your mouse back onto the canvas, it would immediately start violently drawing roads without you even clicking! So that is the problem fixed by when the function detects 'mouseleave' in regards to the isPainting variable. 
  isPainting = false;
  hoveredCell = null;  //In this eventListener we aslo set hoveredCell equal to null, meaning, that since your mouse is out of the grid element, there is no tiles to hover over, By setting 'hoveredCell = null,' you erase the coordinate memory, this tells the rendering engine, There is no valid target under the mouse anymore." 
  render(); //Then finally, inside this event listener, we do a final render() call, Now that 'hoveredCell' is null, this line triggers a fresh redraw of the screen. When render() runs this time, and it gets to the hover preview section, it sees that hoveredCell is null, and completely skips drawing the translucent square, so the moment their mouse leaves the grid, the translucent preview block cleanly vanishes from the screen, making the experience seemless and smooth
});

/* 
Why this function (below) is so crucial to your project:
Think back to the handleCanvasClick function we broke down earlier. When you click the "Set Start" button, your tool switches to "set-start". You click a cell on the grid, and the code says:

"
startCell = cell;
mode = "paint"; // <-- It automatically changes your mode back to paint!
updateModeButtons(); // <-- Calls this function right here!
"

Because the code automatically forces your mode back to "paint" after a single placement, updateModeButtons() evaluates mode === "set-start" as false.
For the user, this creates a beautifully responsive app experience: they click "Set Start" (the button lights up), they click a cell on the grid (the green marker appears), and the button immediately pops back out to unselected all by itself!
*/

function updateModeButtons() {
  //Reaches into the html file and finds the elements with those exact id tags, in this case our set start and end buttons
  const startBtn = document.getElementById("set-start-btn");
  const endBtn = document.getElementById("set-end-btn");

  //'===' is a strict comparison operator, if the two variables being compared are not matching, it instantly sets it to false, javascript can be a loose operating system, for example ' 5 == "5" ' would equal true, but '===' makes it so that we have a stricter comparison 
  // basically, if mode IS "set-start" (True), It adds the "active" class to the button element. This interacts with our css, and it applys a dark-grey background to that element (our set start/end button), otherwise, it restores it back to the original state of the button. Basically, these two lines update the set start and set end buttons so that they are in line with and visually reflect whatever tool mode your JavaScript is currently using 
  startBtn.classList.toggle("active", mode === "set-start");
  endBtn.classList.toggle("active", mode === "set-end");
}

// =====================
// TOOLBAR (TILE BUTTONS)
// =====================

/* 
Summary:
So basically, this toolbar section, the flow is:

- Reach into the HTML doc into the toolbar and, identify and put all the buttons with a specific attribute into a Nodelist
- In the foreach loop, we loop through every button
- On the event of activity, ie, a click, we get the specific string that that button correlates to (road, park, building, etc.) and set the global variable, selectedTile, so that when the user paints now, that tile will appear when they paint
- We set the mode to paint and call updateModeButtons, immediately putting the user back into paint mode and deselecting and deactivating any "set start" or "set end" modes if they were already highlighted, so that after setting a set start/end point, the user can immediately go back to painting thereafter for a more seamless experience 
- Also, whenever the user clicks in between buttons, the program ensures that whatever tool was selected before, it deselects with the selection of a new tool

-Finally, the program ensures that whatever the selectedTile default is, we select that button and put it as active at the beginning of the program/opening the webpage 
*/

// "document.querySelectorAll()" is a method that allows you to select every single element that matches a specific CSS selector (a CSS selector is a string that describes a pattern for matching elements in the HTML document). "#toolbar button[data-tile]" tells the method to look for all <button> elements that are inside an element with the id "toolbar" and that also have a "data-tile" attribute. In our HTML, we have several buttons like <button data-tile="road">Road</button>, <button data-tile="building">Building</button>, etc., so this selector will match all of those buttons. The result of document.querySelectorAll("#toolbar button[data-tile]") is a NodeList (which is similar to an array) containing references to all of those button elements, allowing us to easily add event listeners to them or manipulate them in other ways using JavaScript.
const toolbarButtons = document.querySelectorAll("#toolbar button[data-tile]"); 

//Instead of copying and pasting code for each individual material button, 'forEach' loops through your collection automatically
toolbarButtons.forEach((button) => { //In this method, the parameter 'button' represents each individual button element in the toolbarButtons NodeList as we loop through it. So, for each button that matches the selector "#toolbar button[data-tile]", this function will be executed with 'button' referring to that specific button element. 
  button.addEventListener("click", () => { //When any of those buttons is clicked, this event listener triggers, and it executes the function defined by the arrow syntax. 
    selectedTile = button.dataset.tile; // In HTML, custom attributes prefixed with 'data-' are stored in a special JavaScript property called .dataset. So, if a button has an attribute like data-tile="road", then button.dataset.tile will give you the string "road". This line sets the global variable selectedTile to the value of the data-tile attribute of the clicked button, which determines which type of tile (e.g., road, building, park) will be painted when the user clicks on the canvas. So for example in our HTML we have "<button data-tile="road">Road (2)</button>," button.dataset.tile will get that "road" string, and then we set SelectedTile to "road." This means that when the user clicks on the "Road" button, selectedTile becomes "road", and then when they click on the canvas, it will paint road tiles.
    mode = "paint";  
    updateModeButtons();
    // Selecting a building material automatically snaps your general interaction mode back to "paint". It then immediately executes updateModeButtons(), ensuring that if the user had "Set Start" or "Set End" highlighted, those operational modes are instantly deactivated and un-highlighted. This is a design choice to streamline the user experience, so that after setting a start or end point, the user can immediately start painting without having to manually switch back to paint mode.

    //This is for the seamless experience of clicking between buttons on the toolbar, with selecting a new tool deselecting the other ones as you go, in order to do this, the code runs a quick internal loop (toolbarButtons.forEach((b) => ...)) that strips the “active” CSS class off of every single tile button in the entire toolbar. Once the board is wiped entirely clean, ‘button.classList.add("active”)’ highlights  only the exact button the user just clicked. Your CSS takes over from there, giving that single button its prominent active border.
    toolbarButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
  });
});

// Basically this line ensures whatever your default selected button is on start, it is highlighted and active when you open the program/webpage. Notice it has special notation, '`#toolbar button[data-tile="${selectedTile}"]`', this is called a template literal, and it allows you to embed the value of the selectedTile variable directly into the string. So if selectedTile is "road", this will effectively become '#toolbar button[data-tile="road"]', which will select the button element that has data-tile="road". Then it adds the "active" class to that button, making sure that the default selected tile type is visually highlighted in the toolbar when the page loads.
document.querySelector(`#toolbar button[data-tile="${selectedTile}"]`)
  .classList.add("active"); //So with this template literal, whatever the selected tile is, it will automatically set it to active at the start of the program

// =====================
// MODE BUTTONS (START / END / FIND PATH)
// =====================


// We get the element with the id "set-start-btn" from the HTML document, and add an event listener to it that listens for the "click" event. When the button is cliked, it executes the arrow function defined in the second argument. Inside that function, we set the global variable mode to "set-start", which changes the current interaction mode of the application to allow the user to set the starting point for pathfinding. After changing the mode, we call updateModeButtons() to update the visual state of the buttons in the UI, ensuring that the "Set Start" button is highlighted to reflect that it is now active.
document.getElementById("set-start-btn").addEventListener("click", () => {
  mode = "set-start";
  updateModeButtons();
});

//Same situation as the "set-start-btn" event listener above, but this one is for the "set-end-btn" button. When the user clicks the "Set End" button, it sets the mode to "set-end", allowing the user to designate the ending point for pathfinding. It then calls updateModeButtons() to visually indicate that the "Set End" button is now active.
document.getElementById("set-end-btn").addEventListener("click", () => {
  mode = "set-end";
  updateModeButtons();
});

// Find the 'find-path-btn' element from the HTML document and add a click even listener to it. When the button is clicked, it executes the arrow function defined in the second argument. Inside that function, we see:
document.getElementById("find-path-btn").addEventListener("click", () => {
  if (startCell === null || endCell === null) { //Checks to see if either the startCell or endCell is null, which would mean that the user has not set both a starting point and an ending point for pathfinding. If either is null, it logs a message to the console indicating that both cells need to be set before attempting to find a path. Because you can't find a path without both a start and an end, then it sets currentPath to null (clearing any previously found path) and calls render() to update the canvas, ensuring that no path is displayed. Finally, it returns early from the function, preventing any further execution of the pathfinding logic.
    console.log("Set both start and end cells first");
    currentPath = null;
    render();
    return;
  }

  const path = aStar(startCell, endCell); //sets the variable path to the result of calling the aStar() function with startCell and endCell as arguments. We will discuss aStar in detail later, but in short, it attempts to find the shortest path from the start cell to the end cell using the A* search algorithm. The result will either be an array of cells representing the path or null if no path exists. 

  if (path === null) { //if the aStar() function returns null, it means that no valid path could be found between the start and end cells, so it logs a message to the console indicating that no path was found. And it sets currentPath to null, clearing any previously found path, then calls render() to update the canvas, ensuring that no path is displayed visually.
    console.log("No path found between start and end");
    currentPath = null;
  } else {  //If it finds a path, it logs a message to the consol indicating that a path was found and displays the length of the path(i.e., the number of cells in the path). It then sets currentPath to the found path, which will be used in the render() function to visually highlight the path on the canvas. 
    console.log(`Path found, length ${path.length}`);
    currentPath = path;
  }
  //Finally, it calls render() to update the canvas and display the newly found path
  render();
});

// =====================
// SAVE / LOAD / CLEAR
// =====================

//Gets the element with the id "save-btn" from the HTML document, on click, it executes the arrow function. 
document.getElementById("save-btn").addEventListener("click", () => {
  const json = JSON.stringify(world); //Browsers can't directly store complex data structures like arrays or object in localStorage, they can only store simple text strings, so we convert the world array into a JSON string using JSON.stringify(world). This makes a text-based representation of the world array, which can be easily stored and later retrieved from localStorage. 
  localStorage.setItem("map-builder-world", json); //localStorage is a built-in browser database that saves data in key-value pairs (a key-value pair is a set of two linked data items: a key, which is a unique indentifier, and a value, which is the data associated with that key). In this case, we use the key "map-builder-world" to store the JSON string representation of the world array. This allows us to persist the current state of the map so that it can be retrieved later, even after the user closes or refreshes the browser. 
  console.log("Map saved"); //Console log message to indicate that the map has been successfully saved to localStorage. 
});

document.getElementById("load-btn").addEventListener("click", () => { 
  const json = localStorage.getItem("map-builder-world"); //get the JSON string representation of the world array from local Storage using the key "map-builder-world". If no data is found for that key, it will return null. This allows us to retrieve the previously saved state of the map so that we can restore it in the application.
  if (json === null) {
    console.log("No saved map found");
    return;
  }

  //These next few lines are basically, "Restore our simplified JSON file back into a regular JavaScript array, then fill back in the world array with the loaded data, then render it to the canvas."

  const loaded = JSON.parse(json); //Convert the JSON string back into a JavaScript array using JSON.parse(json). This reconstructs the original world array from its text-based representation, allowing us to work with it as a normal array in our application. This is stored in a temporary variable called loaded, which we will use to update the actual world array.

  // Replace the contents of our world array with the loaded data. This loop iterates over each row and column of the world array, copying the corresponding values from the loaded array. This effectively restores the state of the map to what was saved previously, allowing the user to continue working with their map as it was when they last saved it.
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      world[row][col] = loaded[row][col];
    }
  }
  render(); //render() to update the canvas and visually display the loaded map on the screen, reflecting the restored state of the world array.
  console.log("Map loaded"); //Console log message to indicate that the map been successfully loaded from localStorage and rendered on the canvas.
});

//On the click event of the "clear-btn" button, this function executes. Using a nested loop, it interates over every single tile on the canvas and sets them as an empty tile, effectively clearing out the entire grid.
document.getElementById("clear-btn").addEventListener("click", () => {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      world[row][col] = TILE.EMPTY;
    }
  }
  render(); //Render
  console.log("Map cleared"); //Console log that map has been cleared
});

// =====================
// KEYBOARD SHORTCUTS
// =====================

//Hashmap for pairing different tile types to a specific number
const KEY_TO_TILE = {
  "1": TILE.EMPTY,
  "2": TILE.ROAD,
  "3": TILE.BUILDING,
  "4": TILE.PARK
};

//Notice how it's "window.addEventListener()," meaning, it's not just a specific HTML element waiting an an event, it's the whole window, anyways, with the event of a "keydown," ie, when any key on the keyboard is pressed down, this method fires, and the arrow function is executed
window.addEventListener("keydown", (event) => {
  const tile = KEY_TO_TILE[event.key]; //event.key returns a string representing the exact character or the human-readable name of the physical key pressed on the keyboard, so, if you press the "2" key, event.key is exactly "2", or "a", "Enter", "ArrowUp" or whatever other character you press on the keyboard. So, it takes that returned string and maps it onto our hashmap
  if (tile === undefined) return; // In javscript,  a hashmap returns undefined if you input a key that's not within that hashmap, so, if our pressed down key does not match any key in our "KEY_TO_TILE" map, we simply cut the oepration short and return, so the clause tells the program: "If they pressed a key we don't care about, drop out of the function immediately and do absolutely nothing."

  //If the tile is defined, ie, passing it through "KEY_TO_TILE" returns a genuine value defined within the hashmap (i.e., TILE.EMPTY, TILE.ROAD, TILE.BUILDING, TILE.PARK), we proceed with the following:
  //Set the our global variable, selectedTile, equal to constant "tile" defined within this function, set the mode to "paint," so that the user can seamlessly begin to paint on the canvas following pressing the shortcut key, and call updateModeButtons() function, so that if we have any "set start" or "set end" buttons active, it updates and makes it so they are not when we use our shortcut keys for painting
  selectedTile = tile;
  mode = "paint";
  updateModeButtons();

  //It loops through every button element (b) in our toolbar and for each of them strips away their "active" state
  //Then, it finds our specific "tile" element that we got earlier (the const tile, made from running the pressed down key character through the KEY_TO_TILE hashmap) using document.querySelector() and sets it to active
  toolbarButtons.forEach((b) => b.classList.remove("active"));
  document.querySelector(`#toolbar button[data-tile="${tile}"]`)
    .classList.add("active");
}); 

// =====================
// PATHFINDING
// =====================

// In JavaScript, two distinct objects containing the exact same data (e.g., {row: 5, col: 2} and {row: 5, col: 2}) are considered not equal by standard comparisons or data sets, so, the solution is: it flattens coordinate structures into unique strings like "5,2". This allows your tracking collections (Set and Map) to reliably compare and store cell states without object-reference bugs.
// So, we have this template literal, if you do know, then a template literal is way of making strings so that we do not have to do concatentaiton, so before, we would do something like ' ("Hello world my age" + age int variable) ', but with template literals, we have our notations of '`' backticks and '${},' so that we can now do (`Hello, my name is ${name} and I am ${age} years old.`) and integrate the non-print statement variables seamlessly.
//So what we do here with this function, is basically we just return a string corresponding to the row and column number of the cell parameter passed through, so "const cell = { row: 5, col: 12 };" Passing it through this template literal turns it into a plain text string: "5,12"
function cellKey(cell) {
  return `${cell.row},${cell.col}`;
}

// Get the up-to-4 orthogonal neighbors of a cell, clipped to the grid bounds, if it's out of bounds, we don't count it
function neighbors(cell) {
  const result = [];
  //This this variable is an array of integer pairs, it represents the row & column of surrounding "neighbor" cells, so for example, north's coordinates, { dr: -1, dc:  0 } is like that because north is one row ABOVE, ie, the previous row, the current cell, and the same logic with the rest of the integer pairs
  //dr stands for Delta Row (Change in Row) and dc stands for Delta Column (Change in Column)
  const directions = [
    { dr: -1, dc:  0 }, // north
    { dr:  1, dc:  0 }, // south
    { dr:  0, dc: -1 }, // west
    { dr:  0, dc:  1 }, // east
  ];

  //Loop through all the four cardinal directions defined in the directions[] array
  for (const { dr, dc } of directions) {
    // This is how we get our adjacent neighbor cells coordinates, we apply the Delta Row (dr) and Delta Column (dc) variables to the current cell's row/column position to calculate the exact coordinate of the adjacent neighbor.
    const newRow = cell.row + dr;
    const newCol = cell.col + dc;
    //If any of our adjacent neighbors fall outside the index boundaries (< 0; or exceeding total rows/columns as defined by our global ROWS and COLS constants) then we execute 'continue,' which tells the loop to immediately drop everything, discard this invalid coordinate, and skip directly to the next direction in the array.
    if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
      continue;
    }
    // 'row: newRow, col: newCol' are variable declarations, the variables are being set to the neighbor cells coordinates (newRow, newCol), and we use .push() to append it to our collection array
    result.push({ row: newRow, col: newCol });
  }
  //return our result array, i.e., the coordinates to our neighboring cells
  return result;
}

// Returns an array of cells from start to end (inclusive), or null if
// no path exists.
//Breadth-First Search (BFS) is an algorithm that searches a grid blindly and uniformly, expanding outward from the starting point in concentric rings (like a ripple in water) until it bumps into the destination. It guarantees finding the shortest path on an unweighted grid, but it explores a massive number of cells to get there.
function bfs(start, end) {
  //First, sanity check, if we're not on road tiles, we cannot begin to find a path because vehicles may not drive off-road
  if (world[start.row][start.col] !== TILE.ROAD) return null;
  if (world[end.row][end.col] !== TILE.ROAD) return null;
 
  //how many nodes we explored
  let nodesExplored = 0;

  const queue = [start]; // BFS relies on a queue data structure, which, as you know, follows a First-In, First-Out (FIFO) strategy, we start with putting our initial starting cell
  const visited = new Set(); //A Set() is an object in javascript that is similar to an array in the sense that it used to store multiple values, however, the difference with a Set is that the values of the Set are a collection of unique values, meaning you cannot have duplicate values or objects inside the Set, so if I add two values to the Set, and then try and add the first value to the Set again, that Set's length will still remain 2
  visited.add(cellKey(start)); //Set the Visited Set()'s first value as our starting cell's string coordinates
  const cameFrom = new Map(); // A Map() is a collection of key-value pairs, similar to an object in JavaScript, but with some differences. In a Map, keys can be of any type (not just strings or symbols), and they maintain the order of insertion. In this case, cameFrom will be used to keep track of the parent cells for each cell that is explored during the BFS. The key will be the string representation of a cell's coordinates (from cellKey), and the value will be the cell object that led to it. This allows us to reconstruct the path once we reach the end cell. 

  while (queue.length > 0) { //As long as there are cells waiting in line, the loop keeps running
    const current = queue.shift(); //shift() removes the first element from an array and returns that removed element. This method modifies (mutates) the original array by shifting all subsequent elements one position to the left 
    nodesExplored++; //Increment the number of nodes explored by 1, so we can keep track of how many cells we explored in our search for a path

    //If we've reach the end cell, we log the number of nodes explored and call reconstructPath() to build the path from start to end using the cameFrom map. The function returns the reconstructed path as an array of cells. 
    if (current.row === end.row && current.col === end.col) {
      console.log(`BFS explored ${nodesExplored} nodes`);
      return reconstructPath(cameFrom, end);
    }

    // The code loops through the up-to-4 adjacent cells provided by the neighbors() function 
    for (const next of neighbors(current)) {
      const key = cellKey(next); //We convert the next cell's coordinates into a unique string key using cellKey(next). This key will be used to check if the cell has already been visited and to store its parent in the cameFrom map.
      if (world[next.row][next.col] !== TILE.ROAD) continue; //If next cell is not a road tile, we skip it and continue to the next neighbor
      if (visited.has(key)) continue; //If the next cell has already been visited (i.e., its key is in the visited set), we skip it and continue to the next neighbor. This prevents us from revisiting cells and getting stuck in loops.
      visited.add(key); //If the next cell is valid and unvisited, we mark it as visited by adding its key to the visited set. This ensures that we won't process this cell again in future iterations of the BFS.
      cameFrom.set(key, current); //key is the cell we are currently exploring, and current is the cell we just came from. This line records that we reached the next cell from the current cell, allowing us to trace back the path later.
      queue.push(next); //Push the next cell onto the queue, so it will be processed in future iterations of the BFS. This is how we expand our search outward from the starting point, exploring all reachable cells in a breadth-first manner.
    }
  }
  // When we do this initial line, "const current = queue.shift()," it returns the first element, the start cell, and removes it from the queue. Then, we check if that cell is the end cell. If it is not, we explore its neighbors and add them to the queue. This process continues until we either find the end cell or exhaust all possible cells to explore. If we exit the while loop without finding the end cell, it means there is no valid path from start to end.

  console.log(`BFS explored ${nodesExplored} nodes (no path)`); //Failure message, if we exit the while loop without finding the end cell, it means there is no valid path from start to end. We log the number of nodes explored and indicate that no path was found. The function then returns null to signify that no path exists.
  return null;
}

// This returns the path of the most efficient way, it returns an array of coordinates (ie, {row: x, col: y}) following the most efficient path of cells to take to reach our end
// Whenever we find our most efficient path, we need to reconstruct that path we found leading up to our end, so our parameters are "cameFrom" a parameter for the previous parent cell, and "end" the end cell 
function reconstructPath(cameFrom, end) {
  const path = [end]; //So initially, end is the only set of coordinates/object/cell in the array, but as find the parents, we keep prepending the parents to the front of the array of the array until we get to the front and when it sees that the front doesnt have anymore parents, then our loop stops and it returns the 'path' in perfect forward order
  let currentKey = cellKey(end);

  while (cameFrom.has(currentKey)) { //"As long as the current cell has a recorded parent cell that discovered it, keep moving." cameFrom is an object for the cell before, a parent cell, so 'cameFrom.has(currentKey)' checks if it HAS a parent cell
    const prev = cameFrom.get(currentKey); //This reaches into the history map and asks: "Who was the cell that stepped onto me?" It grabs that parent cell object and saves it in a variable called prev, it GETS the parent cell
    path.unshift(prev);  // 'path.unshift' prepends items, ie, forcing them into the very front of the array (Index 0), Because we are discovering the route in reverse order (End $\rightarrow$ Middle $\rightarrow$ Start), stuffing each newly found parent cell into the front means that when the loop finishes, the array will naturally read in perfect forward order: [Start, Step 1, Step 2, ..., End].
    currentKey = cellKey(prev); //Set the current key to our parent key
  }
  //Once the loop reaches the very first cell (the start), that cell will not have a parent node registered inside the cameFrom map
  //The while loop breaks, and the function returns the neatly sorted array of coordinates directly to 'path', ready to be painted blue on your screen!
  return path;
}

// Manhattan distance heuristic for grid movement (no diagonals)
//Because your map prevents diagonal movement, it uses Manhattan Distance (or "taxicab geometry"). It calculates how many straight vertical and horizontal grid steps it takes to reach the destination, assuming a completely empty map (Math.abs(a.row - b.row) + Math.abs(a.col - b.col);). 
// "Math.abs(a.row - b.row) + Math.abs(a.col - b.col);" calculates total grid steps by adding horizontal/vertical distances (e.g., from A(2,3) to B(6,8) is |2-6| + |3-8| = 4 + 5 = 9 steps, no matter what the order of left and right, up and down, turns, we will have to take 9 total steps to get there, and that is the Manhattan distance). This heuristic is admissible (it never overestimates the true cost) and consistent (the estimated cost is always less than or equal to the estimated cost from any neighboring cell plus the step cost to that neighbor), which are important properties for A* search to guarantee finding the optimal path.
function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// A* search algorithm for pathfinding, imagine a mouse one side of a maze trying to find cheese at the other side, now, it can just blindly wander all throughout the maze checking every single path, but that would take forever, so instead, it uses smells the air for a scent of cheese, and it uses that scent to guide it in the right direction, wherever the scent is strongest, it goes that way, and it keeps doing that until it finds the cheese. This is A* search, it is a pathfinding algorithm that uses heuristics (scent of cheese) to guide the search towards the goal, making it more efficient than uninformed search algorithms like BFS. 
// A* uses the formula: f = g + h .It combines the cost to reach a node (g) and the estimated cost to reach the goal from that node (h) to prioritize which nodes to explore next. The sum of these two costs is called f, the total projected cost of the path to reach the final destination through that cell, and A* always explores the node with the lowest f value next.
// g is the how many tiles we have crossed/traversed so far, it's the history (the exact number of steps you have actually taken from the start tile to get to where you are right now), $h$ is the prediction. It is the Heuristic—an educated guess of how many steps are left to reach the final destination, every cell has its own heuristic, ie, for every cell, there is a calculation saying, "if we go to this cell, it take about x more steps to reach the final destination." The sum of these two costs is called f, and A* always explores the node with the lowest f value next. This allows A* to efficiently find the shortest path by balancing the cost already incurred (g) with the estimated cost to reach the goal (h).
// "start" parameter is the starting cell, "end" parameter is the ending cell
function aStar(start, end) {
  //Sanity check, if we're not on road tiles, we cannot begin to find a path because vehicles may not drive off-road
  if (world[start.row][start.col] !== TILE.ROAD) return null;
  if (world[end.row][end.col] !== TILE.ROAD) return null;

  let nodesExplored = 0; //keeps track of how many nodes we explored, so we can log it to the console later

  const openSet = [{ cell: start, f: manhattanDistance(start, end) }]; //Instead of a simple array queue, A* uses an open set. This collection stores nodes along with their total projected cost (f). Initially, it only contains the start node
  const gScore = new Map(); // g is the history, ie, the exact number of steps you have actually taken from the start tile to get to where you are right now. The gScore map is your A* function's official, verified historical ledger. It keeps a permanent record of the absolute shortest path (the fewest number of "steps") required to travel from the starting tile to any specific cell it has explored so far. We choose which paths to explore based on the lowest f value. 
  gScore.set(cellKey(start), 0);  //We log the string representation of the start cell's coordinates in the gScore map with a value of 0, indicating that the cost to reach the start cell from itself is zero. This is the base case for our pathfinding algorithm, as we haven't moved yet.
  const cameFrom = new Map(); // stores the previous node in the optimal path, maps are basically hashmaps

  //the loops runs as long as there are still nodes in the openSet, meaning there are still unexplored paths to consider. If the openSet becomes empty, it means that all possible paths have been explored and no valid path to the end cell was found.
  while (openSet.length > 0) {
    let bestIndex = 0;
    
    //okay, so bestIndex = 0, that means it compares the openset's current index to openSet[bestIndex=0].f, ie, the first element at index 0 of the openSet until it finds an f value smaller than it, at which point that index becomes the new bestIndex
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[bestIndex].f) {
        bestIndex = i;
      }
    }
    //After the for loop, bestIndex will hold the index of the cell in the openSet with the lowest f value. This is the cell that A* will explore next, as it represents the most promising path towards the goal based on both the cost incurred so far (g) and the estimated cost to reach the goal (h).
    const current = openSet.splice(bestIndex, 1)[0].cell; //From openSet, we use splice(), which removes an element from an array and returns it as a new array, so we remove the cell with the lowest f value (bestIndex) from the openSet, also, the second parameter in splice() is for specifying the number of elements to remove from that starting from that index (first parameter), so we remove 1 element, and then we access the first (and only) element of the returned array with [0], since before in the for loop we only chose the bestIndex, so then we access the .cell property, where did .cell from from? it's defined in our openSet array variable, where we defined it as an object with two properties: cell and f. So, we are extracting the cell property from the object that was removed from the openSet. This cell is now the current cell being explored in this iteration of the A* algorithm.
    nodesExplored++; //increment the number of nodes explored by 1, so we can keep track of how many cells we explored in our search for a path

    //Victory condition, if we have reached the end cell, we log the number of nodes explored and call reconstructPath() to build the path from start to end using the cameFrom map. The function returns the reconstructed path as an array of cells.
    if (current.row === end.row && current.col === end.col) {
      console.log(`A* explored ${nodesExplored} nodes`);
      return reconstructPath(cameFrom, end);
    }

    //Before checking its neighbors, the code reads its own history ledger (gScore). It asks: "Exactly how many steps did it take us to get from the start tile to this current cell?" It stores that count in 'currentG'
    /* The Step-by-Step Mechanism:
  1. cellKey(current): Converts the raw coordinate cell object into a unique string key (e.g., if current is { row: 5, col: 2 }, it turns into "5,2").
  2. gScore.get(...): Reaches completely outside of the cell and queries the external gScore Map ledger structure, asking: "Hey ledger, do you have an entry associated with the key '5,2'?"
  3. The Return: The Map looks up that string key in its memory table and hands back the matching number value (e.g., 14), which is then safely stored into the local variable currentG. This is used to calculate the tentative g score later.
    */
    const currentG = gScore.get(cellKey(current));

    //Loop through all the up-to-4 adjacent cells provided by the neighbors() function
    for (const next of neighbors(current)) {
      if (world[next.row][next.col] !== TILE.ROAD) continue; //If we're off-road, skip this neighbor!
      const nextKey = cellKey(next); //Turn the next cell into a unique string key
      const tentativeG = currentG + 1; //The tentative g score is the cost to reach the next cell from the start/current cell, which is the current cell's g score plus 1 (the cost of moving to an adjacent cell, since we're literally moving deeper into the grid one step at a time).
      const knownG = gScore.get(nextKey); //We check the gScore map to see if we have already recorded a g score for this next cell. If we have, it means we've found a path to this cell before, and knownG will hold that value. If we haven't, knownG will be undefined. This is important for navigating the grid efficiently and avoiding redundant and inefficient paths. If we have already found a shorter path to this cell, we don't need to explore it again.
      if (knownG !== undefined && tentativeG >= knownG) continue; //If we have already found a path to this next cell (knownG is not undefined), and given that, if the cost of going to the next cell through the current cell (tentativeG) is greater than or equal to the cost of the previously recorded path (knownG), we skip this neighbor. This means that the current path is not better than what we have already found, so we don't need to explore it further. This check helps A* avoid unnecessary exploration of less optimal paths, keeping the search efficient and focused on finding the shortest route to the goal.
      cameFrom.set(nextKey, current); //nextKey is the key, and current is the value, so we are recording that we reached the next cell from the current cell, allowing us to trace back the path later. This is crucial for reconstructing the optimal path once we reach the end cell.
      gScore.set(nextKey, tentativeG); //So given we passed through the previous if statement (if (knownG !== undefined && tentativeG >= knownG)), we know that this tentativeG is the best path to this next cell we've found so far, so we record it in the gScore map, updating our historical ledger with the new shortest path cost to reach this next cell from the start.
      const f = tentativeG + manhattanDistance(next, end); //We add our official historical step count (tentativeG) to our taxicab estimation of how many blocks are left (manhattanDistance). This gives us our final total cost (f) for this neighbor
      openSet.push({ cell: next, f }); //We add the next cell to the open set, along with its total cost (f). This means that this neighbor is now a candidate for exploration in future iterations of the A* algorithm, and it will be considered based on its f value relative to other cells in the open set.
    }
  }

  //Failure message, if we exit the while loop without finding the end cell, it means there is no valid path from start to end. We log the number of nodes explored and indicate that no path was found. The function then returns null to signify that no path exists.
  console.log(`A* explored ${nodesExplored} nodes (no path)`);
  return null;

/*
   Quick Summary of A* Search Function:
    - Initialize the open set with the start cell and set its g score to 0.
    - Loop through the open set, find the cell with "best index," ie, lowest f value.
    - Cut that cell (bestIndex) out of the open set.
    - If that cell is the end cell, then success: we display the message of how many nodes were explored, then reconstruct the path and return it.
    - Real quick, we "consult" the gScore hash map established earlier to see how many steps it took to get to this current cell, and store that in a variable called currentG.
    - Loop through all the neighbors of the current cell: if it's not a road tile, skip it. If it is already known to us (has a recorded gScore) AND the current tentative G is not better than the previously known path, skip it.
    - Log the parent-child key-value pairs onto the cameFrom hashmap.
    - Add the new most efficient path for the nextKey, with the nextKey's value being the tentative g, ie, our next neighbor cell's most efficient path cost is updated into our ledger (g score hash map).
    - Calculate the f value for the neighbor.
    - Push the neighbor and its f score onto our open set.
    - If we exit the loop without finding the end, then display failure message and return null to signal no path exists.
    - Repeat with our new next neighbor cells added to the open set: find the one with the lowest f, see if it's the end, if not then run through that cell's neighbors and perform the subsequent checks and add those to the open set. Repeat till you succeed in finding the end cell or fail.
  */
}

// =====================
// GO
// =====================

render(); //Go! Render the world! Call the render() function to draw the initial state of the world on the canvas. This sets up the visual representation of the grid, allowing users to see and interact with it immediately upon loading the application.
console.log(`World initialized: ${ROWS} rows x ${COLS} cols`); //Show how many rows and columns the world has