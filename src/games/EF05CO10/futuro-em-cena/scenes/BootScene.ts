import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

import bgStudioUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/bg-story-studio.png'
import mascoteNormalUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/mascote-diretor-normal.png'
import mascoteReacaoUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/mascote-diretor-reacao.png'
import cenarioCasaUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/cenario-casa.png'
import cenarioEscolaUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/cenario-escola.png'
import cenarioTrabalhoUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/cenario-trabalho.png'
import cenarioRuaUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/cenario-rua-cidade.png'
import personagemCriancaUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/personagem-crianca.png'
import personagemAdultoUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/personagem-adulto.png'
import personagemIdosoUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/personagem-idoso.png'
import personagemRoboUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/personagem-robo.png'
import propDroneUrl from '../../../../assets/games/EF05CO10/futuro-em-cena/prop-drone.png'

const ASSETS: Array<[string, string]> = [
  ['bg-studio', bgStudioUrl],
  ['mascote-normal', mascoteNormalUrl],
  ['mascote-reacao', mascoteReacaoUrl],
  ['cenario-casa', cenarioCasaUrl],
  ['cenario-escola', cenarioEscolaUrl],
  ['cenario-trabalho', cenarioTrabalhoUrl],
  ['cenario-rua-cidade', cenarioRuaUrl],
  ['personagem-crianca', personagemCriancaUrl],
  ['personagem-adulto', personagemAdultoUrl],
  ['personagem-idoso', personagemIdosoUrl],
  ['personagem-robo', personagemRoboUrl],
  ['prop-drone', propDroneUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Futuro em Cena',
      subtitle: 'Carregando...',
      description: 'Preparando o estúdio, os personagens e o storyboard',
      theme: {
        background: { kind: 'stripes', base: 0xf1f6ec, color: 0x548036, alpha: 0.12, size: 22, gap: 54, angle: 'diagonal' },
        card: 0xffffff,
        cardShadow: 0x1d2a18,
        cardHighlight: 0xffffff,
        cardBorder: 0xb9cdaa,
        title: 0x355522,
        subtitle: 0x548036,
        description: 0x5f7055,
        titleStroke: 0xffffff,
        progressTrack: 0xe9eee4,
        progressBorder: 0xb9cdaa,
        progressFill: 0x548036,
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