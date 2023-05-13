const blockWidth = 50;
const blockHeight = 50;
const rows = 10;
const cols = 10;
let blocks = [];

function setup() {
  createCanvas(500, 500);
  for (let row = 0; row < rows; row++) {
    blocks[row] = [];
    for (let col = 0; col < cols; col++) {
      const x = col * blockWidth;
      const y = row * blockHeight;
      blocks[row][col] = { x, y };
    }
  }
}

function draw() {
  background(255);
  const visibleBlocks = getVisibleBlocks();
  for (let block of visibleBlocks) {
    rect(block.x, block.y, blockWidth, blockHeight);
  }
}

function getVisibleBlocks() {
  const visibleBlocks = [];
  const cameraX = mouseX;
  const cameraY = mouseY;
  const visibleRows = getVisibleRows(cameraY);
  const visibleCols = getVisibleCols(cameraX);
  for (let row of visibleRows) {
    for (let col of visibleCols) {
      visibleBlocks.push(blocks[row][col]);
    }
  }
  return visibleBlocks;
}

function getVisibleRows(cameraY) {
  const visibleRows = [];
  const firstVisibleRow = floor(cameraY / blockHeight);
  const lastVisibleRow = floor((cameraY + height) / blockHeight);
  for (let row = firstVisibleRow; row <= lastVisibleRow && row < rows; row++) {
    visibleRows.push(row);
  }
  return visibleRows;
}

function getVisibleCols(cameraX) {
  const visibleCols = [];
  const firstVisibleCol = floor(cameraX / blockWidth);
  const lastVisibleCol = floor((cameraX + width) / blockWidth);
  for (let col = firstVisibleCol; col <= lastVisibleCol && col < cols; col++) {
    visibleCols.push(col);
  }
  return visibleCols;
}
