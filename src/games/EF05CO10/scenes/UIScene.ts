import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { CRITERIA } from '../data/story'
import { C, CRITERION_COLOR, hex } from '../data/theme'
import { SEALS } from '../data/layout'
import type { CriterionId, Score } from '../types'

const W = 1280

interface HudData {
  instruction: string
  sub: string
  level: number
  phase: number
  totalPhases: number
}

export class UIScene extends Phaser.Scene {
  private plate!: Phaser.GameObjects.Graphics
  private instructionText!: Phaser.GameObjects.Text
  private subText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private phaseText!: Phaser.GameObjects.Text

  private sealLayer!: Phaser.GameObjects.Graphics
  private sealIcons!: Phaser.GameObjects.Graphics
  private sealTexts: Phaser.GameObjects.Text[] = []
  private score: Score = { clareza: 0, mudanca: 0, reflexao: 0 }
  private sealsVisible = false

  private helpBtn!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.plate = this.add.graphics()
    this.drawPlate()

    this.levelText = this.add.text(58, 34, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '17px',
      color: hex(C.white),
    }).setOrigin(0, 0.5).setResolution(2)

    this.phaseText = this.add.text(58, 60, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '15px',
      color: hex(C.white),
    }).setOrigin(0, 0.5).setResolution(2)

    this.instructionText = this.add.text(W / 2 - 40, 44, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '27px',
      color: hex(C.violetDark),
      stroke: '#ffffff',
      strokeThickness: 7,
      align: 'center',
      wordWrap: { width: 720 },
    }).setOrigin(0.5).setResolution(2)

    this.subText = this.add.text(W / 2 - 40, 88, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '20px',
      color: hex(C.inkSoft),
      stroke: '#ffffff',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 700 },
    }).setOrigin(0.5).setResolution(2)

    this.sealLayer = this.add.graphics()
    this.sealIcons = this.add.graphics()
    this.buildSeals()

    this.helpBtn = this.buildHelpButton()
    this.helpBtn.setVisible(false)

    this.registry.events.on('setdata-hud', (_p: unknown, d: HudData) => this.applyHud(d))
    this.registry.events.on('changedata-hud', (_p: unknown, d: HudData) => this.applyHud(d))

    EventBus.on('tutorial-ready', this.revealHelp, this)
    EventBus.on('seals-show', this.showSeals, this)
    EventBus.on('seals-hide', this.hideSeals, this)
    EventBus.on('seals-update', this.applyScore, this)

    this.syncFromRegistry()
    this.time.delayedCall(0, () => this.syncFromRegistry())
    EventBus.emit('ui-ready')
  }

  private syncFromRegistry() {
    const hud = this.registry.get('hud') as HudData | undefined
    if (hud) this.applyHud(hud)
  }

  shutdown() {
    this.registry.events.off('setdata-hud')
    this.registry.events.off('changedata-hud')
    EventBus.off('tutorial-ready', this.revealHelp, this)
    EventBus.off('seals-show', this.showSeals, this)
    EventBus.off('seals-hide', this.hideSeals, this)
    EventBus.off('seals-update', this.applyScore, this)
  }

  private drawPlate() {
    const g = this.plate
    g.fillStyle(C.stageEdge, 1)
    g.fillRoundedRect(28, 22, 224, 58, { tl: 14, tr: 24, bl: 14, br: 24 })
    g.fillStyle(C.stage, 1)
    g.fillRoundedRect(28, 16, 224, 58, { tl: 14, tr: 24, bl: 14, br: 24 })
    g.fillStyle(C.white, 0.14)
    g.fillRoundedRect(36, 22, 208, 16, 8)

    g.fillStyle(C.white, 1)
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * 26
      g.fillTriangle(x, 16, x + 22, 16, x + 8, 32)
    }
    g.fillStyle(C.amber, 1)
    g.fillCircle(238, 66, 5)
  }

  private buildSeals() {
    CRITERIA.forEach((def, i) => {
      const x = SEALS.firstX + i * SEALS.gapX
      const t = this.add.text(x + 42, SEALS.y, def.name, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
        color: hex(C.inkSoft),
      }).setOrigin(0, 0.5).setResolution(2).setVisible(false)
      this.sealTexts.push(t)
    })
    this.paintSeals()
  }

  private paintSeals() {
    const g = this.sealLayer
    const icons = this.sealIcons
    g.clear()
    icons.clear()

    if (!this.sealsVisible) {
      this.sealTexts.forEach(t => t.setVisible(false))
      return
    }

    CRITERIA.forEach((def, i) => {
      const x = SEALS.firstX + i * SEALS.gapX
      const value = this.score[def.id]
      const on = value >= 2
      const half = value === 1
      const tone = on ? CRITERION_COLOR[def.id] : half ? C.amber : C.grey

      g.fillStyle(C.shadow, 0.18)
      g.fillCircle(x + 2, SEALS.y + 5, SEALS.r)
      g.fillStyle(on ? tone : C.greySoft, 1)
      g.fillCircle(x, SEALS.y, SEALS.r)
      g.lineStyle(3, tone, 1)
      g.strokeCircle(x, SEALS.y, SEALS.r - 6)
      if (on) {
        g.fillStyle(C.white, 0.28)
        g.fillEllipse(x, SEALS.y - 11, SEALS.r * 1.05, SEALS.r * 0.44)
      }
      for (let k = 0; k < 12; k++) {
        const a = (Math.PI * 2 * k) / 12
        g.fillStyle(on ? tone : C.greySoft, 1)
        g.fillCircle(x + Math.cos(a) * SEALS.r, SEALS.y + Math.sin(a) * SEALS.r, 4)
      }

      this.drawSealIcon(icons, def.id, x, SEALS.y, 15, on ? C.white : tone)

      this.sealTexts[i].setVisible(true)
      this.sealTexts[i].setColor(hex(on ? tone : C.grey))
    })
  }

  private drawSealIcon(g: Phaser.GameObjects.Graphics, id: CriterionId, cx: number, cy: number, s: number, color: number) {
    g.fillStyle(color, 1)
    g.lineStyle(3, color, 1)

    if (id === 'clareza') {
      g.strokeCircle(cx, cy, s * 0.42)
      for (let k = 0; k < 8; k++) {
        const a = (Math.PI * 2 * k) / 8
        g.lineBetween(cx + Math.cos(a) * s * 0.62, cy + Math.sin(a) * s * 0.62, cx + Math.cos(a) * s * 0.92, cy + Math.sin(a) * s * 0.92)
      }
      return
    }

    if (id === 'mudanca') {
      g.lineBetween(cx - s * 0.7, cy - s * 0.3, cx + s * 0.5, cy - s * 0.3)
      g.fillTriangle(cx + s * 0.4, cy - s * 0.66, cx + s * 0.4, cy + s * 0.06, cx + s * 0.9, cy - s * 0.3)
      g.lineBetween(cx + s * 0.7, cy + s * 0.42, cx - s * 0.5, cy + s * 0.42)
      g.fillTriangle(cx - s * 0.4, cy + s * 0.06, cx - s * 0.4, cy + s * 0.78, cx - s * 0.9, cy + s * 0.42)
      return
    }

    g.beginPath()
    g.arc(cx, cy - s * 0.18, s * 0.5, Math.PI * 0.9, Math.PI * 0.1)
    g.strokePath()
    g.fillCircle(cx, cy - s * 0.18, s * 0.34)
    g.fillRoundedRect(cx - s * 0.24, cy + s * 0.3, s * 0.48, s * 0.34, 3)
  }

  private showSeals = () => {
    this.sealsVisible = true
    this.paintSeals()
  }

  private hideSeals = () => {
    this.sealsVisible = false
    this.score = { clareza: 0, mudanca: 0, reflexao: 0 }
    this.paintSeals()
  }

  private applyScore = (score: Score) => {
    this.score = score
    this.sealsVisible = true
    this.paintSeals()
    this.tweens.add({
      targets: this.sealTexts,
      scale: 1.14,
      duration: 130,
      yoyo: true,
      ease: 'Quad.easeOut',
    })
  }

  private buildHelpButton() {
    const btn = this.add.container(1216, 46)
    const g = this.add.graphics()
    g.fillStyle(C.shadow, 0.2)
    g.fillCircle(0, 5, 23)
    g.fillStyle(C.violet, 1)
    g.fillCircle(0, 0, 23)
    g.fillStyle(C.white, 0.24)
    g.fillEllipse(0, -9, 30, 14)
    const t = this.add.text(0, 0, '?', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '25px',
      color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    btn.add([g, t])
    btn.setSize(54, 54)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerdown', () => {
      this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
      EventBus.emit('show-tutorial')
    })
    return btn
  }

  private revealHelp = () => {
    this.helpBtn.setVisible(true)
  }

  private applyHud(data: HudData) {
    this.instructionText.setText(data.instruction)
    this.subText.setText(data.sub)
    this.levelText.setText(`NÍVEL ${data.level}`)
    this.phaseText.setText(`Cena ${data.phase} de ${data.totalPhases}`)
  }
}