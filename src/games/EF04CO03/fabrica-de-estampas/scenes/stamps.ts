import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PAD_OF, STAMP_OF, STAMP_SHEET } from '../data/files'
import { DEPTH, STAMPS } from '../data/layout'
import { C } from '../data/theme'
import type { Fig } from '../types'
import { fit, fitHeight } from './art'
import type { Rect } from './guide'

type Point = { x: number; y: number }

export const FIGS: Fig[] = ['flower', 'star', 'heart']

export interface Stamps {
    onPick(fn: (fig: Fig) => void): void
    setEnabled(on: boolean): void
    /** o carimbo molha na almofada, voa até `to`, bate (`onHit`) e volta */
    strike(fig: Fig, to: Point, onHit: () => void, onInk?: () => void): Promise<void>
    /** o anel da demonstração, antes de o próprio jogo usar o carimbo */
    ring(fig: Fig): Promise<void>
    hide(): Promise<void>
    show(): Promise<void>
    rect(): Rect
    destroy(): void
}

const SLOP = 24

export function createStamps(scene: Phaser.Scene): Stamps {
    const pads = FIGS.map((fig, i) => fit(scene, STAMP_SHEET, PAD_OF[fig], STAMPS.padW).setPosition(STAMPS.xs[i], STAMPS.padY).setDepth(DEPTH.stamps))
    const stamps = FIGS.map((fig, i) =>
        fitHeight(scene, STAMP_SHEET, STAMP_OF[fig], STAMPS.h).setPosition(STAMPS.xs[i], STAMPS.y).setDepth(DEPTH.stamps + 1),
    )
    const bases = stamps.map(s => s.scale)
    let enabled = false
    let shown = true
    let flying = false
    let picked: ((fig: Fig) => void) | undefined
    let downOn = -1

    const zones = FIGS.map((_, i) => {
        const zone = scene.add
            .zone(STAMPS.xs[i], STAMPS.hitY, STAMPS.hitW, STAMPS.hitH)
            .setDepth(DEPTH.stamps + 2)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            downOn = i
        })
        zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const was = downOn
            downOn = -1
            if (!enabled || flying || !shown || was !== i || pointer.getDistance() > SLOP) return
            picked?.(FIGS[i])
        })
        zone.on('pointerover', () => {
            if (!enabled || flying || !shown || pointer(scene).wasTouch) return
            scene.tweens.killTweensOf(stamps[i])
            void FX.to(scene, stamps[i], { y: STAMPS.y - 8 }, { duration: 120 })
        })
        zone.on('pointerout', () => {
            downOn = -1
            if (!enabled || flying || !shown || stamps[i].y >= STAMPS.y) return
            scene.tweens.killTweensOf(stamps[i])
            void FX.to(scene, stamps[i], { y: STAMPS.y }, { duration: 120 })
        })
        if (zone.input) zone.input.enabled = false
        return zone
    })

    const settle = () => stamps.forEach((s, i) => s.setPosition(STAMPS.xs[i], STAMPS.y).setScale(bases[i]).setRotation(0))

    return {
        onPick(fn) {
            picked = fn
        },
        setEnabled(on) {
            enabled = on
            zones.forEach(z => {
                if (z.input) z.input.enabled = on
            })
            if (on || flying || !shown) return
            downOn = -1
            stamps.forEach(s => {
                if (s.y >= STAMPS.y) return
                scene.tweens.killTweensOf(s)
                s.setY(STAMPS.y)
            })
        },
        async strike(fig, to, onHit, onInk) {
            const i = FIGS.indexOf(fig)
            const s = stamps[i]
            const base = bases[i]
            flying = true
            scene.tweens.killTweensOf(s)
            s.setPosition(STAMPS.xs[i], STAMPS.y).setDepth(DEPTH.flying)
            await FX.to(scene, s, { y: STAMPS.y + 16 }, { duration: 80, ease: 'Sine.easeIn' })
            onInk?.()
            const from = { x: s.x, y: s.y }
            const run = { p: 0 }
            const arc = (a: Point, b: Point, lift: number, ms: number, scaleTo: number) =>
                new Promise<void>(resolve => {
                    const s0 = s.scale
                    run.p = 0
                    scene.tweens.add({
                        targets: run,
                        p: 1,
                        duration: FX.ms(scene, ms),
                        ease: 'Sine.easeInOut',
                        onUpdate: () => {
                            s.setPosition(Phaser.Math.Linear(a.x, b.x, run.p), Phaser.Math.Linear(a.y, b.y, run.p) - Math.sin(run.p * Math.PI) * lift)
                            s.setScale(Phaser.Math.Linear(s0, scaleTo, run.p))
                        },
                        onComplete: () => resolve(),
                        onStop: () => resolve(),
                    })
                })
            const above = { x: to.x, y: to.y - 34 }
            await arc(from, above, 90, 280, base * 0.82)
            await FX.to(scene, s, { y: to.y, scaleY: base * 0.82 * 0.86 }, { duration: 80, ease: 'Sine.easeIn' })
            onHit()
            await FX.to(scene, s, { y: above.y, scaleY: base * 0.82 }, { duration: 120, ease: 'Sine.easeOut' })
            await arc({ x: s.x, y: s.y }, { x: STAMPS.xs[i], y: STAMPS.y }, 70, 240, base)
            s.setDepth(DEPTH.stamps + 1)
            settle()
            flying = false
        },
        async ring(fig) {
            const i = FIGS.indexOf(fig)
            void FX.ping(scene, STAMPS.xs[i], STAMPS.y + 10, C.glow, { radius: 110, duration: 560, depth: DEPTH.fx })
            await FX.press(scene, stamps[i], 0.94)
            await FX.wait(scene, 300)
        },
        async hide() {
            if (!shown) return
            shown = false
            stamps.forEach(s => scene.tweens.killTweensOf(s))
            await FX.all(
                ...pads.map((p, k) => FX.to(scene, p, { y: STAMPS.padY + STAMPS.hideDy }, { duration: 300, delay: k * 40, ease: 'Back.easeIn' })),
                ...stamps.map((s, k) => FX.to(scene, s, { y: STAMPS.y + STAMPS.hideDy }, { duration: 300, delay: k * 40, ease: 'Back.easeIn' })),
            )
        },
        async show() {
            if (shown) return
            shown = true
            await FX.all(
                ...pads.map((p, k) => FX.to(scene, p, { y: STAMPS.padY }, { duration: 380, delay: k * 50, ease: 'Back.easeOut' })),
                ...stamps.map((s, k) => FX.to(scene, s, { y: STAMPS.y }, { duration: 380, delay: k * 50, ease: 'Back.easeOut' })),
            )
        },
        rect() {
            const w = STAMPS.xs[2] - STAMPS.xs[0] + STAMPS.hitW + 10
            return { x: STAMPS.xs[1], y: STAMPS.hitY, w, h: STAMPS.hitH }
        },
        destroy() {
            zones.forEach(z => z.destroy())
            pads.forEach(p => p.destroy())
            stamps.forEach(s => s.destroy())
        },
    }
}

const pointer = (scene: Phaser.Scene) => scene.input.activePointer
