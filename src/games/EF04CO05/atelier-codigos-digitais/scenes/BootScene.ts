import Phaser from "phaser";

import coverUrl from "../../../../assets/games/EF04CO05/atelier-codigos-digitais/cover-atelier-codigos-digitais.png";
import bgBinaryUrl from "../../../../assets/games/EF04CO05/atelier-codigos-digitais/bg-binary-workshop.png";
import bgAsciiUrl from "../../../../assets/games/EF04CO05/atelier-codigos-digitais/bg-ascii-workshop.png";
import bgRgbUrl from "../../../../assets/games/EF04CO05/atelier-codigos-digitais/bg-rgb-workshop.png";
import pixelCellUrl from "../../../../assets/games/EF04CO05/atelier-codigos-digitais/pixel-cell.png";
import codePanelUrl from "../../../../assets/games/EF04CO05/atelier-codigos-digitais/code-panel.png";
import colorMixerUrl from "../../../../assets/games/EF04CO05/atelier-codigos-digitais/color-mixer.png";
import referenceChartUrl from "../../../../assets/games/EF04CO05/atelier-codigos-digitais/reference-chart.png";

const ASSETS: Array<[string, string]> = [
  ["cover-atelier",         coverUrl],
  ["bg-binary-workshop",    bgBinaryUrl],
  ["bg-ascii-workshop",     bgAsciiUrl],
  ["bg-rgb-workshop",       bgRgbUrl],
  ["pixel-cell",            pixelCellUrl],
  ["code-panel",            codePanelUrl],
  ["color-mixer",           colorMixerUrl],
  ["reference-chart",       referenceChartUrl],
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.createLoadingScreen();
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.start("GameScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0x12032a);
    this.add.text(640, 296, "Ateliê de Códigos Digitais", {
      fontSize: "44px",
      fontFamily: "Arial Black, Arial",
      color: "#f0abfc",
      stroke: "#c026d3",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Preparando o ateliê...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#f97316",
    }).setOrigin(0.5);
  }
}
