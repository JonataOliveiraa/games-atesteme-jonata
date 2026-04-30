import Phaser from "phaser";
import { EventBus } from "../../../shared/EventBus";

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    EventBus.on("mute-audio", this.handleMuteAudio, this);
  }

  shutdown() {
    EventBus.off("mute-audio", this.handleMuteAudio, this);
  }

  private handleMuteAudio = () => {
    // Mantido para seguir o padrão do projeto.
    // Neste jogo, não exibimos HUD de nível, acertos, erros ou progresso.
  };
}