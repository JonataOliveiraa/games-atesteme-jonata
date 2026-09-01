import Phaser from 'phaser'
import { indiceInicial } from '../../../../shared/level/faseInicial'

import bgCityMapUrl from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/bg-city-map.png'

import locationHouseUrl  from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-house.png'
import locationSchoolUrl from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-school.png'
import locationStreetUrl from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-street.png'
import locationStoreUrl  from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-store.png'
import locationBankUrl  from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-bank.png'

import locationHouseSelectUrl  from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-house-select.png'
import locationSchoolSelectUrl from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-school-select.png'
import locationStreetSelectUrl from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-street-select.png'
import locationStoreSelectUrl  from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-store-select.png'
import locationBankSelectUrl  from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/location-bank-select.png'

import techTvUrl         from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/tech-tv.png'
import techComputerUrl   from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/tech-computer.png'
import techTabletUrl     from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/tech-tablet.png'
import techSmartphoneUrl from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/tech-smartphone.png'
import techRadioUrl      from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/tech-radio.png'
import techCameraUrl     from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/tech-camera.png'
import techGpsUrl        from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/tech-gps.png'
import techAtmUrl        from '../../../../assets/games/EF02CO05/cidade-das-tecnologias/tech-atm.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { preloadLives } from '../../../../shared/hud/createLives'

const ASSETS: Array<[string, string]> = [
  ['bg-city-map', bgCityMapUrl],
  ['location-house',  locationHouseUrl],
  ['location-school', locationSchoolUrl],
  ['location-street', locationStreetUrl],
  ['location-bank',   locationBankUrl],
  ['location-store',  locationStoreUrl],
  ['location-house-select',  locationHouseSelectUrl],
  ['location-school-select', locationSchoolSelectUrl],
  ['location-street-select', locationStreetSelectUrl],
  ['location-bank-select',   locationBankSelectUrl],
  ['location-store-select',  locationStoreSelectUrl],
  ['tech-tv',         techTvUrl],
  ['tech-computer',   techComputerUrl],
  ['tech-tablet',     techTabletUrl],
  ['tech-smartphone', techSmartphoneUrl],
  ['tech-radio',      techRadioUrl],
  ['tech-camera',     techCameraUrl],
  ['tech-gps',        techGpsUrl],
  ['tech-atm',        techAtmUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Cidade das Tecnologias',
      subtitle: 'Mapa da cidade',
      description: 'Montando o mapa da cidade...',
      theme: {
        background: { kind: 'dots', base: 0x0c3b2e, color: 0xa5d6a7, alpha: 0.12, size: 64, radius: 5 },
        card: 0x11543f,
        cardShadow: 0x04211a,
        cardHighlight: 0xffffff,
        cardBorder: 0xa5d6a7,
        title: 0xffffff,
        subtitle: 0xe8f5e9,
        description: 0xa5d6a7,
        titleStroke: 0x04211a,
        progressTrack: 0x04211a,
        progressBorder: 0xa5d6a7,
        progressFill: 0x66bb6a,
        progressHighlight: 0xffffff,
      },
    })
    ASSETS.forEach(([key, url]) => this.load.image(key, url))
      preloadLives(this)
  }

  create() {
    // `levelIndex` e base ZERO (`LEVELS[idx]` direto), entao e
    // `indiceInicial` e nao `faseInicial`: ?stage=2 tem que virar 1.
    this.scene.start('GameScene', { levelIndex: indiceInicial(this, 0) })
  }
}
