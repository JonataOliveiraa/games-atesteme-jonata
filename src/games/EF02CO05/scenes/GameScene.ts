import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { LevelConfig, Situation, CityLocation } from '../types'
import { LEVELS } from '../data/levels'
import { ALL_TECH } from '../data/tech'

const GAME_ID = 'cidade-das-tecnologias'
const MAX_CONSECUTIVE_ERRORS = 3

const OPT_CARD_W = 140
const OPT_CARD_H = 162

type RoundPhase = 'intro' | 'waiting-answer' | 'feedback' | 'level-complete'

export class GameScene extends Phaser.Scene {

  private levelConfig!: LevelConfig
  private currentSituationIndex = 0   // usado apenas no modo sequencial (N3)
  private visitedLocationIds = new Set<string>()
  private hits   = 0
  private errors = 0
  private consecutiveErrors = 0
  private currentPoints = 0
  private currentLives  = 1
  private isMuted = false
  private phase: RoundPhase = 'intro'
  private gameEnded = false
  private shouldShowLevelStart = false

  private locationSprites = new Map<string, Phaser.GameObjects.Container>()
  private sequentialCard?: Phaser.GameObjects.Container

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
    this.levelConfig            = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.currentSituationIndex  = 0
    this.visitedLocationIds     = new Set()
    this.hits                   = 0
    this.errors                 = 0
    this.consecutiveErrors      = 0
    this.currentPoints          = data?.points ?? 0
    this.currentLives           = data?.lives  ?? 1
    this.isMuted                = false
    this.phase                  = 'intro'
    this.gameEnded               = false
    this.shouldShowLevelStart   = data?.showLevelStart ?? false
    this.locationSprites        = new Map()
    this.overlayObjects         = []
    this.timerActive            = false
    this.timerState.progress    = 1
  }

  create() {
    this.drawBackground()
    if (this.levelConfig.perSituationTimer) this.createTimerBar()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMissionState()
    this.emitCheckpoint()

    if (this.shouldShowLevelStart && this.levelConfig.level > 1) {
      this.showNextLevelStartScreen()
    } else {
      this.beginLevel()
      if (this.levelConfig.level === 1) {
        this.showTutorialOverlay()
      }
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
  //  TIMER (apenas Nível 3 — por situação)
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

  private startSituationTimer(onExpire: () => void) {
    if (!this.levelConfig.perSituationTimer) return
    this.timerTween?.stop()
    this.timerState.progress = 1
    this.timerActive = true
    this.drawTimeBar(1)

    this.timerTween = this.tweens.add({
      targets:  this.timerState,
      progress: 0,
      duration: this.levelConfig.perSituationTimer * 1000,
      ease:     'Linear',
      onUpdate: () => this.drawTimeBar(this.timerState.progress),
      onComplete: () => {
        if (!this.timerActive) return
        this.timerActive = false
        this.drawTimeBar(0)
        onExpire()
      },
    })
  }

  private stopSituationTimer() {
    this.timerActive = false
    this.timerTween?.stop()
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BROADCAST PARA UISCENE
  // ══════════════════════════════════════════════════════════════════════════

  private broadcastMissionState() {
    const total = this.levelConfig.useMap
      ? (this.levelConfig.locations?.length ?? 0)
      : this.levelConfig.situations.length
    const completed = this.levelConfig.useMap
      ? this.visitedLocationIds.size
      : this.currentSituationIndex

    EventBus.emit('mission-update', {
      instruction: this.levelConfig.title,
      hint: this.levelConfig.tip,
      missionIndex:  completed,
      totalMissions: total,
      level:         this.levelConfig.level,
    })
  }

  private emitCheckpoint() {
    const total = this.levelConfig.useMap
      ? (this.levelConfig.locations?.length ?? 1)
      : this.levelConfig.situations.length
    const completed = this.levelConfig.useMap
      ? this.visitedLocationIds.size
      : this.currentSituationIndex
    const progress = Math.round((completed / total) * 100)
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
    this.add.image(640, 400, 'bg-city-map').setDisplaySize(1280, 608).setDepth(-1)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  MODO MAPA (Níveis 1 e 2)
  // ══════════════════════════════════════════════════════════════════════════

  private beginLevel() {
    this.phase = 'waiting-answer'
    if (this.levelConfig.useMap) {
      this.buildLocations()
    } else {
      this.showSequentialSituation()
    }
    this.broadcastMissionState()
  }

  private buildLocations() {
    const locations = this.levelConfig.locations ?? []
    locations.forEach((loc, i) => {
      const container = this.makeLocationSprite(loc, i)
      this.locationSprites.set(loc.id, container)
    })
  }

  private makeLocationSprite(loc: CityLocation, animIndex: number): Phaser.GameObjects.Container {
    const img = this.add.image(0, 0, loc.textureKey).setDisplaySize(140, 140).setOrigin(0.5)

    const labelBg = this.add.graphics()
    labelBg.fillStyle(0x000000, 0.55)
    labelBg.fillRoundedRect(-60, 64, 120, 26, 10)
    const label = this.add.text(0, 77, loc.label, {
      fontSize: '14px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
    }).setOrigin(0.5)

    const checkBadge = this.add.text(54, -62, '✅', { fontSize: '28px' }).setOrigin(0.5).setAlpha(0)

    const container = this.add.container(loc.x, loc.y, [img, labelBg, label, checkBadge]).setDepth(5)
    container.setSize(140, 166)
    container.setInteractive({ useHandCursor: true })
    container.setData('checkBadge', checkBadge)
    container.setData('visited', false)

    container.setAlpha(0).setScale(0.7)
    this.tweens.add({
      targets: container, alpha: 1, scaleX: 1, scaleY: 1,
      duration: 380, ease: 'Back.Out', delay: animIndex * 90,
    })

    container.on('pointerover', () => { if (!container.getData('visited')) this.tweens.add({ targets: container, scale: 1.06, duration: 90 }) })
    container.on('pointerout',  () => { if (!container.getData('visited')) this.tweens.add({ targets: container, scale: 1, duration: 90 }) })
    container.on('pointerdown', () => this.openLocationSituation(loc, container))

    return container
  }

  private openLocationSituation(loc: CityLocation, container: Phaser.GameObjects.Container) {
    if (this.gameEnded || container.getData('visited')) return
    const situation = this.levelConfig.situations.find(s => s.id === loc.situationId)
    if (!situation) return

    this.showSituationModal(situation, (correct) => {
      container.setData('visited', true)
      const badge = container.getData('checkBadge') as Phaser.GameObjects.Text
      badge.setText(correct ? '✅' : '⚠️').setAlpha(1)
      container.disableInteractive()
      this.tweens.add({ targets: container, alpha: 0.7, duration: 200 })

      this.visitedLocationIds.add(loc.id)
      this.broadcastMissionState()
      this.emitCheckpoint()

      if (this.gameEnded) return
      if (this.visitedLocationIds.size >= (this.levelConfig.locations?.length ?? 0)) {
        this.endLevel()
      }
    })
  }

  private showSituationModal(situation: Situation, onAnswered: (correct: boolean) => void) {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x0c3b2e, 0.55)
      .setDepth(80).setInteractive()
    const modal = this.add.container(640, 360).setDepth(81)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-340, -200, 680, 400, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-340, -200, 680, 400, 28)

    const promptTxt = this.add.text(0, -150, situation.prompt, {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '22px', color: '#0c3b2e',
      align: 'center', wordWrap: { width: 600 },
    }).setOrigin(0.5).setResolution(2)

    modal.add([bg, promptTxt])

    const feedbackTxt = this.add.text(0, 160, '', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 600 },
    }).setOrigin(0.5).setResolution(2)
    modal.add(feedbackTxt)

    const buttons = this.buildOptionButtons(situation, 0, -10, (optionId) => {
      buttons.forEach(b => b.disableInteractive())
      const correct = optionId === situation.correctId
      feedbackTxt.setText(situation.justification)
      this.handleAnswerFeedback(correct, buttons, optionId, situation)

      this.time.delayedCall(2200, () => {
        this.tweens.add({
          targets: [overlay, modal], alpha: 0, duration: 260,
          onComplete: () => { overlay.destroy(); modal.destroy(); onAnswered(correct) },
        })
      })
    })
    buttons.forEach(b => modal.add(b))

    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  MODO SEQUENCIAL (Nível 3)
  // ══════════════════════════════════════════════════════════════════════════

  private showSequentialSituation() {
    this.sequentialCard?.destroy()
    const situation = this.levelConfig.situations[this.currentSituationIndex]
    if (!situation) return

    this.phase = 'waiting-answer'
    const card = this.add.container(640, 280).setDepth(5)
    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.12)
    shadow.fillRoundedRect(-356, -84, 720, 180, 24)
    const bg = this.add.graphics()
    bg.fillStyle(0xffffff, 1)
    bg.fillRoundedRect(-360, -90, 720, 180, 24)
    bg.lineStyle(2, 0xe2e8f0, 1)
    bg.strokeRoundedRect(-360, -90, 720, 180, 24)
    const promptTxt = this.add.text(0, 0, situation.prompt, {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '22px', color: '#0c3b2e',
      align: 'center', wordWrap: { width: 660 },
    }).setOrigin(0.5).setResolution(2)
    card.add([shadow, bg, promptTxt])
    this.sequentialCard = card

    const buttons = this.buildOptionButtons(situation, 640, 480, (optionId) => {
      buttons.forEach(b => b.disableInteractive())
      this.stopSituationTimer()
      const correct = optionId === situation.correctId
      this.handleAnswerFeedback(correct, buttons, optionId, situation)
      this.advanceAfterFeedback()
    })

    this.startSituationTimer(() => {
      buttons.forEach(b => b.disableInteractive())
      this.handleAnswerFeedback(false, buttons, null, situation)
      this.advanceAfterFeedback()
    })

    this.broadcastMissionState()
  }

  private advanceAfterFeedback() {
    if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      this.time.delayedCall(1800, () => this.onTooManyErrors())
      return
    }
    this.time.delayedCall(2200, () => {
      this.currentSituationIndex++
      this.sequentialCard?.destroy()
      if (this.currentSituationIndex >= this.levelConfig.situations.length) {
        this.endLevel()
        return
      }
      this.showSequentialSituation()
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BOTÕES DE OPÇÃO (compartilhado entre os dois modos)
  // ══════════════════════════════════════════════════════════════════════════

  private buildOptionButtons(situation: Situation, centerX: number, centerY: number, onPick: (id: string) => void): Phaser.GameObjects.Container[] {
    const count = situation.options.length
    const gap = 18
    const totalW = count * OPT_CARD_W + (count - 1) * gap
    const startX = centerX - totalW / 2 + OPT_CARD_W / 2

    return situation.options.map((optId, i) => {
      const tech = ALL_TECH.find(t => t.id === optId)!
      const x = startX + i * (OPT_CARD_W + gap)
      const y = centerY

      const btn = this.add.container(x, y)

      const cardShadow = this.add.graphics()
      cardShadow.fillStyle(0x000000, 0.10)
      cardShadow.fillRoundedRect(-OPT_CARD_W / 2 + 3, -OPT_CARD_H / 2 + 5, OPT_CARD_W, OPT_CARD_H, 16)

      const bg = this.add.graphics()
      bg.fillStyle(0xffffff, 1)
      bg.fillRoundedRect(-OPT_CARD_W / 2, -OPT_CARD_H / 2, OPT_CARD_W, OPT_CARD_H, 16)
      bg.lineStyle(2, 0xe2e8f0, 1)
      bg.strokeRoundedRect(-OPT_CARD_W / 2, -OPT_CARD_H / 2, OPT_CARD_W, OPT_CARD_H, 16)

      const icon = this.add.image(0, -24, tech.textureKey).setDisplaySize(88, 88).setOrigin(0.5)
      const label = this.add.text(0, 52, tech.label, {
        fontSize: '13px', fontFamily: 'Arial Black, Arial', color: '#1e293b',
        align: 'center', wordWrap: { width: OPT_CARD_W - 14 },
      }).setOrigin(0.5)

      btn.add([cardShadow, bg, icon, label])
      btn.setSize(OPT_CARD_W, OPT_CARD_H)
      btn.setData('bg', bg)
      btn.setInteractive({ useHandCursor: true })
      btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.06, duration: 90 }))
      btn.on('pointerout',  () => this.tweens.add({ targets: btn, scale: 1, duration: 90 }))
      btn.on('pointerdown', () => onPick(optId))

      return btn
    })
  }

  private handleAnswerFeedback(correct: boolean, buttons: Phaser.GameObjects.Container[], chosenId: string | null, situation: Situation) {
    if (correct) {
      this.hits++
      this.consecutiveErrors = 0
      this.playCorrect()
    } else {
      this.errors++
      this.consecutiveErrors++
      this.playError()
      runtimeGameBridge.emit({
        type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.levelConfig.level,
      })
    }

    buttons.forEach((btn, i) => {
      const optId = situation.options[i]
      const bg = btn.getData('bg') as Phaser.GameObjects.Graphics
      const isCorrectOpt = optId === situation.correctId
      const isChosen = optId === chosenId
      if (!isCorrectOpt && !isChosen) return

      bg.clear()
      bg.fillStyle(0xffffff, 1)
      bg.fillRoundedRect(-OPT_CARD_W / 2, -OPT_CARD_H / 2, OPT_CARD_W, OPT_CARD_H, 16)
      bg.lineStyle(4, isCorrectOpt ? 0x42d640 : 0xef4444, 1)
      bg.strokeRoundedRect(-OPT_CARD_W / 2, -OPT_CARD_H / 2, OPT_CARD_W, OPT_CARD_H, 16)
    })
  }

  private onTooManyErrors() {
    if (this.gameEnded) return
    this.gameEnded = true
    this.stopSituationTimer()
    this.showGameOverScreen()
  }

  private endLevel() {
    this.phase = 'level-complete'
    this.gameEnded = true
    this.stopSituationTimer()
    this.playFanfare()

    runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
    this.emitCheckpoint()

    const nextLevel = this.levelConfig.level < 3 ? (this.levelConfig.level + 1) as 2 | 3 : null
    this.time.delayedCall(400, () => this.showLevelCompleteTransition(nextLevel))
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TELAS DE FEEDBACK DE NÍVEL (padrão EF02CO01/04/06)
  // ══════════════════════════════════════════════════════════════════════════

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3 | null) {
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x0c3b2e, 0.56).setDepth(450)
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
      fontSize: '40px', color: '#0c3b2e',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const completed = this.add.text(0, -50, 'Nível concluído', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#f57c00',
      align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setResolution(2)

    const successTexts: Record<number, string> = {
      1: 'Você escolheu as tecnologias certas para cada situação!',
      2: 'Você comparou tecnologias parecidas e acertou!',
      3: 'Você decidiu rápido mesmo com o tempo correndo!',
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
      fontSize: '15px', color: '#0c3b2e',
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
  //  TUTORIAL (Nível 1)
  // ══════════════════════════════════════════════════════════════════════════

  private showTutorialOverlay() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.52)
      .setDepth(300).setInteractive()

    const modal = this.add.container(640, 360).setDepth(301)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.16)
    shadow.fillRoundedRect(-264, -192, 528, 388, 30)

    const bg = this.add.graphics()
    bg.fillStyle(0xffffff, 1)
    bg.fillRoundedRect(-272, -200, 544, 388, 30)
    bg.lineStyle(3, 0xe2e8f0, 1)
    bg.strokeRoundedRect(-272, -200, 544, 388, 30)

    const accent = this.add.graphics()
    accent.fillStyle(0x0c3b2e, 1)
    accent.fillRoundedRect(-272, -200, 544, 52, 30)
    accent.fillRect(-272, -168, 544, 20)

    const titleTxt = this.add.text(0, -174, '🏙️  Como jogar', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)

    const steps = [
      { icon: '📍', text: 'Toque em um local do mapa\n(casa, escola, rua...)' },
      { icon: '📖', text: 'Leia com atenção a situação\napresentada' },
      { icon: '🎯', text: 'Escolha a tecnologia que\nmelhor resolve o problema' },
      { icon: '✅', text: 'Veja a explicação e aprenda\ncom cada resposta!' },
    ]

    const stepObjects = steps.flatMap((s, i) => {
      const rowY = -116 + i * 68
      const iconTxt = this.add.text(-218, rowY, s.icon, { fontSize: '28px' }).setOrigin(0.5)
      const stepTxt = this.add.text(-188, rowY, s.text, {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '17px', color: '#1e293b',
        wordWrap: { width: 390 },
      }).setOrigin(0, 0.5).setResolution(2)
      return [iconTxt, stepTxt]
    })

    const btnBg = this.add.graphics()
    btnBg.fillStyle(0xf57c00, 1)
    btnBg.fillRoundedRect(-140, 154, 280, 52, 26)
    btnBg.lineStyle(3, 0xffffff, 1)
    btnBg.strokeRoundedRect(-140, 154, 280, 52, 26)

    const btnTxt = this.add.text(0, 180, '▶  Vamos lá!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '22px', color: '#ffffff',
      stroke: '#9a3f00', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)

    const btnZone = this.add.zone(640, 360 + 180, 280, 58)
    btnZone.setDepth(302).setInteractive({ useHandCursor: true })
    btnZone.on('pointerover', () => {
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.04, scaleY: 1.04, duration: 90 })
    })
    btnZone.on('pointerout', () => {
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 90 })
    })
    btnZone.on('pointerdown', () => {
      this.playTick()
      overlay.destroy()
      btnZone.destroy()
      modal.destroy()
    })

    modal.add([shadow, bg, accent, titleTxt, ...stepObjects, btnBg, btnTxt])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
  }

  private showNextLevelStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x0c3b2e, 0.58)
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
      fontSize: '38px', color: '#0c3b2e',
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
      this.beginLevel()
    })

    modal.add([shadow, bg, topBar, title, objective, detail, button])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private showGameCompleteScreen() {
    this.clearOverlay()
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x0c3b2e, 0.62).setDepth(450)
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
      fontSize: '38px', color: '#0c3b2e',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -74, 'Você dominou as tecnologias da cidade!', {
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
        stroke: '#0c3b2e', strokeThickness: 4,
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

  private showGameOverScreen() {
    this.input.enabled = true
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x0c3b2e, 0.60).setDepth(450)
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

    const icon = this.add.text(0, -112, '❌', { fontSize: '54px' }).setOrigin(0.5)

    const title = this.add.text(0, -50, 'Que pena!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '38px', color: '#0c3b2e',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const reasonTxt = this.add.text(0, 6, '3 escolhas erradas seguidas!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '20px', color: '#ef4444',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5).setResolution(2)

    const statsTxt = this.add.text(0, 52, `Pontos certos: ${this.hits}  •  Errados: ${this.errors}`, {
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
