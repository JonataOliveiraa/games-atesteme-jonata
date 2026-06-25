import Phaser from "phaser";

import successBadgeUrl from "../../../assets/games/EF02CO02/success-badge.png";
import bgImageSearchUrl from "../../../assets/games/EF03CO07/bg-image-search.png";
import bgResearchDeskUrl from "../../../assets/games/EF03CO07/bg-research-desk.png";
import bgSearchLabUrl from "../../../assets/games/EF03CO07/bg-search-lab.png";
import filterSitesUrl from "../../../assets/games/EF03CO07/filter-sites.png";
import searchFilterCardUrl from "../../../assets/games/EF03CO07/search-filter-card.png";
import searchMagnifierUrl from "../../../assets/games/EF03CO07/search-magnifier.png";
import searchResultCardUrl from "../../../assets/games/EF03CO07/search-result-card.png";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.createLoadingScreen();
    this.load.image("success-badge", successBadgeUrl);
    this.load.image("bg-search-lab", bgSearchLabUrl);
    this.load.image("bg-image-search", bgImageSearchUrl);
    this.load.image("bg-research-desk", bgResearchDeskUrl);
    this.load.image("filter-sites", filterSitesUrl);
    this.load.image("search-filter-card", searchFilterCardUrl);
    this.load.image("search-magnifier", searchMagnifierUrl);
    this.load.image("search-result-card", searchResultCardUrl);
  }

  create() {
    this.scene.start("GameScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0xe0f7ff);
    this.add.text(640, 296, "Detetives da Busca", {
      fontSize: "46px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Abrindo o navegador seguro...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
    }).setOrigin(0.5);
  }
}
