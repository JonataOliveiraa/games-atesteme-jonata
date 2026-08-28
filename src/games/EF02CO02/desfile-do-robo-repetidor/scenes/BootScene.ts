import Phaser from "phaser";
import { faseInicial } from "../../../../shared/level/faseInicial";

import blockMoveUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/block-move.png";
import goalStageUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/goal-stage.png";
import gridTileUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/grid-tile.png";
import obstacleConeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/obstacle-cone.png";
import pathMarkUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/path-mark.png";
import robotUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/robot.png";
import successBadgeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/success-badge.png";
import wallpaperUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/wallpaper.png";
import { createLoadingScreen } from "../../../../shared/loading/createLoadingScreen";

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
    createLoadingScreen(this, {
      title: "Desfile do Robô Repetidor",
      subtitle: "Repita os passos",
      description: "Preparando os blocos...",
      theme: {
        background: { kind: "stripes", base: 0xe0f2fe, color: 0x25327a, alpha: 0.1, size: 40, gap: 60, angle: "diagonal" },
        card: 0x25327a,
        cardShadow: 0x141c48,
        cardHighlight: 0xffffff,
        cardBorder: 0x7dd3fc,
        title: 0xffffff,
        subtitle: 0xbae6fd,
        description: 0xe2e8f0,
        titleStroke: 0x141c48,
        progressTrack: 0x141c48,
        progressBorder: 0xffffff,
        progressFill: 0x38bdf8,
        progressHighlight: 0xffffff,
      },
    });
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.start("GameScene", { level: faseInicial(this, 1) });
  }
}
