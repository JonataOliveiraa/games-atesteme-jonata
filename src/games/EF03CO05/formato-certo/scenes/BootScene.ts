import Phaser from "phaser";

import successBadgeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/success-badge.png";
import bgDateFormatUrl from "../../../../assets/games/EF03CO05/formato-certo/bg-date-format.png";
import bgPixelFormatUrl from "../../../../assets/games/EF03CO05/formato-certo/bg-pixel-format.png";
import bgTextFormatUrl from "../../../../assets/games/EF03CO05/formato-certo/bg-text-format.png";
import dataColorBlueUrl from "../../../../assets/games/EF03CO05/formato-certo/data-color-blue.png";
import dataColorRedUrl from "../../../../assets/games/EF03CO05/formato-certo/data-color-red.png";
import dataColorYellowUrl from "../../../../assets/games/EF03CO05/formato-certo/data-color-yellow.png";
import dataDashUrl from "../../../../assets/games/EF03CO05/formato-certo/data-dash.png";
import dataDay18Url from "../../../../assets/games/EF03CO05/formato-certo/data-day-18.png";
import dataLetterAUrl from "../../../../assets/games/EF03CO05/formato-certo/data-letter-a.png";
import dataMonthJuneUrl from "../../../../assets/games/EF03CO05/formato-certo/data-month-june.png";
import dataNumber1Url from "../../../../assets/games/EF03CO05/formato-certo/data-number-1.png";
import dataNumber2Url from "../../../../assets/games/EF03CO05/formato-certo/data-number-2.png";
import dataRoom4Url from "../../../../assets/games/EF03CO05/formato-certo/data-room-4.png";
import dataStarExtraUrl from "../../../../assets/games/EF03CO05/formato-certo/data-star-extra.png";
import dataYear2026Url from "../../../../assets/games/EF03CO05/formato-certo/data-year-2026.png";
import dataStreetSignUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-street-sign.png";
import formatDateBoxUrl from "../../../../assets/games/EF03CO05/formato-certo/format-date-box.png";
import formatPixelGridUrl from "../../../../assets/games/EF03CO05/formato-certo/format-pixel-grid.png";
import formatTextSequenceUrl from "../../../../assets/games/EF03CO05/formato-certo/format-text-sequence.png";

const ASSETS: Array<[string, string]> = [
  ["success-badge", successBadgeUrl],
  ["bg-date-format", bgDateFormatUrl],
  ["bg-pixel-format", bgPixelFormatUrl],
  ["bg-text-format", bgTextFormatUrl],
  ["format-date-box", formatDateBoxUrl],
  ["format-pixel-grid", formatPixelGridUrl],
  ["format-text-sequence", formatTextSequenceUrl],
  ["data-color-blue", dataColorBlueUrl],
  ["data-color-red", dataColorRedUrl],
  ["data-color-yellow", dataColorYellowUrl],
  ["data-dash", dataDashUrl],
  ["data-day-18", dataDay18Url],
  ["data-letter-a", dataLetterAUrl],
  ["data-month-june", dataMonthJuneUrl],
  ["data-number-1", dataNumber1Url],
  ["data-number-2", dataNumber2Url],
  ["data-room-4", dataRoom4Url],
  ["data-star-extra", dataStarExtraUrl],
  ["data-street-sign", dataStreetSignUrl],
  ["data-year-2026", dataYear2026Url],
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
    this.add.rectangle(640, 360, 1280, 720, 0xe0f7ff);
    this.add.text(640, 296, "Formato Certo", {
      fontSize: "52px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Preparando formatos...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
    }).setOrigin(0.5);
  }
}
