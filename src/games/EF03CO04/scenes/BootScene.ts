import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.createLoadingScreen();
  }

  create() {
    this.scene.start("GameScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0xdff7ff);
    this.add.text(640, 296, "Montador de Informações", {
      fontSize: "48px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 7,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Organizando dados...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
    }).setOrigin(0.5);
  }
}
