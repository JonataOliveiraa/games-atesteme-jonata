import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { RoundResult } from '../../../shared/types/game'
import { APP_DEFS, type AppDef, type AppId, type LevelConfig } from '../types'
import { LEVELS } from '../data/levels'

const WIN_W = 440
const WIN_H = 340
const HEADER_H = 52
const CONTENT_TOP = -(WIN_H / 2) + HEADER_H       // -126
const CONTENT_H   = WIN_H - HEADER_H               // 296
const CONTENT_CY  = CONTENT_TOP + CONTENT_H / 2    // 22
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

  // Window system
  private openWindows: Map<AppId, Phaser.GameObjects.Container> = new Map()
  private windowDepth = 20
  private dragging: DragState | null = null

  // Per-app state
  private lastTapTime: Partial<Record<AppId, number>> = {}
  private gravadorState: 'idle' | 'recording' | 'stopped' = 'idle'
  private gravadorStatusText: Phaser.GameObjects.Text | null = null
  private desenho: DesenhoState = { container: null, gfx: null, readyBtn: null, tapCount: 0, drawColor: 0x3498DB }
  private calcDisplay = ''
  private calcText: Phaser.GameObjects.Text | null = null

  // Timer (padrão EF01CO01 — desenhado diretamente no GameScene)
  private timeBarFill?: Phaser.GameObjects.Graphics
  private timerTween?: Phaser.Tweens.Tween
  private timerState = { progress: 1 }

  // Gravador recording timer reference (allows cleanup on window close)
  private gravadorRecTimerEvent: Phaser.Time.TimerEvent | null = null

  // Guard against double-close (pointerdown fires on closeBg and closeTxt)
  private closingWindows: Set<AppId> = new Set()

  // Guard against re-entry during mission complete animation
  private missionEffectActive = false

  // Impede que ações de app sejam processadas após fim de tempo ou conclusão do nível
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
    this.currentLives  = data?.lives  ?? 1
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
  }

  create() {
    this.createDesktop()
    this.createAppIcons()
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
        Phaser.Math.Clamp(ptr.y + this.dragging.offY, 148 + WIN_H / 2, 720 - WIN_H / 2),
      )
    }

    // Desenho livre
    if (this.desenho.container && this.desenho.gfx && this.input.activePointer.isDown) {
      const ptr = this.input.activePointer
      const cx  = this.desenho.container.x
      const cy  = this.desenho.container.y
      const lx  = ptr.x - cx
      const ly  = ptr.y - cy
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

  // ── Desktop ───────────────────────────────────────────────────────────────

  private createDesktop() {
    this.add.image(640, 360, 'desktop-bg').setOrigin(0.5).setDisplaySize(1280, 720)
  }

  // ── Ícones de app ─────────────────────────────────────────────────────────

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
    const ROW_Y  = [215, 390, 560]
    const rows   = Math.ceil(count / 2)
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
    const CORNER_R  = 22

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
    hitZone.on('pointerover',  () => iconImg.setTint(0xDDEEFF))
    hitZone.on('pointerout',   () => iconImg.clearTint())

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
    const cx = Phaser.Math.Between(320, 840)
    const cy = Phaser.Math.Between(300, 460)
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

    // Ícone + título no header (fonte maior)
    const titleTxt = this.add.text(
      -(WIN_W / 2) + 16, -(WIN_H / 2) + HEADER_H / 2,
      `${def.icon}  ${def.label}`,
      { fontSize: '22px', color: '#FFFFFF', fontFamily: 'Arial Black, Arial' },
    ).setOrigin(0, 0.5)

    // Botão fechar (maior, mais fácil de tocar)
    const closeBg = this.add.rectangle(WIN_W / 2 - 24, -(WIN_H / 2) + HEADER_H / 2, 38, 36, 0xE74C3C)
      .setStrokeStyle(1, 0xFFFFFF, 0.3)
    const closeTxt = this.add.text(WIN_W / 2 - 24, -(WIN_H / 2) + HEADER_H / 2, '✕', {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial Black',
    }).setOrigin(0.5)

    // Conteúdo do app
    const contentItems = this.createAppContent(def.id)

    const container = this.add.container(cx, cy, [
      shadow, body, contentBg, header, headerShine, titleTxt, closeBg, closeTxt,
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
    closeBg.on('pointerout',  () => closeBg.setFillStyle(0xE74C3C))
    closeBg.on('pointerdown', () => this.closeWindow(def.id))

    closeTxt.setInteractive({ useHandCursor: true })
    closeTxt.on('pointerdown', () => this.closeWindow(def.id))

    // Armazena referência de desenho após container criado
    if (def.id === 'desenho') {
      this.desenho.container = container
    }

    return container
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

  // ── Botões HUD (mute + instruções) ────────────────────────────────────────

  private createHudButtons() {
    let muted = false

    // Botão mute
    const muteBg = this.add.rectangle(1248, 18, 48, 38, 0x0A1628, 0.85)
      .setStrokeStyle(1.5, 0x2E86C1).setInteractive({ useHandCursor: true }).setDepth(6)
    const muteIcon = this.add.text(1248, 18, '🔊', { fontSize: '20px' })
      .setOrigin(0.5).setDepth(7)

    muteBg.on('pointerdown', () => {
      muted = !muted
      muteIcon.setText(muted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', muted)
      this.handleMuteAudio(muted)
    })
    muteBg.on('pointerover', () => muteBg.setFillStyle(0x1A2A3A))
    muteBg.on('pointerout',  () => muteBg.setFillStyle(0x0A1628, 0.85))

    // Botão instruções
    const insBg = this.add.rectangle(1192, 18, 48, 38, 0x0A1628, 0.85)
      .setStrokeStyle(1.5, 0x2E86C1).setInteractive({ useHandCursor: true }).setDepth(6)
    this.add.text(1192, 18, '❓', { fontSize: '20px' }).setOrigin(0.5).setDepth(7)

    insBg.on('pointerdown', () => this.onShowInstructions())
    insBg.on('pointerover', () => insBg.setFillStyle(0x1A2A3A))
    insBg.on('pointerout',  () => insBg.setFillStyle(0x0A1628, 0.85))
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

  // ── Conteúdo dos apps ─────────────────────────────────────────────────────

  private createAppContent(appId: AppId): Phaser.GameObjects.GameObject[] {
    switch (appId) {
      case 'camera':      return this.createCameraContent()
      case 'gravador':    return this.createGravadorContent()
      case 'desenho':     return this.createDesenhoContent()
      case 'calculadora': return this.createCalculadoraContent()
      case 'navegador':   return this.createNavegadorContent()
      case 'player':      return this.createPlayerContent()
    }
  }

  // ── Câmera ────────────────────────────────────────────────────────────────

  private createCameraContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []
    const vx = 0, vy = CONTENT_CY - 20, vw = 420, vh = 220

    // Fundo do visor — imagem real
    const visorBg = this.add.image(vx, vy, 'camera-scene').setDisplaySize(vw, vh)
    const visorFrame = this.add.rectangle(vx, vy, vw, vh, 0x000000, 0).setStrokeStyle(3, 0x2E86C1)
    objects.push(visorBg, visorFrame)

    // Sujeitos a fotografar — elementos animados dentro do visor
    const subjectDefs: { x: number; y: number; em: string; fs: string; dy: number }[] = [
      { x: -80, y: vy - 20, em: '🌳', fs: '32px', dy:  5 },
      { x:   0, y: vy - 10, em: '⭐', fs: '28px', dy: -6 },
      { x:  85, y: vy - 25, em: '🏠', fs: '30px', dy:  4 },
      { x: -45, y: vy + 35, em: '🌸', fs: '22px', dy: -4 },
      { x:  55, y: vy + 32, em: '🦋', fs: '20px', dy:  6 },
    ]
    subjectDefs.forEach(({ x, y, em, fs, dy }, i) => {
      const s = this.add.text(x, y, em, { fontSize: fs }).setOrigin(0.5)
      this.tweens.add({
        targets: s, y: y + dy,
        duration: 1400 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })
      objects.push(s)
    })

    // Linha de grade (regra dos terços — horizontal)
    const grid = this.add.graphics()
    grid.lineStyle(1, 0x5DADE2, 0.25)
    grid.lineBetween(-vw / 2, vy - vh / 6, vw / 2, vy - vh / 6)
    grid.lineBetween(-vw / 2, vy + vh / 6, vw / 2, vy + vh / 6)
    grid.lineBetween(-vw / 3, vy - vh / 2, -vw / 3, vy + vh / 2)
    grid.lineBetween( vw / 3, vy - vh / 2,  vw / 3, vy + vh / 2)
    objects.push(grid)

    // Linha de varredura (scan line animada)
    const scanLine = this.add.rectangle(vx, vy - vh / 2 + 4, vw - 4, 3, 0x5DADE2, 0.35)
    this.tweens.add({
      targets: scanLine, y: vy + vh / 2 - 4,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })
    objects.push(scanLine)

    // Caixa de foco (AF box) — pisca levemente ao redor do sujeito central
    const afBox = this.add.graphics()
    const afSize = 42
    afBox.lineStyle(2, 0x2ECC71, 1)
    afBox.strokeRect(-afSize / 2, vy - 10 - afSize / 2, afSize, afSize)
    this.tweens.add({ targets: afBox, alpha: { from: 1, to: 0.25 }, duration: 700, yoyo: true, repeat: -1 })
    objects.push(afBox)

    // Cantos do visor (decorativos)
    const corners = this.add.graphics()
    corners.lineStyle(4, 0x5DADE2)
    const hw = vw / 2, hh = vh / 2
    corners.lineBetween(-hw, vy - hh, -hw + 22, vy - hh)
    corners.lineBetween(-hw, vy - hh, -hw, vy - hh + 22)
    corners.lineBetween( hw, vy - hh,  hw - 22, vy - hh)
    corners.lineBetween( hw, vy - hh,  hw, vy - hh + 22)
    corners.lineBetween(-hw, vy + hh, -hw + 22, vy + hh)
    corners.lineBetween(-hw, vy + hh, -hw, vy + hh - 22)
    corners.lineBetween( hw, vy + hh,  hw - 22, vy + hh)
    corners.lineBetween( hw, vy + hh,  hw, vy + hh - 22)
    objects.push(corners)

    // Indicador REC (canto superior esquerdo do visor)
    const recDot = this.add.circle(-hw + 16, vy - hh + 14, 6, 0xE74C3C)
    const recLbl = this.add.text(-hw + 28, vy - hh + 14, 'AO VIVO', {
      fontSize: '11px', color: '#E74C3C', fontFamily: 'Arial Black',
    }).setOrigin(0, 0.5)
    this.tweens.add({ targets: [recDot, recLbl], alpha: { from: 1, to: 0.1 }, duration: 900, yoyo: true, repeat: -1 })
    objects.push(recDot, recLbl)

    // Botão Tirar Foto
    const btn = this.createButton(0, CONTENT_CY + 120, 220, 56, '📷  Tirar Foto', 0x1A6B9A, () => {
      this.flashCamera(objects)
      this.time.delayedCall(400, () => {
        EventBus.emit('app-action', { appId: 'camera', actionKey: 'take-photo' })
        this.playSuccess()
      })
    })
    objects.push(btn)

    return objects
  }

  private flashCamera(cameraObjects?: Phaser.GameObjects.GameObject[]) {
    const vx = 0, vy = CONTENT_CY - 20, vw = 420, vh = 220
    const flash = this.add.rectangle(vx, vy, vw, vh, 0xFFFFFF, 0.95).setDepth(100)
    this.tweens.add({ targets: flash, alpha: 0, duration: 350, onComplete: () => flash.destroy() })
    // Congela brevemente a varredura (pausa tweens dos sujeitos por 500ms)
    if (cameraObjects) {
      cameraObjects.forEach(o => {
        if (o instanceof Phaser.GameObjects.Text) {
          this.tweens.getTweensOf(o).forEach(t => { t.pause(); this.time.delayedCall(500, () => t.resume()) })
        }
      })
    }
    this.playTone(1200, 0.06, 'sine', 0.15)
  }

  // ── Gravador ──────────────────────────────────────────────────────────────

  private createGravadorContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []

    // Status
    const status = this.add.text(0, CONTENT_CY - 90, '⏹  Parado', {
      fontSize: '20px', color: '#BDC3C7', fontFamily: 'Arial Black',
    }).setOrigin(0.5)
    this.gravadorStatusText = status
    objects.push(status)

    // Fundo da área de waveform
    objects.push(
      this.add.image(0, CONTENT_CY - 40, 'gravador-bg').setDisplaySize(340, 100)
    )

    // Forma de onda estática (sobre o fundo)
    const wave = this.add.graphics()
    this.drawWaveform(wave, 0, CONTENT_CY - 40, 320, 60, 0x5DADE2)
    objects.push(wave)

    // Nível de gravação (animado quando recording)
    const recLevel = this.add.graphics()
    objects.push(recLevel)

    // Botão ação (Gravar / Parar / Salvar)
    const actionBtn = this.createButton(0, CONTENT_CY + 50, 220, 64, '🎙️  Gravar', 0x922B21, () => {
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
      else          gfx.lineTo(x, cy + amp)
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
      btnText.setText('⏹  Parar')
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
      btnText.setText('💾  Salvar')
      this.gravadorStatusText?.setText('⏹  Parado').setColor('#BDC3C7')
      recLevel.clear()
      this.playTone(330, 0.08, 'sine', 0.12)

    } else {
      // Salvar
      this.gravadorState = 'idle'
      btnText.setText('🎙️  Gravar')
      this.gravadorStatusText?.setText('✅  Salvo!').setColor('#2ECC71')
      this.playSuccess()
      this.time.delayedCall(600, () => {
        EventBus.emit('app-action', { appId: 'gravador', actionKey: 'save-recording' })
      })
    }
  }

  // ── Desenho ───────────────────────────────────────────────────────────────

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
      this.add.text(0, CONTENT_CY - 50, '✏️  Desenhe aqui!', {
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
      dot.on('pointerout',  () => dot.setScale(1))
      objects.push(dot)
    })

    // Botão Pronto (desabilitado até o jogador desenhar)
    const readyBtn = this.createButton(100, CONTENT_CY + 88, 150, 56, '✅ Pronto!', 0x1E8449, () => {
      EventBus.emit('app-action', { appId: 'desenho', actionKey: 'confirm-drawing' })
      this.playSuccess()
    })
    readyBtn.setAlpha(0.3)
    this.desenho.readyBtn = readyBtn
    objects.push(readyBtn)

    return objects
  }

  // ── Calculadora ───────────────────────────────────────────────────────────

  private createCalculadoraContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []

    // Fundo texturizado da calculadora (atrás de tudo)
    objects.push(
      this.add.image(0, CONTENT_CY + 30, 'calc-bg').setDisplaySize(420, 210)
    )

    // Visor
    const visorBg = this.add.rectangle(0, CONTENT_TOP + 36, 340, 56, 0x1A252F)
      .setStrokeStyle(2, 0x1E8449)
    objects.push(visorBg)

    const display = this.add.text(150, CONTENT_TOP + 36, '0', {
      fontSize: '28px', color: '#2ECC71', fontFamily: 'Courier New, monospace',
    }).setOrigin(1, 0.5)
    this.calcText = display
    this.calcDisplay = ''
    objects.push(display)

    // Botões
    const layout = [
      ['7', '8', '9', '÷'],
      ['4', '5', '6', '×'],
      ['1', '2', '3', '-'],
      ['C', '0', '=', '+'],
    ]

    const BTN_W = 84, BTN_H = 54, GAP = 6
    const gridW = 4 * BTN_W + 3 * GAP
    const startX = -gridW / 2 + BTN_W / 2
    const startY = CONTENT_TOP + 85

    layout.forEach((row, ri) => {
      row.forEach((key, ci) => {
        const bx = startX + ci * (BTN_W + GAP)
        const by = startY + ri * (BTN_H + GAP)
        const isOp  = ['÷', '×', '-', '+'].includes(key)
        const isEq  = key === '='
        const isCl  = key === 'C'
        const color = isEq ? 0x1E8449 : isCl ? 0x922B21 : isOp ? 0x1A6B9A : 0x2C3E50

        const btn = this.createButton(bx, by, BTN_W, BTN_H, key, color, () => {
          this.handleCalcKey(key)
        })
        btn.setScale(0.95)
        objects.push(btn)
      })
    })

    return objects
  }

  private handleCalcKey(key: string) {
    this.playTone(660, 0.04, 'sine', 0.08)
    if (key === 'C') {
      this.calcDisplay = ''
    } else if (key === '=') {
      try {
        const expr = this.calcDisplay
          .replace(/÷/g, '/').replace(/×/g, '*')
        const result = Function(`"use strict"; return (${expr})`)() as number
        this.calcDisplay = String(Math.round(result * 1000) / 1000)
      } catch {
        this.calcDisplay = 'Erro'
      }
      this.calcText?.setText(this.calcDisplay || '0')
      this.time.delayedCall(300, () => {
        EventBus.emit('app-action', { appId: 'calculadora', actionKey: 'calculate' })
        this.playSuccess()
      })
      return
    } else {
      // Evita entradas inválidas consecutivas de operadores
      const lastChar = this.calcDisplay.slice(-1)
      const isOpKey  = ['÷', '×', '-', '+'].includes(key)
      if (isOpKey && ['÷', '×', '-', '+'].includes(lastChar)) {
        this.calcDisplay = this.calcDisplay.slice(0, -1)
      }
      if (this.calcDisplay === '0' && !isOpKey) this.calcDisplay = ''
      this.calcDisplay += key
    }

    this.calcText?.setText(this.calcDisplay || '0')
  }

  // ── Navegador ─────────────────────────────────────────────────────────────

  private createNavegadorContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []

    // Barra de endereço
    const addrBar = this.add.rectangle(0, CONTENT_TOP + 28, 360, 36, 0xFFFFFF)
      .setStrokeStyle(2, 0xCA6F1E)
    objects.push(addrBar)
    objects.push(
      this.add.text(-166, CONTENT_TOP + 28, '🌐  escola.edu.br', {
        fontSize: '14px', color: '#7F8C8D', fontFamily: 'Courier New',
      }).setOrigin(0, 0.5)
    )

    // Área de página — imagem da Biblioteca Digital
    objects.push(
      this.add.image(0, CONTENT_CY - 20, 'browser-page').setDisplaySize(362, 260)
    )

    // Links clicáveis
    const links = [
      '📖  Livros de Histórias',
      '🔬  Ciências e Natureza',
      '🎨  Arte e Cultura',
    ]

    links.forEach((txt, i) => {
      const ly = CONTENT_CY - 16 + i * 46
      const linkBg = this.add.rectangle(0, ly, 320, 38, 0xEAF4FB)
        .setStrokeStyle(1, 0xAED6F1)
        .setInteractive({ useHandCursor: true })

      const linkTxt = this.add.text(-148, ly, txt, {
        fontSize: '14px', color: '#1A6B9A', fontFamily: 'Arial',
      }).setOrigin(0, 0.5)

      linkBg.on('pointerover', () => { linkBg.setFillStyle(0xD6EAF8); linkTxt.setColor('#0E4D7B') })
      linkBg.on('pointerout',  () => { linkBg.setFillStyle(0xEAF4FB); linkTxt.setColor('#1A6B9A') })
      linkBg.on('pointerdown', () => {
        linkTxt.setStyle({ color: '#7D3C98' })
        this.playSuccess()
        this.time.delayedCall(300, () => {
          EventBus.emit('app-action', { appId: 'navegador', actionKey: 'navigate' })
        })
      })

      objects.push(linkBg, linkTxt)
    })

    return objects
  }

  // ── Player ────────────────────────────────────────────────────────────────

  private createPlayerContent(): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = []
    let playing = false

    // Capa do álbum
    const albumArt   = this.add.image(0, CONTENT_CY - 55, 'album-art').setDisplaySize(150, 150)
    const albumFrame = this.add.rectangle(0, CONTENT_CY - 55, 154, 154, 0x000000, 0).setStrokeStyle(3, 0x2E86C1)
    objects.push(albumArt, albumFrame)

    // Título
    objects.push(
      this.add.text(0, CONTENT_CY + 32, '🌙  Canção da Lua', {
        fontSize: '18px', color: '#1A252F', fontFamily: 'Arial Black',
      }).setOrigin(0.5)
    )

    // Barra de progresso da música
    const trackBg  = this.add.rectangle(0, CONTENT_CY + 68, 300, 10, 0xBDC3C7)
    const trackBar = this.add.rectangle(-150, CONTENT_CY + 68, 0, 10, 0x2E86C1).setOrigin(0, 0.5)
    objects.push(trackBg, trackBar)

    // Botão Play/Pause
    const playBtn = this.createButton(0, CONTENT_CY + 100, 160, 64, '▶  Tocar', 0x1A252F, () => {
      playing = !playing
      const btnTxt = playBtn.getAt(2) as Phaser.GameObjects.Text
      btnTxt.setText(playing ? '⏸  Pausa' : '▶  Tocar')

      if (playing) {
        this.playTone(262, 0.15, 'sine', 0.20, 0)
        this.playTone(330, 0.15, 'sine', 0.18, 0.20)
        this.playTone(392, 0.25, 'sine', 0.22, 0.40)

        // Anima barra de progresso
        this.tweens.add({ targets: trackBar, scaleX: 300, duration: 8000, ease: 'Linear' })

        this.time.delayedCall(500, () => {
          EventBus.emit('app-action', { appId: 'player', actionKey: 'play-music' })
        })
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
      missionText:    mission.text,
      stepHint:       step?.hint ?? '',
      missionIndex:   this.completedMissions,
      totalMissions:  this.levelConfig.missions.length,
      level:          this.levelConfig.level,
    })
  }

  // ── Intro de nível ────────────────────────────────────────────────────────

  private getLevelInstructions(): { objective: string; detail: string; tip: string } {
    const apps    = this.levelConfig.availableApps.length
    const missions = this.levelConfig.missions.length

    if (this.levelConfig.level === 1) {
      return {
        objective: `Complete ${missions} missões usando ${apps} apps disponíveis.`,
        detail:    'Abra a Câmera e a Calculadora para ajudar a Lua!',
        tip:       'Dê duplo toque no ícone para abrir um app.',
      }
    }
    if (this.levelConfig.level === 2) {
      return {
        objective: `Complete ${missions} missões usando ${apps} apps disponíveis.`,
        detail:    'Câmera, Calculadora, Desenho e Gravador estão disponíveis.',
        tip:       'Algumas missões têm dois passos — siga as dicas da barra!',
      }
    }
    return {
      objective: `Complete ${missions} missões usando ${apps} apps disponíveis.`,
      detail:    'Todos os 6 apps estão desbloqueados neste nível!',
      tip:       'Atenção à sequência: algumas missões têm vários passos.',
    }
  }

  private showStartScreen() {
    const info = this.getLevelInstructions()
    const W = 1280, H = 720

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x12324a, 0.58)
      .setDepth(60).setInteractive()

    const modal = this.add.container(W / 2, H / 2)
    modal.setDepth(61)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -154, 540, 312, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -166, 556, 312, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -166, 556, 312, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x1A6B9A, 1)
    topBar.fillRoundedRect(-196, -182, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -182, 392, 28, 14)

    const title = this.add.text(0, -102, `Nível ${this.levelConfig.level}`, {
      fontFamily: 'Arial', fontSize: '38px', fontStyle: 'bold',
      color: '#25327a', stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const objective = this.add.text(0, -42, info.objective, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold',
      color: '#1A6B9A', align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const detail = this.add.text(0, 12, `${info.detail}  •  ⏱ ${this.levelConfig.timeLimit}s`, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold',
      color: '#3b3b3b', align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setResolution(2)

    const button = this.add.container(0, 104)
    const buttonShadow = this.add.graphics()
    buttonShadow.fillStyle(0x000000, 0.16)
    buttonShadow.fillRoundedRect(-136, -20, 272, 48, 24)
    const buttonBg = this.add.graphics()
    buttonBg.fillStyle(0x1A6B9A, 1)
    buttonBg.fillRoundedRect(-140, -26, 280, 52, 26)
    buttonBg.lineStyle(4, 0xffffff, 1)
    buttonBg.strokeRoundedRect(-140, -26, 280, 52, 26)
    const buttonText = this.add.text(0, 0, 'Iniciar nível', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#0a2a4a', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    button.add([buttonShadow, buttonBg, buttonText])

    const buttonHitbox = this.add.zone(W / 2, H / 2 + 104, 280, 58)
    buttonHitbox.setDepth(62).setInteractive({ useHandCursor: true })
    buttonHitbox.on('pointerover', () =>
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: 'Sine.easeOut' }))
    buttonHitbox.on('pointerout', () =>
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: 'Sine.easeOut' }))
    buttonHitbox.on('pointerdown', () => {
      this.playTone(523, 0.10, 'sine', 0.20)
      overlay.destroy()
      buttonHitbox.destroy()
      modal.destroy()

      runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
      EventBus.emit('scene-ready', { levelConfig: this.levelConfig })
      this.broadcastMissionState()
      this.emitCheckpoint()

      this.levelStarted = true
    })

    modal.add([shadow, bg, topBar, title, objective, detail, button])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }


  // ── Efeitos visuais ───────────────────────────────────────────────────────

  private showStepCompleteEffect() {
    const txt = this.add.text(640, 380, '✅ Passo concluído!', {
      fontSize: '32px', fontFamily: 'Arial Black', color: '#2ECC71',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(201).setAlpha(0)

    this.tweens.add({
      targets: txt, alpha: { from: 0, to: 1 }, y: 340, duration: 300,
      yoyo: true, hold: 500,
      onComplete: () => txt.destroy(),
    })
  }

  private showMissionCompleteEffect(nextMissionText: string | null, onDone: () => void) {
    if (this.missionEffectActive) return
    this.missionEffectActive = true

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.45)
      .setDepth(200).setInteractive()

    const panel = this.add.rectangle(640, 360, 860, 320, 0x0A1628, 0.96)
      .setStrokeStyle(3, 0x2ECC71).setDepth(201)

    const title = this.add.text(640, 285, '✅ Missão concluída!', {
      fontSize: '36px', fontFamily: 'Arial Black', color: '#2ECC71',
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(202)

    const subtitle = this.add.text(640, 355, nextMissionText ? 'Próxima missão:' : 'Todas as missões foram concluídas!', {
      fontSize: '22px', fontFamily: 'Arial', color: '#AED6F1',
      align: 'center',
    }).setOrigin(0.5).setDepth(202)

    const nextTxt = this.add.text(640, 420, nextMissionText ?? 'Preparando resultado...', {
      fontSize: '26px', fontFamily: 'Arial Black', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 5,
      wordWrap: { width: 760 }, align: 'center',
    }).setOrigin(0.5).setDepth(202)

    const all = [overlay, panel, title, subtitle, nextTxt]
    all.forEach(obj => obj.setAlpha(0))
    this.tweens.add({ targets: all, alpha: 1, duration: 300 })

    this.time.delayedCall(1400, () => {
      this.tweens.add({
        targets: all, alpha: 0, duration: 250,
        onComplete: () => {
          all.forEach(obj => obj.destroy())
          this.missionEffectActive = false
          onDone()
        },
      })
    })
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
    const isFirstStep  = this.stepIndex === 0
    const isMultiStep  = (mission?.steps.length ?? 1) > 1

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

    const sub = this.add.text(0, -58, `⏰  O tempo acabou no Nível ${this.levelConfig.level}`, {
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
    retryHit.on('pointerout',  () => this.tweens.add({ targets: retryBtn, scale: 1, duration: 80 }))
    retryHit.on('pointerdown', () => {
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    })

    const exitHit = this.add.zone(W / 2 + 110, H / 2 + 60, 160, 44)
    exitHit.setDepth(402).setInteractive({ useHandCursor: true })
    exitHit.on('pointerover', () => this.tweens.add({ targets: exitBtn, scale: 1.05, duration: 80 }))
    exitHit.on('pointerout',  () => this.tweens.add({ targets: exitBtn, scale: 1, duration: 80 }))
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
      hits:   this.completedMissions,
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
            this.currentLives  = cmd.lives
          }
          return
        }
        case 'PAUSE_GAME':  { if (!this.scene.isPaused()) this.scene.pause();  return }
        case 'RESUME_GAME': { if  (this.scene.isPaused()) this.scene.resume(); return }
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

    const title = this.add.text(640, 245, `📋  Nível ${this.levelConfig.level} — Objetivo`, {
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
    const osc  = ctx.createOscillator()
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
