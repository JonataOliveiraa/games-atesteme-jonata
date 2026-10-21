import Phaser from 'phaser'
import { DEPTH, JOY } from '../data/layout'
import { C } from '../data/theme'
import type { Rect, Vec } from '../types'

/**
 * O joystick, no canto de baixo à esquerda (o mesmo da Câmera na Trilha,
 * desenhado em código). No computador, setas e WASD também andam.
 */
export interface Joystick {
    vector(): Vec
    setEnabled(on: boolean): void
    nudge(to: Vec): void
    release(): void
    visible(on: boolean): void
    rect(): Rect
    destroy(): void
}

const DEAD = 0.14

export function createJoystick(scene: Phaser.Scene): Joystick {
    const base = scene.add.graphics().setPosition(JOY.x, JOY.y).setDepth(DEPTH.controls)
    base.fillStyle(C.shadow, 0.22)
    base.fillCircle(0, 6, JOY.base)
    base.fillStyle(C.white, 0.55)
    base.fillCircle(0, 0, JOY.base)
    base.lineStyle(5, C.headerLine, 0.8)
    base.strokeCircle(0, 0, JOY.base)
    base.fillStyle(C.headerLine, 0.35)
    ;[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach(a => {
        const cx = Math.cos(a) * (JOY.base - 18)
        const cy = Math.sin(a) * (JOY.base - 18)
        const tip = { x: cx + Math.cos(a) * 9, y: cy + Math.sin(a) * 9 }
        const l = { x: cx + Math.cos(a + Math.PI / 2) * 9, y: cy + Math.sin(a + Math.PI / 2) * 9 }
        const r = { x: cx + Math.cos(a - Math.PI / 2) * 9, y: cy + Math.sin(a - Math.PI / 2) * 9 }
        base.fillTriangle(tip.x, tip.y, l.x, l.y, r.x, r.y)
    })
    const knob = scene.add.graphics().setPosition(JOY.x, JOY.y).setDepth(DEPTH.controls + 1)
    knob.fillStyle(C.shadow, 0.25)
    knob.fillCircle(0, 5, JOY.knob)
    knob.fillStyle(C.accentDark, 1)
    knob.fillCircle(0, 0, JOY.knob)
    knob.fillStyle(C.accent, 1)
    knob.fillCircle(0, -4, JOY.knob - 6)
    knob.fillStyle(C.white, 0.5)
    knob.fillEllipse(-10, -16, 22, 12)

    let enabled = false
    let owner: number | null = null
    let forced: Vec | null = null
    const pull = new Phaser.Math.Vector2(0, 0)

    const keys = scene.input.keyboard?.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D') as
        | Record<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>
        | undefined

    const place = (px: number, py: number) => {
        pull.set(px - JOY.x, py - JOY.y)
        if (pull.length() > JOY.r) pull.setLength(JOY.r)
        knob.setPosition(JOY.x + pull.x, JOY.y + pull.y)
    }

    const release = () => {
        owner = null
        forced = null
        pull.set(0, 0)
        scene.tweens.killTweensOf(knob)
        scene.tweens.add({ targets: knob, x: JOY.x, y: JOY.y, duration: 140, ease: 'Back.easeOut' })
    }

    const onDown = (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (!enabled || owner !== null || over.length) return
        if (p.x > JOY.grabMaxX || p.y < JOY.grabMinY) return
        owner = p.id
        scene.tweens.killTweensOf(knob)
        place(p.x, p.y)
    }
    const onMove = (p: Phaser.Input.Pointer) => {
        if (p.id === owner) place(p.x, p.y)
    }
    const onUp = (p: Phaser.Input.Pointer) => {
        if (p.id === owner) release()
    }
    scene.input.on('pointerdown', onDown)
    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)

    const paint = () => {
        base.setAlpha(enabled || forced ? 1 : 0.5)
        knob.setAlpha(enabled || forced ? 1 : 0.5)
    }
    paint()

    return {
        vector() {
            if (forced) return forced
            if (!enabled) return { x: 0, y: 0 }
            if (keys) {
                const kx = (keys.RIGHT.isDown || keys.D.isDown ? 1 : 0) - (keys.LEFT.isDown || keys.A.isDown ? 1 : 0)
                const ky = (keys.DOWN.isDown || keys.S.isDown ? 1 : 0) - (keys.UP.isDown || keys.W.isDown ? 1 : 0)
                if (kx || ky) {
                    const len = Math.hypot(kx, ky)
                    return { x: kx / len, y: ky / len }
                }
            }
            const x = pull.x / JOY.r
            const y = pull.y / JOY.r
            return Math.hypot(x, y) < DEAD ? { x: 0, y: 0 } : { x, y }
        },
        setEnabled(on) {
            enabled = on
            if (!on && owner !== null) release()
            paint()
        },
        nudge(to) {
            // a demonstração "aperta" o joystick: a bolinha vai para a direção do passo
            const len = Math.hypot(to.x, to.y) || 1
            forced = { x: to.x / len, y: to.y / len }
            scene.tweens.killTweensOf(knob)
            scene.tweens.add({ targets: knob, x: JOY.x + forced.x * JOY.r, y: JOY.y + forced.y * JOY.r, duration: 160, ease: 'Sine.easeOut' })
            paint()
        },
        release() {
            release()
            paint()
        },
        visible(on) {
            base.setVisible(on)
            knob.setVisible(on)
        },
        rect: () => ({ x: JOY.x, y: JOY.y, w: JOY.base * 2 + 30, h: JOY.base * 2 + 30 }),
        destroy() {
            scene.input.off('pointerdown', onDown)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            if (keys) Object.values(keys).forEach(k => scene.input.keyboard?.removeKey(k))
            scene.tweens.killTweensOf(knob)
            base.destroy()
            knob.destroy()
        },
    }
}
