// Coding Capstone Project
// Kevin Liu
// Mr. Schellenberg
// Computer Science 30
// June 19th, 2023

// This project procedurally generates a voxel-based terrain using perlin noise, stored within a 3D array. The goal is to accurately recreate the look and feel of Minecraft, whether it be the terrain, textures, controls, or movements. Players can control their movements just like in Minecraft, using the mouse and WASD. In addition, players can save and load games, re-generate worlds, and control their render distance.

// north == -z; south == +z; west == -x; east = +x; up == -y; down == +y

let worldArray;
let menuButtonArray = []; // every array inside the menu array is a separate level, in which buttons are stored

let airChecklist;

const BLOCKWIDTH = 50;

let textureMap;

// Declares default world generation dimensions; maximum size allowed for saving in localStorage
const GENXWIDTH = 255;
const GENZWIDTH = 255;
const GENYHEIGHT = 40;

const ZOOM = 20;

let spawnX, spawnY, spawnZ;

let camYaw = 0;
let camPitch = 0;
let fov = 100;

let walkSpeed = 6;
let sprintSpeed = 12;
let playerHeight = 1.5;
let camYD = 0;
let isInAir = false;

const GRAVITY = 2;

let isInMenu = false;

let boldFont, regFont;

let renderDistance = 15;

// 3D array of a tree
let tree1 = [[
  [0, 0, 0, 0, 0],
  [0, 0, 5, 0, 0],
  [0, 5, 5, 5, 0],
  [0, 0, 5, 0, 0],
  [0, 0, 0, 0, 0]
],
[
  [0, 0, 0, 0, 0],
  [0, 0, 5, 5, 0],
  [0, 5, 4, 5, 0],
  [0, 0, 5, 0, 0],
  [0, 0, 0, 0, 0]
],
[
  [0, 5, 5, 5, 5],
  [5, 5, 5, 5, 5],
  [5, 5, 4, 5, 5],
  [5, 5, 5, 5, 5],
  [0, 5, 5, 5, 0]
],
[
  [0, 5, 5, 5, 0],
  [5, 5, 5, 5, 5],
  [5, 5, 4, 5, 5],
  [5, 5, 5, 5, 5],
  [5, 5, 5, 5, 0]
],
[
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 4, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
],
[
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 4, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
],
[
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 4, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
]];
// List of existing blocks
let blockDict = ['air', 'grass', 'dirt', 'stone', 'log', 'leaves']; 

// Loads textures of block blockName into map
function importBlock(blockName, map) {
  let newArray = [];
  // For each of the three textures of a block, push into newArray
  for (let side = 0; side <= 2; side++) {
    newArray.push(loadImage(`textures/${blockName}/${side}.png`));
  }
  map.set(blockName, newArray);
}

function setup() {
  // Canvas setup
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  angleMode(DEGREES);
  noSmooth();
  textAlign(CENTER);
  frameRate()

  // Where the textures are stored.
  textureMap = new Map();

  // Loads texture of every block except air onto textureMap.
  for (let block of blockDict) {
    if (block !== 'air') {
      importBlock(block, textureMap);
    }
  }

  // Camera setup
  camera = createCamera();
  camera.perspective(fov, width/height, 0.01);

  // Creates empty array in worldArray according to outlined size.
  worldArray = createEmpty3DArray(GENXWIDTH, GENYHEIGHT, GENZWIDTH);

  // Randomly generates world, then finds safe spawnpoint for player.
  initiateWorld(camera, worldArray);

  // Provides instructions
  alert("Controls:\nWASD & Space: Movement\nR: Sprint\nQ & E: Changes render distance\nZ: Re-generate world\nC: Save world\nV: Load world\nClick anywhere on the screen to hide mouse");
}

// Randomly generates world, then finds safe spawnpoint for player.
function initiateWorld(cam, array) {

  // Generates random world
  generateWorld(array, ZOOM);

  // // Calculates spawnpoint to be in the centre of the array
  spawnX = round(GENXWIDTH/2);
  spawnZ = round(GENZWIDTH/2);

  // // Calculates safe Y-coordinate of spawnpoint using findSpawnY()
  spawnY = findGround(spawnX, spawnZ, array) - 3;

  // // Moves camera to spawnpoint
  cam.eyeX = inCoords(spawnX);
  cam.eyeY = inCoords(spawnY);
  cam.eyeZ = inCoords(spawnZ);

  // Sets the camera to look at a specific direction
  cam.lookAt(cam.eyeX, cam.eyeY, cam.eyeZ);
}

function draw() {
  // Sets the sky to be sky-colored
  background(120, 167, 255);

  // Sets the lighting for each block face
  directionalLight(300, 300, 300, 0.1, 0, 0.1);
  directionalLight(255, 255, 255, 0, 0.1, 0);
  directionalLight(300, 300, 300, -0.15, 0, -0.1);
  directionalLight(100, 100, 100, 0, -0.001, 0);

  // Draws every block within renderDistance, then updates camera position according to keys down
  renderWorld(renderDistance, worldArray, camera.eyeX, camera.eyeZ, camera.eyeY);
  moveCam(camera, worldArray);

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
function generateWorld(array, zoom) {
  console.log('Generating Terrain');

  // Randomly generates offset for noise to prevent world regenerations by pressing Z from looking the same
  let xOffset = random(10000000);
  let zOffset = random(10000000);

  for (let x = 0; x < array[0].length; x++) { // For each X-coordinate
    for (let z = 0; z < array[0][0].length; z++) { // For each Z-coordinate
      let yGen = round(map(noise((x + xOffset) / zoom, (z + zOffset) / zoom), 0, 1, 10, GENYHEIGHT)); // Generates Perlin noise using x and z and their respective offsets, maps noise to fit in the height of the world array, and rounds to whole number
      array[yGen][x][z] = 1; // Generates top layer; 1 is grass

      // For each layer below the top layer
      for (let yIter = yGen + 1; yIter < array.length; yIter ++) {

        if (yIter <= yGen + 3) {// For 3 layers underneath the top layer
          array[yIter][x][z] = 2; // Sets block as dirt
        } 

        // add other layers here if needed with else if

        else { // For bottom layer
          array[yIter][x][z] = 3; // Sets block as stone
        }
      }

      // Tree generation pass
      if (x > 5 && x < array[0].length - 5 && z > 5 && z < array[0][0].length - 5) { // If the x, y, and z are within a 5 block margin from the edge of the world (to prevent trees from trying to generate outside of world bounds)
        let treeChance = random(1000); // generates random number between 0 and 999
        if (treeChance > 990) { // if number is greater than 990 (a ~1% chance), a tree will generate at x y z
          buildTree(x, yGen, z, tree1); // Replaces air blocks in selected spot with tree
        }
      }
    }
  }
  console.log('Terrain Generated')
}

// Draws the blocks within a set distance of the camera onto the canvas
function renderWorld(distance, array, camX, camZ, camY) {
  // Camera coordinates, but in blocks
  let camXB = inBlocks(camX);
  let camZB = inBlocks(camZ);
  let camYB = inBlocks(camY);
  
  // Iterates through every single block within the render bubble
  for (let y = 1; y < array.length - 1; y ++) { // For each y-coordinate
    for (let x = Math.max(round(camXB) - distance, 2); x <= Math.min(round(camXB) + distance, array[0].length - 2); x ++) { // For each x-coordinate, extending either from the start of the render bubble to the end, or extending to or from the edge of the world, whichever is closer,
      for (let z = Math.max(round(camZB) - distance, 2); z <= Math.min(round(camZB) + distance, array[0][0].length - 2); z ++) { // For each z-coordinate, extending either from the start of the render bubble to the end, or extending to or from the edge of the world, whichever is closer,

        // Outlines the conditions as well as the rotational and translational data for each block face to display. Only faces adjacent to air and on the side the player can see will be displayed.
        //              [                          condition, rotateX,   rotateY,   translate Z, texture side (0 = top, 1 = side, 2 = bottom), debug colors]
        airChecklist = [[array[y+1][x][z] === 0 && y < camYB,     -90,         0,  BLOCKWIDTH/2, 2, 'red'], // down
                        [array[y-1][x][z] === 0 && y > camYB,      90,         0,  BLOCKWIDTH/2, 0, 'orange'], // up
                        [array[y][x+1][z] === 0 && x < camXB,       0,       -90, -BLOCKWIDTH/2, 1, 'yellow'], // west
                        [array[y][x-1][z] === 0 && x > camXB,       0,        90, -BLOCKWIDTH/2, 1, 'green'], // east
                        [array[y][x][z+1] === 0 && z < camZB,       0,         0,  BLOCKWIDTH/2, 1, 'blue'], // south
                        [array[y][x][z-1] === 0 && z > camZB,       0,       180,  BLOCKWIDTH/2, 1, 'purple']]; // north

          // Moves transformation matrix to the location of the block
          translate(inCoords(x), inCoords(y), inCoords(z));

          // Iterates through each block face
          for (let checkedSide of airChecklist) {

            if (array[y][x][z] !== 0 && checkedSide[0]) {       
              push();

              // Rotates plane to correct orientation
              rotateX(checkedSide[1]);
              rotateY(checkedSide[2]);

              // Translates plane from the centre of the block to whichever side it's supposed to be
              translate(0, 0, checkedSide[3]);

              // Slaps on the appropriate texture for the side in question
              texture(textureMap.get(blockDict[array[y][x][z]])[checkedSide[4]]);

              // fill(checkedSide[5]); // When uncommented after disabling texture() function, turns on debug colors
              plane(BLOCKWIDTH, BLOCKWIDTH);

              pop();
              }
          }
        // Moves transformation matrix back to its original spot
        translate(inCoords(-x), inCoords(-y), inCoords(-z));
      }
    }
  }
}

// Conversion functions

function inBlocks(coords) {
  return coords / BLOCKWIDTH;
}
function inBlocksRound(coords) {
  return round(coords / BLOCKWIDTH);
}
function inCoords(blocks) {
  return blocks * BLOCKWIDTH;
}

// Updates player position according to which key is down, and does gravity
function moveCam(cam, array) {
  let playerSpeed = walkSpeed;

  // Records the angles of the cameras
  camYaw += -movedX * 0.1;
  camPitch += movedY * 0.1;

  // Sets limits to up and down camera movement
  if (camPitch >= 89) {
    camPitch = 89;
  }
  if (camPitch <= -89) {
    camPitch = -89;
  }

  // Resets camYaw to 0 when past 360 degrees
  camYaw = camYaw % 360 < 0 ? 360 + camYaw % 360 : camYaw % 360;

  // Sets camera to look at whichever direction camYaw and camPitch dictates
  cam.lookAt(cam.eyeX + cos(-camYaw) * cos(camPitch), cam.eyeY + sin(camPitch), cam.eyeZ + sin(-camYaw) * cos(camPitch));
  
  // Declares new variables to keep track of camera movement
  let newCamX = cam.eyeX;
  let newCamZ = cam.eyeZ;
  let newCamY = cam.eyeY;

  // Sprint
  if (keyIsDown(82)) { // R
    playerSpeed = sprintSpeed;
  }

  // Camera translation. adds to or subtracts from newCam variables
  if (keyIsDown(87)) { // W
    newCamX += cos(camYaw) * playerSpeed;
    newCamZ += -sin(camYaw) * playerSpeed;
  }

  if (keyIsDown(83)) { // S
    newCamX += -cos(camYaw) * playerSpeed;
    newCamZ += sin(camYaw) * playerSpeed;
  }
  if (keyIsDown(65)) { // A
    newCamX += -sin(camYaw) * playerSpeed;
    newCamZ += -cos(camYaw) * playerSpeed;
  }
  if (keyIsDown(68)) { // D
    newCamX += sin(camYaw) * playerSpeed;
    newCamZ += cos(camYaw) * playerSpeed;
  }
  if (keyIsDown(32) && !isInAir) { // SPACE
    camYD = -15; // Add 15 to vertical velocity 
    isInAir = true; // Change air status to true
    newCamY -= 0.1; // Reduces clipping
  }

  // Gravity
  if (!isInBlock(cam.eyeX, newCamY, cam.eyeZ)) { // If the new camera Y-coordinate is not within a block
    newCamY += camYD; // Add velocity to position
    if (isInBlock(cam.eyeX, newCamY, cam.eyeZ)) { // if the new new camera Y-coordinate IS within a block
      newCamY = inCoords(inBlocksRound(newCamY)) - 1; // round up the coordinate to be at the nearest whole block
      isInAir = false; // Change air status to false
      camYD = 0; // Set velocity to 0
    } else { // If the player is falling
      camYD += GRAVITY; // Add gravitational acceleration to velocity
    } 
  }

  // If new X or Z coordinates ARE inside a block (due to collision), set the newCam value to the original camera coordinate. This preserves the movement of one axis even if the other axis is obstructed.
  if (array[inBlocksRound(cam.eyeY + inCoords(playerHeight))][inBlocksRound(newCamX)][inBlocksRound(cam.eyeZ)] !== 0) {
    newCamX = cam.eyeX;
  }
  if (array[inBlocksRound(cam.eyeY + inCoords(playerHeight))][inBlocksRound(cam.eyeX)][inBlocksRound(newCamZ)] !== 0) {
    newCamZ = cam.eyeZ;
  }

  // Sets camera position to updated coordinates
  cam.setPosition(newCamX, newCamY, newCamZ);
}

// Non-movement related keypresses
function keyPressed() {
  // Change render distance
  if (keyIsDown(69) && renderDistance <= round(Math.max(GENXWIDTH, GENZWIDTH) / 2)) { // E; maximum render distance is either world width or length, whichever is largest (not recommended)
    renderDistance ++;
  }
  if (keyIsDown(81) && renderDistance >= 4) { // Q; minimum render distance is 4 blocks
    renderDistance --;
  }

  // Saving and loading
  if (keyIsDown(67)) { // C
    saveGame(worldArray, camera);
    console.log("Game saved");
  }
  if (keyIsDown(86)) { // V
    loadGame(worldArray, camera);
  }

  // Regenerates world
  if (keyIsDown(90)) { // Z
    wipeWorld(worldArray);
    initiateWorld(camera, worldArray);
    
  }
} 

// sets every block to air in preparation for regeneration
function wipeWorld(array) {
  for (let y = 0; y < array.length; y ++) {
    for (let x = 0; x < array[0].length; x ++) {
      for (let z = 0; z < array[0][0].length; z ++) {
        array[y][x][z] = 0;
      }
    }
  }
}

// Hides mouse when clicked
function mousePressed() {
  requestPointerLock();
}

// returns whether the given coordinate is within a block
function isInBlock(x, y, z) {
  return worldArray[inBlocksRound(y + inCoords(playerHeight))][inBlocksRound(x)][inBlocksRound(z)] !== 0
}

// Saves camera position and world array to localStorage
function saveGame() {
  storeItem('playerX', camera.eyeX);
  storeItem('playerY', camera.eyeY);
  storeItem('playerZ', camera.eyeZ);
  storeItem('camPitch', camPitch);
  storeItem('camYaw', camYaw);
  storeItem('worldArray', worldArray);
  // storeItem('worldArray', JSON.stringify(worldArray));
}

// Pulls stored camera position and world array from localStorage
function loadGame() {
  // worldArray = JSON.parse(getItem('worldArray'));
  worldArray = getItem('worldArray')
  camera.eyeX = getItem('playerX');
  camera.eyeY = getItem('playerY');
  camera.eyeZ = getItem('playerZ');
  camPitch = getItem('camPitch');
  camYaw = getItem('camYaw');
}

// Replaces every air block in an area with a tree
function buildTree(rootX, rootY, rootZ, tree) {
  // Sets variables needed
  let treeHeight = tree.length;
  let treeWidthX = tree[0].length;
  let treeWidthZ = tree[0][0].length;
  
  // Iterate through coordinates relative to tree
  for (let y = treeHeight - 1; y >= 0; y--) {
    for (let x = 0; x < treeWidthX; x++) {
      for (let z = 0; z < treeWidthZ; z++) {
        // Set coordinates relative to world
        let worldX = rootX - Math.floor(treeWidthX/2) + x;
        let worldY = rootY + y - treeHeight;
        let worldZ = rootZ - Math.floor(treeWidthZ/2) + z;

        // If the block in question is an air block and the matching block in the tree template is a solid block, set the air block to the corresponding tree block
        if (worldArray[worldY][worldX][worldZ] === 0 && tree1[y][x][z] !== 0) {
          worldArray[worldY][worldX][worldZ] = tree[y][x][z];
        }
      }
    }
  }

  // Sets the block underneath the bottommost log to dirt.
  worldArray[rootY][rootX][rootZ] = 2;
}