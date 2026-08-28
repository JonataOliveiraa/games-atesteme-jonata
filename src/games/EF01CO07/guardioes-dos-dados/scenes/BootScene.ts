import * as Phaser from "phaser";
import { faseInicial } from "../../../../shared/level/faseInicial";

import bgMainUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/bg-main.png";
import guardianCharacterUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/guardian-character.png";
import iconAlertUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/icon-alert.png";
import iconCheckUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/icon-check.png";
import iconLockUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/icon-lock.png";
import iconShieldUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/icon-shield.png";
import sceneAppPermissionsUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-app-permissions.png";
import sceneAppRegisterUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-app-register.png";
import sceneFullNameUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-full-name.png";
import sceneGameChatUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-game-chat.png";
import sceneLocationUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-location.png";
import sceneOnlineStrangerUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-online-stranger.png";
import scenePasswordGameUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-password-game.png";
import sceneSchoolPhotoUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-school-photo.png";
import sceneStrangeLinkUrl from "../../../../assets/games/EF01CO07/guardioes-dos-dados/scene-strange-link.png";
import { createLoadingScreen } from "../../../../shared/loading/createLoadingScreen";

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
    createLoadingScreen(this, {
      title: "Guardiões dos Dados",
      subtitle: "Proteja seus dados",
      description: "Preparando missões de segurança...",
      theme: {
        background: { kind: "grid", base: 0xeff6ff, color: 0x1d4ed8, alpha: 0.1, size: 72 },
        card: 0x1d4ed8,
        cardShadow: 0x0f2a6b,
        cardHighlight: 0xffffff,
        cardBorder: 0x93c5fd,
        title: 0xffffff,
        subtitle: 0xbfdbfe,
        description: 0xe0edff,
        titleStroke: 0x0f2a6b,
        progressTrack: 0x0f2a6b,
        progressBorder: 0xffffff,
        progressFill: 0x60a5fa,
        progressHighlight: 0xffffff,
      },
    });
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.launch("UIScene");
    this.scene.start("GameScene", { level: faseInicial(this, 1) });
  }
}
