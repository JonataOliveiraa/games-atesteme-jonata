import * as Phaser from "phaser";
import { faseInicial } from "../../../../shared/level/faseInicial";

import bgLevelOneUrl from "../../../../assets/games/EF01CO05/pixel-secreto/bg1.png";
import bgLevelTwoUrl from "../../../../assets/games/EF01CO05/pixel-secreto/bg2.png";
import bgLevelThreeUrl from "../../../../assets/games/EF01CO05/pixel-secreto/bg3.png";
import cursorBlackUrl from "../../../../assets/games/EF01CO05/pixel-secreto/cursor-paint-black.png";
import cursorBlueUrl from "../../../../assets/games/EF01CO05/pixel-secreto/cursor-paint-blue.png";
import cursorGrayUrl from "../../../../assets/games/EF01CO05/pixel-secreto/cursor-paint-gray.png";
import cursorGreenUrl from "../../../../assets/games/EF01CO05/pixel-secreto/cursor-paint-green.png";
import cursorPinkUrl from "../../../../assets/games/EF01CO05/pixel-secreto/cursor-paint-pink.png";
import cursorPurpleUrl from "../../../../assets/games/EF01CO05/pixel-secreto/cursor-paint-purple.png";
import cursorWhiteUrl from "../../../../assets/games/EF01CO05/pixel-secreto/cursor-paint-white.png";
import cursorYellowUrl from "../../../../assets/games/EF01CO05/pixel-secreto/cursor-paint-yellow.png";
import { createLoadingScreen } from "../../../../shared/loading/createLoadingScreen";

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
    createLoadingScreen(this, {
      title: "Pixel Secreto",
      subtitle: "Pinte o código",
      description: "Preparando os códigos...",
      theme: {
        background: { kind: "checker", base: 0xfdf2f8, color: 0x86198f, alpha: 0.08, size: 60 },
        card: 0x86198f,
        cardShadow: 0x3b0a41,
        cardHighlight: 0xffffff,
        cardBorder: 0xf9a8d4,
        title: 0xffffff,
        subtitle: 0xfbcfe8,
        description: 0xfce7f3,
        titleStroke: 0x3b0a41,
        progressTrack: 0x3b0a41,
        progressBorder: 0xffffff,
        progressFill: 0xf472b6,
        progressHighlight: 0xffffff,
      },
    });
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.launch("UIScene");
    this.scene.start("GameScene", { level: faseInicial(this, 1) });
  }
}
