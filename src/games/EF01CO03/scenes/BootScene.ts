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
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x9ee7ff, 0xffd6ef, 0xd7ffe6, 0xfff2c2, 1);
    bg.fillRect(0, 0, 1280, 720);
    bg.fillStyle(0xffffff, 0.22);
    bg.fillCircle(180, 130, 96);
    bg.fillCircle(1110, 120, 128);
    bg.fillCircle(1040, 612, 150);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.09);
    shadow.fillRoundedRect(342, 172, 596, 396, 38);

    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.86);
    panel.fillRoundedRect(330, 160, 596, 396, 38);
    panel.lineStyle(5, 0xffffff, 0.9);
    panel.strokeRoundedRect(330, 160, 596, 396, 38);

    this.add.text(640, 238, "⚙️", {
      fontSize: "66px",
      fontFamily: "Arial",
      padding: { top: 16, bottom: 16, left: 16, right: 16 },
    }).setOrigin(0.5);

    this.add.text(640, 342, "Oficina dos\nAlgoritmos", {
      fontSize: "44px",
      fontFamily: "Arial Black, Arial",
      color: "#0f75bc",
      stroke: "#ffffff",
      strokeThickness: 7,
      align: "center",
      lineSpacing: -8,
    }).setOrigin(0.5);

    this.add.text(640, 438, "Preparando os cartões...", {
      fontSize: "23px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0xffffff, 0.95);
    barBg.fillRoundedRect(450, 496, 380, 26, 13);
    barBg.lineStyle(3, 0xffffff, 0.85);
    barBg.strokeRoundedRect(450, 496, 380, 26, 13);

    const bar = this.add.rectangle(460, 509, 0, 14, 0x22c55e)
      .setOrigin(0, 0.5);

    this.tweens.add({
      targets: bar,
      width: 360,
      duration: 700,
      ease: "Sine.easeInOut",
    });
  }
}
