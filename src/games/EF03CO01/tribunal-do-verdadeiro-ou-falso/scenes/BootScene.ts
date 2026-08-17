import Phaser from 'phaser'

import bgTribunalUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/bg-tribunal.png'
import bgLoadingUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/bg-loading.png'
import characterJudgeUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/character-judge.png'
import characterWitnessUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/character-witness.png'
import cardSentenceUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/card-setence.png'
import hammerUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/hammer.png'
import effectStarUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/effect-star.png'
import effectWrongUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/effect-wrong.png'
import badgeLevelUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/badge-level.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

const ASSETS: Array<[string, string]> = [
  ['bg-tribunal', bgTribunalUrl],
  ['character-judge', characterJudgeUrl],
  ['character-witness', characterWitnessUrl],
  ['card-sentence', cardSentenceUrl],
  ['effect-star', effectStarUrl],
  ['effect-wrong', effectWrongUrl],
  ['badge-level', badgeLevelUrl],
  ['hammer', hammerUrl]
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.image('bg-loading', bgLoadingUrl)
    createLoadingScreen(this, {
      title: 'Tribunal do Verdadeiro ou Falso',
      subtitle: 'Eureka!',
      description: 'Entrando...',
      theme: {
        background: {
          kind: 'stripes',
          base: 0x3a1f1b,
          color: 0xd8b98a,
          alpha: 0.08,
          size: 68,
          
        },

        card: 0x6b3f2a,
        cardShadow: 0x24120f,
        cardHighlight: 0xf7e7c6,
        cardBorder: 0xd5a24c,

        title: 0xfff3da,
        subtitle: 0xd95b4f,
        description: 0xf0d9b5,
        titleStroke: 0x2a1411,

        progressTrack: 0x321b17,
        progressBorder: 0xd5a24c,
        progressFill: 0xa83f35,
        progressHighlight: 0xffe7bd,
      },
    })
    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene')
  }
}
