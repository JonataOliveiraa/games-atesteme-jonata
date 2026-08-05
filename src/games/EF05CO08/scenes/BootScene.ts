import Phaser from 'phaser'
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'

import bgFeedUrl from '../../../assets/games/EF05CO08/bg-feed.png'
import mascoteNormalUrl from '../../../assets/games/EF05CO08/mascote-normal.png'
import mascoteReacaoUrl from '../../../assets/games/EF05CO08/mascote-reacao.png'
import thumbAlertaChuvaUrl from '../../../assets/games/EF05CO08/thumb-alerta-chuva.png'
import thumbCampeonatoAntigoUrl from '../../../assets/games/EF05CO08/thumb-campeonato-antigo.png'
import thumbCompeticaoRoboticaUrl from '../../../assets/games/EF05CO08/thumb-competicao-robotica.png'
import thumbCuriosidadeAnimalUrl from '../../../assets/games/EF05CO08/thumb-curiosidade-animal.png'
import thumbEventoEscolarUrl from '../../../assets/games/EF05CO08/thumb-evento-escolar.png'
import thumbFeiraCienciasUrl from '../../../assets/games/EF05CO08/thumb-feira-ciencias.png'
import thumbImagemForaContextoUrl from '../../../assets/games/EF05CO08/thumb-imagem-fora-contexto.png'
import thumbLanchePublicidadeUrl from '../../../assets/games/EF05CO08/thumb-lanche-publicidade.png'
import thumbProdutoMilagrosoUrl from '../../../assets/games/EF05CO08/thumb-produto-milagroso.png'
import thumbRecreioEscolarUrl from '../../../assets/games/EF05CO08/thumb-recreio-escolar.png'

const ASSETS: Array<[string, string]> = [
  ['bg-feed', bgFeedUrl],
  ['mascote-normal', mascoteNormalUrl],
  ['mascote-reacao', mascoteReacaoUrl],
  ['thumb-alerta-chuva', thumbAlertaChuvaUrl],
  ['thumb-campeonato-antigo', thumbCampeonatoAntigoUrl],
  ['thumb-competicao-robotica', thumbCompeticaoRoboticaUrl],
  ['thumb-curiosidade-animal', thumbCuriosidadeAnimalUrl],
  ['thumb-evento-escolar', thumbEventoEscolarUrl],
  ['thumb-feira-ciencias', thumbFeiraCienciasUrl],
  ['thumb-imagem-fora-contexto', thumbImagemForaContextoUrl],
  ['thumb-lanche-publicidade', thumbLanchePublicidadeUrl],
  ['thumb-produto-milagroso', thumbProdutoMilagrosoUrl],
  ['thumb-recreio-escolar', thumbRecreioEscolarUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Radar de Confiabilidade',
      subtitle: 'Ligando o radar...',
      description: 'Separando as notícias para você investigar',
      theme: {
        background: { kind: 'dots', base: 0xeaf2fb, color: 0x2f80ed, alpha: 0.14, size: 64, radius: 6 },
        card: 0xffffff,
        cardShadow: 0x1c4e8a,
        cardHighlight: 0x2f80ed,
        cardBorder: 0x2f80ed,
        title: 0x1c4e8a,
        subtitle: 0x2f80ed,
        description: 0x62748a,
        titleStroke: 0xffffff,
        progressTrack: 0xe3edf8,
        progressBorder: 0x2f80ed,
        progressFill: 0x2f80ed,
        progressHighlight: 0xffffff,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: 1, phase: 0 })
  }
}