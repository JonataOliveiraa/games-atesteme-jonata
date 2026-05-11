import * as Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.createLoadingScreen();
  }

  create() {
    this.scene.launch("UIScene");
    this.scene.start("GameScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0xf3e8ff);

    this.add
      .text(640, 300, "Oficina dos Algoritmos", {
        fontSize: "52px",
        fontFamily: "Arial Black, Arial",
        color: "#5b21b6",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(640, 380, "Preparando o jogo...", {
        fontSize: "28px",
        fontFamily: "Arial",
        color: "#334155",
      })
      .setOrigin(0.5);
  }
}