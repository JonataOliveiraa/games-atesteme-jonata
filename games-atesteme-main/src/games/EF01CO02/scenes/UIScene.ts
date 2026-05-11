import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import type { LevelConfig } from '../types'

export class UIScene extends Phaser.Scene {
  private stepIndicator!: Phaser.GameObjects.Text
  private levelStars!: Phaser.GameObjects.Text
  private levelConfig?: LevelConfig
  private muteIcon!: Phaser.GameObjects.Text
  private isMuted: boolean = false

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createTopBar()
    this.createBottomBar()
    this.registerEventListeners()
  }

  private createTopBar() {
    // Fundo superior
    this.add.rectangle(640, 45, 1280, 90, 0xFFF8F0, 0.94).setStrokeStyle(3, 0xDEB887)
    
    // Rótulo Missão
    this.add.text(18, 45, '🎯', { fontSize: '24px' }).setOrigin(0, 0.5)
    this.add.text(52, 45, 'Missão:', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#7F8C8D' }).setOrigin(0, 0.5)
    
    // Nome da missão
    this.add.text(140, 45, '...', { fontSize: '20px', fontFamily: 'Arial Black, Arial', color: '#1A1A2E' })
      .setOrigin(0, 0.5)
      .setName('missionNameText')

    // Indicador de passo
    this.stepIndicator = this.add.text(640, 45, 'Carregando...', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#2980B9' }).setOrigin(0.5, 0.5)
    
    // Estrelas
    this.levelStars = this.add.text(1060, 45, '★☆☆', { fontSize: '28px', color: '#F1C40F' }).setOrigin(0.5)

    this.createMuteButton()
  }

  private createBottomBar() {
    const BAR_Y = 680
    this.add.rectangle(640, BAR_Y, 1280, 80, 0xFFF8F0, 0.94).setStrokeStyle(3, 0xDEB887)

    // Acertos
    this.add.text(28, BAR_Y, '✅', { fontSize: '22px' }).setOrigin(0, 0.5)
    this.add.text(58, BAR_Y, '0', { fontSize: '26px', fontFamily: 'Arial Black, Arial', color: '#27AE60' })
      .setOrigin(0, 0.5)
      .setName('hitsText')

    // Erros
    this.add.text(110, BAR_Y, '✖', { fontSize: '22px', color: '#E74C3C' }).setOrigin(0, 0.5)
    this.add.text(140, BAR_Y, '0', { fontSize: '26px', fontFamily: 'Arial Black, Arial', color: '#E74C3C' })
      .setOrigin(0, 0.5)
      .setName('errorsText')

    // Progresso
    this.add.text(640, BAR_Y - 16, 'Progresso', { fontSize: '13px', color: '#95A5A6', fontFamily: 'Arial' }).setOrigin(0.5)
    const barX = 640; const barW = 400
    this.add.rectangle(barX, BAR_Y + 10, barW, 22, 0xDFE6E9).setStrokeStyle(1, 0xBDC3C7)
    this.add.rectangle(barX - barW / 2, BAR_Y + 10, 0, 22, 0x2ECC71).setOrigin(0, 0.5).setName('progressBar')

    // Fase
    this.add.text(1100, BAR_Y - 16, 'Fase', { fontSize: '13px', color: '#95A5A6', fontFamily: 'Arial' }).setOrigin(0.5)
    this.add.text(1100, BAR_Y + 10, '1', { fontSize: '26px', fontFamily: 'Arial Black, Arial', color: '#8E44AD' })
      .setOrigin(0.5)
      .setName('levelText')
  }

  private createMuteButton() {
    const btn = this.add.container(1220, 45).setInteractive(new Phaser.Geom.Circle(0, 0, 30), Phaser.Geom.Circle.Contains)
    const bg = this.add.circle(0, 0, 25, 0xE0E0E0)
    this.muteIcon = this.add.text(0, 0, '🔊', { fontSize: '24px' }).setOrigin(0.5)
    
    btn.add([bg, this.muteIcon])
    
    btn.on('pointerdown', () => {
      this.isMuted = !this.isMuted
      this.muteIcon.setText(this.isMuted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', this.isMuted)
    })
  }

  private registerEventListeners() {
    EventBus.on('scene-ready', (data: { levelConfig: LevelConfig }) => {
      this.levelConfig = data.levelConfig
      this.updateMissionName(this.levelConfig.mission.name)
      this.updateLevelStars(this.levelConfig.level)
      this.updateProgress(0, 0, 0, this.levelConfig.mission.steps.length)
      
      const levelText = this.children.getByName('levelText') as Phaser.GameObjects.Text
      if (levelText) levelText.setText(this.levelConfig.level.toString())
    }, this)

    EventBus.on('update-progress', (data: { pct: number; hits: number; errors: number; currentStep: number; totalSteps: number }) => {
      this.updateProgress(data.pct, data.hits, data.errors, data.totalSteps)
      this.updateStepIndicator(data.currentStep, data.totalSteps)
    }, this)
  }

  private updateMissionName(name: string) {
    const textObj = this.children.getByName('missionNameText') as Phaser.GameObjects.Text
    if (textObj) textObj.setText(name)
  }

  private updateLevelStars(level: number) {
    if (this.levelStars) {
      this.levelStars.setText('★'.repeat(level) + '☆'.repeat(3 - level))
    }
  }

  private updateProgress(pct: number, hits: number, errors: number, totalSteps: number) {
    const bar = this.children.getByName('progressBar') as Phaser.GameObjects.Rectangle
    const hitsText = this.children.getByName('hitsText') as Phaser.GameObjects.Text
    const errorsText = this.children.getByName('errorsText') as Phaser.GameObjects.Text

    if (bar) bar.setSize(400 * pct, 22)
    if (hitsText) hitsText.setText(hits.toString())
    if (errorsText) errorsText.setText(errors.toString())
  }

  private updateStepIndicator(current: number, total: number) {
    if (this.stepIndicator) {
      const displayCurrent = current > total ? total : current
      this.stepIndicator.setText(`Passo ${displayCurrent}/${total}`)
    }
  }

  shutdown() {
    EventBus.off('scene-ready', undefined, this)
    EventBus.off('update-progress', undefined, this)
  }
}