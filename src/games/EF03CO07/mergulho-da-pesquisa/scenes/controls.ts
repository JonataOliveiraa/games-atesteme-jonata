import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BOOST, DEPTH, JOYSTICK, SUB } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Rect, Vec } from '../types'
import { baked } from './bake'

const KEYS: Record<string, Vec> = {
    ArrowLeft: { x: -1, y: 0 },
    KeyA: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    KeyD: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: -1 },
    KeyW: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    KeyS: { x: 0, y: 1 },
}

export interface Controls {
    readonly vector: Vec
    boosting(now: number): boolean
    onBoost(fn: () => void): void
    setEnabled(on: boolean): void
    stickRect(): Rect
    boostRect(): Rect
    destroy(): void
}

export function createControls(scene: Phaser.Scene): Controls {
    let on = false
    let grabbed: number | null = null
    const stick = { x: 0, y: 0 }
    const held = new Set<string>()
    let boostUntil = 0
    let readyAt = 0
    let boostFn: () => void = () => {}

    const R = JOYSTICK.r
    const baseKey = baked(scene, 'mg-stick-base', R * 2 + 16, R * 2 + 16, g => {
        g.fillStyle(C.shadow, 0.25)
        g.fillCircle(R + 6, R + 10, R)
        g.fillStyle(C.white, 0.45)
        g.fillCircle(R + 3, R + 3, R)
        g.lineStyle(5, C.ink, 1)
        g.strokeCircle(R + 3, R + 3, R)
    })
    const K = JOYSTICK.knob
    const knobKey = baked(scene, 'mg-stick-knob', K * 2 + 14, K * 2 + 14, g => {
        g.fillStyle(C.shadow, 0.25)
        g.fillCircle(K + 5, K + 9, K)
        g.fillStyle(C.aqua, 1)
        g.fillCircle(K + 3, K + 3, K)
        g.lineStyle(5, C.ink, 1)
        g.strokeCircle(K + 3, K + 3, K)
        g.fillStyle(C.white, 0.45)
        g.fillCircle(K - 9, K - 9, 12)
    })
    const B = BOOST.r
    const boostKey = (ready: boolean) =>
        baked(scene, ready ? 'mg-boost-on' : 'mg-boost-off', B * 2 + 16, B * 2 + 16, g => {
            g.fillStyle(C.shadow, 0.25)
            g.fillCircle(B + 6, B + 10, B)
            g.fillStyle(ready ? C.pink : C.inkSoft, 1)
            g.fillCircle(B + 3, B + 3, B)
            g.lineStyle(5, C.ink, 1)
            g.strokeCircle(B + 3, B + 3, B)
            g.lineStyle(6, C.white, 0.9)
            g.strokeCircle(B + 3, B + 3, B - 12)
        })
    const base = scene.add.image(JOYSTICK.x, JOYSTICK.y, baseKey).setDepth(DEPTH.controls).setScrollFactor(0)
    base.setOrigin((R + 3) / (R * 2 + 16), (R + 3) / (R * 2 + 16)).setPosition(JOYSTICK.x, JOYSTICK.y)
    const knob = scene.add.image(JOYSTICK.x, JOYSTICK.y, knobKey).setOrigin((K + 3) / (K * 2 + 14), (K + 3) / (K * 2 + 14)).setDepth(DEPTH.controls + 1).setScrollFactor(0)
    const boostArt = scene.add.image(0, 0, boostKey(true)).setOrigin((B + 3) / (B * 2 + 16), (B + 3) / (B * 2 + 16))
    const boostLabel = scene.add
        .text(0, 2, 'BOOST', { fontFamily: FONT.black, fontSize: '24px', color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    const boost = scene.add.container(BOOST.x, BOOST.y, [boostArt, boostLabel]).setDepth(DEPTH.controls).setScrollFactor(0)
    const paintBoost = (ready: boolean) => boostArt.setTexture(boostKey(ready))
    const boostZone = scene.add.zone(BOOST.x, BOOST.y, BOOST.hit, BOOST.hit).setScrollFactor(0).setDepth(DEPTH.controls + 2).setInteractive()

    const fire = () => {
        if (!on) return
        const now = scene.time.now
        if (now < readyAt) return
        boostUntil = now + SUB.boostMs
        readyAt = now + SUB.boostMs + SUB.cooldownMs
        paintBoost(false)
        void FX.press(scene, boost)
        scene.time.delayedCall(SUB.boostMs + SUB.cooldownMs, () => paintBoost(true))
        boostFn()
    }
    boostZone.on('pointerdown', fire)

    const setStick = (dx: number, dy: number) => {
        const len = Math.hypot(dx, dy)
        const k = len > JOYSTICK.r ? JOYSTICK.r / len : 1
        stick.x = (dx * k) / JOYSTICK.r
        stick.y = (dy * k) / JOYSTICK.r
        knob.setPosition(JOYSTICK.x + dx * k, JOYSTICK.y + dy * k)
    }
    const release = () => {
        grabbed = null
        stick.x = 0
        stick.y = 0
        knob.setPosition(JOYSTICK.x, JOYSTICK.y)
    }
    const onDown = (p: Phaser.Input.Pointer) => {
        if (!on || grabbed !== null) return
        if (Phaser.Math.Distance.Between(p.x, p.y, JOYSTICK.x, JOYSTICK.y) > JOYSTICK.grab) return
        grabbed = p.id
        setStick(p.x - JOYSTICK.x, p.y - JOYSTICK.y)
    }
    const onMove = (p: Phaser.Input.Pointer) => {
        if (p.id === grabbed) setStick(p.x - JOYSTICK.x, p.y - JOYSTICK.y)
    }
    const onUp = (p: Phaser.Input.Pointer) => {
        if (p.id === grabbed) release()
    }
    scene.input.on('pointerdown', onDown)
    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)
    const onKeyDown = (e: KeyboardEvent) => {
        if (KEYS[e.code]) held.add(e.code)
        if (e.code === 'Space' && !e.repeat) fire()
    }
    const onKeyUp = (e: KeyboardEvent) => held.delete(e.code)
    const onBlur = () => held.clear()
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    scene.input.keyboard?.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE'])

    return {
        get vector() {
            if (!on) return { x: 0, y: 0 }
            if (grabbed !== null) {
                const len = Math.hypot(stick.x, stick.y)
                return len < JOYSTICK.dead ? { x: 0, y: 0 } : { x: stick.x, y: stick.y }
            }
            const v = { x: 0, y: 0 }
            held.forEach(code => {
                v.x += KEYS[code].x
                v.y += KEYS[code].y
            })
            const len = Math.hypot(v.x, v.y)
            return len > 1 ? { x: v.x / len, y: v.y / len } : v
        },
        boosting(now) {
            return on && now < boostUntil
        },
        onBoost(fn) {
            boostFn = fn
        },
        setEnabled(next) {
            on = next
            if (!next) {
                release()
                held.clear()
            }
            base.setAlpha(next ? 1 : 0.6)
            boost.setAlpha(next ? 1 : 0.6)
        },
        stickRect() {
            return { x: JOYSTICK.x, y: JOYSTICK.y, w: JOYSTICK.r * 2 + 40, h: JOYSTICK.r * 2 + 40 }
        },
        boostRect() {
            return { x: BOOST.x, y: BOOST.y, w: BOOST.r * 2 + 40, h: BOOST.r * 2 + 40 }
        },
        destroy() {
            scene.input.off('pointerdown', onDown)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            window.removeEventListener('blur', onBlur)
            base.destroy()
            knob.destroy()
            boost.destroy()
            boostZone.destroy()
        },
    }
}
