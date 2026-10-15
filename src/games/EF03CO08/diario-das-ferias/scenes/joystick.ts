import Phaser from 'phaser'
import { UI_CELL } from '../data/files'
import { DEPTH, JOY } from '../data/layout'
import { uiImage } from './art'
import type { Rect } from './guide'

/**
 * Joystick livre. Um toque em qualquer ponto do canto de baixo à esquerda pega o
 * controle (o dedo não precisa acertar a bolinha). Setas e WASD também valem.
 */
export interface Joystick {
    vector(): { x: number; y: number }
    setEnabled(on: boolean): void
    rect(): Rect
    destroy(): void
}

const DEAD = 0.12

export function createJoystick(scene: Phaser.Scene): Joystick {
    const base = uiImage(scene, UI_CELL.joyBase, JOY.base).setPosition(JOY.x, JOY.y).setDepth(DEPTH.controls)
    const knob = uiImage(scene, UI_CELL.joyKnob, JOY.knob * 2).setPosition(JOY.x, JOY.y).setDepth(DEPTH.controls + 1)
    let enabled = true
    let owner: number | null = null
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

    return {
        vector() {
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
            base.setAlpha(on ? 1 : 0.45)
            knob.setAlpha(on ? 1 : 0.45)
        },
        rect: () => ({ x: JOY.x, y: JOY.y, w: JOY.base + 20, h: JOY.base + 20 }),
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
