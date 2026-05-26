import * as Phaser from "phaser";

import bgLevelOneUrl from "../../../assets/games/EF01CO05/bg1.png";
import bgLevelTwoUrl from "../../../assets/games/EF01CO05/bg2.png";
import bgLevelThreeUrl from "../../../assets/games/EF01CO05/bg3.png";
import cursorBlackUrl from "../../../assets/games/EF01CO05/cursor-paint-black.png";
import cursorBlueUrl from "../../../assets/games/EF01CO05/cursor-paint-blue.png";
import cursorGrayUrl from "../../../assets/games/EF01CO05/cursor-paint-gray.png";
import cursorGreenUrl from "../../../assets/games/EF01CO05/cursor-paint-green.png";
import cursorPinkUrl from "../../../assets/games/EF01CO05/cursor-paint-pink.png";
import cursorPurpleUrl from "../../../assets/games/EF01CO05/cursor-paint-purple.png";
import cursorWhiteUrl from "../../../assets/games/EF01CO05/cursor-paint-white.png";
import cursorYellowUrl from "../../../assets/games/EF01CO05/cursor-paint-yellow.png";

const ASSETS: Array<[string, string]> = [
  ["pixel-secret-bg-level-1", bgLevelOneUrl],
  ["pixel-secret-bg-level-2", bgLevelTwoUrl],
  ["pixel-secret-bg-level-3", bgLevelThreeUrl],
  ["pixel-secret-cursor-black", cursorBlackUrl],
  ["pixel-secret-cursor-blue", cursorBlueUrl],
  ["pixel-secret-cursor-gray", cursorGrayUrl],
  ["pixel-secret-cursor-green", cursorGreenUrl],
  ["pixel-secret-cursor-pink", cursorPinkUrl],
  ["pixel-secret-cursor-purple", cursorPurpleUrl],
  ["pixel-secret-cursor-white", cursorWhiteUrl],
  ["pixel-secret-cursor-yellow", cursorYellowUrl],
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
    this.scene.launch("UIScene");
    this.scene.start("GameScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0xfdf2f8);

    this.add
      .text(640, 300, "Pixel Secreto", {
        fontSize: "56px",
        fontFamily: "Arial Black, Arial",
        color: "#86198f",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(640, 380, "Preparando os códigos...", {
        fontSize: "28px",
        fontFamily: "Arial",
        color: "#334155",
      })
      .setOrigin(0.5);
  }
}
