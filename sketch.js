

let worldArray = [];

let seed;

// Declares default world generation dimensions
const GENXWIDTH = 1000000;
const GENZWIDTH = 1000000;
const GENYHEIGHT = 256;



function setup() {
  createCanvas(windowWidth, windowHeight);

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

function renderWorld(distance, array, camX, camY, camZ) {
  
}