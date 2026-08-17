import Phaser from "phaser";

import successBadgeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/success-badge.png";
import bgCardTableChallengeUrl from "../../../../assets/games/EF05CO01/baralho-das-listas/bg-card-table-challenge.png";
import bgCardTableInsertUrl from "../../../../assets/games/EF05CO01/baralho-das-listas/bg-card-table-insert.png";
import bgCardTableJokerUrl from "../../../../assets/games/EF05CO01/baralho-das-listas/bg-card-table-joker.png";
import cardHeart10Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-10.png";
import cardHeart2Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-2.png";
import cardHeart3Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-3.png";
import cardHeart4Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-4.png";
import cardHeart6Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-6.png";
import cardHeart7Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-7.png";
import cardHeart8Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-8.png";
import cardHeart9Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-9.png";
import cardHeartJUrl from "../../../../assets/games/EF05CO01/baralho-das-listas/card-heart-j.png";
import cardJokerUrl from "../../../../assets/games/EF05CO01/baralho-das-listas/card-joker.png";
import cardSpade2Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-spade-2.png";
import cardSpade4Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-spade-4.png";
import cardSpade6Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-spade-6.png";
import cardSpade8Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-spade-8.png";
import cardSpade9Url from "../../../../assets/games/EF05CO01/baralho-das-listas/card-spade-9.png";
import cardSpadeJUrl from "../../../../assets/games/EF05CO01/baralho-das-listas/card-spade-j.png";
import neighborMarkerUrl from "../../../../assets/games/EF05CO01/baralho-das-listas/neighbor-marker.png";
import slotInsertCardUrl from "../../../../assets/games/EF05CO01/baralho-das-listas/slot-insert-card.png";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.createLoadingScreen();
    this.load.image("success-badge", successBadgeUrl);
    this.load.image("bg-card-table-insert", bgCardTableInsertUrl);
    this.load.image("bg-card-table-joker", bgCardTableJokerUrl);
    this.load.image("bg-card-table-challenge", bgCardTableChallengeUrl);
    this.load.image("card-heart-2", cardHeart2Url);
    this.load.image("card-heart-3", cardHeart3Url);
    this.load.image("card-heart-4", cardHeart4Url);
    this.load.image("card-heart-6", cardHeart6Url);
    this.load.image("card-heart-7", cardHeart7Url);
    this.load.image("card-heart-8", cardHeart8Url);
    this.load.image("card-heart-9", cardHeart9Url);
    this.load.image("card-heart-10", cardHeart10Url);
    this.load.image("card-heart-j", cardHeartJUrl);
    this.load.image("card-joker", cardJokerUrl);
    this.load.image("card-spade-2", cardSpade2Url);
    this.load.image("card-spade-4", cardSpade4Url);
    this.load.image("card-spade-6", cardSpade6Url);
    this.load.image("card-spade-8", cardSpade8Url);
    this.load.image("card-spade-9", cardSpade9Url);
    this.load.image("card-spade-j", cardSpadeJUrl);
    this.load.image("neighbor-marker", neighborMarkerUrl);
    this.load.image("slot-insert-card", slotInsertCardUrl);
  }

  create() {
    this.scene.start("GameScene");
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0xfef3c7);
    this.add.text(640, 296, "Baralho das Listas", {
      fontSize: "46px",
      fontFamily: "Arial Black, Arial",
      color: "#25327a",
      stroke: "#ffffff",
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(640, 374, "Preparando a mesa de cartas...", {
      fontSize: "26px",
      fontFamily: "Arial Black, Arial",
      color: "#334155",
    }).setOrigin(0.5);
  }
}
