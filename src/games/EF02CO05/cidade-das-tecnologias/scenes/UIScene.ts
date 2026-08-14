import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'

interface MissionUpdatePayload {
  instruction: string
  hint: string
  missionIndex: number
  totalMissions: number
  level: number
}

export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private hintText!:        Phaser.GameObjects.Text
  private levelStars!:      Phaser.GameObjects.Text
  private missionDots: Phaser.GameObjects.Graphics[] = []

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createTopBar()
    this.registerListeners()

    // Phaser não chama um método `shutdown()` da classe automaticamente — é preciso
    // ligá-lo ao evento real do ciclo de vida, senão o listener abaixo nunca é
    // removido e sobrevive à destruição da cena (ex.: troca de nível recriando o jogo).
    this.events.once('shutdown', this.handleShutdown, this)
  }

  private handleShutdown() {
    EventBus.off('mission-update', this.onMissionUpdate, this)
  }

  private createTopBar() {
    this.add.rectangle(640, 56, 1280, 112, 0x0c3b2e, 0.95)
    this.add.rectangle(640, 112, 1280, 2, 0xA5D6A7, 0.6)

    this.add.text(18, 34, 'Cidade', { fontSize: '26px' }).setOrigin(0, 0.5)

    this.instructionText = this.add.text(640, 34, 'Carregando...', {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: '#E8F5E9',
      stroke: '#0c3b2e',
      strokeThickness: 4,
      wordWrap: { width: 840 },
      align: 'center',
    }).setOrigin(0.5)

    this.add.rectangle(640, 58, 800, 1, 0xA5D6A7, 0.22)

    this.add.text(186, 80, 'Dica', { fontSize: '16px' }).setOrigin(0.5)

    this.hintText = this.add.text(640, 80, '', {
      fontSize: '17px',
      fontFamily: 'Arial, sans-serif',
      color: '#C8E6C9',
      stroke: '#0c3b2e',
      strokeThickness: 3,
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5)

    this.add.text(1095, 22, 'Nível', {
      fontSize: '11px', color: '#A5D6A7', fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.levelStars = this.add.text(1095, 46, 'Nível 1', {
      fontSize: '22px', color: '#FFD700',
    }).setOrigin(0.5)

    this.createMuteButton()
  }

  private createMuteButton() {
    let muted = false

    const btn = this.add.rectangle(1248, 56, 52, 60, 0x07251c, 0.9)
      .setStrokeStyle(1.5, 0xA5D6A7)
      .setInteractive({ useHandCursor: true })

    const icon = this.add.text(1248, 56, 'Som', { fontSize: '22px' }).setOrigin(0.5)

    btn.on('pointerdown', () => {
      muted = !muted
      icon.setText(muted ? 'Mudo' : 'Som')
      EventBus.emit('mute-audio', muted)
    })
    btn.on('pointerover',  () => btn.setFillStyle(0x103b2c))
    btn.on('pointerout',   () => btn.setFillStyle(0x07251c, 0.9))
  }

  private registerListeners() {
    EventBus.on('mission-update', this.onMissionUpdate, this)
  }

  private onMissionUpdate = (data: MissionUpdatePayload) => {
    this.instructionText.setText(data.instruction)
    this.hintText.setText(data.hint)
    this.levelStars.setText(Nível )
    this.updateDots(data.missionIndex, data.totalMissions)
  }

  private updateDots(completedCount: number, total: number) {
    this.missionDots.forEach(d => d.destroy())
    this.missionDots = []

    const dotR   = 7
    const gap    = 20
    const totalW = total * (dotR * 2) + (total - 1) * (gap - dotR * 2)
    const startX = 1148 - totalW / 2 + dotR

    for (let i = 0; i < total; i++) {
      const dot    = this.add.graphics()
      const filled = i < completedCount
      dot.fillStyle(filled ? 0xA5D6A7 : 0x37474F, 1)
      dot.fillCircle(0, 0, dotR)
      if (filled) {
        dot.lineStyle(1.5, 0xC8E6C9)
        dot.strokeCircle(0, 0, dotR)
      }
      dot.setPosition(startX + i * gap, 82)
      this.missionDots.push(dot)
    }
  }
}
