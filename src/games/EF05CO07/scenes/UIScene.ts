import Phaser from 'phaser'

import { EventBus } from '../../../shared/EventBus'
import { HUD, cy } from '../data/layout'
import {
    ALPHA,
    C,
    CSS,
    FONT,
    FONT_WEIGHT,
    MOTION,
    RADIUS,
    STROKE,
} from '../data/theme'
import type { MissionUpdatePayload } from '../types'

const HUD_DEPTH = 100
const DEFAULT_STABILITY = 5
const TIMER_WARNING_SECONDS = 15
const TIMER_CRITICAL_SECONDS = 5

export class UIScene extends Phaser.Scene {
    private levelText!: Phaser.GameObjects.Text
    private scoreText!: Phaser.GameObjects.Text
    private instructionText!: Phaser.GameObjects.Text
    private stabilityLabel!: Phaser.GameObjects.Text
    private stabilityGraphics!: Phaser.GameObjects.Graphics
    private timerContainer!: Phaser.GameObjects.Container
    private timerGraphics!: Phaser.GameObjects.Graphics
    private timerText!: Phaser.GameObjects.Text
    private helpButton!: Phaser.GameObjects.Container

    private stability = DEFAULT_STABILITY
    private maxStability = DEFAULT_STABILITY
    private timerDurationMs = 0
    private timerRemainingMs = 0
    private timerRunning = false
    private timerExpired = false

    constructor() {
        super({ key: 'UIScene' })
    }

    create(): void {
        this.buildHud()
        this.animateHudEntrance()
        this.registerListeners()

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this)
    }

    update(_time: number, delta: number): void {
        if (!this.timerRunning) return

        this.timerRemainingMs = Math.max(0, this.timerRemainingMs - delta)
        this.paintTimer()

        if (this.timerRemainingMs > 0 || this.timerExpired) return

        this.timerExpired = true
        this.timerRunning = false
        EventBus.emit('timer-end')
    }

    private buildHud(): void {
        const panel = this.add.graphics().setDepth(HUD_DEPTH)
        panel.fillStyle(C.shadow, ALPHA.shadow)
        panel.fillRoundedRect(HUD.x, HUD.y + 7, HUD.w, HUD.h, RADIUS.card)
        panel.lineStyle(STROKE.glow, C.cyan, ALPHA.glow + 0.04)
        panel.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, RADIUS.card)
        panel.fillStyle(C.panelDeep, 0.96)
        panel.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, RADIUS.card)
        panel.lineStyle(2, C.cyanDeep, 0.86)
        panel.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, RADIUS.card)
        panel.lineStyle(1, C.borderSoft, 1)
        panel.strokeRoundedRect(HUD.x + 5, HUD.y + 5, HUD.w - 10, HUD.h - 10, RADIUS.card - 3)
        panel.fillStyle(C.cyan, 0.62)
        panel.fillRect(HUD.x + 70, HUD.y, 82, 3)
        panel.fillStyle(C.violet, 0.68)
        panel.fillRect(HUD.x + HUD.w - 286, HUD.y + HUD.h - 3, 92, 3)

        this.add.image(HUD.x + 34, cy(HUD), 'icone-app')
            .setDisplaySize(50, 50)
            .setDepth(HUD_DEPTH + 1)

        this.levelText = this.add.text(HUD.x + 70, HUD.y + 22, 'Nível 1 · Fase 1/4', {
            fontFamily: FONT.title,
            fontSize: '18px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
        }).setOrigin(0, 0.5).setDepth(HUD_DEPTH + 1).setResolution(2)

        this.scoreText = this.add.text(HUD.x + 70, HUD.y + 51, '0 pontos', {
            fontFamily: FONT.body,
            fontSize: '16px',
            fontStyle: FONT_WEIGHT.semibold,
            color: CSS.cyanDeep,
        }).setOrigin(0, 0.5).setDepth(HUD_DEPTH + 1).setResolution(2)

        this.instructionText = this.add.text(585, cy(HUD), 'Aguardando a missão...', {
            fontFamily: FONT.body,
            fontSize: '20px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
            align: 'center',
            fixedWidth: 520,
        }).setOrigin(0.5).setDepth(HUD_DEPTH + 1).setResolution(2)

        this.stabilityLabel = this.add.text(866, HUD.y + 22, 'Estabilidade', {
            fontFamily: FONT.body,
            fontSize: '16px',
            fontStyle: FONT_WEIGHT.semibold,
            color: CSS.textMuted,
        }).setOrigin(0, 0.5).setDepth(HUD_DEPTH + 1).setResolution(2)

        this.stabilityGraphics = this.add.graphics().setDepth(HUD_DEPTH + 1)
        this.paintStability()

        this.buildTimer()
        this.helpButton = this.buildHelpButton()
    }

    private buildTimer(): void {
        this.timerContainer = this.add.container(0, 0)
            .setDepth(HUD_DEPTH + 1)
            .setVisible(false)

        this.timerGraphics = this.add.graphics()
        this.timerText = this.add.text(1138, cy(HUD) - 2, '00:00', {
            fontFamily: FONT.body,
            fontSize: '19px',
            fontStyle: FONT_WEIGHT.bold,
            color: CSS.text,
        }).setOrigin(0.5).setResolution(2)

        this.timerContainer.add([this.timerGraphics, this.timerText])
    }

    private buildHelpButton(): Phaser.GameObjects.Container {
        const x = 1218
        const y = cy(HUD)
        const size = 48
        const graphics = this.add.graphics()
        const label = this.add.text(x, y - 1, '?', {
            fontFamily: FONT.title,
            fontSize: '24px',
            fontStyle: FONT_WEIGHT.extraBold,
            color: CSS.text,
        }).setOrigin(0.5).setResolution(2)
        const zone = this.add.zone(x, y, size, size)
            .setInteractive({ useHandCursor: true })

        const paint = (hovered = false): void => {
            graphics.clear()
            if (hovered) {
                graphics.lineStyle(STROKE.glow, C.cyan, ALPHA.glow + 0.06)
                graphics.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 7)
            }
            graphics.fillStyle(hovered ? C.elevated : C.surface, 1)
            graphics.fillRoundedRect(x - size / 2, y - size / 2, size, size, 10)
            graphics.fillStyle(C.text, hovered ? 0.16 : 0.09)
            graphics.fillRoundedRect(x - size / 2 + 6, y - size / 2 + 5, size - 12, 15, 7)
            graphics.lineStyle(hovered ? 3 : 2, hovered ? C.cyan : C.border, hovered ? 1 : 0.82)
            graphics.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 10)
            graphics.fillStyle(C.cyan, hovered ? 0.9 : 0.52)
            graphics.fillRect(x - size / 2 + 6, y - size / 2 + 7, 3, size - 14)
        }

        paint()
        zone.on('pointerover', () => paint(true))
        zone.on('pointerout', () => paint())
        zone.on('pointerdown', () => {
            this.tweens.add({
                targets: label,
                scale: 0.86,
                duration: MOTION.tapDown,
                yoyo: true,
            })
            EventBus.emit('show-tutorial')
        })

        return this.add.container(0, 0, [graphics, label, zone])
            .setDepth(HUD_DEPTH + 2)
            .setVisible(false)
    }

    private registerListeners(): void {
        EventBus.on('mission-update', this.onMissionUpdate, this)
        EventBus.on('timer-start', this.onTimerStart, this)
        EventBus.on('timer-stop', this.stopTimer, this)
        EventBus.on('timer-pause', this.pauseTimer, this)
        EventBus.on('timer-resume', this.resumeTimer, this)
        EventBus.on('tutorial-ready', this.showHelpButton, this)
    }

    private onMissionUpdate(data: MissionUpdatePayload): void {
        if (!this.scene.isActive() || !this.levelText?.active) return

        const currentPhase = Phaser.Math.Clamp(data.phase + 1, 1, data.totalPhases)
        this.levelText.setText(
            `Nível ${data.level} · Fase ${currentPhase}/${data.totalPhases}`,
        )
        this.scoreText.setText(`${data.score} ${data.score === 1 ? 'ponto' : 'pontos'}`)
        this.instructionText.setText(this.fitInstruction(data.instruction))

        this.maxStability = Math.max(1, data.maxStability)
        this.stability = Phaser.Math.Clamp(data.stability, 0, this.maxStability)
        this.paintStability()

        if (data.timeLimit === undefined) this.stopTimer()
    }

    private paintStability(): void {
        if (!this.stabilityGraphics) return

        const graphics = this.stabilityGraphics
        const dotCount = Math.min(8, Math.max(1, this.maxStability))
        const gap = 22
        const startX = 872
        const y = HUD.y + 52
        const ratio = this.stability / this.maxStability
        const activeColor = ratio <= 0.4
            ? C.red
            : ratio <= 0.6
                ? C.yellow
                : C.green

        graphics.clear()

        for (let index = 0; index < dotCount; index += 1) {
            const x = startX + index * gap
            const filled = index < this.stability

            graphics.fillStyle(C.background, 1)
            graphics.fillCircle(x, y, 7)
            if (filled) {
                graphics.lineStyle(6, activeColor, ALPHA.glow + 0.04)
                graphics.strokeCircle(x, y, 7)
            }
            graphics.lineStyle(2, filled ? activeColor : C.border, 1)
            graphics.strokeCircle(x, y, 7)

            if (filled) {
                graphics.fillStyle(activeColor, 1)
                graphics.fillCircle(x, y, 4)
            }
        }

        this.stabilityLabel.setText(`Estabilidade ${this.stability}/${this.maxStability}`)
    }

    private onTimerStart(seconds: number): void {
        const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0)
        this.timerDurationMs = safeSeconds * 1000
        this.timerRemainingMs = this.timerDurationMs
        this.timerExpired = false
        this.timerRunning = safeSeconds > 0
        this.timerContainer.setVisible(true)
        this.paintTimer()

        if (safeSeconds === 0) {
            this.timerExpired = true
            EventBus.emit('timer-end')
        }
    }

    private pauseTimer(): void {
        this.timerRunning = false
    }

    private resumeTimer(): void {
        if (this.timerRemainingMs <= 0 || this.timerExpired) return
        this.timerRunning = true
    }

    private stopTimer(): void {
        this.timerRunning = false
        this.timerExpired = false
        this.timerDurationMs = 0
        this.timerRemainingMs = 0
        this.timerContainer?.setVisible(false)
        this.timerGraphics?.clear()
    }

    private paintTimer(): void {
        if (!this.timerGraphics || !this.timerText) return

        const seconds = Math.ceil(this.timerRemainingMs / 1000)
        const progress = this.timerDurationMs > 0
            ? Phaser.Math.Clamp(this.timerRemainingMs / this.timerDurationMs, 0, 1)
            : 0
        const color = seconds <= TIMER_CRITICAL_SECONDS
            ? C.red
            : seconds <= TIMER_WARNING_SECONDS
                ? C.yellow
                : C.cyanDeep
        const x = 1080
        const y = HUD.y + 17
        const width = 112
        const height = 38

        this.timerGraphics.clear()
        this.timerGraphics.lineStyle(STROKE.glow, color, ALPHA.glow)
        this.timerGraphics.strokeRoundedRect(x, y, width, height, 7)
        this.timerGraphics.fillStyle(C.surface, 1)
        this.timerGraphics.fillRoundedRect(x, y, width, height, 12)
        this.timerGraphics.lineStyle(2, color, 1)
        this.timerGraphics.strokeRoundedRect(x, y, width, height, 12)
        this.timerGraphics.fillStyle(color, 0.95)
        this.timerGraphics.fillRoundedRect(x + 5, y + height - 7, (width - 10) * progress, 3, 2)

        this.timerText
            .setText(this.formatTime(seconds))
            .setColor(this.numberToCss(color))
    }

    private showHelpButton(): void {
        if (this.helpButton.visible) return

        this.helpButton.setVisible(true).setAlpha(0)
        this.tweens.add({
            targets: this.helpButton,
            alpha: 1,
            duration: MOTION.cardTransition,
        })
    }

    private animateHudEntrance(): void {
        const targets = this.children.list.filter((object) => {
            if (object instanceof Phaser.GameObjects.Zone) return false
            const depth = 'depth' in object
                ? Number((object as Phaser.GameObjects.GameObject & { depth: number }).depth)
                : -1
            return depth >= HUD_DEPTH
        }) as Array<Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Alpha>

        targets.forEach((target, index) => {
            const startY = target.y
            target.setAlpha(0)
            target.y = startY - 12
            this.tweens.add({
                targets: target,
                alpha: 1,
                y: startY,
                duration: MOTION.entrance,
                delay: 40 + index * 45,
                ease: 'Cubic.easeOut',
            })
        })
    }

    private fitInstruction(value: string): string {
        const text = value.trim()
        if (text.length <= 72) return text
        return `${text.slice(0, 69).trimEnd()}...`
    }

    private formatTime(totalSeconds: number): string {
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    private numberToCss(color: number): string {
        return `#${color.toString(16).padStart(6, '0')}`
    }

    private cleanup(): void {
        EventBus.off('mission-update', this.onMissionUpdate, this)
        EventBus.off('timer-start', this.onTimerStart, this)
        EventBus.off('timer-stop', this.stopTimer, this)
        EventBus.off('timer-pause', this.pauseTimer, this)
        EventBus.off('timer-resume', this.resumeTimer, this)
        EventBus.off('tutorial-ready', this.showHelpButton, this)

        this.timerRunning = false
    }
}
