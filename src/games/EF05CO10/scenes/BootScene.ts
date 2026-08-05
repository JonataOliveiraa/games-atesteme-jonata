import Phaser from 'phaser'
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'

import bgStudioUrl from '../../../assets/games/EF05CO10/bg-story-studio.png'
import mascoteNormalUrl from '../../../assets/games/EF05CO10/mascote-diretor-normal.png'
import mascoteReacaoUrl from '../../../assets/games/EF05CO10/mascote-diretor-reacao.png'
import cenarioCasaUrl from '../../../assets/games/EF05CO10/cenario-casa.png'
import cenarioEscolaUrl from '../../../assets/games/EF05CO10/cenario-escola.png'
import cenarioTrabalhoUrl from '../../../assets/games/EF05CO10/cenario-trabalho.png'
import cenarioRuaUrl from '../../../assets/games/EF05CO10/cenario-rua-cidade.png'
import personagemCriancaUrl from '../../../assets/games/EF05CO10/personagem-crianca.png'
import personagemAdultoUrl from '../../../assets/games/EF05CO10/personagem-adulto.png'
import personagemIdosoUrl from '../../../assets/games/EF05CO10/personagem-idoso.png'
import personagemRoboUrl from '../../../assets/games/EF05CO10/personagem-robo.png'
import propDroneUrl from '../../../assets/games/EF05CO10/prop-drone.png'

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
        background: { kind: 'stripes', base: 0xf0edfa, color: 0x6b4fd8, alpha: 0.1, size: 24, gap: 58, angle: 'diagonal' },
        card: 0xffffff,
        cardShadow: 0x241f3a,
        cardHighlight: 0xffffff,
        cardBorder: 0xd6cfee,
        title: 0x3d2a86,
        subtitle: 0x6b4fd8,
        description: 0x6b6486,
        titleStroke: 0xffffff,
        progressTrack: 0xeeecf5,
        progressBorder: 0xd6cfee,
        progressFill: 0xf0a12b,
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