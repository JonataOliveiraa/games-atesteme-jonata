import Phaser from "phaser";

import coverUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/cover-estudio-multiformato.png";
import bgFormatWorkshopUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/bg-format-workshop.png";
import bgCreativeStudioUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/bg-creative-studio.png";
import bgMissionStudioUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/bg-mission-studio.png";
import studioCanvasUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/studio-canvas.png";
import formatCardDrawingUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/format-card-drawing.png";
import formatCardTextUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/format-card-text.png";
import formatCardAudioUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/format-card-audio.png";
import formatCardPhotoUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/format-card-photo.png";

const ASSETS: Array<[string, string]> = [
  ["cover", coverUrl],
  ["bg-format-workshop", bgFormatWorkshopUrl],
  ["bg-creative-studio", bgCreativeStudioUrl],
  ["bg-mission-studio", bgMissionStudioUrl],
  ["studio-canvas", studioCanvasUrl],
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
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#fbbf24",
      stroke: "#1e1b4b",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Preparando o estúdio...", {
      fontSize: "26px",
      fontFamily: "'DynaPuff Black', 'Arial Black', Arial, sans-serif",
      color: "#e2e8f0",
    }).setOrigin(0.5);
  }
}
