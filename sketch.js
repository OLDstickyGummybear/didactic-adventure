// north == -z; south == +z; west == -x; east = +x; up == -y; down == +y

let worldArray;

let seed;

const BLOCKWIDTH = 100;


// Declares default world generation dimensions
const GENXWIDTH = 1000;
const GENZWIDTH = 1000;
const GENYHEIGHT = 256;

const ZOOM = 20;

let spawnX;
let spawnY;
let spawnZ;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  angleMode(DEGREES);

  seed = random(1000000000000000000000)

  worldArray = createEmpty3DArray(GENXWIDTH, GENYHEIGHT, GENZWIDTH);
  generateNoise(worldArray, seed, ZOOM);

  // Calculates spawnpoint to be in the centre of the array
  spawnX = round(GENXWIDTH/2);
  spawnZ = round(GENZWIDTH/2);

  // Calculates safe Y-coordinate of spawnpoint using findSpawnY()
  spawnY = findSpawnY(spawnX, spawnZ, worldArray);

  // Moves camera to spawnpoint
  // camera.eyeX = spawnX * BLOCKWIDTH;
  // camera.eyeY = spawnY * BLOCKWIDTH;
  // camera.eyeZ = spawnZ * BLOCKWIDTH;
  // camera.move(0, -1, 0);
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
  console.log('World Container Created');
  return volume; // Return output array 
}

// Finds the Y-coordinate two blocks higher than the highest block at a given X- and Z-coordinate
function findSpawnY(x, z, array) {
  for (let y = 0; y < array.length; y++) {
    if (array[y][x][z] !== 0) { // If a block is at (x, y, z):
      return y - 3;
    }
  }
}

// Procedurally generates terrain
function generateNoise(array, seed, zoom) {
  console.log('Generating Terrain');
  // Picks random start point for Perlin noise
  let xOffset = random(seed);
  let zOffset = random(seed);

  for (let x = 0; x < array[0].length; x++) { // For each X-coordinate
    for (let z = 0; z < array[0][0].length; z++) { // For each Z-coordinate
      let yGen = round(map(noise((x + xOffset) / zoom, (z + zOffset) / zoom), 0, 1, 0, GENYHEIGHT)); // Generates Perlin noise using x and z and their respective offsets, maps noise to fit in the height of the world array, and rounds to whole number
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

  console.log('Terrain Generated')
}

function renderWorld(distance, array, camX, camZ) {
  let camXB = inBlocks(camX);
  let camZB = inBlocks(camZ);
  
  for (let y = 0; y < array.length; y ++) {
    for (let x = Math.max(round(camXB) - distance, 0); x <= Math.min(round(camXB) + distance, array[0].length); x ++) {
      for (let z = Math.max(round(camZB) - distance, 0); z <= Math.min(round(camZB) + distance, array[0][0].length); z ++) {
        
        //                         [condition, rotateX, rotateY, rotateZ,   translate X,   translate Y,   translate Z, texture side (0 = top, 1 = side, 2 = bottom)]
        let airChecklist = [[array[y+1][x][z],     -90,       0,       0,             0,  BLOCKWIDTH/2,             0, 0], // down
                            [array[y-1][x][z],      90,       0,       0,             0, -BLOCKWIDTH/2,             0, 2], // up
                            [array[y][x+1][z],       0,     -90,       0, -BLOCKWIDTH/2,             0,             0, 1], // west
                            [array[y][x-1][z],       0,      90,       0,  BLOCKWIDTH/2,             0,             0, 1], // east
                            [array[y][x][z+1],       0,       0,       0,             0,             0,  BLOCKWIDTH/2, 1], // south
                            [array[y][x][z-1],       0,     180,       0,             0,             0, -BLOCKWIDTH/2, 1]]; // north
        
        push();
        
        translate(x, y, z);

        for (let side in airChecklist) {
          if (side[0] !== 0) {
            push();
            
            rotateX(side[1]);
            rotateY(side[2]);
            rotateZ(side[3]);
            translate(side[4], side[5], side[6]);
            texture(textureArray[array[y][x][z]][side[7]]); // the array[y][x][z] from textures array

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