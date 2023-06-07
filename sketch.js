// north == -z; south == +z; west == -x; east = +x; up == -y; down == +y

let worldArray;

let seed;
let airChecklist;

const BLOCKWIDTH = 50;

let textureMap;

// Declares default world generation dimensions
const GENXWIDTH = 2000;
const GENZWIDTH = 2000;
const GENYHEIGHT = 30;

const ZOOM = 20;

let spawnX, spawnY, spawnZ;

let camYaw = 0;
let camPitch = 0;
let fov = 100;

let walkSpeed = 10;
let sprintSpeed = 15;
let playerHeight = 1.5;
let camYD = 0;
let isInAir = false;

const GRAVITY = 2;

let renderDistance = 15;


let blockDict = [['air', 'block'], ['grass', 'block'], ['dirt', 'block'], ['stone', 'block'], ['log', 'block'], ['leaves', 'block']]; // List of existing blocks and properties [name, model]; used in preload() and to translate index from worldArray
// 'air' results in load errors. can be ignored as the program doesnt break

function importBlock(blockName, map) {
  let newArray = [];
  for (let side = 0; side <= 2; side++) {
    newArray.push(loadImage(`textures/${blockName}/${side}.png`));
  }
  map.set(blockName, newArray);
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  angleMode(DEGREES);
  noSmooth();

  textureMap = new Map();

  for (let block of blockDict) {
    if (block[0] !== 'air') {
      importBlock(block[0], textureMap);
    }
  }

  camera = createCamera();
  camera.perspective(fov, width/height, 0.01);

  seed = random(1000000000000000000000)

  worldArray = createEmpty3DArray(GENXWIDTH, GENYHEIGHT, GENZWIDTH);
  generateWorld(worldArray, seed, ZOOM);

  // // Calculates spawnpoint to be in the centre of the array
  spawnX = round(GENXWIDTH/2);
  spawnZ = round(GENZWIDTH/2);

  // // Calculates safe Y-coordinate of spawnpoint using findSpawnY()
  spawnY = findGround(spawnX, spawnZ, worldArray) - 3;

  // // Moves camera to spawnpoint
  camera.eyeX = inCoords(spawnX);
  camera.eyeY = inCoords(spawnY);
  camera.eyeZ = inCoords(spawnZ);
  camera.lookAt(camera.eyeX, camera.eye, camera.eyeZ);
}

function draw() {
  background(0);
  

  directionalLight(150, 150, 150, 1, 0, 0);
  directionalLight(100, 100, 100, 0, 0, 1);
  directionalLight(200, 200, 200, 0, 0, -1);
  directionalLight(200, 200, 200, -1, 0, 0);
  directionalLight(255, 255, 255, 0, 1, 0);

  renderWorld(renderDistance, worldArray, camera.eyeX, camera.eyeZ, camera.eyeY);
  moveCam(camera, worldArray);
  // console.log(`eyeX: ${inBlocksRound(camera.eyeX)}, eyeY: ${inBlocksRound(camera.eyeY)}, eyeZ: ${inBlocksRound(camera.eyeZ)}`)
  // console.log(`centerX: ${rotationX}, centerY: ${rotationY}, centerZ: ${rotationZ}`)
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

// Finds the Y-coordinate of highest block at a given X- and Z-coordinate
function findGround(x, z, array) {
  for (let y = 0; y < array.length; y++) {
    if (array[y][x][z] !== 0) { // If a block is at (x, y, z):
      return y;
    }
  }
}

// Procedurally generates terrain
function generateWorld(array, seed, zoom) {
  console.log('Generating Terrain');
  // Picks random start point for Perlin noise
  // let xOffset = random(seed);
  // let zOffset = random(seed);

  let xOffset = 0;
  let zOffset = 0;



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

function renderWorld(distance, array, camX, camZ, camY) {
  let camXB = inBlocks(camX);
  let camZB = inBlocks(camZ);
  let camYB = inBlocks(camY);
  
  for (let y = 1; y < array.length - 1; y ++) {
    for (let x = Math.max(round(camXB) - distance, 1); x <= Math.min(round(camXB) + distance, array[0].length - 1); x ++) {
      for (let z = Math.max(round(camZB) - distance, 1); z <= Math.min(round(camZB) + distance, array[0][0].length - 1); z ++) {

        switch (blockDict[array[y][x][z]][1]) {
          case 'block':
            //             [                           condition, rotateX,   rotateY,   translate Z, texture side (0 = top, 1 = side, 2 = bottom)]  
            airChecklist = [[array[y+1][x][z] === 0 && y < camYB,     -90,         0,  BLOCKWIDTH/2, 2, 'red'], // down
                            [array[y-1][x][z] === 0 && y > camYB,      90,         0,  BLOCKWIDTH/2, 0 , 'orange'], // up
                            [array[y][x+1][z] === 0 && x < camXB,       0,       -90, -BLOCKWIDTH/2, 1, 'yellow'], // west
                            [array[y][x-1][z] === 0 && x > camXB,       0,        90, -BLOCKWIDTH/2, 1, 'green'], // east
                            [array[y][x][z+1] === 0 && z < camZB,       0,         0,  BLOCKWIDTH/2, 1, 'blue'], // south
                            [array[y][x][z-1] === 0 && z > camZB,       0,       180,    BLOCKWIDTH/2, 1, 'purple']]; // north
          case 'cross':
            airChecklist = [[array[y+1][x][z] === 0 && y < camYB,     -90,         0,  BLOCKWIDTH/2, 2, 'red'], // down
                            [array[y-1][x][z] === 0 && y > camYB,      90,         0,  BLOCKWIDTH/2, 0 , 'orange'], // up
                            [array[y][x+1][z] === 0 && x < camXB,       0,       -90, -BLOCKWIDTH/2, 1, 'yellow'], // west
                            [array[y][x-1][z] === 0 && x > camXB,       0,        90, -BLOCKWIDTH/2, 1, 'green'], // east
                            [array[y][x][z+1] === 0 && z < camZB,       0,         0,  BLOCKWIDTH/2, 1, 'blue'], // south
                            [array[y][x][z-1] === 0 && z > camZB,       0,       180,  BLOCKWIDTH/2, 1, 'purple']]; // north
        }
        
        // push();
        translate(inCoords(x), inCoords(y), inCoords(z));

        for (let checkedSide of airChecklist) {

          if (array[y][x][z] !== 0 && checkedSide[0]) {       
            push();

            rotateX(checkedSide[1]);
            rotateY(checkedSide[2]);

            translate(0, 0, checkedSide[3]);
            texture(textureMap.get(blockDict[array[y][x][z]][0])[checkedSide[4]]);

            // fill(checkedSide[5]);
            plane(BLOCKWIDTH, BLOCKWIDTH);
            // box(BLOCKWIDTH, BLOCKWIDTH);
            // console.log(`plane drawn at ${checkedSide[4] + x}, ${checkedSide[5] + y}, ${checkedSide[6] + z} `)

            pop();
          }
        }
        translate(inCoords(-x), inCoords(-y), inCoords(-z));
      }
    }
  }
}

function inBlocks(coords) {
  return coords / BLOCKWIDTH;
}
function inBlocksRound(coords) {
  return round(coords / BLOCKWIDTH);
}
function inCoords(blocks) {
  return blocks * BLOCKWIDTH;
}

function moveCam(cam, array) {
  let camBumper = 7;
  let playerSpeed = walkSpeed;

  camYaw += -movedX * 0.1;

  camPitch += movedY * 0.1;

  if (camPitch >= 89) {
    camPitch = 89;
  }
  if (camPitch <= -89) {
    camPitch = -89;
  }

  camYaw = camYaw % 360 < 0 ? 360 + camYaw % 360 : camYaw % 360;

  cam.lookAt(cam.eyeX + cos(-camYaw) * cos(camPitch), cam.eyeY + sin(camPitch), cam.eyeZ + sin(-camYaw) * cos(camPitch));
  
  // console.log(`yaw: ${camYaw}, pitch: ${camPitch}`)
  let newCamX = cam.eyeX;
  let newCamZ = cam.eyeZ;
  let newCamY = cam.eyeY;

  if (keyIsDown(82)) { // R
    playerSpeed = sprintSpeed;
  }

  // Camera translation
  if (keyIsDown(87)) { // W; Prototype clipping detection
    newCamX += cos(camYaw) * playerSpeed;
    newCamZ += -sin(camYaw) * playerSpeed;
  }

  if (keyIsDown(83)) { // S
    // cam.setPosition(cam.eyeX - cos(camYaw) * playerSpeed, cam.eyeY, cam.eyeZ + sin(camYaw) * playerSpeed);
    newCamX += -cos(camYaw) * playerSpeed;
    newCamZ += sin(camYaw) * playerSpeed;
  }
  if (keyIsDown(65)) { // A
    // cam.setPosition(cam.eyeX + cos(camYaw + 90) * playerSpeed, cam.eyeY, cam.eyeZ - sin(camYaw + 90) * playerSpeed);
    newCamX += -sin(camYaw) * playerSpeed;
    newCamZ += -cos(camYaw) * playerSpeed;
  }
  if (keyIsDown(68)) { // D
    // cam.setPosition(cam.eyeX + cos(camYaw - 90) * playerSpeed, cam.eyeY, cam.eyeZ - sin(camYaw - 90) * playerSpeed);
    newCamX += sin(camYaw) * playerSpeed;
    newCamZ += cos(camYaw) * playerSpeed;
  }
  if (keyIsDown(32) && isInAir === false) { // SPACE; REMOVE ONCE GRAVITY WORKS
    // cam.setPosition(cam.eyeX, cam.eyeY - playerSpeed, cam.eyeZ);
    camYD = -15;
    isInAir = true;
    newCamY -= 0.1;
  }
  
  // if (keyIsDown(16)) { // SHIFT; REMOVE ONCE GRAVITY WORKS
  //   // cam.setPosition(cam.eyeX, cam.eyeY + playerSpeed, cam.eyeZ);
  //   newCamY += playerSpeed;
  // }

  if (!isInBlock(cam, cam.eyeX, newCamY, cam.eyeZ)) {
    newCamY += camYD;
    if (isInBlock(cam, cam.eyeX, newCamY, cam.eyeZ)) {
      newCamY = inCoords(inBlocksRound(newCamY)) - 1; //  -  inCoords(playerHeight)     + BLOCKWIDTH/2
      // newCamY -= camYD
      isInAir = false;
      camYD = 0;
    } else {
      camYD += GRAVITY;
    }
    
  }

  if (array[inBlocksRound(cam.eyeY + inCoords(playerHeight))][inBlocksRound(newCamX)][inBlocksRound(cam.eyeZ)] !== 0) {
    newCamX = cam.eyeX;
  }
  if (array[inBlocksRound(cam.eyeY + inCoords(playerHeight))][inBlocksRound(cam.eyeX)][inBlocksRound(newCamZ)] !== 0) {
    newCamZ = cam.eyeZ;
  }

  // console.log(isInBlock(cam, newCamX, newCamY, newCamZ));
  cam.setPosition(newCamX, newCamY, newCamZ);

  // Logs cam coordinates in blocks
  // console.log(`x: ${(inBlocks(camera.eyeX)).toFixed(2)}, y: ${(inBlocks(camera.eyeY)).toFixed(2)}, z: ${(inBlocks(camera.eyeZ)).toFixed(2)}`);
  // console.log(`x: ${cam.eyeX}, y: ${cam.eyeY}, z: ${cam.eyeZ}`);
}

function keyPressed() {
  // Change render distance
  if (keyIsDown(69) && renderDistance <= round(Math.max(GENXWIDTH, GENZWIDTH) / 2)) { // E; maximum render distance is either world width or length, whichever is largest (not recommended)
    renderDistance ++;
  }
  if (keyIsDown(81) && renderDistance >= 4) { // Q; minimum render distance is 4 blocks
    renderDistance --;
  }
} 

function mousePressed() {
  requestPointerLock();
}

function isInBlock(cam, x, y, z) {
  return worldArray[inBlocksRound(y + inCoords(playerHeight))][inBlocksRound(x)][inBlocksRound(z)] !== 0
}