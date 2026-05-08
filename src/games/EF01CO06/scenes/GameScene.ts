import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { RoundResult } from '../../../shared/types/game'
import { APP_DEFS, type AppDef, type AppId, type LevelConfig } from '../types'
import { LEVELS } from '../data/levels'

const WIN_W = 440
const WIN_H = 340
const HEADER_H = 44
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
  private gravadorBtnText: Phaser.GameObjects.Text | null = null
  private gravadorStatusText: Phaser.GameObjects.Text | null = null
  private desenho: DesenhoState = { container: null, gfx: null, readyBtn: null, tapCount: 0, drawColor: 0x3498DB }
  private calcDisplay = ''
  private calcText: Phaser.GameObjects.Text | null = null

  // Timer
  private timerBar!: Phaser.GameObjects.Rectangle
  private timeLeft = 0
  private timerActive = false
  private timerWarned = false
  private warningBeepTimer: Phaser.Time.TimerEvent | null = null

  // Gravador recording timer reference (allows cleanup on window close)
  private gravadorRecTimerEvent: Phaser.Time.TimerEvent | null = null

  // Guard against double-close (pointerdown fires on closeBg and closeTxt)
  private closingWindows: Set<AppId> = new Set()

  // Guard against re-entry during mission complete animation
  private missionEffectActive = false

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
    this.gravadorBtnText = null
    this.gravadorStatusText = null
    this.lastTapTime = {}
    this.gravadorRecTimerEvent = null
    this.closingWindows = new Set()
    this.missionEffectActive = false
    this.timerActive = false
    this.timerWarned = false
    this.timeLeft = 0
    this.warningBeepTimer = null
  }

  create() {
    this.createDesktop()
    this.createTaskbar()
    this.createAppIcons()
    this.createTimerBar()
    this.registerPlatformCommands()

    this.input.on('pointerup', () => { this.dragging = null })

    EventBus.on('mute-audio',  this.handleMuteAudio, this)
    EventBus.on('app-action',  this.onAppAction,     this)

    this.showLevelIntro()
  }

  update(_time: number, delta: number) {
    if (this.timerActive) this.updateTimer(delta)

    // Drag de janela
    if (this.dragging && this.input.activePointer.isDown) {
      const ptr = this.input.activePointer
      this.dragging.container.setPosition(
        Phaser.Math.Clamp(ptr.x + this.dragging.offX, WIN_W / 2, 1280 - WIN_W / 2),
        Phaser.Math.Clamp(ptr.y + this.dragging.offY, 124 + WIN_H / 2, 660 - WIN_H / 2),
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
    this.timerActive = false
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.gravadorRecTimerEvent?.destroy()
    this.gravadorRecTimerEvent = null
    EventBus.off('mute-audio', this.handleMuteAudio, this)
    EventBus.off('app-action', this.onAppAction,     this)
    this.unsubscribePlatformCommands?.()
    this.unsubscribePlatformCommands = undefined
  }

  // ── Desktop ───────────────────────────────────────────────────────────────

  private createDesktop() {
    this.add.image(640, 330, 'desktop-bg').setOrigin(0.5).setY(330)
  }

  private createTaskbar() {
    this.add.image(640, 690, 'taskbar-bg').setOrigin(0.5)

    // Relógio
    const clock = this.add.text(1240, 690, '', {
      fontSize: '16px', color: '#AED6F1', fontFamily: 'Arial',
    }).setOrigin(0.5)

    const updateClock = () => {
      const d = new Date()
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      clock.setText(`${h}:${m}`)
    }
    updateClock()
    this.time.addEvent({ delay: 30000, callback: updateClock, loop: true })

    // Logo "Desktop da Lua" na taskbar
    this.add.text(20, 690, '🌙 Desktop da Lua', {
      fontSize: '18px', color: '#AED6F1', fontFamily: 'Arial Black, Arial',
    }).setOrigin(0, 0.5)
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
    // Grade 2 colunas à esquerda do desktop
    const COL1_X = 130, COL2_X = 260
    const ROW_Y  = [200, 360, 510]
    const rows   = Math.ceil(count / 2)
    const pos: { x: number; y: number }[] = []

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 2; c++) {
        if (pos.length >= count) break
        pos.push({ x: c === 0 ? COL1_X : COL2_X, y: ROW_Y[r] ?? 200 + r * 150 })
      }
    }
    return pos
  }

  private createIcon(def: AppDef, x: number, y: number) {
    const ICON_SIZE = 88

    const iconImg = this.add.image(0, 0, `icon-${def.id}`).setDisplaySize(ICON_SIZE, ICON_SIZE)
    const label   = this.add.text(0, ICON_SIZE / 2 + 4, def.label, {
      fontSize: '14px', color: '#FFFFFF', fontFamily: 'Arial Black, Arial',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0)

    const hitZone = this.add.zone(0, 0, ICON_SIZE + 10, ICON_SIZE + 30)
      .setInteractive({ useHandCursor: true })

    hitZone.on('pointerdown', () => this.handleIconTap(def.id))
    hitZone.on('pointerover',  () => iconImg.setTint(0xDDEEFF))
    hitZone.on('pointerout',   () => iconImg.clearTint())

    const container = this.add.container(x, y, [iconImg, label, hitZone])
    container.setDepth(5)

    // Animação de entrada
    container.setAlpha(0).setScale(0.7)
    const idx = this.levelConfig.availableApps.indexOf(def.id)
    this.tweens.add({
      targets: container, alpha: 1, scaleX: 1, scaleY: 1,
      delay: 200 + idx * 80, duration: 300, ease: 'Back.Out',
    })
  }

  private handleIconTap(appId: AppId) {
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
    const shadow = this.add.rectangle(8, 8, WIN_W, WIN_H, 0x000000, 0.3)

    // Corpo
    const body = this.add.rectangle(0, 0, WIN_W, WIN_H, def.bodyColor)
      .setStrokeStyle(2, def.headerColor)

    // Header
    const header = this.add.rectangle(0, -(WIN_H / 2) + HEADER_H / 2, WIN_W, HEADER_H, def.headerColor)

    // Ícone + título no header
    const titleTxt = this.add.text(
      -(WIN_W / 2) + 14, -(WIN_H / 2) + HEADER_H / 2,
      `${def.icon}  ${def.label}`,
      { fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial Black, Arial' },
    ).setOrigin(0, 0.5)

    // Botão fechar
    const closeBg = this.add.rectangle(WIN_W / 2 - 20, -(WIN_H / 2) + HEADER_H / 2, 32, 28, 0xE74C3C)
    const closeTxt = this.add.text(WIN_W / 2 - 20, -(WIN_H / 2) + HEADER_H / 2, '✕', {
      fontSize: '16px', color: '#FFFFFF', fontFamily: 'Arial Black',
    }).setOrigin(0.5)

    // Conteúdo do app
    const contentItems = this.createAppContent(def.id)

    const container = this.add.container(cx, cy, [
      shadow, body, header, titleTxt, closeBg, closeTxt,
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
          this.gravadorBtnText = null
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

  // ── Timer bar (igual ao EF01CO01) ─────────────────────────────────────────

  private createTimerBar() {
    // Fundo da barra (abaixo da UIScene, y=118)
    this.add.rectangle(640, 118, 1280, 10, 0x1A2A3A).setDepth(8)
    // Barra ativa (origem à esquerda para shrink direita→esquerda)
    this.timerBar = this.add.rectangle(0, 118, 1280, 10, 0x2ECC71).setOrigin(0, 0.5).setDepth(9)
  }

  private startTimer() {
    this.timeLeft = this.levelConfig.timeLimit * 1000
    this.timerActive = true
    this.timerWarned = false
    this.timerBar.setSize(1280, 10)
    this.timerBar.setFillStyle(0x2ECC71)
  }

  private updateTimer(delta: number) {
    this.timeLeft -= delta
    if (this.timeLeft <= 0) {
      this.timeLeft = 0
      this.timerActive = false
      this.onTimeUp()
      return
    }

    const ratio = this.timeLeft / (this.levelConfig.timeLimit * 1000)
    this.timerBar.setSize(Math.max(0, 1280 * ratio), 10)

    const color = ratio > 0.5 ? 0x2ECC71 : ratio > 0.25 ? 0xF39C12 : 0xE74C3C
    this.timerBar.setFillStyle(color)

    if (!this.timerWarned && ratio <= 0.25) {
      this.timerWarned = true
      this.startWarningBeeps()
    }
  }

  private startWarningBeeps() {
    this.warningBeepTimer = this.time.addEvent({
      delay: 1000, loop: true, callback: () => {
        if (!this.timerActive) {
          this.warningBeepTimer?.destroy()
          this.warningBeepTimer = null
          return
        }
        this.playTone(880, 0.06, 'sine', 0.12)
      },
    })
  }

  private onTimeUp() {
    this.timerBar.setSize(0, 10)
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.input.enabled = false

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: 0,
      stage: this.levelConfig.level,
    })

    // "Tempo Esgotado!" overlay (interativo para bloquear cliques)
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6).setDepth(70).setInteractive()
    const txt = this.add.text(640, 360, '⏱ Tempo Esgotado!', {
      fontSize: '72px', fontFamily: 'Arial Black', color: '#E74C3C',
      stroke: '#000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(71).setAlpha(0)

    this.tweens.add({ targets: txt, alpha: 1, scaleX: { from: 0.5, to: 1 }, scaleY: { from: 0.5, to: 1 }, duration: 350, ease: 'Back.Out' })
    this.playTone(330, 0.30, 'square', 0.18)
    this.time.delayedCall(100, () => this.playTone(220, 0.40, 'square', 0.16))

    this.time.delayedCall(1600, () => {
      this.tweens.add({
        targets: [overlay, txt], alpha: 0, duration: 300,
        onComplete: () => {
          overlay.destroy()
          txt.destroy()
          this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
        },
      })
    })
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

    // Visor
    const visor = this.add.rectangle(0, CONTENT_CY - 40, 340, 180, 0x1A252F)
      .setStrokeStyle(3, 0x2E86C1)
    objects.push(visor)

    // Cantos do visor
    const corners = this.add.graphics()
    corners.lineStyle(4, 0x5DADE2)
    const cx2 = 0, cy2 = CONTENT_CY - 40, hw = 170, hh = 90
    // TL
    corners.lineBetween(cx2 - hw, cy2 - hh, cx2 - hw + 20, cy2 - hh)
    corners.lineBetween(cx2 - hw, cy2 - hh, cx2 - hw, cy2 - hh + 20)
    // TR
    corners.lineBetween(cx2 + hw, cy2 - hh, cx2 + hw - 20, cy2 - hh)
    corners.lineBetween(cx2 + hw, cy2 - hh, cx2 + hw, cy2 - hh + 20)
    // BL
    corners.lineBetween(cx2 - hw, cy2 + hh, cx2 - hw + 20, cy2 + hh)
    corners.lineBetween(cx2 - hw, cy2 + hh, cx2 - hw, cy2 + hh - 20)
    // BR
    corners.lineBetween(cx2 + hw, cy2 + hh, cx2 + hw - 20, cy2 + hh)
    corners.lineBetween(cx2 + hw, cy2 + hh, cx2 + hw, cy2 + hh - 20)
    objects.push(corners)

    // Mira central
    const mira = this.add.graphics()
    mira.lineStyle(2, 0x5DADE2, 0.6)
    mira.lineBetween(-10, CONTENT_CY - 40, 10, CONTENT_CY - 40)
    mira.lineBetween(0, CONTENT_CY - 50, 0, CONTENT_CY - 30)
    objects.push(mira)

    // Botão Tirar Foto
    const btn = this.createButton(0, CONTENT_CY + 80, 200, 48, '📷  Tirar Foto', 0x1A6B9A, () => {
      this.flashCamera()
      this.time.delayedCall(400, () => {
        EventBus.emit('app-action', { appId: 'camera', actionKey: 'take-photo' })
        this.playSuccess()
      })
    })
    objects.push(btn)

    return objects
  }

  private flashCamera() {
    const flash = this.add.rectangle(0, CONTENT_CY - 40, 340, 180, 0xFFFFFF, 0.9).setDepth(100)
    this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() })
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

    // Forma de onda estática
    const wave = this.add.graphics()
    this.drawWaveform(wave, 0, CONTENT_CY - 40, 320, 60, 0x2C3E50)
    objects.push(wave)

    // Nível de gravação (animado quando recording)
    const recLevel = this.add.graphics()
    objects.push(recLevel)

    // Botão ação (Gravar / Parar / Salvar)
    const actionBtn = this.createButton(0, CONTENT_CY + 50, 200, 48, '🎙️  Gravar', 0x922B21, () => {
      this.handleGravadorAction(actionBtn, recLevel)
    })
    objects.push(actionBtn)

    // Guarda referência ao texto do botão
    const btnText = actionBtn.getAt(2) as Phaser.GameObjects.Text
    this.gravadorBtnText = btnText

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

    // Canvas de desenho
    const canvas = this.add.rectangle(0, CONTENT_CY - 50, 370, 190, 0xFFFDF6)
      .setStrokeStyle(3, 0x76448A)
    objects.push(canvas)

    // Hint
    objects.push(
      this.add.text(0, CONTENT_CY - 50, '✏️  Desenhe aqui!', {
        fontSize: '14px', color: '#BDC3C7', fontFamily: 'Arial',
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
    const readyBtn = this.createButton(140, CONTENT_CY + 88, 120, 40, '✅ Pronto!', 0x1E8449, () => {
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

    const BTN_W = 72, BTN_H = 46, GAP = 6
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

    // Área de página
    objects.push(
      this.add.rectangle(0, CONTENT_CY + 20, 360, 200, 0xFEFBF3)
        .setStrokeStyle(1, 0xD5D8DC)
    )

    // Título da página
    objects.push(
      this.add.text(0, CONTENT_CY - 60, '📚 Biblioteca Digital da Lua', {
        fontSize: '15px', color: '#1A252F', fontFamily: 'Arial Black',
      }).setOrigin(0.5)
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
    const albumBg = this.add.rectangle(0, CONTENT_CY - 55, 150, 150, 0x1A252F)
      .setStrokeStyle(3, 0x2E86C1)
    const albumNote = this.add.text(0, CONTENT_CY - 55, '🎵', { fontSize: '56px' }).setOrigin(0.5)
    objects.push(albumBg, albumNote)

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
    const playBtn = this.createButton(0, CONTENT_CY + 100, 140, 48, '▶  Tocar', 0x1A252F, () => {
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
      fontSize: '16px', color: '#FFFFFF',
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

  private showLevelIntro() {
    this.input.enabled = false

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setDepth(60)

    const stars = '★'.repeat(this.levelConfig.level) + '☆'.repeat(3 - this.levelConfig.level)
    this.add.text(640, 200, stars, {
      fontSize: '52px', color: '#F1C40F',
    }).setOrigin(0.5).setDepth(61)

    this.add.text(640, 280, `NÍVEL  ${this.levelConfig.level}`, {
      fontSize: '80px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(61)

    this.add.text(640, 380, `🖥️  Desktop da Lua`, {
      fontSize: '34px', color: '#AED6F1', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(61)

    this.add.text(640, 430, `${this.levelConfig.availableApps.length} apps disponíveis`, {
      fontSize: '22px', color: '#F9E79F',
    }).setOrigin(0.5).setDepth(61)

    this.playCountdown()

    let count = 3
    const cntTxt = this.add.text(640, 520, '3', {
      fontSize: '96px', fontFamily: 'Arial Black', color: '#FF6B35',
      stroke: '#000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(61)

    const evt = this.time.addEvent({
      delay: 1000, repeat: 2, callback: () => {
        count--
        if (count > 0) { cntTxt.setText(String(count)); this.playTone(880, 0.07); return }

        this.tweens.add({
          targets: [overlay, cntTxt], alpha: 0, duration: 350,
          onComplete: () => {
            overlay.destroy()
            cntTxt.destroy()
            evt.destroy()
            this.input.enabled = true

            runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
            EventBus.emit('scene-ready', { levelConfig: this.levelConfig })
            this.broadcastMissionState()
            this.emitCheckpoint()
            this.playTone(784, 0.10, 'sine', 0.28)
            this.time.delayedCall(100, () => this.playTone(1046, 0.20, 'sine', 0.32))

            // Mostra o primeiro desafio com o mesmo padrão visual das missões seguintes
            this.showFirstMissionBanner(this.levelConfig.missions[0].text)
          },
        })

        this.children.list
          .filter(o => (o as { depth?: number }).depth === 61 && o !== cntTxt)
          .forEach(o => this.tweens.add({ targets: o, alpha: 0, duration: 350 }))
      },
    })
  }

  // ── Efeitos visuais ───────────────────────────────────────────────────────

  private showStepCompleteEffect() {
    const txt = this.add.text(640, 380, '✅ Passo concluído!', {
      fontSize: '32px', fontFamily: 'Arial Black', color: '#2ECC71',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(55).setAlpha(0)

    this.tweens.add({
      targets: txt, alpha: { from: 0, to: 1 }, y: 340, duration: 300, ease: 'Back.Out',
      onComplete: () => this.tweens.add({ targets: txt, alpha: 0, duration: 400, delay: 800, onComplete: () => txt.destroy() }),
    })
  }

  // Mostra "PRIMEIRO DESAFIO" após o countdown, mantendo o mesmo padrão visual das missões seguintes
  private showFirstMissionBanner(missionText: string) {
    this.input.enabled = false

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.55)
      .setDepth(58).setInteractive()

    const label = this.add.text(640, 280, 'PRIMEIRO DESAFIO:', {
      fontSize: '30px', fontFamily: 'Arial Black', color: '#AED6F1',
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(59).setAlpha(0)

    const missionTxt = this.add.text(640, 370, missionText, {
      fontSize: '36px', fontFamily: 'Arial Black', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 7,
      wordWrap: { width: 900 }, align: 'center',
    }).setOrigin(0.5).setDepth(59).setAlpha(0)

    const hint = this.add.text(640, 470, '⬆️  Veja a dica na barra acima!', {
      fontSize: '20px', fontFamily: 'Arial', color: '#F9E79F',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(59).setAlpha(0)

    this.tweens.add({ targets: [label, missionTxt, hint], alpha: 1, duration: 350, ease: 'Power2' })
    this.playTone(784, 0.10, 'sine', 0.20)

    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: [overlay, label, missionTxt, hint], alpha: 0, duration: 350,
        onComplete: () => {
          overlay.destroy(); label.destroy(); missionTxt.destroy(); hint.destroy()
          this.input.enabled = true
          this.startTimer()
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
    }).setOrigin(0.5).setDepth(56).setAlpha(0)

    this.tweens.add({
      targets: txt, alpha: 1, y: 380, duration: 280, ease: 'Back.Out',
      onComplete: () => this.tweens.add({
        targets: txt, alpha: 0, duration: 400, delay: 1200,
        onComplete: () => txt.destroy(),
      }),
    })

    this.playTone(440, 0.08, 'sine', 0.12)
    this.time.delayedCall(60, () => this.playTone(330, 0.10, 'sine', 0.10))
  }

  private showMissionCompleteEffect(nextMissionText: string | null, onDone: () => void) {
    if (this.missionEffectActive) return
    this.missionEffectActive = true

    // Pausa o timer para não conflitar com a animação
    const wasTimerActive = this.timerActive
    this.timerActive = false

    const resume = () => {
      this.missionEffectActive = false
      if (wasTimerActive) this.timerActive = true
      onDone()
    }

    // Overlay interativo (bloqueia cliques durante a animação)
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5)
      .setDepth(54).setInteractive()

    const txt = this.add.text(640, 330, '🌟 Missão Concluída!', {
      fontSize: '66px', fontFamily: 'Arial Black', color: '#F1C40F',
      stroke: '#000', strokeThickness: 9,
    }).setOrigin(0.5).setDepth(55).setAlpha(0)

    this.tweens.add({
      targets: txt, alpha: 1, scaleX: { from: 0.5, to: 1 }, scaleY: { from: 0.5, to: 1 },
      duration: 380, ease: 'Back.Out',
    })

    // Estrelas
    for (let i = 0; i < 20; i++) {
      const sx = Phaser.Math.Between(60, 1220)
      const sy = Phaser.Math.Between(-60, -10)
      const em = ['⭐', '🌟', '✨', '💫'][i % 4]
      const star = this.add.text(sx, sy, em, { fontSize: `${Phaser.Math.Between(20, 44)}px` }).setDepth(55)
      this.tweens.add({
        targets: star, y: Phaser.Math.Between(350, 650), alpha: { from: 1, to: 0 },
        angle: Phaser.Math.Between(-45, 45),
        duration: Phaser.Math.Between(900, 1800), delay: Phaser.Math.Between(0, 500),
        onComplete: () => star.destroy(),
      })
    }

    if (nextMissionText) {
      // Mostra o próximo desafio antes de continuar
      this.time.delayedCall(1900, () => {
        this.tweens.add({ targets: txt, alpha: 0, duration: 250 })

        const nextLabel = this.add.text(640, 290, 'PRÓXIMO DESAFIO:', {
          fontSize: '28px', fontFamily: 'Arial Black', color: '#AED6F1',
          stroke: '#000', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(55).setAlpha(0)

        const nextTxt = this.add.text(640, 370, nextMissionText, {
          fontSize: '34px', fontFamily: 'Arial Black', color: '#FFFFFF',
          stroke: '#000', strokeThickness: 6,
          wordWrap: { width: 900 }, align: 'center',
        }).setOrigin(0.5).setDepth(55).setAlpha(0)

        this.tweens.add({ targets: [nextLabel, nextTxt], alpha: 1, duration: 300, ease: 'Power2' })

        this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets: [overlay, nextLabel, nextTxt, txt], alpha: 0, duration: 300,
            onComplete: () => { overlay.destroy(); nextLabel.destroy(); nextTxt.destroy(); txt.destroy(); resume() },
          })
        })
      })
    } else {
      this.time.delayedCall(1900, () => {
        this.tweens.add({
          targets: [overlay, txt], alpha: 0, duration: 300,
          onComplete: () => { overlay.destroy(); txt.destroy(); resume() },
        })
      })
    }
  }

  // ── Fim de rodada ─────────────────────────────────────────────────────────

  private endRound() {
    this.timerActive = false
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.input.enabled = false

    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED',
      gameId: GAME_ID,
      stage: this.levelConfig.level,
    })

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
      this.time.delayedCall(2300, () => {
        this.scene.restart({ level: next, points: this.currentPoints, lives: this.currentLives })
      })
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

  private playCountdown() {
    this.playTone(880, 0.07, 'sine', 0.18)
  }
}
