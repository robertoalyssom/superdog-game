const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
console.log(ctx);
canvas.width = 500;
canvas.height = 700;
const explosions = [];
const canvasPosition = canvas.getBoundingClientRect();
console.log(canvasPosition);

class Explosion {
  constructor(x, y) {
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.width = this.spriteWidth * 0.7;
    this.height = this.spriteHeight * 0.7;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = "./image/boom.png";
    this.frame = 0;
    this.timer = 0;
    this.angle = Math.random() * 6.2; // 0 ... 6.2
    this.sound = new Audio();
    this.sound.src = "./sound/boom.wav";
  }
  update() {
    if (this.frame === 0) this.sound.play();
    this.timer++;
    if (this.timer % 6 === 0) {
      // "animation timer": each 5 timer => frame +1
      this.frame++;
    }
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y); // defining a new standart value for x and y until 'restore' => rotating arround itself
    ctx.rotate(this.angle);
    ctx.drawImage(
      this.image,
      this.spriteWidth * this.frame,
      0,
      this.spriteWidth,
      this.spriteHeight,
      0 - this.width / 2,
      0 - this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
}

window.addEventListener("click", (e) => {
  createAnimation(e);
});
// window.addEventListener("mousemove", (e) => {
//   createAnimation(e);
// });

function createAnimation(e) {
  let positionX = e.x - canvasPosition.left;
  let positionY = e.y - canvasPosition.top;
  explosions.push(new Explosion(positionX, positionY));
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < explosions.length; ++i) {
    explosions[i].update();
    explosions[i].draw();

    if (explosions[i].frame > 5) {
      // after played all animation
      explosions.splice(i, 1);
      i--; // to make sure it is going to animate the next object after removed its neighbor
    }
  }

  requestAnimationFrame(animate);
}
animate();
