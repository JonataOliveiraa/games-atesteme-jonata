import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'

interface MissionUpdatePayload {
  instruction: string
  hint: string
  missionIndex: number
  totalMissions: number
  level: number
}

// Barra mais alta e tipografia maior: com Scale.FIT tudo encolhe junto no
// mobile, então o que garante legibilidade é o tamanho em coordenadas de jogo.
const BAR_H = 132
const DOTS_CX = 1110
const DOTS_MAX_W = 170

export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private hintText!:        Phaser.GameObjects.Text
  private levelStars!:      Phaser.GameObjects.Text
  private missionDots: Phaser.GameObjects.Graphics[] = []
  private helpBtn!: Phaser.GameObjects.Container
  private tutorialBusy = false

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    // o Phaser emite 'shutdown' mas não chama um método shutdown() da classe
    this.events.once('shutdown', this.shutdown, this)

    this.createTopBar()
    this.helpBtn = this.createHelpButton()
    this.helpBtn.setVisible(false)
    this.registerListeners()
  }

  shutdown() {
    EventBus.off('mission-update',  undefined,        this)
    EventBus.off('mute-audio',      undefined,        this)
    EventBus.off('tutorial-ready',  this.revealHelp,  this)
    EventBus.off('tutorial-start',  this.lockHelp,    this)
    EventBus.off('tutorial-end',    this.unlockHelp,  this)
  }

  private createTopBar() {
    this.add.rectangle(640, BAR_H / 2, 1280, BAR_H, 0x2a1a0d, 0.95)
    this.add.rectangle(640, BAR_H, 1280, 3, 0xFFCC80, 0.6)

    this.add.text(22, 42, '⚖️', { fontSize: '36px' }).setOrigin(0, 0.5)

    this.instructionText = this.add.text(640, 40, 'Carregando...', {
      fontSize: '31px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFF3E0',
      stroke: '#2a1a0d',
      strokeThickness: 5,
      wordWrap: { width: 740 },
      align: 'center',
    }).setOrigin(0.5).setResolution(2)

    this.add.rectangle(640, 68, 820, 1, 0xFFCC80, 0.22)

    this.add.text(196, 96, '👉', { fontSize: '22px' }).setOrigin(0.5)

    this.hintText = this.add.text(640, 96, '', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFE0B2',
      stroke: '#2a1a0d',
      strokeThickness: 3,
      wordWrap: { width: 740 },
      align: 'center',
    }).setOrigin(0.5).setResolution(2)

    this.add.text(DOTS_CX, 26, 'Nível', {
      fontSize: '15px', color: '#D7CCC8', fontFamily: 'Arial',
    }).setOrigin(0.5).setResolution(2)
    this.levelStars = this.add.text(DOTS_CX, 56, '★☆☆', {
      fontSize: '28px', color: '#FFD700',
    }).setOrigin(0.5).setResolution(2)

    this.createMuteButton()
  }

  private createMuteButton() {
    let muted = false

    const btn = this.add.rectangle(1244, 40, 58, 58, 0x1A120A, 0.9)
      .setStrokeStyle(2, 0xFFCC80)
      .setInteractive({ useHandCursor: true })

    const icon = this.add.text(1244, 40, '🔊', { fontSize: '28px' }).setOrigin(0.5)

    btn.on('pointerdown', () => {
      muted = !muted
      icon.setText(muted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', muted)
    })
    btn.on('pointerover',  () => btn.setFillStyle(0x2a1f14))
    btn.on('pointerout',   () => btn.setFillStyle(0x1A120A, 0.9))
  }

  /** Botão "?" — reexibe o tutorial do nível atual (GameScene escuta o evento). */
  private createHelpButton() {
    const btn = this.add.container(1244, 100)

    const g = this.add.graphics()
    g.fillStyle(0x000000, 0.25)
    g.fillCircle(0, 4, 29)
    g.fillStyle(0xf57c00, 1)
    g.fillCircle(0, 0, 29)
    g.lineStyle(3, 0xffffff, 0.9)
    g.strokeCircle(0, 0, 29)

    const t = this.add.text(0, -1, '?', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)

    btn.add([g, t])
    btn.setSize(64, 64)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerdown', () => {
      if (this.tutorialBusy) return
      this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
      EventBus.emit('show-tutorial')
    })
    return btn
  }

  private registerListeners() {
    EventBus.on('mission-update', (data: MissionUpdatePayload) => {
      this.instructionText.setText(data.instruction)
      this.hintText.setText(data.hint)
      this.levelStars.setText('★'.repeat(data.level) + '☆'.repeat(3 - data.level))
      this.updateDots(data.missionIndex, data.totalMissions)
    }, this)

    EventBus.on('tutorial-ready', this.revealHelp, this)
    EventBus.on('tutorial-start', this.lockHelp,   this)
    EventBus.on('tutorial-end',   this.unlockHelp, this)
  }

  private lockHelp = () => {
    this.tutorialBusy = true
    this.helpBtn.setAlpha(0.45)
    this.helpBtn.disableInteractive()
  }

  private unlockHelp = () => {
    this.tutorialBusy = false
    this.helpBtn.setAlpha(1)
    this.helpBtn.setInteractive({ useHandCursor: true })
  }

  private revealHelp = () => {
    this.helpBtn.setVisible(true)
  }

  private updateDots(completedCount: number, total: number) {
    this.missionDots.forEach(d => d.destroy())
    this.missionDots = []
    if (total <= 0) return

    const dotR = 9
    // o passo encolhe conforme o número de sentenças para não invadir o botão de mudo
    const gap = total > 1 ? Math.min(28, DOTS_MAX_W / (total - 1)) : 0
    const totalW = gap * (total - 1)
    const startX = DOTS_CX - totalW / 2

    for (let i = 0; i < total; i++) {
      const dot    = this.add.graphics()
      const filled = i < completedCount
      dot.fillStyle(filled ? 0xFFCC80 : 0x5D4037, 1)
      dot.fillCircle(0, 0, dotR)
      dot.lineStyle(2, filled ? 0xFFE0B2 : 0x8D6E63, 1)
      dot.strokeCircle(0, 0, dotR)
      dot.setPosition(startX + i * gap, 98)
      this.missionDots.push(dot)
    }
  }
}
