import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { buildBeats, explainBeat, runPhase, shortText } from '../data/logic'
import {
    C,
    A,
    TEX,
    OPERATOR_NAME,
    hex,
    signalColor,
    signalSoft,
    signalGlow,
    signalWord,
    signalShort,
} from '../data/theme'
import {
    W,
    H,
    TOPBAR,
    HEADER,
    PARK,
    PLATE,
    LAMP,
    MACH,
    RIDE,
    RAIL,
    PANEL,
    DOCK,
    TOAST,
    MAP,
    MODAL,
    STAGE,
} from '../data/layout'
import { createRide, pulseRail, litReveal, type RideView } from './effects'
import type { AttractionId, Beat, LevelConfig, PhaseConfig, Statement, TraceEntry } from '../types'

const GAME_ID = 'circuito-da-verdade'

const STAGE_INTRO: Record<AttractionId, string[]> = {
    poste: [
        'Bem-vindo ao Parque dos Sinais. Está tudo apagado.',
        'Estes postes só acendem se o sinal certo chegar até eles.',
    ],
    carrossel: [
        'Olhe o carrossel. Ele ainda está sem energia.',
        'Resolva a frase e mande o sinal verde para ele girar.',
    ],
    roda: [
        'A roda-gigante é grande e precisa de dois sinais.',
        'Ela liga no OU: basta um trilho verde chegar.',
    ],
    queda: [
        'A queda-livre é exigente. Ela liga no E.',
        'Os dois trilhos precisam chegar verdes ao mesmo tempo.',
    ],
    montanha: [
        'A montanha-russa é a maior atração do parque.',
        'O caminho até ela tem várias etapas. Vá com calma.',
    ],
}

const STAGE_DONE: Record<AttractionId, string> = {
    poste: 'Os postes acenderam. O caminho do parque ficou visível.',
    carrossel: 'O carrossel ganhou energia e começou a girar.',
    roda: 'A roda-gigante acendeu e voltou a rodar.',
    queda: 'A queda-livre acendeu e está pronta para subir.',
    montanha: 'A montanha-russa acendeu. O parque inteiro voltou à vida.',
}

interface PlateView {
    container: Phaser.GameObjects.Container
    y: number
    paint: (state: 'idle' | 'active' | 'done') => void
    stamp: (value: boolean) => void
    shake: () => void
}

interface LampView {
    container: Phaser.GameObjects.Container
    y: number
    light: (value: boolean) => void
    preview: (value: boolean) => void
    reset: () => void
}

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private streak = 0
    private locked = true
    private ended = false

    private inputBlocker?: Phaser.GameObjects.Rectangle
    private unblockTimer?: Phaser.Time.TimerEvent
    private inputBlockedUntil = 0
    private typeTimer?: Phaser.Time.TimerEvent
    private stageTypeTimer?: Phaser.Time.TimerEvent

    private beats: Beat[] = []
    private beatIdx = 0
    private tries = 0
    private values = new Map<string, boolean>()
    private answers = new Map<string, boolean>()

    private bgDark?: Phaser.GameObjects.Image
    private bgLit?: Phaser.GameObjects.Image
    private rideLayer?: Phaser.GameObjects.Container
    private uiLayer?: Phaser.GameObjects.Container
    private railLayer?: Phaser.GameObjects.Graphics
    private pulseLayer?: Phaser.GameObjects.Graphics

    private ride?: RideView
    private plates = new Map<string, PlateView>()
    private lamps = new Map<string, LampView>()

    private machine?: Phaser.GameObjects.Container
    private machineBody?: Phaser.GameObjects.Graphics
    private machineBlade?: Phaser.GameObjects.Graphics
    private machineLabel?: Phaser.GameObjects.Text
    private machineTween?: Phaser.Tweens.Tween

    private panelText?: Phaser.GameObjects.Text
    private panelIcon?: Phaser.GameObjects.Graphics
    private helpBtn?: Phaser.GameObjects.Container
    private holdTimer?: Phaser.Time.TimerEvent
    private previewOn = false

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number; streak?: number }) {
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.streak = data.streak ?? 0
        this.locked = true
        this.ended = false

        this.unblockTimer?.remove()
        this.unblockTimer = undefined
        this.inputBlocker?.destroy()
        this.inputBlocker = undefined
        this.inputBlockedUntil = 0
        this.typeTimer?.remove()
        this.typeTimer = undefined
        this.stageTypeTimer?.remove()
        this.stageTypeTimer = undefined
        this.holdTimer?.remove()
        this.holdTimer = undefined
        this.previewOn = false

        this.beats = []
        this.beatIdx = 0
        this.tries = 0
        this.values = new Map()
        this.answers = new Map()

        this.bgDark = undefined
        this.bgLit = undefined
        this.rideLayer = undefined
        this.uiLayer = undefined
        this.railLayer = undefined
        this.pulseLayer = undefined
        this.ride = undefined
        this.plates = new Map()
        this.lamps = new Map()
        this.machine = undefined
        this.machineBody = undefined
        this.machineBlade = undefined
        this.machineLabel = undefined
        this.machineTween = undefined
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    private get beat(): Beat {
        return this.beats[this.beatIdx]
    }

    create() {
        this.beats = buildBeats(this.phase)

        this.buildBackground()
        this.buildHeader()
        this.buildQuizUI()
        this.buildRide()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        EventBus.on('timer-end', this.onTimeUp, this)
        this.events.once('shutdown', () => EventBus.off('timer-end', this.onTimeUp, this))

        this.fadeIn()

        if (this.phaseIdx === 0) {
            this.showLevelIntro(() => this.openStageIntro())
            return
        }
        this.openStageIntro()
    }

    private fadeIn() {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.night, 1).setDepth(880)
        this.tweens.add({
            targets: veil,
            alpha: 0,
            duration: 380,
            ease: 'Sine.easeOut',
            onComplete: () => veil.destroy(),
        })
    }

    // ------------------------------------------------------------- cenário

    private buildBackground() {
        this.bgDark = this.add.image(W / 2, H / 2, TEX.bgOff).setDepth(-4)
        this.bgDark.setScale(Math.max(W / this.bgDark.width, H / this.bgDark.height))

        this.bgLit = this.add.image(W / 2, H / 2, TEX.bgOn).setDepth(-3).setAlpha(0)
        this.bgLit.setScale(this.bgDark.scale)

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.night, A.veil)
        veil.fillRect(0, 0, W, H)

        const ground = this.add.graphics().setDepth(-1)
        ground.fillStyle(C.grassDark, 0.9)
        ground.fillRect(0, PARK.groundY, W, PARK.groundH + 120)
        ground.fillStyle(C.grass, 0.5)
        ground.fillEllipse(W / 2, PARK.groundY + 10, W * 1.1, 74)
        ground.fillStyle(C.gold, 0.07)
        ground.fillEllipse(W / 2, PARK.glowY, PARK.glowW, PARK.glowH)

        this.rideLayer = this.add.container(0, 0).setDepth(2)
        this.uiLayer = this.add.container(0, 0).setDepth(10)
    }

    private buildRide() {
        this.ride = createRide(this, this.rideLayer!, this.phase.attraction)
        this.ride.enter(180)
    }

    private buildHeader() {
        const bar = this.add.graphics().setDepth(40)
        bar.fillStyle(C.night, 0.94)
        bar.fillRect(0, 0, W, TOPBAR)
        bar.lineStyle(3, C.gold, 1)
        bar.lineBetween(0, TOPBAR, W, TOPBAR)

        const pill = this.add.graphics().setDepth(41)
        pill.fillStyle(C.sky, 1)
        pill.fillRoundedRect(HEADER.pillX, HEADER.pillY - HEADER.pillH / 2, HEADER.pillW, HEADER.pillH, HEADER.pillH / 2)
        pill.fillStyle(C.cream, A.gloss)
        pill.fillRoundedRect(HEADER.pillX + 7, HEADER.pillY - HEADER.pillH / 2 + 6, HEADER.pillW - 14, 11, 6)

        this.add.text(HEADER.pillX + HEADER.pillW / 2, HEADER.pillY, `NÍVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.night),
        }).setOrigin(0.5).setResolution(2).setDepth(42)

        const dots = this.add.graphics().setDepth(41)
        this.level.phases.forEach((_, i) => {
            const x = HEADER.dotsX + i * HEADER.dotGap
            const done = i < this.phaseIdx
            const now = i === this.phaseIdx
            dots.fillStyle(now ? C.gold : done ? C.on : C.metal, now || done ? 1 : 0.4)
            if (now) dots.fillRoundedRect(x - 14, HEADER.dotsY - HEADER.dotR, 28, HEADER.dotR * 2, HEADER.dotR)
            else dots.fillCircle(x, HEADER.dotsY, HEADER.dotR)
        })

        if (this.level.streakBonus) this.paintStreak()

        this.helpBtn = this.buildHelpButton()
        this.helpBtn.setVisible(false)
    }

    private paintStreak() {
        const g = this.add.graphics().setDepth(41)
        for (let i = 0; i < 3; i++) {
            const x = HEADER.streakX + i * HEADER.streakGap
            const on = i < Math.min(3, this.streak)
            g.fillStyle(on ? C.gold : C.nightSoft, 1)
            g.fillCircle(x, HEADER.streakY, HEADER.streakR)
            g.lineStyle(3, on ? C.cream : C.metalDark, 1)
            g.strokeCircle(x, HEADER.streakY, HEADER.streakR)
            if (!on) continue
            g.fillStyle(C.cream, 0.9)
            g.fillCircle(x - 3, HEADER.streakY - 4, 4)
        }
    }

    private buildHelpButton() {
        const btn = this.add.container(HEADER.helpX, HEADER.helpY).setDepth(42)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.24)
        g.fillCircle(0, 6, HEADER.helpR)
        g.fillStyle(C.gold, 1)
        g.fillCircle(0, 0, HEADER.helpR)
        g.fillStyle(C.cream, A.gloss)
        g.fillEllipse(0, -9, 28, 12)

        const t = this.add.text(0, 0, '?', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: hex(C.night),
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(HEADER.helpR * 2 + 12, HEADER.helpR * 2 + 12)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', () => {
            if (this.isInputBlocked() || this.ended) return
            this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
            this.replayTutorial()
        })
        return btn
    }

    // ------------------------------------------------------------- modo palco

    private openStageIntro() {
        this.locked = true
        this.uiLayer!.setAlpha(0).setVisible(false)
        this.ride?.toStage()

        const lines = STAGE_INTRO[this.phase.attraction]
        this.showStageCard(lines, 'Vamos lá', () => this.goQuiz(() => this.runTutorial()))
    }

    private showStageCard(lines: string[], label: string, onDone: () => void) {
        const card = this.add.container(W / 2, STAGE.cardY).setDepth(70)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-STAGE.cardW / 2 + 4, -STAGE.cardH / 2 + 10, STAGE.cardW, STAGE.cardH, STAGE.cardR)
        g.fillStyle(C.night, 0.95)
        g.fillRoundedRect(-STAGE.cardW / 2, -STAGE.cardH / 2, STAGE.cardW, STAGE.cardH, STAGE.cardR)
        g.lineStyle(4, C.gold, 1)
        g.strokeRoundedRect(-STAGE.cardW / 2, -STAGE.cardH / 2, STAGE.cardW, STAGE.cardH, STAGE.cardR)
        g.fillStyle(C.sky, 1)
        g.fillRoundedRect(-STAGE.cardW / 2 + 18, -STAGE.cardH / 2 + 18, 8, STAGE.cardH - 36, 4)

        const text = this.add.text(0, 0, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: STAGE.fontSize,
            color: hex(C.cream),
            align: 'center',
            wordWrap: { width: STAGE.cardW - 90 },
        }).setOrigin(0.5).setResolution(2)

        card.add([g, text])
        card.setAlpha(0).setY(STAGE.cardY + 40)
        this.tweens.add({ targets: card, alpha: 1, y: STAGE.cardY, duration: 420, ease: 'Back.easeOut' })

        const btn = this.button(W / 2, STAGE.btnY - 20, 280, 70, label, C.sky, () => {
            this.blockInput()
            this.stageTypeTimer?.remove()
            this.tweens.add({
                targets: [card, btn],
                alpha: 0,
                y: '+=26',
                duration: 260,
                ease: 'Sine.easeIn',
                onComplete: () => {
                    card.destroy()
                    btn.destroy()
                    onDone()
                },
            })
        }, '22px', true).setDepth(71)
        btn.setAlpha(0)

        let lineIdx = 0
        const typeLine = () => {
            const full = lines[lineIdx]
            let i = 0
            text.setText('')
            this.stageTypeTimer?.remove()
            this.stageTypeTimer = this.time.addEvent({
                delay: STAGE.typeDelay,
                repeat: full.length - 1,
                callback: () => {
                    if (!text.active) return
                    i++
                    text.setText(full.slice(0, i))
                    if (i < full.length) return
                    lineIdx++
                    if (lineIdx < lines.length) {
                        this.time.delayedCall(1100, typeLine)
                        return
                    }
                    this.tweens.add({ targets: btn, alpha: 1, duration: 260 })
                },
            })
        }

        this.time.delayedCall(520, typeLine)
    }

    private goQuiz(onDone: () => void) {
        this.uiLayer!.setVisible(true)
        this.ride?.toQuiz()
        this.tweens.add({
            targets: this.uiLayer,
            alpha: 1,
            duration: 460,
            delay: 200,
            ease: 'Sine.easeOut',
            onComplete: onDone,
        })
    }

    private goStage(onDone: () => void) {
        this.tweens.add({
            targets: this.uiLayer,
            alpha: 0,
            duration: 320,
            ease: 'Sine.easeIn',
            onComplete: () => {
                this.uiLayer!.setVisible(false)
                this.ride?.toStage(onDone)
            },
        })
    }

    // --------------------------------------------------------------- circuito

    private buildQuizUI() {
        this.railLayer = this.add.graphics()
        this.pulseLayer = this.add.graphics()
        this.uiLayer!.add([this.railLayer, this.pulseLayer])

        const list = this.phaseStatements()
        list.forEach((s, i) => {
            const y = list.length === 1 ? PLATE.singleY : PLATE.pairY[i]
            this.plates.set(s.id, this.buildPlate(s, y, list.length > 1 ? i : -1))
            this.lamps.set(s.id, this.buildLamp(y))
        })

        this.buildMachine()
        this.buildPanel()
        this.buildDock()
        this.drawRails()

        this.uiLayer!.setAlpha(0).setVisible(false)
    }

    private phaseStatements(): Statement[] {
        const p = this.phase
        if (p.kind === 'valor' || p.kind === 'negacao') return [p.statement]
        if (p.kind === 'dupla') return [p.left, p.right]
        return p.statements
    }

    private buildPlate(s: Statement, y: number, index: number): PlateView {
        const container = this.add.container(PLATE.cx, y)
        const g = this.add.graphics()

        const paint = (state: 'idle' | 'active' | 'done') => {
            const line = state === 'active' ? C.sky : state === 'done' ? C.gold : C.border
            const width = state === 'active' ? 6 : 4
            g.clear()
            g.fillStyle(C.shadow, A.shadow)
            g.fillRoundedRect(-PLATE.w / 2 + 4, -PLATE.h / 2 + 10, PLATE.w, PLATE.h, 22)
            g.fillStyle(state === 'idle' ? C.panelSoft : C.panel, 1)
            g.fillRoundedRect(-PLATE.w / 2, -PLATE.h / 2, PLATE.w, PLATE.h, 22)
            g.fillStyle(C.white, 0.5)
            g.fillRoundedRect(-PLATE.w / 2 + 12, -PLATE.h / 2 + 9, PLATE.w - 24, 16, 8)
            g.lineStyle(width, line, 1)
            g.strokeRoundedRect(-PLATE.w / 2, -PLATE.h / 2, PLATE.w, PLATE.h, 22)
            g.fillStyle(C.railDark, 1)
            g.fillRoundedRect(PLATE.w / 2 - 6, -14, 18, 28, 6)
        }
        paint('idle')

        if (index >= 0) {
            const tag = this.add.graphics()
            tag.fillStyle(C.night, 1)
            tag.fillRoundedRect(-52, PLATE.tagDY - 15, 104, 30, 15)
            const tagText = this.add.text(0, PLATE.tagDY, index === 0 ? 'FRASE A' : 'FRASE B', {
                fontFamily: 'Arial Black, Arial',
                fontSize: '16px',
                color: hex(C.cream),
            }).setOrigin(0.5).setResolution(2)
            container.add([tag, tagText])
        }

        const text = this.add.text(0, 0, s.text, {
            fontFamily: 'Arial Black, Arial',
            fontSize: PLATE.fontSize,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: PLATE.w - PLATE.pad * 2 },
        }).setOrigin(0.5).setResolution(2)

        const sealG = this.add.graphics().setAlpha(0)
        const sealT = this.add.text(-PLATE.w / 2 + 34, -PLATE.h / 2 + 30, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2).setAlpha(0)

        container.add([g, text, sealG, sealT])
        this.uiLayer!.add(container)

        return {
            container,
            y,
            paint,
            stamp: (value: boolean) => {
                sealG.clear()
                sealG.fillStyle(signalColor(value), 1)
                sealG.fillCircle(-PLATE.w / 2 + 34, -PLATE.h / 2 + 30, 24)
                sealG.fillStyle(C.white, A.gloss)
                sealG.fillEllipse(-PLATE.w / 2 + 34, -PLATE.h / 2 + 22, 26, 11)
                sealT.setText(signalShort(value))
                sealG.setAlpha(0).setScale(1.8)
                this.tweens.add({ targets: [sealG, sealT], alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
            },
            shake: () => {
                this.tweens.add({
                    targets: container,
                    x: PLATE.cx + 12,
                    duration: 60,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => container.setX(PLATE.cx),
                })
            },
        }
    }

    private buildLamp(y: number): LampView {
        const container = this.add.container(LAMP.x, y)
        const glow = this.add.graphics()
        const bulb = this.add.graphics()

        const label = this.add.text(0, LAMP.labelDY, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: hex(C.cream),
            stroke: hex(C.night),
            strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        let pulseTween: Phaser.Tweens.Tween | undefined

        const paint = (value: boolean | null, alpha: number) => {
            glow.clear()
            bulb.clear()

            if (value !== null) {
                glow.fillStyle(signalGlow(value), 0.22 * alpha)
                glow.fillCircle(0, 0, LAMP.glowR)
                glow.fillStyle(signalGlow(value), 0.3 * alpha)
                glow.fillCircle(0, 0, LAMP.glowR * 0.6)
            }

            bulb.fillStyle(C.railDark, 1)
            bulb.fillRoundedRect(-16, LAMP.r - 4, 32, 18, 6)
            bulb.fillStyle(value === null ? C.metalDark : signalColor(value), value === null ? 1 : alpha)
            bulb.fillCircle(0, 0, LAMP.r)
            bulb.lineStyle(4, C.cream, value === null ? 0.4 : 0.9)
            bulb.strokeCircle(0, 0, LAMP.r)
            if (value === null) return
            bulb.fillStyle(C.white, 0.55 * alpha)
            bulb.fillEllipse(-7, -9, 20, 12)
        }
        paint(null, 1)

        container.add([glow, bulb, label])
        this.uiLayer!.add(container)

        return {
            container,
            y,
            light: (value: boolean) => {
                pulseTween?.stop()
                paint(value, 1)
                label.setText(signalWord(value))
                this.tweens.add({ targets: container, scaleX: 1.24, scaleY: 0.82, duration: 130, yoyo: true, ease: 'Sine.easeOut' })
                const pulse = { v: 0 }
                pulseTween = this.tweens.add({
                    targets: pulse,
                    v: 1,
                    duration: 900,
                    repeat: -1,
                    onUpdate: () => paint(value, 0.82 + Math.sin(pulse.v * Math.PI * 2) * 0.18),
                })
            },
            preview: (value: boolean) => {
                paint(value, A.preview)
            },
            reset: () => {
                pulseTween?.stop()
                paint(null, 1)
                label.setText('')
            },
        }
    }

    private buildMachine() {
        this.machine = this.add.container(MACH.x, MACH.y).setAlpha(0)
        this.machineBody = this.add.graphics()
        this.machineBlade = this.add.graphics()
        this.machineLabel = this.add.text(0, MACH.labelDY, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '30px',
            color: hex(C.cream),
            stroke: hex(C.night),
            strokeThickness: 6,
        }).setOrigin(0.5).setResolution(2)

        this.machine.add([this.machineBody, this.machineBlade, this.machineLabel])
        this.uiLayer!.add(this.machine)
    }

    private paintMachine(kind: 'nao' | 'e' | 'ou', state: 'idle' | 'active' | boolean) {
        const g = this.machineBody!
        const blade = this.machineBlade!
        const r = MACH.size / 2
        const live = typeof state === 'boolean'
        const tone = live ? signalColor(state) : state === 'active' ? C.sky : C.metalDark
        const strong = live || state === 'active'

        g.clear()
        blade.clear()

        g.fillStyle(C.shadow, 0.26)
        g.fillCircle(0, 10, r + 6)
        g.fillStyle(C.night, 1)
        g.fillCircle(0, 0, r + 6)
        g.lineStyle(6, tone, 1)
        g.strokeCircle(0, 0, r + 6)

        if (kind === 'nao') {
            g.fillStyle(C.on, strong ? 1 : 0.5)
            g.slice(0, 0, r, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(270), false)
            g.fillPath()
            g.fillStyle(C.off, strong ? 1 : 0.5)
            g.slice(0, 0, r, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), false)
            g.fillPath()
            g.fillStyle(C.night, 1)
            g.fillCircle(0, 0, r * 0.3)

            blade.fillStyle(C.cream, 0.95)
            for (let i = 0; i < 3; i++) {
                const a = Phaser.Math.DegToRad(i * 120)
                blade.fillTriangle(
                    Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9,
                    Math.cos(a + 0.5) * r * 0.28, Math.sin(a + 0.5) * r * 0.28,
                    Math.cos(a - 0.5) * r * 0.28, Math.sin(a - 0.5) * r * 0.28,
                )
            }
        } else if (kind === 'e') {
            g.fillStyle(C.nightSoft, 1)
            g.fillCircle(0, 0, r)
            g.lineStyle(13, tone, strong ? 1 : 0.5)
            g.lineBetween(-r * 0.9, -r * 0.5, -r * 0.1, 0)
            g.lineBetween(-r * 0.9, r * 0.5, -r * 0.1, 0)
            g.lineBetween(-r * 0.1, 0, r * 0.9, 0)
            g.fillStyle(tone, strong ? 1 : 0.55)
            g.fillTriangle(-r * 0.16, -r * 0.42, -r * 0.16, r * 0.42, r * 0.5, 0)
            g.fillStyle(C.cream, 0.9)
            g.fillCircle(-r * 0.9, -r * 0.5, 9)
            g.fillCircle(-r * 0.9, r * 0.5, 9)
        } else {
            g.fillStyle(C.nightSoft, 1)
            g.fillCircle(0, 0, r)
            g.lineStyle(13, tone, strong ? 1 : 0.5)
            g.beginPath()
            g.moveTo(-r * 0.9, -r * 0.55)
            g.lineTo(-r * 0.25, -r * 0.34)
            g.lineTo(r * 0.2, 0)
            g.strokePath()
            g.beginPath()
            g.moveTo(-r * 0.9, r * 0.55)
            g.lineTo(-r * 0.25, r * 0.34)
            g.lineTo(r * 0.2, 0)
            g.strokePath()
            g.lineBetween(r * 0.2, 0, r * 0.9, 0)
            g.fillStyle(C.cream, 0.9)
            g.fillCircle(-r * 0.9, -r * 0.55, 9)
            g.fillCircle(-r * 0.9, r * 0.55, 9)
            g.fillStyle(tone, strong ? 1 : 0.55)
            g.fillCircle(r * 0.2, 0, 15)
        }

        this.machineLabel!.setText(OPERATOR_NAME[kind])
    }

    private showMachine(kind: 'nao' | 'e' | 'ou') {
        this.paintMachine(kind, 'active')
        this.machineTween?.stop()
        this.machine!.setScale(0.6)
        this.tweens.add({
            targets: this.machine,
            alpha: 1,
            scale: 1,
            duration: 460,
            ease: 'Back.easeOut',
        })
        if (kind !== 'nao') return
        this.machineTween = this.tweens.add({
            targets: this.machineBlade,
            angle: 360,
            duration: 2400,
            repeat: -1,
            ease: 'Linear',
        })
    }

    private spinMachine(onDone?: () => void) {
        this.machineTween?.stop()
        this.tweens.add({
            targets: this.machineBlade,
            angle: this.machineBlade!.angle + 720,
            duration: 620,
            ease: 'Cubic.easeInOut',
        })
        this.tweens.add({
            targets: this.machine,
            scale: 1.12,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => onDone?.(),
        })
    }

    private drawRails(previewValue?: boolean) {
        const g = this.railLayer!
        g.clear()

        const list = this.phaseStatements()
        const beat = this.beat
        const machineOn = !!this.machine && this.machine.alpha > 0.5

        list.forEach(s => {
            const lamp = this.lamps.get(s.id)!
            const value = this.values.has(s.id) ? this.values.get(s.id)! : null
            this.strokeRail(g, PLATE.outX, lamp.y, LAMP.x - LAMP.r - 6, lamp.y, value, previewValue)
            if (!machineOn) return
            this.strokeRail(g, LAMP.x + LAMP.r + 6, lamp.y, MACH.inX, MACH.y, value, previewValue)
        })

        if (!machineOn) {
            const only = list[0]
            const value = this.values.has(only.id) ? this.values.get(only.id)! : null
            this.strokeRail(g, LAMP.x + LAMP.r + 6, this.lamps.get(only.id)!.y, RIDE.inX, MACH.y, value, previewValue)
            return
        }

        const outValue = beat && this.values.has(beat.id) ? this.values.get(beat.id)! : null
        this.strokeRail(g, MACH.outX, MACH.y, RIDE.inX, MACH.y, outValue, previewValue)
    }

    private strokeRail(
        g: Phaser.GameObjects.Graphics,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        value: boolean | null,
        previewValue?: boolean,
    ) {
        const shown = value !== null ? value : previewValue !== undefined ? previewValue : null
        const ghost = value === null && previewValue !== undefined
        const color = shown === null ? C.rail : signalColor(shown)
        const alpha = shown === null ? A.railOff : ghost ? A.preview : 1
        const width = shown === null ? RAIL.thin : RAIL.thick
        const midX = (x1 + x2) / 2

        g.lineStyle(width + 8, C.railDark, alpha * 0.7)
        g.beginPath()
        g.moveTo(x1, y1)
        g.lineTo(midX, y1)
        g.lineTo(midX, y2)
        g.lineTo(x2, y2)
        g.strokePath()

        g.lineStyle(width, color, alpha)
        g.beginPath()
        g.moveTo(x1, y1)
        g.lineTo(midX, y1)
        g.lineTo(midX, y2)
        g.lineTo(x2, y2)
        g.strokePath()

        g.fillStyle(color, alpha)
        g.fillCircle(midX, y1, RAIL.jointR)
        g.fillCircle(midX, y2, RAIL.jointR)

        if (shown !== true) return
        g.fillStyle(C.cream, 0.75)
        for (let x = x1 + RAIL.pulseGap / 2; x < midX; x += RAIL.pulseGap) g.fillCircle(x, y1, RAIL.pulseR * 0.5)
        for (let x = midX + RAIL.pulseGap / 2; x < x2; x += RAIL.pulseGap) g.fillCircle(x, y2, RAIL.pulseR * 0.5)
    }

    private buildPanel() {
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.28)
        g.fillRoundedRect(PANEL.x + 4, PANEL.y + 10, PANEL.w, PANEL.h, PANEL.r)
        g.fillStyle(C.night, 0.96)
        g.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r)
        g.lineStyle(4, C.gold, 1)
        g.strokeRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r)
        g.fillStyle(C.sky, 1)

        this.panelIcon = this.add.graphics()
        this.paintPanelIcon(C.sky)

        this.panelText = this.add.text(PANEL.iconX + PANEL.iconR + 26, PANEL.y + PANEL.h / 2, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: PANEL.fontSize,
            color: hex(C.cream),
            align: 'left',
            wordWrap: { width: PANEL.w - 190 },
        }).setOrigin(0, 0.5).setResolution(2)

        this.uiLayer!.add([g, this.panelIcon, this.panelText])
    }

    private paintPanelIcon(tone: number) {
        const g = this.panelIcon!
        const cx = PANEL.iconX
        const cy = PANEL.y + PANEL.h / 2
        g.clear()
        g.fillStyle(tone, 0.25)
        g.fillCircle(cx, cy, PANEL.iconR + 8)
        g.fillStyle(tone, 1)
        g.fillCircle(cx, cy, PANEL.iconR)
        g.fillStyle(C.cream, 0.9)
        g.fillTriangle(cx - 7, cy - 15, cx + 9, cy - 2, cx - 2, cy - 2)
        g.fillTriangle(cx + 7, cy + 15, cx - 9, cy + 2, cx + 2, cy + 2)
    }

    private say(text: string, tone = C.sky) {
        this.paintPanelIcon(tone)
        this.typeTimer?.remove()
        const target = this.panelText!
        target.setText('')
        let i = 0
        this.typeTimer = this.time.addEvent({
            delay: PANEL.typeDelay,
            repeat: text.length - 1,
            callback: () => {
                if (!target.active) return
                i++
                target.setText(text.slice(0, i))
            },
        })
    }

    // ------------------------------------------------------------------ doca

    private buildDock() {
        const g = this.add.graphics()
        g.fillStyle(C.nightDeep, 0.9)
        g.fillRect(0, DOCK.top, W, H - DOCK.top)
        g.lineStyle(3, C.goldDark, 0.7)
        g.lineBetween(0, DOCK.top, W, DOCK.top)

        const half = DOCK.btnWide / 2 + DOCK.gap / 2
        const btnTrue = this.buildAnswerButton(W / 2 - half, true)
        const btnFalse = this.buildAnswerButton(W / 2 + half, false)

        const hint = this.add.text(W / 2, DOCK.hintY, 'segure para ver o sinal antes de responder', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: DOCK.hintSize,
            color: hex(C.goldDark),
        }).setOrigin(0.5).setResolution(2)

        this.uiLayer!.add([g, btnTrue, btnFalse, hint])
    }

    private buildAnswerButton(x: number, value: boolean) {
        const w = DOCK.btnWide
        const h = DOCK.btnH
        const btn = this.add.container(x, DOCK.cy)
        const g = this.add.graphics()

        const paint = (held: boolean) => {
            g.clear()
            g.fillStyle(C.shadow, 0.3)
            g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, h / 2)
            g.fillStyle(held ? signalGlow(value) : signalColor(value), 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 10, -h / 2 + 9, w - 20, h * 0.3, h / 4)
            g.lineStyle(5, C.cream, held ? 1 : 0.75)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        }
        paint(false)

        const iconX = -w / 2 + DOCK.iconDX
        const badge = this.add.graphics()
        badge.fillStyle(C.white, 0.2)
        badge.fillCircle(iconX, 0, 26)

        const mark = this.add.graphics()
        mark.lineStyle(8, C.white, 1)
        if (value) {
            mark.lineBetween(iconX - 12, 2, iconX - 3, 12)
            mark.lineBetween(iconX - 3, 12, iconX + 13, -11)
        } else {
            mark.lineBetween(iconX - 11, -11, iconX + 11, 11)
            mark.lineBetween(iconX + 11, -11, iconX - 11, 11)
        }

        const label = this.add.text(-w / 2 + DOCK.labelDX, 0, signalWord(value), {
            fontFamily: 'Arial Black, Arial',
            fontSize: DOCK.fontSize,
            color: '#ffffff',
        }).setOrigin(0, 0.5).setResolution(2)

        btn.add([g, badge, mark, label])
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })

        btn.on('pointerdown', () => {
            if (this.isInputBlocked() || this.locked) return
            paint(true)
            this.tweens.add({ targets: btn, scale: 0.96, duration: 80 })
            this.holdTimer?.remove()
            this.holdTimer = this.time.delayedCall(DOCK.holdMs, () => this.startPreview(value))
        })

        const release = (confirm: boolean) => {
            paint(false)
            this.tweens.add({ targets: btn, scale: 1, duration: 90 })
            this.holdTimer?.remove()
            this.holdTimer = undefined
            const wasPreview = this.previewOn
            this.stopPreview()
            if (!confirm) return
            if (this.isInputBlocked() || this.locked) return
            this.answer(value, wasPreview)
        }

        btn.on('pointerup', () => release(true))
        btn.on('pointerout', () => release(false))

        return btn
    }

    private startPreview(value: boolean) {
        if (this.locked || !this.beat) return
        this.previewOn = true
        this.drawRails(value)
        this.lamps.forEach((l, id) => { if (!this.values.has(id)) l.preview(value) })
        this.ride?.preview(value)
        if (this.machine && this.machine.alpha > 0.5 && this.beat.operator) {
            this.paintMachine(this.beat.operator, value)
        }
    }

    private stopPreview() {
        if (!this.previewOn) return
        this.previewOn = false
        this.lamps.forEach((l, id) => {
            if (this.values.has(id)) l.light(this.values.get(id)!)
            else l.reset()
        })
        this.ride?.clearPreview()
        if (this.machine && this.machine.alpha > 0.5 && this.beat?.operator) {
            this.paintMachine(this.beat.operator, 'active')
        }
        this.drawRails()
    }

    // ------------------------------------------------------------- progressão

    private startPhase() {
        this.locked = false
        this.beatIdx = 0
        this.tries = 0
        this.presentBeat()
    }

    private presentBeat() {
        const beat = this.beat
        if (!beat) return

        this.plates.forEach((plate, id) => {
            const isTarget = beat.kind === 'valor' && beat.refs[0] === id
            plate.paint(isTarget ? 'active' : this.values.has(id) ? 'done' : 'idle')
        })

        if (beat.kind !== 'valor' && beat.operator) {
            this.showMachine(beat.operator)
            this.time.delayedCall(200, () => this.drawRails())
        }

        this.say(beat.question, beat.kind === 'valor' ? C.sky : C.gold)
    }

    private answer(value: boolean, fromPreview: boolean) {
        const beat = this.beat
        if (!beat) return

        this.locked = true
        this.ride?.nudge(fromPreview ? 0.02 : 0.045)

        if (value !== beat.expected) {
            this.onWrong(beat)
            return
        }

        this.values.set(beat.id, beat.expected)
        this.answers.set(beat.id, value)
        if (beat.kind === 'valor') this.values.set(beat.refs[0], beat.expected)

        this.onRight(beat)
    }

    private onRight(beat: Beat) {
        const isLast = this.beatIdx + 1 >= this.beats.length

        const advance = () => {
            if (isLast) {
                this.finishPhase()
                return
            }
            this.beatIdx++
            this.locked = false
            this.time.delayedCall(180, () => this.presentBeat())
        }

        if (beat.kind === 'valor') {
            const id = beat.refs[0]
            this.plates.get(id)?.paint('done')
            this.plates.get(id)?.stamp(beat.expected)
            const lampY = this.lamps.get(id)?.y ?? MACH.y

            pulseRail(
                this,
                this.pulseLayer!,
                { x: PLATE.outX, y: lampY },
                { x: LAMP.x, y: lampY },
                beat.expected,
                () => {
                    this.lamps.get(id)?.light(beat.expected)
                    this.drawRails()
                    this.time.delayedCall(260, advance)
                },
            )
            return
        }

        this.spinMachine(() => {
            this.paintMachine(beat.operator!, beat.expected)
            this.drawRails()
            pulseRail(
                this,
                this.pulseLayer!,
                { x: MACH.outX, y: MACH.y },
                { x: RIDE.inX, y: MACH.y },
                beat.expected,
                advance,
            )
        })
    }

    private onWrong(beat: Beat) {
        this.tries++
        this.streak = 0
        this.cameras.main.shake(150, 0.004)

        if (beat.kind === 'valor') this.plates.get(beat.refs[0])?.shake()
        else {
            this.tweens.add({
                targets: this.machine,
                x: MACH.x + 10,
                duration: 60,
                yoyo: true,
                repeat: 2,
                onComplete: () => this.machine?.setX(MACH.x),
            })
        }

        const message = this.tries === 1
            ? beat.tip
            : this.tries === 2
                ? this.phase.hintDeep
                : this.beatTruth(beat)

        this.toast(message, C.gold)
        this.time.delayedCall(520, () => {
            this.locked = false
            this.say(beat.question, C.gold)
        })
    }

    private beatTruth(beat: Beat) {
        if (beat.kind === 'valor') return `Dica forte: esta frase é ${signalWord(beat.expected).toLowerCase()}.`
        const inputs = beat.refs.map(id => this.values.get(id) ?? false)
        return explainBeat(beat, inputs)
    }

    private finishPhase() {
        const beat = this.beats[this.beats.length - 1]
        const lit = beat.expected
        const clean = this.tries === 0
        if (clean) this.streak++
        else this.streak = 0

        const bonus = this.level.streakBonus && this.streak >= 2 ? 3 : 0
        const earned = (clean ? 10 : 5) + bonus
        this.points += earned

        runtimeGameBridge.emit({
            type: clean ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        const inputs = beat.refs.map(id => this.values.get(id) ?? false)
        const detail = beat.kind === 'valor' ? '' : ` ${explainBeat(beat, inputs)}`
        const tail = lit ? ` ${STAGE_DONE[this.phase.attraction]}` : ''
        const message = `${this.phase.explain}${detail}${tail}`

        this.goStage(() => {
            const afterRide = () => {
                if (this.level.showMap) {
                    this.showReasoningMap(() => this.showFeedback(clean, lit, message, earned, () => this.completePhase()))
                    return
                }
                this.showFeedback(clean, lit, message, earned, () => this.completePhase())
            }
            if (lit) this.ride?.powerOn(afterRide)
            else this.ride?.powerFail(afterRide)
        })
    }

    private completePhase() {
        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!isLastPhase) {
            EventBus.emit('curtain', () => this.scene.restart({
                level: this.level.level,
                phase: this.phaseIdx + 1,
                points: this.points,
                streak: this.streak,
            }))
            return
        }

        if (!isLastLevel) {
            EventBus.emit('park-flash', C.cream)
            showLevelComplete(this, {
                subtitle: `Nível ${this.level.level} completo`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.gold,
                overlayColor: C.night,
                titleColor: hex(C.night),
                subtitleColor: hex(C.skyDeep),
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2400,
                    onComplete: () => this.scene.restart({
                        level: this.level.level + 1,
                        phase: 0,
                        points: this.points,
                        streak: 0,
                    }),
                },
            })
            return
        }

        this.ended = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level })

        litReveal(this, this.bgDark!, this.bgLit!, () => {
            showLevelComplete(this, {
                title: 'Parque aceso!',
                subtitle: `${this.points} pontos`,
                message: 'Você usou NÃO, E e OU para levar energia até cada brinquedo.',
                accent: C.on,
                overlayColor: C.night,
                titleColor: hex(C.night),
                subtitleColor: hex(C.onDark),
                progress: { total: LEVELS.length, current: LEVELS.length },
            })
        })
    }

    private onTimeUp = () => {
        if (this.ended || this.locked) return
        this.locked = true
        this.showFeedback(false, false, `O tempo acabou. ${this.phase.explain}`, 0, () => this.completePhase())
    }

    // ---------------------------------------------------------------- overlays

    private showReasoningMap(onDone: () => void) {
        EventBus.emit('timer-stop')

        const { trace } = runPhase(this.phase, this.answers)
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.night, A.overlay).setDepth(500).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(501)

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.24)
        bg.fillRoundedRect(-MAP.w / 2 + 4, -MAP.h / 2 + 12, MAP.w, MAP.h, MODAL.r)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-MAP.w / 2, -MAP.h / 2, MAP.w, MAP.h, MODAL.r)
        bg.lineStyle(5, C.gold, 1)
        bg.strokeRoundedRect(-MAP.w / 2, -MAP.h / 2, MAP.w, MAP.h, MODAL.r)
        bg.fillStyle(C.sky, 1)
        bg.fillRoundedRect(-170, -MAP.h / 2 - 13, 340, 26, 13)

        const title = this.add.text(0, -MAP.h / 2 + 56, 'O caminho do sinal', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, -MAP.h / 2 + 100, 'Veja como o sinal mudou até chegar no brinquedo.', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '20px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)

        modal.add([bg, title, sub])

        const total = trace.length
        const spanW = total * MAP.nodeW + (total - 1) * MAP.gapX
        const startX = -spanW / 2 + MAP.nodeW / 2
        const rowY = -MAP.h / 2 + MAP.rowY + 60

        trace.forEach((entry: TraceEntry, i) => {
            const x = startX + i * (MAP.nodeW + MAP.gapX)
            const node = this.buildMapNode(entry, x, rowY)
            modal.add(node)
            node.setAlpha(0).setScale(0.7)
            this.tweens.add({
                targets: node,
                alpha: 1,
                scale: 1,
                duration: 320,
                delay: 260 + i * MAP.drawStep,
                ease: 'Back.easeOut',
            })

            if (i === 0) return
            const arrow = this.add.graphics()
            const ax = x - MAP.nodeW / 2 - MAP.gapX
            arrow.fillStyle(signalColor(entry.value), 1)
            arrow.fillRoundedRect(ax + 6, rowY - 5, MAP.gapX - 26, 10, 5)
            arrow.fillTriangle(ax + MAP.gapX - 22, rowY - 14, ax + MAP.gapX - 22, rowY + 14, ax + MAP.gapX - 2, rowY)
            arrow.setAlpha(0)
            modal.add(arrow)
            this.tweens.add({ targets: arrow, alpha: 1, duration: 240, delay: 120 + i * MAP.drawStep })
        })

        const final = trace[trace.length - 1]
        const verdict = this.add.text(0, MAP.h / 2 - 148, final.value
            ? `Resultado: VERDADEIRO. A ${this.rideName()} acendeu.`
            : `Resultado: FALSO. Faltou energia para a ${this.rideName()}.`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: hex(final.value ? C.onDark : C.offDark),
            align: 'center',
            wordWrap: { width: MAP.w - 120 },
        }).setOrigin(0.5).setResolution(2).setAlpha(0)

        this.tweens.add({ targets: verdict, alpha: 1, duration: 300, delay: 300 + total * MAP.drawStep })

        const btn = this.button(0, MAP.h / 2 - 66, MODAL.btnW, MODAL.btnH, 'Entendi', C.sky, () => {
            this.closeModalSafely(overlay, modal, onDone)
        }, '24px', true)
        btn.setAlpha(0)
        this.tweens.add({ targets: btn, alpha: 1, duration: 260, delay: 400 + total * MAP.drawStep })

        modal.add([verdict, btn])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
    }

    private buildMapNode(entry: TraceEntry, x: number, y: number) {
        const node = this.add.container(x, y)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-MAP.nodeW / 2 + 3, -MAP.nodeH / 2 + 8, MAP.nodeW, MAP.nodeH, 18)
        g.fillStyle(signalSoft(entry.value), 1)
        g.fillRoundedRect(-MAP.nodeW / 2, -MAP.nodeH / 2, MAP.nodeW, MAP.nodeH, 18)
        g.lineStyle(entry.missed ? 6 : 4, entry.missed ? C.gold : signalColor(entry.value), 1)
        g.strokeRoundedRect(-MAP.nodeW / 2, -MAP.nodeH / 2, MAP.nodeW, MAP.nodeH, 18)

        const label = this.add.text(0, -18, entry.operator ? OPERATOR_NAME[entry.operator] : shortText(entry.label, 26), {
            fontFamily: 'Arial Black, Arial',
            fontSize: entry.operator ? '26px' : MAP.fontSize,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MAP.nodeW - 22 },
        }).setOrigin(0.5).setResolution(2)

        const value = this.add.text(0, 26, signalWord(entry.value), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '19px',
            color: hex(entry.value ? C.onDark : C.offDark),
        }).setOrigin(0.5).setResolution(2)

        node.add([g, label, value])
        return node
    }

    private rideName() {
        const p = this.phase
        return p.attraction === 'poste' ? 'luz do poste'
            : p.attraction === 'roda' ? 'roda-gigante'
                : p.attraction === 'queda' ? 'queda-livre'
                    : p.attraction === 'montanha' ? 'montanha-russa' : 'carrossel'
    }

    private showFeedback(clean: boolean, lit: boolean, message: string, earned: number, onDone: () => void) {
        EventBus.emit('timer-stop')

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.night, A.overlay).setDepth(400).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(401)

        const body = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '24px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - MODAL.pad * 2 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + 320
        const top = -PH / 2
        const tone = lit ? C.on : C.sky
        const heading = lit ? 'Luz acesa!' : 'Resposta certa!'

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.24)
        bg.fillRoundedRect(-MODAL.w / 2 + 4, top + 12, MODAL.w, PH, MODAL.r)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.r)
        bg.lineStyle(5, tone, 1)
        bg.strokeRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.r)
        bg.fillStyle(tone, 1)
        bg.fillRoundedRect(-150, top - 13, 300, 26, 13)

        const markBg = this.add.graphics()
        markBg.fillStyle(tone, 1)
        markBg.fillCircle(0, top + 64, 38)
        markBg.fillStyle(C.white, A.gloss)
        markBg.fillEllipse(0, top + 52, 42, 17)

        const mark = this.add.graphics()
        mark.lineStyle(8, C.white, 1)
        mark.lineBetween(-15, top + 64, -4, top + 77)
        mark.lineBetween(-4, top + 77, 17, top + 49)

        const title = this.add.text(0, top + 132, heading, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '36px',
            color: hex(lit ? C.onDark : C.ink),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 176 + body.height / 2)

        const pointsText = this.add.text(0, top + 188 + body.height + 16, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.skyDeep),
        }).setOrigin(0.5).setResolution(2)

        let counterTween: Phaser.Tweens.Tween | undefined
        if (earned > 0) {
            const counter = { v: 0 }
            counterTween = this.tweens.add({
                targets: counter,
                v: earned,
                duration: 620,
                delay: 300,
                onUpdate: () => {
                    if (!pointsText.active) return
                    pointsText.setText(`+${Math.round(counter.v)} pontos${clean ? '' : ''}`)
                },
            })
        }

        const btn = this.button(0, PH / 2 - 62, MODAL.btnW, MODAL.btnH, 'Continuar', C.sky, () => {
            counterTween?.remove()
            pointsText.setText(earned > 0 ? `+${earned} pontos` : '')
            this.closeModalSafely(overlay, modal, onDone)
        }, '24px', true)

        modal.add([bg, markBg, mark, title, body, pointsText, btn])
        modal.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.night, A.overlay).setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '24px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - MODAL.pad * 2 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 320
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.24)
        bg.fillRoundedRect(-MODAL.w / 2 + 4, top + 12, MODAL.w, PH, MODAL.r)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.r)
        bg.lineStyle(5, C.gold, 1)
        bg.strokeRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.r)
        bg.fillStyle(C.sky, 1)
        bg.fillRoundedRect(-150, top - 13, 300, 26, 13)

        const badge = this.add.text(0, top + 58, `NÍVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.skyDeep),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 112, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '38px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - MODAL.pad * 2 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 170 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 62, MODAL.btnW, MODAL.btnH, 'Entrar no parque', C.sky, () => {
            this.closeModalSafely(overlay, panel, onStart)
        }, '24px', true)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
    }

    private toast(message: string, tone: number) {
        const container = this.add.container(W / 2, TOAST.y).setDepth(60)
        const t = this.add.text(0, 0, message, {
            fontFamily: 'Arial Black, Arial',
            fontSize: TOAST.fontSize,
            color: hex(C.night),
            align: 'center',
            wordWrap: { width: TOAST.w - 60 },
        }).setOrigin(0.5).setResolution(2)

        const w = Math.max(320, t.width + 56)
        const h = Math.max(TOAST.h, t.height + 30)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.26)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 12, -h / 2 + 7, w - 24, h * 0.3, h / 4)

        container.add([g, t])
        container.setAlpha(0).setScale(0.9)
        this.tweens.add({ targets: container, alpha: 1, scale: 1, y: TOAST.y - 14, duration: 260, ease: 'Back.easeOut' })
        this.time.delayedCall(TOAST.life, () => {
            this.tweens.add({
                targets: container,
                alpha: 0,
                y: container.y - 12,
                duration: 240,
                onComplete: () => container.destroy(),
            })
        })
    }

    // -------------------------------------------------------------- tutoriais

    private runTutorial() {
        if (this.phaseIdx !== 0) {
            this.helpBtn?.setVisible(true)
            this.startPhase()
            return
        }
        this.playTutorial(true, () => this.startPhase())
    }

    private replayTutorial() {
        const wasLocked = this.locked
        this.locked = true
        this.playTutorial(false, () => { this.locked = wasLocked })
    }

    private playTutorial(once: boolean, onDone: () => void) {
        createTutorial(this, {
            key: `circuito-l${this.level.level}`,
            once,
            accent: C.gold,
            safeTop: 96,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.helpBtn?.setVisible(true)
                onDone()
            },
        })
    }

    private tutorialSteps(): TutorialStep[] {
        const plateRect = { shape: 'rect' as const, x: PLATE.cx, y: PARK.cy, w: PLATE.w + 60, h: 340, balloonY: 560 }
        const dockRect = { shape: 'rect' as const, x: W / 2, y: DOCK.cy, w: 760, h: DOCK.btnH + 40, balloonY: 300 }
        const machRect = { shape: 'circle' as const, x: MACH.x, y: MACH.y, w: MACH.ringR * 2, h: MACH.ringR * 2, balloonY: 560 }
        const lampRect = { shape: 'rect' as const, x: LAMP.x, y: PARK.cy, w: 170, h: 340, balloonY: 560 }

        if (this.level.level === 1) {
            return [
                { text: 'Leia a frase da placa. Ela é verdadeira ou falsa?', ...plateRect },
                { text: 'Toque em VERDADEIRO ou FALSO. Segure para ver o sinal antes de soltar.', ...dockRect },
                { text: 'A lâmpada mostra o sinal que saiu da frase: verde ou vermelho.', ...lampRect },
                { text: 'A máquina NÃO troca o sinal: verde vira vermelho, vermelho vira verde.', ...machRect },
            ]
        }

        if (this.level.level === 2) {
            return [
                { text: 'Agora são duas frases, uma em cada trilho.', ...plateRect },
                { text: 'Responda uma de cada vez. Cada lâmpada guarda o sinal da sua frase.', ...lampRect },
                { text: 'A máquina junta os dois sinais. O E precisa dos dois verdes; o OU aceita só um.', ...machRect },
            ]
        }

        return [
            { text: 'O caminho ficou mais longo. Você resolve uma etapa de cada vez.', ...plateRect },
            { text: 'O painel diz qual etapa é agora. Guarde o sinal da etapa anterior.', shape: 'rect', x: PANEL.x + PANEL.w / 2, y: PANEL.y + PANEL.h / 2, w: PANEL.w + 20, h: PANEL.h + 20, balloonY: 240 },
            { text: 'No fim aparece o mapa do sinal, mostrando todo o caminho que você fez.', shape: 'none', balloonY: 320 },
        ]
    }

    // -------------------------------------------------------------- utilitários

    private emitCheckpoint() {
        let done = 0
        for (let i = 0; i < this.levelIdx; i++) done += LEVELS[i].phases.length
        done += this.phaseIdx
        const total = LEVELS.reduce((acc, l) => acc + l.phases.length, 0)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((done / total) * 100),
            score: this.points,
        })
    }

    private isInputBlocked() {
        return this.time.now < this.inputBlockedUntil
    }

    private blockInput(ms = 320) {
        this.inputBlockedUntil = Math.max(this.inputBlockedUntil, this.time.now + ms)

        if (!this.inputBlocker?.active) {
            this.inputBlocker = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.001)
                .setDepth(9999)
                .setInteractive()
            this.inputBlocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => event.stopPropagation())
            this.inputBlocker.on('pointerup', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => event.stopPropagation())
        }

        this.unblockTimer?.remove()
        this.unblockTimer = this.time.delayedCall(ms + 40, () => {
            this.unblockTimer = undefined
            this.inputBlockedUntil = 0
            this.inputBlocker?.destroy()
            this.inputBlocker = undefined
        })
    }

    private closeModalSafely(
        overlay: Phaser.GameObjects.Rectangle,
        modal: Phaser.GameObjects.Container,
        onClosed?: () => void,
    ) {
        this.blockInput()
        overlay.disableInteractive()
        modal.each((child: Phaser.GameObjects.GameObject) => {
            if ('disableInteractive' in child) (child as Phaser.GameObjects.Container).disableInteractive()
        })

        this.tweens.add({ targets: modal, alpha: 0, scale: 0.94, duration: 180, ease: 'Sine.easeIn' })
        this.tweens.add({ targets: overlay, alpha: 0, duration: 180 })
        this.time.delayedCall(190, () => {
            overlay.destroy()
            modal.destroy()
            onClosed?.()
        })
    }

    private button(
        x: number,
        y: number,
        w: number,
        h: number,
        label: string,
        color: number,
        onClick: () => void,
        fontSize = '20px',
        ignoreLock = false,
    ) {
        const btn = this.add.container(x, y)
        const g = this.add.graphics()

        const paint = (c: number) => {
            g.clear()
            g.fillStyle(C.shadow, 0.24)
            g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
            g.fillStyle(c, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, h * 0.32, h / 4)
        }
        paint(color)

        const t = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 26 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.03, duration: 120 }))
        btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1, duration: 120 }))
        btn.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            if (this.isInputBlocked() || (!ignoreLock && this.locked)) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            onClick()
        })

        return btn
    }
}