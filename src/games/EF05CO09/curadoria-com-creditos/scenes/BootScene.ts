import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

import bgPortfolioUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/bg-portfolio-editor.png'
import mascoteNormalUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/mascote-curador-normal.png'
import mascoteAlertaUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/mascote-curador-alerta.png'
import thumbPersonagemEspacialUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-personagem-espacial.png'
import thumbPersonagemFlorestaUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-personagem-floresta.png'
import thumbFotoNaturezaUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-foto-natureza.png'
import thumbIlustracaoRoboUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-ilustracao-robo.png'
import thumbMusicaTrilhaUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-musica-trilha.png'
import thumbVideoEscolarUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-video-escolar.png'
import thumbQuadrinhoDigitalUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-quadrinho-digital.png'
import thumbFotoSemAutorUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-foto-sem-autor.png'
import thumbPersonagemFamosoUrl from '../../../../assets/games/EF05CO09/curadoria-com-creditos/thumb-personagem-famoso-alerta.png'

const ASSETS: Array<[string, string]> = [
  ['bg-portfolio', bgPortfolioUrl],
  ['mascote-normal', mascoteNormalUrl],
  ['mascote-alerta', mascoteAlertaUrl],
  ['thumb-personagem-espacial', thumbPersonagemEspacialUrl],
  ['thumb-personagem-floresta', thumbPersonagemFlorestaUrl],
  ['thumb-foto-natureza', thumbFotoNaturezaUrl],
  ['thumb-ilustracao-robo', thumbIlustracaoRoboUrl],
  ['thumb-musica-trilha', thumbMusicaTrilhaUrl],
  ['thumb-video-escolar', thumbVideoEscolarUrl],
  ['thumb-quadrinho-digital', thumbQuadrinhoDigitalUrl],
  ['thumb-foto-sem-autor', thumbFotoSemAutorUrl],
  ['thumb-personagem-famoso-alerta', thumbPersonagemFamosoUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Curadoria com Créditos',
      subtitle: 'Montando o ateliê...',
      description: 'Separando as mídias e as etiquetas de crédito',
      theme: {
        background: { kind: 'stripes', base: 0xeaf2fb, color: 0x2f80ed, alpha: 0.1, size: 26, gap: 62, angle: 'diagonal' },
        card: 0xfdf7e8,
        cardShadow: 0x1c4e8a,
        cardHighlight: 0xffffff,
        cardBorder: 0xb98d5e,
        title: 0x1c4e8a,
        subtitle: 0xb98d5e,
        description: 0x62748a,
        titleStroke: 0xffffff,
        progressTrack: 0xe6dcc2,
        progressBorder: 0xb98d5e,
        progressFill: 0x2fa85c,
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