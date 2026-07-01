import Phaser from "phaser";

import coverUrl from "../../../assets/games/EF03CO08/cover-estudio-multiformato.png";
import bgFormatWorkshopUrl from "../../../assets/games/EF03CO08/bg-format-workshop.png";
import bgCreativeStudioUrl from "../../../assets/games/EF03CO08/bg-creative-studio.png";
import bgMissionStudioUrl from "../../../assets/games/EF03CO08/bg-mission-studio.png";
import studioCanvasUrl from "../../../assets/games/EF03CO08/studio-canvas.png";
import studioMuralBoardUrl from "../../../assets/games/EF03CO08/studio-mural-board.png";
import formatCardDrawingUrl from "../../../assets/games/EF03CO08/format-card-drawing.png";
import formatCardTextUrl from "../../../assets/games/EF03CO08/format-card-text.png";
import formatCardAudioUrl from "../../../assets/games/EF03CO08/format-card-audio.png";
import formatCardPhotoUrl from "../../../assets/games/EF03CO08/format-card-photo.png";

const ASSETS: Array<[string, string]> = [
  ["cover", coverUrl],
  ["bg-format-workshop", bgFormatWorkshopUrl],
  ["bg-creative-studio", bgCreativeStudioUrl],
  ["bg-mission-studio", bgMissionStudioUrl],
  ["studio-canvas", studioCanvasUrl],
  ["studio-mural-board", studioMuralBoardUrl],
  ["format-card-drawing", formatCardDrawingUrl],
  ["format-card-text", formatCardTextUrl],
  ["format-card-audio", formatCardAudioUrl],
  ["format-card-photo", formatCardPhotoUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0x4c1d95);
    this.add.text(640, 296, "Estúdio Multiformato", {
      fontSize: "46px",
      fontFamily: "Arial Black, Arial",
      color: "#fbbf24",
      stroke: "#1e1b4b",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Preparando o estúdio...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#e2e8f0",
    }).setOrigin(0.5);
  }
}
