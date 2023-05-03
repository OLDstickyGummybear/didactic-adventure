// north == -z; south == +z; west == -x; east = +x; up == -y; down == +y

let worldArray;

let seed;

const BLOCKWIDTH = 100;

let textureArray;

// Declares default world generation dimensions
const GENXWIDTH = 1000;
const GENZWIDTH = 1000;
const GENYHEIGHT = 20;

const ZOOM = 20;

let spawnX;
let spawnY;
let spawnZ;

let renderDistance = 2;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // noStroke();
  angleMode(DEGREES);

  camera = createCamera();

  seed = random(1000000000000000000000)

  worldArray = createEmpty3DArray(GENXWIDTH, GENYHEIGHT, GENZWIDTH);
  generateNoise(worldArray, seed, ZOOM);

  // // Calculates spawnpoint to be in the centre of the array
  spawnX = round(GENXWIDTH/2);
  spawnZ = round(GENZWIDTH/2);

  // // Calculates safe Y-coordinate of spawnpoint using findSpawnY()
  spawnY = findSpawnY(spawnX, spawnZ, worldArray);

  // // Moves camera to spawnpoint
  // camera.eyeX = inBlocks(spawnX);
  // camera.eyeY = inBlocks(spawnY);
  // camera.eyeZ = inBlocks(spawnZ);
}

function draw() {
  background(0);
  renderWorld(renderDistance, worldArray, camera.eyeX, camera.eyeZ);
  moveCam(camera); 
  // fill('white');
  // plane(1000, 1000);
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
  
  // console.log('Rendering...')

  for (let y = 1; y < array.length - 1; y ++) {
    // console.log('Rendering y')
    for (let x = Math.max(round(camXB) - distance, 1); x <= Math.min(round(camXB) + distance, array[0].length - 1); x ++) {
      // console.log('Rendering x')
      for (let z = Math.max(round(camZB) - distance, 1); z <= Math.min(round(camZB) + distance, array[0][0].length - 1); z ++) {
        
        // console.log('Rendering z')
        // plane(10, 10);

        //                  [       condition, rotateX, rotateY, rotateZ,   translate X,   translate Y,   translate Z, texture side (0 = top, 1 = side, 2 = bottom)]  
        let airChecklist = [[array[y+1][x][z],     -90,       0,       0,             0,  BLOCKWIDTH/2,             0, 0], // down
                            [array[y-1][x][z],      90,       0,       0,             0, -BLOCKWIDTH/2,             0, 2], // up
                            [array[y][x+1][z],       0,     -90,       0, -BLOCKWIDTH/2,             0,             0, 1], // west
                            [array[y][x-1][z],       0,      90,       0,  BLOCKWIDTH/2,             0,             0, 1], // east
                            [array[y][x][z+1],       0,       0,       0,             0,             0,  BLOCKWIDTH/2, 1], // south
                            [array[y][x][z-1],       0,     180,       0,             0,             0, -BLOCKWIDTH/2, 1]]; // north
                            

        
        
        push();
        translate(x * BLOCKWIDTH, y * BLOCKWIDTH, z * BLOCKWIDTH);

        for (let i = 0; i < airChecklist.length; i ++) {

          if (airChecklist[i][0] !== 0) {
            push();
            
            

            rotateX(airChecklist[i][1]);
            rotateY(airChecklist[i][2]);
            rotateZ(airChecklist[i][3]);

            translate(airChecklist[i][4], airChecklist[i][5], airChecklist[i][6]);
            // texture(textureArray[array[y][x][z]][side[7]]);

            fill('white');
            plane(BLOCKWIDTH, BLOCKWIDTH);
            // console.log(`plane drawn at ${airChecklist[i][4] + x}, ${airChecklist[i][5] + y}, ${airChecklist[i][6] + z} `)

            pop();
          }
        }

        pop();
      }
    }
  }
}

function inBlocks(value) {
  return value / BLOCKWIDTH;
}

function moveCam(cam) {
  // Camera translation
  if (keyIsDown(87)) { // W
    cam.move(0, 0, -10);
  }
  if (keyIsDown(83)) { // S
    cam.move(0, 0, 10);
  }
  if (keyIsDown(65)) { // A
    cam.move(-10, 0, 0);
  }
  if (keyIsDown(68)) { // D
    cam.move(10, 0, 0);
  }
  if (keyIsDown(32)) { // SPACE
    cam.move(0, -10, 0);
  }
  if (keyIsDown(16)) { // SHIFT
    cam.move(0, 10, 0);
  }

  // Camera rotation
  if (keyIsDown(LEFT_ARROW)) { // <-
    cam.pan(1);
  }
  if (keyIsDown(RIGHT_ARROW)) { // ->
    cam.pan(-1);
  }
  if (keyIsDown(UP_ARROW)) { // ^
    cam.tilt(-1);
  }
  if (keyIsDown(DOWN_ARROW)) { // v
    cam.tilt(1);
  }

  // Logs cam coordinates in blocks
  console.log(`x: ${(inBlocks(camera.eyeX)).toFixed(2)}, y: ${(inBlocks(camera.eyeY)).toFixed(2)}, z: ${(inBlocks(camera.eyeZ)).toFixed(2)}`);
}