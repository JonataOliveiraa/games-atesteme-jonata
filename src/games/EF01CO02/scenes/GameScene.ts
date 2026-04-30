import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { RoundResult } from '../../../shared/types/game'
import type { LevelConfig, InteractiveObject, GameStep } from '../types'
import { LEVELS } from '../data/missions'

const GAME_ID = 'trilha-do-passo-a-passo'

export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig
  private currentStepIndex = 0
  private interactiveObjects: Map<string, Phaser.GameObjects.Image> = new Map()
  private stepCards: Phaser.GameObjects.Container[] = []
  private startTime = 0
  private currentPoints = 0
  private currentLives = 1
  private unsubscribePlatformCommands?: () => void
  private timerEvent?: Phaser.Time.TimerEvent
  private isMuted = false
  private audioAllowed = false

  constructor() {
    super({ key: 'GameScene' })
    // Registra uma vez o listener de interação para permitir áudio
    if (typeof window !== 'undefined' && !window.__ef01co02_audio_init) {
      window.addEventListener('pointerdown', () => this.allowAudio(), { once: true })
      window.addEventListener('touchstart', () => this.allowAudio(), { once: true })
      window.__ef01co02_audio_init = true
    }
  }

  private allowAudio() {
    if (!this.audioAllowed) {
      this.audioAllowed = true
      // Não tenta retomar contexto aqui — playTone cria o dele quando necessário.
    }
  }

  init(data?: { level?: number; points?: number; lives?: number }) {
    const lvl = data?.level ?? 1
    this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
    this.currentStepIndex = 0
    this.startTime = Date.now()
    this.currentPoints = data?.points ?? 0
    this.currentLives = data?.lives ?? 1
  }

  create() {
    this.createBackground()
    this.createInteractiveObjects()
    this.createStepCards()
    this.updateActiveStepDisplay()
    this.setupInteraction()
    this.registerPlatformCommands()

    if (this.levelConfig.mission.timeLimit) {
      this.startTimer()
    }

    EventBus.on('set-level', this.handleSetLevel, this)
    EventBus.on('mute-audio', this.handleMuteAudio, this)

    this.showLevelIntro()
  }

  private handleMuteAudio = (muted: boolean) => {
    this.isMuted = muted
  }

  private handleSetLevel = (data: { level: number }) => {
    this.scene.restart({
      level: data.level,
      points: this.currentPoints,
      lives: this.currentLives,
    })
  }

  private showLevelIntro() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setDepth(100)
    const lvlLabel = this.add.text(640, 300, `missão ${this.levelConfig.level}`, {
      fontSize: '48px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFF9C4',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(101)

    const missionName = this.add.text(640, 380, this.levelConfig.mission.name, {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: '#E0E0E0',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(101)

    const missionDesc = this.add.text(640, 430, this.levelConfig.mission.description, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#BBDEFB',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(101)

    const goText = this.add.text(640, 500, 'VAMOS LÁ!', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      color: '#4CAF50',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(101)

    this.tweens.add({
      targets: [lvlLabel, missionName, missionDesc, goText],
      scaleX: 1.1,
      scaleY: 1.1,
      yoyo: true,
      duration: 800,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.input.once('pointerdown', () => {
      this.tweens.killAll()
      this.tweens.add({
        targets: [overlay, lvlLabel, missionName, missionDesc, goText],
        alpha: 0,
        duration: 350,
        onComplete: () => {
          overlay.destroy()
          lvlLabel.destroy()
          missionName.destroy()
          missionDesc.destroy()
          goText.destroy()
          EventBus.emit('scene-ready', { levelConfig: this.levelConfig })
          EventBus.emit('update-progress', {
            pct: 0,
            hits: 0,
            errors: 0,
            currentStep: this.currentStepIndex + 1,
            totalSteps: this.levelConfig.mission.steps.length
          })
        }
      })
    })
  }

  private createBackground() {
    const theme = this.levelConfig.mission.theme
    this.add.rectangle(640, 360, 1280, 720, 0x87CEEB)

    switch (theme) {
      case 'cozinha': this.add.rectangle(640, 500, 800, 200, 0xD2B48C); break
      case 'origami': this.add.rectangle(640, 400, 600, 400, 0xFAFAD2); break
      case 'tabuleiro': this.add.rectangle(640, 400, 800, 600, 0x8FBC8F); break
    }
  }

  private createInteractiveObjects() {
    this.interactiveObjects.clear()
    this.levelConfig.mission.objects.forEach(obj => {
      const sprite = this.add.image(obj.x, obj.y, obj.frame)
      sprite.setInteractive()
      sprite.setData('objectId', obj.id)
      sprite.setData('objectState', obj.state)
      this.interactiveObjects.set(obj.id, sprite)
    })
  }

  private createStepCards() {
    const startX = 100
    const y = 80
    const spacing = 140

    this.stepCards = []
    this.levelConfig.mission.steps.forEach((step, index) => {
      const card = this.add.container(startX + index * spacing, y)
      const bg = this.add.rectangle(0, 0, 120, 60, 0xD3D3D3, 0.8).setStrokeStyle(2, 0xA9A9A9)
      const numText = this.add.text(0, -15, `${step.stepNumber}`, { fontSize: '24px', fontFamily: 'Arial Black' }).setOrigin(0.5)
      const descText = this.add.text(0, 15, '...', { fontSize: '10px', wordWrap: { width: 110 } }).setOrigin(0.5)
      card.add([bg, numText, descText])
      card.setData('stepIndex', index)
      card.setVisible(true)
      this.stepCards.push(card)
      descText.setText(step.action.description.substring(0, 15) + (step.action.description.length > 15 ? '...' : ''))
    })
  }

  private updateActiveStepDisplay() {
    this.stepCards.forEach((card, index) => {
      const bg = card.list[0] as Phaser.GameObjects.Rectangle
      if (index === this.currentStepIndex) {
        bg.setFillStyle(0x90EE90, 0.9)
        bg.setStrokeStyle(3, 0x006400)
        this.tweens.add({
          targets: card,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      } else {
        bg.setFillStyle(0xD3D3D3, 0.8)
        bg.setStrokeStyle(2, 0xA9A9A9)
        this.tweens.killTweensOf(card)
        card.setScale(1)
      }
    })
  }

  private setupInteraction() {
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      const objectId = gameObject.getData('objectId')
      const currentStep = this.levelConfig.mission.steps[this.currentStepIndex]

      if (objectId === currentStep.action.targetObjectId) {
        this.onCorrectAction(objectId)
      } else {
        this.onWrongAction(objectId)
      }
    })
  }

  private onCorrectAction(objectId: string) {
    const objSprite = this.interactiveObjects.get(objectId)
    if (objSprite) {
      this.playCorrectSound()
      this.showSuccessEffect(objSprite.x, objSprite.y)
    }

    this.currentStepIndex++
    if (this.currentStepIndex >= this.levelConfig.mission.steps.length) {
      this.onMissionComplete()
      return
    }

    this.updateActiveStepDisplay()
    this.emitCheckpoint()
  }

  private onWrongAction(objectId: string) {
    const objSprite = this.interactiveObjects.get(objectId)
    if (objSprite) {
      this.tweens.add({
        targets: objSprite,
        x: objSprite.x - 10,
        y: objSprite.y - 10,
        duration: 100,
        yoyo: true,
        repeat: 1
      })
      this.playWrongSound()
    }

    if (this.currentLives <= 0) {
      this.currentPoints = Math.max(0, this.currentPoints - 5)
      runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.levelConfig.level })
      this.endRound()
      return
    }

    this.currentLives--
    this.currentPoints = Math.max(0, this.currentPoints - 5)
    runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.levelConfig.level })
  }

  private onMissionComplete() {
    this.currentPoints += 20
    runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
    this.endRound()
  }

  private endRound() {
    this.input.enabled = false
    this.timerEvent?.destroy()
    this.showRoundComplete()

    this.time.delayedCall(1800, () => {
      const result: RoundResult = {
        gameCode: 'EF01CO02',
        level: this.levelConfig.level,
        hits: this.levelConfig.mission.steps.length,
        errors: (this.levelConfig.mission.steps.length - this.currentStepIndex) + (2 - this.currentLives),
        durationMs: Date.now() - this.startTime,
        timestamp: Date.now(),
      }
      EventBus.emit('round-complete', result)
    })
  }

  private showRoundComplete() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8).setDepth(200)
    const successText = this.add.text(640, 300, 'missão completada!', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      color: '#4CAF50',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(201)

    const stars = this.add.text(640, 380, '⭐⭐⭐', {
      fontSize: '48px',
      color: '#FFD700',
    }).setOrigin(0.5).setDepth(201)

    const continueText = this.add.text(640, 450, 'clique para continuar', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#E0E0E0',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(201)

    this.tweens.add({
      targets: [successText, stars, continueText],
      scaleX: 1.05,
      scaleY: 1.05,
      yoyo: true,
      duration: 1000,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.input.once('pointerdown', () => {
      this.tweens.killAll()
      this.tweens.add({
        targets: [overlay, successText, stars, continueText],
        alpha: 0,
        duration: 350,
        onComplete: () => {
          overlay.destroy()
          successText.destroy()
          stars.destroy()
          continueText.destroy()
        }
      })
    })
  }

  private startTimer() {
    if (!this.levelConfig.mission.timeLimit) return
    const timeLimit = this.levelConfig.mission.timeLimit!
    this.timerEvent = this.time.addEvent({
      delay: timeLimit * 1000,
      callback: () => {
        this.playTimeUp()
        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.levelConfig.level })
        this.endRound()
      },
      callbackScope: this,
    })
  }

  private emitCheckpoint() {
    const totalSteps = this.levelConfig.mission.steps.length
    const completedSteps = this.currentStepIndex
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    runtimeGameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress,
      score: this.currentPoints,
      stage: this.levelConfig.level,
      hits: completedSteps,
      errors: (totalSteps - completedSteps) + (2 - this.currentLives),
    })

    EventBus.emit('update-progress', {
      pct: progress / 100,
      hits: completedSteps,
      errors: (totalSteps - completedSteps) + (2 - this.currentLives),
      currentStep: completedSteps + 1,
      totalSteps: totalSteps
    })
  }

  private registerPlatformCommands() {
    if (typeof runtimeGameBridge.onCommand === 'function') {
      this.unsubscribePlatformCommands = runtimeGameBridge.onCommand(
        (command: PlatformCommand) => {
          if (command.type === 'START_GAME' && command.gameId === GAME_ID) {
            this.currentPoints = command.points
            this.currentLives = command.lives
          }
        }
      )
    } else {
      console.warn('runtimeGameBridge.onCommand não disponível — EF01CO02 usa onCommand')
    }
  }

  // --- ÁUDIO SEGURO (Web Audio API local) ---
  private playCorrectSound() {
    if (!this.isMuted && this.audioAllowed) {
      this.playTone(880, 0.2, '#4CAF50') // A5, 200ms, verde
    }
  }

  private playWrongSound() {
    if (!this.isMuted && this.audioAllowed) {
      this.playTone(440, 0.2, '#F44336') // A4, 200ms, vermelho
    }
  }

  private playTimeUp() {
    if (!this.isMuted && this.audioAllowed) {
      this.playTone(330, 0.5, '#FF9800') // E4, 500ms, laranja
    }
  }

  private playTone(frequency: number, duration: number, color: string) {
    if (typeof window === 'undefined' || !this.audioAllowed) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = frequency
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch (e) {
      console.warn('Falha ao tocar tom:', e)
    }
  }

  // --- FUNÇÃO CORRIGIDA: showSuccessEffect ---
  private showSuccessEffect(x: number, y: number) {
    const check = this.add.text(x, y, '✅', {
      fontSize: '32px',
      color: '#27AE60',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20)

    this.tweens.add({
      targets: check,
      y: y - 60,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => check.destroy()
    })
  }

  shutdown() {
    EventBus.off('set-level', this.handleSetLevel, this)
    EventBus.off('mute-audio', this.handleMuteAudio, this)
    this.timerEvent?.destroy()
    if (this.unsubscribePlatformCommands) {
      this.unsubscribePlatformCommands()
      this.unsubscribePlatformCommands = undefined
    }
  }
}