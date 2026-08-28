import Phaser from 'phaser'
import { faseInicial } from '../../../../shared/level/faseInicial'

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
import { C } from '../data/theme'

const ASSETS: Array<[string, string]> = [
  ['bg-tribunal', bgTribunalUrl],
  ['character-judge', characterJudgeUrl],
  ['hammer', hammerUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Tribunal do Verdadeiro ou Falso',
      subtitle: 'Eureka!',
      description: 'Entrando na sala...',
      theme: {
        background: {
          kind: 'stripes',
          base: C.ink,
          color: C.brassDark,
          alpha: 0.08,
          size: 68,
        },

        card: C.woodMid,
        cardShadow: C.shadow,
        cardHighlight: C.cream,
        cardBorder: C.brass,

        title: C.cream,
        subtitle: C.amber,
        description: C.brassDim,
        titleStroke: C.ink,

        progressTrack: C.wood,
        progressBorder: C.brass,
        progressFill: C.amber,
        progressHighlight: C.brassDim,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene', { level: faseInicial(this, 1) })
  }
}
