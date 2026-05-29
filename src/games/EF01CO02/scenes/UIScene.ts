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
    // Fundo superior estilizado para o laboratório cyberpunk
    this.add.rectangle(640, 45, 1280, 90, 0x111827, 0.95).setStrokeStyle(3, 0xff9100, 0.6)
    
    // Rótulo Missão
    this.add.text(18, 45, '⚡', { fontSize: '24px' }).setOrigin(0, 0.5)
    this.add.text(52, 45, 'PROJETO ATIVO:', { fontSize: '14px', fontFamily: 'Arial Black', color: '#ff9100' }).setOrigin(0, 0.5)
    
    // Nome do Robô Atual
    this.add.text(190, 45, 'Aguardando Sistema...', { fontSize: '22px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0, 0.5).setName('missionNameText')
    
    // Estrelas de Estágio (Progresso Geral)
    this.levelStars = this.add.text(1080, 45, '☆☆☆', { fontSize: '28px', color: '#ffaa00' }).setOrigin(1, 0.5)
    
    // Botão de Mudo
    this.muteIcon = this.add.text(1220, 45, '🔊', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    this.muteIcon.on('pointerdown', () => this.toggleMute())
  }

  private createBottomBar() {
    // Container inferior de telemetria
    this.add.rectangle(640, 685, 1280, 70, 0x0f172a, 0.9)
    
    // Barra de Progresso Interna da Montagem
    this.add.text(50, 685, 'MONTAGEM:', { fontSize: '14px', fontFamily: 'Arial Black', color: '#00ffff' }).setOrigin(0, 0.5)
    this.add.rectangle(170, 685, 400, 22, 0x1e293b).setOrigin(0, 0.5).setStrokeStyle(2, 0x334155)
    this.add.rectangle(170, 685, 0, 22, 0x00ffcc).setOrigin(0, 0.5).setName('progressBar')

    // Contador de Acertos e Erros de Conexão
    this.add.text(620, 685, '✅ Conexões:', { fontSize: '15px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0, 0.5)
    this.add.text(730, 685, '0', { fontSize: '16px', fontFamily: 'Arial Black', color: '#10b981' }).setOrigin(0, 0.5).setName('hitsText')

    this.add.text(800, 685, '❌ Falhas:', { fontSize: '15px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0, 0.5)
    this.add.text(880, 685, '0', { fontSize: '16px', fontFamily: 'Arial Black', color: '#ef4444' }).setOrigin(0, 0.5).setName('errorsText')

    // Indicador textual de Peças Conectadas (Ex: Peça 1/3)
    this.stepIndicator = this.add.text(1230, 685, 'PEÇA: 0/3', { fontSize: '16px', fontFamily: 'Arial Black', color: '#a5b4fc' }).setOrigin(1, 0.5)
  }

  private registerEventListeners() {
    EventBus.on('level-started', (config: LevelConfig) => {
      this.levelConfig = config
      this.updateMissionName(config.name)
      this.updateLevelStars(config.id)
      this.updateStepIndicator(0, config.steps.length)
      this.updateProgress(0, 0, 0, config.steps.length)
    }, this)

    EventBus.on('game-metrics', (data: { pct: number; hits: number; errors: number; currentStep: number; totalSteps: number }) => {
      this.updateProgress(data.pct, data.hits, data.errors, data.totalSteps)
      this.updateStepIndicator(data.currentStep, data.totalSteps)
    }, this)
  }

  private toggleMute() {
    this.isMuted = !this.isMuted;
    this.sound.mute = this.isMuted;
    this.muteIcon.setText(this.isMuted ? '🔇' : '🔊');
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
      this.stepIndicator.setText(`PEÇA: ${current}/${total}`)
    }
  }

  destroy() {
    EventBus.off('level-started')
    EventBus.off('game-metrics')
  }
}