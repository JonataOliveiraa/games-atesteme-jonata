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

export class UIScene extends Phaser.Scene {
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
        EventBus.on('park-flash', this.playFlash, this)
        EventBus.on('sparks', this.playSparks, this)

        this.events.once('shutdown', () => {
            this.stopTimer()
            EventBus.off('timer-start', this.startTimer, this)
            EventBus.off('timer-stop', this.stopTimer, this)
            EventBus.off('curtain', this.playWipe, this)
            EventBus.off('park-flash', this.playFlash, this)
            EventBus.off('sparks', this.playSparks, this)
        })
    }

    update() {
        if (this.tween) this.draw(this.state.p)
    }

    private startTimer = (seconds: number) => {
        this.stopTimer()
        this.state.p = 1

        this.track.clear()
        this.track.fillStyle(C.night, 0.9)
        this.track.fillRoundedRect(BAR_X, BAR_Y, BAR_W, BAR_H, BAR_H / 2)
        this.track.lineStyle(3, C.gold, 1)
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

    private stopTimer = () => {
        this.tween?.stop()
        this.tween = undefined
        this.track.clear()
        this.bar.clear()
    }

    private draw(p: number) {
        const clamped = Phaser.Math.Clamp(p, 0, 1)
        const w = (BAR_W - 12) * clamped
        const color = clamped > 0.5 ? C.sky : clamped > 0.25 ? C.gold : C.off

        this.bar.clear()
        if (w <= 0) return
        this.bar.fillStyle(color, 1)
        this.bar.fillRoundedRect(BAR_X + 6, BAR_Y + 6, w, BAR_H - 12, (BAR_H - 12) / 2)
        this.bar.fillStyle(C.cream, A.gloss)
        this.bar.fillRoundedRect(BAR_X + 9, BAR_Y + 9, Math.max(6, w - 6), 4, 2)
    }

    private playWipe = (onMid?: () => void) => {
        const state = { v: 0 }
        this.tweens.add({
            targets: state,
            v: 1,
            duration: 280,
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
        const half = (W / 2) * v
        this.wipe.clear()
        this.wipe.fillStyle(C.night, 1)
        this.wipe.fillRect(0, 0, half, H)
        this.wipe.fillRect(W - half, 0, half, H)
        if (half <= 0) return
        this.wipe.fillStyle(C.sky, 0.5)
        this.wipe.fillRect(half - 12, 0, 12, H)
        this.wipe.fillRect(W - half, 0, 12, H)
        this.wipe.fillStyle(C.cream, 0.4)
        this.wipe.fillRect(half - 5, 0, 5, H)
        this.wipe.fillRect(W - half + 7, 0, 5, H)
        for (let y = 40; y < H; y += 96) {
            this.wipe.fillStyle(C.gold, 0.8)
            this.wipe.fillCircle(half - 6, y, 7)
            this.wipe.fillCircle(W - half + 6, y, 7)
        }
    }

    private playFlash = (color?: number) => {
        const tone = typeof color === 'number' ? color : C.cream
        const state = { v: 0.5 }
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
        const x = options.x ?? W / 2
        const y = options.y ?? H / 2
        const count = options.count ?? 26
        const spread = options.spread ?? 220
        const tone = options.color ?? C.gold

        for (let i = 0; i < count; i++) {
            const size = Phaser.Math.Between(7, 15)
            const shape = i % 3
            const piece = this.add.graphics().setDepth(960)
            piece.fillStyle(i % 2 ? tone : C.cream, 1)

            if (shape === 0) piece.fillCircle(0, 0, size / 2)
            else if (shape === 1) piece.fillRoundedRect(-size / 2, -size / 2, size, size, 3)
            else piece.fillTriangle(0, -size / 2, size / 2, size / 2, -size / 2, size / 2)

            piece.setPosition(x, y)

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
            const dist = Phaser.Math.FloatBetween(spread * 0.35, spread)

            this.tweens.add({
                targets: piece,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist + Phaser.Math.Between(50, 140),
                angle: Phaser.Math.Between(-340, 340),
                alpha: 0,
                scale: 0.35,
                duration: Phaser.Math.Between(640, 980),
                ease: 'Cubic.easeOut',
                onComplete: () => piece.destroy(),
            })
        }
    }
}