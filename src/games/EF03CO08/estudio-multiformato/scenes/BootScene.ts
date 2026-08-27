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
import { createLoadingScreen } from "../../../../shared/loading/createLoadingScreen";

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
    createLoadingScreen(this, {
      title: "Estúdio Multiformato",
      subtitle: "Texto, som e imagem",
      description: "Preparando o estúdio...",
      theme: {
        background: { kind: "rays", base: 0x4c1d95, color: 0xfbbf24, alpha: 0.08, count: 18 },
        card: 0x1e1b4b,
        cardShadow: 0x120f2e,
        cardHighlight: 0xffffff,
        cardBorder: 0xfbbf24,
        title: 0xffffff,
        subtitle: 0xfbbf24,
        description: 0xe2e8f0,
        titleStroke: 0x120f2e,
        progressTrack: 0x120f2e,
        progressBorder: 0xfbbf24,
        progressFill: 0xa78bfa,
        progressHighlight: 0xffffff,
      },
    });
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.start("GameScene");
  }
}
