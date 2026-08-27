import Phaser from 'phaser'

import bgChefBancadaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/bg-chef-bancada.png'
import coverUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/cover-chef-dos-subproblemas.png'

import c1Url from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/c1.png'
import c2Url from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/c2.png'
import c3Url from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/c3.png'
import c4Url from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/c4.png'
import c5Url from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/c5.png'
import c6Url from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/c6.png'
import c7Url from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/c7.png'
import c8Url from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/c8.png'

import missionBreakfastUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icon-missao-cafe-manha.png'
import missionLunchboxUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-missao-lancheira.png'
import missionPicnicUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-missao-piquenique.png'

import iconAguaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-agua.png'
import iconAmpulhetaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-ampulheta.png'
import iconBoloUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-bolo.png'
import iconCafeUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-cafe.png'
import iconCestaVaziaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-cesta-vazia.png'
import iconCopoUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-copo.png'
import iconLancheUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-lanche.png'
import iconSanduicheUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-sanduiche.png'
// Quadros de estado usados nas sequências (ver comentário em ASSETS).
import iconCestaFechadaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-cesta-fechada-com-pano.png'
import iconMassaNaFormaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-massa-na-forma.png'
import iconMesaPostaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-talheres-na-mesa.png'
import iconPanelaFervendoUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-panela-fervendo.png'
import iconPratoComTalherUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-talher-e-prato.png'
import iconGuardanapoUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-guardanapo.png'
import iconIngredientesUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-ingredientes.png'
import iconMacaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-maca.png'
import iconManteigaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-manteiga.png'
import iconPanelaUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-panela.png'
import iconPaoUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-pao.png'
import iconPratoUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-prato.png'
import iconQueijoUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-queijo.png'
import iconSucoUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-suco.png'
import iconTalherUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icone-talher.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

const ASSETS: Array<[string, string]> = [
  ['bg-chef-bancada', bgChefBancadaUrl],
  ['cover-chef-dos-subproblemas', coverUrl],
  ['chef-c1', c1Url],
  ['chef-c2', c2Url],
  ['chef-c3', c3Url],
  ['chef-c4', c4Url],
  ['chef-c5', c5Url],
  ['chef-c6', c6Url],
  ['chef-c7', c7Url],
  ['chef-c8', c8Url],
  ['mission-breakfast', missionBreakfastUrl],
  ['mission-lunchbox', missionLunchboxUrl],
  ['mission-picnic', missionPicnicUrl],
  ['icon-agua', iconAguaUrl],
  ['icon-ampulheta', iconAmpulhetaUrl],
  ['icon-bolo', iconBoloUrl],
  ['icon-cafe', iconCafeUrl],
  ['icon-copo', iconCopoUrl],
  ['icon-guardanapo', iconGuardanapoUrl],
  ['icon-ingredientes', iconIngredientesUrl],
  ['icon-maca', iconMacaUrl],
  ['icon-manteiga', iconManteigaUrl],
  ['icon-panela', iconPanelaUrl],
  ['icon-pao', iconPaoUrl],
  ['icon-prato', iconPratoUrl],
  ['icon-queijo', iconQueijoUrl],
  ['icon-suco', iconSucoUrl],
  ['icon-talher', iconTalherUrl],
  // Ícones de prato (grupo), não de ação: representam o subproblema inteiro.
  ['icon-sanduiche', iconSanduicheUrl],
  ['icon-lanche', iconLancheUrl],
  /*
   * QUADROS DE ESTADO.
   *
   * A etapa de ordenar não usa ícones de objeto: usa o MESMO objeto em
   * momentos diferentes. É o que torna a ordem legível sem texto — ninguém
   * põe a cesta já fechada em primeiro. Cada sequência é
   * "estado inicial → o que se acrescenta → estado final".
   */
  ['icon-prato-com-talher', iconPratoComTalherUrl],
  ['icon-mesa-posta', iconMesaPostaUrl],
  ['icon-panela-fervendo', iconPanelaFervendoUrl],
  ['icon-cesta-fechada', iconCestaFechadaUrl],
  ['icon-massa-na-forma', iconMassaNaFormaUrl],
  // O conteúdo de N2/N3 sempre pediu `icon-cesto`; agora existe o arquivo de
  // verdade e o alias provisório para `icone-ingredientes` pôde sair.
  ['icon-cesto', iconCestaVaziaUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Chef dos Subproblemas',
      subtitle: 'Divida a receita',
      description: 'Preparando a bancada...',
      theme: {
        background: { kind: 'solid', color: 0x050504 },
        card: 0x1a1712,
        cardShadow: 0x000000,
        cardHighlight: 0xf0bc59,
        cardBorder: 0xf0bc59,
        title: 0xf7f6f2,
        subtitle: 0xf0bc59,
        description: 0xf7f6f2,
        titleStroke: 0x050504,
        progressTrack: 0x1a1712,
        progressBorder: 0xf0bc59,
        progressFill: 0xf0bc59,
        progressHighlight: 0xffffff,
      },
    })
    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene')
  }
}
