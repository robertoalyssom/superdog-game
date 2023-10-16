// time *** 5:53:50 ***

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1300;
  canvas.height = 720;
  let enemies = [];
  let score = 0;
  let gameOver = false;

  class InputHandler {
    constructor() {
      this.keys = []; // keeping track of all the keys pressed here
      this.touchY = "";
      this.touchTreshhold = 30; // to avoid simple touches

      window.addEventListener("keydown", (e) => {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft" ||
          (e.key === "ArrowRight" && this.keys.indexOf(e.key) === -1)
        ) {
          this.keys.push(e.key); // arrow functions catch the context 'this' in which they were created(InputHandler), not were it's defined(window) (lexical escop)

          if (this.keys.length > 1) this.keys.splice(1); // to remove accumulation in 'keys' array

          this.keys.forEach((key) => {
            if (e.key != key) this.keys.push(e.key); // to jump and go right or left at the same time
          });
        } else if (e.key === "Enter" && gameOver) restartGame();

        console.log(this.keys);
      });
      window.addEventListener("keyup", (e) => {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
      });
      window.addEventListener("touchstart", (e) => {
        // console.log(e.changedTouches[0].pageY);
        this.touchY = e.changedTouches[0].pageY;
      });
      window.addEventListener("touchmove", (e) => {
        const swipeDistance = e.changedTouches[0].pageY - this.touchY; // swiping calculation (negative value)
        if (
          swipeDistance < -this.touchTreshhold &&
          this.keys.indexOf("swipe up") === -1
        ) {
          this.keys.push("swipe up");
        } else if (
          swipeDistance > this.touchTreshhold &&
          this.keys.indexOf("swipe down") === -1
        ) {
          this.keys.push("swipe down");
          if (gameOver) restartGame();
        }
      });
      window.addEventListener("touchend", (e) => {
        this.keys.splice(this.keys.indexOf("swipe up"));
        this.keys.splice(this.keys.indexOf("swipe down"));
      });
    }
  }

  class Player {
    // defining properties of players objt: to draw, animate and update its position
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 100;
      this.y = this.gameHeight - this.height;
      this.image = playerImage; // 'playerImage' refers to img id
      this.frameX = 0;
      this.maxFrame = 8;
      this.frameY = 0;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 0;
      this.vy = 0; // velocity y
      this.weight = 1; // gravity
    }
    restart() {
      this.x = 100;
      this.y = this.gameHeight - this.width;
      this.maxFrame = 8;
      this.frameX = 0;
    }
    draw(context) {
      context.lineWidth = 5;
      context.strokeStyle = "white";
      context.beginPath();

      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update(input, deltaTime, enemies) {
      //collision detection
      enemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - 20 - (this.x + this.width / 2); // leg/cateto(a)
        const dy = enemy.y + enemy.height / 2 - (this.y + this.height / 2 + 20); // leg/cateto(b)
        const distance = Math.sqrt(dx * dx + dy * dy); // hipotenuse(c) c² = a² + b²
        if (distance < enemy.width / 3 + this.width / 3) {
          gameOver = true;
        }
      });
      // sprite animation
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      // controls
      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 5;
      } else if (input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -5;
      } else if (
        (input.keys.indexOf("ArrowUp") > -1 ||
          input.keys.indexOf("swipe up") > -1) &&
        this.onGround()
      ) {
        this.vy -= 30;
      } else {
        this.speed = 0;
      }
      // horizontal movement
      this.x += this.speed;
      if (this.x < 0) this.x = 0;
      else if (this.x > this.gameWidth - this.width)
        this.x = this.gameWidth - this.width;
      // vertical movement
      this.y += this.vy;
      if (!this.onGround()) {
        // if player isn't on ground
        this.vy += this.weight;
        this.maxFrame = 5;
        this.frameY = 1;
      } else {
        this.vy = 0;
        this.maxFrame = 8;
        this.frameY = 0;
      }
      if (this.y > this.gameHeight - this.height)
        this.y = this.gameHeight - this.height;
    }
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }

  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = backgroundImage;
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 7;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width - this.speed,
        this.y,
        this.width,
        this.height
      );
    }
    update() {
      this.x -= this.speed;
      if (this.x < 0 - this.width) this.x = 0;
    }
    restart() {
      this.x = 0;
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 160;
      this.height = 110;
      this.image = enemyImage;
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.frameX = 0;
      this.maxFrame = 5;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 8;
      this.markedForDelection = false;
    }
    draw(context) {
      context.lineWidth = 5;
      context.strokeStyle = "white";
      context.beginPath();
      context.arc(
        this.x + this.width / 2 - 20,
        this.y + this.height / 2,
        this.width / 3,
        0,
        Math.PI * 2
      );
      context.stroke();

      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update(deltaTime) {
      // defining animation frame to 20 fps
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;

      if (this.x < 0 - this.width) {
        this.markedForDelection = true;
        score++;
      }
    }
  }

  function handleEnemies(deltaTime) {
    // f. to add, animate and remove enemies from the game
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new Enemy(canvas.width, canvas.height));
      enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }
    enemies.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });
    enemies = enemies.filter((enemy) => !enemy.markedForDelection);
  }

  function displayStatusText(context) {
    // it's displaying score or game over message
    context.textAlign = "left"; // align score text
    context.font = "40px Helvetica";
    context.fillStyle = "black";
    context.fillText(`Score: ${score}`, 20, 50);
    context.fillStyle = "white";
    context.fillText(`Score: ${score}`, 22, 52);
    if (gameOver) {
      const gOMessage = "Game Over, press Enter or swiper down to restart!";
      context.textAlign = "center";
      context.fillStyle = "black";
      context.fillText(gOMessage, canvas.width / 2, 200);
      context.fillStyle = "white";
      context.fillText(gOMessage, canvas.width / 2 + 2, 202);
    }
  }

  function restartGame() {
    player.restart();
    background.restart();
    enemies = [];
    score = 0;
    gameOver = false;
    animate(0); // to start animation again
  }

  function toggleFullScreen() {
    console.log(document.fullscreenElement);
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch((err) => {
        alert(`Error, can't enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
  fullScreenButton.addEventListener("click", toggleFullScreen);

  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);

  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 1000;
  let randomEnemyInterval = Math.random() * 1000 + 500; // 500/1500

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    // background.update();
    player.draw(ctx);
    player.update(input, deltaTime, enemies);
    handleEnemies(deltaTime);
    displayStatusText(ctx);
    if (!gameOver) requestAnimationFrame(animate);
  }
  animate(0); // 0 for inicial timeStamp value
});
