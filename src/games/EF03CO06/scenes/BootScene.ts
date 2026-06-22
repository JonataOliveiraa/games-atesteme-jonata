import Phaser from "phaser";

import successBadgeUrl from "../../../assets/games/EF02CO02/success-badge.png";
import bgInputOutputLabUrl from "../../../assets/games/EF03CO06/bg-input-output-lab.png";
import bgInterfaceCentralUrl from "../../../assets/games/EF03CO06/bg-interface-central.png";
import deviceCameraUrl from "../../../assets/games/EF03CO06/device-camera.png";
import deviceControllerUrl from "../../../assets/games/EF03CO06/device-controller.png";
import deviceKeyboardUrl from "../../../assets/games/EF03CO06/device-keyboard.png";
import deviceMicrophoneUrl from "../../../assets/games/EF03CO06/device-microphone.png";
import deviceMouseUrl from "../../../assets/games/EF03CO06/device-mouse.png";
import hwMonitorUrl from "../../../assets/games/EF02CO04/hw-monitor.png";
import hwPrinterUrl from "../../../assets/games/EF02CO04/hw-printer.png";
import hwSpeakerUrl from "../../../assets/games/EF02CO04/hw-speaker.png";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.createLoadingScreen();
    this.load.image("success-badge", successBadgeUrl);
    this.load.image("bg-interface-central", bgInterfaceCentralUrl);
    this.load.image("bg-input-output-lab", bgInputOutputLabUrl);
    this.load.image("device-camera", deviceCameraUrl);
    this.load.image("device-controller", deviceControllerUrl);
    this.load.image("device-keyboard", deviceKeyboardUrl);
    this.load.image("device-microphone", deviceMicrophoneUrl);
    this.load.image("device-mouse", deviceMouseUrl);
    this.load.image("device-monitor", hwMonitorUrl);
    this.load.image("device-printer", hwPrinterUrl);
    this.load.image("device-speaker", hwSpeakerUrl);
  }

  create() {
    this.scene.start("GameScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0xe0f7ff);
    this.add.text(640, 296, "Central de Entrada e Saída", {
      fontSize: "46px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Ligando os dispositivos...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
    }).setOrigin(0.5);
  }
}
