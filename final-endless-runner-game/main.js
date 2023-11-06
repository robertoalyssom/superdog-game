// time *** 9:22:30 ***
import Player from "./player.js";
import { inputHandler } from "./input.js";
import { Background } from "./background.js";
import { FlyingEnemy, GroundEnemy, ClimbingEnemy } from "./enemies.js";
import { UI } from "./UI.js";

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 500;

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.groundMargin = 83;
      this.speed = 0; // 0 or 3
      this.maxSpeed = 3;
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new inputHandler(this);
      this.UI = new UI(this);
      this.enemies = [];
      this.particles = [];
      this.collisions = [];
      this.maxParticles = 100;
      this.enemyTimer = 0;
      this.maxTimeEnemy = 1000; // a new enemy per second (1000ms)
      this.debug = false;
      this.score = 0;
      this.fontColor = "black";
      this.time = 0;
      this.maxTime = 10000; // x seconds
      this.gameOver = false;
      this.player.currentState = this.player.states[0]; // it's here because all the player obj needs to be full loaded
      this.player.currentState.enter(); // to activate its inicial default state
    }
    update(deltaTime) {
      this.time += deltaTime;
      if (this.time > this.maxTime) this.gameOver = true;

      this.background.update();
      this.player.update(this.input.keys, deltaTime); // param. is keys array
      // handle Enemies
      if (this.enemyTimer > this.maxTimeEnemy) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
      this.enemies.forEach((enemy, index) => {
        enemy.update(deltaTime);
        if (enemy.markedForDeletion) this.enemies.splice(index, 1);
      });
      // handle particles
      this.particles.forEach((particle, index) => {
        particle.update();
        if (particle.markedForDeletion) this.particles.splice(index, 1);
      });
      if (this.particles.length > this.maxParticles) {
        // kepping only the first 100 particles in the array
        this.particles.length = this.maxParticles;
      }
      // handle collision sprites
      this.collisions.forEach((collision, index) => {
        collision.update(deltaTime);
        if (collision.markedForDelection) this.collisions.splice(index, 1);
      });
    }
    draw(context) {
      this.background.draw(context);
      this.player.draw(context);
      this.enemies.forEach((enemy) => enemy.draw(context));
      this.UI.draw(context);
      this.particles.forEach((particle) => particle.draw(context));
      this.collisions.forEach((collision) => collision.draw(context));
    }
    addEnemy() {
      if (this.speed > 0 && Math.random() > 0.5) {
        this.enemies.push(new GroundEnemy(this));
      } else if (this.speed > 0) {
        this.enemies.push(new ClimbingEnemy(this));
      }
      this.enemies.push(new FlyingEnemy(this));
    }
  }

  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    if (!game.gameOver) requestAnimationFrame(animate);
  }
  animate(0);
});
