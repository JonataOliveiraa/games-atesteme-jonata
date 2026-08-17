import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { C, CSS } from '../data/theme'
import { UI_BAR_H, W } from '../data/layout'

export interface MissionUpdatePayload {
  level: number
  challengeIndex: number
  totalChallenges: number
  instruction: string
}

export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private dotsG!: Phaser.GameObjects.Graphics
  private total = 4
  private current = 0

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.buildBar()
    this.registerListeners()

    this.events.once('shutdown', () => {
      EventBus.off('mission-update', undefined, this)
    })
  }

  private buildBar() {
    const mid = UI_BAR_H / 2

    const bar = this.add.graphics().setDepth(0)
    bar.fillStyle(C.borda, 0.5)
    bar.fillRect(0, UI_BAR_H, W, 8)
    bar.fillStyle(C.escuro, 1)
    bar.fillRect(0, 0, W, UI_BAR_H)
    bar.fillStyle(C.normal, 0.5)
    bar.fillRect(0, 0, W, 7)
    bar.fillStyle(C.amarelo, 0.9)
    bar.fillRect(0, UI_BAR_H - 4, W, 4)

    this.add.image(40, mid, 'personagem', 5)
      .setDisplaySize(48, 48)
      .setDepth(1)

    this.add.text(74, mid, 'Cidade das Decisões', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '23px',
      color: CSS.creme,
      stroke: CSS.borda,
      strokeThickness: 5,
    }).setOrigin(0, 0.5).setDepth(1).setResolution(2)

    this.instructionText = this.add.text(W / 2, mid, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: CSS.amarelo,
      stroke: CSS.borda,
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: 560 },
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    this.levelText = this.add.text(1108, mid - 13, 'Nível 1 de 3', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '17px',
      color: CSS.claro,
      stroke: CSS.borda,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    this.dotsG = this.add.graphics().setDepth(1)
    this.paintDots()

    this.buildIconButton(1240, mid, '?', () => EventBus.emit('show-tutorial'))
  }

  private paintDots() {
    const g = this.dotsG
    const y = UI_BAR_H / 2 + 16
    const gap = 24
    const startX = 1108 - ((this.total - 1) * gap) / 2

    g.clear()
    for (let i = 0; i < this.total; i++) {
      const x = startX + i * gap
      const done = i < this.current
      const now = i === this.current

      g.fillStyle(C.borda, 0.55)
      g.fillCircle(x, y + 2, now ? 9 : 7)
      g.fillStyle(now ? C.amarelo : done ? C.verde : C.apagado, 1)
      g.fillCircle(x, y, now ? 8 : 6)
      g.fillStyle(0xffffff, 0.45)
      g.fillCircle(x - 2, y - 2, now ? 3 : 2)
    }
  }

  private buildIconButton(x: number, y: number, label: string, onClick: () => void) {
    const s = 48
    const g = this.add.graphics().setDepth(1)

    const paint = (press: boolean) => {
      g.clear()
      g.fillStyle(C.borda, 0.6)
      g.fillRoundedRect(x - s / 2, y - s / 2 + 5, s, s, 15)
      g.fillStyle(press ? C.claro : C.normal, 1)
      g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 15)
      g.fillStyle(0xffffff, 0.22)
      g.fillRoundedRect(x - s / 2 + 5, y - s / 2 + 4, s - 10, s * 0.34, 9)
      g.lineStyle(3, C.creme, 0.9)
      g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 15)
    }
    paint(false)

    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '26px',
      color: CSS.creme,
      stroke: CSS.borda,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(2).setResolution(2)

    const zone = this.add.zone(x, y, s + 8, s + 8)
      .setDepth(3)
      .setInteractive({ useHandCursor: true })

    zone.on('pointerover', () => paint(true))
    zone.on('pointerout', () => paint(false))
    zone.on('pointerdown', () => {
      paint(true)
      this.tweens.add({ targets: text, scale: 0.88, duration: 70, yoyo: true })
      onClick()
    })
    zone.on('pointerup', () => paint(false))
  }

  private registerListeners() {
    EventBus.on('mission-update', (data: MissionUpdatePayload) => {
      this.instructionText.setText(data.instruction)
      this.levelText.setText(`Nível ${data.level} de 3`)
      this.total = data.totalChallenges
      this.current = data.challengeIndex
      this.paintDots()
    }, this)
  }
}