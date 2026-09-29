import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ARRIVAL, DEPTH, focusOf, H, VOICE, W } from '../data/layout'
import { C } from '../data/theme'
import type { Point, SceneId } from '../types'
import type { Balloon } from './balloon'
import type { Card } from './card'
import type { RecipientWindow } from './window'

export const PEEK_EVENT = 'balao-do-recado:peek'

export interface Arrival {
    showDestination(scene: SceneId): Promise<void>
    focus(): Promise<void>
    voiceRange(): Promise<void>
    hideRange(): void
    destroy(): void
}

export function createArrival(
    scene: Phaser.Scene,
    deps: { balloon: Balloon; window: RecipientWindow; card: Card },
): Arrival {
    const cam = scene.cameras.main
    const lines = new Set<Phaser.GameObjects.Graphics>()
    let dead = false

    const moveCamera = (x: number, y: number, zoom: number, ms: number) => {
        cam.setBounds(0, 0, W, H)
        cam.pan(x, y, FX.ms(scene, ms), 'Sine.easeInOut', true)
        cam.zoomTo(zoom, FX.ms(scene, ms), 'Sine.easeInOut', true)
        return FX.wait(scene, ms + 40)
    }

    const ring = scene.add.graphics().setDepth(DEPTH.window + 2).setVisible(false)
    const ripples = new Set<Phaser.GameObjects.Graphics>()
    const reach = { r: 0 }

    const paintRing = (center: Point) => {
        ring.clear()
        if (reach.r < 4) return
        ring.fillStyle(C.white, 0.14)
        ring.fillCircle(center.x, center.y, reach.r)
        const steps = Math.max(24, Math.round((Math.PI * 2 * reach.r) / (VOICE.dash * 2)))
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * Math.PI * 2
            const b = a + Math.PI / steps
            for (const [width, color] of [
                [10, C.white],
                [5, C.coral],
            ] as const) {
                ring.lineStyle(width, color, 1)
                ring.beginPath()
                ring.arc(center.x, center.y, reach.r, a, b)
                ring.strokePath()
            }
        }
    }

    const ripple = (center: Point, delay: number) => {
        const g = scene.add.graphics().setDepth(DEPTH.window + 2)
        ripples.add(g)
        const wave = { r: 20, a: 1 }
        scene.tweens.add({
            targets: wave,
            r: VOICE.radius,
            a: 0.25,
            delay: FX.ms(scene, delay),
            duration: FX.ms(scene, VOICE.growMs),
            ease: 'Sine.easeOut',
            onUpdate: () => {
                if (!g.active) return
                g.clear()
                g.lineStyle(6, C.coral, wave.a)
                g.beginPath()
                g.arc(center.x, center.y, wave.r, -0.9, 0.9)
                g.strokePath()
            },
            onComplete: () => {
                ripples.delete(g)
                g.destroy()
            },
        })
    }

    let growing: (() => void) | undefined
    const stopGrow = () => {
        scene.tweens.killTweensOf(reach)
        const done = growing
        growing = undefined
        done?.()
    }

    const hideRange = () => {
        stopGrow()
        ripples.forEach(g => g.destroy())
        ripples.clear()
        if (!ring.visible) return
        scene.tweens.add({
            targets: ring,
            alpha: 0,
            duration: 220,
            onComplete: () => {
                ring.setVisible(false).setAlpha(1)
                ring.clear()
            },
        })
    }

    const home = async () => {
        await moveCamera(W / 2, H / 2, 1, ARRIVAL.moveMs)
        if (dead) return
        cam.setZoom(1)
        cam.centerOn(W / 2, H / 2)
    }

    const peek = async (at: Point, zoom: number, dy: number) => {
        await moveCamera(at.x, at.y + dy, zoom, ARRIVAL.moveMs)
        if (dead) return
        await FX.wait(scene, ARRIVAL.holdMs)
        if (dead) return
        await home()
    }

    const dotted = async (from: Point, to: Point) => {
        const g = scene.add.graphics().setDepth(DEPTH.choice - 1).setAlpha(0)
        const a = new Phaser.Math.Vector2(from.x, from.y)
        const b = new Phaser.Math.Vector2(to.x, to.y)
        const count = Math.max(5, Math.round(a.distance(b) / 36))
        for (let i = 1; i <= count; i++) {
            const p = a.clone().lerp(b, i / (count + 1))
            g.fillStyle(C.ink, 0.3)
            g.fillCircle(p.x, p.y + 2, 9)
            g.fillStyle(C.white, 1)
            g.fillCircle(p.x, p.y, 8)
            g.fillStyle(C.gold, 1)
            g.fillCircle(p.x, p.y, 5)
        }
        lines.add(g)
        await FX.to(scene, g, { alpha: 1 }, { duration: 260 })
        await FX.wait(scene, ARRIVAL.dottedMs)
        await FX.to(scene, g, { alpha: 0 }, { duration: 260 })
        lines.delete(g)
        g.destroy()
    }

    return {
        async showDestination(which) {
            const { window, balloon, card } = deps
            void FX.impact(scene, card.container, 0.08)
            scene.events.emit(PEEK_EVENT, true)
            await FX.all(moveCamera(balloon.x, balloon.y, ARRIVAL.peekZoom, ARRIVAL.zoomInMs), window.enter(which, 'wait'))
            if (dead) return
            window.ask(true)
            await moveCamera(window.target.x, window.target.y - 40, ARRIVAL.peekZoom, ARRIVAL.moveMs)
            if (dead) return
            await FX.wait(scene, ARRIVAL.holdMs)
            if (dead) return
            await moveCamera(balloon.x, balloon.y, ARRIVAL.peekZoom, ARRIVAL.moveMs)
            if (dead) return
            await home()
            if (dead) return
            scene.events.emit(PEEK_EVENT, false)
            await dotted({ x: balloon.x + 70, y: balloon.y }, window.target)
            if (dead) return
            window.ask(false)
            await window.leave()
        },
        async focus() {
            const who = deps.window.scene
            await peek(focusOf(who), ARRIVAL.focusZoom[who], 0)
        },
        async voiceRange() {
            const center = deps.balloon.mouth
            stopGrow()
            scene.tweens.killTweensOf(ring)
            reach.r = 0
            ring.setVisible(true).setAlpha(1)
            paintRing(center)
            deps.balloon.act('talk')
            for (let i = 0; i < VOICE.waves; i++) ripple(center, i * VOICE.waveGap)
            await new Promise<void>(resolve => {
                growing = resolve
                scene.tweens.add({
                    targets: reach,
                    r: VOICE.radius,
                    delay: FX.ms(scene, VOICE.waveGap * (VOICE.waves - 1)),
                    duration: FX.ms(scene, VOICE.growMs),
                    ease: 'Sine.easeOut',
                    onUpdate: () => paintRing(center),
                    onComplete: () => {
                        if (growing === resolve) growing = undefined
                        resolve()
                    },
                })
            })
            if (dead) return
            paintRing(center)
            deps.balloon.act(null)
        },
        hideRange,
        destroy() {
            dead = true
            stopGrow()
            ripples.forEach(g => g.destroy())
            ripples.clear()
            ring.destroy()
            scene.events.emit(PEEK_EVENT, false)
            lines.forEach(g => g.destroy())
            lines.clear()
            cam.setZoom(1)
            cam.centerOn(W / 2, H / 2)
        },
    }
}
