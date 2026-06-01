import * as Phaser from "phaser";

import bgMainUrl from "../../../assets/games/EF01CO07/bg-main.png";
import guardianCharacterUrl from "../../../assets/games/EF01CO07/guardian-character.png";
import iconAlertUrl from "../../../assets/games/EF01CO07/icon-alert.png";
import iconCheckUrl from "../../../assets/games/EF01CO07/icon-check.png";
import iconLockUrl from "../../../assets/games/EF01CO07/icon-lock.png";
import iconShieldUrl from "../../../assets/games/EF01CO07/icon-shield.png";
import sceneAppPermissionsUrl from "../../../assets/games/EF01CO07/scene-app-permissions.png";
import sceneAppRegisterUrl from "../../../assets/games/EF01CO07/scene-app-register.png";
import sceneFullNameUrl from "../../../assets/games/EF01CO07/scene-full-name.png";
import sceneGameChatUrl from "../../../assets/games/EF01CO07/scene-game-chat.png";
import sceneLocationUrl from "../../../assets/games/EF01CO07/scene-location.png";
import sceneOnlineStrangerUrl from "../../../assets/games/EF01CO07/scene-online-stranger.png";
import scenePasswordGameUrl from "../../../assets/games/EF01CO07/scene-password-game.png";
import sceneSchoolPhotoUrl from "../../../assets/games/EF01CO07/scene-school-photo.png";
import sceneStrangeLinkUrl from "../../../assets/games/EF01CO07/scene-strange-link.png";

const ASSETS: Array<[string, string]> = [
  ["guardians-bg-main", bgMainUrl],
  ["guardians-character", guardianCharacterUrl],
  ["guardians-icon-alert", iconAlertUrl],
  ["guardians-icon-check", iconCheckUrl],
  ["guardians-icon-lock", iconLockUrl],
  ["guardians-icon-shield", iconShieldUrl],
  ["guardians-scene-senha-jogo", scenePasswordGameUrl],
  ["guardians-scene-nome-completo", sceneFullNameUrl],
  ["guardians-scene-link-estranho", sceneStrangeLinkUrl],
  ["guardians-scene-foto-escola", sceneSchoolPhotoUrl],
  ["guardians-scene-cadastro-app", sceneAppRegisterUrl],
  ["guardians-scene-localizacao", sceneLocationUrl],
  ["guardians-scene-desconhecido-online", sceneOnlineStrangerUrl],
  ["guardians-scene-permissoes-app", sceneAppPermissionsUrl],
  ["guardians-scene-jogo-com-chat", sceneGameChatUrl],
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
    this.scene.launch("UIScene");
    this.scene.start("GameScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0xeff6ff);

    this.add
      .text(640, 300, "Guardiões dos Dados", {
        fontSize: "54px",
        fontFamily: "Arial Black, Arial",
        color: "#1d4ed8",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(640, 380, "Preparando missões de segurança...", {
        fontSize: "28px",
        fontFamily: "Arial",
        color: "#334155",
      })
      .setOrigin(0.5);
  }
}
