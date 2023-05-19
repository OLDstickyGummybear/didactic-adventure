let easycam;

function setup() {
  createCanvas(500, 500);
  easycam = createEasyCam();
  
}

function draw() {
  background(255);
  easycam.mouseDragRotate();
}

// https://diwi.github.io/p5.EasyCam/documentation/