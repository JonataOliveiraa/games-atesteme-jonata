import Phaser from "phaser";

import blockMoveUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/block-move.png";
import goalStageUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/goal-stage.png";
import gridTileUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/grid-tile.png";
import obstacleConeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/obstacle-cone.png";
import pathMarkUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/path-mark.png";
import robotUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/robot.png";
import successBadgeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/success-badge.png";
import wallpaperUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/wallpaper.png";

const ASSETS: Array<[string, string]> = [
  ["wallpaper", wallpaperUrl],
  ["robot", robotUrl],
  ["block-move", blockMoveUrl],
  ["goal-stage", goalStageUrl],
  ["obstacle-cone", obstacleConeUrl],
  ["grid-tile", gridTileUrl],
  ["path-mark", pathMarkUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0xe0f2fe);

    this.add
      .text(640, 300, "Desfile do Robô Repetidor", {
        fontSize: "48px",
        fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
        color: "#25327a",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(640, 380, "Preparando os blocos...", {
        fontSize: "26px",
        fontFamily: "DynaPuff, Arial, sans-serif",
        color: "#334155",
      })
      .setOrigin(0.5);
  }
}
