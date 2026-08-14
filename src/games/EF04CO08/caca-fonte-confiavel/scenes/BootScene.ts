import Phaser from "phaser";

import coverUrl from "../../../../assets/games/EF04CO08/caca-fonte-confiavel/cover-caca-fonte-confiavel.png";
import bgResearchUrl from "../../../../assets/games/EF04CO08/caca-fonte-confiavel/bg-research-desk.png";
import bgComparisonUrl from "../../../../assets/games/EF04CO08/caca-fonte-confiavel/bg-comparison-room.png";
import bgRankingUrl from "../../../../assets/games/EF04CO08/caca-fonte-confiavel/bg-ranking-board.png";
import pageCardBgUrl from "../../../../assets/games/EF04CO08/caca-fonte-confiavel/page-card-bg.png";
import criteriaChecklistUrl from "../../../../assets/games/EF04CO08/caca-fonte-confiavel/criteria-checklist.png";
import trustBadgeGreenUrl from "../../../../assets/games/EF04CO08/caca-fonte-confiavel/trust-badge-green.png";
import trustBadgeRedUrl from "../../../../assets/games/EF04CO08/caca-fonte-confiavel/trust-badge-red.png";

const ASSETS: Array<[string, string]> = [
  ["cover-caca-fonte",    coverUrl],
  ["bg-research-desk",    bgResearchUrl],
  ["bg-comparison-room",  bgComparisonUrl],
  ["bg-ranking-board",    bgRankingUrl],
  ["page-card-bg",        pageCardBgUrl],
  ["criteria-checklist",  criteriaChecklistUrl],
  ["trust-badge-green",   trustBadgeGreenUrl],
  ["trust-badge-red",     trustBadgeRedUrl],
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
    this.scene.launch("UIScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0x0a1628);
    this.add.text(640, 296, "Caça à Fonte Confiável", {
      fontSize: "44px",
      fontFamily: "Arial Black, Arial",
      color: "#fbbf24",
      stroke: "#1e3a8a",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Preparando a pesquisa...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#93c5fd",
    }).setOrigin(0.5);
  }
}
