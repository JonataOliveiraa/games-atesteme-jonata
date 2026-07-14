import Phaser from "phaser";

import coverUrl from "../../../assets/games/EF04CO07/cover-missao-etica-digital.png";
import bgOfficeUrl from "../../../assets/games/EF04CO07/bg-ethics-office.png";
import bgClassroomUrl from "../../../assets/games/EF04CO07/bg-ethics-classroom.png";
import bgDilemmaUrl from "../../../assets/games/EF04CO07/bg-ethics-dilemma.png";
import filePhotoUrl from "../../../assets/games/EF04CO07/file-photo.png";
import fileDocumentUrl from "../../../assets/games/EF04CO07/file-document.png";
import ethicsBarBgUrl from "../../../assets/games/EF04CO07/ethics-bar-bg.png";
import dataSpreadUrl from "../../../assets/games/EF04CO07/data-spread-effect.png";

const ASSETS: Array<[string, string]> = [
  ["cover-missao-etica", coverUrl],
  ["bg-ethics-office", bgOfficeUrl],
  ["bg-ethics-classroom", bgClassroomUrl],
  ["bg-ethics-dilemma", bgDilemmaUrl],
  ["file-photo", filePhotoUrl],
  ["file-document", fileDocumentUrl],
  ["ethics-bar-bg", ethicsBarBgUrl],
  ["data-spread-effect", dataSpreadUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0x011810);
    this.add
      .text(640, 296, "Missão Ética Digital", {
        fontSize: "44px",
        fontFamily: "Arial Black, Arial",
        color: "#10b981",
        stroke: "#065f46",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.add
      .text(640, 374, "Preparando a missão...", {
        fontSize: "26px",
        fontFamily: "Arial Black, Arial",
        color: "#6ee7b7",
      })
      .setOrigin(0.5);
  }
}
