import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'

export const UI_BAR_H = 72  // exported so GameScene can offset layouts

interface MissionUpdatePayload {
  instruction: string
  hint: string
  missionIndex: number
  totalMissions: number
  level: number
}

export class UIScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text
  private challengeLabel!: Phaser.GameObjects.Text
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
    const MID = UI_BAR_H / 2  // 36

    // Background + border
    this.add.rectangle(640, MID, 1280, UI_BAR_H, 0x0d1b2a, 0.97)
    this.add.rectangle(640, UI_BAR_H, 1280, 2, 0x4fc3f7, 0.55)

    // Left: game identity
    this.add.text(20, MID, '🤖', { fontSize: '24px' }).setOrigin(0, 0.5)
    this.add.text(54, MID, 'Laço ENQUANTO', {
      fontSize: '19px',
      fontFamily: 'Arial Black, Arial',
      color: '#e0f2fe',
      stroke: '#0d1b2a',
      strokeThickness: 4,
    }).setOrigin(0, 0.5)

    // Center: challenge label (updated dynamically)
    this.challengeLabel = this.add.text(640, MID + 10, '', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial',
      color: '#64748b',
    }).setOrigin(0.5)

    // Right: level indicator
    this.levelText = this.add.text(1055, MID, 'Nível 1/3', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial',
      color: '#94a3b8',
    }).setOrigin(0.5)

    this.createHelpButton(MID)
    this.createMuteButton(MID)
  }

  private createHelpButton(mid: number) {
    const x = 1188
    const btn = this.add.rectangle(x, mid, 52, UI_BAR_H - 10, 0x1e3a5f, 0.92)
      .setStrokeStyle(1.5, 0x4fc3f7)
      .setInteractive({ useHandCursor: true })
    this.add.text(x, mid, '?', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color: '#e0f2fe',
      stroke: '#0d1b2a',
      strokeThickness: 3,
    }).setOrigin(0.5)
    btn.on('pointerdown', () => EventBus.emit('show-tutorial'))
    btn.on('pointerover',  () => btn.setFillStyle(0x243447, 0.95))
    btn.on('pointerout',   () => btn.setFillStyle(0x1e3a5f, 0.92))
  }

  private createMuteButton(mid: number) {
    let muted = false
    const btn = this.add.rectangle(1248, mid, 52, UI_BAR_H - 10, 0x1a2a3a, 0.90)
      .setStrokeStyle(1.5, 0x4fc3f7)
      .setInteractive({ useHandCursor: true })
    const icon = this.add.text(1248, mid, '🔊', { fontSize: '22px' }).setOrigin(0.5)
    btn.on('pointerdown', () => {
      muted = !muted
      icon.setText(muted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', muted)
    })
    btn.on('pointerover', () => btn.setFillStyle(0x243447))
    btn.on('pointerout',  () => btn.setFillStyle(0x1a2a3a, 0.90))
  }

  private registerListeners() {
    EventBus.on('mission-update', (data: MissionUpdatePayload) => {
      this.levelText.setText(`Nível ${data.level}/3`)
      this.challengeLabel.setText(`Desafio ${data.missionIndex + 1}/${data.totalMissions}`)
      this.updateDots(data.missionIndex, data.totalMissions)
    }, this)
  }

  private updateDots(completedCount: number, total: number) {
    this.missionDots.forEach(d => d.destroy())
    this.missionDots = []

    const dotR = 9, gap = 28
    const totalW = total * dotR * 2 + (total - 1) * (gap - dotR * 2)
    const startX = 640 - totalW / 2 + dotR

    for (let i = 0; i < total; i++) {
      const dot = this.add.graphics()
      const done = i < completedCount
      dot.fillStyle(done ? 0x4fc3f7 : 0x1e3a5f, 1)
      dot.fillCircle(0, 0, dotR)
      dot.lineStyle(2, done ? 0x38bdf8 : 0x334155, 1)
      dot.strokeCircle(0, 0, dotR)
      dot.setPosition(startX + i * gap, 22)
      this.missionDots.push(dot)
    }
  }
}
