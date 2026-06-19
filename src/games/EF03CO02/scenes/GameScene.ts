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
    const blockWhile = this.add.image(640, 190, 'block-while').setDisplaySize(680, 96)
    const blockCond = this.add.image(490, 190, 'block-condition').setDisplaySize(280, 56)
    const blockAction = this.add.image(800, 190, 'block-action').setDisplaySize(220, 56)

    this.conditionLabel = this.add.text(490, 190, challenge.fixedConditionId ? CONDITION_LABELS[challenge.fixedConditionId] : 'Escolha abaixo', {
      fontFamily: 'Arial Black, Arial', fontSize: '14px', color: '#0f172a',
      align: 'center', wordWrap: { width: 260 },
    }).setOrigin(0.5).setResolution(2)

    const actionLabel = this.add.text(800, 190, 'Mover para frente', {
      fontFamily: 'Arial Black, Arial', fontSize: '14px', color: '#0f172a',
      align: 'center', wordWrap: { width: 200 },
    }).setOrigin(0.5).setResolution(2)

    this.challengeRoot?.add([blockWhile, blockCond, blockAction, this.conditionLabel, actionLabel])
  }

  private updateConditionLabel() {
    if (!this.conditionLabel) return
    this.conditionLabel.setText(
      this.selectedConditionId ? CONDITION_LABELS[this.selectedConditionId] : 'Escolha abaixo'
    )
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

    let stepIdx = 0
    const stepDelay = 320

    const animateStep = () => {
      if (!this.robot) return
      if (stepIdx >= result.path.length) {
        this.finishExecution(challenge, result)
        return
      }
      const col = result.path[stepIdx]
      this.robot.setTexture(stepIdx % 2 === 0 ? 'robot-walk' : 'robot-idle')
      this.tweens.add({
        targets: this.robot, x: startX + col * TILE,
        duration: stepDelay - 40, ease: 'Sine.easeInOut',
        onComplete: () => {
          stepIdx++
          this.time.delayedCall(40, animateStep)
        },
      })
    }

    animateStep()
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
      1: 'Você viu o laço enquanto funcionar até parar!',
      2: 'Você escolheu a condição certa para chegar ao objetivo!',
      3: 'Você previu corretamente onde o robô ia parar!',
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

    const subtitle = this.add.text(0, -74, 'Você dominou o laço enquanto!', {
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
