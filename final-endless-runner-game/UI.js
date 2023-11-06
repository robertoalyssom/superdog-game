export class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 30;
    this.fontFamily = "Noto Sans";
  }
  draw(context) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = "white";
    context.shadowBlur = 0;
    context.font = this.fontSize + "px " + this.fontFamily;
    context.textAlign = "left";
    context.fillStylle = this.game.fontColor;
    // score
    context.fillText(`Score: ${this.game.score}`, 20, 50);
    // timer
    context.font = this.fontSize * 0.8 + "px " + this.fontFamily;
    context.fillText(`Time: ${(this.game.time * 0.001).toFixed(1)}`, 20, 80);
    // game over message
    if (this.game.gameOver) {
      context.textAlign = "center";
      context.font = this.fontSize * 1.5 + "px " + this.fontFamily;
      if (this.game.score > 5) {
        context.fillText(
          "Boo-yah",
          this.game.width * 0.5,
          this.game.height * 0.5 - 20
        );
        context.font = this.fontSize * 0.7 + "px " + this.fontFamily;
        context.fillText(
          "What are creatures of the night afraid of? YOU!!!",
          this.game.width * 0.5,
          this.game.height * 0.5 + 20
        );
      } else {
        context.fillText(
          "Love at the first bite?",
          this.game.width * 0.5,
          this.game.height * 0.5 - 20
        );
        context.font = this.fontSize * 0.7 + "px " + this.fontFamily;
        context.fillText(
          "Nope. Better luck next time!",
          this.game.width * 0.5,
          this.game.height * 0.5 + 20
        );
      }
    }
    context.restore();
  }
}