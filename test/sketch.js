let easycam;

function setup() {
  createCanvas(500, 500);
  easycam = createEasyCam();
  
}

function draw() {
  background(255);
  easycam.attachMouseListeners(p5.Renderer);
}

// https://diwi.github.io/p5.EasyCam/documentation/