import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { LevelConfig, MazeChallenge } from '../types'
import { LEVELS } from '../data/levels'
import { CONDITION_LABELS, simulate } from '../data/conditions'

const GAME_ID = 'labirinto-do-enquanto'
const MAX_CONSECUTIVE_ERRORS = 3
const TILE = 96
const GRID_Y = 440
const BLOCK_Y = 165   // vertical center of the while-block header
const BLOCK_H = 84    // height of the while-block header

type RoundPhase = 'intro' | 'choosing' | 'predicting' | 'ready' | 'running' | 'level-complete'

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
  private robot?: Phaser.GameObjects.Image
  private gridTiles: Phaser.GameObjects.Image[] = []
  private predictMarker?: Phaser.GameObjects.Text
  private conditionLabel?: Phaser.GameObjects.Text
  private executeBtn?: Phaser.GameObjects.Container
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
    this.gridTiles             = []
    this.optionCards           = []
    this.overlayObjects        = []
    this.conditionCheckOverlay = undefined
  }

  create() {
    this.drawBackground()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)

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
    this.add.image(640, 400, 'wallpaper').setDisplaySize(1280, 608).setDepth(-1)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BLOCO "ENQUANTO" + GRID
  // ══════════════════════════════════════════════════════════════════════════

  private startChallenge() {
    this.challengeRoot?.destroy()
    this.challengeRoot = this.add.container(0, 0)
    this.conditionCheckOverlay?.destroy()
    this.conditionCheckOverlay = undefined
    this.gridTiles = []
    this.optionCards = []
    this.selectedConditionId = null
    this.predictedCol = null

    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]

    this.buildWhileBlock(challenge)
    this.buildGrid(challenge)

    if (challenge.conditionOptions) {
      this.phase = 'choosing'
      this.buildConditionOptions(challenge)
      this.setExecuteEnabled(false)
    } else if (challenge.predictMode) {
      this.phase = 'predicting'
      this.selectedConditionId = challenge.fixedConditionId ?? 'path_clear'
      this.enableGridPrediction(challenge)
      this.setExecuteEnabled(false)
    } else {
      this.phase = 'ready'
      this.selectedConditionId = challenge.fixedConditionId ?? 'path_clear'
      this.setExecuteEnabled(true)
    }

    this.updateConditionLabel()
    this.broadcastMissionState()
  }

  private buildWhileBlock(challenge: MazeChallenge) {
    // Block spans x:190–1090 (900px), centered at x=640
    const BL = 190, BT = BLOCK_Y - BLOCK_H / 2  // left=190, top=123

    // ── Outer dark-navy background ────────────────────────────────────────
    const outerBg = this.add.graphics().setDepth(3)
    outerBg.fillStyle(0x1e3a5f, 1)
    outerBg.fillRoundedRect(BL, BT, 900, BLOCK_H, 16)
    outerBg.lineStyle(2, 0x4FC3F7, 0.5)
    outerBg.strokeRoundedRect(BL, BT, 900, BLOCK_H, 16)

    // ── KEYWORD section (x:190–350, width=160) ────────────────────────────
    const kwBg = this.add.graphics().setDepth(4)
    kwBg.fillStyle(0x0f2544, 1)
    kwBg.fillRoundedRect(BL, BT, 160, BLOCK_H, 16)
    kwBg.fillRect(BL + 144, BT, 16, BLOCK_H)     // square-off right corners

    const kwIcon = this.add.text(270, BLOCK_Y - 12, '🔁', { fontSize: '22px' })
      .setOrigin(0.5).setDepth(5)
    const kwLabel = this.add.text(270, BLOCK_Y + 14, 'ENQUANTO', {
      fontFamily: 'Arial Black, Arial', fontSize: '13px', color: '#e0f2fe',
    }).setOrigin(0.5).setDepth(5).setResolution(2)

    // Divider left
    const div1 = this.add.graphics().setDepth(5)
    div1.lineStyle(2, 0x4FC3F7, 0.35)
    div1.lineBetween(350, BT + 8, 350, BT + BLOCK_H - 8)

    // ── CONDITION section (x:350–710, width=360) ─────────────────────────
    const condBg = this.add.graphics().setDepth(3)
    condBg.fillStyle(0x78350f, 0.45)
    condBg.fillRect(351, BT, 359, BLOCK_H)

    const condMiniLabel = this.add.text(358, BT + 7, 'CONDIÇÃO', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '11px', color: '#fbbf24',
    }).setDepth(5).setResolution(2)

    const hasFixed = !!challenge.fixedConditionId
    this.conditionLabel = this.add.text(530, BLOCK_Y + 6, hasFixed
      ? CONDITION_LABELS[challenge.fixedConditionId!]
      : '▼ Escolha abaixo', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '15px', color: hasFixed ? '#fef3c7' : '#f59e0b',
      align: 'center', wordWrap: { width: 344 },
    }).setOrigin(0.5).setDepth(5).setResolution(2)

    // Separator arrow
    const div2 = this.add.graphics().setDepth(5)
    div2.lineStyle(2, 0x4FC3F7, 0.35)
    div2.lineBetween(710, BT + 8, 710, BT + BLOCK_H - 8)

    const arrowTxt = this.add.text(735, BLOCK_Y, '▶', {
      fontSize: '20px', color: '#64748b',
    }).setOrigin(0.5).setDepth(5)

    // ── ACTION section (x:760–1090, width=330) ────────────────────────────
    const actBg = this.add.graphics().setDepth(3)
    actBg.fillStyle(0x14532d, 0.55)
    actBg.fillRoundedRect(761, BT, 329, BLOCK_H, 16)
    actBg.fillRect(761, BT, 16, BLOCK_H)          // square-off left corners

    const actMiniLabel = this.add.text(768, BT + 7, 'AÇÃO', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '11px', color: '#4ade80',
    }).setDepth(5).setResolution(2)

    const actLabel = this.add.text(925, BLOCK_Y + 6, '▶ Mover para frente', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '15px', color: '#dcfce7',
      align: 'center', wordWrap: { width: 318 },
    }).setOrigin(0.5).setDepth(5).setResolution(2)

    // Loop-back indicator at top-right corner
    const loopIco = this.add.text(1082, BT + 5, '↺', {
      fontSize: '22px', color: '#4FC3F7',
    }).setOrigin(1, 0).setDepth(5)

    this.challengeRoot?.add([
      outerBg, kwBg, kwIcon, kwLabel, div1,
      condBg, condMiniLabel, this.conditionLabel,
      div2, arrowTxt,
      actBg, actMiniLabel, actLabel,
      loopIco,
    ])

    // Condition-check overlay lives outside challengeRoot so we can safely tween it
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

    for (let col = 0; col < challenge.corridorLength; col++) {
      const x = startX + col * TILE
      const isWall = challenge.walls.includes(col)
      const isGoal = challenge.goalCol === col
      const key = isWall ? 'tile-wall' : isGoal ? 'tile-goal' : 'tile-floor'
      const tile = this.add.image(x, GRID_Y, key).setDisplaySize(TILE - 6, TILE - 6).setData('col', col)
      this.challengeRoot?.add(tile)
      this.gridTiles.push(tile)
    }

    this.robot = this.add.image(startX, GRID_Y - 10, 'robot-idle').setDisplaySize(72, 72).setDepth(3)
    this.challengeRoot?.add(this.robot)
  }

  private enableGridPrediction(challenge: MazeChallenge) {
    this.predictMarker = this.add.text(0, GRID_Y - 70, '❓', { fontSize: '30px' }).setOrigin(0.5).setAlpha(0)
    this.challengeRoot?.add(this.predictMarker)

    const totalW = challenge.corridorLength * TILE
    const startX = 640 - totalW / 2 + TILE / 2

    this.gridTiles.forEach((tile, col) => {
      tile.setInteractive({ useHandCursor: true })
      tile.on('pointerdown', () => {
        if (this.phase !== 'predicting') return
        this.predictedCol = col
        this.predictMarker?.setPosition(startX + col * TILE, GRID_Y - 70).setAlpha(1)
        this.setExecuteEnabled(true)
        this.playTick()
      })
    })
  }

  private buildConditionOptions(challenge: MazeChallenge) {
    const options = challenge.conditionOptions ?? []
    const cardW = 360, gap = 20
    const totalW = options.length * cardW + (options.length - 1) * gap
    const startX = 640 - totalW / 2 + cardW / 2

    options.forEach((condId, i) => {
      const x = startX + i * (cardW + gap)
      const y = 290

      const card = this.add.container(x, y)
      const bg = this.add.graphics()
      bg.fillStyle(0xfff8f0, 0.96)
      bg.fillRoundedRect(-cardW / 2, -32, cardW, 64, 16)
      bg.lineStyle(3, 0x4FC3F7, 0.8)
      bg.strokeRoundedRect(-cardW / 2, -32, cardW, 64, 16)
      const label = this.add.text(0, 0, CONDITION_LABELS[condId], {
        fontFamily: 'Arial Black, Arial', fontSize: '15px', color: '#0f172a',
        align: 'center', wordWrap: { width: cardW - 24 },
      }).setOrigin(0.5)

      card.add([bg, label])
      card.setSize(cardW, 64)
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
      bg.fillStyle(0xfff8f0, 0.96)
      bg.fillRoundedRect(-180, -32, 360, 64, 16)
      bg.lineStyle(isSelected ? 4 : 3, isSelected ? 0x42d640 : 0x4FC3F7, isSelected ? 1 : 0.8)
      bg.strokeRoundedRect(-180, -32, 360, 64, 16)
    })

    this.setExecuteEnabled(true)
  }

  private buildExecuteButton() {
    this.executeBtn = this.add.container(640, 600).setDepth(5)
    const bg = this.add.graphics()
    bg.fillStyle(0x42d640, 1)
    bg.fillRoundedRect(-150, -28, 300, 56, 26)
    bg.lineStyle(3, 0xffffff, 1)
    bg.strokeRoundedRect(-150, -28, 300, 56, 26)
    const txt = this.add.text(0, 0, '▶  Executar', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: '#ffffff',
      stroke: '#00000040', strokeThickness: 2,
    }).setOrigin(0.5).setResolution(2)
    this.executeBtn.add([bg, txt])
    this.executeBtn.setSize(300, 64)
    this.executeBtn.setData('bg', bg)
    this.executeBtn.on('pointerdown', () => this.executeChallenge())
    this.setExecuteEnabled(false)
  }

  private setExecuteEnabled(enabled: boolean) {
    if (!this.executeBtn) return
    const bg = this.executeBtn.getData('bg') as Phaser.GameObjects.Graphics
    bg.clear()
    bg.fillStyle(enabled ? 0x42d640 : 0xb8c0cc, 1)
    bg.fillRoundedRect(-150, -28, 300, 56, 26)
    bg.lineStyle(3, 0xffffff, enabled ? 1 : 0.8)
    bg.strokeRoundedRect(-150, -28, 300, 56, 26)
    if (enabled) this.executeBtn.setInteractive({ useHandCursor: true })
    else this.executeBtn.disableInteractive()
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  EXECUÇÃO DA SIMULAÇÃO
  // ══════════════════════════════════════════════════════════════════════════

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
        this.robot.setTexture(stepIdx % 2 === 0 ? 'robot-walk' : 'robot-idle')
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

    overlay.setFillStyle(isTrue ? 0x22c55e : 0xef4444).setAlpha(0.65)
    this.tweens.add({ targets: overlay, alpha: 0, duration: 300, ease: 'Sine.In' })

    // Small ✅/❌ badge near the arrow separator
    const badge = this.add.text(748, BLOCK_Y, isTrue ? '✅' : '❌', {
      fontSize: '24px',
    }).setOrigin(0.5).setDepth(10).setAlpha(0)
    this.tweens.add({
      targets: badge, alpha: { from: 0, to: 1 },
      duration: 90, yoyo: true, hold: 110,
      onComplete: () => badge.destroy(),
    })

    this.time.delayedCall(340, onDone)
  }

  private finishExecution(challenge: MazeChallenge, result: { finalCol: number; crashed: boolean }) {
    this.robot?.setTexture('robot-idle')

    let correct: boolean
    if (challenge.predictMode) {
      correct = this.predictedCol === result.finalCol && !result.crashed
    } else {
      correct = !result.crashed && result.finalCol === challenge.goalCol
    }

    if (result.crashed && this.robot) {
      this.tweens.add({ targets: this.robot, x: this.robot.x - 8, duration: 60, yoyo: true, repeat: 4, ease: 'Power2' })
      this.cameras.main.flash(150, 239, 68, 68)
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
        this.time.delayedCall(2200, () => this.startChallenge())
      }
    }
  }

  private showResultPanel(correct: boolean, crashed: boolean) {
    const panel = this.addOverlayObject(this.add.container(640, 250).setDepth(70))
    const bg = this.add.graphics()
    bg.fillStyle(correct ? 0x1b5e20 : 0x7f0000, 0.95)
    bg.fillRoundedRect(-260, -36, 520, 72, 18)
    bg.lineStyle(3, 0xffffff, 0.9)
    bg.strokeRoundedRect(-260, -36, 520, 72, 18)
    const msg = correct
      ? '✅ O robô parou no lugar certo!'
      : crashed
        ? '💥 O robô bateu em uma parede!'
        : '⚠️ O robô não parou no lugar certo.'
    const txt = this.add.text(0, 0, msg, {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: '#ffffff',
      align: 'center', wordWrap: { width: 480 },
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
