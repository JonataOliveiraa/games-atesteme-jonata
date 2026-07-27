import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { LevelConfig, MazeChallenge } from '../types'
import { LEVELS } from '../data/levels'
import { CONDITION_LABELS, simulate, conditionHolds } from '../data/conditions'

const GAME_ID = 'labirinto-do-enquanto'
const MAX_CONSECUTIVE_ERRORS = 3
const TILE = 120
const GRID_Y = 488
const BLOCK_Y = 140
const BLOCK_H = 88

type RoundPhase = 'intro' | 'choosing' | 'predicting' | 'stepping' | 'step-predict' | 'running' | 'level-complete'

export class GameScene extends Phaser.Scene {

  private levelConfig!: LevelConfig
  private currentChallengeIndex = 0
  private hits   = 0
  private errors = 0
  private consecutiveErrors = 0
  private currentPoints = 0
  private currentLives  = 1
  private isMuted = false
  private phase: RoundPhase = 'intro'
  private gameEnded = false
  private shouldShowLevelStart = false

  private selectedConditionId: string | null = null
  private predictedCol: number | null = null
  private currentRobotCol = 0
  private robot?: Phaser.GameObjects.Image
  private gridTiles: Phaser.GameObjects.Zone[] = []
  private predictMarker?: Phaser.GameObjects.Text
  private conditionLabel?: Phaser.GameObjects.Text
  private executeBtn?: Phaser.GameObjects.Container
  private executeBtnText?: Phaser.GameObjects.Text
  private stepCountText?: Phaser.GameObjects.Text
  private stepPredictBtns: Phaser.GameObjects.Container[] = []
  private optionCards: Phaser.GameObjects.Container[] = []
  private challengeRoot?: Phaser.GameObjects.Container
  private conditionCheckOverlay?: Phaser.GameObjects.Rectangle

  private overlayObjects: Phaser.GameObjects.GameObject[] = []
  private unsubPlatform?: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number; showLevelStart?: boolean }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig           = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.currentChallengeIndex = 0
    this.hits                  = 0
    this.errors                = 0
    this.consecutiveErrors     = 0
    this.currentPoints         = data?.points ?? 0
    this.currentLives          = data?.lives  ?? 1
    this.isMuted               = false
    this.phase                 = 'intro'
    this.gameEnded             = false
    this.shouldShowLevelStart  = data?.showLevelStart ?? false
    this.selectedConditionId   = null
    this.predictedCol          = null
    this.currentRobotCol       = 0
    this.gridTiles             = []
    this.stepCountText         = undefined
    this.stepPredictBtns       = []
    this.optionCards           = []
    this.overlayObjects        = []
    this.conditionCheckOverlay = undefined
  }

  create() {
    this.drawBackground()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)
    EventBus.on('show-tutorial', this.showTutorialOverlay, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMissionState()
    this.emitCheckpoint()

    this.buildExecuteButton()

    if (this.shouldShowLevelStart && this.levelConfig.level > 1) {
      this.showNextLevelStartScreen()
    } else {
      this.startChallenge()
      if (this.levelConfig.level === 1) this.showTutorialOverlay()
    }
  }

  update() {}

  shutdown() {
    this.clearOverlay()
    this.clearStepPredictButtons()
    EventBus.off('mute-audio', undefined, this)
    EventBus.off('show-tutorial', undefined, this)
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
  //  BROADCAST PARA UISCENE
  // ══════════════════════════════════════════════════════════════════════════

  private broadcastMissionState() {
    EventBus.emit('mission-update', {
      instruction: this.levelConfig.title,
      hint: this.levelConfig.tip,
      missionIndex:  this.currentChallengeIndex,
      totalMissions: this.levelConfig.challenges.length,
      level:         this.levelConfig.level,
    })
  }

  private emitCheckpoint() {
    const progress = Math.round((this.currentChallengeIndex / this.levelConfig.challenges.length) * 100)
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
    this.add.rectangle(640, 360, 1280, 720, 0x0d1b2a).setDepth(-2)
    const bg = this.add.image(640, 360, 'wallpaper').setDepth(-1)
    const scale = Math.max(1280 / bg.width, 720 / bg.height)
    bg.setScale(scale)
    // Dark tint so drawn elements have good contrast
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.32).setDepth(-1)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BLOCO "ENQUANTO" + GRID
  // ══════════════════════════════════════════════════════════════════════════

  private startChallenge() {
    this.challengeRoot?.destroy()
    this.challengeRoot = this.add.container(0, 0)
    this.conditionCheckOverlay?.destroy()
    this.conditionCheckOverlay = undefined
    this.robot = undefined   // cleared with challengeRoot; will be rebuilt
    this.gridTiles = []
    this.optionCards = []
    this.selectedConditionId = null
    this.predictedCol = null
    this.currentRobotCol = 0

    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]

    this.buildWhileBlock(challenge)
    this.buildGrid(challenge)

    if (challenge.conditionOptions) {
      this.phase = 'choosing'
      this.stepCountText?.setAlpha(0)
      this.clearStepPredictButtons()
      this.executeBtn?.setVisible(true)
      this.buildConditionOptions(challenge)
      this.setExecuteEnabled(false)
    } else if (challenge.predictMode) {
      this.phase = 'predicting'
      this.stepCountText?.setAlpha(0)
      this.clearStepPredictButtons()
      this.executeBtn?.setVisible(true)
      this.selectedConditionId = challenge.fixedConditionId ?? 'path_clear'
      this.enableGridPrediction(challenge)
      this.setExecuteEnabled(false)
    } else if (challenge.stepPredictMode) {
      this.phase = 'step-predict'
      this.selectedConditionId = challenge.fixedConditionId ?? 'path_clear'
      this.currentRobotCol = 0
      this.executeBtn?.setVisible(false)
      this.stepCountText?.setAlpha(1).setText('Passo  0')
      this.buildStepPredictButtons()
    } else {
      this.phase = 'stepping'
      this.selectedConditionId = challenge.fixedConditionId ?? 'path_clear'
      this.currentRobotCol = 0
      this.clearStepPredictButtons()
      this.executeBtn?.setVisible(true)
      this.executeBtnText?.setText('▶ Verificar Condição')
      this.setExecuteEnabled(true)
      this.stepCountText?.setAlpha(1).setText('Passo  0')
    }

    // Phase instruction inline (below while-block)
    const phaseHint =
      this.phase === 'choosing'      ? '👆  Escolha a condição que vai parar o robô no objetivo ⭐' :
      this.phase === 'predicting'    ? '🔮  Toque no quadrado onde o robô vai parar' :
      this.phase === 'step-predict'  ? '💭  A condição é VERDADEIRA ou FALSA agora? Decida!' :
      '👀  Clique em "Verificar Condição" a cada passo — veja o laço ENQUANTO em ação!'
    const phaseLabel = this.add.text(640, BLOCK_Y + BLOCK_H / 2 + 26, phaseHint, {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', color: '#e2e8f0',
      stroke: '#0d1b2a', strokeThickness: 4, align: 'center',
      wordWrap: { width: 860 },
    }).setOrigin(0.5).setDepth(5).setResolution(2)
    this.challengeRoot?.add(phaseLabel)

    this.updateConditionLabel()
    this.broadcastMissionState()
  }

  private buildWhileBlock(challenge: MazeChallenge) {
    const BL = 190, BT = BLOCK_Y - BLOCK_H / 2

    // ── PNG panel backgrounds ──────────────────────────────────────────────
    // keyword: x 190–350 (width 160, center 270)
    const kwImg = this.add.image(270, BLOCK_Y, 'block-keyword')
      .setDisplaySize(160, BLOCK_H).setOrigin(0.5).setDepth(3)
    // condition: x 350–710 (width 360, center 530)
    const condImg = this.add.image(530, BLOCK_Y, 'block-condition')
      .setDisplaySize(360, BLOCK_H).setOrigin(0.5).setDepth(3)
    // action: x 710–1090 (width 380, center 900)
    const actImg = this.add.image(900, BLOCK_Y, 'block-action')
      .setDisplaySize(380, BLOCK_H).setOrigin(0.5).setDepth(3)

    // ── Outer frame ───────────────────────────────────────────────────────
    const frame = this.add.graphics().setDepth(4)
    frame.lineStyle(2, 0x4FC3F7, 0.55)
    frame.strokeRoundedRect(BL, BT, 900, BLOCK_H, 16)

    // ── KEYWORD text ──────────────────────────────────────────────────────
    const kwIcon = this.add.text(270, BLOCK_Y - 16, '🔁', { fontSize: '28px' })
      .setOrigin(0.5).setDepth(5)
    const kwLabel = this.add.text(270, BLOCK_Y + 18, 'ENQUANTO', {
      fontFamily: 'Arial Black, Arial', fontSize: '16px', color: '#e0f2fe',
      stroke: '#0a1628', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5).setResolution(2)

    // ── Dividers ──────────────────────────────────────────────────────────
    const div1 = this.add.graphics().setDepth(5)
    div1.lineStyle(2, 0x4FC3F7, 0.35)
    div1.lineBetween(350, BT + 8, 350, BT + BLOCK_H - 8)

    // ── CONDITION text ────────────────────────────────────────────────────
    const condMiniLabel = this.add.text(364, BT + 7, 'CONDIÇÃO', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '13px', color: '#fbbf24',
      stroke: '#0d1b2a', strokeThickness: 2,
    }).setDepth(5).setResolution(2)

    const hasFixed = !!challenge.fixedConditionId
    this.conditionLabel = this.add.text(530, BLOCK_Y + 8, hasFixed
      ? CONDITION_LABELS[challenge.fixedConditionId!]
      : '▼ Escolha abaixo', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '18px', color: hasFixed ? '#fef3c7' : '#f59e0b',
      align: 'center', wordWrap: { width: 334 },
    }).setOrigin(0.5).setDepth(5).setResolution(2)

    // ── Separator arrow ───────────────────────────────────────────────────
    const div2 = this.add.graphics().setDepth(5)
    div2.lineStyle(2, 0x4FC3F7, 0.35)
    div2.lineBetween(710, BT + 8, 710, BT + BLOCK_H - 8)

    const arrowTxt = this.add.text(730, BLOCK_Y, '▶', {
      fontSize: '22px', color: '#64748b',
    }).setOrigin(0.5).setDepth(5)

    // ── ACTION text ───────────────────────────────────────────────────────
    const actMiniLabel = this.add.text(768, BT + 7, 'AÇÃO', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '13px', color: '#4ade80',
      stroke: '#021a08', strokeThickness: 2,
    }).setDepth(5).setResolution(2)

    const actLabel = this.add.text(910, BLOCK_Y + 8, '▶ Mover para frente', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '18px', color: '#dcfce7',
      stroke: '#021a08', strokeThickness: 2,
      align: 'center', wordWrap: { width: 300 },
    }).setOrigin(0.5).setDepth(5).setResolution(2)

    const loopIco = this.add.text(1082, BT + 4, '↺', {
      fontSize: '26px', color: '#4FC3F7',
    }).setOrigin(1, 0).setDepth(5)

    this.challengeRoot?.add([
      kwImg, condImg, actImg, frame,
      kwIcon, kwLabel, div1,
      condMiniLabel, this.conditionLabel,
      div2, arrowTxt,
      actMiniLabel, actLabel, loopIco,
    ])

    this.conditionCheckOverlay = this.add.rectangle(530, BLOCK_Y, 360, BLOCK_H, 0x000000, 0)
      .setDepth(6)
  }

  private updateConditionLabel() {
    if (!this.conditionLabel) return
    if (this.selectedConditionId) {
      this.conditionLabel.setText(CONDITION_LABELS[this.selectedConditionId]).setColor('#fef3c7')
    } else {
      this.conditionLabel.setText('▼ Escolha abaixo').setColor('#f59e0b')
    }
  }

  private buildGrid(challenge: MazeChallenge) {
    const totalW = challenge.corridorLength * TILE
    const startX = 640 - totalW / 2 + TILE / 2

    // Corridor backing strip
    const strip = this.add.graphics().setDepth(2)
    strip.fillStyle(0x1e3a5f, 0.55)
    strip.fillRoundedRect(startX - TILE / 2 - 8, GRID_Y - TILE / 2 - 8, totalW + 16, TILE + 16, 18)
    strip.lineStyle(2, 0x4fc3f7, 0.20)
    strip.strokeRoundedRect(startX - TILE / 2 - 8, GRID_Y - TILE / 2 - 8, totalW + 16, TILE + 16, 18)
    this.challengeRoot?.add(strip)

    for (let col = 0; col < challenge.corridorLength; col++) {
      const x = startX + col * TILE
      const isWall  = challenge.walls.includes(col)
      const isGoal  = !challenge.predictMode && (challenge.goalCol !== undefined) && challenge.goalCol === col
      const S = TILE - 8   // 112px inner tile

      const gfx = this.add.graphics().setDepth(3)

      if (isWall) {
        gfx.fillStyle(0x7f1d1d, 1)
        gfx.fillRoundedRect(x - S / 2, GRID_Y - S / 2, S, S, 12)
        gfx.lineStyle(3, 0x991b1b, 1)
        gfx.strokeRoundedRect(x - S / 2, GRID_Y - S / 2, S, S, 12)
        // brick texture lines
        gfx.lineStyle(1.5, 0xfca5a5, 0.22)
        gfx.lineBetween(x - S / 2 + 8, GRID_Y, x + S / 2 - 8, GRID_Y)
        gfx.lineBetween(x, GRID_Y - S / 2 + 8, x, GRID_Y - 8)
        const wallTxt = this.add.text(x, GRID_Y, '🧱', { fontSize: '32px' })
          .setOrigin(0.5).setDepth(4).setResolution(2)
        this.challengeRoot?.add(wallTxt)
      } else if (isGoal) {
        gfx.fillStyle(0x14532d, 1)
        gfx.fillRoundedRect(x - S / 2, GRID_Y - S / 2, S, S, 12)
        gfx.lineStyle(3, 0x4ade80, 1)
        gfx.strokeRoundedRect(x - S / 2, GRID_Y - S / 2, S, S, 12)
        gfx.fillStyle(0x86efac, 0.30)
        gfx.fillCircle(x, GRID_Y - 8, 32)
        const goalTxt = this.add.text(x, GRID_Y - 10, '⭐', { fontSize: '36px' })
          .setOrigin(0.5).setDepth(4).setResolution(2)
        const goalLbl = this.add.text(x, GRID_Y + S / 2 - 18, 'Objetivo', {
          fontFamily: 'Arial Black, Arial', fontSize: '12px', color: '#4ade80',
        }).setOrigin(0.5).setDepth(4).setResolution(2)
        this.challengeRoot?.add(goalTxt)
        this.challengeRoot?.add(goalLbl)
      } else {
        gfx.fillStyle(0x1e3a5f, 0.80)
        gfx.fillRoundedRect(x - S / 2, GRID_Y - S / 2, S, S, 12)
        gfx.lineStyle(1.5, 0x4fc3f7, 0.25)
        gfx.strokeRoundedRect(x - S / 2, GRID_Y - S / 2, S, S, 12)
      }

      this.challengeRoot?.add(gfx)

      // Invisible zone for interactivity
      const zone = this.add.zone(x, GRID_Y, TILE, TILE).setDepth(5).setData('col', col)
      this.challengeRoot?.add(zone)
      this.gridTiles.push(zone)
    }

    // Robot PNG at start position
    this.robot = this.buildRobot(startX, GRID_Y)
    this.challengeRoot?.add(this.robot)
  }

  private buildRobot(x: number, y: number): Phaser.GameObjects.Image {
    return this.add.image(x, y, 'robot-idle')
      .setScale(0.20)
      .setDepth(8)
      .setOrigin(0.5, 0.5)
  }

  private enableGridPrediction(challenge: MazeChallenge) {
    this.predictMarker = this.add.text(0, GRID_Y - 80, '❓', { fontSize: '38px' })
      .setOrigin(0.5).setAlpha(0).setDepth(6).setResolution(2)
    this.challengeRoot?.add(this.predictMarker)

    const totalW = challenge.corridorLength * TILE
    const startX = 640 - totalW / 2 + TILE / 2

    this.gridTiles.forEach((zone, col) => {
      zone.setInteractive({ useHandCursor: true })
      zone.on('pointerdown', () => {
        if (this.phase !== 'predicting') return
        this.predictedCol = col
        this.predictMarker?.setPosition(startX + col * TILE, GRID_Y - 80).setAlpha(1)
        this.setExecuteEnabled(true)
        this.playTick()
      })
    })
  }

  private buildConditionOptions(challenge: MazeChallenge) {
    const options = challenge.conditionOptions ?? []
    const cardW = 310, cardH = 108, gap = 20
    const totalW = options.length * cardW + (options.length - 1) * gap
    const startX = 640 - totalW / 2 + cardW / 2

    options.forEach((condId, i) => {
      const x = startX + i * (cardW + gap)
      const y = 305

      const card = this.add.container(x, y)
      const bg = this.add.graphics()
      bg.fillStyle(0x0f172a, 0.90)
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18)
      bg.lineStyle(3, 0x4fc3f7, 0.75)
      bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18)
      const label = this.add.text(0, 0, CONDITION_LABELS[condId], {
        fontFamily: 'Arial Black, Arial', fontSize: '19px', color: '#e0f2fe',
        stroke: '#0d1b2a', strokeThickness: 3,
        align: 'center', wordWrap: { width: cardW - 28 },
      }).setOrigin(0.5).setResolution(2)

      card.add([bg, label])
      card.setSize(cardW, cardH)
      card.setData('bg', bg)
      card.setData('conditionId', condId)
      card.setInteractive({ useHandCursor: true })
      card.on('pointerdown', () => this.selectCondition(condId))

      this.challengeRoot?.add(card)
      this.optionCards.push(card)
    })
  }

  private selectCondition(condId: string) {
    if (this.phase !== 'choosing') return
    this.selectedConditionId = condId
    this.updateConditionLabel()
    this.playTick()

    this.optionCards.forEach(card => {
      const bg = card.getData('bg') as Phaser.GameObjects.Graphics
      const isSelected = card.getData('conditionId') === condId
      bg.clear()
      bg.fillStyle(isSelected ? 0x14532d : 0x0f172a, isSelected ? 1 : 0.90)
      bg.fillRoundedRect(-155, -54, 310, 108, 18)
      bg.lineStyle(isSelected ? 4 : 3, isSelected ? 0x4ade80 : 0x4fc3f7, isSelected ? 1 : 0.75)
      bg.strokeRoundedRect(-155, -54, 310, 108, 18)
    })

    this.setExecuteEnabled(true)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP-PREDICT MODE (NÍVEL 1)
  // ══════════════════════════════════════════════════════════════════════════

  private clearStepPredictButtons() {
    this.stepPredictBtns.forEach(b => b.destroy())
    this.stepPredictBtns = []
  }

  private buildStepPredictButtons() {
    this.clearStepPredictButtons()
    const BTN_W = 460, BTN_H = 92, GAP = 20
    const centerX = 640, y = 634

    const makeBtn = (xOffset: number, label: string, sub: string, color: number, answer: boolean) => {
      const btn = this.add.container(centerX + xOffset, y).setDepth(6)
      const bg = this.add.graphics()
      bg.fillStyle(color, 1)
      bg.fillRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 22)
      bg.lineStyle(4, 0xffffff, 0.9)
      bg.strokeRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 22)
      const title = this.add.text(0, -14, label, {
        fontFamily: 'Arial Black, Arial', fontSize: '24px', color: '#ffffff',
        stroke: '#00000088', strokeThickness: 3,
      }).setOrigin(0.5).setResolution(2)
      const desc = this.add.text(0, 18, sub, {
        fontFamily: 'Arial, Arial', fontSize: '17px', color: '#ffffffcc',
        stroke: '#00000066', strokeThickness: 2,
      }).setOrigin(0.5).setResolution(2)
      btn.add([bg, title, desc])
      btn.setSize(BTN_W, BTN_H)
      btn.setData('bg', bg)
      btn.setInteractive({ useHandCursor: true })
      btn.on('pointerover', () => { bg.clear(); bg.fillStyle(color, 0.85); bg.fillRoundedRect(-BTN_W/2,-BTN_H/2,BTN_W,BTN_H,22) })
      btn.on('pointerout',  () => { bg.clear(); bg.fillStyle(color, 1);    bg.fillRoundedRect(-BTN_W/2,-BTN_H/2,BTN_W,BTN_H,22); bg.lineStyle(4,0xffffff,0.9); bg.strokeRoundedRect(-BTN_W/2,-BTN_H/2,BTN_W,BTN_H,22) })
      btn.on('pointerdown', () => this.handleStepPrediction(answer))
      return btn
    }

    const half = BTN_W / 2 + GAP / 2
    const trueBtn  = makeBtn(-half, '✅ VERDADEIRA', 'O robô avança!',   0x15803d, true)
    const falseBtn = makeBtn( half, '❌ FALSA',      'O robô para aqui!', 0xb91c1c, false)
    this.stepPredictBtns = [trueBtn, falseBtn]
  }

  private handleStepPrediction(predicted: boolean) {
    if (this.phase !== 'step-predict' || this.gameEnded) return

    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    const goalCol   = challenge.goalCol ?? -1
    const isTrue    = conditionHolds(this.selectedConditionId!, {
      col:             this.currentRobotCol,
      goalCol,
      walls:           challenge.walls,
      corridorLength:  challenge.corridorLength,
      stepsTaken:      this.currentRobotCol,
    })

    // Disable buttons during feedback
    this.stepPredictBtns.forEach(b => b.disableInteractive())
    this.phase = 'running'

    const correct = predicted === isTrue

    if (correct) {
      // ── Resposta correta ─────────────────────────────────────────────────
      this.hits++
      this.consecutiveErrors = 0
      this.playTick()

      this.flashCondition(isTrue, () => {
        const totalW = challenge.corridorLength * TILE
        const startX = 640 - totalW / 2 + TILE / 2

        if (isTrue) {
          // Condição verdadeira → robô avança um passo
          this.currentRobotCol++
          this.stepCountText?.setText(`Passo  ${this.currentRobotCol}`)
          this.tweens.add({
            targets: this.robot,
            x: startX + this.currentRobotCol * TILE,
            y: GRID_Y - 8,
            duration: 260, ease: 'Sine.easeInOut',
            onComplete: () => {
              this.tweens.add({ targets: this.robot, y: GRID_Y, duration: 120 })
              this.time.delayedCall(200, () => {
                this.phase = 'step-predict'
                this.stepPredictBtns.forEach(b => b.setInteractive({ useHandCursor: true }))
              })
            },
          })
        } else {
          // Condição falsa → robô para aqui
          this.robot?.setTexture(this.currentRobotCol === goalCol ? 'robot-happy' : 'robot-bump')
          const success = this.currentRobotCol === goalCol
          this.time.delayedCall(200, () => {
            if (success) {
              this.playCorrect()
              this.showResultPanel(true, false, '✅ Perfeito! Você identificou quando o laço para!')
            } else {
              this.showResultPanel(false, false, '⚠️ O robô parou antes do objetivo. Tente novamente!')
            }
            this.time.delayedCall(1800, () => {
              this.robot?.setTexture('robot-idle')
              this.advanceChallenge()
            })
          })
        }
      })

    } else {
      // ── Resposta errada → feedback + reinicia desafio ────────────────────
      this.errors++
      this.consecutiveErrors++
      this.playError()

      const msg = isTrue
        ? '❌ Era VERDADEIRA — o robô deveria avançar!'
        : '❌ Era FALSA — o robô deveria parar aqui!'

      this.showResultPanel(false, false, msg)
      runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.levelConfig.level })
      this.emitCheckpoint()

      this.time.delayedCall(2000, () => {
        this.robot?.setTexture('robot-idle')
        if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          this.onTooManyErrors()
        } else {
          this.startChallenge()   // reinicia o desafio desde o col 0
        }
      })
    }
  }

  private buildExecuteButton() {
    this.executeBtn = this.add.container(640, 632).setDepth(5)
    const bg = this.add.graphics()
    bg.fillStyle(0x42d640, 1)
    bg.fillRoundedRect(-168, -32, 336, 64, 32)
    bg.lineStyle(4, 0xffffff, 1)
    bg.strokeRoundedRect(-168, -32, 336, 64, 32)
    this.executeBtnText = this.add.text(0, 0, '▶  Executar', {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', color: '#ffffff',
      stroke: '#1b7d1c', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    this.executeBtn.add([bg, this.executeBtnText])
    this.executeBtn.setSize(336, 72)
    this.executeBtn.setData('bg', bg)
    this.executeBtn.on('pointerdown', () => {
      if (this.phase === 'stepping') this.executeOneStep()
      else this.executeChallenge()
    })
    this.setExecuteEnabled(false)

    // Step counter — shown only during L1 stepping
    this.stepCountText = this.add.text(246, 632, 'Passo  0', {
      fontFamily: 'Arial Black, Arial', fontSize: '19px', color: '#e0f2fe',
      stroke: '#0d1b2a', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5).setAlpha(0).setResolution(2)
  }

  private setExecuteEnabled(enabled: boolean) {
    if (!this.executeBtn) return
    const bg = this.executeBtn.getData('bg') as Phaser.GameObjects.Graphics
    bg.clear()
    bg.fillStyle(enabled ? 0x42d640 : 0x334155, 1)
    bg.fillRoundedRect(-168, -32, 336, 64, 32)
    bg.lineStyle(4, 0xffffff, enabled ? 1 : 0.5)
    bg.strokeRoundedRect(-168, -32, 336, 64, 32)
    if (enabled) this.executeBtn.setInteractive({ useHandCursor: true })
    else this.executeBtn.disableInteractive()
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  EXECUÇÃO DA SIMULAÇÃO
  // ══════════════════════════════════════════════════════════════════════════

  private executeOneStep() {
    if (this.gameEnded) return
    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    const totalW = challenge.corridorLength * TILE
    const startX = 640 - totalW / 2 + TILE / 2
    const nextCol = this.currentRobotCol + 1
    const pathClear = nextCol < challenge.corridorLength && !challenge.walls.includes(nextCol)

    this.phase = 'running'
    this.setExecuteEnabled(false)

    // Thought bubble above robot before condition flash
    this.showThoughtBubble(pathClear)

    this.time.delayedCall(380, () => {
      this.flashCondition(pathClear, () => {
        if (pathClear) {
          this.currentRobotCol = nextCol
          this.stepCountText?.setText(`Passo  ${this.currentRobotCol}`)
          this.tweens.add({
            targets: this.robot,
            x: startX + nextCol * TILE,
            duration: 260,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              if (this.currentRobotCol === challenge.goalCol) {
                this.robot?.setTexture('robot-happy')
                this.hits++
                this.consecutiveErrors = 0
                this.playCorrect()
                runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: 10, stage: this.levelConfig.level })
                this.emitCheckpoint()
                this.showResultPanel(true, false)
                this.time.delayedCall(1700, () => this.advanceChallenge())
              } else {
                this.phase = 'stepping'
                this.executeBtnText?.setText('▶ Verificar Condição')
                this.setExecuteEnabled(true)
              }
            },
          })
        } else {
          // Condition false — robot stays, shake animation
          this.robot?.setTexture('robot-bump')
          if (this.robot) {
            this.tweens.add({ targets: this.robot, x: this.robot.x - 7, duration: 45, yoyo: true, repeat: 3,
              onComplete: () => {
                this.time.delayedCall(500, () => this.robot?.setTexture('robot-idle'))
              },
            })
          }

          const correct = this.currentRobotCol === challenge.goalCol
          if (correct) {
            this.robot?.setTexture('robot-happy')
            this.hits++
            this.consecutiveErrors = 0
            this.playCorrect()
            runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: 10, stage: this.levelConfig.level })
            this.emitCheckpoint()
            this.showResultPanel(true, false)
            this.time.delayedCall(1700, () => this.advanceChallenge())
          } else {
            this.errors++
            this.consecutiveErrors++
            this.playError()
            runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.levelConfig.level })
            this.emitCheckpoint()
            const hitWall = challenge.walls.includes(nextCol)
            const msg = hitWall
              ? '💥 Parede à frente! O robô não avançou — recomeça do início.'
              : '⚠️ O corredor acabou antes do objetivo — tente novamente!'
            this.showResultPanel(false, hitWall, msg)

            if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              this.time.delayedCall(1900, () => this.onTooManyErrors())
            } else {
              this.time.delayedCall(2300, () => {
                this.robot?.setTexture('robot-idle')
                this.startChallenge()
              })
            }
          }
        }
      })
    })
  }

  private showThoughtBubble(pathClear: boolean) {
    if (!this.robot) return
    const x = this.robot.x
    const y = GRID_Y - 90
    const label = pathClear ? 'Caminho livre? ✅' : 'Caminho livre? ❌'
    const bubble = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '15px',
      color: pathClear ? '#dcfce7' : '#fecaca',
      backgroundColor: pathClear ? '#166534' : '#7f1d1d',
      padding: { x: 10, y: 5 },
      stroke: '#0d1b2a', strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(12).setAlpha(0).setResolution(2)

    this.tweens.add({
      targets: bubble, alpha: 1, y: y - 10,
      duration: 180, ease: 'Sine.Out',
      onComplete: () => {
        this.time.delayedCall(220, () => {
          this.tweens.add({ targets: bubble, alpha: 0, duration: 160, onComplete: () => bubble.destroy() })
        })
      },
    })
  }

  private executeChallenge() {
    if (!this.selectedConditionId) return
    this.phase = 'running'
    this.executeBtn?.disableInteractive()
    this.optionCards.forEach(c => c.disableInteractive())
    this.gridTiles.forEach(t => t.disableInteractive())

    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    const result = simulate(challenge, this.selectedConditionId)

    const totalW = challenge.corridorLength * TILE
    const startX = 640 - totalW / 2 + TILE / 2
    const MOVE_DUR = 260

    let stepIdx = 0

    const animateStep = () => {
      if (stepIdx >= result.path.length) {
        // Final check: condition is now false — flash red then finish
        this.flashCondition(false, () => this.finishExecution(challenge, result))
        return
      }
      // Check condition → flash green → move one step
      this.flashCondition(true, () => {
        if (!this.robot) return
        const col = result.path[stepIdx]
        // Subtle y-bob during movement (no scale distortion)
        this.tweens.add({ targets: this.robot, y: GRID_Y - 8, duration: MOVE_DUR / 2, yoyo: true, ease: 'Sine.easeInOut' })
        this.tweens.add({
          targets: this.robot, x: startX + col * TILE,
          duration: MOVE_DUR, ease: 'Sine.easeInOut',
          onComplete: () => {
            stepIdx++
            this.time.delayedCall(40, animateStep)
          },
        })
      })
    }

    animateStep()
  }

  private flashCondition(isTrue: boolean, onDone: () => void) {
    const overlay = this.conditionCheckOverlay
    if (!overlay || !overlay.active) { onDone(); return }

    overlay.setFillStyle(isTrue ? 0x22c55e : 0xef4444).setAlpha(0.70)
    this.tweens.add({ targets: overlay, alpha: 0, duration: 420, ease: 'Sine.In' })

    // Bigger ✅/❌ badge, more prominent
    const badge = this.add.text(748, BLOCK_Y, isTrue ? '✅' : '❌', {
      fontSize: '34px',
    }).setOrigin(0.5).setDepth(10).setAlpha(0).setResolution(2)
    this.tweens.add({
      targets: badge, alpha: { from: 0, to: 1 },
      duration: 110, yoyo: true, hold: 180,
      onComplete: () => badge.destroy(),
    })

    this.time.delayedCall(460, onDone)
  }

  private finishExecution(challenge: MazeChallenge, result: { finalCol: number; crashed: boolean }) {
    if (this.robot) this.tweens.add({ targets: this.robot, y: GRID_Y, duration: 80 })

    let correct: boolean
    if (challenge.predictMode) {
      correct = this.predictedCol === result.finalCol && !result.crashed
    } else {
      correct = !result.crashed && result.finalCol === challenge.goalCol
    }

    if (result.crashed && this.robot) {
      this.robot.setTexture('robot-bump')
      this.tweens.add({ targets: this.robot, x: this.robot.x - 8, duration: 60, yoyo: true, repeat: 4, ease: 'Power2' })
      this.cameras.main.flash(150, 239, 68, 68)
    } else if (correct) {
      this.robot?.setTexture('robot-happy')
    }

    this.showResultPanel(correct, result.crashed)

    if (correct) {
      this.hits++
      this.consecutiveErrors = 0
      this.playCorrect()
      this.time.delayedCall(1700, () => this.advanceChallenge())
    } else {
      this.errors++
      this.consecutiveErrors++
      this.playError()
      runtimeGameBridge.emit({
        type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.levelConfig.level,
      })
      this.emitCheckpoint()

      if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        this.time.delayedCall(1900, () => this.onTooManyErrors())
      } else {
        this.time.delayedCall(2200, () => {
          this.robot?.setTexture('robot-idle')
          this.startChallenge()
        })
      }
    }
  }

  private showResultPanel(correct: boolean, crashed: boolean, customMsg?: string) {
    const panel = this.addOverlayObject(this.add.container(640, 250).setDepth(70))
    const bg = this.add.graphics()
    bg.fillStyle(correct ? 0x1b5e20 : 0x7f0000, 0.95)
    bg.fillRoundedRect(-280, -38, 560, 76, 18)
    bg.lineStyle(3, 0xffffff, 0.9)
    bg.strokeRoundedRect(-280, -38, 560, 76, 18)
    const msg = customMsg ?? (correct
      ? '✅ O robô parou no lugar certo!'
      : crashed
        ? '💥 O robô bateu em uma parede!'
        : '⚠️ O robô não parou no lugar certo.')
    const txt = this.add.text(0, 0, msg, {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: '#ffffff',
      align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)
    panel.add([bg, txt])
    panel.setAlpha(0).setScale(0.9)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.Out' })

    this.time.delayedCall(1900, () => {
      this.tweens.add({ targets: panel, alpha: 0, duration: 260, onComplete: () => panel.destroy() })
    })
  }

  private advanceChallenge() {
    this.currentChallengeIndex++
    if (this.currentChallengeIndex >= this.levelConfig.challenges.length) {
      this.endLevel()
      return
    }
    this.startChallenge()
  }

  private onTooManyErrors() {
    if (this.gameEnded) return
    this.gameEnded = true
    this.showGameOverScreen()
  }

  private endLevel() {
    this.phase = 'level-complete'
    this.gameEnded = true
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
      this.add.rectangle(640, 360, 1280, 720, 0x1a2340, 0.56).setDepth(450)
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
      fontSize: '40px', color: '#1a2340',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const completed = this.add.text(0, -50, 'Nível concluído', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#f57c00',
      align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setResolution(2)

    const successTexts: Record<number, string> = {
      1: 'Você viu a condição ser verificada antes de cada passo!',
      2: 'Você escolheu a condição certa para controlar o laço!',
      3: 'Você previu onde a condição falsa iria parar o robô!',
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
      fontSize: '15px', color: '#1a2340',
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

  private showTutorialOverlay() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.70)
      .setDepth(200).setInteractive()

    const modal = this.add.container(640, 360).setDepth(201)
    const W = 560, H = 420

    const modalShadow = this.add.graphics()
    modalShadow.fillStyle(0x000000, 0.22)
    modalShadow.fillRoundedRect(-W / 2 + 7, -H / 2 + 9, W, H, 28)

    const modalBg = this.add.graphics()
    modalBg.fillStyle(0xf0f9ff, 1)
    modalBg.fillRoundedRect(-W / 2, -H / 2, W, H, 28)
    modalBg.lineStyle(5, 0xffffff, 0.95)
    modalBg.strokeRoundedRect(-W / 2, -H / 2, W, H, 28)

    const header = this.add.graphics()
    header.fillStyle(0x1e3a5f, 1)
    header.fillRoundedRect(-W / 2, -H / 2, W, 58, 28)
    header.fillRect(-W / 2, -H / 2 + 30, W, 28)

    const headerText = this.add.text(0, -H / 2 + 29, '🤖 O Laço ENQUANTO', {
      fontFamily: 'Arial Black, Arial', fontStyle: 'bold',
      fontSize: '21px', color: '#e0f2fe',
    }).setOrigin(0.5).setResolution(2)

    const steps = [
      { icon: '🔁', text: 'O laço ENQUANTO repete uma ação enquanto a condição for verdadeira' },
      { icon: '✅', text: 'O robô verifica a condição ANTES de cada passo — veja o destaque em verde!' },
      { icon: '🛑', text: 'Quando a condição é falsa — destaque vermelho — o robô para imediatamente' },
      { icon: '💡', text: 'Diferente de contar passos: não sabemos de antemão quantas vezes vai repetir!' },
    ]

    const stepItems = steps.flatMap((step, i) => {
      const baseY = -H / 2 + 92 + i * 68
      const iconTxt = this.add.text(-212, baseY, step.icon, {
        fontSize: '28px',
      }).setOrigin(0.5).setResolution(2)
      const stepTxt = this.add.text(-182, baseY, step.text, {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '17px', color: '#1e293b',
        wordWrap: { width: 400 },
      }).setOrigin(0, 0.5).setResolution(2)
      return [iconTxt, stepTxt]
    })

    const btnY = H / 2 - 50
    const btnShadow = this.add.graphics()
    btnShadow.fillStyle(0x000000, 0.16)
    btnShadow.fillRoundedRect(-142, btnY - 20 + 4, 284, 48, 24)
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x1d4ed8, 1)
    btnBg.fillRoundedRect(-146, btnY - 26, 292, 52, 26)
    btnBg.lineStyle(4, 0xffffff, 1)
    btnBg.strokeRoundedRect(-146, btnY - 26, 292, 52, 26)
    const btnText = this.add.text(0, btnY, '▶ Vamos testar!', {
      fontFamily: 'Arial Black, Arial', fontStyle: 'bold',
      fontSize: '20px', color: '#ffffff',
      stroke: '#1e3a8a', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)

    modal.add([modalShadow, modalBg, header, headerText, ...stepItems, btnShadow, btnBg, btnText])
    modal.setScale(0.88).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.Out' })

    const btnAbsY = 360 + H / 2 - 50
    const hitbox = this.add.zone(640, btnAbsY, 292, 60).setDepth(202).setInteractive({ useHandCursor: true })
    hitbox.on('pointerdown', () => {
      this.playTick()
      overlay.destroy()
      modal.destroy()
      hitbox.destroy()
    })
  }

  private showNextLevelStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x1a2340, 0.58)
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
      fontSize: '38px', color: '#1a2340',
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
      this.startChallenge()
    })

    modal.add([shadow, bg, topBar, title, objective, detail, button])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private showGameCompleteScreen() {
    this.clearOverlay()
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x1a2340, 0.62).setDepth(450)
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
      fontSize: '38px', color: '#1a2340',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -74, 'Você dominou o laço ENQUANTO!', {
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
        stroke: '#1a2340', strokeThickness: 4,
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
      this.add.rectangle(640, 360, 1280, 720, 0x1a2340, 0.60).setDepth(450)
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
      fontSize: '38px', color: '#1a2340',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const reasonTxt = this.add.text(0, 6, '3 execuções erradas seguidas!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '20px', color: '#ef4444',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5).setResolution(2)

    const statsTxt = this.add.text(0, 52, `${this.currentChallengeIndex} de ${this.levelConfig.challenges.length} desafios concluídos`, {
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
