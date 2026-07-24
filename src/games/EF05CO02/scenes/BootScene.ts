import Phaser from 'phaser'
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'

import bgBairroUrl from '../../../assets/games/EF05CO02/bg-bairro.png'
import bgRedeUrl from '../../../assets/games/EF05CO02/bg-rede.png'

import localCasaUrl from '../../../assets/games/EF05CO02/local-casa.png'
import localEscolaUrl from '../../../assets/games/EF05CO02/local-escola.png'
import localMercadoUrl from '../../../assets/games/EF05CO02/local-mercado.png'
import localPracaUrl from '../../../assets/games/EF05CO02/local-praca.png'
import localHospitalUrl from '../../../assets/games/EF05CO02/local-hospital.png'
import localPadariaUrl from '../../../assets/games/EF05CO02/local-padaria.png'
import localBibliotecaUrl from '../../../assets/games/EF05CO02/local-biblioteca.png'
import localSorveteriaUrl from '../../../assets/games/EF05CO02/local-sorveteria.png'

import avatarAnaUrl from '../../../assets/games/EF05CO02/avatar-ana.png'
import avatarBrunoUrl from '../../../assets/games/EF05CO02/avatar-bruno.png'
import avatarCaioUrl from '../../../assets/games/EF05CO02/avatar-caio.png'
import avatarDudaUrl from '../../../assets/games/EF05CO02/avatar-duda.png'
import avatarElisUrl from '../../../assets/games/EF05CO02/avatar-elis.png'
import avatarNicoUrl from '../../../assets/games/EF05CO02/avatar-nico.png'

import marcadorPartidaUrl from '../../../assets/games/EF05CO02/marcador-partida.png'
import marcadorChegadaUrl from '../../../assets/games/EF05CO02/marcador-chegada.png'

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
      title: 'Mapas em Rede',
      subtitle: 'Desenhando as ligações...',
      accent: 0x3b82f6,
      background: 0x0f2547,
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: 1, phase: 0 })
  }
}