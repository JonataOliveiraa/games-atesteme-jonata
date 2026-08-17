import Phaser from "phaser";

import successBadgeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/success-badge.png";
import bgInputOutputLabUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/bg-input-output-lab.png";
import bgInterfaceCentralUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/bg-interface-central.png";
import deviceCameraUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/device-camera.png";
import deviceControllerUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/device-controller.png";
import deviceKeyboardUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/device-keyboard.png";
import deviceMicrophoneUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/device-microphone.png";
import deviceMouseUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/device-mouse.png";
import hwMonitorUrl from "../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-monitor.png";
import hwPrinterUrl from "../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-printer.png";
import hwSpeakerUrl from "../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-speaker.png";
import iconAudioUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/icon-audio.png";
import iconVideoUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/icon-video.png";
import iconPeriferUrl from "../../../../assets/games/EF03CO06/central-de-entrada-e-saida/icon-periferico.png";

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
    this.load.image("icon-audio", iconAudioUrl);
    this.load.image("icon-video", iconVideoUrl);
    this.load.image("icon-periferico", iconPeriferUrl);
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
