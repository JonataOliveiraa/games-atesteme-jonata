import Phaser from "phaser";

import level1MathBgUrl from "../../../assets/games/EF02CO03/level-1-math-bg.png";
import level2PaperBgUrl from "../../../assets/games/EF02CO03/level-2-paper-bg.png";
import level3FruitBgUrl from "../../../assets/games/EF02CO03/level-3-fruit-bg.png";
import machineCalculatorUrl from "../../../assets/games/EF02CO03/machine-calculator.png";
import machineFolderUrl from "../../../assets/games/EF02CO03/machine-folder.png";
import machineMixerUrl from "../../../assets/games/EF02CO03/machine-mixer.png";
import machineStamperUrl from "../../../assets/games/EF02CO03/machine-stamper.png";
import commandAdd2Url from "../../../assets/games/EF02CO03/command-add2.png";
import commandAddFruitUrl from "../../../assets/games/EF02CO03/command-add-fruit.png";
import commandBlendUrl from "../../../assets/games/EF02CO03/command-blend.png";
import commandCreaseUrl from "../../../assets/games/EF02CO03/command-crease.png";
import commandDoubleUrl from "../../../assets/games/EF02CO03/command-double.png";
import commandFoldUrl from "../../../assets/games/EF02CO03/command-fold.png";
import commandStampOkUrl from "../../../assets/games/EF02CO03/command-stamp-ok.png";
import commandStampStarUrl from "../../../assets/games/EF02CO03/command-stamp-star.png";
import productFoldedPaperUrl from "../../../assets/games/EF02CO03/product-folded-paper.png";
import productFruitDrinkStarUrl from "../../../assets/games/EF02CO03/product-fruit-drink-star.png";
import productNumber10Url from "../../../assets/games/EF02CO03/product-number-10.png";
import successBadgeUrl from "../../../assets/games/EF02CO02/success-badge.png";

const ASSETS: Array<[string, string]> = [
  ["level-1-math-bg", level1MathBgUrl],
  ["level-2-paper-bg", level2PaperBgUrl],
  ["level-3-fruit-bg", level3FruitBgUrl],
  ["machine-calculator", machineCalculatorUrl],
  ["machine-folder", machineFolderUrl],
  ["machine-mixer", machineMixerUrl],
  ["machine-stamper", machineStamperUrl],
  ["command-add2", commandAdd2Url],
  ["command-add-fruit", commandAddFruitUrl],
  ["command-blend", commandBlendUrl],
  ["command-crease", commandCreaseUrl],
  ["command-double", commandDoubleUrl],
  ["command-fold", commandFoldUrl],
  ["command-stamp-ok", commandStampOkUrl],
  ["command-stamp-star", commandStampStarUrl],
  ["product-folded-paper", productFoldedPaperUrl],
  ["product-fruit-drink-star", productFruitDrinkStarUrl],
  ["product-number-10", productNumber10Url],
  ["success-badge", successBadgeUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0xdff7ff);

    this.add.text(640, 296, "Fábrica de Máquinas", {
      fontSize: "50px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 7,
    }).setOrigin(0.5);

    this.add.text(640, 374, "Ligando as estações...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
    }).setOrigin(0.5);
  }
}
