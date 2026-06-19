import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type {
  LevelConfig,
  ToggleCard,
} from '../types'
import { LEVELS } from '../data/levels'
import { ALL_SECURITY_ITEMS } from '../data/items'

// ── Constantes de layout ─────────────────────────────────────────────────────

const GAME_ID      = 'checklist-do-jogador-seguro'
const TOP_Y        = 95
const BOTTOM_Y     = 638

const PANEL_LEFT_X = 860
const PANEL_W      = 400

const CARD_W = 150
const CARD_H = 150

type RoundPhase =
  | 'intro'
  | 'waiting-answer'
  | 'animating'
  | 'feedback-ok'
  | 'feedback-err'
  | 'level-complete'

export class GameScene extends Phaser.Scene {

  private levelConfig!: LevelConfig
  private currentRoundIndex = 0
  private hits   = 0
  private errors = 0
  private currentPoints = 0
  private currentLives  = 1
  private isMuted = false
  private phase: RoundPhase = 'intro'
  private gameEnded = false
  private shouldShowLevelStart = false
  private missionEffectActive = false

  private toggleCards: ToggleCard[] = []
  private confirmLocked = false

  private questionPanel?: Phaser.GameObjects.Container
  private confirmBtn?: Phaser.GameObjects.Container

  private overlayObjects: Phaser.GameObjects.GameObject[] = []
  private delayedRiskTimer?: Phaser.Time.TimerEvent

  private timeBarFill?: Phaser.GameObjects.Graphics
  private timerTween?: Phaser.Tweens.Tween
  private timerState = { progress: 1 }
  private timerActive = false
  private timerWarned = false
  private warningBeepTimer: Phaser.Time.TimerEvent | null = null

  private unsubPlatform?: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  init(data: { level?: number; points?: number; lives?: number; showLevelStart?: boolean }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig       = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.currentRoundIndex = 0
    this.hits               = 0
    this.errors             = 0
    this.currentPoints      = data?.points ?? 0
    this.currentLives       = data?.lives  ?? 1
    this.isMuted            = false
    this.phase              = 'intro'
    this.gameEnded          = false
    this.shouldShowLevelStart = data?.showLevelStart ?? false
    this.missionEffectActive = false
    this.toggleCards        = []
    this.confirmLocked      = false
    this.overlayObjects     = []
    this.timerActive      = false
    this.timerWarned      = false
    this.timerState.progress = 1
    this.warningBeepTimer = null
  }

  create() {
    this.drawBackground()
    this.createTimerBar()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMissionState()
    this.emitCheckpoint()

    this.startLevel()

    if (this.shouldShowLevelStart && this.levelConfig.level > 1) {
      this.showNextLevelStartScreen()
    } else {
      this.startTimer()
    }
  }

  update() {
    // timer is tween-driven
  }

  shutdown() {
    this.timerActive = false
    this.timerTween?.stop()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.delayedRiskTimer?.destroy()
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
  //  TIMER
  // ══════════════════════════════════════════════════════════════════════════

  private createTimerBar() {
    const barX = 200, barY = 106, barW = 880, barH = 24
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
    const barX = 200, barY = 106, barW = 880, barH = 24
    this.timeBarFill.clear()
    this.timeBarFill.fillStyle(0x7ed321, 1)
    const w = barW * Phaser.Math.Clamp(progress, 0, 1)
    if (w > 0) this.timeBarFill.fillRoundedRect(barX, barY, w, barH, 12)
  }

  private startTimer() {
    this.timerState.progress = 1
    this.timerActive = true
    this.timerWarned = false
    this.drawTimeBar(1)

    this.timerTween = this.tweens.add({
      targets:  this.timerState,
      progress: 0,
      duration: this.levelConfig.timeLimit * 1000,
      ease:     'Linear',
      onUpdate: () => {
        this.drawTimeBar(this.timerState.progress)
        if (!this.timerWarned && this.timerState.progress <= 0.25) {
          this.timerWarned = true
          this.startWarningBeeps()
        }
      },
      onComplete: () => {
        this.drawTimeBar(0)
        this.onTimeUp()
      },
    })
  }

  private startWarningBeeps() {
    this.warningBeepTimer = this.time.addEvent({
      delay: 1000, loop: true, callback: () => {
        if (!this.timerActive) { this.warningBeepTimer?.destroy(); this.warningBeepTimer = null; return }
        this.playTone(880, 0.06, 'sine', 0.12)
      },
    })
  }

  private onTimeUp() {
    if (this.gameEnded) return
    this.gameEnded   = true
    this.timerActive = false
    this.drawTimeBar(0)
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.delayedRiskTimer?.destroy()
    this.input.enabled    = false

    runtimeGameBridge.emit({
      type:         'WRONG_ANSWER',
      gameId:       GAME_ID,
      pointsEarned: 0,
      stage:        this.levelConfig.level,
    })
    this.showGameOverScreen('timeout')
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BROADCAST PARA UISCENE
  // ══════════════════════════════════════════════════════════════════════════

  private broadcastMissionState() {
    const rounds = this.levelConfig.rounds
    const round = rounds[this.currentRoundIndex] ?? rounds[0]
    EventBus.emit('mission-update', {
      instruction: round.question,
      hint: round.hint,
      missionIndex:  this.currentRoundIndex,
      totalMissions: rounds.length,
      level:         this.levelConfig.level,
    })
  }

  private emitCheckpoint() {
    const progress = Math.round((this.currentRoundIndex / this.levelConfig.rounds.length) * 100)
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
    this.add.image(640, 360, 'bg-device').setDisplaySize(1280, 720).setDepth(-1)
    const g = this.add.graphics()
    g.lineStyle(1, 0x4FC3F7, 0.2)
    g.lineBetween(PANEL_LEFT_X - 10, TOP_Y, PANEL_LEFT_X - 10, BOTTOM_Y)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  GRID DE TOGGLES
  // ══════════════════════════════════════════════════════════════════════════

  private startLevel() {
    this.buildRound()
    this.buildQuestionPanel()
    this.showCurrentRound()
  }

  private buildRound() {
    const round = this.levelConfig.rounds[this.currentRoundIndex]
    const totalSlots = round.items.length + (round.delayedItem ? 1 : 0)
    const slots = this.computeGridSlots(totalSlots)

    round.items.forEach((state, i) => {
      const item = ALL_SECURITY_ITEMS.find(it => it.id === state.itemId)!
      const card = this.makeToggleCard(item.id, state.initialOn, slots[i].x, slots[i].y, i)
      this.toggleCards.push(card)
    })

    if (round.delayedItem) {
      const slot = slots[round.items.length]
      this.confirmLocked = true
      this.delayedRiskTimer = this.time.delayedCall(round.delayedItem.appearAfterMs, () => {
        if (this.gameEnded) return
        const item = ALL_SECURITY_ITEMS.find(it => it.id === round.delayedItem!.itemId)!
        const card = this.makeToggleCard(item.id, round.delayedItem!.initialOn, slot.x, slot.y, this.toggleCards.length, true)
        this.toggleCards.push(card)
        this.confirmLocked = false
        this.updateConfirmButton()
        this.showRiskAlert(round.delayedItem!.alertText)
        this.playAlert()
      })
    }
  }

  private computeGridSlots(count: number): Array<{ x: number; y: number }> {
    const cols = count <= 3 ? 3 : count <= 6 ? 3 : 4
    const rows = Math.ceil(count / cols)
    const areaX = 20, areaW = 820
    const areaY = 140, areaH = 490
    const colSpacing = areaW / cols
    const rowSpacing = areaH / rows

    const slots: Array<{ x: number; y: number }> = []
    for (let i = 0; i < count; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      slots.push({
        x: areaX + colSpacing * col + colSpacing / 2,
        y: areaY + rowSpacing * row + rowSpacing / 2,
      })
    }
    return slots
  }

  private makeToggleCard(itemId: string, initialOn: boolean, cx: number, cy: number, animIndex: number, isNew = false): ToggleCard {
    const item = ALL_SECURITY_ITEMS.find(it => it.id === itemId)!

    const bg = this.add.graphics()
    bg.fillStyle(0xfff8f0, 0.96)
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16)
    bg.lineStyle(3, 0x4FC3F7, 0.7)
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16)

    const icon = this.add.image(0, -38, item.iconKey).setDisplaySize(56, 56).setOrigin(0.5)

    const label = this.add.text(0, 6, item.label, {
      fontSize: '13px', fontFamily: 'Arial Black, Arial',
      color: '#0f172a', align: 'center', wordWrap: { width: CARD_W - 16 },
    }).setOrigin(0.5)

    const toggle = this.add.image(0, 52, initialOn ? 'toggle-on' : 'toggle-off')
      .setDisplaySize(70, 32).setOrigin(0.5)

    const feedbackIcon = this.add.image(CARD_W / 2 - 14, -CARD_H / 2 + 16, 'icon-shield-ok')
      .setDisplaySize(28, 28).setOrigin(0.5).setAlpha(0)

    const container = this.add.container(cx, cy, [bg, icon, label, toggle, feedbackIcon])
    container.setSize(CARD_W, CARD_H)
    container.setInteractive({ useHandCursor: true })

    container.setData('itemId', itemId)
    container.setData('isOn', initialOn)
    container.setData('toggleImg', toggle)
    container.setData('feedbackIcon', feedbackIcon)
    container.setData('bgGraphic', bg)

    container.on('pointerdown', () => this.toggleItem(container))

    if (isNew) {
      container.setAlpha(0).setScale(0.6)
      this.tweens.add({ targets: container, alpha: 1, scaleX: 1, scaleY: 1, duration: 320, ease: 'Back.Out' })
    } else {
      container.setAlpha(0).setScale(0.72)
      this.tweens.add({
        targets: container, alpha: 1, scaleX: 1, scaleY: 1,
        duration: 380, ease: 'Back.Out', delay: animIndex * 70,
      })
    }

    return { container, itemId, isOn: initialOn, homeX: cx, homeY: cy }
  }

  private toggleItem(container: Phaser.GameObjects.Container) {
    if (this.gameEnded || this.phase !== 'waiting-answer') return

    const isOn = !(container.getData('isOn') as boolean)
    container.setData('isOn', isOn)
    const toggle = container.getData('toggleImg') as Phaser.GameObjects.Image
    toggle.setTexture(isOn ? 'toggle-on' : 'toggle-off')

    this.tweens.add({ targets: toggle, scaleX: 1.15, scaleY: 1.15, duration: 90, yoyo: true, ease: 'Power2' })
    this.playTick()
  }

  private showRiskAlert(text: string) {
    const toast = this.add.container(640, 170).setDepth(120)
    const bg = this.add.graphics()
    bg.fillStyle(0xef4444, 0.96)
    bg.fillRoundedRect(-360, -28, 720, 56, 18)
    bg.lineStyle(3, 0xffffff, 0.9)
    bg.strokeRoundedRect(-360, -28, 720, 56, 18)
    const txt = this.add.text(0, 0, text, {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px',
      color: '#ffffff', align: 'center', wordWrap: { width: 680 },
    }).setOrigin(0.5).setResolution(2)
    toast.add([bg, txt])
    toast.setAlpha(0).setScale(0.85)
    this.tweens.add({ targets: toast, alpha: 1, scale: 1, duration: 260, ease: 'Back.Out' })
    this.time.delayedCall(2600, () => {
      this.tweens.add({ targets: toast, alpha: 0, duration: 300, onComplete: () => toast.destroy() })
    })
  }

  private buildQuestionPanel() {
    const panelY = TOP_Y + 35
    this.questionPanel = this.add.container(PANEL_LEFT_X, panelY).setDepth(10)

    const bg = this.add.graphics()
    bg.fillStyle(0x102a43, 0.9)
    bg.fillRoundedRect(0, 0, PANEL_W, 310, 22)
    bg.lineStyle(3, 0x4FC3F7, 0.85)
    bg.strokeRoundedRect(0, 0, PANEL_W, 310, 22)

    const qText = this.add.text(PANEL_W / 2, 24, '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '21px', color: '#ffffff',
      stroke: '#0f172a', strokeThickness: 4,
      align: 'center', wordWrap: { width: 360 },
    }).setOrigin(0.5, 0).setResolution(2)

    const hintText = this.add.text(PANEL_W / 2, 110, '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '15px', color: '#cbd5e1',
      align: 'center', wordWrap: { width: 340 },
    }).setOrigin(0.5, 0).setResolution(2)

    this.confirmBtn = this.add.container(PANEL_W / 2, 240)
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x42d640, 1)
    btnBg.fillRoundedRect(-130, -26, 260, 52, 26)
    btnBg.lineStyle(3, 0xffffff, 1)
    btnBg.strokeRoundedRect(-130, -26, 260, 52, 26)
    const btnTxt = this.add.text(0, 0, '✔  Entrar com segurança', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '17px', color: '#ffffff',
      stroke: '#00000040', strokeThickness: 2,
    }).setOrigin(0.5).setResolution(2)
    this.confirmBtn.add([btnBg, btnTxt])
    this.confirmBtn.setSize(260, 76)
    this.confirmBtn.setData('btnBg', btnBg)
    this.confirmBtn.on('pointerdown', () => this.confirmChecklist())

    this.questionPanel.setData('qText', qText)
    this.questionPanel.setData('hintText', hintText)
    this.questionPanel.add([bg, qText, hintText, this.confirmBtn])
  }

  private showCurrentRound() {
    if (!this.questionPanel) return
    const round = this.levelConfig.rounds[this.currentRoundIndex]

    const qText = this.questionPanel.getData('qText') as Phaser.GameObjects.Text
    const hintText = this.questionPanel.getData('hintText') as Phaser.GameObjects.Text
    qText.setText(round.question)
    hintText.setText(round.hint)

    this.phase = 'waiting-answer'
    this.confirmLocked = !!round.delayedItem && round.delayedItem.appearAfterMs > 0
    this.updateConfirmButton()

    if (!this.gameEnded && this.timerTween) {
      this.timerActive = true
      this.timerTween.resume()
    }

    this.broadcastMissionState()
  }

  private updateConfirmButton() {
    if (!this.confirmBtn) return
    this.confirmBtn.setInteractive({ useHandCursor: !this.confirmLocked })
    this.confirmBtn.setAlpha(this.confirmLocked ? 0.5 : 1)
  }

  private confirmChecklist() {
    if (this.phase !== 'waiting-answer' || this.confirmLocked) return

    this.phase = 'feedback-ok'
    this.confirmBtn?.disableInteractive()
    this.timerActive = false
    this.timerTween?.pause()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null

    let allCorrect = true

    this.toggleCards.forEach(card => {
      const item = ALL_SECURITY_ITEMS.find(it => it.id === card.itemId)!
      const isOn = card.container.getData('isOn') as boolean
      const correct = isOn === item.shouldBeOn
      if (!correct) allCorrect = false

      const feedbackIcon = card.container.getData('feedbackIcon') as Phaser.GameObjects.Image
      const bgGraphic = card.container.getData('bgGraphic') as Phaser.GameObjects.Graphics

      feedbackIcon.setTexture(correct ? 'icon-shield-ok' : 'icon-shield-warn')
      feedbackIcon.setAlpha(0)
      this.tweens.add({ targets: feedbackIcon, alpha: 1, duration: 200 })

      bgGraphic.clear()
      bgGraphic.fillStyle(0xfff8f0, 0.96)
      bgGraphic.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16)
      bgGraphic.lineStyle(4, correct ? 0x42d640 : 0xef4444, 1)
      bgGraphic.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16)
    })

    if (allCorrect) {
      this.hits++
      this.playCorrect()
      this.time.delayedCall(1300, () => this.advanceRound())
    } else {
      this.errors++
      this.playError()
      runtimeGameBridge.emit({
        type: 'WRONG_ANSWER',
        gameId: GAME_ID,
        pointsEarned: -2,
        stage: this.levelConfig.level,
      })
      this.emitCheckpoint()
      this.time.delayedCall(1900, () => this.advanceRound())
    }
  }

  private advanceRound() {
    const rounds = this.levelConfig.rounds
    const isLast = this.currentRoundIndex >= rounds.length - 1
    const nextInstruction = !isLast ? rounds[this.currentRoundIndex + 1].question : null

    this.showMissionCompleteEffect(isLast ? null : nextInstruction, () => {
      this.currentRoundIndex++
      if (this.currentRoundIndex >= rounds.length) {
        this.endLevel()
        return
      }
      this.clearRoundCards()
      this.time.delayedCall(300, () => {
        this.buildRound()
        this.showCurrentRound()
      })
    })
  }

  private clearRoundCards() {
    this.toggleCards.forEach(c => c.container.destroy())
    this.toggleCards = []
    this.delayedRiskTimer?.destroy()
    this.delayedRiskTimer = undefined
  }

  private endLevel() {
    this.phase = 'level-complete'
    this.gameEnded = true
    this.timerActive = false
    this.timerTween?.stop()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.delayedRiskTimer?.destroy()

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
  //  TELAS DE FEEDBACK DE NÍVEL (padrão EF02CO01/EF02CO04)
  // ══════════════════════════════════════════════════════════════════════════

  private showMissionCompleteEffect(nextInstruction: string | null, onDone: () => void) {
    if (this.missionEffectActive) return
    this.missionEffectActive = true

    const wasTimerActive = this.timerActive
    this.timerActive = false
    this.timerTween?.pause()

    const resume = () => {
      this.missionEffectActive = false
      if (wasTimerActive) {
        this.timerActive = true
        this.timerTween?.resume()
      }
      onDone()
    }

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56)
      .setDepth(200).setInteractive()

    const modal = this.add.container(640, 360).setDepth(201)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -126, 540, nextInstruction ? 270 : 210, 28)

    const cardH = nextInstruction ? 258 : 198
    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -138, 556, cardH, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -138, 556, cardH, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x42d640, 1)
    topBar.fillRoundedRect(-196, -154, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -154, 392, 28, 14)

    const title = this.add.text(0, -76, 'Configuração validada!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '32px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const objs: Phaser.GameObjects.GameObject[] = [shadow, bg, topBar, title]

    if (nextInstruction) {
      const nextLabel = this.add.text(0, -14, 'Próximo desafio:', {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '17px', color: '#f57c00',
      }).setOrigin(0.5).setResolution(2)

      const nextTxt = this.add.text(0, 42, nextInstruction, {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '20px', color: '#3b3b3b',
        align: 'center', wordWrap: { width: 460 },
      }).setOrigin(0.5).setResolution(2)

      objs.push(nextLabel, nextTxt)
    }

    modal.add(objs)
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.time.delayedCall(nextInstruction ? 2400 : 1800, () => {
      this.tweens.add({
        targets: [overlay, modal], alpha: 0, duration: 280,
        onComplete: () => { overlay.destroy(); modal.destroy(); resume() },
      })
    })
  }

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3 | null) {
    this.timerActive = false
    this.timerTween?.stop()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
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
      1: 'Você ativou as proteções básicas do dispositivo!',
      2: 'Você corrigiu configurações arriscadas escondidas!',
      3: 'Você reagiu rápido aos riscos durante o jogo online!',
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

    const info = this.getLevelInfo(lvl)
    const objective = this.add.text(0, -42, info.objective, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '24px', color: '#f57c00',
      align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const detail = this.add.text(0, 12, info.tip, {
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
      this.startTimer()
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

    const subtitle = this.add.text(0, -74, 'Você se tornou um Jogador Seguro de verdade!', {
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

  private showGameOverScreen(reason: 'timeout' | 'wrong-answer' = 'timeout') {
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

    const reasonMsg = reason === 'timeout' ? 'O tempo acabou!' : 'Configuração incorreta!'
    const reasonTxt = this.add.text(0, 6, reasonMsg, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '22px', color: '#ef4444',
    }).setOrigin(0.5).setResolution(2)

    const total = this.levelConfig.rounds.length

    const statsTxt = this.add.text(0, 52, `${this.currentRoundIndex} de ${total} checklists concluídos`, {
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

  private getLevelInfo(lvl: number): { objective: string; tip: string } {
    const config = LEVELS.find(l => l.level === lvl)
    return {
      objective: config?.objective ?? '',
      tip: config?.tip ?? '',
    }
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
  private playAlert()  {
    this.playTone(740, 0.10, 'square', 0.18)
    this.time.delayedCall(140, () => this.playTone(740, 0.10, 'square', 0.18))
  }
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
