// DEPOIS
import { APP_DEFS, type AppDef, type AppId, type LevelConfig, type MissionStep } from '../types'
import { LEVELS } from '../data/levels'
import {
  EventBus

} from '../../../shared/EventBus.js'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge.js'
import { PlatformCommand } from '../../../shared/contracts/platformCommands.js'
import { RoundResult } from '../../../shared/types/game.js'

const WIN_W = 470
const WIN_H = 400
const HEADER_H = 54
const CONTENT_TOP = -(WIN_H / 2) + HEADER_H   // -146
const CONTENT_H = WIN_H - HEADER_H            // 346
const CONTENT_CY = CONTENT_TOP + CONTENT_H / 2 // 27
const TASKBAR_TOP = 656
const GAME_ID = 'desktop-digital-infantil'
const DOUBLE_TAP_MS = 380

// ── Drag state ───────────────────────────────────────────────────────────────

interface DragState {
  container: Phaser.GameObjects.Container
  offX: number
  offY: number
}

// ── Drawing state ─────────────────────────────────────────────────────────────

interface DesenhoState {
  container: Phaser.GameObjects.Container | null
  gfx: Phaser.GameObjects.Graphics | null
  readyBtn: Phaser.GameObjects.Container | null
  tapCount: number
  drawColor: number
}

export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig

  // Platform integration
  private currentPoints = 0
  private currentLives = 1
  private startTime = 0
  private isMuted = false
  private unsubscribePlatformCommands?: () => void

  // Mission tracking
  private missionIndex = 0     // índice da missão atual no array
  private stepIndex = 0        // índice do passo atual dentro da missão
  private completedMissions = 0

  private openWindows: Map<AppId, Phaser.GameObjects.Container> = new Map()
  private windowDepth = 20
  private dragging: DragState | null = null
  private hintActive = false

  private lastTapTime: Partial<Record<AppId, number>> = {}
  private gravadorState: 'idle' | 'recording' | 'stopped' = 'idle'
  private gravadorSaved = false
  private gravadorStatusText: Phaser.GameObjects.Text | null = null
  private desenho: DesenhoState = { container: null, gfx: null, readyBtn: null, tapCount: 0, drawColor: 0x3498DB }
  private calcDisplay = ''
  private calcText: Phaser.GameObjects.Text | null = null

  // Relógio
  private relogioHands: Phaser.GameObjects.Graphics | null = null
  private relogioDigital: Phaser.GameObjects.Text | null = null

  private pastaFilesDone = 0
  private pastaTotal = 3
  private pastaConfirmBtn: Phaser.GameObjects.Container | null = null

  private checklistDots: Array<{ dot: Phaser.GameObjects.Graphics; x: number; y: number; label: Phaser.GameObjects.Text }> = []
  private checklistCounter: Phaser.GameObjects.Text | null = null

  private timeBarFill?: Phaser.GameObjects.Graphics
  private timerTween?: Phaser.Tweens.Tween
  private timerState = { progress: 1 }

  private gravadorRecTimerEvent: Phaser.Time.TimerEvent | null = null

  private closingWindows: Set<AppId> = new Set()

  private taskbarClock: Phaser.GameObjects.Text | null = null
  private missionEffectActive = false

  private gameEnded = false

  // Fluxo padrão da plataforma
  private levelStarted = false
  private hasStartedTimer = false

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
    this.missionIndex = 0
    this.stepIndex = 0
    this.completedMissions = 0
    this.startTime = Date.now()
    this.currentPoints = data?.points ?? 0
    this.currentLives = data?.lives ?? 1
    this.openWindows.clear()
    this.dragging = null
    this.gravadorState = 'idle'
    this.desenho = { container: null, gfx: null, readyBtn: null, tapCount: 0, drawColor: 0x3498DB }
    this.calcDisplay = ''
    this.calcText = null
    this.gravadorStatusText = null
    this.lastTapTime = {}
    this.gravadorRecTimerEvent = null
    this.closingWindows = new Set()
    this.missionEffectActive = false
    this.gameEnded = false
    this.timerTween?.stop()
    this.timerTween = undefined
    this.timerState.progress = 1
    this.levelStarted = false
    this.hasStartedTimer = false
    this.relogioHands = null
    this.relogioDigital = null
    this.pastaFilesDone = 0
    this.pastaConfirmBtn = null
    this.checklistDots = []
    this.gravadorSaved = false
    this.checklistCounter = null
  }

  create() {
    this.createDesktop()
    this.createAppIcons()
    this.createChecklist()
    this.createShutdownButton()
    this.createTimerBar()
    this.createHudButtons()
    this.registerPlatformCommands()

    this.input.on('pointerup', () => { this.dragging = null })

    EventBus.on('app-action', this.onAppAction, this)

    this.showStartScreen()
  }

  update() {
    // Drag de janela
    if (this.dragging && this.input.activePointer.isDown) {
      const ptr = this.input.activePointer
      this.dragging.container.setPosition(
        Phaser.Math.Clamp(ptr.x + this.dragging.offX, WIN_W / 2, 1280 - WIN_W / 2),
        Phaser.Math.Clamp(ptr.y + this.dragging.offY, 148 + WIN_H / 2, TASKBAR_TOP - WIN_H / 2),
      )
    }

    // Desenho livre
    if (this.desenho.container && this.desenho.gfx && this.input.activePointer.isDown) {
      const ptr = this.input.activePointer
      const cx = this.desenho.container.x
      const cy = this.desenho.container.y
      const lx = ptr.x - cx
      const ly = ptr.y - cy
      // Limites da área de desenho (local)
      if (lx > -165 && lx < 165 && ly > CONTENT_TOP + 6 && ly < CONTENT_TOP + 180) {
        this.desenho.gfx.fillStyle(this.desenho.drawColor, 1)
        this.desenho.gfx.fillCircle(lx, ly, 6)
        this.desenho.tapCount++
        if (this.desenho.tapCount > 12 && this.desenho.readyBtn) {
          this.desenho.readyBtn.setAlpha(1)
        }
      }
    }
  }

  shutdown() {
    this.timerTween?.stop()
    this.timerTween = undefined
    this.gravadorRecTimerEvent?.destroy()
    this.gravadorRecTimerEvent = null
    EventBus.off('app-action', this.onAppAction, this)
    this.unsubscribePlatformCommands?.()
    this.unsubscribePlatformCommands = undefined
  }

  // DEPOIS
  private createDesktop() {
    this.add.image(640, 328, 'desktop-bg').setOrigin(0.5).setDisplaySize(1280, 656)
    this.createTaskbar()
  }

  private createTaskbar() {
    const H = 720 - TASKBAR_TOP

    const bar = this.add.graphics().setDepth(7)
    bar.fillStyle(0x071828, 0.97)
    bar.fillRect(0, TASKBAR_TOP, 1280, H)
    bar.lineStyle(2, 0x2E86C1, 0.7)
    bar.lineBetween(0, TASKBAR_TOP, 1280, TASKBAR_TOP)

    const startBtn = this.add.graphics().setDepth(8)
    startBtn.fillStyle(0x1A3A6B, 1)
    startBtn.fillRoundedRect(14, TASKBAR_TOP + 10, 190, H - 20, 8)
    startBtn.lineStyle(1.5, 0x2E86C1, 0.8)
    startBtn.strokeRoundedRect(14, TASKBAR_TOP + 10, 190, H - 20, 8)

    const logo = this.add.graphics().setDepth(9)
    logo.fillStyle(0x5DADE2, 1)
    logo.fillRoundedRect(28, TASKBAR_TOP + 20, 15, 15, 3)
    logo.fillStyle(0x2ECC71, 1)
    logo.fillRoundedRect(46, TASKBAR_TOP + 20, 15, 15, 3)

    this.add.text(72, TASKBAR_TOP + H / 2, 'Meu Computador', {
      fontSize: '13px', color: '#AED6F1', fontFamily: 'Arial Black',
    }).setOrigin(0, 0.5).setDepth(9)

    this.taskbarClock = this.add.text(1090, TASKBAR_TOP + H / 2, '9:22', {
      fontSize: '19px', color: '#AED6F1', fontFamily: 'Courier New, monospace',
    }).setOrigin(1, 0.5).setDepth(9)
  }

  private createAppIcons() {
    const apps = this.levelConfig.availableApps
    const positions = this.computeIconPositions(apps.length)

    apps.forEach((appId, i) => {
      const def = APP_DEFS.find(a => a.id === appId)!
      const pos = positions[i]
      this.createIcon(def, pos.x, pos.y)
    })
  }

  private computeIconPositions(count: number): { x: number; y: number }[] {
    const COL1_X = 108, COL2_X = 252
    const ROW_Y = [215, 390, 560]
    const rows = Math.ceil(count / 2)
    const pos: { x: number; y: number }[] = []

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 2; c++) {
        if (pos.length >= count) break
        pos.push({ x: c === 0 ? COL1_X : COL2_X, y: ROW_Y[r] ?? 215 + r * 175 })
      }
    }
    return pos
  }

  private createIcon(def: AppDef, x: number, y: number) {
    const ICON_SIZE = 136
    const CORNER_R = 22

    // Máscara arredondada para remover o fundo quadrado dos PNGs
    const maskGfx = this.make.graphics({}, false)
    maskGfx.fillStyle(0xffffff)
    maskGfx.fillRoundedRect(x - ICON_SIZE / 2, y - ICON_SIZE / 2, ICON_SIZE, ICON_SIZE, CORNER_R)

    const iconImg = this.add.image(0, 0, `icon-${def.id}`).setDisplaySize(ICON_SIZE, ICON_SIZE)
    iconImg.setMask(maskGfx.createGeometryMask())

    const label = this.add.text(0, ICON_SIZE / 2 + 6, def.label, {
      fontSize: '16px', color: '#FFFFFF', fontFamily: 'Arial Black, Arial',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0)

    const hitZone = this.add.zone(0, 0, ICON_SIZE + 10, ICON_SIZE + 34)
      .setInteractive({ useHandCursor: true })

    hitZone.on('pointerdown', () => this.handleIconTap(def.id))
    hitZone.on('pointerover', () => iconImg.setTint(0xDDEEFF))
    hitZone.on('pointerout', () => iconImg.clearTint())

    const container = this.add.container(x, y, [iconImg, label, hitZone])
    container.setDepth(5)

    container.setAlpha(0).setScale(0.7)
    const idx = this.levelConfig.availableApps.indexOf(def.id)
    this.tweens.add({
      targets: container, alpha: 1, scaleX: 1, scaleY: 1,
      delay: 200 + idx * 80, duration: 300, ease: 'Back.Out',
    })
  }

  private handleIconTap(appId: AppId) {
    if (!this.levelStarted || this.gameEnded) return

    this.startTimerOnce()

    const now = Date.now()
    const last = this.lastTapTime[appId] ?? 0

    if (now - last < DOUBLE_TAP_MS) {
      this.openApp(appId)
      this.lastTapTime[appId] = 0
    } else {
      this.lastTapTime[appId] = now
      // Feedback de 1º toque
      this.playTone(660, 0.05)
    }
  }

  // ── Sistema de janelas ────────────────────────────────────────────────────

  private openApp(appId: AppId) {
    if (this.openWindows.has(appId)) {
      this.bringToFront(appId)
      return
    }

    this.playWindowOpen()

    const def = APP_DEFS.find(a => a.id === appId)!
    const cx = Phaser.Math.Between(300, 700)
    const cy = Phaser.Math.Between(360, 450)
    const win = this.createWindow(def, cx, cy)

    this.windowDepth += 10
    win.setDepth(this.windowDepth)
    this.openWindows.set(appId, win)

    // Animação de abertura
    win.setScale(0.5).setAlpha(0)
    this.tweens.add({ targets: win, scaleX: 1, scaleY: 1, alpha: 1, duration: 220, ease: 'Back.Out' })
  }

  private createWindow(def: AppDef, cx: number, cy: number): Phaser.GameObjects.Container {
    // Sombra
    const shadow = this.add.rectangle(10, 10, WIN_W + 4, WIN_H + 4, 0x000000, 0.35)

    // Corpo
    const body = this.add.rectangle(0, 0, WIN_W, WIN_H, def.bodyColor)
      .setStrokeStyle(2, def.headerColor)

    // Área de conteúdo interna (fundo levemente diferenciado)
    const contentAreaY = CONTENT_TOP + CONTENT_H / 2
    const contentBg = this.add.graphics()
    const lightened = Phaser.Display.Color.ValueToColor(def.bodyColor).brighten(12).color
    contentBg.fillStyle(lightened, 1)
    contentBg.fillRoundedRect(-(WIN_W / 2) + 10, CONTENT_TOP + 8, WIN_W - 20, CONTENT_H - 16, 8)
    void contentAreaY

    // Header com gradiente simulado (retângulo principal + faixa de brilho)
    const header = this.add.rectangle(0, -(WIN_H / 2) + HEADER_H / 2, WIN_W, HEADER_H, def.headerColor)
    const headerShine = this.add.graphics()
    headerShine.fillStyle(0xFFFFFF, 0.12)
    headerShine.fillRoundedRect(-(WIN_W / 2), -(WIN_H / 2), WIN_W, HEADER_H / 2, { tl: 0, tr: 0, bl: 0, br: 0 })

    const titleDot = this.add.graphics()
    titleDot.fillStyle(0xFFFFFF, 0.85)
    titleDot.fillRoundedRect(-(WIN_W / 2) + 18, -(WIN_H / 2) + HEADER_H / 2 - 8, 16, 16, 4)

    const titleTxt = this.add.text(
      -(WIN_W / 2) + 44, -(WIN_H / 2) + HEADER_H / 2,
      def.label,
      { fontSize: '22px', color: '#FFFFFF', fontFamily: 'Arial Black, Arial' },
    ).setOrigin(0, 0.5)

    // Botão fechar (maior, mais fácil de tocar)
    const closeBg = this.add.rectangle(WIN_W / 2 - 24, -(WIN_H / 2) + HEADER_H / 2, 38, 36, 0xE74C3C)
      .setStrokeStyle(1, 0xFFFFFF, 0.3)
    const closeTxt = this.add.text(WIN_W / 2 - 24, -(WIN_H / 2) + HEADER_H / 2, '✕', {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial Black',
    }).setOrigin(0.5)

    const contentItems = this.createAppContent(def.id)

    const container = this.add.container(cx, cy, [
      shadow, body, contentBg, header, headerShine, titleDot, titleTxt, closeBg, closeTxt,
      ...contentItems,
    ])

    // Drag pelo header
    header.setInteractive({ useHandCursor: true })
    header.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      this.dragging = {
        container,
        offX: container.x - ptr.x,
        offY: container.y - ptr.y,
      }
      this.bringToFront(def.id)
    })

    // Fechar janela
    closeBg.setInteractive({ useHandCursor: true })
    closeBg.on('pointerover', () => closeBg.setFillStyle(0xC0392B))
    closeBg.on('pointerout', () => closeBg.setFillStyle(0xE74C3C))
    closeBg.on('pointerdown', () => this.closeWindow(def.id))

    closeTxt.setInteractive({ useHandCursor: true })
    closeTxt.on('pointerdown', () => this.closeWindow(def.id))

    // Armazena referência de desenho após container criado
    if (def.id === 'desenho') {
      this.desenho.container = container
    }

    return container
  }

  private getActiveStep(appId: AppId): MissionStep | null {
    const mission = this.levelConfig.missions[this.missionIndex]
    const step = mission?.steps[this.stepIndex]
    return step && step.appId === appId ? step : null
  }

  private fmt(h: number, m: number) {
    return `${h}:${String(m).padStart(2, '0')}`
  }

  private createRelogioContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []
    const step = this.getActiveStep('relogio')
    const start = step?.clockStart ?? { h: 8, m: 45 }
    const target = step?.clockTarget ?? { h: 9, m: 0 }

    let curH = start.h
    let curM = start.m

    const CX = 0
    const CY = CONTENT_TOP + 72
    const R = 56

    const face = this.add.graphics()
    face.fillStyle(0x0A1F38, 1)
    face.fillCircle(CX, CY, R)
    face.lineStyle(4, 0x2E86C1, 0.95)
    face.strokeCircle(CX, CY, R)
    objects.push(face)

    const marks = this.add.graphics()
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180
      const isMain = i % 3 === 0
      marks.lineStyle(isMain ? 3 : 1.5, 0xAED6F1, isMain ? 0.9 : 0.45)
      marks.lineBetween(
        CX + Math.cos(a) * (R - (isMain ? 13 : 8)),
        CY + Math.sin(a) * (R - (isMain ? 13 : 8)),
        CX + Math.cos(a) * (R - 3),
        CY + Math.sin(a) * (R - 3),
      )
    }
    objects.push(marks)

    const hands = this.add.graphics()
    this.relogioHands = hands
    this.drawClockHands(hands, CX, CY, R, curH, curM)
    objects.push(hands)

    const digitalY = CY + R + 30
    const digital = this.add.text(0, digitalY, this.fmt(curH, curM), {
      fontSize: '34px', color: '#5DADE2', fontFamily: 'Courier New, monospace',
      stroke: '#071428', strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2)
    this.relogioDigital = digital
    objects.push(digital)

    const targetY = digitalY + 34
    objects.push(
      this.add.text(0, targetY, `Ajuste para ${this.fmt(target.h, target.m)}`, {
        fontSize: '18px', color: '#F9E79F', fontFamily: 'Arial Black',
      }).setOrigin(0.5).setResolution(2),
    )

    const refresh = () => {
      this.drawClockHands(hands, CX, CY, R, curH, curM)
      digital.setText(this.fmt(curH, curM))
      const ok = curH === target.h && curM === target.m
      digital.setColor(ok ? '#2ECC71' : '#5DADE2')
    }

    const ctrlY = targetY + 42
    objects.push(this.add.text(-176, ctrlY, 'Hora', {
      fontSize: '15px', color: '#AED6F1', fontFamily: 'Arial Black',
    }).setOrigin(0, 0.5))
    objects.push(this.createButton(-72, ctrlY, 52, 42, '-', 0x1A3A6B, () => {
      curH = curH <= 1 ? 12 : curH - 1; refresh()
    }))
    objects.push(this.createButton(-12, ctrlY, 52, 42, '+', 0x1A3A6B, () => {
      curH = curH >= 12 ? 1 : curH + 1; refresh()
    }))

    const ctrlY2 = ctrlY + 52
    objects.push(this.add.text(-176, ctrlY2, 'Minuto', {
      fontSize: '15px', color: '#AED6F1', fontFamily: 'Arial Black',
    }).setOrigin(0, 0.5))
    objects.push(this.createButton(-72, ctrlY2, 52, 42, '-15', 0x1A3A6B, () => {
      curM = (curM - 15 + 60) % 60; refresh()
    }))
    objects.push(this.createButton(-12, ctrlY2, 52, 42, '+15', 0x1A3A6B, () => {
      curM = (curM + 15) % 60; refresh()
    }))

    let synced = false
    const confirmBtn = this.createButton(112, ctrlY + 26, 150, 56, 'Confirmar', 0x1E8449, () => {
      if (synced || this.gameEnded) return
      if (curH !== target.h || curM !== target.m) {
        this.playTone(220, 0.12, 'square', 0.12)
        this.cameras.main.shake(140, 0.003)
        return
      }
      synced = true
      this.taskbarClock?.setText(this.fmt(curH, curM))
      EventBus.emit('app-action', { appId: 'relogio', actionKey: 'set-time' })
    })
    objects.push(confirmBtn)

    this.taskbarClock?.setText(this.fmt(curH, curM))
    return objects
  }



  private closeWindow(appId: AppId) {
    // Guard: prevents double-close when both closeBg and closeTxt fire pointerdown
    if (this.closingWindows.has(appId)) return
    const win = this.openWindows.get(appId)
    if (!win) return

    this.closingWindows.add(appId)

    // Stop gravador recording animation before the container is destroyed
    if (appId === 'gravador') {
      this.gravadorRecTimerEvent?.destroy()
      this.gravadorRecTimerEvent = null
      this.gravadorState = 'idle'
    }

    this.playWindowClose()

    this.tweens.add({
      targets: win, scaleX: 0.5, scaleY: 0.5, alpha: 0,
      duration: 180, ease: 'Power2',
      onComplete: () => {
        win.destroy()
        this.openWindows.delete(appId)
        this.closingWindows.delete(appId)
        if (appId === 'desenho') {
          this.desenho.container = null
          this.desenho.gfx = null
          this.desenho.readyBtn = null
          this.desenho.tapCount = 0
        }
        if (appId === 'gravador') {
          this.gravadorStatusText = null
        }
        if (appId === 'calculadora') {
          this.calcDisplay = ''
          this.calcText = null
        }
      },
    })
  }

  private bringToFront(appId: AppId) {
    const win = this.openWindows.get(appId)
    if (!win) return
    this.windowDepth += 5
    win.setDepth(this.windowDepth)
  }

  // ── Timer Bar ───────────────────────────────────────────────

  private createTimerBar() {
    const x = 240, y = 28, w = 800, h = 30

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
    const fill = progress > 0.5 ? 0x2ECC71 : progress > 0.25 ? 0xF39C12 : 0xE74C3C
    const width = w * Phaser.Math.Clamp(progress, 0, 1)
    this.timeBarFill.clear()
    if (width > 0) {
      this.timeBarFill.fillStyle(fill, 1)
      this.timeBarFill.fillRoundedRect(x, y, width, h, h / 2)
    }
  }

  private createHudButtons() {
    let muted = false

    const muteBg = this.add.rectangle(1248, 18, 48, 38, 0x0A1628, 0.85)
      .setStrokeStyle(1.5, 0x2E86C1).setInteractive({ useHandCursor: true }).setDepth(6)

    muteBg.on('pointerdown', () => {
      muted = !muted
      EventBus.emit('mute-audio', muted)
      this.handleMuteAudio(muted)
    })
    muteBg.on('pointerover', () => muteBg.setFillStyle(0x1A2A3A))
    muteBg.on('pointerout', () => muteBg.setFillStyle(0x0A1628, 0.85))

    const insBg = this.add.rectangle(1192, 18, 48, 38, 0x0A1628, 0.85)
      .setStrokeStyle(1.5, 0x2E86C1).setInteractive({ useHandCursor: true }).setDepth(6)

    insBg.on('pointerdown', () => this.onShowInstructions())
    insBg.on('pointerover', () => insBg.setFillStyle(0x1A2A3A))
    insBg.on('pointerout', () => insBg.setFillStyle(0x0A1628, 0.85))
  }

  private createChecklist() {
    const missions = this.levelConfig.missions
    const ITEM_H = 54
    const PAD = 16
    const TITLE_H = 46
    const FOOT_H = 36
    const W = 388
    const H = TITLE_H + missions.length * ITEM_H + PAD * 2 + FOOT_H
    const PX = 976
    const PY = 72 + H / 2

    // Sombra
    const shadow = this.add.graphics().setDepth(8)
    shadow.fillStyle(0x000000, 0.30)
    shadow.fillRoundedRect(PX - W / 2 + 5, PY - H / 2 + 5, W, H, 12)

    // Fundo
    const bg = this.add.graphics().setDepth(9)
    bg.fillStyle(0x071828, 0.94)
    bg.fillRoundedRect(PX - W / 2, PY - H / 2, W, H, 12)
    bg.lineStyle(2.5, 0x2E86C1, 0.75)
    bg.strokeRoundedRect(PX - W / 2, PY - H / 2, W, H, 12)

    // Cabeçalho
    const hdr = this.add.graphics().setDepth(9)
    hdr.fillStyle(0x1A3A6B, 1)
    hdr.fillRoundedRect(PX - W / 2, PY - H / 2, W, TITLE_H, { tl: 12, tr: 12, bl: 0, br: 0 })

    this.add.text(PX, PY - H / 2 + TITLE_H / 2, `Missões — Nível ${this.levelConfig.level}`, {
      fontSize: '19px', color: '#AED6F1', fontFamily: 'Arial Black',
    }).setOrigin(0.5).setDepth(10).setResolution(2)

    // Itens
    const dotX = PX - W / 2 + 22
    const labelX = PX - W / 2 + 46

    missions.forEach((mission, i) => {
      const itemY = PY - H / 2 + TITLE_H + PAD + i * ITEM_H + ITEM_H / 2

      if (i > 0) {
        const sep = this.add.graphics().setDepth(9)
        sep.lineStyle(1, 0x1E3A5A, 0.55)
        sep.lineBetween(PX - W / 2 + 12, itemY - ITEM_H / 2,
          PX + W / 2 - 12, itemY - ITEM_H / 2)
      }

      const dot = this.add.graphics().setDepth(10)
      this.drawChecklistDot(dot, dotX, itemY, false)

      const label = this.add.text(labelX, itemY, mission.text, {
        fontSize: '17px', color: '#D6E8F5', fontFamily: 'Arial',
        wordWrap: { width: W - 56, useAdvancedWrap: true },
        lineSpacing: 3,
      }).setOrigin(0, 0.5).setDepth(10).setResolution(2)

      this.checklistDots.push({ dot, x: dotX, y: itemY, label })
    })

    // Rodapé — contador
    const counterY = PY + H / 2 - FOOT_H / 2
    this.checklistCounter = this.add.text(PX, counterY, `0 / ${missions.length} concluídas`, {
      fontSize: '16px', color: '#5D8AAD', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(10).setResolution(2)
  }

  private drawChecklistDot(
    dot: Phaser.GameObjects.Graphics,
    x: number, y: number,
    completed: boolean,
  ) {
    dot.clear()
    const R = 9
    if (completed) {
      dot.fillStyle(0x2ECC71, 1)
      dot.fillCircle(x, y, R)
      dot.lineStyle(2.5, 0xFFFFFF, 0.95)
      dot.lineBetween(x - 5, y, x - 1.5, y + 4)
      dot.lineBetween(x - 1.5, y + 4, x + 5, y - 4)
    } else {
      dot.fillStyle(0x1E2C3A, 1)
      dot.fillCircle(x, y, R)
      dot.lineStyle(2, 0x5D7A8A, 0.8)
      dot.strokeCircle(x, y, R)
    }
  }

  private updateChecklist() {
    this.checklistDots.forEach((item, i) => {
      if (i < this.completedMissions) {
        this.drawChecklistDot(item.dot, item.x, item.y, true)
        item.dot.setScale(0.4)
        this.tweens.add({
          targets: item.dot, scaleX: 1, scaleY: 1, duration: 380, ease: 'Back.Out',
        })
        item.label.setColor('#4A7A5A').setAlpha(0.65)
      }
    })
    if (this.checklistCounter) {
      this.checklistCounter.setText(`${this.completedMissions} / ${this.levelConfig.missions.length} concluídas`)
    }
  }

  private createShutdownButton() {
    const x = 1214, y = TASKBAR_TOP + 32
    const btn = this.add.container(x, y).setDepth(8)

    let iconObj: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    let setHover: (hover: boolean) => void

    if (this.textures.exists('icon-power')) {
      const img = this.add.image(0, 0, 'icon-power').setDisplaySize(34, 34)
      iconObj = img
      setHover = (hover) => {
        img.setTint(hover ? 0xFF6B6B : 0xFFFFFF)
        img.setAlpha(hover ? 1 : 0.85)
      }
    } else {
      const g = this.add.graphics()
      const draw = (color: number) => {
        g.clear()
        g.lineStyle(4, color, 0.95)
        g.beginPath()
        g.arc(0, 3, 13, Math.PI * 0.28, Math.PI * 1.72, false)
        g.strokePath()
        g.lineStyle(4, color, 0.95)
        g.lineBetween(0, -16, 0, -6)
      }
      draw(0xFF8A80)
      iconObj = g
      setHover = (hover) => draw(hover ? 0xFF6B6B : 0xFF8A80)
    }

    const label = this.add.text(-28, 0, 'Desligar', {
      fontSize: '13px', color: '#FF8A80', fontFamily: 'Arial Black',
    }).setOrigin(1, 0.5)

    const hit = this.add.zone(-40, 0, 130, 44).setInteractive({ useHandCursor: true })
    hit.on('pointerdown', () => this.showShutdownConfirm())
    hit.on('pointerover', () => { setHover(true); label.setColor('#FF6B6B') })
    hit.on('pointerout', () => { setHover(false); label.setColor('#FF8A80') })

    btn.add([iconObj, label, hit])
  }
  private showShutdownConfirm() {
    if (!this.levelStarted || this.gameEnded) return

    const W = 1280, H = 720
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.52)
      .setDepth(250).setInteractive()

    const modal = this.add.container(W / 2, H / 2).setDepth(251)

    const bg = this.add.graphics()
    bg.fillStyle(0x0D1628, 0.97)
    bg.fillRoundedRect(-220, -100, 440, 200, 16)
    bg.lineStyle(2.5, 0xFF6B6B, 0.75)
    bg.strokeRoundedRect(-220, -100, 440, 200, 16)

    const title = this.add.text(0, -52, '⏻  Desligar o computador?', {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5).setResolution(2)

    const sub = this.add.text(0, -10, 'Certifique-se de salvar seu trabalho antes.', {
      fontSize: '15px', fontFamily: 'Arial', color: '#AED6F1',
    }).setOrigin(0.5).setResolution(2)

    // Botão Sim
    const simBg = this.add.graphics()
    simBg.fillStyle(0x7B241C, 1)
    simBg.fillRoundedRect(-110, 30, 100, 40, 20)
    simBg.lineStyle(2, 0xFFFFFF, 0.9)
    simBg.strokeRoundedRect(-110, 30, 100, 40, 20)
    const simTxt = this.add.text(-60, 50, '✓  Sim', {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5).setResolution(2)

    // Botão Não
    const naoBg = this.add.graphics()
    naoBg.fillStyle(0x2E4A6A, 1)
    naoBg.fillRoundedRect(10, 30, 100, 40, 20)
    naoBg.lineStyle(2, 0xFFFFFF, 0.9)
    naoBg.strokeRoundedRect(10, 30, 100, 40, 20)
    const naoTxt = this.add.text(60, 50, '✕  Não', {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5).setResolution(2)

    modal.add([bg, title, sub, simBg, simTxt, naoBg, naoTxt])
    modal.setScale(0.88).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 200, ease: 'Back.Out' })

    const dismiss = () => {
      this.tweens.add({
        targets: [modal, overlay], alpha: 0, duration: 160,
        onComplete: () => { modal.destroy(); overlay.destroy() },
      })
    }

    const simHit = this.add.zone(W / 2 - 60, H / 2 + 50, 100, 40).setDepth(252).setInteractive({ useHandCursor: true })
    simHit.on('pointerdown', () => {
      dismiss()
      this.startTimerOnce()
      this.playTone(330, 0.08, 'sine', 0.15)
      this.time.delayedCall(200, () => {
        EventBus.emit('app-action', { appId: 'power', actionKey: 'shutdown' })
      })
    })

    const naoHit = this.add.zone(W / 2 + 60, H / 2 + 50, 100, 40).setDepth(252).setInteractive({ useHandCursor: true })
    naoHit.on('pointerdown', dismiss)
  }

  private startTimer() {
    if (this.hasStartedTimer) return
    this.hasStartedTimer = true
    this.timerState.progress = 1
    this.drawTimeBar(1)

    this.timerTween = this.tweens.add({
      targets: this.timerState,
      progress: 0,
      duration: this.levelConfig.timeLimit * 1000,
      ease: 'Linear',
      onUpdate: () => this.drawTimeBar(this.timerState.progress),
      onComplete: () => this.onTimeUp(),
    })
  }

  private startTimerOnce() {
    this.startTimer()
  }

  private onTimeUp() {
    this.gameEnded = true
    this.timerTween?.stop()
    this.drawTimeBar(0)
    this.input.enabled = false

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: 0,
      stage: this.levelConfig.level,
    })

    this.showGameOverScreen()
  }

  private createAppContent(appId: AppId): Phaser.GameObjects.GameObject[] {
    switch (appId) {
      case 'relogio': return this.createRelogioContent()
      case 'gravador': return this.createGravadorContent()
      case 'desenho': return this.createDesenhoContent()
      case 'calculadora': return this.createCalculadoraContent()
      case 'pasta': return this.createPastaContent()
      case 'player': return this.createPlayerContent()
      case 'power': return []
    }
  }

  private drawClockHands(
    gfx: Phaser.GameObjects.Graphics,
    cx: number, cy: number, r: number,
    hour: number, minute: number,
  ) {
    gfx.clear()
    const hAngle = ((hour % 12 + minute / 60) / 12 * 360 - 90) * Math.PI / 180
    const mAngle = (minute / 60 * 360 - 90) * Math.PI / 180
    const hLen = r * 0.52, mLen = r * 0.72

    // Sombra (offset 2px)
    gfx.lineStyle(6, 0x000000, 0.18)
    gfx.lineBetween(cx + 2, cy + 2, cx + 2 + Math.cos(hAngle) * hLen, cy + 2 + Math.sin(hAngle) * hLen)
    gfx.lineBetween(cx + 2, cy + 2, cx + 2 + Math.cos(mAngle) * mLen, cy + 2 + Math.sin(mAngle) * mLen)

    // Ponteiro das horas
    gfx.lineStyle(5, 0xFFFFFF, 0.95)
    gfx.lineBetween(cx, cy, cx + Math.cos(hAngle) * hLen, cy + Math.sin(hAngle) * hLen)

    // Ponteiro dos minutos
    gfx.lineStyle(3, 0xAED6F1, 0.90)
    gfx.lineBetween(cx, cy, cx + Math.cos(mAngle) * mLen, cy + Math.sin(mAngle) * mLen)

    // Centro
    gfx.fillStyle(0xE74C3C, 1); gfx.fillCircle(cx, cy, 5)
    gfx.fillStyle(0xFFFFFF, 1); gfx.fillCircle(cx, cy, 2.5)
  }

  private createGravadorContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []
    this.gravadorSaved = false   // reset ao abrir nova janela do gravador
    this.gravadorState = 'idle'

    const status = this.add.text(0, CONTENT_CY - 90, 'Parado', {
      fontSize: '20px', color: '#BDC3C7', fontFamily: 'Arial Black',
    }).setOrigin(0.5)
    this.gravadorStatusText = status
    objects.push(status)
    const recLevel = this.add.graphics()
    objects.push(recLevel)
    const actionBtn = this.createButton(0, CONTENT_CY + 50, 220, 64, 'Gravar', 0x922B21, () => {
      this.handleGravadorAction(actionBtn, recLevel)
    })
    objects.push(actionBtn)

    return objects
  }

  private drawWaveform(
    gfx: Phaser.GameObjects.Graphics,
    cx: number, cy: number, w: number, h: number,
    color: number,
  ) {
    gfx.clear()
    gfx.lineStyle(3, color, 0.8)
    gfx.beginPath()
    const steps = 60
    for (let i = 0; i <= steps; i++) {
      const x = cx - w / 2 + (i / steps) * w
      const amp = h / 2 * Math.sin(i * 0.4) * (0.3 + 0.7 * Math.abs(Math.sin(i * 0.13)))
      if (i === 0) gfx.moveTo(x, cy + amp)
      else gfx.lineTo(x, cy + amp)
    }
    gfx.strokePath()
  }

  private handleGravadorAction(
    btn: Phaser.GameObjects.Container,
    recLevel: Phaser.GameObjects.Graphics,
  ) {
    const btnText = btn.getAt(2) as Phaser.GameObjects.Text

    if (this.gravadorState === 'idle') {
      this.gravadorState = 'recording'
      btnText.setText('Parar')
      this.gravadorStatusText?.setText('● REC').setColor('#E74C3C')

      // Anima nível de gravação (referência armazenada para cleanup no close)
      this.gravadorRecTimerEvent = this.time.addEvent({
        delay: 100, loop: true, callback: () => {
          if (this.gravadorState !== 'recording' || !recLevel.active) return
          recLevel.clear()
          recLevel.fillStyle(0xE74C3C, 0.7)
          for (let i = 0; i < 12; i++) {
            const bh = Phaser.Math.Between(10, 50)
            const bx = -140 + i * 25
            recLevel.fillRect(bx, CONTENT_CY - 40 - bh / 2, 18, bh)
          }
        },
      })
      this.playTone(440, 0.08, 'sine', 0.12)

    } else if (this.gravadorState === 'recording') {
      this.gravadorState = 'stopped'
      btnText.setText('Salvar')
      this.gravadorStatusText?.setText('Parado').setColor('#BDC3C7')
      recLevel.clear()
      this.playTone(330, 0.08, 'sine', 0.12)

    } else {
      if (this.gravadorSaved || this.gameEnded) return
      this.gravadorSaved = true
      this.gravadorState = 'idle'
      btnText.setText('🎙️  Gravar')
      this.gravadorStatusText?.setText('✅  Salvo!').setColor('#2ECC71')
      EventBus.emit('app-action', { appId: 'gravador', actionKey: 'save-recording' })
    }
  }

  private createDesenhoContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []

    // Canvas de desenho com textura de papel
    const canvas = this.add.image(0, CONTENT_CY - 50, 'desenho-canvas').setDisplaySize(370, 190)
    objects.push(canvas)

    // Borda roxa sobre a imagem
    const canvasBorder = this.add.graphics()
    canvasBorder.lineStyle(3, 0x76448A)
    canvasBorder.strokeRect(-185, CONTENT_TOP + 8, 370, 190)
    objects.push(canvasBorder)

    // Hint sobreposto
    objects.push(
      this.add.text(0, CONTENT_CY - 50, 'Desenhe aqui!', {
        fontSize: '14px', color: '#76448A', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5)
    )

    // Graphics para o desenho
    const gfx = this.add.graphics()
    this.desenho.gfx = gfx
    objects.push(gfx)

    // Paleta de cores
    const colors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6]
    colors.forEach((c, i) => {
      const dot = this.add.circle(-90 + i * 46, CONTENT_CY + 88, 14, c)
        .setInteractive({ useHandCursor: true })
      dot.on('pointerdown', () => {
        this.desenho.drawColor = c
        this.desenho.tapCount = Math.max(this.desenho.tapCount, 1)
      })
      dot.on('pointerover', () => dot.setScale(1.2))
      dot.on('pointerout', () => dot.setScale(1))
      objects.push(dot)
    })

    // Botão Pronto (desabilitado até o jogador desenhar)
    let desenhoConfirmed = false
    const readyBtn = this.createButton(100, CONTENT_CY + 88, 150, 56, 'Pronto!', 0x1E8449, () => {
      if (desenhoConfirmed || this.gameEnded) return
      desenhoConfirmed = true
      EventBus.emit('app-action', { appId: 'desenho', actionKey: 'confirm-drawing' })
    })
    readyBtn.setAlpha(0.3)
    this.desenho.readyBtn = readyBtn
    objects.push(readyBtn)

    return objects
  }

  private createCalculadoraContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []
    const step = this.getActiveStep('calculadora')

    objects.push(
      this.add.image(0, CONTENT_CY + 6, 'calc-bg').setDisplaySize(430, 320)
    )

    if (step?.expectedExpr) {
      objects.push(
        this.add.text(0, CONTENT_TOP + 22, `Faça a conta:  ${step.expectedExpr}`, {
          fontSize: '19px', color: '#F9E79F', fontFamily: 'Arial Black',
        }).setOrigin(0.5).setResolution(2)
      )
    }

    const visorY = CONTENT_TOP + 62
    objects.push(
      this.add.rectangle(0, visorY, 350, 54, 0x1A252F).setStrokeStyle(2, 0x1E8449)
    )

    const display = this.add.text(160, visorY, '0', {
      fontSize: '28px', color: '#2ECC71', fontFamily: 'Courier New, monospace',
    }).setOrigin(1, 0.5)
    this.calcText = display
    this.calcDisplay = ''
    objects.push(display)

    const layout = [
      ['7', '8', '9', '/'],
      ['4', '5', '6', 'x'],
      ['1', '2', '3', '-'],
      ['C', '0', '=', '+'],
    ]

    const BTN_W = 80, BTN_H = 48, GAP = 9
    const gridW = 4 * BTN_W + 3 * GAP
    const startX = -gridW / 2 + BTN_W / 2
    const startY = CONTENT_TOP + 116

    layout.forEach((row, ri) => {
      row.forEach((key, ci) => {
        const bx = startX + ci * (BTN_W + GAP)
        const by = startY + ri * (BTN_H + GAP)
        const isOp = ['/', 'x', '-', '+'].includes(key)
        const color = key === '=' ? 0x1E8449 : key === 'C' ? 0x922B21 : isOp ? 0x1A6B9A : 0x2C3E50
        objects.push(this.createButton(bx, by, BTN_W, BTN_H, key, color, () => this.handleCalcKey(key)))
      })
    })

    return objects
  }

  private handleCalcKey(key: string) {
    this.playTone(660, 0.04, 'sine', 0.08)

    if (key === 'C') {
      this.calcDisplay = ''
      this.calcText?.setText('0').setColor('#2ECC71')
      return
    }

    if (key === '=') {
      let result: number | null = null
      try {
        const expr = this.calcDisplay.replace(/x/g, '*')
        result = Function(`"use strict"; return (${expr})`)() as number
      } catch {
        result = null
      }

      if (result === null || !isFinite(result)) {
        this.calcDisplay = ''
        this.calcText?.setText('Erro').setColor('#E74C3C')
        this.playTone(220, 0.14, 'square', 0.12)
        return
      }

      this.calcDisplay = String(Math.round(result * 1000) / 1000)
      this.calcText?.setText(this.calcDisplay)

      const step = this.getActiveStep('calculadora')
      if (step?.expectedAnswer !== undefined && result !== step.expectedAnswer) {
        this.calcText?.setColor('#E74C3C')
        this.playTone(220, 0.14, 'square', 0.12)
        this.cameras.main.shake(140, 0.003)
        this.time.delayedCall(900, () => {
          this.calcDisplay = ''
          this.calcText?.setText('0').setColor('#2ECC71')
        })
        return
      }

      this.calcText?.setColor('#2ECC71')
      this.time.delayedCall(300, () => {
        EventBus.emit('app-action', { appId: 'calculadora', actionKey: 'calculate' })
        this.playSuccess()
      })
      return
    }

    const lastChar = this.calcDisplay.slice(-1)
    const isOpKey = ['/', 'x', '-', '+'].includes(key)
    if (isOpKey && ['/', 'x', '-', '+'].includes(lastChar)) {
      this.calcDisplay = this.calcDisplay.slice(0, -1)
    }
    if (this.calcDisplay === '0' && !isOpKey) this.calcDisplay = ''
    this.calcDisplay += key
    this.calcText?.setText(this.calcDisplay || '0').setColor('#2ECC71')
  }

  private createPastaContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []
    this.pastaFilesDone = 0

    const FOLDER_CX = 0
    const FOLDER_CY = CONTENT_CY + 18   // centro da zona-alvo (local da janela)
    const FOLDER_W = 320
    const FOLDER_H = 68

    const fileDefs = [
      { label: 'Matemática', textureKey: 'pasta-doc-matematica', ix: -130, iy: CONTENT_CY - 96 },
      { label: 'Leitura', textureKey: 'pasta-doc-leitura', ix: 0, iy: CONTENT_CY - 96 },
      { label: 'Arte', textureKey: 'pasta-doc-arte', ix: 130, iy: CONTENT_CY - 96 },
    ]

    // Instrução
    const counter = this.add.text(0, CONTENT_CY - 136,
      'Arraste os arquivos para a pasta: 0 / 3', {
      fontSize: '13px', color: '#AED6F1', fontFamily: 'Arial',
      wordWrap: { width: 380 }, align: 'center',
    }).setOrigin(0.5)
    objects.push(counter)

    // Zona destino — pasta
    const folderGfx = this.add.graphics()
    const drawFolder = (highlight: boolean) => {
      folderGfx.clear()
      folderGfx.fillStyle(0xB7770D, highlight ? 0.38 : 0.18)
      folderGfx.fillRoundedRect(-FOLDER_W / 2, FOLDER_CY - FOLDER_H / 2, FOLDER_W, FOLDER_H, 10)
      folderGfx.lineStyle(2, highlight ? 0xFFD700 : 0xF1C40F, highlight ? 1 : 0.60)
      folderGfx.strokeRoundedRect(-FOLDER_W / 2, FOLDER_CY - FOLDER_H / 2, FOLDER_W, FOLDER_H, 10)
    }
    drawFolder(false)
    objects.push(folderGfx)

    objects.push(
      this.add.text(FOLDER_CX, FOLDER_CY, 'Pasta da Turma', {
        fontSize: '17px', color: '#F1C40F', fontFamily: 'Arial Black',
      }).setOrigin(0.5),
    )

    // Botão confirmar
    let pastaConfirmed = false
    const confirmBtn = this.createButton(0, CONTENT_CY + 108, 220, 54, 'Confirmar', 0x1E8449, () => {
      if (pastaConfirmed || this.gameEnded) return
      pastaConfirmed = true
      EventBus.emit('app-action', { appId: 'pasta', actionKey: 'organize-files' })
    })
    confirmBtn.setAlpha(0.3)
    this.pastaConfirmBtn = confirmBtn
    objects.push(confirmBtn)

    // Arquivos arrastáveis
    fileDefs.forEach((fd) => {
      const fileC = this.add.container(fd.ix, fd.iy)
      let dropped = false

      const hasPng = this.textures.exists(fd.textureKey)
      if (hasPng) {
        fileC.add(this.add.image(0, 0, fd.textureKey).setDisplaySize(90, 70))
      } else {
        const bg = this.add.graphics()
        bg.fillStyle(0x1A3A6B, 0.92)
        bg.fillRoundedRect(-45, -35, 90, 70, 8)
        bg.lineStyle(1.5, 0xFFFFFF, 0.25)
        bg.strokeRoundedRect(-45, -35, 90, 70, 8)
        fileC.add([bg, this.add.text(0, 0, fd.label, {
          fontSize: '13px', color: '#FFFFFF', fontFamily: 'Arial Black',
        }).setOrigin(0.5)])
      }

      const hit = this.add.zone(0, 0, 94, 74).setInteractive({ useHandCursor: true })
      fileC.add(hit)
      objects.push(fileC)

      // ── Drag state (local por arquivo) ──────────────────────────────────────
      let isDragging = false
      let offX = 0, offY = 0

      hit.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        if (dropped || this.gameEnded) return
        isDragging = true
        this.tweens.killTweensOf(fileC)
        const win = fileC.parentContainer
        const wx = win ? win.x : 0
        const wy = win ? win.y : 0
        offX = fileC.x - (ptr.worldX - wx)
        offY = fileC.y - (ptr.worldY - wy)
        fileC.setAlpha(0.85)
      })

      const onMove = (ptr: Phaser.Input.Pointer) => {
        if (!isDragging || dropped || !fileC.active) return
        const win = fileC.parentContainer
        const wx = win ? win.x : 0
        const wy = win ? win.y : 0
        fileC.x = ptr.worldX - wx + offX
        fileC.y = ptr.worldY - wy + offY

        // Destaca pasta quando está sobre ela
        const over = Math.abs(fileC.x - FOLDER_CX) < FOLDER_W / 2 &&
          Math.abs(fileC.y - FOLDER_CY) < FOLDER_H / 2
        drawFolder(over)
      }

      const onUp = () => {
        if (!isDragging || !fileC.active) return
        isDragging = false
        fileC.setAlpha(1)
        drawFolder(false)

        if (dropped) return

        const inFolder = Math.abs(fileC.x - FOLDER_CX) < FOLDER_W / 2 &&
          Math.abs(fileC.y - FOLDER_CY) < FOLDER_H / 2

        if (inFolder) {
          dropped = true
          this.tweens.add({
            targets: fileC,
            x: FOLDER_CX, y: FOLDER_CY,
            scaleX: 0.3, scaleY: 0.3, alpha: 0,
            duration: 300, ease: 'Power2',
          })
          this.playTone(880, 0.05, 'sine', 0.14)
          this.pastaFilesDone++
          counter.setText(`✋  Arraste os arquivos para a pasta: ${this.pastaFilesDone} / ${this.pastaTotal}`)
          if (this.pastaFilesDone >= this.pastaTotal) {
            this.tweens.add({ targets: confirmBtn, alpha: 1, duration: 280 })
            this.playTone(1046, 0.06, 'sine', 0.16)
          }
        } else {
          // Devolve ao lugar original
          this.tweens.add({
            targets: fileC,
            x: fd.ix, y: fd.iy,
            duration: 220, ease: 'Back.Out',
          })
        }
      }

      this.input.on('pointermove', onMove)
      this.input.on('pointerup', onUp)
    })

    return objects
  }

  // ── Player ────────────────────────────────────────────────────────────────

  private createPlayerContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []
    let playing = false

    // Capa do álbum
    const albumArt = this.add.image(0, CONTENT_CY - 55, 'album-art').setDisplaySize(150, 150)
    const albumFrame = this.add.rectangle(0, CONTENT_CY - 55, 154, 154, 0x000000, 0).setStrokeStyle(3, 0x2E86C1)
    objects.push(albumArt, albumFrame)

    // Título
    objects.push(
      this.add.text(0, CONTENT_CY + 32, 'Música da Aula', {
        fontSize: '18px', color: '#1A252F', fontFamily: 'Arial Black',
      }).setOrigin(0.5)
    )

    // Barra de progresso da música
    const trackBg = this.add.rectangle(0, CONTENT_CY + 68, 300, 10, 0xBDC3C7)
    const trackBar = this.add.rectangle(-150, CONTENT_CY + 68, 0, 10, 0x2E86C1).setOrigin(0, 0.5)
    objects.push(trackBg, trackBar)

    // Botão Play/Pause
    let playerStarted = false
    const playBtn = this.createButton(0, CONTENT_CY + 100, 160, 64, '▶  Tocar', 0x1A252F, () => {
      playing = !playing
      const btnTxt = playBtn.getAt(2) as Phaser.GameObjects.Text
      btnTxt.setText(playing ? '⏸  Pausa' : '▶  Tocar')

      if (playing) {
        this.playTone(262, 0.15, 'sine', 0.20, 0)
        this.playTone(330, 0.15, 'sine', 0.18, 0.20)
        this.playTone(392, 0.25, 'sine', 0.22, 0.40)

        this.tweens.add({ targets: trackBar, scaleX: 300, duration: 8000, ease: 'Linear' })

        if (!playerStarted && !this.gameEnded) {
          playerStarted = true
          EventBus.emit('app-action', { appId: 'player', actionKey: 'play-music' })
        }
      } else {
        this.tweens.killTweensOf(trackBar)
      }
    })
    objects.push(playBtn)

    return objects
  }

  // ── Botão reutilizável (Container + Graphics + Text) ─────────────────────

  private createButton(
    x: number, y: number, w: number, h: number,
    label: string, color: number,
    onDown: () => void,
  ): Phaser.GameObjects.Container {
    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10)
    bg.lineStyle(2, 0xFFFFFF, 0.2)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10)

    const txt = this.add.text(0, 0, label, {
      fontSize: '20px', color: '#FFFFFF',
      fontFamily: 'Arial Black, Arial',
    }).setOrigin(0.5)

    const hitArea = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true })

    hitArea.on('pointerdown', () => {
      this.tweens.add({ targets: btn, scaleX: 0.94, scaleY: 0.94, duration: 60, yoyo: true })
      onDown()
    })
    hitArea.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(Phaser.Display.Color.ValueToColor(color).brighten(15).color, 1)
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10)
    })
    hitArea.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(color, 1)
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10)
      bg.lineStyle(2, 0xFFFFFF, 0.2)
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10)
    })

    const btn = this.add.container(x, y, [bg, hitArea, txt])
    return btn
  }

  // ── Validação de missão ───────────────────────────────────────────────────

  private onAppAction = (payload: { appId: AppId; actionKey: string }) => {
    if (this.gameEnded) return
    const mission = this.levelConfig.missions[this.missionIndex]
    if (!mission) return

    const step = mission.steps[this.stepIndex]
    if (!step) return

    if (payload.appId !== step.appId || payload.actionKey !== step.actionKey) {
      // Feedback visual quando o app errado é usado
      if (payload.appId !== step.appId) this.showWrongAppHint(step.appId)
      return
    }

    this.stepIndex++

    if (this.stepIndex < mission.steps.length) {
      // Próximo passo da mesma missão
      this.broadcastMissionState()
      this.showStepCompleteEffect()
      return
    }

    // Missão completa
    this.completedMissions++
    this.updateChecklist()
    this.currentPoints += 5
    this.playRoundComplete()

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER',
      gameId: GAME_ID,
      pointsEarned: 5,
      stage: this.levelConfig.level,
    })

    const nextIdx = this.missionIndex + 1
    const nextMissionText = nextIdx < this.levelConfig.missions.length
      ? this.levelConfig.missions[nextIdx].text
      : null

    this.showMissionCompleteEffect(nextMissionText, () => {
      this.missionIndex++
      this.stepIndex = 0

      if (this.missionIndex >= this.levelConfig.missions.length) {
        this.endRound()
        return
      }

      this.broadcastMissionState()
      this.emitCheckpoint()
    })
  }

  private broadcastMissionState() {
    const mission = this.levelConfig.missions[this.missionIndex]
    if (!mission) return
    const step = mission.steps[this.stepIndex]

    EventBus.emit('mission-update', {
      missionText: mission.text,
      stepHint: step?.hint ?? '',
      missionIndex: this.completedMissions,
      totalMissions: this.levelConfig.missions.length,
      level: this.levelConfig.level,
    })
  }

  // ── Intro de nível ────────────────────────────────────────────────────────

  private getLevelInstructions(): { objective: string; detail: string; tip: string } {
    const missions = this.levelConfig.missions.length

    if (this.levelConfig.level === 1) {
      return {
        objective: `Complete ${missions} tarefas de computador!`,
        detail: 'Use o Relógio e a Calculadora.',
        tip: 'Dê duplo toque no ícone para abrir um app.',
      }
    }
    if (this.levelConfig.level === 2) {
      return {
        objective: `Complete ${missions} tarefas de computador!`,
        detail: 'Relógio, Calculadora, Pasta e Gravador disponíveis.',
        tip: 'Algumas tarefas têm dois passos — leia o checklist!',
      }
    }
    return {
      objective: `Complete ${missions} tarefas de computador!`,
      detail: 'Todos os apps desbloqueados. Lembre de desligar o PC!',
      tip: 'Siga o checklist de missões no canto direito.',
    }
  }

  private showStartScreen() {
    const info = this.getLevelInstructions()
    const missions = this.levelConfig.missions
    const W = 1280, H = 720
    const MW = 560  // modal width

    const HALF_H = 90 + missions.length * 32 + 90

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x12324a, 0.58)
      .setDepth(60).setInteractive()

    const modal = this.add.container(W / 2, H / 2).setDepth(61)

    // ── Fundo ──────────────────────────────────────────────────────────────────
    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-MW / 2 + 8, -HALF_H + 8, MW, HALF_H * 2, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-MW / 2, -HALF_H, MW, HALF_H * 2, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-MW / 2, -HALF_H, MW, HALF_H * 2, 28)

    // ── Faixa superior ─────────────────────────────────────────────────────────
    const topBar = this.add.graphics()
    topBar.fillStyle(0x1A6B9A, 1)
    topBar.fillRoundedRect(-196, -HALF_H - 16, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -HALF_H - 16, 392, 28, 14)

    // ── Conteúdo ───────────────────────────────────────────────────────────────
    const yTitle = -HALF_H + 54
    const title = this.add.text(0, yTitle, `Nível ${this.levelConfig.level}`, {
      fontFamily: 'Arial', fontSize: '36px', fontStyle: 'bold',
      color: '#25327a', stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const yInfo = yTitle + 52
    const detail = this.add.text(0, yInfo, `${info.detail}  •  ⏱ ${this.levelConfig.timeLimit}s`, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold',
      color: '#1A6B9A', align: 'center', wordWrap: { width: MW - 60 },
    }).setOrigin(0.5).setResolution(2)

    // ── Separador + lista de missões ───────────────────────────────────────────
    const ySep = yInfo + 22
    const sepLine = this.add.graphics()
    sepLine.lineStyle(1, 0x1A6B9A, 0.22)
    sepLine.lineBetween(-MW / 2 + 24, ySep, MW / 2 - 24, ySep)

    const yListLabel = ySep + 16
    const listLabel = this.add.text(-MW / 2 + 28, yListLabel, 'O que fazer neste nível:', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#1A6B9A',
    }).setOrigin(0, 0.5).setResolution(2)

    const missionItems = missions.map((m, i) => {
      const short = m.text.length > 54 ? m.text.substring(0, 52) + '…' : m.text
      return this.add.text(-MW / 2 + 28, yListLabel + 26 + i * 32, `${i + 1}.  ${short}`, {
        fontFamily: 'Arial', fontSize: '16px',
        color: '#3b3b3b', wordWrap: { width: MW - 56 },
      }).setOrigin(0, 0.5).setResolution(2)
    })

    // ── Botão ──────────────────────────────────────────────────────────────────
    const yButton = HALF_H - 48
    const startBtn = this.createButton(0, yButton, 280, 52, '▶  Iniciar nível', 0x1A6B9A, () => {
      this.playTone(523, 0.10, 'sine', 0.20)
      overlay.destroy()
      modal.destroy()

      runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
      EventBus.emit('scene-ready', { levelConfig: this.levelConfig })
      this.broadcastMissionState()
      this.emitCheckpoint()
      this.levelStarted = true
    })

    modal.add([shadow, bg, topBar, title, detail, sepLine, listLabel, ...missionItems, startBtn])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }


  // ── Efeitos visuais ───────────────────────────────────────────────────────

  private showStepCompleteEffect() {
    const W = 1280, H = 720
    const modal = this.add.container(W / 2, H / 2 - 40).setDepth(200)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.97)
    bg.fillRoundedRect(-160, -28, 320, 56, 28)
    bg.lineStyle(3, 0x2ECC71, 1)
    bg.strokeRoundedRect(-160, -28, 320, 56, 28)

    const txt = this.add.text(0, 0, '✅  Passo concluído!', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold',
      color: '#25327a', stroke: '#ffffff', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)

    modal.add([bg, txt])
    modal.setAlpha(0).setScale(0.85)
    this.tweens.add({
      targets: modal, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(480, () => {
          this.tweens.add({
            targets: modal, alpha: 0, y: H / 2 - 80, duration: 200,
            onComplete: () => modal.destroy(),
          })
        })
      },
    })
  }

  private showMissionCompleteEffect(nextMissionText: string | null, onDone: () => void) {
    if (this.missionEffectActive) return
    this.missionEffectActive = true

    const W = 1280, H = 720

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x12324a, 0.52)
      .setDepth(200).setInteractive()

    const modal = this.add.container(W / 2, H / 2).setDepth(201)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-242, -118, 484, 280, 24)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-250, -126, 500, 280, 24)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-250, -126, 500, 280, 24)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x2ECC71, 1)
    topBar.fillRoundedRect(-176, -142, 352, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-176, -142, 352, 28, 14)

    const title = this.add.text(0, -62, 'Missão concluída!', {
      fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold',
      color: '#25327a', stroke: '#ffffff', strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, 0,
      nextMissionText ? 'Próxima missão:' : 'Todas as missões concluídas!', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold',
      color: '#1A6B9A', align: 'center',
    }).setOrigin(0.5).setResolution(2)

    const nextTxt = this.add.text(0, 52,
      nextMissionText ?? 'Preparando resultado...', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold',
      color: '#3b3b3b', wordWrap: { width: 440 }, align: 'center',
    }).setOrigin(0.5).setResolution(2)

    modal.add([shadow, bg, topBar, title, subtitle, nextTxt])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' })

    const closeBtn = this.createButton(0, 92, 220, 52, 'Continuar', 0x1A6B9A, () => {
      this.tweens.add({
        targets: [overlay, modal], alpha: 0, duration: 180,
        onComplete: () => {
          overlay.destroy()
          modal.destroy()
          this.missionEffectActive = false
          onDone()
        },
      })
    })
    modal.add(closeBtn)
  }


  // Feedback quando o jogador usa o app errado para o passo atual
  private showWrongAppHint(correctAppId: AppId) {
    const def = APP_DEFS.find(a => a.id === correctAppId)
    if (!def) return

    const existing = this.children.list.find(
      o => (o as Phaser.GameObjects.Text).text?.startsWith('💡')
    )
    if (existing) return  // não empilha hints

    const mission = this.levelConfig.missions[this.missionIndex]
    const isFirstStep = this.stepIndex === 0
    const isMultiStep = (mission?.steps.length ?? 1) > 1

    // Mensagem contextual:
    //   missão 1 passo  → "Use [app]!"
    //   1º passo de missão com múltiplos → "Comece com [app]!"
    //   passo 2+ (já fez o anterior)     → "Agora use [app]!"
    let message: string
    if (!isMultiStep) {
      message = `💡 Use ${def.label}!`
    } else if (isFirstStep) {
      message = `💡 Comece com ${def.label}!`
    } else {
      message = `💡 Agora use ${def.label}!`
    }

    const txt = this.add.text(640, 420, message, {
      fontSize: '28px', fontFamily: 'Arial Black', color: '#F39C12',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(300).setAlpha(0)

    this.tweens.add({
      targets: txt, alpha: 1, y: 390, duration: 250,
      yoyo: true, hold: 900,
      onComplete: () => txt.destroy(),
    })

    this.playTone(220, 0.08, 'square', 0.10)
  }

  private showGameOverScreen() {
    this.input.enabled = true
    const W = 1280, H = 720

    this.add.rectangle(W / 2, H / 2, W, H, 0x12324a, 0.72)
      .setDepth(400).setInteractive()

    const modal = this.add.container(W / 2, H / 2)
    modal.setDepth(401)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 330, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 330, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xc62828, 1)
    topBar.fillRoundedRect(-196, -194, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14)

    const title = this.add.text(0, -110, 'Tempo Esgotado!', {
      fontFamily: 'Arial', fontSize: '36px', fontStyle: 'bold',
      color: '#b71c1c', stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const sub = this.add.text(0, -58, `O tempo acabou no Nível ${this.levelConfig.level}`, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold',
      color: '#3b3b3b', align: 'center', wordWrap: { width: 480 },
    }).setOrigin(0.5).setResolution(2)

    const retryBtn = this.add.container(-90, 60)
    const retryBg = this.add.graphics()
    retryBg.fillStyle(0x1A6B9A, 1)
    retryBg.fillRoundedRect(-100, -22, 200, 44, 22)
    retryBg.lineStyle(3, 0xffffff, 1)
    retryBg.strokeRoundedRect(-100, -22, 200, 44, 22)
    const retryText = this.add.text(0, 0, 'Tentar Novamente', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    retryBtn.add([retryBg, retryText])

    const exitBtn = this.add.container(110, 60)
    const exitBg = this.add.graphics()
    exitBg.fillStyle(0x757575, 1)
    exitBg.fillRoundedRect(-80, -22, 160, 44, 22)
    exitBg.lineStyle(3, 0xffffff, 1)
    exitBg.strokeRoundedRect(-80, -22, 160, 44, 22)
    const exitText = this.add.text(0, 0, 'Sair', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    exitBtn.add([exitBg, exitText])

    modal.add([shadow, bg, topBar, title, sub, retryBtn, exitBtn])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    const retryHit = this.add.zone(W / 2 - 90, H / 2 + 60, 200, 44)
    retryHit.setDepth(402).setInteractive({ useHandCursor: true })
    retryHit.on('pointerover', () => this.tweens.add({ targets: retryBtn, scale: 1.05, duration: 80 }))
    retryHit.on('pointerout', () => this.tweens.add({ targets: retryBtn, scale: 1, duration: 80 }))
    retryHit.on('pointerdown', () => {
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    })

    const exitHit = this.add.zone(W / 2 + 110, H / 2 + 60, 160, 44)
    exitHit.setDepth(402).setInteractive({ useHandCursor: true })
    exitHit.on('pointerover', () => this.tweens.add({ targets: exitBtn, scale: 1.05, duration: 80 }))
    exitHit.on('pointerout', () => this.tweens.add({ targets: exitBtn, scale: 1, duration: 80 }))
    exitHit.on('pointerdown', () => EventBus.emit('exit-game'))
  }

  private showLevelCompleteScreen(nextLevel: 1 | 2 | 3) {
    this.playRoundComplete()
    const W = 1280, H = 720

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x12324a, 0.56)
      .setDepth(300).setInteractive()

    const modal = this.add.container(W / 2, H / 2)
    modal.setDepth(301)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 330, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 330, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x1A6B9A, 1)
    topBar.fillRoundedRect(-196, -194, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14)

    const title = this.add.text(0, -110, 'Parabéns!', {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold',
      color: '#25327a', stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const completed = this.add.text(0, -50, 'Nível concluído', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#1A6B9A',
    }).setOrigin(0.5).setResolution(2)

    const successMsg = this.add.text(0, 8, 'Continue assim! Próximo nível carregando...', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold',
      color: '#3b3b3b', align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics()
      dot.fillStyle(level <= this.levelConfig.level ? 0x2ECC71 : level === nextLevel ? 0xFF9800 : 0xd8dde8, 1)
      dot.fillCircle(-28 + index * 28, 72, 8)
      dot.lineStyle(2, 0xffffff, 0.9)
      dot.strokeCircle(-28 + index * 28, 72, 8)
      return dot
    })

    const waitText = this.add.text(0, 116, 'Preparando o próximo nível...', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#25327a',
    }).setOrigin(0.5).setResolution(2)

    modal.add([shadow, bg, topBar, title, completed, successMsg, ...dots, waitText])
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

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x12324a, 0.56)
      .setDepth(300).setInteractive()

    const modal = this.add.container(W / 2, H / 2)
    modal.setDepth(301)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 330, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 330, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x1A6B9A, 1)
    topBar.fillRoundedRect(-196, -194, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14)

    const title = this.add.text(0, -110, 'Parabéns!', {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold',
      color: '#25327a', stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const completed = this.add.text(0, -50, 'Nível concluído', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#1A6B9A',
    }).setOrigin(0.5).setResolution(2)

    const message = this.add.text(0, 8, 'Você completou todos os desafios do Desktop!', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold',
      color: '#3b3b3b', align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const waitText = this.add.text(0, 116, 'Preparando a finalização...', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#25327a',
    }).setOrigin(0.5).setResolution(2)

    modal.add([shadow, bg, topBar, title, completed, message, waitText])
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

    this.add.rectangle(W / 2, H / 2, W, H, 0x12324a, 0.62)
      .setDepth(300).setInteractive()

    const panel = this.add.container(W / 2, H / 2)
    panel.setDepth(301)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-292, -178, 584, 366, 34)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-304, -190, 608, 370, 34)
    bg.lineStyle(6, 0xffffff, 0.96)
    bg.strokeRoundedRect(-304, -190, 608, 370, 34)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(0x1A6B9A, 1)
    ribbon.fillRoundedRect(-214, -208, 428, 34, 17)
    ribbon.lineStyle(4, 0xffffff, 0.9)
    ribbon.strokeRoundedRect(-214, -208, 428, 34, 17)

    const title = this.add.text(0, -128, 'Jogo concluído!', {
      fontFamily: 'Arial', fontSize: '38px', fontStyle: 'bold',
      color: '#25327a', stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -74, 'Você dominou o Desktop Digital Infantil!', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
      color: '#3b3b3b', align: 'center', wordWrap: { width: 500 },
    }).setOrigin(0.5).setResolution(2)

    const badgeColors = [0x1A6B9A, 0xff8a2a, 0x1E8449]
    const badges = [1, 2, 3].map((lvl, index) => {
      const item = this.add.container(-190 + index * 190, 54)
      const badge = this.add.graphics()
      badge.fillStyle(badgeColors[index], 1)
      badge.fillRoundedRect(-54, -42, 108, 84, 18)
      badge.lineStyle(4, 0xffffff, 0.95)
      badge.strokeRoundedRect(-54, -42, 108, 84, 18)
      const num = this.add.text(0, -13, String(lvl), {
        fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold',
        color: '#ffffff', stroke: '#25327a', strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2)
      const label = this.add.text(0, 23, 'concluído', {
        fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setResolution(2)
      item.add([badge, num, label])
      return item
    })

    panel.add([shadow, bg, ribbon, title, subtitle, ...badges])
    panel.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  // ── Encerramento de rodada ────────────────────────────────────────────────

  private endRound() {
    this.gameEnded = true
    this.timerTween?.stop()
    this.input.enabled = false

    const result: RoundResult = {
      gameCode: 'EF01CO06',
      level: this.levelConfig.level,
      criterion: 'uso-de-apps',
      hits: this.completedMissions,
      errors: 0,
      durationMs: Date.now() - this.startTime,
      timestamp: Date.now(),
    }
    EventBus.emit('round-complete', result)

    if (this.levelConfig.level < 3) {
      const next = (this.levelConfig.level + 1) as 1 | 2 | 3
      runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
      this.showLevelCompleteScreen(next)
    } else {
      runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
      this.showFinalCompleteScreen()
    }
  }

  // ── Checkpoint ────────────────────────────────────────────────────────────

  private emitCheckpoint() {
    const total = this.levelConfig.missions.length
    const progress = total > 0 ? Math.round((this.completedMissions / total) * 100) : 0

    runtimeGameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress,
      score: this.currentPoints,
      stage: this.levelConfig.level,
      hits: this.completedMissions,
      errors: 0,
    })
  }

  // ── Platform commands ─────────────────────────────────────────────────────

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      switch (cmd.type) {
        case 'START_GAME': {
          if (cmd.gameId !== GAME_ID) return
          if (cmd.stage !== this.levelConfig.level) {
            this.scene.restart({ level: cmd.stage, points: cmd.points, lives: cmd.lives })
          } else {
            this.currentPoints = cmd.points
            this.currentLives = cmd.lives
          }
          return
        }
        case 'PAUSE_GAME': { if (!this.scene.isPaused()) this.scene.pause(); return }
        case 'RESUME_GAME': { if (this.scene.isPaused()) this.scene.resume(); return }
      }
    })
  }

  // ── Handlers de EventBus ──────────────────────────────────────────────────

  private handleMuteAudio = (muted: boolean) => { this.isMuted = muted }

  private onShowInstructions = () => {
    if (this.gameEnded) return

    const info = this.getLevelInstructions()
    const depth = 220

    const bg = this.add.rectangle(640, 360, 780, 340, 0x0A1628, 0.97)
      .setStrokeStyle(2, 0x2E86C1).setDepth(depth).setInteractive()

    const title = this.add.text(640, 245, `Nível ${this.levelConfig.level} — Objetivo`, {
      fontSize: '26px', fontFamily: 'Arial Black, Arial',
      color: '#AED6F1', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(depth + 1)

    const obj = this.add.text(640, 305, info.objective, {
      fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF',
      wordWrap: { width: 680 }, align: 'center',
    }).setOrigin(0.5).setDepth(depth + 1)

    const tip = this.add.text(640, 365, `💡  ${info.tip}`, {
      fontSize: '20px', fontFamily: 'Arial', color: '#F9E79F',
      wordWrap: { width: 680 }, align: 'center',
    }).setOrigin(0.5).setDepth(depth + 1)

    const sep = this.add.rectangle(640, 405, 680, 1, 0x2E86C1, 0.4).setDepth(depth + 1)

    const closeBg = this.add.rectangle(640, 440, 180, 52, 0x2ECC71, 1)
      .setStrokeStyle(2, 0xFFFFFF).setInteractive({ useHandCursor: true }).setDepth(depth + 1)
    const closeTxt = this.add.text(640, 440, '✓  Entendido', {
      fontSize: '20px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(depth + 2)

    const items = [bg, title, obj, tip, sep, closeBg, closeTxt]
    this.tweens.add({ targets: items, alpha: { from: 0, to: 1 }, duration: 200, ease: 'Quad.Out' })

    const dismiss = () => {
      this.tweens.add({
        targets: items, alpha: 0, duration: 180,
        onComplete: () => items.forEach(o => o.destroy()),
      })
    }
    closeBg.on('pointerdown', dismiss)
    closeTxt.setInteractive({ useHandCursor: true })
    closeTxt.on('pointerdown', dismiss)
  }

  // ── Áudio sintético ────────────────────────────────────────────────────────

  private getAudioContext(): AudioContext | null {
    if (!('context' in this.sound)) return null
    return (this.sound as Phaser.Sound.WebAudioSoundManager).context
  }

  private playTone(
    freq: number, dur: number,
    type: OscillatorType = 'sine', vol = 0.22, delay = 0,
  ) {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + dur + 0.01)
  }

  private playWindowOpen() {
    this.playTone(880, 0.06, 'sine', 0.15)
    this.playTone(1100, 0.08, 'sine', 0.12, 0.06)
  }

  private playWindowClose() {
    this.playTone(660, 0.06, 'sine', 0.12)
    this.playTone(440, 0.08, 'sine', 0.10, 0.06)
  }

  private playSuccess() {
    this.playTone(523, 0.10, 'sine', 0.25)
    this.playTone(659, 0.10, 'sine', 0.25, 0.10)
    this.playTone(784, 0.18, 'sine', 0.28, 0.20)
  }

  private playRoundComplete() {
    [262, 330, 392, 523].forEach((f, i) => this.playTone(f, 0.20, 'sine', 0.28, i * 0.13))
  }

}
