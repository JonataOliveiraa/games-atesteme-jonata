import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'

interface MissionUpdatePayload {
  instruction: string
  hint: string
  missionIndex: number
  totalMissions: number
  level: number
}

export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private hintText!: Phaser.GameObjects.Text
  private levelStars!: Phaser.GameObjects.Text
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
    EventBus.off('mute-audio', undefined, this)
  }

  private createTopBar() {
    this.add.rectangle(640, 46, 1280, 92, 0x1c100a, 0.94).setDepth(0)
    this.add.rectangle(640, 92, 1280, 3, 0xFFCC80, 0.7).setDepth(2)

    this.instructionText = this.add.text(640, 32, 'Carregando...', {
      fontSize: '29px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFF3E0',
      stroke: '#1c100a',
      strokeThickness: 5,
      wordWrap: { width: 800 },
      align: 'center',
    }).setOrigin(0.5).setDepth(3)

    this.add.rectangle(640, 52, 780, 1, 0xFFCC80, 0.22).setDepth(3)

    this.hintText = this.add.text(640, 70, '', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFE0B2',
      stroke: '#1c100a',
      strokeThickness: 4,
      wordWrap: { width: 680 },
      align: 'center',
    }).setOrigin(0.5).setDepth(3)

    this.add.text(1092, 18, 'Nível', {
      fontSize: '13px', color: '#D7CCC8', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(3)
    this.levelStars = this.add.text(1092, 44, '★☆☆', {
      fontSize: '26px', color: '#FFD700',
    }).setOrigin(0.5).setDepth(3)
  }

  private registerListeners() {
    EventBus.on('mission-update', (data: MissionUpdatePayload) => {
      this.instructionText.setText(data.instruction)
      this.hintText.setText(data.hint)
      this.levelStars.setText('★'.repeat(data.level) + '☆'.repeat(3 - data.level))
      this.updateDots(data.missionIndex, data.totalMissions)
    }, this)
  }

  private updateDots(completedCount: number, total: number) {
    this.missionDots.forEach(d => d.destroy())
    this.missionDots = []

    const dotR = 8
    const gap = 23
    const totalW = total * (dotR * 2) + (total - 1) * (gap - dotR * 2)
    const startX = 1148 - totalW / 2 + dotR

    for (let i = 0; i < total; i++) {
      const dot = this.add.graphics()
      const filled = i < completedCount
      dot.fillStyle(filled ? 0xFFCC80 : 0x5D4037, 1)
      dot.fillCircle(0, 0, dotR)
      if (filled) {
        dot.lineStyle(1.5, 0xFFE0B2)
        dot.strokeCircle(0, 0, dotR)
      }
      dot.setPosition(startX + i * gap, 72)
      dot.setDepth(3)
      this.missionDots.push(dot)
    }
  }
}
