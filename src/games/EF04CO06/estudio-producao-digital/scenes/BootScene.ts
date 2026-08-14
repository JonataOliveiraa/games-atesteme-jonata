import Phaser from "phaser";

import coverUrl from "../../../../assets/games/EF04CO06/estudio-producao-digital/cover-estudio-producao-digital.png";
import bgPlanningUrl from "../../../../assets/games/EF04CO06/estudio-producao-digital/bg-studio-planning.png";
import bgProductionUrl from "../../../../assets/games/EF04CO06/estudio-producao-digital/bg-studio-production.png";
import bgReviewUrl from "../../../../assets/games/EF04CO06/estudio-producao-digital/bg-studio-review.png";
import formatTextUrl from "../../../../assets/games/EF04CO06/estudio-producao-digital/format-text.png";
import formatSlidesUrl from "../../../../assets/games/EF04CO06/estudio-producao-digital/format-slides.png";
import formatVideoUrl from "../../../../assets/games/EF04CO06/estudio-producao-digital/format-video.png";
import stageBarUrl from "../../../../assets/games/EF04CO06/estudio-producao-digital/production-stage-bar.png";

const ASSETS: Array<[string, string]> = [
  ["cover-estudio",         coverUrl],
  ["bg-studio-planning",    bgPlanningUrl],
  ["bg-studio-production",  bgProductionUrl],
  ["bg-studio-review",      bgReviewUrl],
  ["format-text",           formatTextUrl],
  ["format-slides",         formatSlidesUrl],
  ["format-video",          formatVideoUrl],
  ["production-stage-bar",  stageBarUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0x1e0b3e);
    this.add.text(640, 300, "🎬 Estúdio de Produção Digital", {
      fontSize: "40px",
      fontFamily: "Arial Black, Arial",
      color: "#a78bfa",
      stroke: "#7c3aed",
      strokeThickness: 7,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Preparando o estúdio...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#fbbf24",
    }).setOrigin(0.5);
  }
}
