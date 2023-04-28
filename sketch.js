// north == -z; south == +z; west == -x; east = +x; up == -y; down == +y

let worldArray = [];

let seed;

// Declares default world generation dimensions
const GENXWIDTH = 1000000;
const GENZWIDTH = 1000000;
const GENYHEIGHT = 256;

const BLOCKWIDTH = 100;


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  seed = random(1000000000000000000000)
}

function draw() {
  background(220);
}

// Creates empty cubic array given a length, height, and width
function createEmpty3DArray(width, height, length) {
  let volume = []; // Creates empty output array 'volume'
  for (let y = 0; y < height; y++) { // For each height layer, insert empty array into volume
    volume.push([]);
    for (let x = 0; x < width; x++) { // For each width row within each height layer, insert empty array into height array
      volume[y].push([]); 
      for (let z = 0; z < length; z++) { // For each length block within each width row within each height layer, insert a 0 into width array
        volume[y][x].push(0);
      } 
    }
  }
  return volume; // Return output array 
}

// Procedurally generates terrain
function generateNoise(array, seed) {
  // Picks random start point for Perlin noise
  let xOffset = random(seed);
  let zOffset = random(seed);

  for (let x = 0; x < array[0].length; x++) { // For each X-coordinate
    for (let z = 0; z < array[0][0].length; z++) { // For each Z-coordinate
      let yGen = round(map(noise((x + xOffset) / ZOOM, (z + zOffset) / ZOOM), 0, 1, 0, genYHeight)); // Generates Perlin noise using x and z and their respective offsets, maps noise to fit in the height of the world array, and rounds to whole number
      array[yGen][x][z] = 1; // Generates top layer; 1 is grass

      // For each layer below the top layer
      for (let yIter = yGen + 1; yIter < array.length; yIter ++) {

        if (yIter <= yGen + 3) {// For 3 layers underneath the top layer
          array[yIter][x][z] = 2; // Sets block as dirt
        } 

        // add other layers here if needed with else if

        else { // For everything below
          array[yIter][x][z] = 3; // Sets block as stone
        }
      }
    }
  }
}

function renderWorld(distance, array, camX, camZ) {
  let camXB = inBlocks(camX);
  let camZB = inBlocks(camZ);
  
  for (let y = 0; y < array.length; y ++) {
    for (let x = Math.max(round(camXB) - distance, 0); x <= Math.min(round(camXB) + distance, array[0].length); x ++) {
      for (let z = Math.max(round(camZB) - distance, 0); z <= Math.min(round(camZB) + distance, array[0][0].length); z ++) {
        
        // [condition, rotateX, rotateY, rotateZ, translate X, translate Y, translate Z, texture side (0 = top, 1 = side, 2 = bottom)]
        let airChecklist = [[array[y+1][x][z], 90, 0, 0, BLOCKWIDTH/2, 0, 0], // down
                            [array[y-1][x][z], 90, 0, 0, -BLOCKWIDTH/2, 0, 0], // up
                            [array[y][x+1][z], ], // west
                            [array[y][x-1][z], ], // east
                            [array[y][x][z+1], ], // south
                            [array[y][x][z-1], ]]; // north
        
        push();
        
        translate(x, y, z);

        for (let side in airChecklist) {
          if (side[0] !== 0) {
            push();
            
            rotateX(side[1]);
            rotateY(side[2]);
            rotateZ(side[3]);
            translate(side[4], side[5], side[6]);
            texture(); // the array[y][x][z] from textures array

            plane(BLOCKWIDTH, BLOCKWIDTH);

            pop();
          }
        }
      }
    }
  }
}

function inBlocks(value) {
  return value * BLOCKWIDTH;
}