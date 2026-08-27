import Phaser from "phaser";

import bgAddressDeliveryUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/bg-address-delivery.png";
import bgCharacterProfileUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/bg-character-profile.png";
import bgInvitePartyUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/bg-invite-party.png";
import successBadgeUrl from "../../../../assets/games/EF02CO02/desfile-do-robo-repetidor/success-badge.png";
import dataAgeCakeUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-age-cake.png";
import dataCalendarDayUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-calendar-day.png";
import dataCalendarMonthUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-calendar-month.png";
import dataCalendarYearUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-calendar-year.png";
import dataCityBuildingsUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-city-buildings.png";
import dataColorPaletteUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-color-palette.png";
import dataHouseNumberUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-house-number.png";
import dataNameTagUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-name-tag.png";
import dataNeighborhoodMapUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-neighborhood-map.png";
import dataPetCatUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-pet-cat.png";
import dataStreetSignUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-street-sign.png";
import dataZipEnvelopeUrl from "../../../../assets/games/EF03CO04/montador-de-informacoes/data-zip-envelope.png";
import { createLoadingScreen } from "../../../../shared/loading/createLoadingScreen";

const ASSETS: Array<[string, string]> = [
  ["bg-address-delivery", bgAddressDeliveryUrl],
  ["bg-character-profile", bgCharacterProfileUrl],
  ["bg-invite-party", bgInvitePartyUrl],
  ["success-badge", successBadgeUrl],
  ["data-age-cake", dataAgeCakeUrl],
  ["data-calendar-day", dataCalendarDayUrl],
  ["data-calendar-month", dataCalendarMonthUrl],
  ["data-calendar-year", dataCalendarYearUrl],
  ["data-city-buildings", dataCityBuildingsUrl],
  ["data-color-palette", dataColorPaletteUrl],
  ["data-house-number", dataHouseNumberUrl],
  ["data-name-tag", dataNameTagUrl],
  ["data-neighborhood-map", dataNeighborhoodMapUrl],
  ["data-pet-cat", dataPetCatUrl],
  ["data-street-sign", dataStreetSignUrl],
  ["data-zip-envelope", dataZipEnvelopeUrl],
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    createLoadingScreen(this, {
      title: "Montador de Informações",
      subtitle: "Junte os dados",
      description: "Organizando dados...",
      theme: {
        background: { kind: "grid", base: 0xdff7ff, color: 0x25327a, alpha: 0.1, size: 72 },
        card: 0x25327a,
        cardShadow: 0x141c48,
        cardHighlight: 0xffffff,
        cardBorder: 0x67e8f9,
        title: 0xffffff,
        subtitle: 0xa5f3fc,
        description: 0xe0f7ff,
        titleStroke: 0x141c48,
        progressTrack: 0x141c48,
        progressBorder: 0xffffff,
        progressFill: 0x22d3ee,
        progressHighlight: 0xffffff,
      },
    });
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.start("GameScene");
  }
}
