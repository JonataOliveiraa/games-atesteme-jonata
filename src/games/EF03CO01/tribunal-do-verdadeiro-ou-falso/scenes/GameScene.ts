import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import type { LevelConfig, LogicSentence } from '../types'
import { LEVELS } from '../data/sentences'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import type { TutorialStep } from '../../../../shared/tutorial/createTutorial'

const GAME_ID = 'tribunal-do-verdadeiro-ou-falso'
const MAX_CONSECUTIVE_ERRORS = 3

// ══════════════════════════════════════════════════════════════════════════
//  LAYOUT — base 1280×720 com escala ampliada para leitura em telas pequenas.
//  O canvas usa Scale.FIT, então tudo aqui encolhe junto no mobile: quanto
//  maior a fonte/alvo em coordenadas de jogo, mais legível e tocável fica.
// ══════════════════════════════════════════════════════════════════════════
const TOP_BAR_H = 132          // altura da barra da UIScene (espaço reservado)

const CARD_CX = 740
const CARD_CY = 368
const CARD_W = 720

const BTN_Y = 600
const BTN_W = 344
const BTN_H = 150
const BTN_DX = 186             // deslocamento horizontal a partir de CARD_CX

const TIMER_BAR = { x: 420, y: 146, w: 640, h: 28 }

type RoundPhase = 'intro' | 'waiting-answer' | 'feedback' | 'level-complete'

export class GameScene extends Phaser.Scene {

  private levelConfig!: LevelConfig
  private currentSentenceIndex = 0
  private hits = 0
  private errors = 0
  private consecutiveErrors = 0
  private currentPoints = 0
  private currentLives = 1
  private isMuted = false
  private phase: RoundPhase = 'intro'
  private gameEnded = false
  private shouldShowLevelStart = false
  private missionEffectActive = false

  private sourceText?: Phaser.GameObjects.Text
  private cardShadow?: Phaser.GameObjects.Graphics
  private cardBg?: Phaser.GameObjects.Graphics
  private gavel?: Phaser.GameObjects.Image

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

  private tutorialSteps: TutorialStep[] = []
  private tutorialKey = ''

  private unsubPlatform?: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number; showLevelStart?: boolean }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.currentSentenceIndex = 0
    this.hits = 0
    this.errors = 0
    this.consecutiveErrors = 0
    this.currentPoints = data?.points ?? 0
    this.currentLives = data?.lives ?? 1
    this.isMuted = false
    this.phase = 'intro'
    this.gameEnded = false
    this.shouldShowLevelStart = data?.showLevelStart ?? false
    this.missionEffectActive = false
    this.overlayObjects = []
    this.timerActive = false
    this.timerState.progress = 1
  }

  create() {
    // O Phaser emite o evento 'shutdown', mas nunca chama um método shutdown()
    // da classe — sem este bind os listeners do EventBus se acumulariam a cada
    // scene.restart() feito na troca de nível.
    this.events.once('shutdown', this.shutdown, this)

    this.drawBackground()
    if (this.levelConfig.perSentenceTimer) this.createTimerBar()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)
    EventBus.on('show-tutorial', this.replayTutorial, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMissionState()
    this.emitCheckpoint()

    this.buildSentenceUI()

    this.tutorialSteps = this.buildTutorialSteps()
    this.tutorialKey = `ef03co01-l${this.levelConfig.level}`
    EventBus.emit('tutorial-ready')

    if (this.shouldShowLevelStart && this.levelConfig.level > 1) {
      this.showNextLevelStartScreen()
    } else {
      this.startLevelFlow()
    }
  }

  update() { }

  shutdown() {
    this.timerActive = false
    this.timerTween?.stop()
    this.clearOverlay()
    EventBus.off('mute-audio', undefined, this)
    EventBus.off('show-tutorial', this.replayTutorial, this)
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
    const { x, y, w, h } = TIMER_BAR
    const bg = this.add.graphics()
    bg.fillStyle(0x2a1a0d, 0.9)
    bg.fillRoundedRect(x - 4, y - 4, w + 8, h + 8, h / 2 + 4)
    bg.fillStyle(0xdff2bc, 1)
    bg.fillRoundedRect(x, y, w, h, h / 2)
    bg.setDepth(6)
    this.timeBarFill = this.add.graphics()
    this.timeBarFill.setDepth(7)
    this.drawTimeBar(1)
  }

  private drawTimeBar(progress: number) {
    if (!this.timeBarFill) return
    const { x, y, w, h } = TIMER_BAR
    this.timeBarFill.clear()
    const color = progress > 0.5 ? 0x7ed321 : progress > 0.25 ? 0xf59e0b : 0xef4444
    this.timeBarFill.fillStyle(color, 1)
    const filled = w * Phaser.Math.Clamp(progress, 0, 1)
    // raio nunca maior que metade da largura, senão o arredondamento estoura
    if (filled > 0) this.timeBarFill.fillRoundedRect(x, y, filled, h, Math.min(h / 2, filled / 2))
  }

  private startSentenceTimer() {
    if (!this.levelConfig.perSentenceTimer) return
    this.timerTween?.stop()
    this.timerState.progress = 1
    this.timerActive = true
    this.drawTimeBar(1)

    this.timerTween = this.tweens.add({
      targets: this.timerState,
      progress: 0,
      duration: this.levelConfig.perSentenceTimer * 1000,
      ease: 'Linear',
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
      missionIndex: this.currentSentenceIndex,
      totalMissions: this.levelConfig.sentences.length,
      level: this.levelConfig.level,
    })
  }

  private emitCheckpoint() {
    const progress = Math.round((this.currentSentenceIndex / this.levelConfig.sentences.length) * 100)
    runtimeGameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress,
      score: this.currentPoints,
      stage: this.levelConfig.level,
      hits: this.hits,
      errors: this.errors,
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FUNDO
  // ══════════════════════════════════════════════════════════════════════════

  private drawBackground() {
    this.add.image(640, 360, 'bg-tribunal').setDisplaySize(1280, 720).setDepth(-1)
    // juiz recuado para a esquerda: abre espaço para o cartão maior
    this.add.image(190, 372, 'character-judge').setDisplaySize(260, 352).setOrigin(0.5).setDepth(1)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CARTÃO DE SENTENÇA E BOTÕES
  // ══════════════════════════════════════════════════════════════════════════

  private buildSentenceUI() {
    this.sentenceCard = this.add.container(CARD_CX, CARD_CY).setDepth(5)

    this.cardShadow = this.add.graphics()
    this.cardBg = this.add.graphics()

    this.sourceText = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '21px', color: '#FFCC80',
    }).setOrigin(0, 0.5).setResolution(2)

    this.sentenceText = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '34px', color: '#FFF3E0',
      align: 'center', wordWrap: { width: CARD_W - 96 },
      lineSpacing: 10,
    }).setOrigin(0.5).setResolution(2)

    this.sentenceCard.add([this.cardShadow, this.cardBg, this.sourceText, this.sentenceText])

    // posicionado dinamicamente acima do cartão em renderSentenceCard()
    this.negationBadge = this.add.container(CARD_CX, 214).setDepth(6).setAlpha(0)
    const badgeBg = this.add.graphics()
    badgeBg.fillStyle(0xef4444, 0.95)
    badgeBg.fillRoundedRect(-198, -26, 396, 52, 26)
    badgeBg.lineStyle(3, 0xffffff, 0.9)
    badgeBg.strokeRoundedRect(-198, -26, 396, 52, 26)
    const badgeTxt = this.add.text(0, 0, '⚠ Atenção à palavra NÃO!', {
      fontFamily: 'Arial Black, Arial', fontStyle: 'bold', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    this.negationBadge.add([badgeBg, badgeTxt])

    this.trueBtn = this.makeAnswerButton(CARD_CX - BTN_DX, BTN_Y, true)
    this.falseBtn = this.makeAnswerButton(CARD_CX + BTN_DX, BTN_Y, false)

    this.createGavel()
  }

  private createGavel() {
    this.gavel = this.add.image(0, 0, 'hammer')
      .setDisplaySize(96, 96).setOrigin(0.5).setDepth(30).setAlpha(0)
  }

  private showGavel(x: number, y: number) {
    if (!this.gavel) return
    this.tweens.killTweensOf(this.gavel)
    this.gavel.setPosition(x, y).setAlpha(1).setAngle(-35)
    this.tweens.add({
      targets: this.gavel, angle: -5, duration: 240,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })
  }

  private hideGavel() {
    if (!this.gavel) return
    this.tweens.killTweensOf(this.gavel)
    this.gavel.setAlpha(0)
  }

  private renderSentenceCard(sentence: LogicSentence) {
    const PAD = 40, HEADER_H = 58, R = 24

    this.sourceText!.setText(`${sentence.source}`)
    this.sentenceText!.setText(sentence.text)

    const textH = this.sentenceText!.height
    const cardH = Math.max(240, HEADER_H + textH + PAD * 2)
    const top = -cardH / 2

    this.sourceText!.setPosition(-CARD_W / 2 + PAD, top + HEADER_H / 2)
    this.sentenceText!.setPosition(0, top + HEADER_H + PAD / 2 + textH / 2)

    this.cardShadow!.clear()
    this.cardShadow!.fillStyle(0x000000, 0.28)
    this.cardShadow!.fillRoundedRect(-CARD_W / 2 + 6, top + 9, CARD_W, cardH, R)

    this.cardBg!.clear()
    this.cardBg!.fillStyle(0x3b2718, 0.97)
    this.cardBg!.fillRoundedRect(-CARD_W / 2, top, CARD_W, cardH, R)
    this.cardBg!.lineStyle(5, 0xFFCC80, 0.9)
    this.cardBg!.strokeRoundedRect(-CARD_W / 2, top, CARD_W, cardH, R)
    this.cardBg!.fillStyle(0x2a1a0d, 1)
    this.cardBg!.fillRoundedRect(-CARD_W / 2, top, CARD_W, HEADER_H, { tl: R, tr: R, bl: 0, br: 0 })

    // o aviso do NÃO flutua acima do cartão, sem colidir com a barra de tempo
    const ceiling = this.levelConfig.perSentenceTimer
      ? TIMER_BAR.y + TIMER_BAR.h
      : TOP_BAR_H
    const badgeY = Math.max(ceiling + 38, CARD_CY + top - 42)
    this.negationBadge?.setPosition(CARD_CX, badgeY)
  }
  private makeAnswerButton(x: number, y: number, value: boolean): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y).setDepth(5)
    const W = BTN_W, H = BTN_H, R = 28

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.20)
    shadow.fillRoundedRect(-W / 2 + 5, -H / 2 + 8, W, H, R)

    const bg = this.add.graphics()
    bg.fillStyle(value ? 0x22c55e : 0xef4444, 1)
    bg.fillRoundedRect(-W / 2, -H / 2, W, H, R)
    bg.lineStyle(5, 0xffffff, 0.9)
    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, R)

    const label = this.add.text(0, -26, value ? '✅ VERDADEIRO' : '❌ FALSO', {
      fontFamily: 'Arial Black, Arial', fontStyle: 'bold',
      fontSize: '34px', color: '#ffffff',
      stroke: value ? '#14532d' : '#7f1d1d', strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2)

    // a legenda vive dentro do botão: menos elementos na tela e alvo maior
    const caption = this.add.text(0, 34, value ? 'a notícia é real' : 'a notícia é inventada', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '21px', color: '#ffffff',
      stroke: value ? '#14532d' : '#7f1d1d', strokeThickness: 2,
    }).setOrigin(0.5).setResolution(2)

    btn.add([shadow, bg, label, caption])
    btn.setSize(W, H)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerover', () => {
      if (this.phase !== 'waiting-answer') return
      this.tweens.add({ targets: btn, scale: 1.06, duration: 90 })
      this.showGavel(x, y - H / 2 - 30)
    })
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scale: 1, duration: 90 })
      this.hideGavel()
    })
    btn.on('pointerdown', () => {
      this.hideGavel()
      this.handleAnswer(value)
    })
    return btn
  }

  /** Desenha a sentença atual sem liberar a resposta (usado antes do tutorial). */
  private prepareCurrentSentence() {
    const sentence = this.levelConfig.sentences[this.currentSentenceIndex]
    if (!sentence || !this.sentenceText) return

    this.renderSentenceCard(sentence)
    this.negationBadge?.setAlpha(sentence.hasNegation ? 1 : 0)
    this.hideGavel()
    this.broadcastMissionState()
  }

  /** Libera os botões e dispara o cronômetro do nível 3. */
  private activateSentence() {
    if (this.gameEnded) return
    this.phase = 'waiting-answer'
    this.trueBtn?.setInteractive({ useHandCursor: true })
    this.falseBtn?.setInteractive({ useHandCursor: true })
    if (this.levelConfig.perSentenceTimer) this.startSentenceTimer()
  }

  private showCurrentSentence() {
    this.prepareCurrentSentence()
    this.activateSentence()
  }

  /** Entrada do nível: mostra a 1ª sentença, roda o tutorial e só então libera. */
  private startLevelFlow() {
    this.prepareCurrentSentence()

    if (!this.tutorialSteps.length) {
      this.activateSentence()
      return
    }

    EventBus.emit('tutorial-start')
    createTutorial(this, {
      key: this.tutorialKey,
      accent: 0xf57c00,
      safeTop: TOP_BAR_H,
      steps: this.tutorialSteps,
      onFinish: () => {
        EventBus.emit('tutorial-end')
        this.activateSentence()
      },
    })
  }

  /** Reexibição pelo botão "?" da UIScene, sem penalizar o cronômetro. */
  private replayTutorial = () => {
    if (this.gameEnded || this.phase !== 'waiting-answer' || !this.tutorialSteps.length) return

    this.phase = 'intro'
    this.hideGavel()
    this.trueBtn?.disableInteractive()
    this.falseBtn?.disableInteractive()
    this.timerTween?.pause()

    EventBus.emit('tutorial-start')
    createTutorial(this, {
      key: this.tutorialKey,
      once: false,
      accent: 0xf57c00,
      safeTop: TOP_BAR_H,
      steps: this.tutorialSteps,
      onFinish: () => {
        EventBus.emit('tutorial-end')
        if (this.gameEnded) return
        this.phase = 'waiting-answer'
        this.trueBtn?.setInteractive({ useHandCursor: true })
        this.falseBtn?.setInteractive({ useHandCursor: true })
        this.timerTween?.resume()
      },
    })
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
      this.showExplanation(sentence)
      this.time.delayedCall(sentence.hasNegation ? 3400 : 2600, () => this.advanceSentence())
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
      const star = this.add.image(CARD_CX + Phaser.Math.Between(-70, 70), CARD_CY, 'effect-star')
        .setDisplaySize(36, 36).setDepth(8).setAlpha(0.95)
      const targetX = star.x + Phaser.Math.Between(-160, 160)
      const targetY = star.y - Phaser.Math.Between(120, 220)
      this.tweens.add({
        targets: star, x: targetX, y: targetY, alpha: 0, angle: Phaser.Math.Between(-180, 180),
        duration: 700 + i * 30, ease: 'Cubic.Out', onComplete: () => star.destroy(),
      })
    }
  }

  private showExplanation(sentence: LogicSentence) {
    // fica abaixo do cartão: a frase julgada continua visível durante a explicação
    const panel = this.addOverlayObject(this.add.container(CARD_CX, 594).setDepth(70))
    const W = 700, H = sentence.hasNegation ? 228 : 180

    const bg = this.add.graphics()
    bg.fillStyle(0x2a1a0d, 0.97)
    bg.fillRoundedRect(-W / 2, -H / 2, W, H, 22)
    bg.lineStyle(4, 0xFFCC80, 0.9)
    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 22)

    const rows: Phaser.GameObjects.GameObject[] = [bg]
    let y = -H / 2 + 38

    const addRow = (labelTxt: string, valueTxt: string, color: string) => {
      rows.push(this.add.text(-W / 2 + 26, y, labelTxt, {
        fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: '#FFCC80',
      }).setOrigin(0, 0.5).setResolution(2))
      rows.push(this.add.text(-W / 2 + 230, y, valueTxt, {
        fontFamily: 'Arial', fontStyle: 'bold', fontSize: '22px', color,
        wordWrap: { width: W - 260 },
      }).setOrigin(0, 0.5).setResolution(2))
      y += 46
    }

    addRow('A frase afirma:', sentence.core, '#FFF3E0')
    addRow('Isso é:', sentence.coreValue ? 'VERDADE' : 'MENTIRA',
      sentence.coreValue ? '#86efac' : '#fca5a5')

    if (sentence.hasNegation) {
      addRow('Mas tem o NÃO:', 'a negação inverte o valor', '#fcd34d')
    }

    addRow('Logo, a frase é:', sentence.correctValue ? 'VERDADEIRA' : 'FALSA',
      sentence.correctValue ? '#86efac' : '#fca5a5')

    panel.add(rows)
    panel.setAlpha(0).setScale(0.9)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.Out' })

    this.time.delayedCall(sentence.hasNegation ? 3200 : 2400, () => {
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
    shadow.fillRoundedRect(-318, -190, 636, 384, 32)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-328, -204, 656, 384, 32)
    bg.lineStyle(6, 0xffffff, 0.95)
    bg.strokeRoundedRect(-328, -204, 656, 384, 32)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xff8a2a, 1)
    topBar.fillRoundedRect(-230, -222, 460, 34, 17)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-230, -222, 460, 34, 17)

    const title = this.add.text(0, -126, 'Parabéns!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '50px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const completed = this.add.text(0, -56, 'Nível concluído', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '32px', color: '#f57c00',
      align: 'center', wordWrap: { width: 540 },
    }).setOrigin(0.5).setResolution(2)

    const successTexts: Record<number, string> = {
      1: 'Você julgou corretamente as sentenças simples!',
      2: 'Você aprendeu a prestar atenção na palavra NÃO!',
      3: 'Você julgou rápido e bem mesmo com o tempo correndo!',
    }
    const next = this.add.text(0, 16, successTexts[lvl] ?? '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '22px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 540 },
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
      dot.fillCircle(-36 + index * 36, 92, 11)
      dot.lineStyle(3, 0xffffff, 0.9)
      dot.strokeCircle(-36 + index * 36, 92, 11)
      return dot
    })

    const waitText = this.add.text(0, 142, nextLevel ? 'Preparando o próximo nível...' : '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '20px', color: '#25327a',
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

  // ══════════════════════════════════════════════════════════════════════════
  //  TUTORIAL (createTutorial compartilhado)
  // ══════════════════════════════════════════════════════════════════════════

  /** Áreas destacáveis, em coordenadas absolutas de 1280×720. */
  private spot = {
    card: { x: CARD_CX, y: CARD_CY, w: CARD_W + 32, h: 292 },
    trueBtn: { x: CARD_CX - BTN_DX, y: BTN_Y, w: BTN_W + 26, h: BTN_H + 26 },
    bothBtns: { x: CARD_CX, y: BTN_Y, w: BTN_DX * 2 + BTN_W + 26, h: BTN_H + 26 },
    badge: { x: CARD_CX, y: 206, w: 424, h: 78 },
    timer: {
      x: TIMER_BAR.x + TIMER_BAR.w / 2,
      y: TIMER_BAR.y + TIMER_BAR.h / 2,
      w: TIMER_BAR.w + 34,
      h: TIMER_BAR.h + 34,
    },
    judge: { x: 190, y: 372, w: 300, h: 300 },
  }

  private buildTutorialSteps(): TutorialStep[] {
    if (this.levelConfig.level === 2) {
      return [
        {
          text: 'Agora as frases têm a palavra NÃO. Quando ela aparecer, este aviso acende.',
          shape: 'rect', ...this.spot.badge,
        },
        {
          text: 'Leia a frase sem o NÃO e pense: essa parte é verdade?',
          shape: 'rect', ...this.spot.card,
        },
        {
          text: 'Depois é só inverter: se a frase sem o NÃO era verdade, com o NÃO ela fica falsa.',
          shape: 'rect', ...this.spot.bothBtns,
        },
      ]
    }

    if (this.levelConfig.level === 3) {
      return [
        {
          text: 'Esta barra mostra o tempo que você tem para julgar cada frase.',
          shape: 'rect', ...this.spot.timer,
        },
        {
          text: 'Leia rápido, mas não esqueça de procurar a palavra NÃO antes de decidir.',
          shape: 'rect', ...this.spot.card,
        },
        {
          text: 'Se o tempo acabar sem resposta, a frase conta como erro. Bom julgamento!',
          shape: 'rect', ...this.spot.bothBtns,
        },
      ]
    }

    return [
      {
        text: 'Este é o cartão do julgamento. Leia a frase com calma antes de responder.',
        shape: 'rect', ...this.spot.card,
      },
      {
        text: 'Se a frase estiver certa, toque em VERDADEIRO. Se estiver errada, toque em FALSO.',
        shape: 'rect', ...this.spot.bothBtns,
        pointer: {
          fromX: CARD_CX, fromY: CARD_CY + 150,
          toX: this.spot.trueBtn.x, toY: BTN_Y,
          textureKey: 'hammer',
        },
      },
      {
        text: 'O juiz explica cada resposta — inclusive quando você erra. Assim dá para aprender.',
        shape: 'circle', ...this.spot.judge,
      },
      {
        text: 'Cuidado: errar 3 frases seguidas encerra o julgamento.',
        shape: 'none',
      },
    ]
  }

  private showNextLevelStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58)
      .setDepth(450).setInteractive()

    const modal = this.add.container(640, 360).setDepth(451)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-318, -178, 636, 364, 32)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-328, -192, 656, 364, 32)
    bg.lineStyle(6, 0xffffff, 0.95)
    bg.strokeRoundedRect(-328, -192, 656, 364, 32)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x42d640, 1)
    topBar.fillRoundedRect(-230, -210, 460, 34, 17)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-230, -210, 460, 34, 17)

    const lvl = this.levelConfig.level
    const title = this.add.text(0, -118, `Nível ${lvl}`, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '48px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const objective = this.add.text(0, -46, this.levelConfig.objective, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '30px', color: '#f57c00',
      align: 'center', wordWrap: { width: 560 },
    }).setOrigin(0.5).setResolution(2)

    const detail = this.add.text(0, 32, this.levelConfig.tip, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '21px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 550 },
    }).setOrigin(0.5).setResolution(2)

    const button = this.add.container(0, 124)
    const buttonShadow = this.add.graphics()
    buttonShadow.fillStyle(0x000000, 0.16)
    buttonShadow.fillRoundedRect(-160, -24, 320, 60, 30)
    const buttonBg = this.add.graphics()
    buttonBg.fillStyle(0xf57c00, 1)
    buttonBg.fillRoundedRect(-164, -32, 328, 64, 32)
    buttonBg.lineStyle(5, 0xffffff, 1)
    buttonBg.strokeRoundedRect(-164, -32, 328, 64, 32)
    const buttonText = this.add.text(0, 0, 'Iniciar nível', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '28px', color: '#ffffff',
      stroke: '#9a3f00', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    button.add([buttonShadow, buttonBg, buttonText])

    const buttonHitbox = this.add.zone(640, 360 + 124, 328, 72)
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
      this.startLevelFlow()
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
    shadow.fillRoundedRect(-338, -200, 676, 420, 38)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-350, -214, 700, 424, 38)
    bg.lineStyle(6, 0xffffff, 0.96)
    bg.strokeRoundedRect(-350, -214, 700, 424, 38)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(0x42d640, 1)
    ribbon.fillRoundedRect(-248, -234, 496, 40, 20)
    ribbon.lineStyle(4, 0xffffff, 0.9)
    ribbon.strokeRoundedRect(-248, -234, 496, 40, 20)

    const title = this.add.text(0, -146, 'Jogo concluído!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '48px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -84, 'Você julgou todas as sentenças do tribunal!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 600 },
    }).setOrigin(0.5).setResolution(2)

    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-210 + index * 210, 44)
      const badge = this.add.graphics()
      badge.fillStyle(index === 0 ? 0xff8a2a : index === 1 ? 0x45c6f0 : 0x42d640, 1)
      badge.fillRoundedRect(-66, -50, 132, 100, 22)
      badge.lineStyle(4, 0xffffff, 0.95)
      badge.strokeRoundedRect(-66, -50, 132, 100, 22)
      const number = this.add.text(0, -14, String(level), {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '38px', color: '#ffffff',
        stroke: '#25327a', strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2)
      const label = this.add.text(0, 28, 'concluído', {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '16px', color: '#ffffff',
      }).setOrigin(0.5).setResolution(2)
      item.add([badge, number, label])
      return item
    })

    const createFinalButton = (x: number, label: string, color: number, stroke: string, onClick: () => void) => {
      const button = this.add.container(x, 160)
      const buttonShadow = this.add.graphics()
      buttonShadow.fillStyle(0x000000, 0.16)
      buttonShadow.fillRoundedRect(-152, -24, 304, 60, 30)
      const buttonBg = this.add.graphics()
      buttonBg.fillStyle(color, 1)
      buttonBg.fillRoundedRect(-156, -32, 312, 64, 32)
      buttonBg.lineStyle(5, 0xffffff, 1)
      buttonBg.strokeRoundedRect(-156, -32, 312, 64, 32)
      const buttonText = this.add.text(0, 0, label, {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '25px', color: '#ffffff',
        stroke, strokeThickness: 3,
      }).setOrigin(0.5).setResolution(2)
      button.add([buttonShadow, buttonBg, buttonText])

      const buttonHitbox = this.add.zone(640 + x, 360 + 160, 312, 72)
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

    const playAgain = createFinalButton(-166, 'Jogar novamente', 0x42d640, '#1b7d1c', () => {
      this.scene.restart({ level: 1, points: 0, lives: 1 })
    })
    const exitBtn = createFinalButton(166, 'Voltar aos jogos', 0xf57c00, '#9a3f00', () => {
      EventBus.emit('exit-game')
    })

    const sparkles = Array.from({ length: 14 }, (_, i) => {
      const sp = this.add.graphics()
      const x = Phaser.Math.Between(-320, 320)
      const y = Phaser.Math.Between(-190, 186)
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
    shadow.fillRoundedRect(-318, -190, 636, 388, 32)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-328, -204, 656, 390, 32)
    bg.lineStyle(6, 0xffffff, 0.95)
    bg.strokeRoundedRect(-328, -204, 656, 390, 32)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xef4444, 1)
    topBar.fillRoundedRect(-230, -222, 460, 34, 17)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-230, -222, 460, 34, 17)

    const icon = this.add.text(0, -128, reason === 'timeout' ? '⏱' : '❌', {
      fontSize: '66px',
    }).setOrigin(0.5)

    const title = this.add.text(0, -54, 'Que pena!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '48px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const reasonMsg = reason === 'timeout' ? 'O tempo acabou!' : '3 julgamentos errados seguidos!'
    const reasonTxt = this.add.text(0, 14, reasonMsg, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#ef4444',
      align: 'center', wordWrap: { width: 560 },
    }).setOrigin(0.5).setResolution(2)

    const total = this.levelConfig.sentences.length
    const statsTxt = this.add.text(0, 66, `${this.currentSentenceIndex} de ${total} sentenças julgadas`, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '22px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 560 },
    }).setOrigin(0.5).setResolution(2)

    const retryBtn = this.createModalButton(-160, 138, 'Tentar novamente', 0x42d640, () => {
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    })
    const exitBtn = this.createModalButton(160, 138, 'Sair', 0xf57c00, () => {
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
    bg.fillRoundedRect(-148, -32, 296, 64, 32)
    bg.lineStyle(5, 0xffffff, 1)
    bg.strokeRoundedRect(-148, -32, 296, 64, 32)
    const text = this.add.text(0, 0, label, {
      fontSize: '23px', fontFamily: 'Arial Black, Arial',
      color: '#ffffff', stroke: '#0f172a', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    button.add([bg, text])
    button.setSize(300, 76)
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
    const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    g.gain.setValueAtTime(gain, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
  }

  private playTick() { this.playTone(520, 0.04, 'sine', 0.08) }
  private playCorrect() {
    this.playTone(660, 0.08, 'sine', 0.15)
    this.time.delayedCall(100, () => this.playTone(880, 0.08, 'sine', 0.12))
  }
  private playError() { this.playTone(330, 0.20, 'square', 0.15) }
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
        this.currentLives = cmd.lives ?? 1
      }
    })
  }
}
