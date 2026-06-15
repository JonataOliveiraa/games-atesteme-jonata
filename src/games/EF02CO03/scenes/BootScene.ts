import Phaser from "phaser";

import level1ShirtFactoryBgUrl from "../../../assets/games/EF02CO03/level-1-shirt-factory-bg.png";
import level2PlushFactoryBgUrl from "../../../assets/games/EF02CO03/level-2-plush-factory-bg.png";
import level3BackpackFactoryBgUrl from "../../../assets/games/EF02CO03/level-3-backpack-factory-bg.png";
import machineBackpackCutUrl from "../../../assets/games/EF02CO03/machine-backpack-cut.png";
import machineBackpackFabricUrl from "../../../assets/games/EF02CO03/machine-backpack-fabric.png";
import machineBackpackSewUrl from "../../../assets/games/EF02CO03/machine-backpack-sew.png";
import machineBackpackStrapsUrl from "../../../assets/games/EF02CO03/machine-backpack-straps.png";
import machineBackpackZipperUrl from "../../../assets/games/EF02CO03/machine-backpack-zipper.png";
import machinePlushCutUrl from "../../../assets/games/EF02CO03/machine-plush-cut.png";
import machinePlushDetailsUrl from "../../../assets/games/EF02CO03/machine-plush-details.png";
import machinePlushFabricUrl from "../../../assets/games/EF02CO03/machine-plush-fabric.png";
import machinePlushFillUrl from "../../../assets/games/EF02CO03/machine-plush-fill.png";
import machinePlushSewUrl from "../../../assets/games/EF02CO03/machine-plush-sew.png";
import machineShirtButtonsUrl from "../../../assets/games/EF02CO03/machine-shirt-buttons.png";
import machineShirtCutUrl from "../../../assets/games/EF02CO03/machine-shirt-cut.png";
import machineShirtFabricUrl from "../../../assets/games/EF02CO03/machine-shirt-fabric.png";
import machineShirtIronUrl from "../../../assets/games/EF02CO03/machine-shirt-iron.png";
import machineShirtSewUrl from "../../../assets/games/EF02CO03/machine-shirt-sew.png";
import productPlushFinalUrl from "../../../assets/games/EF02CO03/product-plush-final.png";
import productBackpackFinalUrl from "../../../assets/games/EF02CO03/product-backpack-final.png";
import productShirtFinalUrl from "../../../assets/games/EF02CO03/product-shirt-final.png";
import successBadgeUrl from "../../../assets/games/EF02CO02/success-badge.png";

const ASSETS: Array<[string, string]> = [
  ["level-1-shirt-factory-bg", level1ShirtFactoryBgUrl],
  ["level-2-plush-factory-bg", level2PlushFactoryBgUrl],
  ["level-3-backpack-factory-bg", level3BackpackFactoryBgUrl],
  ["machine-backpack-cut", machineBackpackCutUrl],
  ["machine-backpack-fabric", machineBackpackFabricUrl],
  ["machine-backpack-sew", machineBackpackSewUrl],
  ["machine-backpack-straps", machineBackpackStrapsUrl],
  ["machine-backpack-zipper", machineBackpackZipperUrl],
  ["machine-plush-cut", machinePlushCutUrl],
  ["machine-plush-details", machinePlushDetailsUrl],
  ["machine-plush-fabric", machinePlushFabricUrl],
  ["machine-plush-fill", machinePlushFillUrl],
  ["machine-plush-sew", machinePlushSewUrl],
  ["machine-shirt-buttons", machineShirtButtonsUrl],
  ["machine-shirt-cut", machineShirtCutUrl],
  ["machine-shirt-fabric", machineShirtFabricUrl],
  ["machine-shirt-iron", machineShirtIronUrl],
  ["machine-shirt-sew", machineShirtSewUrl],
  ["product-plush-final", productPlushFinalUrl],
  ["product-backpack-final", productBackpackFinalUrl],
  ["product-shirt-final", productShirtFinalUrl],
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
