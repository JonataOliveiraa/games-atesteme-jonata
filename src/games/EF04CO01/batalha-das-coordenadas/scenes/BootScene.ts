import Phaser from "phaser";

import coverUrl from "../../../../assets/games/EF04CO01/batalha-das-coordenadas/cover-batalha-coordenadas.png";
import bgBattleGridUrl from "../../../../assets/games/EF04CO01/batalha-das-coordenadas/bg-battle-grid.png";
import bgOceanGridUrl from "../../../../assets/games/EF04CO01/batalha-das-coordenadas/bg-ocean-grid.png";
import bgTreasureMapUrl from "../../../../assets/games/EF04CO01/batalha-das-coordenadas/bg-treasure-map.png";
import gridCellUrl from "../../../../assets/games/EF04CO01/batalha-das-coordenadas/grid-cell.png";
import shipIconUrl from "../../../../assets/games/EF04CO01/batalha-das-coordenadas/ship-icon.png";
import explosionIconUrl from "../../../../assets/games/EF04CO01/batalha-das-coordenadas/explosion-icon.png";
import waterSplashUrl from "../../../../assets/games/EF04CO01/batalha-das-coordenadas/water-splash.png";

const ASSETS: Array<[string, string]> = [
  ["cover", coverUrl],
  ["bg-battle-grid", bgBattleGridUrl],
  ["bg-ocean-grid", bgOceanGridUrl],
  ["bg-treasure-map", bgTreasureMapUrl],
  ["grid-cell", gridCellUrl],
  ["ship-icon", shipIconUrl],
  ["explosion-icon", explosionIconUrl],
  ["water-splash", waterSplashUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0x0c1445);
    this.add
      .text(640, 296, "Batalha das Coordenadas", {
        fontSize: "46px",
        fontFamily: "Arial Black, Arial",
        color: "#f59e0b",
        stroke: "#0c1445",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.add
      .text(640, 374, "Preparando o campo de batalha...", {
        fontSize: "26px",
        fontFamily: "Arial Black, Arial",
        color: "#e2e8f0",
      })
      .setOrigin(0.5);
  }
}
