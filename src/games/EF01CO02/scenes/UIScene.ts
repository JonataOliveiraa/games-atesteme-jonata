import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import type { LevelConfig } from '../types'

export class UIScene extends Phaser.Scene {
  private stepIndicator!: Phaser.GameObjects.Text // Mostra "Passo X de Y"
  private levelStars!: Phaser.GameObjects.Text // Mostra o nível

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
    // Rótulo "Missão:"
    this.add.text(18, 45, '🎯', { fontSize: '24px' }).setOrigin(0, 0.5)
    this.add.text(52, 45, 'Missão:', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#7F8C8D' }).setOrigin(0, 0.5)
    // Nome da missão (será atualizado via evento)
    this.add.text(140, 45, '...', { fontSize: '20px', fontFamily: 'Arial Black, Arial', color: '#1A1A2E' }).setOrigin(0, 0.5).setName('missionNameText')

    // Indicador de passo (será atualizado via evento)
    this.stepIndicator = this.add.text(520, 45, 'Passo 1/3', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#2980B9' }).setOrigin(0, 0.5)
    // Estrelas de nível (será atualizado via evento)
    this.levelStars = this.add.text(1060, 58, '★☆☆', { fontSize: '28px', color: '#F1C40F' }).setOrigin(0.5)

    // Botão Mute (reutilizado do EF01CO01)
    this.createMuteButton()
  }

  private createBottomBar() {
    // Similar ao EF01CO01: Acertos, Erros, Progresso, Fase
    const BAR_Y = 680
    this.add.rectangle(640, BAR_Y, 1280, 80, 0xFFF8F0, 0.94).setStrokeStyle(3, 0xDEB887)

    // Acertos
    this.add.text(28, BAR_Y, '✅', { fontSize: '22px' }).setOrigin(0, 0.5)
    this.add.text(58, BAR_Y, '0', { fontSize: '26px', fontFamily: 'Arial Black, Arial', color: '#27AE60' }).setOrigin(0, 0.5).setName('hitsText')
    // Erros
    this.add.text(110, BAR_Y, '✖', { fontSize: '22px', color: '#E74C3C' }).setOrigin(0, 0.5)
    this.add.text(140, BAR_Y, '0', { fontSize: '26px', fontFamily: 'Arial Black, Arial', color: '#E74C3C' }).setOrigin(0, 0.5).setName('errorsText')

    // Progresso
    this.add.text(310, BAR_Y - 16, 'Progresso', { fontSize: '13px', color: '#95A5A6', fontFamily: 'Arial' }).setOrigin(0.5)
    const barX = 310; const barW = 640
    this.add.rectangle(barX, BAR_Y + 4, barW, 22, 0xDFE6E9).setStrokeStyle(1, 0xBDC3C7)
    this.add.rectangle(barX - barW / 2, BAR_Y + 4, 0, 22, 0x2ECC71).setOrigin(0, 0.5).setName('progressBar')

    // Fase
    this.add.text(660, BAR_Y - 16, 'Fase', { fontSize: '13px', color: '#95A5A6', fontFamily: 'Arial' }).setOrigin(0, 0.5)
    this.add.text(660, BAR_Y + 10, '1', { fontSize: '26px', fontFamily: 'Arial Black, Arial', color: '#8E44AD' }).setOrigin(0, 0.5).setName('levelText')
  }

  private createMuteButton() {
    // Reutilizado do EF01CO01
    // (...)
  }

  private registerEventListeners() {
    EventBus.on('scene-ready', (data: { levelConfig: LevelConfig }) => {
      const { levelConfig } = data
      this.updateMissionName(levelConfig.mission.name)
      this.updateLevelStars(levelConfig.level)
      this.updateProgress(0, 0, levelConfig.mission.steps.length) // pct, hits, total_steps
    }, this)

    EventBus.on('update-progress', (data: { pct: number; hits: number; errors: number; currentStep: number; totalSteps: number }) => {
      this.updateProgress(data.pct, data.hits, data.totalSteps)
      this.updateStepIndicator(data.currentStep, data.totalSteps)
    }, this)

    EventBus.on('mute-audio', (muted: boolean) => {
      // Pode atualar o ícone do botão mute aqui se necessário
    }, this)
  }

  private updateMissionName(name: string) {
    const textObj = this.getChildByName('missionNameText') as Phaser.GameObjects.Text
    if (textObj) textObj.setText(name)
  }

  private updateLevelStars(level: number) {
    const filled = level
    this.levelStars.setText('★'.repeat(filled) + '☆'.repeat(3 - filled))
  }

  private updateProgress(pct: number, hits: number, totalSteps: number) {
    const bar = this.getChildByName('progressBar') as Phaser.GameObjects.Rectangle
    const hitsText = this.getChildByName('hitsText') as Phaser.GameObjects.Text
    const errorsText = this.getChildByName('errorsText') as Phaser.GameObjects.Text
    const levelText = this.getChildByName('levelText') as Phaser.GameObjects.Text

    if (bar) bar.setSize(640 * pct, 22)
    if (hitsText) hitsText.setText(hits.toString())
    // errorsText geralmente é atualizado separadamente ou calculado aqui
    if (levelText) levelText.setText(this.levelConfig?.level.toString() ?? '1') // Precisa armazenar levelConfig
  }

  private updateStepIndicator(current: number, total: number) {
    this.stepIndicator.setText(`Passo ${current}/${total}`)
  }

  // Adicione uma variável de classe para armazenar levelConfig se necessário para updateProgress
  private levelConfig?: LevelConfig

  // Atualize o listener scene-ready para armazenar
  // EventBus.on('scene-ready', (data: { levelConfig: LevelConfig }) => {
  //   this.levelConfig = data.levelConfig // Armazena
  //   // ... resto da lógica ...
  // }, this)


  shutdown() {
    EventBus.off('scene-ready', undefined, this)
    EventBus.off('update-progress', undefined, this)
    EventBus.off('mute-audio', undefined, this)
  }
}

