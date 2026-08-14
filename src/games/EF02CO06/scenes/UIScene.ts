import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { W, C, hex, label, paperCard, circleButton } from '../ui/kit'

interface MissionUpdatePayload {
  instruction: string
  hint: string
  roundIndex: number
  totalRounds: number
  level: number
}

const HEADER_H = 80
const MISSION = { cx: 640, cy: 138, w: 1180, h: 92 }
const HUD_BOTTOM = 190

export class UIScene extends Phaser.Scene {
  private levelChip!: Phaser.GameObjects.Text
  private instruction!: Phaser.GameObjects.Text
  private hint!: Phaser.GameObjects.Text
  private dots: Phaser.GameObjects.Graphics[] = []

  private timerFill!: Phaser.GameObjects.Graphics
  private timerText!: Phaser.GameObjects.Text
  private timerTrack = { x: 0, y: 0, w: 0 }
  private timeLeft = 0
  private timeTotal = 0
  private timerOn = false

  private veil!: Phaser.GameObjects.Rectangle
  private muteIcon!: Phaser.GameObjects.Graphics
  private muted = false

  constructor() { super({ key: 'UIScene' }) }

  create() {
    this.dots = []
    this.timerOn = false
    this.muted = false
    this.buildHeader()
    this.buildMissionCard()

    // A UIScene desenha acima do GameScene, então o véu do tutorial não a
    // alcança. Ela escurece a si mesma quando o jogo avisa.
    this.veil = this.add.rectangle(W / 2, HUD_BOTTOM / 2, W, HUD_BOTTOM, 0x0b1220, 0.8)
      .setDepth(999).setAlpha(0)

    this.registerListeners()
  }

  update(_t: number, dt: number) {
    if (!this.timerOn) return
    this.timeLeft = Math.max(0, this.timeLeft - dt / 1000)
    this.paintTimer()
    if (this.timeLeft <= 0) {
      this.timerOn = false
      EventBus.emit('timer-end')
    }
  }

  // ─────────────────────────────────────────────── cabeçalho

  private buildHeader() {
    const g = this.add.graphics()
    g.fillStyle(C.headerDeep, 0.96)
    g.fillRoundedRect(-40, -40, W + 80, HEADER_H + 40, 22)
    g.fillStyle(C.header, 0.95)
    g.fillRoundedRect(-40, -40, W + 80, HEADER_H + 34, 22)
    g.fillStyle(C.headerGlow, 0.38)
    g.fillRoundedRect(-40, -40, W + 80, HEADER_H * 0.55 + 40, 22)
    g.fillStyle(C.sun, 1); g.fillRect(0, HEADER_H - 4, W, 4)

    const chipW = 230
    const chip = this.add.graphics()
    chip.fillStyle(C.white, 0.16); chip.fillRoundedRect(22, 18, chipW, 44, 22)
    chip.lineStyle(2, C.white, 0.3); chip.strokeRoundedRect(22, 18, chipW, 44, 22)
    this.levelChip = label(this, 22 + chipW / 2, 40, 'N1 - CHECK 1/3',
      { size: 19, color: C.white })

    this.buildTimerPill(1000, 40)

    circleButton(this, 1148, 40, 26, C.slate, C.slateDeep, () => {
      this.muted = !this.muted
      this.paintMuteIcon()
      EventBus.emit('mute-audio', this.muted)
    })
    this.muteIcon = this.add.graphics()
    this.paintMuteIcon()

    circleButton(this, 1216, 40, 26, C.sun, C.sunDeep,
      () => EventBus.emit('show-tutorial'))
    label(this, 1216, 41, '?', { size: 32, color: C.ink })
  }

  /** Alto-falante desenhado: evita depender de glifo de emoji. */
  private paintMuteIcon() {
    const cx = 1148, cy = 40
    const g = this.muteIcon
    g.clear()
    g.fillStyle(C.white, 1)
    g.fillRect(cx - 10, cy - 4, 6, 8)
    g.fillTriangle(cx - 4, cy, cx + 4, cy - 10, cx + 4, cy + 10)

    if (this.muted) {
      g.lineStyle(3, C.coral, 1)
      g.lineBetween(cx - 12, cy - 11, cx + 12, cy + 11)
      return
    }
    g.lineStyle(3, C.white, 0.9)
    g.beginPath(); g.arc(cx + 5, cy, 9, -0.9, 0.9, false); g.strokePath()
  }

  private buildTimerPill(cx: number, cy: number) {
    const w = 196, h = 40
    const g = this.add.graphics()
    g.fillStyle(C.headerDeep, 0.9); g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, h / 2)
    g.lineStyle(2, C.white, 0.24); g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, h / 2)

    g.lineStyle(3, C.white, 0.85); g.strokeCircle(cx - w / 2 + 26, cy, 11)
    g.lineBetween(cx - w / 2 + 26, cy, cx - w / 2 + 26, cy - 6)
    g.lineBetween(cx - w / 2 + 26, cy, cx - w / 2 + 31, cy + 3)

    this.timerTrack = { x: cx - w / 2 + 46, y: cy + 6, w: w - 62 }
    g.fillStyle(C.white, 0.14)
    g.fillRoundedRect(this.timerTrack.x, this.timerTrack.y, this.timerTrack.w, 8, 4)

    this.timerFill = this.add.graphics()
    this.timerText = label(this, this.timerTrack.x + this.timerTrack.w / 2, cy - 7, '',
      { size: 16, color: C.white })
    this.paintTimer()
  }

  private paintTimer() {
    const { x, y, w } = this.timerTrack
    const p = this.timeTotal > 0
      ? Phaser.Math.Clamp(this.timeLeft / this.timeTotal, 0, 1) : 0

    this.timerFill.clear()
    if (p > 0) {
      this.timerFill.fillStyle(p > 0.4 ? C.mint : C.sun, 1)
      this.timerFill.fillRoundedRect(x, y, Math.max(8, w * p), 8, 4)
    }
    const s = Math.ceil(this.timeLeft)
    this.timerText.setText(s > 0 ? `bonus ${s}s` : 'sem bonus')
    this.timerText.setColor(hex(p > 0.4 ? C.white : C.sun))
  }

  // ─────────────────────────────────────────────── cartão de missão

  private buildMissionCard() {
    paperCard(this, MISSION.cx, MISSION.cy, MISSION.w, MISSION.h, { edge: C.sky, radius: 22 })

    const tag = this.add.graphics()
    tag.fillStyle(C.skyDeep, 1)
    tag.fillRoundedRect(MISSION.cx - MISSION.w / 2 + 14, MISSION.cy - 30, 8, 60, 4)

    this.instruction = label(this, MISSION.cx, MISSION.cy - 14, 'Carregando...',
      { size: 25, color: C.ink, wrap: MISSION.w - 90 })
    this.hint = label(this, MISSION.cx, MISSION.cy + 22, '',
      { size: 18, color: C.inkSoft, weight: 'bold', wrap: MISSION.w - 120 })
  }

  private paintDots(index: number, total: number) {
    this.dots.forEach(d => d.destroy())
    this.dots = []
    const gap = 40
    const x0 = W / 2 - ((total - 1) * gap) / 2

    for (let i = 0; i < total; i++) {
      const d = this.add.graphics()
      const x = x0 + i * gap, y = 40
      if (i < index) {
        d.fillStyle(C.mint, 1); d.fillCircle(x, y, 14)
        d.lineStyle(5, C.white, 1)
        d.lineBetween(x - 6, y, x - 2, y + 5)
        d.lineBetween(x - 2, y + 5, x + 6, y - 5)
      } else if (i === index) {
        d.fillStyle(C.sun, 0.32); d.fillCircle(x, y, 15)
        d.lineStyle(5, C.sun, 1); d.strokeCircle(x, y, 15)
      } else {
        d.fillStyle(C.white, 0.16); d.fillCircle(x, y, 11)
        d.lineStyle(3, C.white, 0.42); d.strokeCircle(x, y, 11)
      }
      this.dots.push(d)
    }
  }

  private alive() {
    return this.instruction?.active === true && this.veil?.active === true
  }

  private onMission = (data: MissionUpdatePayload) => {
    if (!this.alive()) return          // ← era: if (!this.scene.isActive() || ...)
    this.instruction.setText(data.instruction)
    this.hint.setText(data.hint)
    this.levelChip.setText(`N${data.level} - CHECK ${data.roundIndex + 1}/${data.totalRounds}`)
    this.paintDots(data.roundIndex, data.totalRounds)
  }
  
  private onTimerStart = (seconds: number) => {
    this.timeTotal = Math.max(0, seconds)
    this.timeLeft = this.timeTotal
    this.timerOn = this.timeTotal > 0
    this.paintTimer()
  }

  private onTimerPause = () => { this.timerOn = false }
  private onTimerResume = () => { if (this.timeLeft > 0) this.timerOn = true }
  private onTimerStop = () => { this.timerOn = false; this.timeLeft = 0; this.paintTimer() }

  /** Escurece e trava o HUD junto com o véu do tutorial e dos modais. */
  private onHudDim = (on: boolean) => {
    if (!this.veil?.active) return
    this.input.enabled = !on
    this.tweens.add({ targets: this.veil, alpha: on ? 1 : 0, duration: 260 })
  }

  private registerListeners() {
    EventBus.on('mission-update', this.onMission, this)
    EventBus.on('timer-start', this.onTimerStart, this)
    EventBus.on('timer-pause', this.onTimerPause, this)
    EventBus.on('timer-resume', this.onTimerResume, this)
    EventBus.on('timer-stop', this.onTimerStop, this)
    EventBus.on('hud-dim', this.onHudDim, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off('mission-update', this.onMission, this)
      EventBus.off('timer-start', this.onTimerStart, this)
      EventBus.off('timer-pause', this.onTimerPause, this)
      EventBus.off('timer-resume', this.onTimerResume, this)
      EventBus.off('timer-stop', this.onTimerStop, this)
      EventBus.off('hud-dim', this.onHudDim, this)
    })
  }
}