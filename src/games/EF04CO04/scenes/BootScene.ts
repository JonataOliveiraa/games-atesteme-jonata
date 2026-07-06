import Phaser from "phaser";

import coverUrl from "../../../assets/games/EF04CO04/cover-tradutor-da-maquina.png";
import bgCircuitLabUrl from "../../../assets/games/EF04CO04/bg-circuit-lab.png";
import bgEncoderRoomUrl from "../../../assets/games/EF04CO04/bg-encoder-room.png";
import bgDecoderRoomUrl from "../../../assets/games/EF04CO04/bg-decoder-room.png";
import keyboardPanelUrl from "../../../assets/games/EF04CO04/keyboard-panel.png";
import binaryDisplayUrl from "../../../assets/games/EF04CO04/binary-display.png";
import referenceTableUrl from "../../../assets/games/EF04CO04/reference-table.png";
import circuitWireUrl from "../../../assets/games/EF04CO04/circuit-wire.png";

const ASSETS: Array<[string, string]> = [
  ["cover",             coverUrl],
  ["bg-circuit-lab",   bgCircuitLabUrl],
  ["bg-encoder-room",  bgEncoderRoomUrl],
  ["bg-decoder-room",  bgDecoderRoomUrl],
  ["keyboard-panel",   keyboardPanelUrl],
  ["binary-display",   binaryDisplayUrl],
  ["reference-table",  referenceTableUrl],
  ["circuit-wire",     circuitWireUrl],
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
    this.add.rectangle(640, 360, 1280, 720, 0x0d0528);
    this.add.text(640, 296, "Tradutor da Máquina", {
      fontSize: "46px",
      fontFamily: "Arial Black, Arial",
      color: "#06b6d4",
      stroke: "#4c1d95",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Inicializando circuitos...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#84cc16",
    }).setOrigin(0.5);
  }
}
