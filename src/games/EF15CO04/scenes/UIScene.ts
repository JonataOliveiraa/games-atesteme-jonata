import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { C, A } from '../data/theme'
import { W, H } from '../data/layout'

const BAR_W = 300
const BAR_H = 26
const BAR_X = W / 2 - BAR_W / 2
const BAR_Y = 18

interface SparkOptions {
    x?: number
    y?: number
    count?: number
    color?: number
    spread?: number
}

interface PaperOptions {
    x?: number
    y?: number
    count?: number
    spread?: number
}

export class UIScene extends Phaser.Scene {
    private ready = false
    private track!: Phaser.GameObjects.Graphics
    private bar!: Phaser.GameObjects.Graphics
    private flash!: Phaser.GameObjects.Graphics
    private wipe!: Phaser.GameObjects.Graphics
    private tween?: Phaser.Tweens.Tween
    private state = { p: 1 }

    constructor() {
        super({ key: 'UIScene' })
    }

    create() {
        this.track = this.add.graphics().setDepth(10)
        this.bar = this.add.graphics().setDepth(11)
        this.flash = this.add.graphics().setDepth(940)
        this.wipe = this.add.graphics().setDepth(950)

        EventBus.on('timer-start', this.startTimer, this)
        EventBus.on('timer-stop', this.stopTimer, this)
        EventBus.on('curtain', this.playWipe, this)
        EventBus.on('stage-flash', this.playFlash, this)
        EventBus.on('sparks', this.playSparks, this)
        EventBus.on('paper-dust', this.playPaperDust, this)

        this.ready = true

        this.events.once('shutdown', () => {
            this.ready = false
            this.stopTimer()
            EventBus.off('timer-start', this.startTimer, this)
            EventBus.off('timer-stop', this.stopTimer, this)
            EventBus.off('curtain', this.playWipe, this)
            EventBus.off('stage-flash', this.playFlash, this)
            EventBus.off('sparks', this.playSparks, this)
            EventBus.off('paper-dust', this.playPaperDust, this)
        })
    }

    update() {
        if (this.tween) this.draw(this.state.p)
    }

    private startTimer = (seconds: number) => {
        this.stopTimer()
        this.state.p = 1

        this.track.clear()
        this.track.fillStyle(C.nightDeep, 0.92)
        this.track.fillRoundedRect(BAR_X, BAR_Y, BAR_W, BAR_H, BAR_H / 2)
        this.track.lineStyle(3, C.amber, 1)
        this.track.strokeRoundedRect(BAR_X, BAR_Y, BAR_W, BAR_H, BAR_H / 2)
        this.draw(1)

        this.tween = this.tweens.add({
            targets: this.state,
            p: 0,
            duration: seconds * 1000,
            ease: 'Linear',
            onComplete: () => {
                this.draw(0)
                this.tween = undefined
                EventBus.emit('timer-end')
            },
        })
    }

    private alive() {
        return this.ready && !!this.scene && !!this.sys && this.sys.isActive()
    }

    private stopTimer = () => {
        this.tween?.stop()
        this.tween = undefined
        this.track.clear()
        this.bar.clear()
    }

    private draw(p: number) {
        const clamped = Phaser.Math.Clamp(p, 0, 1)
        const w = (BAR_W - 12) * clamped
        const color = clamped > 0.5 ? C.teal : clamped > 0.25 ? C.amber : C.coral

        this.bar.clear()
        if (w <= 0) return
        this.bar.fillStyle(color, 1)
        this.bar.fillRoundedRect(BAR_X + 6, BAR_Y + 6, w, BAR_H - 12, (BAR_H - 12) / 2)
        this.bar.fillStyle(C.paper, A.gloss)
        this.bar.fillRoundedRect(BAR_X + 9, BAR_Y + 9, Math.max(6, w - 6), 4, 2)
    }

    private playWipe = (onMid?: () => void) => {
        const state = { v: 0 }
        this.tweens.add({
            targets: state,
            v: 1,
            duration: 300,
            ease: 'Sine.easeIn',
            onUpdate: () => this.paintWipe(state.v),
            onComplete: () => {
                onMid?.()
                this.tweens.add({
                    targets: state,
                    v: 0,
                    duration: 340,
                    delay: 90,
                    ease: 'Sine.easeOut',
                    onUpdate: () => this.paintWipe(state.v),
                    onComplete: () => this.wipe.clear(),
                })
            },
        })
    }

    private paintWipe(v: number) {
        const h = (H / 2) * v
        this.wipe.clear()
        if (h <= 0) return

        this.wipe.fillStyle(C.night, 1)
        this.wipe.fillRect(0, 0, W, h)
        this.wipe.fillRect(0, H - h, W, h)

        this.wipe.fillStyle(C.paperEdge, 0.5)
        this.wipe.fillRect(0, h - 10, W, 10)
        this.wipe.fillRect(0, H - h, W, 10)

        this.wipe.fillStyle(C.amber, 0.85)
        for (let x = 46; x < W; x += 92) {
            this.wipe.fillCircle(x, h - 5, 6)
            this.wipe.fillCircle(x + 46, H - h + 5, 6)
        }
    }

    private playFlash = (color?: number) => {
        if (!this.alive()) return
        const tone = typeof color === 'number' ? color : C.paper
        const state = { v: 0.46 }
        this.tweens.add({
            targets: state,
            v: 0,
            duration: 480,
            ease: 'Sine.easeOut',
            onUpdate: () => {
                this.flash.clear()
                this.flash.fillStyle(tone, state.v * 0.5)
                this.flash.fillRect(0, 0, W, H)
            },
            onComplete: () => this.flash.clear(),
        })
    }

    private playSparks = (options: SparkOptions = {}) => {
        if (!this.alive()) return
        const x = options.x ?? W / 2
        const y = options.y ?? H / 2
        const count = options.count ?? 22
        const spread = options.spread ?? 200
        const tone = options.color ?? C.amber

        for (let i = 0; i < count; i++) {
            const size = Phaser.Math.Between(8, 15)
            const shape = i % 3
            const piece = this.add.graphics().setDepth(960)
            piece.fillStyle(i % 2 ? tone : C.paper, 1)

            if (shape === 0) piece.fillRoundedRect(-size / 2, -size / 2, size, size, 3)
            else if (shape === 1) piece.fillCircle(0, 0, size / 2)
            else piece.fillTriangle(0, -size / 2, size / 2, size / 2, -size / 2, size / 2)

            piece.setPosition(x, y)

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
            const dist = Phaser.Math.FloatBetween(spread * 0.35, spread)

            this.tweens.add({
                targets: piece,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist + Phaser.Math.Between(50, 140),
                angle: Phaser.Math.Between(-330, 330),
                alpha: 0,
                scale: 0.35,
                duration: Phaser.Math.Between(640, 980),
                ease: 'Cubic.easeOut',
                onComplete: () => piece.destroy(),
            })
        }
    }

    private playPaperDust = (options: PaperOptions = {}) => {
        if (!this.alive()) return
        const x = options.x ?? W / 2
        const y = options.y ?? H / 2
        const count = options.count ?? 20
        const spread = options.spread ?? 150

        for (let i = 0; i < count; i++) {
            const w = Phaser.Math.Between(9, 22)
            const h = Phaser.Math.Between(5, 12)
            const piece = this.add.graphics().setDepth(958)
            piece.fillStyle(i % 3 === 0 ? C.paperEdge : C.paper, 1)
            piece.fillRoundedRect(-w / 2, -h / 2, w, h, 2)
            piece.setPosition(x + Phaser.Math.Between(-40, 40), y + Phaser.Math.Between(-24, 24))

            const dir = Phaser.Math.FloatBetween(-1, 1)

            this.tweens.add({
                targets: piece,
                x: piece.x + dir * Phaser.Math.FloatBetween(spread * 0.3, spread),
                y: piece.y + Phaser.Math.Between(120, 260),
                angle: Phaser.Math.Between(-220, 220),
                alpha: 0,
                duration: Phaser.Math.Between(760, 1180),
                ease: 'Quad.easeIn',
                onComplete: () => piece.destroy(),
            })
        }
    }
}