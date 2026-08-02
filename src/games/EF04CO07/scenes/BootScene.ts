import Phaser from "phaser";
import bgUrl from "../../../assets/games/EF04CO07/bg-data-center.png";
import cardPhotoUrl from "../../../assets/games/EF04CO07/card-photo.png";
import cardSenhaUrl from "../../../assets/games/EF04CO07/card-senha.png";
import cardEnderecoUrl from "../../../assets/games/EF04CO07/card-endereco.png";
import cardMedicoUrl from "../../../assets/games/EF04CO07/ard-medico.png";
import zoneColetarUrl from "../../../assets/games/EF04CO07/zone-coletar.png";
import zoneDescartarUrl from "../../../assets/games/EF04CO07/zone-descartar.png";
import zoneBloqueadoUrl from "../../../assets/games/EF04CO07/zone-bloqueado.png";

const ASSETS: [string, string][] = [
  ["bg-data-center", bgUrl],
  ["card-photo", cardPhotoUrl],
  ["card-senha", cardSenhaUrl],
  ["card-endereco", cardEnderecoUrl],
  ["ard-medico", cardMedicoUrl],
  ["zone-coletar", zoneColetarUrl],
  ["zone-descartar", zoneDescartarUrl],
  ["zone-bloqueado", zoneBloqueadoUrl],
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.add.graphics().fillStyle(0x0d1b2a, 1).fillRoundedRect(338, 344, 604, 32, 16);
    const bar = this.add.graphics();
    this.add.text(640, 300, "Carregando...", {
      fontSize: "22px", fontFamily: "Arial Black, Arial", color: "#06b6d4",
    }).setOrigin(0.5);

    this.load.on("progress", (v: number) => {
      bar.clear();
      bar.fillStyle(0x06b6d4, 1);
      bar.fillRoundedRect(340, 346, 600 * v, 28, 14);
    });

    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.start("GameScene");
    this.scene.launch("UIScene");
  }
}
