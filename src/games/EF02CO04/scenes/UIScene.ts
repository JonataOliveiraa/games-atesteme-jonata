import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'

interface MissionUpdatePayload {
  instruction: string
  hint: string
  missionIndex: number
  totalMissions: number
  level: number
}

const BAR_H = 74

export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private missionDots: Phaser.GameObjects.Graphics[] = []

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createTopBar()
    this.registerListeners()
  }

  shutdown() {
    EventBus.off('mission-update', undefined, this)
  }

  private createTopBar() {
    const bar = this.add.graphics().setDepth(0)

    bar.fillStyle(0x0D1B2A, 0.96)
    bar.fillRect(0, 0, 1280, BAR_H)
    bar.fillStyle(0x4FC3F7, 0.85)
    bar.fillRect(0, BAR_H - 3, 1280, 3)

    this.add.text(26, 26, 'MUSEU VIVO', {
      fontSize: '18px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#0D1B2A', strokeThickness: 4,
    }).setOrigin(0, 0.5).setDepth(1).setResolution(2)

    this.levelText = this.add.text(26, 50, 'Nível 1', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#4FC3F7',
    }).setOrigin(0, 0.5).setDepth(1).setResolution(2)

    this.instructionText = this.add.text(640, BAR_H / 2 - 2, 'Carregando...', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#0D1B2A',
      strokeThickness: 5,
      wordWrap: { width: 720 },
      align: 'center',
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    this.createIconButton(1240, BAR_H / 2, '?', () => EventBus.emit('show-tutorial'))
  }

  private createIconButton(x: number, y: number, label: string, onClick: () => void) {
    const s = 46
    const g = this.add.graphics().setDepth(1)

    const paint = (hover: boolean) => {
      g.clear()
      g.fillStyle(hover ? 0x243447 : 0x1A2A3A, 1)
      g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 13)
      g.lineStyle(2, 0x4FC3F7, 0.85)
      g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 13)
    }
    paint(false)

    const icon = this.add.text(x, y, label, {
      fontSize: '22px', fontFamily: 'Arial Black, Arial', color: '#4FC3F7',
    }).setOrigin(0.5).setDepth(2).setResolution(2)

    const zone = this.add.zone(x, y, s + 8, s + 8)
      .setDepth(3).setInteractive({ useHandCursor: true })

    zone.on('pointerover', () => paint(true))
    zone.on('pointerout', () => paint(false))
    zone.on('pointerdown', () => {
      paint(true)
      this.tweens.add({ targets: icon, scale: 0.86, duration: 70, yoyo: true })
      onClick()
    })
    zone.on('pointerup', () => paint(false))
  }

  private registerListeners() {
    EventBus.on('mission-update', (data: MissionUpdatePayload) => {
      this.instructionText.setText(data.instruction)
      this.levelText.setText(`Nível ${data.level}`)
      this.updateDots(data.missionIndex, data.totalMissions)
    }, this)
  }

  private updateDots(completedCount: number, total: number) {
    this.missionDots.forEach(d => d.destroy())
    this.missionDots = []

    const gap = 22
    const startX = 1180 - ((total - 1) * gap) / 2

    for (let i = 0; i < total; i++) {
      const dot = this.add.graphics().setDepth(1)
      const filled = i < completedCount
      const now = i === completedCount

      dot.fillStyle(filled ? 0x4FC3F7 : now ? 0xF9E79F : 0x37474F, 1)
      dot.fillCircle(0, 0, now ? 8 : 6)
      dot.fillStyle(0xFFFFFF, 0.3)
      dot.fillCircle(-2, -2, 2)

      dot.setPosition(startX + i * gap, BAR_H / 2)
      this.missionDots.push(dot)
    }
  }
}