import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

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
      // a tela de carregamento é a primeira coisa que a criança vê: se ela
      // continuasse azul-marinho, o jogo mudaria de identidade no meio do
      // caminho
      theme: {
        background: { kind: 'dots', base: C.painel, color: C.madeira, size: 54, radius: 5, alpha: 0.2 },
        card: C.madeiraEscura,
        cardShadow: C.ink,
        cardBorder: C.latao,
        title: C.creme,
        subtitle: C.latao,
        description: C.cremeSoft,
        titleStroke: C.ink,
        progressTrack: C.ink,
        progressBorder: C.latao,
        progressFill: C.madeira,
      },
    })


    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: 1, phase: 0 })
  }
}