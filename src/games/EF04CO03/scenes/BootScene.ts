import Phaser from "phaser";

import coverUrl from "../../../assets/games/EF04CO03/cover-predio-dos-lacos.png";
import bgBuildingDayUrl from "../../../assets/games/EF04CO03/bg-building-day.png";
import bgBuildingSunsetUrl from "../../../assets/games/EF04CO03/bg-building-sunset.png";
import bgBuildingNightUrl from "../../../assets/games/EF04CO03/bg-building-night.png";
import windowDirtyUrl from "../../../assets/games/EF04CO03/window-dirty.png";
import windowCleanUrl from "../../../assets/games/EF04CO03/window-clean.png";
import loopBlockBgUrl from "../../../assets/games/EF04CO03/loop-block-bg.png";
import cleanerCharacterUrl from "../../../assets/games/EF04CO03/cleaner-character.png";

const ASSETS: Array<[string, string]> = [
  ["cover",               coverUrl],
  ["bg-building-day",     bgBuildingDayUrl],
  ["bg-building-sunset",  bgBuildingSunsetUrl],
  ["bg-building-night",   bgBuildingNightUrl],
  ["window-dirty",        windowDirtyUrl],
  ["window-clean",        windowCleanUrl],
  ["loop-block-bg",       loopBlockBgUrl],
  ["cleaner-character",   cleanerCharacterUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0x0f172a);
    this.add.text(640, 296, "Prédio dos Laços", {
      fontSize: "52px",
      fontFamily: "Arial Black, Arial",
      color: "#bfdbfe",
      stroke: "#1e40af",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Preparando o prédio...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#4ade80",
    }).setOrigin(0.5);
  }
}
