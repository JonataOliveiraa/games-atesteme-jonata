import Phaser from "phaser";
import { faseInicial } from "../../../../shared/level/faseInicial";

import level1ShirtFactoryBgUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/level-1-shirt-factory-bg.png";
import level2PlushFactoryBgUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/level-2-plush-factory-bg.png";
import level3BackpackFactoryBgUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/level-3-backpack-factory-bg.png";
import machineBackpackCutUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-backpack-cut.png";
import machineBackpackFabricUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-backpack-fabric.png";
import machineBackpackSewUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-backpack-sew.png";
import machineBackpackStrapsUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-backpack-straps.png";
import machineBackpackZipperUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-backpack-zipper.png";
import machinePlushCutUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-plush-cut.png";
import machinePlushDetailsUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-plush-details.png";
import machinePlushFabricUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-plush-fabric.png";
import machinePlushFillUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-plush-fill.png";
import machinePlushSewUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-plush-sew.png";
import machineShirtButtonsUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-shirt-buttons.png";
import machineShirtCutUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-shirt-cut.png";
import machineShirtFabricUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-shirt-fabric.png";
import machineShirtIronUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-shirt-iron.png";
import machineShirtSewUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/machine-shirt-sew.png";
import productPlushFinalUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/product-plush-final.png";
import productBackpackFinalUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/product-backpack-final.png";
import productShirtFinalUrl from "../../../../assets/games/EF02CO03/fabrica-de-maquinas/product-shirt-final.png";
import successBadgeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/success-badge.png";
import { createLoadingScreen } from "../../../../shared/loading/createLoadingScreen";
import { preloadLives } from '../../../../shared/hud/createLives'

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
    createLoadingScreen(this, {
      title: "Fábrica de Máquinas",
      subtitle: "Linha de montagem",
      description: "Ligando as estações...",
      theme: {
        background: { kind: "checker", base: 0xdff7ff, color: 0x25327a, alpha: 0.07, size: 80 },
        card: 0x25327a,
        cardShadow: 0x141c48,
        cardHighlight: 0xffffff,
        cardBorder: 0x67e8f9,
        title: 0xffffff,
        subtitle: 0xa5f3fc,
        description: 0xe0f7ff,
        titleStroke: 0x141c48,
        progressTrack: 0x141c48,
        progressBorder: 0xffffff,
        progressFill: 0x22d3ee,
        progressHighlight: 0xffffff,
      },
    });
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
      preloadLives(this)
  }

  create() {
    this.scene.start("GameScene", { level: faseInicial(this, 1) });
  }
}
