import Phaser from "phaser";

import coverUrl from "../../../assets/games/EF04CO02/cover-arquivo-registros.png";
import bgArchiveRoomUrl from "../../../assets/games/EF04CO02/bg-archive-room.png";
import bgFilingCabinetUrl from "../../../assets/games/EF04CO02/bg-filing-cabinet.png";
import bgDetectiveDeskUrl from "../../../assets/games/EF04CO02/bg-detective-desk.png";
import recordCardUrl from "../../../assets/games/EF04CO02/record-card.png";
import fieldTagUrl from "../../../assets/games/EF04CO02/field-tag.png";
import filterIconUrl from "../../../assets/games/EF04CO02/filter-icon.png";
import archiveFolderUrl from "../../../assets/games/EF04CO02/archive-folder.png";

const ASSETS: Array<[string, string]> = [
  ["cover",              coverUrl],
  ["bg-archive-room",    bgArchiveRoomUrl],
  ["bg-filing-cabinet",  bgFilingCabinetUrl],
  ["bg-detective-desk",  bgDetectiveDeskUrl],
  ["record-card",        recordCardUrl],
  ["field-tag",          fieldTagUrl],
  ["filter-icon",        filterIconUrl],
  ["archive-folder",     archiveFolderUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0x1c1008);
    this.add.text(640, 296, "Arquivo dos Registros", {
      fontSize: "46px",
      fontFamily: "Arial Black, Arial",
      color: "#fef3c7",
      stroke: "#92400e",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Organizando o arquivo...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#d97706",
    }).setOrigin(0.5);
  }
}
