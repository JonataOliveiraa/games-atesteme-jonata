import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI, UI_SHEET, cellKey } from '../data/files'
import { AIM, DEPTH, JOY } from '../data/layout'
import { pixel, resprite, sprite } from './art'
import type { Fujao, Swarm } from './swarm'

type Point = { x: number; y: number }

/**
 * A mira e o joystick. O joystick (ou WASD/setas) move a mira; sobre um fujão ela fecha e fica amarela,
 * e com o joystick solto ela acompanha o fujão travado — assim dá para soltar e tocar o número.
 * Um toque em qualquer ponto do canto de baixo à esquerda pega o joystick.
 */
export interface Aim {
    readonly x: number
    readonly y: number
    readonly target: Fujao | null
    update(dt: number, swarm: Swarm): void
    setEnabled(on: boolean): void
    setShown(on: boolean): Promise<void>
    /** a demonstração: o joystick se mexe sozinho e a mira vai até o ponto */
    drive(to: () => Point, ms: number): Promise<void>
    reset(): void
    destroy(): void
}

const DEAD = 0.12

export function createAim(scene: Phaser.Scene): Aim {
    const base = pixel(scene, UI_SHEET, UI.joyBase, JOY.base).setPosition(JOY.x, JOY.y)
    const knob = pixel(scene, UI_SHEET, UI.joyKnob, JOY.knob).setPosition(JOY.x, JOY.y)
    const joy = scene.add.container(0, 0, [base, knob]).setDepth(DEPTH.controls).setAlpha(0)
    const cross = sprite(scene, UI_SHEET, UI.aimOpen, AIM.size).setPosition(AIM.startX, AIM.startY).setDepth(DEPTH.aim).setAlpha(0)

    let x: number = AIM.startX
    let y: number = AIM.startY
    let enabled = false
    let driving = false
    let assist = false
    let target: Fujao | null = null
    let lockedFrame = false
    let owner: number | null = null
    const pull = new Phaser.Math.Vector2(0, 0)

    const keys = scene.input.keyboard?.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D') as
        | Record<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>
        | undefined

    const placeKnob = (dx: number, dy: number) => {
        pull.set(dx, dy)
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
        placeKnob(p.x - JOY.x, p.y - JOY.y)
    }
    const onMove = (p: Phaser.Input.Pointer) => {
        if (p.id === owner) placeKnob(p.x - JOY.x, p.y - JOY.y)
    }
    const onUp = (p: Phaser.Input.Pointer) => {
        if (p.id === owner) release()
    }
    scene.input.on('pointerdown', onDown)
    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)

    const vector = (): Point => {
        if (!enabled) return { x: 0, y: 0 }
        if (keys) {
            const kx = (keys.RIGHT.isDown || keys.D.isDown ? 1 : 0) - (keys.LEFT.isDown || keys.A.isDown ? 1 : 0)
            const ky = (keys.DOWN.isDown || keys.S.isDown ? 1 : 0) - (keys.UP.isDown || keys.W.isDown ? 1 : 0)
            if (kx || ky) {
                const len = Math.hypot(kx, ky)
                return { x: kx / len, y: ky / len }
            }
        }
        const vx = pull.x / JOY.r
        const vy = pull.y / JOY.r
        return Math.hypot(vx, vy) < DEAD ? { x: 0, y: 0 } : { x: vx, y: vy }
    }

    const clampAim = () => {
        x = Phaser.Math.Clamp(x, AIM.minX, AIM.maxX)
        y = Phaser.Math.Clamp(y, AIM.minY, AIM.maxY)
    }

    const aim: Aim = {
        get x() {
            return x
        },
        get y() {
            return y
        },
        get target() {
            return target
        },
        update(dt, swarm) {
            const active = enabled || assist
            if (!driving) {
                const v = vector()
                if (v.x || v.y) {
                    x += v.x * AIM.speed * dt
                    y += v.y * AIM.speed * dt
                } else if (active && target && target.state === 'free') {
                    const e = 1 - Math.exp(-AIM.follow * dt)
                    x += (target.sx - x) * e
                    y += (target.sy - y) * e
                }
                clampAim()
            }
            target = active ? swarm.pick(x, y) : null
            swarm.setLocked(target)
            cross.setPosition(x, y)
            if (!!target !== lockedFrame) {
                lockedFrame = !!target
                cross.setFrame(cellKey(lockedFrame ? UI.aimLock : UI.aimOpen))
            }
            const size = target ? target.size + AIM.hug : AIM.size
            cross.setScale(size / Math.max(cross.frame.width, cross.frame.height))
        },
        setEnabled(on) {
            enabled = on
            assist = false
            if (!on && owner !== null) release()
        },
        async setShown(on) {
            scene.tweens.killTweensOf([joy, cross])
            await FX.to(scene, [joy, cross], { alpha: on ? 1 : 0 }, { duration: 260 })
        },
        drive(to, ms) {
            driving = true
            assist = true
            const from = { x, y }
            const s = { t: 0 }
            return new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: s,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    onUpdate: () => {
                        const p = to()
                        const e = s.t * s.t * (3 - 2 * s.t)
                        x = Phaser.Math.Linear(from.x, p.x, e)
                        y = Phaser.Math.Linear(from.y, p.y, e)
                        const dx = p.x - from.x
                        const dy = p.y - from.y
                        const len = Math.hypot(dx, dy) || 1
                        const k = Math.sin(s.t * Math.PI) * JOY.r * 0.8
                        knob.setPosition(JOY.x + (dx / len) * k, JOY.y + (dy / len) * k)
                    },
                    onComplete: () => {
                        driving = false
                        knob.setPosition(JOY.x, JOY.y)
                        resolve()
                    },
                    onStop: () => {
                        driving = false
                        resolve()
                    },
                })
            })
        },
        reset() {
            x = AIM.startX
            y = AIM.startY
            assist = false
            target = null
            cross.setPosition(x, y)
            if (lockedFrame) {
                lockedFrame = false
                resprite(cross, UI.aimOpen, AIM.size)
            }
            cross.setFrame(cellKey(UI.aimOpen))
        },
        destroy() {
            scene.input.off('pointerdown', onDown)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            if (keys) Object.values(keys).forEach(key => scene.input.keyboard?.removeKey(key))
            scene.tweens.killTweensOf([knob, joy, cross])
            joy.destroy()
            cross.destroy()
        },
    }
    return aim
}
