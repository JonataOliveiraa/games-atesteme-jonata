import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import type { RoundResult } from '../../../../shared/types/game'
import type { GameItem, LevelConfig, ClassifierBase } from '../types'
import { LEVELS } from '../data/levels'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'

interface DraggableItem extends Phaser.GameObjects.Image {
  itemData: GameItem
  originX_: number
  originY_: number
}

const ITEM_Y = 295          // linha única (n ≤ 9)
const ITEM_Y_ROW1 = 205     // primeira linha (n > 9)
const ITEM_Y_ROW2 = 345     // segunda linha  (n > 9)
const ITEM_SCALE_MAX = 0.66 // escala máxima dos itens — diminua para figuras menores
const GAME_ID = 'base-dos-classificadores'

const COLORS = {
  green: 0x4CAF50,
  darkGreen: 0x2E7D32,
  deepGreen: 0x1B5E20,
  cream: 0xF1F8E9,
  gold: 0xFFD700,
  brown: 0x8D6E63,
}

const DEV_START_LEVEL: 1 | 2 | 3 = 1  // ← mude para 2 ou 3 para testar; volte para 1 antes de publicar
const DEV_NO_TIMER = true      // ← true = pula tela inicial e não inicia timer (ajuste visual)


export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig
  private bases: Phaser.GameObjects.Container[] = []
  private itemSprites: DraggableItem[] = []
  private itemBackings: Phaser.GameObjects.Graphics[] = []
  private hits = 0
  private errors = 0
  private startTime = 0
  private currentPoints = 0
  private currentLives = 1
  private gameEnded = false
  private unsubscribePlatformCommands?: () => void

  private timeBarFill?: Phaser.GameObjects.Graphics
  private timerTween?: Phaser.Tweens.Tween
  private timerState = { progress: 1 }
  private hasStartedTimer = false
  private timerDuration = 25000

  private isMuted = false

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number }) {
    const lvl = (data?.level ?? DEV_START_LEVEL) as 1 | 2 | 3
    this.levelConfig = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.hits = 0
    this.errors = 0
    this.startTime = Date.now()
    this.currentPoints = data?.points ?? 0
    this.currentLives = data?.lives ?? 1
    this.gameEnded = false
    this.hasStartedTimer = false
    this.timerState = { progress: 1 }
    this.timerDuration = (this.levelConfig.timeLimit ?? 90) * 1000
    this.itemBackings = []
  }

  create() {
    // Launch the HUD scene in parallel (safe to call even if already active)
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene')
    }

    this.createBackground()
    this.createClouds()
    this.createItemTray()
    this.createBases()
    this.createItems()
    this.setupDrag()
    this.registerPlatformCommands()

    this.createTimeBar()

    if (DEV_NO_TIMER) {
      this.revealItems()
      this.runTutorial(() => {
        if (this.levelConfig.timeLimit) this.startTimer()
      })
    } else {
      this.showStartScreen()
    }
  }

  shutdown() {
    this.timerTween?.stop()

    if (this.unsubscribePlatformCommands) {
      this.unsubscribePlatformCommands()
      this.unsubscribePlatformCommands = undefined
    }
  }

  // ── Telas de fluxo ──────────────────────────────────────────────────────────

  private getLevelInstructions(): { objective: string; detail: string; tip: string } {
    const nItems = this.levelConfig.items.length
    const nBases = this.levelConfig.bases.length

    if (this.levelConfig.level === 1) {
      return {
        objective: `Separe ${nItems} itens em ${nBases} grupos de CORES.`,
        detail: 'As formas são diferentes — ignore-as! Use só a COR para classificar.',
        tip: 'Arraste cada item para a base com a mesma cor.',
      }
    }

    if (this.levelConfig.level === 2) {
      return {
        objective: `Classifique ${nItems} itens em ${nBases} grupos de CORES.`,
        detail: 'Agora são 4 cores e 3 formas. Foque na COR, não na forma!',
        tip: 'Arraste cada item para a base com a mesma cor.',
      }
    }

    return {
      objective: `Classifique ${nItems} itens em ${nBases} grupos de FORMAS.`,
      detail: 'Agora a FORMA é o critério — círculo, quadrado, triângulo ou retângulo!',
      tip: 'A cor não importa aqui. Observe a forma de cada item.',
    }
  }

  private showStartScreen() {
    const info = this.getLevelInstructions()
    const lvl = this.levelConfig.level
    const W = 1280, H = 720

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, COLORS.deepGreen, 0.62)
      .setDepth(60).setInteractive()

    const modal = this.add.container(W / 2, H / 2)
    modal.setDepth(61)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-292, -168, 584, 344, 28)

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.cream, 0.98)
    bg.fillRoundedRect(-300, -180, 600, 344, 28)
    bg.lineStyle(5, 0xFFFFFF, 0.95)
    bg.strokeRoundedRect(-300, -180, 600, 344, 28)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(COLORS.green, 1)
    ribbon.fillRoundedRect(-210, -196, 420, 28, 14)
    ribbon.lineStyle(3, 0xFFFFFF, 0.82)
    ribbon.strokeRoundedRect(-210, -196, 420, 28, 14)

    const stars = this.add.text(0, -130, '★'.repeat(lvl) + '☆'.repeat(3 - lvl), {
      fontSize: '30px', color: '#FFD700',
    }).setOrigin(0.5)

    const title = this.add.text(0, -90, `Nível ${lvl}`, {
      fontFamily: 'Arial', fontSize: '38px', fontStyle: 'bold',
      color: '#1B5E20', stroke: '#FFFFFF', strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2)

    const objective = this.add.text(0, -36, info.objective, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold',
      color: '#2E7D32', align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)

    const detail = this.add.text(0, 20, info.detail, {
      fontFamily: 'Arial', fontSize: '15px',
      color: '#4E342E', align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)

    const timerText = this.levelConfig.timeLimit
      ? this.add.text(0, 64, `⏱  ${this.levelConfig.timeLimit} segundos`, {
        fontFamily: 'Arial', fontSize: '13px', color: '#8D6E63',
      }).setOrigin(0.5)
      : null

    const btnCont = this.add.container(0, 120)
    const btnShadow = this.add.graphics()
    btnShadow.fillStyle(0x000000, 0.16)
    btnShadow.fillRoundedRect(-126, -18, 252, 44, 22)
    const btnBg = this.add.graphics()
    btnBg.fillStyle(COLORS.darkGreen, 1)
    btnBg.fillRoundedRect(-130, -24, 260, 50, 25)
    btnBg.lineStyle(4, 0xFFFFFF, 1)
    btnBg.strokeRoundedRect(-130, -24, 260, 50, 25)
    const btnText = this.add.text(0, 0, 'Iniciar nível', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#1B5E20', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    btnCont.add([btnShadow, btnBg, btnText])

    const children: Phaser.GameObjects.GameObject[] = [shadow, bg, ribbon, stars, title, objective, detail, btnCont]
    if (timerText) children.push(timerText)
    modal.add(children)
    modal.setScale(0.9).setAlpha(0)

    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    const btnHitbox = this.add.zone(W / 2, H / 2 + 120, 260, 58)
    btnHitbox.setDepth(62).setInteractive({ useHandCursor: true })

    btnHitbox.on('pointerover', () =>
      this.tweens.add({ targets: btnCont, scale: 1.04, duration: 90, ease: 'Sine.easeOut' }))
    btnHitbox.on('pointerout', () =>
      this.tweens.add({ targets: btnCont, scale: 1, duration: 90, ease: 'Sine.easeOut' }))
    btnHitbox.on('pointerdown', () => {
      this.playTone(523, 0.10, 'sine', 0.20)
      overlay.destroy()
      btnHitbox.destroy()
      modal.destroy()
      runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
      this.emitCheckpoint()
      this.revealItems()
      this.playGo()
      this.runTutorial(() => {
        if (this.levelConfig.timeLimit) this.startTimer()
      })
    })
  }

  // ── Tutorial ─────────────────────────────────────────────────────────────

  private runTutorial(onDone: () => void) {
    const lvl = this.levelConfig.level
    const firstItem = this.itemSprites[0]
    const targetBase = firstItem
      ? this.bases.find((b) => {
        const rule = (b.getData('baseData') as ClassifierBase).rule
        return this.getItemAttrValue(firstItem.itemData, rule.attribute) === rule.value
      })
      : undefined

    const itemX = firstItem?.originX_ ?? 640
    const itemY = firstItem?.originY_ ?? ITEM_Y
    const baseX = targetBase?.x ?? 640
    const baseY = targetBase?.y ?? 608

    const steps: TutorialStep[] = []

    if (lvl === 1) {
      steps.push(
        {
          text: 'Cada item tem uma cor. Olhe bem para este aqui.',
          shape: 'circle', x: itemX, y: itemY, w: 180, h: 180,
        },
        {
          text: 'Estas casinhas recebem os itens da mesma cor.',
          shape: 'rect', x: 640, y: 608, w: 1180, h: 170,
        },
        {
          text: 'Arraste o item até a casinha da cor certa, segurando com o dedo até soltar lá.',
          shape: 'rect',
          x: (itemX + baseX) / 2,
          y: (itemY + baseY) / 2,
          w: Math.abs(baseX - itemX) + 260,
          h: Math.abs(baseY - itemY) + 260,
          balloonY: 210,
          pointer: firstItem && targetBase
            ? { fromX: itemX, fromY: itemY, toX: baseX, toY: baseY }
            : undefined,
        },
        {
          text: 'Essa barra mostra o tempo passando. Capriche antes que ela acabe!',
          shape: 'rect', x: 640, y: 43, w: 820, h: 60, balloonY: 170,
        },
      )
    } else if (lvl === 2) {
      steps.push(
        {
          text: 'Agora são quatro casinhas de cores diferentes. Olhe bem antes de arrastar.',
          shape: 'rect', x: 640, y: 608, w: 1220, h: 170,
        },
        {
          text: 'A forma do item pode enganar — o que importa é sempre a COR.',
          shape: 'none', balloonY: 300,
        },
      )
    } else if (lvl === 3) {
      steps.push(
        {
          text: 'Mudou a regra: agora é a FORMA que importa, não a cor.',
          shape: 'rect', x: 640, y: 608, w: 1220, h: 170,
        },
        {
          text: 'Círculo, quadrado, triângulo ou retângulo — observe o contorno de cada item.',
          shape: 'none', balloonY: 300,
        },
      )
    }

    if (!steps.length) {
      onDone()
      return
    }

    createTutorial(this, {
      key: `classificadores-l${lvl}`,
      accent: COLORS.green,
      safeTop: 70,
      onFinish: onDone,
      steps,
    })
  }

  private showLevelCompleteScreen(nextLevel: 1 | 2 | 3) {
    this.playRoundComplete()
    const W = 1280, H = 720

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, COLORS.deepGreen, 0.56)
      .setDepth(60).setInteractive()

    const modal = this.add.container(W / 2, H / 2)
    modal.setDepth(61)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.cream, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 330, 28)
    bg.lineStyle(5, 0xFFFFFF, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 330, 28)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(COLORS.green, 1)
    ribbon.fillRoundedRect(-196, -194, 392, 28, 14)
    ribbon.lineStyle(3, 0xFFFFFF, 0.82)
    ribbon.strokeRoundedRect(-196, -194, 392, 28, 14)

    const title = this.add.text(0, -110, 'Parabéns!', {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold',
      color: '#1B5E20', stroke: '#FFFFFF', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const sub = this.add.text(0, -56, `Nível ${this.levelConfig.level} concluído`, {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#2E7D32',
    }).setOrigin(0.5).setResolution(2)

    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics()
      dot.fillStyle(level <= this.levelConfig.level ? COLORS.green : level === nextLevel ? 0xFF9800 : 0xD8DDE8, 1)
      dot.fillCircle(-28 + index * 28, 48, 8)
      dot.lineStyle(2, 0xFFFFFF, 0.9)
      dot.strokeCircle(-28 + index * 28, 48, 8)
      return dot
    })

    const waitText = this.add.text(0, 94, 'Preparando o próximo nível...', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#1B5E20',
    }).setOrigin(0.5).setResolution(2)

    modal.add([shadow, bg, ribbon, title, sub, ...dots, waitText])
    modal.setScale(0.9).setAlpha(0)

    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.time.delayedCall(2300, () => {
      overlay.destroy()
      modal.destroy()
      this.scene.restart({ level: nextLevel, points: this.currentPoints, lives: this.currentLives })
    })
  }

  private showFinalCompleteScreen() {
    this.playRoundComplete()
    const W = 1280, H = 720

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, COLORS.deepGreen, 0.56)
      .setDepth(60).setInteractive()

    const modal = this.add.container(W / 2, H / 2)
    modal.setDepth(61)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.cream, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 330, 28)
    bg.lineStyle(5, 0xFFFFFF, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 330, 28)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(COLORS.green, 1)
    ribbon.fillRoundedRect(-196, -194, 392, 28, 14)
    ribbon.lineStyle(3, 0xFFFFFF, 0.82)
    ribbon.strokeRoundedRect(-196, -194, 392, 28, 14)

    const title = this.add.text(0, -110, 'Parabéns!', {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold',
      color: '#1B5E20', stroke: '#FFFFFF', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const sub = this.add.text(0, -56, 'Nível 3 concluído', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#2E7D32',
    }).setOrigin(0.5).setResolution(2)

    const dots = [1, 2, 3].map((_, index) => {
      const dot = this.add.graphics()
      dot.fillStyle(COLORS.green, 1)
      dot.fillCircle(-28 + index * 28, 48, 8)
      dot.lineStyle(2, 0xFFFFFF, 0.9)
      dot.strokeCircle(-28 + index * 28, 48, 8)
      return dot
    })

    const waitText = this.add.text(0, 94, 'Preparando a finalização...', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#1B5E20',
    }).setOrigin(0.5).setResolution(2)

    modal.add([shadow, bg, ribbon, title, sub, ...dots, waitText])
    modal.setScale(0.9).setAlpha(0)

    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.time.delayedCall(2300, () => {
      overlay.destroy()
      modal.destroy()
      this.showGameCompleteScreen()
    })
  }

  private showGameCompleteScreen() {
    const W = 1280, H = 720

    this.add.rectangle(W / 2, H / 2, W, H, COLORS.deepGreen, 0.62)
      .setDepth(60).setInteractive()

    const panel = this.add.container(W / 2, H / 2)
    panel.setDepth(61)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-302, -188, 604, 376, 34)

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.cream, 0.98)
    bg.fillRoundedRect(-310, -200, 620, 376, 34)
    bg.lineStyle(6, 0xFFFFFF, 0.96)
    bg.strokeRoundedRect(-310, -200, 620, 376, 34)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(COLORS.green, 1)
    ribbon.fillRoundedRect(-220, -218, 440, 34, 17)
    ribbon.lineStyle(4, 0xFFFFFF, 0.9)
    ribbon.strokeRoundedRect(-220, -218, 440, 34, 17)

    const title = this.add.text(0, -138, 'Jogo concluído!', {
      fontFamily: 'Arial', fontSize: '38px', fontStyle: 'bold',
      color: '#1B5E20', stroke: '#FFFFFF', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -80, 'Você classificou todos os itens!', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
      color: '#4E342E', align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)

    const badgeColors = [COLORS.darkGreen, 0xFF8A2A, COLORS.green]
    const badges = [1, 2, 3].map((lvl, index) => {
      const item = this.add.container(-190 + index * 190, 54)
      const badge = this.add.graphics()
      badge.fillStyle(badgeColors[index], 1)
      badge.fillRoundedRect(-54, -42, 108, 84, 18)
      badge.lineStyle(4, 0xFFFFFF, 0.95)
      badge.strokeRoundedRect(-54, -42, 108, 84, 18)
      const num = this.add.text(0, -13, String(lvl), {
        fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold',
        color: '#FFFFFF', stroke: '#1B5E20', strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2)
      const label = this.add.text(0, 23, 'concluído', {
        fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#FFFFFF',
      }).setOrigin(0.5).setResolution(2)
      item.add([badge, num, label])
      return item
    })

    panel.add([shadow, bg, ribbon, title, subtitle, ...badges])
    panel.setScale(0.9).setAlpha(0)

    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: 3 })
  }

  private showGameOverScreen() {
    this.input.enabled = true
    const W = 1280, H = 720

    this.add.rectangle(W / 2, H / 2, W, H, COLORS.deepGreen, 0.72)
      .setDepth(60).setInteractive()

    const modal = this.add.container(W / 2, H / 2)
    modal.setDepth(61)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.cream, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 330, 28)
    bg.lineStyle(5, 0xFFFFFF, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 330, 28)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(0xC62828, 1)
    ribbon.fillRoundedRect(-196, -194, 392, 28, 14)
    ribbon.lineStyle(3, 0xFFFFFF, 0.82)
    ribbon.strokeRoundedRect(-196, -194, 392, 28, 14)

    const title = this.add.text(0, -110, 'Tempo Esgotado!', {
      fontFamily: 'Arial', fontSize: '36px', fontStyle: 'bold',
      color: '#B71C1C', stroke: '#FFFFFF', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const sub = this.add.text(0, -58, `⏰  O tempo acabou no Nível ${this.levelConfig.level}`, {
      fontFamily: 'Arial', fontSize: '18px', color: '#4E342E',
      align: 'center', wordWrap: { width: 480 },
    }).setOrigin(0.5).setResolution(2)

    // Botão Tentar Novamente
    const retryBtn = this.add.container(-90, 60)
    const retryBg = this.add.graphics()
    retryBg.fillStyle(COLORS.darkGreen, 1)
    retryBg.fillRoundedRect(-100, -22, 200, 44, 22)
    retryBg.lineStyle(3, 0xFFFFFF, 1)
    retryBg.strokeRoundedRect(-100, -22, 200, 44, 22)
    const retryText = this.add.text(0, 0, 'Tentar Novamente', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#FFFFFF',
    }).setOrigin(0.5).setResolution(2)
    retryBtn.add([retryBg, retryText])

    // Botão Sair
    const exitBtn = this.add.container(110, 60)
    const exitBg = this.add.graphics()
    exitBg.fillStyle(0x757575, 1)
    exitBg.fillRoundedRect(-80, -22, 160, 44, 22)
    exitBg.lineStyle(3, 0xFFFFFF, 1)
    exitBg.strokeRoundedRect(-80, -22, 160, 44, 22)
    const exitText = this.add.text(0, 0, 'Sair', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#FFFFFF',
    }).setOrigin(0.5).setResolution(2)
    exitBtn.add([exitBg, exitText])

    modal.add([shadow, bg, ribbon, title, sub, retryBtn, exitBtn])
    modal.setScale(0.9).setAlpha(0)

    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    const retryHit = this.add.zone(W / 2 - 90, H / 2 + 60, 200, 44)
    retryHit.setDepth(62).setInteractive({ useHandCursor: true })
    retryHit.on('pointerover', () => this.tweens.add({ targets: retryBtn, scale: 1.05, duration: 80 }))
    retryHit.on('pointerout', () => this.tweens.add({ targets: retryBtn, scale: 1, duration: 80 }))
    retryHit.on('pointerdown', () => {
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    })

    const exitHit = this.add.zone(W / 2 + 110, H / 2 + 60, 160, 44)
    exitHit.setDepth(62).setInteractive({ useHandCursor: true })
    exitHit.on('pointerover', () => this.tweens.add({ targets: exitBtn, scale: 1.05, duration: 80 }))
    exitHit.on('pointerout', () => this.tweens.add({ targets: exitBtn, scale: 1, duration: 80 }))
    exitHit.on('pointerdown', () => EventBus.emit('exit-game'))
  }

  // ── Background & Visuals ────────────────────────────────────────────────────

  private createBackground() {
    if (this.textures.exists('bg-garden')) {
      this.add.image(640, 360, 'bg-garden').setDisplaySize(1280, 720).setDepth(0)
    } else {
      this.add.rectangle(640, 360, 1280, 720, 0x5BB8F5)
      const hillGfx = this.add.graphics()
      hillGfx.fillStyle(0x6DB46C, 1)
      hillGfx.fillEllipse(180, 506, 680, 200)
      hillGfx.fillEllipse(680, 492, 920, 195)
      hillGfx.fillEllipse(1160, 510, 660, 196)
      this.add.rectangle(640, 626, 1280, 228, 0x43A047)
    }

    // ── Sol (top-right) ───────────────────────────────────────────────────────
    const sunX = 1165
    const sunY = 90
    const sunSize = 200
    if (this.textures.exists('sun')) {
      // Máscara circular para cortar cantos brancos do fundo da imagem
      const maskGfx = this.make.graphics({ x: 0, y: 0 }, false)
      maskGfx.fillStyle(0xffffff)
      maskGfx.fillCircle(sunX, sunY, sunSize * 0.56)
      this.add.image(sunX, sunY, 'sun')
        .setDisplaySize(sunSize, sunSize)
        .setMask(maskGfx.createGeometryMask())
        .setDepth(1)
    } else {
      // Fallback programático
      const sunGfx = this.add.graphics().setDepth(1)
      sunGfx.fillStyle(0xFFE082, 0.28)
      sunGfx.fillCircle(sunX, sunY, 70)
      sunGfx.lineStyle(7, 0xFFE57F, 1)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        sunGfx.lineBetween(sunX + Math.cos(a) * 62, sunY + Math.sin(a) * 62,
          sunX + Math.cos(a) * 90, sunY + Math.sin(a) * 90)
      }
      sunGfx.fillStyle(0xFFD700, 1)
      sunGfx.fillCircle(sunX, sunY, 52)
    }
  }

  private createClouds() {
    // Nuvens incorporadas no bg-garden.png — sem nuvens programáticas quando imagem carregada
    if (this.textures.exists('bg-garden')) return

    const positions = [
      { x: 130, y: 118 },
      { x: 390, y: 88 },
      { x: 660, y: 132 },
      { x: 940, y: 96 },
    ]

    positions.forEach((pos, i) => {
      const sc = 0.78 + (i % 2) * 0.26
      const gfx = this.add.graphics()
      gfx.fillStyle(0xBBDEFB, 0.4)
      gfx.fillEllipse(4, 6, 128 * sc, 44 * sc)
      gfx.fillStyle(0xFFFFFF, 0.96)
      gfx.fillEllipse(0, 2, 134 * sc, 52 * sc)
      gfx.fillEllipse(-34 * sc, 10 * sc, 82 * sc, 56 * sc)
      gfx.fillEllipse(34 * sc, 10 * sc, 82 * sc, 56 * sc)
      gfx.fillEllipse(-10 * sc, -12 * sc, 72 * sc, 50 * sc)
      gfx.fillEllipse(18 * sc, -14 * sc, 62 * sc, 44 * sc)
      gfx.fillStyle(0xFFFFFF, 0.55)
      gfx.fillEllipse(-8 * sc, -6 * sc, 50 * sc, 28 * sc)
      gfx.setPosition(pos.x, pos.y)
      this.tweens.add({
        targets: gfx,
        x: pos.x + 26,
        duration: 5400 + i * 760,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    })
  }

  private createItemTray() {
    const n = this.levelConfig.items.length
    const rows = n > 9 ? [ITEM_Y_ROW1, ITEM_Y_ROW2] : [ITEM_Y]
    const useImage = this.textures.exists('shelf-wood')

    const SHELF_W = 1500
    const SHELF_H = 380
    const PLANK_FRAC = 0.35
    const plankOffset = Math.round(SHELF_H * PLANK_FRAC)

    for (const rowY of rows) {
      const imgTopY = rowY + 30 - plankOffset

      if (useImage) {
        this.add.image(640, imgTopY, 'shelf-wood')
          .setOrigin(0.5, 0)
          .setDisplaySize(SHELF_W, SHELF_H)
          .setDepth(2)
      } else {
        const trayY = rowY + 42
        const trayX = 28
        const trayW = 1224
        const trayH = 30
        const gfx = this.add.graphics()
        gfx.fillStyle(0x000000, 0.2)
        gfx.fillRoundedRect(trayX + 4, trayY + 8, trayW, trayH, 8)
        gfx.fillStyle(0x795548, 1)
        gfx.fillRoundedRect(trayX, trayY, trayW, trayH, 7)
        gfx.fillStyle(0xA1887F, 1)
        gfx.fillRoundedRect(trayX, trayY, trayW, trayH * 0.40, { tl: 7, tr: 7, bl: 0, br: 0 })
        gfx.fillStyle(0x4E342E, 1)
        gfx.fillRoundedRect(trayX, trayY + trayH * 0.72, trayW, trayH * 0.28, { tl: 0, tr: 0, bl: 7, br: 7 })
        for (let x = 90; x < trayX + trayW - 30; x += 190) {
          gfx.fillStyle(0x6D4C41, 1)
          gfx.fillCircle(x, trayY + trayH / 2, 7)
          gfx.fillStyle(0xBCAAA4, 0.65)
          gfx.fillCircle(x - 2, trayY + trayH / 2 - 2, 3)
        }
        const edgeY = trayY + trayH
        const vineGfx = this.add.graphics()
        for (let lx = trayX + 65; lx < trayX + trayW - 30; lx += 110) {
          const jitter = ((lx * 7) % 9) - 4
          vineGfx.lineStyle(2, 0x33691E, 0.7)
          vineGfx.lineBetween(lx + jitter, edgeY, lx + jitter, edgeY + 9)
          vineGfx.fillStyle(0x558B2F, 1)
          vineGfx.fillEllipse(lx + jitter, edgeY + 13, 30, 14)
          vineGfx.fillEllipse(lx + jitter - 20, edgeY + 9, 22, 11)
          vineGfx.fillEllipse(lx + jitter + 20, edgeY + 10, 20, 11)
        }
      }
    }
  }

  private createBases() {
    this.bases = []
    for (const baseData of this.levelConfig.bases) {
      this.bases.push(this.createBase(baseData))
    }
  }

  private createBase(baseData: ClassifierBase): Phaser.GameObjects.Container {
    const w = 240
    const h = 120

    // ── children[0]: imagem do vaso ──────────────────────────────────────────
    const specificKey = this.getPlanterKey(baseData)
    let boxBody: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

    if (specificKey) {
      boxBody = this.add.image(0, 0, specificKey).setDisplaySize(w + 20, h + 60)
    } else {
      // Fallback programático (sem imagem disponível)
      const bColor = this.getBaseColor(baseData)
      const bDark = this.darkenColor(bColor, 0.58)
      const bLight = this.lightenColor(bColor, 0.32)
      const rimH = 16
      const soilH = 22
      const innerW = w - 22
      const panelW = w - 14
      const panelH = 58
      const panelY = 27
      const gfx = this.add.graphics()

      gfx.fillStyle(0x000000, 0.30)
      gfx.fillRoundedRect(-w / 2 + 7, -h / 2 + 9, w, h - 6, 12)
      gfx.fillStyle(bDark, 1)
      gfx.fillRoundedRect(-w / 2, -h / 2 + rimH, w, h - rimH - 4, 10)
      gfx.fillStyle(bColor, 1)
      gfx.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 12)
      gfx.fillStyle(bLight, 1)
      gfx.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, rimH - 5, { tl: 10, tr: 10, bl: 0, br: 0 })
      gfx.fillStyle(0x1E0E00, 1)
      gfx.fillRoundedRect(-innerW / 2, -h / 2 + rimH, innerW, soilH + 2, 4)
      gfx.fillStyle(0x5C3A1E, 0.65)
      for (let dx = -innerW / 2 + 12; dx < innerW / 2 - 6; dx += 17) {
        gfx.fillCircle(dx, -h / 2 + rimH + soilH / 2 + 1, 2)
      }
      gfx.fillStyle(0x000000, 0.14)
      gfx.fillRect(-innerW / 2, -h / 2 + rimH, 5, soilH + 2)
      gfx.fillRect(innerW / 2 - 5, -h / 2 + rimH, 5, soilH + 2)
      gfx.lineStyle(3, bDark, 1)
      gfx.strokeRoundedRect(-w / 2, -h / 2, w, h - 8, 12)
      gfx.fillStyle(0x000000, 0.16)
      gfx.fillRoundedRect(-panelW / 2 + 2, panelY - panelH / 2 + 3, panelW, panelH, 10)
      gfx.fillStyle(0xFFF8DC, 1)
      gfx.fillRoundedRect(-panelW / 2, panelY - panelH / 2, panelW, panelH, 9)
      gfx.fillStyle(0xFFFFFF, 0.52)
      gfx.fillRoundedRect(-panelW / 2 + 4, panelY - panelH / 2 + 4, panelW - 8, panelH * 0.65, { tl: 7, tr: 7, bl: 0, br: 0 })
      gfx.lineStyle(2, bDark, 0.45)
      gfx.strokeRoundedRect(-panelW / 2, panelY - panelH / 2, panelW, panelH, 9)

      const flX = -panelW / 2 + 30
      const flY = panelY - 1
      const swatch = this.add.graphics()
      swatch.fillStyle(0x000000, 0.22)
      swatch.fillRoundedRect(flX - 14 + 2, flY - 10 + 2, 28, 20, 5)
      swatch.fillStyle(bColor, 1)
      swatch.fillRoundedRect(flX - 14, flY - 10, 28, 20, 5)
      swatch.lineStyle(2, bDark, 0.65)
      swatch.strokeRoundedRect(flX - 14, flY - 10, 28, 20, 5)

      const label = this.add.text(flX + 28, panelY + 1, baseData.labelKey, {
        fontSize: '22px', fontFamily: 'Arial Black, Arial', color: '#3E2723',
      }).setOrigin(0, 0.5)

      const leafGfx = this.add.graphics()
      this.drawLeafCluster(leafGfx, -w / 2 - 2, h / 2 - 10, false)
      this.drawLeafCluster(leafGfx, w / 2 + 2, h / 2 - 10, true)

      // No fallback, o flashRect fica no índice 1 — os extras vêm depois
      const flashRectFb = this.add.rectangle(0, 0, w, h, 0xFFD700).setAlpha(0)
      const arrowFb = this.add.text(0, h / 2 + 12, '▼', { fontSize: '15px', color: '#8D6E63' }).setOrigin(0.5)
      this.tweens.add({ targets: arrowFb, y: h / 2 + 18, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      const zoneFb = this.add.zone(0, 0, w, h).setRectangleDropZone(w, h)

      const container = this.add.container(baseData.x, baseData.y,
        [gfx, flashRectFb, swatch, label, arrowFb, zoneFb, leafGfx])
      container.setData('baseData', baseData)
      return container
    }

    // ── children[1]: flashRect — obrigatoriamente no índice 1 ────────────────
    const flashRect = this.add.rectangle(0, 0, w, h, 0xFFD700).setAlpha(0)

    // ── children[2]: seta animada ─────────────────────────────────────────────
    const arrow = this.add.text(0, h / 2 + 12, '▼', { fontSize: '15px', color: '#8D6E63' }).setOrigin(0.5)
    this.tweens.add({ targets: arrow, y: h / 2 + 18, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    // ── children[3]: drop zone ────────────────────────────────────────────────
    const zone = this.add.zone(0, 0, w, h).setRectangleDropZone(w, h)

    const container = this.add.container(baseData.x, baseData.y, [boxBody, flashRect, arrow, zone])
    container.setData('baseData', baseData)
    return container
  }

  // ── Asset drawing helpers ────────────────────────────────────────────────

  private drawLeafCluster(
    gfx: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    rightSide: boolean,
  ) {
    const d = rightSide ? -1 : 1

    // Main leaf bodies
    gfx.fillStyle(0x4CAF50, 1)
    gfx.fillEllipse(x + d * 11, y - 7, 28, 14)
    gfx.fillEllipse(x + d * 17, y + 4, 22, 12)
    gfx.fillEllipse(x + d * 4, y + 6, 18, 10)

    // Darker leaf shading/outline
    gfx.lineStyle(1.5, 0x2E7D32, 0.7)
    gfx.strokeEllipse(x + d * 11, y - 7, 28, 14)
    gfx.strokeEllipse(x + d * 17, y + 4, 22, 12)
    gfx.strokeEllipse(x + d * 4, y + 6, 18, 10)

    // Vein lines
    gfx.lineStyle(1, 0x1B5E20, 0.55)
    gfx.lineBetween(x + d * 2, y - 7, x + d * 20, y - 7)
    gfx.lineBetween(x + d * 7, y + 4, x + d * 26, y + 4)
  }

  // ── Color helpers ────────────────────────────────────────────────────────

  private lightenColor(hex: number, amount: number): number {
    const r = (hex >> 16) & 0xFF
    const g = (hex >> 8) & 0xFF
    const b = hex & 0xFF
    return (
      (Math.min(255, Math.round(r + (255 - r) * amount)) << 16) |
      (Math.min(255, Math.round(g + (255 - g) * amount)) << 8) |
      Math.min(255, Math.round(b + (255 - b) * amount))
    )
  }

  private darkenColor(hex: number, factor: number): number {
    return (
      (Math.round(((hex >> 16) & 0xFF) * factor) << 16) |
      (Math.round(((hex >> 8) & 0xFF) * factor) << 8) |
      Math.round((hex & 0xFF) * factor)
    )
  }

  private createItems() {
    this.itemSprites = []
    const items = Phaser.Utils.Array.Shuffle([...this.levelConfig.items])
    const n = items.length

    if (n > 9) {
      const mid = Math.ceil(n / 2)
      this.createItemRow(items.slice(0, mid), ITEM_Y_ROW1)
      this.createItemRow(items.slice(mid), ITEM_Y_ROW2)
    } else {
      this.createItemRow(items, ITEM_Y)
    }
  }

  private createItemRow(items: typeof this.levelConfig.items, rowY: number) {
    const n = items.length
    const gap = Math.min(130, Math.floor(1100 / Math.max(1, n - 1)))
    const startX = 640 - ((n - 1) * gap) / 2
    const displayScale = Math.min(ITEM_SCALE_MAX, (gap - 10) / 120)
    const bSize = Math.round(displayScale * 110) + 28

    items.forEach((item, i) => {
      const x = startX + i * gap

      const backing = this.add.graphics()
      backing.fillStyle(0xFFFFFF, 1.0)
      backing.fillRoundedRect(-bSize / 2, -bSize / 2, bSize, bSize, bSize * 0.22)
      backing.lineStyle(1.5, 0xFFFFFF, 0.55)
      backing.strokeRoundedRect(-bSize / 2, -bSize / 2, bSize, bSize, bSize * 0.22)
      backing.setPosition(x, rowY)
      backing.setDepth(3)
      backing.setAlpha(0)
      this.itemBackings.push(backing)

      const key = this.levelConfig.level === 1
        ? `item-${item.color}-swatch-${item.size}`
        : `item-${item.color}-${item.shape}-${item.size}`

      const sprite = this.add.image(x, rowY, key) as DraggableItem
      sprite.setScale(displayScale)
      sprite.setDepth(4)
      sprite.itemData = item
      sprite.originX_ = x
      sprite.originY_ = rowY
      sprite.setAlpha(0)
      sprite.setInteractive()
      this.input.setDraggable(sprite)
      this.itemSprites.push(sprite)
    })
  }

  private startTimer() {
    if (this.hasStartedTimer) return
    this.hasStartedTimer = true
    this.timerState.progress = 1
    this.drawTimeBar(1)

    this.timerTween = this.tweens.add({
      targets: this.timerState,
      progress: 0,
      duration: this.timerDuration,
      ease: 'Linear',
      onUpdate: () => this.drawTimeBar(this.timerState.progress),
      onComplete: () => this.onTimeUp(),
    })
  }

  private createTimeBar() {
    const x = 240
    const y = 28
    const w = 800
    const h = 30

    const bg = this.add.graphics()
    bg.fillStyle(0x33190A, 0.82)
    bg.fillRoundedRect(x, y, w, h, 12)
    bg.lineStyle(3, 0x7A4A10, 0.9)
    bg.strokeRoundedRect(x, y, w, h, 12)
    bg.setDepth(6)

    this.timeBarFill = this.add.graphics()
    this.timeBarFill.setData('x', x)
    this.timeBarFill.setData('y', y)
    this.timeBarFill.setData('w', w)
    this.timeBarFill.setData('h', h)
    this.timeBarFill.setDepth(7)
    this.drawTimeBar(1)

    const shine = this.add.graphics()
    shine.fillStyle(0xFFFFFF, 0.16)
    shine.fillRoundedRect(x + 2, y + 2, w - 4, 10, { tl: 10, tr: 10, bl: 0, br: 0 })
    shine.setDepth(8)
  }

  private drawTimeBar(progress: number) {
    if (!this.timeBarFill) return
    const x = this.timeBarFill.getData('x') as number
    const y = this.timeBarFill.getData('y') as number
    const w = this.timeBarFill.getData('w') as number
    const h = this.timeBarFill.getData('h') as number
    const fill = progress > 0.5 ? COLORS.green : progress > 0.25 ? 0xFF9800 : 0xF44336
    const width = w * Phaser.Math.Clamp(progress, 0, 1)
    this.timeBarFill.clear()
    if (width > 0) {
      this.timeBarFill.fillStyle(fill, 1)
      this.timeBarFill.fillRoundedRect(x, y, width, h, h / 2)
    }
  }

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  private setupDrag() {
    this.input.on('dragstart', (_: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image) => {
      // Kill the idle floating tween so it doesn't fight the drag position
      this.tweens.killTweensOf(obj)
      obj.setDepth(10)
      this.tweens.add({ targets: obj, scaleX: 1.15, scaleY: 1.15, duration: 120 })
    })

    this.input.on(
      'drag',
      (_: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        obj.setPosition(dragX, dragY)
        obj.setAngle(7)
      },
    )

    this.input.on('dragend', (_: Phaser.Input.Pointer, obj: DraggableItem, dropped: boolean) => {
      obj.setDepth(4).setAngle(0)
      this.tweens.add({ targets: obj, scaleX: 1, scaleY: 1, duration: 120 })

      if (!dropped) {
        const hitBase = this.findBaseAtPosition(obj.x, obj.y)
        if (hitBase) {
          const baseData = hitBase.getData('baseData') as ClassifierBase
          this.validateDrop(obj, hitBase, baseData)
        } else {
          this.returnItem(obj)
        }
      }
    })

    this.input.on(
      'drop',
      (_: Phaser.Input.Pointer, obj: DraggableItem, zone: Phaser.GameObjects.Zone) => {
        const container = zone.parentContainer
        if (!container) {
          this.returnItem(obj)
          return
        }

        const baseData = container.getData('baseData') as ClassifierBase
        this.validateDrop(obj, container, baseData)
      },
    )
  }

  private findBaseAtPosition(x: number, y: number): Phaser.GameObjects.Container | null {
    const HW = 120   // half of w=240
    const HH = 59    // half of h=118

    for (const container of this.bases) {
      if (
        x >= container.x - HW &&
        x <= container.x + HW &&
        y >= container.y - HH &&
        y <= container.y + HH
      ) {
        return container
      }
    }
    return null
  }

  private validateDrop(
    item: DraggableItem,
    baseContainer: Phaser.GameObjects.Container,
    base: ClassifierBase,
  ) {
    if (this.gameEnded) return

    const attrValue = this.getItemAttrValue(item.itemData, base.rule.attribute)
    const correct = attrValue === base.rule.value

    if (correct) {
      this.hits += 1
      this.currentPoints += 5

      runtimeGameBridge.emit({
        type: 'CORRECT_ANSWER',
        gameId: GAME_ID,
        pointsEarned: 5,
        stage: this.levelConfig.level,
      })

      this.onCorrectDrop(item, baseContainer)
      return
    }

    // Erro — deduz ponto e vida
    this.errors += 1
    this.currentPoints = Math.max(0, this.currentPoints - 5)
    this.currentLives = Math.max(0, this.currentLives - 1)

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: -5,
      stage: this.levelConfig.level,
    })

    this.onWrongDrop(item, baseContainer)

    // Se ficou sem vidas, emite GAME_OVER e congela a cena (React exibe modal bloqueante)
    if (this.currentLives <= 0) {
      runtimeGameBridge.emit({
        type: 'GAME_OVER',
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      })
      this.gameEnded = true
      this.input.enabled = false
      this.timerTween?.stop()
    }
  }

  private onCorrectDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container) {
    item.setVisible(false)
    item.disableInteractive()

    // list[1] is the flashRect — gold overlay flash
    const flashRect = baseContainer.list[1] as Phaser.GameObjects.Rectangle
    flashRect.setFillStyle(0xFFD700).setAlpha(0.5)
    this.tweens.add({
      targets: flashRect,
      alpha: 0,
      duration: 500,
      ease: 'Power2.Out',
    })

    this.tweens.add({
      targets: baseContainer,
      scaleX: { from: 1, to: 1.12 },
      scaleY: { from: 1, to: 1.12 },
      yoyo: true,
      duration: 140,
    })

    this.playCorrect()
    this.showCorrectEffect(item.originX_, item.originY_)
    this.emitProgress()
    this.checkRoundComplete()
  }

  private onWrongDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container) {
    this.playWrong()
    this.returnItem(item)

    const origX = (baseContainer.getData('baseData') as ClassifierBase).x

    this.tweens.add({
      targets: baseContainer,
      x: { from: origX - 10, to: origX + 10 },
      yoyo: true,
      duration: 55,
      repeat: 4,
      onComplete: () => baseContainer.setX(origX),
    })

    const xText = this.add
      .text(item.x, item.y - 20, '✖', {
        fontSize: '36px',
        color: '#E74C3C',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20)

    this.tweens.add({
      targets: xText,
      y: item.y - 70,
      alpha: { from: 1, to: 0 },
      duration: 600,
      onComplete: () => xText.destroy(),
    })

    this.emitProgress()
  }

  private returnItem(item: DraggableItem) {
    this.tweens.add({
      targets: item,
      x: item.originX_,
      y: item.originY_,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      ease: 'Back.Out',
      duration: 380,
      onComplete: () => {
        if (!item.active || !item.visible) return
        this.tweens.add({
          targets: item,
          y: item.originY_ - 6,
          duration: 1100 + Math.random() * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: Math.random() * 400,
        })
      },
    })
  }

  private showCorrectEffect(x: number, y: number) {
    const emojis = ['⭐', '✨', '🌟', '🌸', '💛', '🍀']

    // Radial emoji burst
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const dist = 60 + Math.random() * 55
      const star = this.add
        .text(x, y, emojis[i % emojis.length], {
          fontSize: `${20 + Math.floor(Math.random() * 16)}px`,
        })
        .setOrigin(0.5)
        .setDepth(20)

      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: { from: 1, to: 0 },
        scaleX: { from: 1.2, to: 0.1 },
        scaleY: { from: 1.2, to: 0.1 },
        duration: 580 + Math.random() * 280,
        ease: 'Power2',
        onComplete: () => star.destroy(),
      })
    }

    // Expanding ring burst
    const ringGfx = this.add.graphics().setDepth(19)
    ringGfx.lineStyle(4, 0xFFD700, 1)
    ringGfx.strokeCircle(x, y, 8)
    this.tweens.add({
      targets: ringGfx,
      scaleX: 4,
      scaleY: 4,
      alpha: { from: 1, to: 0 },
      duration: 380,
      ease: 'Power2.Out',
      onComplete: () => ringGfx.destroy(),
    })

    // Checkmark that floats up
    const check = this.add
      .text(x, y - 10, '✅', { fontSize: '46px' })
      .setOrigin(0.5)
      .setDepth(20)

    this.tweens.add({
      targets: check,
      y: y - 80,
      scaleX: { from: 0.5, to: 1 },
      scaleY: { from: 0.5, to: 1 },
      alpha: { from: 1, to: 0 },
      duration: 720,
      ease: 'Power2.easeOut',
      onComplete: () => check.destroy(),
    })
  }

  private checkRoundComplete() {
    const remaining = this.itemSprites.filter((s) => s.visible).length

    if (remaining === 0) {
      runtimeGameBridge.emit({
        type: 'GAME_COMPLETED',
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      })

      this.endRound()
    }
  }

  private endRound() {
    this.gameEnded = true
    this.input.enabled = false
    this.timerTween?.stop()

    const result: RoundResult = {
      gameCode: 'EF01CO01',
      level: this.levelConfig.level,
      criterion: this.levelConfig.criterion,
      hits: this.hits,
      errors: this.errors,
      durationMs: Date.now() - this.startTime,
      timestamp: Date.now(),
    }

    this.time.delayedCall(1800, () => {
      EventBus.emit('round-complete', result)
    })

    if (this.levelConfig.level < 3) {
      const nextLevel = (this.levelConfig.level + 1) as 1 | 2 | 3
      this.showLevelCompleteScreen(nextLevel)
    } else {
      this.showFinalCompleteScreen()
    }
  }

  private onTimeUp() {
    this.gameEnded = true
    this.input.enabled = false
    this.timerTween?.stop()
    this.drawTimeBar(0)
    this.playTimeUp()
    this.errors += 1
    this.currentPoints = Math.max(0, this.currentPoints - 5)
    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: 0,
      stage: this.levelConfig.level,
    })
    this.showGameOverScreen()
  }

  private revealItems() {
    this.itemBackings.forEach((backing, i) => {
      this.tweens.add({
        targets: backing,
        alpha: 0.65,
        delay: i * 85,
        duration: 320,
        ease: 'Back.Out',
      })
    })

    this.itemSprites.forEach((sprite, i) => {
      this.tweens.add({
        targets: sprite,
        alpha: 1,
        scaleX: { from: 0.4, to: 1 },
        scaleY: { from: 0.4, to: 1 },
        y: { from: sprite.originY_ + 30, to: sprite.originY_ },
        delay: i * 85,
        duration: 320,
        ease: 'Back.Out',
        onComplete: () => {
          if (!sprite.active) return
          this.tweens.add({
            targets: sprite,
            y: sprite.originY_ - 6,
            duration: 1100 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Math.random() * 700,
          })
        },
      })
    })
  }

  private emitProgress() {
    const total = this.itemSprites.length
    const remaining = this.itemSprites.filter((s) => s.visible).length
    const answered = total - remaining
    const pct = total > 0 ? answered / total : 0

    EventBus.emit('update-progress', {
      pct,
      hits: this.hits,
      errors: this.errors,
    })

    this.emitCheckpoint()
  }

  private emitCheckpoint() {
    const total = this.itemSprites.length
    const remaining = this.itemSprites.filter((s) => s.visible).length
    const answered = total - remaining
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0

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

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand(
      (command: PlatformCommand) => {
        switch (command.type) {
          case 'START_GAME': {
            if (command.gameId !== GAME_ID) return

            const shouldRestart = command.stage !== this.levelConfig.level

            if (shouldRestart) {
              this.scene.restart({
                level: command.stage as 1 | 2 | 3,
                points: command.points,
                lives: command.lives,
              })
            } else {
              this.currentPoints = command.points
              this.currentLives = command.lives
            }

            return
          }

          case 'PAUSE_GAME': {
            if (!this.scene.isPaused()) {
              this.scene.pause()
            }
            return
          }

          case 'RESUME_GAME': {
            if (this.scene.isPaused()) {
              this.scene.resume()
            }
            return
          }

          case 'UNLOCK_GAME': {
            if (command.gameId !== GAME_ID) return
            return
          }
        }
      },
    )
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private getItemAttrValue(item: GameItem, attribute: string): string {
    if (attribute === 'cor') return item.color
    if (attribute === 'forma') return item.shape
    if (attribute === 'tamanho') return item.size
    return ''
  }

  private getPlanterKey(baseData: ClassifierBase): string | null {
    const { attribute, value } = baseData.rule
    if (attribute === 'cor') {
      const map: Record<string, string> = {
        vermelho: 'planter-box-red',
        azul: 'planter-box-blue',
        verde: 'planter-box-green',
        amarelo: 'planter-box-yellow',
      }
      const key = map[value]
      return key && this.textures.exists(key) ? key : null
    }
    if (attribute === 'forma') {
      const map: Record<string, string> = {
        circulo: 'planter-box-purple-circle',
        quadrado: 'planter-box-red-square',
        triangulo: 'planter-box-blue-triangle',
        retangulo: 'planter-box-green-rectangle',
      }
      const key = map[value]
      return key && this.textures.exists(key) ? key : null
    }
    return null
  }

  private getBaseColor(baseData: ClassifierBase): number {
    const { attribute, value } = baseData.rule

    if (attribute === 'cor') {
      const map: Record<string, number> = {
        vermelho: 0xe53935,
        azul: 0x1e88e5,
        verde: 0x43a047,
        amarelo: 0xfdd835,
        roxo: 0x8e24aa,
      }
      return map[value] ?? 0x9e9e9e
    }

    if (attribute === 'forma') {
      const map: Record<string, number> = {
        circulo: 0xab47bc,
        quadrado: 0xff7043,
        triangulo: 0x26c6da,
        retangulo: 0x8bc34a,
      }
      return map[value] ?? 0x9e9e9e
    }

    return 0xffb300
  }

  // ── Áudio sintético (Web Audio API) ─────────────────────────────────────────

  private getAudioContext(): AudioContext | null {
    if (!('context' in this.sound)) return null
    return (this.sound as Phaser.Sound.WebAudioSoundManager).context
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.25,
    delaySeconds = 0,
  ) {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delaySeconds)
    gain.gain.setValueAtTime(volume, ctx.currentTime + delaySeconds)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delaySeconds + duration)

    osc.start(ctx.currentTime + delaySeconds)
    osc.stop(ctx.currentTime + delaySeconds + duration + 0.01)
  }

  private playCorrect() {
    this.playTone(523, 0.12, 'sine', 0.28, 0.00)  // C5
    this.playTone(659, 0.12, 'sine', 0.28, 0.10)  // E5
    this.playTone(784, 0.20, 'sine', 0.32, 0.20)  // G5
  }

  private playWrong() {
    this.playTone(220, 0.10, 'square', 0.18, 0.00)
    this.playTone(196, 0.10, 'square', 0.14, 0.10)
    this.playTone(165, 0.18, 'square', 0.10, 0.20)
  }

  private playRoundComplete() {
    const notes = [262, 330, 392, 523]  // C4-E4-G4-C5
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.20, 'sine', 0.30, i * 0.13)
    })
  }

  private playTimeUp() {
    this.playTone(392, 0.15, 'sine', 0.24, 0.00)  // G4
    this.playTone(349, 0.15, 'sine', 0.20, 0.18)  // F4
    this.playTone(294, 0.30, 'sine', 0.18, 0.36)  // D4
  }

  private playGo() {
    this.playTone(784, 0.10, 'sine', 0.28, 0.00)  // G5
    this.playTone(1046, 0.20, 'sine', 0.32, 0.10) // C6
  }


}
