import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { LevelConfig, LogicSentence } from '../types'
import { LEVELS } from '../data/sentences'

const GAME_ID = 'tribunal-do-verdadeiro-ou-falso'
const MAX_CONSECUTIVE_ERRORS = 3

type RoundPhase = 'intro' | 'waiting-answer' | 'feedback' | 'level-complete'

export class GameScene extends Phaser.Scene {

  private levelConfig!: LevelConfig
  private currentSentenceIndex = 0
  private hits   = 0
  private errors = 0
  private consecutiveErrors = 0
  private currentPoints = 0
  private currentLives  = 1
  private isMuted = false
  private phase: RoundPhase = 'intro'
  private gameEnded = false
  private shouldShowLevelStart = false
  private missionEffectActive = false

  private sentenceCard?: Phaser.GameObjects.Container
  private sentenceText?: Phaser.GameObjects.Text
  private negationBadge?: Phaser.GameObjects.Container
  private trueBtn?: Phaser.GameObjects.Container
  private falseBtn?: Phaser.GameObjects.Container

  private overlayObjects: Phaser.GameObjects.GameObject[] = []

  private timeBarFill?: Phaser.GameObjects.Graphics
  private timerTween?: Phaser.Tweens.Tween
  private timerState = { progress: 1 }
  private timerActive = false

  private unsubPlatform?: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number; showLevelStart?: boolean }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig          = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.currentSentenceIndex = 0
    this.hits                 = 0
    this.errors               = 0
    this.consecutiveErrors    = 0
    this.currentPoints        = data?.points ?? 0
    this.currentLives         = data?.lives  ?? 1
    this.isMuted              = false
    this.phase                = 'intro'
    this.gameEnded            = false
    this.shouldShowLevelStart = data?.showLevelStart ?? false
    this.missionEffectActive  = false
    this.overlayObjects       = []
    this.timerActive          = false
    this.timerState.progress  = 1
  }

  create() {
    this.drawBackground()
    if (this.levelConfig.perSentenceTimer) this.createTimerBar()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMissionState()
    this.emitCheckpoint()

    this.buildSentenceUI()

    if (this.shouldShowLevelStart && this.levelConfig.level > 1) {
      this.showNextLevelStartScreen()
    } else {
      this.showCurrentSentence()
    }
  }

  update() {}

  shutdown() {
    this.timerActive = false
    this.timerTween?.stop()
    this.clearOverlay()
    EventBus.off('mute-audio', undefined, this)
    this.unsubPlatform?.()
    this.unsubPlatform = undefined
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  OVERLAY MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.overlayObjects.push(obj)
    return obj
  }

  private clearOverlay() {
    this.overlayObjects.forEach(o => o.destroy())
    this.overlayObjects = []
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TIMER (apenas Nível 3 — por sentença)
  // ══════════════════════════════════════════════════════════════════════════

  private createTimerBar() {
    const barX = 390, barY = 106, barW = 500, barH = 24
    const bg = this.add.graphics()
    bg.fillStyle(0xdff2bc, 1)
    bg.fillRoundedRect(barX, barY, barW, barH, 12)
    bg.setDepth(6)
    this.timeBarFill = this.add.graphics()
    this.timeBarFill.setDepth(7)
    this.drawTimeBar(1)
  }

  private drawTimeBar(progress: number) {
    if (!this.timeBarFill) return
    const barX = 390, barY = 106, barW = 500, barH = 24
    this.timeBarFill.clear()
    const color = progress > 0.5 ? 0x7ed321 : progress > 0.25 ? 0xf59e0b : 0xef4444
    this.timeBarFill.fillStyle(color, 1)
    const w = barW * Phaser.Math.Clamp(progress, 0, 1)
    if (w > 0) this.timeBarFill.fillRoundedRect(barX, barY, w, barH, 12)
  }

  private startSentenceTimer() {
    if (!this.levelConfig.perSentenceTimer) return
    this.timerTween?.stop()
    this.timerState.progress = 1
    this.timerActive = true
    this.drawTimeBar(1)

    this.timerTween = this.tweens.add({
      targets:  this.timerState,
      progress: 0,
      duration: this.levelConfig.perSentenceTimer * 1000,
      ease:     'Linear',
      onUpdate: () => this.drawTimeBar(this.timerState.progress),
      onComplete: () => {
        if (!this.timerActive) return
        this.timerActive = false
        this.drawTimeBar(0)
        this.handleAnswer(null)
      },
    })
  }

  private stopSentenceTimer() {
    this.timerActive = false
    this.timerTween?.stop()
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BROADCAST PARA UISCENE
  // ══════════════════════════════════════════════════════════════════════════

  private broadcastMissionState() {
    EventBus.emit('mission-update', {
      instruction: this.levelConfig.title,
      hint: this.levelConfig.tip,
      missionIndex:  this.currentSentenceIndex,
      totalMissions: this.levelConfig.sentences.length,
      level:         this.levelConfig.level,
    })
  }

  private emitCheckpoint() {
    const progress = Math.round((this.currentSentenceIndex / this.levelConfig.sentences.length) * 100)
    runtimeGameBridge.emit({
      type:     'CHECKPOINT',
      gameId:   GAME_ID,
      progress,
      score:    this.currentPoints,
      stage:    this.levelConfig.level,
      hits:     this.hits,
      errors:   this.errors,
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FUNDO
  // ══════════════════════════════════════════════════════════════════════════

  private drawBackground() {
    this.add.image(640, 360, 'bg-tribunal').setDisplaySize(1280, 720).setDepth(-1)
    this.add.image(230, 330, 'character-judge').setDisplaySize(280, 380).setOrigin(0.5).setDepth(1)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CARTÃO DE SENTENÇA E BOTÕES
  // ══════════════════════════════════════════════════════════════════════════

  private buildSentenceUI() {
    this.sentenceCard = this.add.container(720, 300).setDepth(5)

    const card = this.add.image(0, 0, 'card-sentence').setDisplaySize(620, 220).setOrigin(0.5)

    this.sentenceText = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#2a1a0d',
      align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)

    this.sentenceCard.add([card, this.sentenceText])

    this.negationBadge = this.add.container(720, 168).setDepth(6).setAlpha(0)
    const badgeBg = this.add.graphics()
    badgeBg.fillStyle(0xef4444, 0.95)
    badgeBg.fillRoundedRect(-150, -18, 300, 36, 18)
    badgeBg.lineStyle(2, 0xffffff, 0.9)
    badgeBg.strokeRoundedRect(-150, -18, 300, 36, 18)
    const badgeTxt = this.add.text(0, 0, '⚠️ Atenção à palavra NÃO!', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    this.negationBadge.add([badgeBg, badgeTxt])

    this.trueBtn = this.makeAnswerButton(560, 540, 'btn-verdadeiro', true)
    this.falseBtn = this.makeAnswerButton(880, 540, 'btn-falso', false)
  }

  private makeAnswerButton(x: number, y: number, textureKey: string, value: boolean): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y).setDepth(5)
    const img = this.add.image(0, 0, textureKey).setDisplaySize(280, 92).setOrigin(0.5)
    btn.add(img)
    btn.setSize(280, 92)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 90 }))
    btn.on('pointerout',  () => this.tweens.add({ targets: btn, scale: 1, duration: 90 }))
    btn.on('pointerdown', () => this.handleAnswer(value))
    return btn
  }

  private showCurrentSentence() {
    const sentence = this.levelConfig.sentences[this.currentSentenceIndex]
    if (!sentence || !this.sentenceText) return

    this.sentenceText.setText(sentence.text)
    this.negationBadge?.setAlpha(sentence.hasNegation ? 1 : 0)

    this.phase = 'waiting-answer'
    this.trueBtn?.setInteractive({ useHandCursor: true })
    this.falseBtn?.setInteractive({ useHandCursor: true })

    this.broadcastMissionState()

    if (this.levelConfig.perSentenceTimer) this.startSentenceTimer()
  }

  private handleAnswer(value: boolean | null) {
    if (this.gameEnded || this.phase !== 'waiting-answer') return
    this.phase = 'feedback'
    this.stopSentenceTimer()
    this.trueBtn?.disableInteractive()
    this.falseBtn?.disableInteractive()

    const sentence = this.levelConfig.sentences[this.currentSentenceIndex]
    const isCorrect = value !== null && value === sentence.correctValue

    if (isCorrect) {
      this.hits++
      this.consecutiveErrors = 0
      this.playCorrect()
      this.spawnConfetti()
      this.time.delayedCall(1100, () => this.advanceSentence())
    } else {
      this.errors++
      this.consecutiveErrors++
      this.playError()
      this.showExplanation(sentence)
      runtimeGameBridge.emit({
        type: 'WRONG_ANSWER',
        gameId: GAME_ID,
        pointsEarned: -2,
        stage: this.levelConfig.level,
      })
      this.emitCheckpoint()

      if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        this.time.delayedCall(1800, () => this.onTooManyErrors())
      } else {
        this.time.delayedCall(2200, () => this.advanceSentence())
      }
    }
  }

  private spawnConfetti() {
    for (let i = 0; i < 10; i++) {
      const star = this.add.image(720 + Phaser.Math.Between(-60, 60), 300, 'effect-star')
        .setDisplaySize(28, 28).setDepth(8).setAlpha(0.95)
      const targetX = star.x + Phaser.Math.Between(-160, 160)
      const targetY = star.y - Phaser.Math.Between(120, 220)
      this.tweens.add({
        targets: star, x: targetX, y: targetY, alpha: 0, angle: Phaser.Math.Between(-180, 180),
        duration: 700 + i * 30, ease: 'Cubic.Out', onComplete: () => star.destroy(),
      })
    }
  }

  private showExplanation(sentence: LogicSentence) {
    const panel = this.addOverlayObject(this.add.container(720, 470).setDepth(70))
    const bg = this.add.graphics()
    bg.fillStyle(0x2a1a0d, 0.95)
    bg.fillRoundedRect(-300, -60, 600, 120, 18)
    bg.lineStyle(3, 0xFFCC80, 0.9)
    bg.strokeRoundedRect(-300, -60, 600, 120, 18)
    const icon = this.add.image(-250, 0, 'effect-wrong').setDisplaySize(40, 40).setOrigin(0.5)
    const txt = this.add.text(20, 0, sentence.explanation, {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px', color: '#FFF3E0',
      align: 'left', wordWrap: { width: 480 },
    }).setOrigin(0.5).setResolution(2)
    panel.add([bg, icon, txt])
    panel.setAlpha(0).setScale(0.9)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.Out' })

    this.time.delayedCall(2000, () => {
      this.tweens.add({ targets: panel, alpha: 0, duration: 240, onComplete: () => panel.destroy() })
    })
  }

  private advanceSentence() {
    const sentences = this.levelConfig.sentences
    const isLast = this.currentSentenceIndex >= sentences.length - 1

    this.currentSentenceIndex++
    if (this.currentSentenceIndex >= sentences.length || isLast) {
      this.endLevel()
      return
    }
    this.showCurrentSentence()
  }

  private onTooManyErrors() {
    if (this.gameEnded) return
    this.gameEnded = true
    this.stopSentenceTimer()
    this.showGameOverScreen('wrong-answer')
  }

  private endLevel() {
    this.phase = 'level-complete'
    this.gameEnded = true
    this.stopSentenceTimer()
    this.playFanfare()

    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED',
      gameId: GAME_ID,
      stage: this.levelConfig.level,
    })
    this.emitCheckpoint()

    const nextLevel = this.levelConfig.level < 3
      ? (this.levelConfig.level + 1) as 2 | 3
      : null

    this.time.delayedCall(400, () => this.showLevelCompleteTransition(nextLevel))
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TELAS DE FEEDBACK DE NÍVEL (padrão EF02CO01/04/06)
  // ══════════════════════════════════════════════════════════════════════════

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3 | null) {
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450)
    )
    overlay.setInteractive()

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451))
    const lvl = this.levelConfig.level

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 330, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 330, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xff8a2a, 1)
    topBar.fillRoundedRect(-196, -194, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14)

    const title = this.add.text(0, -110, 'Parabéns!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '40px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const completed = this.add.text(0, -50, 'Nível concluído', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#f57c00',
      align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setResolution(2)

    const successTexts: Record<number, string> = {
      1: 'Você julgou corretamente as sentenças simples!',
      2: 'Você aprendeu a prestar atenção na palavra NÃO!',
      3: 'Você julgou rápido e bem mesmo com o tempo correndo!',
    }
    const next = this.add.text(0, 8, successTexts[lvl] ?? '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '17px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const nextLvl = nextLevel ?? (lvl + 1)
    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics()
      dot.fillStyle(
        level <= lvl ? 0x42d640
          : level === nextLvl ? 0xff8a2a
          : 0xd8dde8,
        1
      )
      dot.fillCircle(-28 + index * 28, 72, 8)
      dot.lineStyle(2, 0xffffff, 0.9)
      dot.strokeCircle(-28 + index * 28, 72, 8)
      return dot
    })

    const waitText = this.add.text(0, 116, nextLevel ? 'Preparando o próximo nível...' : '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '15px', color: '#25327a',
    }).setOrigin(0.5).setResolution(2)

    modal.add([shadow, bg, topBar, title, completed, next, ...dots, waitText])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.time.delayedCall(2300, () => {
      if (nextLevel) {
        this.scene.restart({ level: nextLevel, points: this.currentPoints, lives: this.currentLives, showLevelStart: true })
      } else {
        this.showGameCompleteScreen()
      }
    })
  }

  private showNextLevelStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58)
      .setDepth(450).setInteractive()

    const modal = this.add.container(640, 360).setDepth(451)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -154, 540, 312, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -166, 556, 312, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -166, 556, 312, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x42d640, 1)
    topBar.fillRoundedRect(-196, -182, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -182, 392, 28, 14)

    const lvl = this.levelConfig.level
    const title = this.add.text(0, -102, `Nível ${lvl}`, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '38px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const objective = this.add.text(0, -42, this.levelConfig.objective, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '24px', color: '#f57c00',
      align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const detail = this.add.text(0, 12, this.levelConfig.tip, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '16px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setResolution(2)

    const button = this.add.container(0, 104)
    const buttonShadow = this.add.graphics()
    buttonShadow.fillStyle(0x000000, 0.16)
    buttonShadow.fillRoundedRect(-136, -20, 272, 48, 24)
    const buttonBg = this.add.graphics()
    buttonBg.fillStyle(0xf57c00, 1)
    buttonBg.fillRoundedRect(-140, -26, 280, 52, 26)
    buttonBg.lineStyle(4, 0xffffff, 1)
    buttonBg.strokeRoundedRect(-140, -26, 280, 52, 26)
    const buttonText = this.add.text(0, 0, 'Iniciar nível', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '22px', color: '#ffffff',
      stroke: '#9a3f00', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    button.add([buttonShadow, buttonBg, buttonText])

    const buttonHitbox = this.add.zone(640, 360 + 104, 280, 58)
    buttonHitbox.setDepth(452).setInteractive({ useHandCursor: true })
    buttonHitbox.on('pointerover', () => {
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: 'Sine.easeOut' })
    })
    buttonHitbox.on('pointerout', () => {
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: 'Sine.easeOut' })
    })
    buttonHitbox.on('pointerdown', () => {
      this.playTick()
      overlay.destroy()
      buttonHitbox.destroy()
      modal.destroy()
      this.showCurrentSentence()
    })

    modal.add([shadow, bg, topBar, title, objective, detail, button])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private showGameCompleteScreen() {
    this.clearOverlay()
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.62).setDepth(450)
    )
    overlay.setInteractive()

    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451))

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-292, -178, 584, 366, 34)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-304, -190, 608, 370, 34)
    bg.lineStyle(6, 0xffffff, 0.96)
    bg.strokeRoundedRect(-304, -190, 608, 370, 34)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(0x42d640, 1)
    ribbon.fillRoundedRect(-214, -208, 428, 34, 17)
    ribbon.lineStyle(4, 0xffffff, 0.9)
    ribbon.strokeRoundedRect(-214, -208, 428, 34, 17)

    const title = this.add.text(0, -128, 'Jogo concluído!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '38px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -74, 'Você julgou todas as sentenças do tribunal!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '20px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 500 },
    }).setOrigin(0.5).setResolution(2)

    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-190 + index * 190, 54)
      const badge = this.add.graphics()
      badge.fillStyle(index === 0 ? 0xff8a2a : index === 1 ? 0x45c6f0 : 0x42d640, 1)
      badge.fillRoundedRect(-54, -42, 108, 84, 18)
      badge.lineStyle(4, 0xffffff, 0.95)
      badge.strokeRoundedRect(-54, -42, 108, 84, 18)
      const number = this.add.text(0, -13, String(level), {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '30px', color: '#ffffff',
        stroke: '#25327a', strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2)
      const label = this.add.text(0, 23, 'concluído', {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5).setResolution(2)
      item.add([badge, number, label])
      return item
    })

    const createFinalButton = (x: number, label: string, color: number, stroke: string, onClick: () => void) => {
      const button = this.add.container(x, 138)
      const buttonShadow = this.add.graphics()
      buttonShadow.fillStyle(0x000000, 0.16)
      buttonShadow.fillRoundedRect(-128, -20, 256, 48, 24)
      const buttonBg = this.add.graphics()
      buttonBg.fillStyle(color, 1)
      buttonBg.fillRoundedRect(-132, -26, 264, 52, 26)
      buttonBg.lineStyle(4, 0xffffff, 1)
      buttonBg.strokeRoundedRect(-132, -26, 264, 52, 26)
      const buttonText = this.add.text(0, 0, label, {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '20px', color: '#ffffff',
        stroke, strokeThickness: 3,
      }).setOrigin(0.5).setResolution(2)
      button.add([buttonShadow, buttonBg, buttonText])

      const buttonHitbox = this.add.zone(640 + x, 360 + 138, 264, 58)
      buttonHitbox.setDepth(452).setInteractive({ useHandCursor: true })
      buttonHitbox.on('pointerover', () => {
        this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: 'Sine.easeOut' })
      })
      buttonHitbox.on('pointerout', () => {
        this.tweens.add({ targets: button, scale: 1, duration: 90, ease: 'Sine.easeOut' })
      })
      buttonHitbox.on('pointerdown', () => {
        this.playTick()
        onClick()
      })
      return { button, buttonHitbox }
    }

    const playAgain = createFinalButton(-142, 'Jogar novamente', 0x42d640, '#1b7d1c', () => {
      this.scene.restart({ level: 1, points: 0, lives: 1 })
    })
    const exitBtn = createFinalButton(142, 'Voltar aos jogos', 0xf57c00, '#9a3f00', () => {
      EventBus.emit('exit-game')
    })

    const sparkles = Array.from({ length: 14 }, (_, i) => {
      const sp = this.add.graphics()
      const x = Phaser.Math.Between(-278, 278)
      const y = Phaser.Math.Between(-168, 158)
      sp.fillStyle([0x38bdf8, 0xff8a2a, 0x42d640][i % 3], 0.9)
      sp.fillCircle(x, y, Phaser.Math.Between(4, 8))
      this.tweens.add({
        targets: sp, alpha: { from: 0.35, to: 1 }, scale: { from: 0.8, to: 1.35 },
        duration: 520 + i * 30, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })
      return sp
    })

    panel.add([shadow, bg, ribbon, ...sparkles, title, subtitle, ...levelLabels, playAgain.button, exitBtn.button])
    panel.setScale(0.88).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
  }

  private showGameOverScreen(reason: 'timeout' | 'wrong-answer' = 'wrong-answer') {
    this.input.enabled = true
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.60).setDepth(450)
    )
    overlay.setInteractive()

    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451))

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 332, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 332, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xef4444, 1)
    topBar.fillRoundedRect(-196, -194, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14)

    const icon = this.add.text(0, -112, reason === 'timeout' ? '⏱' : '❌', {
      fontSize: '54px',
    }).setOrigin(0.5)

    const title = this.add.text(0, -50, 'Que pena!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '38px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const reasonMsg = reason === 'timeout' ? 'O tempo acabou!' : '3 julgamentos errados seguidos!'
    const reasonTxt = this.add.text(0, 6, reasonMsg, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '20px', color: '#ef4444',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5).setResolution(2)

    const total = this.levelConfig.sentences.length
    const statsTxt = this.add.text(0, 52, `${this.currentSentenceIndex} de ${total} sentenças julgadas`, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '17px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5).setResolution(2)

    const retryBtn = this.createModalButton(-140, 118, '🔄 Tentar novamente', 0x42d640, () => {
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    })
    const exitBtn = this.createModalButton(140, 118, 'Sair', 0xf57c00, () => {
      EventBus.emit('exit-game')
    })

    panel.add([shadow, bg, topBar, icon, title, reasonTxt, statsTxt, retryBtn, exitBtn])
    panel.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.playTone(330, 0.30, 'square', 0.18)
    this.time.delayedCall(100, () => this.playTone(220, 0.40, 'square', 0.16))
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  HELPERS DE MODAL
  // ══════════════════════════════════════════════════════════════════════════

  private createModalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y)
    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-124, -24, 248, 48, 24)
    bg.lineStyle(4, 0xffffff, 1)
    bg.strokeRoundedRect(-124, -24, 248, 48, 24)
    const text = this.add.text(0, 0, label, {
      fontSize: '17px', fontFamily: 'Arial Black, Arial',
      color: '#ffffff', stroke: '#0f172a', strokeThickness: 3,
    }).setOrigin(0.5)
    button.add([bg, text])
    button.setSize(256, 68)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerover', () => this.tweens.add({ targets: button, scale: 1.05, duration: 90 }))
    button.on('pointerout', () => this.tweens.add({ targets: button, scale: 1, duration: 90 }))
    button.on('pointerdown', () => { this.playTick(); onClick() })
    return button
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ÁUDIO SINTÉTICO
  // ══════════════════════════════════════════════════════════════════════════

  private getAudioCtx(): AudioContext | null {
    if (this.isMuted) return null
    try {
      return (this.sound as Phaser.Sound.WebAudioSoundManager).context
    } catch {
      return null
    }
  }

  private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.25) {
    const ctx = this.getAudioCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const g   = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    g.gain.setValueAtTime(gain, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
  }

  private playTick()   { this.playTone(520, 0.04, 'sine', 0.08) }
  private playCorrect() {
    this.playTone(660, 0.08, 'sine', 0.15)
    this.time.delayedCall(100, () => this.playTone(880, 0.08, 'sine', 0.12))
  }
  private playError()  { this.playTone(330, 0.20, 'square', 0.15) }
  private playFanfare() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.time.delayedCall(i * 125, () => this.playTone(f, 0.22, 'sine', 0.32)),
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  PLATFORM BRIDGE
  // ══════════════════════════════════════════════════════════════════════════

  private registerPlatformCommands() {
    this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type === 'START_GAME') {
        this.currentPoints = cmd.points ?? 0
        this.currentLives  = cmd.lives  ?? 1
      }
    })
  }
}
