import Phaser from 'phaser'

import bgTribunalUrl     from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/bg-tribunal.png'
import bgLoadingUrl      from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/bg-loading.png'
import characterJudgeUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/character-judge.png'
import characterWitnessUrl from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/character-witness.png'
import cardSentenceUrl   from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/card-setence.png'
import hammerUrl  from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/hammer.png'
import effectStarUrl     from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/effect-star.png'
import effectWrongUrl    from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/effect-wrong.png'
import badgeLevelUrl     from '../../../../assets/games/EF03CO01/tribunal-do-verdadeiro-ou-falso/badge-level.png'

const ASSETS: Array<[string, string]> = [
  ['bg-tribunal',      bgTribunalUrl],
  ['character-judge',   characterJudgeUrl],
  ['character-witness', characterWitnessUrl],
  ['card-sentence',     cardSentenceUrl],
  ['effect-star',       effectStarUrl],
  ['effect-wrong',      effectWrongUrl],
  ['badge-level',       badgeLevelUrl],
  ['hammer', hammerUrl]
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.image('bg-loading', bgLoadingUrl)
    this.createLoadingScreen()
    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene')
  }

  private createLoadingScreen() {
    const fallback = this.add.rectangle(640, 360, 1280, 720, 0x2a1a0d).setDepth(0)

    this.load.once('filecomplete-image-bg-loading', () => {
      fallback.destroy()
      this.add.image(640, 360, 'bg-loading').setDisplaySize(1280, 720).setDepth(0)
    })

    this.add.text(640, 300, '⚖️  Tribunal do Verdadeiro ou Falso', {
      fontSize: '48px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFF3E0',
      stroke: '#000000',
      strokeThickness: 7,
      align: 'center',
      wordWrap: { width: 1000 },
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    this.add.text(640, 396, 'Preparando o julgamento...', {
      fontSize: '29px',
      fontFamily: 'Arial',
      color: '#FFCC80',
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    const barW = 620
    const barBg = this.add.rectangle(640, 466, barW + 10, 28, 0x2a1a0d)
      .setStrokeStyle(3, 0xFFCC80).setDepth(1)
    const bar = this.add.rectangle(640 - barW / 2, 466, 4, 22, 0xFFCC80).setOrigin(0, 0.5).setDepth(1)
    void barBg

    this.load.on('progress', (v: number) => {
      bar.setSize(Math.max(4, barW * v), 22)
    })
  }
}
