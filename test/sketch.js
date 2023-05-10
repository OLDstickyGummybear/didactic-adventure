let cam, div;
function setup() {
  createCanvas(100, 100, WEBGL);
  background(255);
  cam = createCamera();
  cam.lookAt(1, 0, 0);
  div = createDiv('centerX = ' + cam.centerX);
  div.position(0, 0);
  div.style('color', 'white');
  describe('An example showing the use of camera object properties');
}

function draw() {
  orbitControl();
  box(10);
}