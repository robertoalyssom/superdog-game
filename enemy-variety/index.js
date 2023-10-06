// Enemy class define what enemies look like, how they move and how they behave

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 800;

  class Game {
    constructor(ctx, width, height) {
      this.ctx = ctx;
      this.width = width;
      this.height = height;
      this.enemies = [];
      this.enemyInterval = 500;
      this.enemyTimer = 0;
      this.enemyTypes = ["worm", "ghost", "spider"];
    }
    update(deltaTime) {
      if (this.enemyTimer > this.enemyInterval) {
        this.#addNewEnemy();
        this.enemyTimer = 0;
        this.enemies = this.enemies.filter(
          (object) => !object.markedForDeletion
        );
      } else {
        this.enemyTimer += deltaTime;
      }
      this.enemies.forEach((object) => object.update(deltaTime));
    }
    draw() {
      this.enemies.forEach((object) => object.draw(this.ctx));
    }
    #addNewEnemy() {
      this.randomEnemy =
        this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
      if (this.randomEnemy == "worm") {
        this.enemies.push(new Worm(this)); // this's all Game's properties
      } else if (this.randomEnemy == "ghost") {
        this.enemies.push(new Ghost(this));
      } else if (this.randomEnemy == "spider") {
        this.enemies.push(new Spider(this));
      }

      // this.enemies.sort((a, b) => {
      //   return a.y - b.y;
      // });
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game; // game objt
      this.markedForDeletion = false;
      this.frameX = 0;
      this.maxFrame = 5;
      this.frameInterval = 100;
      this.frameTimer = 0;
    }
    update(deltaTime) {
      this.x -= this.vx * deltaTime;
      // remove enemies
      if (this.x < 0 - this.width) this.markedForDeletion = true;

      if (this.frameTimer > this.frameInterval) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
    }
    draw(ctx) {
      ctx.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
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

  class Worm extends Enemy {
    constructor(game) {
      super(game); // 'super' is instantianting constructor of it parent class(Enemy)
      this.spriteWidth = 229;
      this.spriteHeight = 171;
      this.width = this.spriteWidth / 2;
      this.height = this.spriteHeight / 2;
      this.x = this.game.width;
      this.y = this.game.height - this.height; // 0/800
      this.image = worm; // 'worm' is img's id
      this.vx = Math.random() * 0.1 + 0.1; // 0.1/<0.2 'velocity on x-axis'
    }
  }

  class Ghost extends Enemy {
    constructor(game) {
      super(game);
      this.spriteWidth = 261;
      this.spriteHeight = 209;
      this.width = this.spriteWidth / 2;
      this.height = this.spriteHeight / 2;
      this.x = this.game.width;
      this.y = Math.random() * (this.game.height * 0.6); // 0/0.6
      this.image = ghost;
      this.vx = Math.random() * 0.2 + 0.1; // 0.1/<0.3
      this.angle = 0;
      this.curve = Math.random() * 3; // 0/3
    }
    update(deltaTime) {
      super.update(deltaTime); // Enemy.update()
      this.y += Math.sin(this.angle) * this.curve; // apply wave movement
      this.angle += 0.04;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = 0.5; // adicional code only for ghosts
      super.draw(ctx); // Enemy.draw()
      ctx.restore();
    }
  }

  class Spider extends Enemy {
    constructor(game) {
      super(game);
      this.spriteWidth = 310;
      this.spriteHeight = 175;
      this.width = this.spriteWidth / 2;
      this.height = this.spriteHeight / 2;
      this.x = Math.random() * this.game.width; // 0/500
      this.y = 0 - this.height;
      this.image = spider;
      this.vx = 0;
      this.vy = Math.random() * 0.1 + 0.1; // 0.1/0.2
      this.maxLength = Math.random() * this.game.height; // 0/800
    }
    update(deltaTime) {
      super.update(deltaTime);
      if (this.y < 0 - this.height) this.markedForDeletion = true;

      this.y += this.vy * deltaTime;
      if (this.y > this.maxLength) this.vy *= -1;
    }
    draw(ctx) {
      ctx.beginPath(); // to draw web
      ctx.moveTo(this.x + this.width / 2, 0);
      ctx.lineTo(this.x + this.width / 2, this.y + 10);
      ctx.stroke();
      super.draw(ctx);
    }
  }

  const game = new Game(ctx, canvas.width, canvas.height);
  console.log(game);

  lastTime = 0;
  function animate(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const deltaTime = timeStamp - lastTime; // my computer can serve a new frame every 16 miliseconds
    lastTime = timeStamp;
    // console.log(deltaTime);
    game.update(deltaTime);
    game.draw();
    requestAnimationFrame(animate);
  }
  animate(0);
});

// const x = test;
// console.log(x);
