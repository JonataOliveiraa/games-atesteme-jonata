import Phaser from "phaser";

import coverUrl from "../../../../assets/games/EF03CO09/investigacao-dados-risco/cover-investigacao-dados-risco.png";
import bgInvestigationUrl from "../../../../assets/games/EF03CO09/investigacao-dados-risco/bg-investigation.png";
import bgCrimeSceneUrl from "../../../../assets/games/EF03CO09/investigacao-dados-risco/bg-crime-scene.png";
import bgEvidenceBoardUrl from "../../../../assets/games/EF03CO09/investigacao-dados-risco/bg-evidence-board.png";
import safetyShieldUrl from "../../../../assets/games/EF03CO09/investigacao-dados-risco/safety-shield.png";
import dangerSignUrl from "../../../../assets/games/EF03CO09/investigacao-dados-risco/danger-sign.png";
import evidenceCardUrl from "../../../../assets/games/EF03CO09/investigacao-dados-risco/evidence-card.png";
import consequenceCardUrl from "../../../../assets/games/EF03CO09/investigacao-dados-risco/consequence-card.png";

const ASSETS: Array<[string, string]> = [
  ["cover", coverUrl],
  ["bg-investigation", bgInvestigationUrl],
  ["bg-crime-scene", bgCrimeSceneUrl],
  ["bg-evidence-board", bgEvidenceBoardUrl],
  ["safety-shield", safetyShieldUrl],
  ["danger-sign", dangerSignUrl],
  ["evidence-card", evidenceCardUrl],
  ["consequence-card", consequenceCardUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0x1a0505);
    this.add
      .text(640, 296, "🔍 Investigação: Dados em Risco", {
        fontSize: "42px",
        fontFamily: "Arial Black, Arial",
        color: "#f59e0b",
        stroke: "#1a0505",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.add
      .text(640, 374, "Preparando a investigação...", {
        fontSize: "26px",
        fontFamily: "Arial Black, Arial",
        color: "#e2e8f0",
      })
      .setOrigin(0.5);
  }
}
