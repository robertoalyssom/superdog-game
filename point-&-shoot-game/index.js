// *** time: 3:45:40 ***

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
ctx.font = "50px Impact";

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];
class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4; // 0.4 ... <1
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3; // 3 ... 8
    this.directionY = Math.random() * 5 - 2.5; // -2.5 ... 2.5
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = "./images/raven.png";
    this.frame = 0;
    this.maxFrame = 4;
    this.frameRate = 0;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 40;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color = `rgb(${this.randomColors[0]}, ${this.randomColors[1]}, ${this.randomColors[2]})`;
    this.hasTrail = Math.random() > 0.5; // true or false
    this.ultraSpeed = Math.random() >= 0.9;
  }
  update(deltatime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      // setting fly limits
      this.directionY = this.directionY * -1;
    }
    if (this.ultraSpeed) {
      this.directionX = this.directionX + 0.1; // ULTRA SPEED
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.markedForDeletion = true;

    this.timeSinceFlap += deltatime;
    //set frame interval
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;

      if (this.hasTrail) {
        for (let i = 0; i < 5; i++) {
          particles.push(new Particles(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (this.x < 0 - this.width) gameOver = true;
  }
  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let particles = [];
class Particles {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size / 2 + Math.random() * 50 - 25; // ... * (-25 ... 25)
    this.y = y + this.size / 3 + Math.random() * 50 - 25;
    this.radius = (Math.random() * this.size) / 10; // 10.8 ... 24,3
    this.maxRadius = Math.random() * 20 + 35; // 35 ... 55
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5; // 0.5 ... 1.5
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.3;
    if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
  }
  draw() {
    ctx.save(); // to changes affect only a single element
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath(); // to separate atual form from the last form drawn
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let explosions = [];
class Explosions {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "./images/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "./sounds/boom.wav";
    this.timeSinceLostFrame = 0;
    this.frameInterval = 110;
    this.markedForDeletion = false;
  }
  update(deltatime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLostFrame += deltatime;
    if (this.timeSinceLostFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLostFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size / 4,
      this.size,
      this.size
    );
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 50, 75);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 55, 80);
}

function drawGameOver() {
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText(
    `GAME OVER, your score is ${score}.`,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillStyle = "white";
  ctx.fillText(
    `GAME OVER, your score is ${score}.`,
    canvas.width / 2 + 5,
    canvas.height / 2 + 5
  );
}

window.addEventListener("click", (e) => {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  const pc = detectPixelColor.data; // pc = pixel color
  ravens.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      // collision by color detected
      object.markedForDeletion = true;
      if (object.ultraSpeed) score += 2; // ULTRA SPEED
      else score++;
      explosions.push(new Explosions(object.x, object.y, object.width));
    }
  });
});

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

  let deltatime = timestamp - lastTime; // 'deltatime' is how many time passed since the last frame
  lastTime = timestamp; // the value to compare in the next loop
  timeToNextRaven += deltatime; // +16 millisecons in my computer

  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort((a, b) => {
      // small ravens first
      return a.width - b.width;
    });
  }
  drawScore();

  [...particles, ...ravens, ...explosions].forEach((o) => o.update(deltatime)); // 'o' = object
  [...particles, ...ravens, ...explosions].forEach((object) => object.draw());

  ravens = ravens.filter((objt) => !objt.markedForDeletion);
  explosions = explosions.filter((objt) => !objt.markedForDeletion);
  particles = particles.filter((objt) => !objt.markedForDeletion);

  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

animate(0);