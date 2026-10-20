import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CONSOLE, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Vec } from '../types'
import { ENVELOPE_KEY } from './art'

export function hornWaves(scene: Phaser.Scene, at: Vec, reach: number) {
    for (let i = 0; i < 3; i++) {
        const ring = scene.add.ellipse(at.x, at.y, 140, 60).setDepth(DEPTH.rain - 1)
        ring.setStrokeStyle(8, C.pulse, 0.9)
        ring.setScale(0.4)
        scene.tweens.add({
            targets: ring,
            scale: reach,
            alpha: 0,
            delay: i * 150,
            duration: TIMING.horn + 200,
            ease: 'Sine.easeOut',
            onComplete: () => ring.destroy(),
        })
    }
}

export function chatBubble(scene: Phaser.Scene, text: string) {
    const label = scene.add
        .text(0, 0, text, { fontFamily: FONT.black, fontSize: '22px', color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const w = label.width + 40
    const h = label.height + 22
    const g = scene.add.graphics()
    g.fillStyle(C.bubble, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillTriangle(w / 2 - 34, h / 2 - 2, w / 2 - 12, h / 2 - 2, w / 2 - 6, h / 2 + 14)
    const box = scene.add.container(CONSOLE.x + CONSOLE.w / 2, CONSOLE.y - 40, [g, label]).setDepth(DEPTH.flight)
    void FX.popIn(scene, box, { from: 0.5, duration: 260 })
    scene.time.delayedCall(TIMING.flight + 500, () => {
        scene.tweens.add({ targets: box, alpha: 0, duration: 200, onComplete: () => box.destroy() })
    })
}

export async function flyEnvelope(scene: Phaser.Scene, from: Vec, to: Vec, endScale: number, lost = false) {
    const env = scene.add.image(from.x, from.y, ENVELOPE_KEY).setDepth(DEPTH.flight).setScale(0.9)
    scene.tweens.add({ targets: env, scale: endScale, duration: TIMING.flight, ease: 'Sine.easeIn' })
    await FX.arcTo(scene, env, to, { height: 140, duration: TIMING.flight })
    if (lost) {
        await FX.to(scene, env, { y: to.y + 60, alpha: 0, angle: 40 }, { duration: 360, ease: 'Cubic.easeIn' })
    } else {
        void FX.sparks(scene, to.x, to.y, { color: C.butter, count: 10, spread: 60, size: 7, duration: 420, depth: DEPTH.flight })
        await FX.to(scene, env, { scale: 0.1, alpha: 0 }, { duration: 160 })
    }
    env.destroy()
}

export function delivery(scene: Phaser.Scene, from: Vec, to: Vec) {
    const g = scene.add.graphics()
    g.fillStyle(C.boxDark, 1)
    g.fillRoundedRect(-34, -26, 68, 52, 8)
    g.fillStyle(C.box, 1)
    g.fillRoundedRect(-34, -30, 68, 50, 8)
    g.fillStyle(C.tape, 1)
    g.fillRoundedRect(-6, -30, 12, 50, 3)
    const box = scene.add.container(from.x, from.y, [g]).setDepth(DEPTH.flight)
    return FX.arcTo(scene, box, to, { height: 160, duration: 760 }).then(() =>
        FX.to(scene, box, { scale: 0.2, alpha: 0 }, { duration: 200 }).then(() => box.destroy()),
    )
}

export async function speakerWaves(scene: Phaser.Scene, from: Vec, to: Vec) {
    const waves = Array.from({ length: 4 }, (_, i) => {
        const ring = scene.add.ellipse(from.x, from.y, 220, 90).setDepth(DEPTH.flight - 1)
        ring.setStrokeStyle(12, C.pulse, 0.95).setScale(0.3).setAlpha(0)
        scene.tweens.add({
            targets: ring,
            x: to.x,
            y: to.y,
            scale: 2.4,
            alpha: { from: 1, to: 0 },
            delay: i * 200,
            duration: TIMING.speaker,
            ease: 'Sine.easeOut',
            onComplete: () => ring.destroy(),
        })
        return ring
    })
    await FX.wait(scene, TIMING.speaker + (waves.length - 1) * 200)
}

export function radioWaves(scene: Phaser.Scene, at: Vec) {
    const g = scene.add.graphics().setDepth(DEPTH.flight)
    const state = { t: 0 }
    scene.tweens.add({
        targets: state,
        t: 1,
        duration: TIMING.radio,
        onUpdate: () => {
            g.clear()
            for (let i = 0; i < 3; i++) {
                const k = (state.t * 3 - i) % 1
                if (state.t * 3 < i || k < 0) continue
                const r = 18 + k * 60
                g.lineStyle(7, C.bubble, 1 - k)
                g.beginPath()
                g.arc(at.x, at.y, r, -Math.PI * 0.85, -Math.PI * 0.15, false)
                g.strokePath()
            }
        },
        onComplete: () => g.destroy(),
    })
}

export async function envelopeBack(scene: Phaser.Scene, from: Vec, to: Vec) {
    const env = scene.add.image(from.x, from.y, ENVELOPE_KEY).setDepth(DEPTH.flight).setScale(0.9)
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
    await FX.arcTo(scene, env, mid, { height: 100, duration: TIMING.flight * 0.6 })
    await FX.to(scene, env, { angle: -20 }, { duration: 120, yoyo: true })
    await FX.arcTo(scene, env, from, { height: 60, duration: TIMING.flight * 0.6 })
    await FX.to(scene, env, { scale: 0.2, alpha: 0 }, { duration: 160 })
    env.destroy()
}

export function towCable(scene: Phaser.Scene, from: Vec, to: Vec) {
    const g = scene.add.graphics().setDepth(DEPTH.rain - 1)
    g.lineStyle(7, C.ink, 1)
    g.lineBetween(from.x, from.y, to.x, to.y)
    return g
}
