import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

import bgBairroUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/bg-bairro.png'
import bgRedeUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/bg-rede.png'

import localCasaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/local-casa.png'
import localEscolaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/local-escola.png'
import localMercadoUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/local-mercado.png'
import localPracaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/local-praca.png'
import localHospitalUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/local-hospital.png'
import localPadariaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/local-padaria.png'
import localBibliotecaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/local-biblioteca.png'
import localSorveteriaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/local-sorveteria.png'

import avatarAnaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/avatar-ana.png'
import avatarBrunoUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/avatar-bruno.png'
import avatarCaioUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/avatar-caio.png'
import avatarDudaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/avatar-duda.png'
import avatarElisUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/avatar-elis.png'
import avatarNicoUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/avatar-nico.png'

import marcadorPartidaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/marcador-partida.png'
import marcadorChegadaUrl from '../../../../assets/games/EF05CO02/mapas-em-rede/marcador-chegada.png'

const ASSETS: Array<[string, string]> = [
  ['bg-bairro', bgBairroUrl],
  ['bg-rede', bgRedeUrl],
  ['local-casa', localCasaUrl],
  ['local-escola', localEscolaUrl],
  ['local-mercado', localMercadoUrl],
  ['local-praca', localPracaUrl],
  ['local-hospital', localHospitalUrl],
  ['local-padaria', localPadariaUrl],
  ['local-biblioteca', localBibliotecaUrl],
  ['local-sorveteria', localSorveteriaUrl],
  ['avatar-ana', avatarAnaUrl],
  ['avatar-bruno', avatarBrunoUrl],
  ['avatar-caio', avatarCaioUrl],
  ['avatar-duda', avatarDudaUrl],
  ['avatar-elis', avatarElisUrl],
  ['avatar-nico', avatarNicoUrl],
  ['marcador-partida', marcadorPartidaUrl],
  ['marcador-chegada', marcadorChegadaUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Mapas em',
      subtitle: 'REDE',
      description: 'Desenhando as ligações...',
      theme: {
        background: { kind: 'dots', base: 0x0f2547, color: 0x3b82f6, size: 54, radius: 5, alpha: 0.18 },
        card: 0x14213d,
        cardShadow: 0x000000,
        cardBorder: 0x3b82f6,
        title: 0xf8fafc,
        subtitle: 0x93c5fd,
        description: 0xcbd5e1,
        titleStroke: 0x0f2547,
        progressTrack: 0x0f2547,
        progressBorder: 0x93c5fd,
        progressFill: 0x3b82f6,
      },
    })


    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: 1, phase: 0 })
  }
}