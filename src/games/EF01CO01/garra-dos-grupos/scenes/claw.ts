import Phaser from 'phaser'
import { ITEM_CELL, ITEMS, MACHINE, MACHINE_CELL } from '../data/files'
import { CLAW, DEPTH, RAIL, TRAY } from '../data/layout'
import { C, PAINT } from '../data/theme'
import type { Color } from '../types'
import type { ItemView } from './tray'

export interface Claw {
    readonly container: Phaser.GameObjects.Container
    readonly x: number
    readonly y: number
    update(dtMs: number, crossMs: number): void
    setSweeping(on: boolean): void
    setAim(overItem: boolean): void
    drop(targetY: number): Promise<void>
    grab(view: ItemView | null): Promise<void>
    rise(): Promise<void>
    swing(): Promise<void>
    home(): Promise<void>
    give(): ItemView | undefined
    setSad(on: boolean): void
    destroy(): void
}

type Pose = 'open' | 'closed' | 'stuck'

const HOLD = (CLAW.holdY - CLAW.hookY) * CLAW.scale
const REACH = (CLAW.cell - CLAW.hookY) * CLAW.scale
const BEAM_BOTTOM = TRAY.cy + TRAY.ringRy + 20

function paintClaw(g: Phaser.GameObjects.Graphics, pose: Pose) {
    g.clear()
    const body = pose === 'stuck' ? C.amber : C.metal
    g.fillStyle(C.metalDark, 1)
    g.fillRoundedRect(-34, 0, 68, 42, 14)
    g.fillStyle(body, 1)
    g.fillRoundedRect(-30, 2, 60, 34, 12)
    g.fillStyle(C.white, 0.6)
    g.fillRoundedRect(-22, 7, 30, 8, 4)
    const spread = pose === 'open' ? 1 : 0.42
    g.lineStyle(12, C.metalDark, 1)
    for (const side of [-1, 0, 1]) {
        const tipX = side * 62 * spread
        const midX = side * (pose === 'open' ? 58 : 44)
        g.beginPath()
        g.moveTo(side * 14, 38)
        g.lineTo(midX, 96)
        g.lineTo(tipX, 150)
        g.strokePath()
    }
    g.lineStyle(6, body, 1)
    for (const side of [-1, 0, 1]) {
        const tipX = side * 62 * spread
        const midX = side * (pose === 'open' ? 58 : 44)
        g.beginPath()
        g.moveTo(side * 14, 38)
        g.lineTo(midX, 96)
        g.lineTo(tipX, 150)
        g.strokePath()
    }
}

export function paintDrop(g: Phaser.GameObjects.Graphics, color: number, r: number) {
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, r * 0.25, r + 4)
    g.fillTriangle(-r * 0.86 - 3, 0, r * 0.86 + 3, 0, 0, -r * 1.45 - 5)
    g.fillStyle(color, 1)
    g.fillCircle(0, r * 0.25, r)
    g.fillTriangle(-r * 0.86, 0, r * 0.86, 0, 0, -r * 1.45)
    g.fillStyle(C.white, 0.55)
    g.fillEllipse(-r * 0.35, r * 0.05, r * 0.36, r * 0.5)
}

export function createDrop(scene: Phaser.Scene, color: Color, r: number): Phaser.GameObjects.GameObject {
    if (scene.textures.exists(MACHINE)) {
        return scene.add
            .image(0, 0, MACHINE, MACHINE_CELL.drop)
            .setScale((r * 2.6) / CLAW.cell)
            .setTint(PAINT[color])
    }
    const g = scene.add.graphics()
    paintDrop(g, PAINT[color], r)
    return g
}

export function createClaw(scene: Phaser.Scene): Claw {
    let x = RAIL.minX
    let hookY = CLAW.restY
    let phase = 0
    let sweeping = false
    let aim = false
    let pose: Pose = 'open'
    let held: ItemView | undefined
    let sad = false
    let swingAngle = 0
    let alive = true

    const cable = scene.textures.exists(ITEMS) ? scene.add.container(x, RAIL.y) : undefined
    const cableSegment = CLAW.cableArt * CLAW.cableScale
    const paintCable = (len: number) => {
        if (!cable) return
        const need = Math.ceil(len / cableSegment)
        while (cable.length < need) {
            cable.add(
                scene.add
                    .image(0, cable.length * cableSegment, ITEMS, ITEM_CELL.cable)
                    .setOrigin(0.5, 0)
                    .setScale(CLAW.cableScale),
            )
        }
        cable.each((piece: Phaser.GameObjects.Image) => {
            const i = cable.getIndex(piece)
            const left = len - i * cableSegment
            piece.setVisible(left > 0)
            if (left > 0) piece.setCrop(0, 0, CLAW.cableArt, Math.min(CLAW.cableArt, left / CLAW.cableScale))
        })
    }
    const cableLine = scene.add.graphics()
    const trolley = scene.add.graphics()
    trolley.fillStyle(C.railDark, 1)
    trolley.fillRoundedRect(-30, -14, 60, 28, 10)
    trolley.fillStyle(C.rail, 1)
    trolley.fillRoundedRect(-26, -12, 52, 20, 8)
    trolley.fillStyle(C.railDark, 1)
    trolley.fillCircle(-16, 12, 6)
    trolley.fillCircle(16, 12, 6)
    const trolleyBox = scene.add.container(x, RAIL.y, [trolley]).setDepth(DEPTH.claw + 1)

    const beam = scene.add.graphics()
    const hasArt = scene.textures.exists(MACHINE)
    const clawImage = hasArt
        ? scene.add
              .image(0, 0, MACHINE, MACHINE_CELL.clawOpen)
              .setOrigin(0.5, CLAW.hookY / CLAW.cell)
              .setScale(CLAW.scale)
        : undefined
    const clawDrawn = hasArt ? undefined : scene.add.graphics()
    if (clawDrawn) paintClaw(clawDrawn, pose)

    const body = scene.add.container(0, 0, [clawImage ?? clawDrawn!])
    const container = scene.add.container(x, hookY, [beam, body]).setDepth(DEPTH.claw)
    cableLine.setDepth(DEPTH.claw - 1)
    cable?.setDepth(DEPTH.claw - 1)


    const setPose = (next: Pose) => {
        pose = next
        if (clawImage) {
            const frame =
                next === 'open' ? MACHINE_CELL.clawOpen : next === 'closed' ? MACHINE_CELL.clawClosed : MACHINE_CELL.clawStuck
            clawImage.setFrame(frame)
        } else if (clawDrawn) {
            paintClaw(clawDrawn, next)
        }
    }

    const paintBeam = () => {
        beam.clear()
        const atRest = Math.abs(hookY - CLAW.restY) < 1 && !held && !sad && swingAngle === 0
        if (!atRest || !sweeping) return
        const top = REACH - 30
        const bottom = BEAM_BOTTOM - hookY
        const half = CLAW.beamW / 2
        if (aim) {
            beam.fillStyle(C.beam, 0.28)
            beam.fillTriangle(-10, top, 10, top, half, bottom)
            beam.fillTriangle(-10, top, half, bottom, -half, bottom)
            beam.fillStyle(C.beam, 0.55)
            beam.fillEllipse(0, bottom, CLAW.beamW * 1.6, 22)
        } else {
            beam.lineStyle(3, C.beam, 0.25)
            for (let y = top; y < bottom; y += 26) beam.lineBetween(0, y, 0, Math.min(bottom, y + 12))
        }
    }

    const sync = () => {
        if (!alive) return
        const len = Math.max(1, hookY - RAIL.y)
        const sin = Math.sin(swingAngle)
        const cos = Math.cos(swingAngle)
        const hx = x + sin * len
        const hy = RAIL.y + cos * len
        container.setPosition(hx, hy).setRotation(-swingAngle)
        trolleyBox.setPosition(x, RAIL.y)
        if (cable) {
            cable.setPosition(x, RAIL.y).setRotation(-swingAngle)
            paintCable(len)
        } else {
            cableLine.clear()
            cableLine.lineStyle(CLAW.cableW, C.railDark, 1)
            cableLine.lineBetween(x, RAIL.y, hx, hy + 4)
            cableLine.lineStyle(CLAW.cableW - 5, C.rail, 1)
            cableLine.lineBetween(x, RAIL.y, hx, hy + 4)
        }
        if (held) {
            held.container
                .setPosition(x + sin * (len + HOLD), RAIL.y + cos * (len + HOLD))
                .setRotation(-swingAngle)
        }
        paintBeam()
    }

    const tween = (props: Record<string, unknown>, duration: number, ease = 'Sine.easeInOut') =>
        new Promise<void>(resolve => {
            if (!alive) return resolve()
            const state = { x, hookY }
            scene.tweens.add({
                targets: state,
                ...props,
                duration,
                ease,
                onUpdate: () => {
                    x = state.x
                    hookY = state.hookY
                    sync()
                },
                onComplete: () => {
                    x = state.x
                    hookY = state.hookY
                    sync()
                    resolve()
                },
            })
        })

    const phaseFromX = () => {
        const e = Phaser.Math.Clamp((x - RAIL.minX) / (RAIL.maxX - RAIL.minX), 0, 1)
        const q = Math.acos(1 - 2 * e) / Math.PI
        const forward = phase < 1
        phase = forward ? q : 2 - q
    }

    sync()

    return {
        container,
        get x() {
            return x
        },
        get y() {
            return hookY
        },
        update(dtMs, crossMs) {
            if (sweeping && !sad && crossMs > 0) {
                phase = (phase + dtMs / crossMs) % 2
                const q = phase < 1 ? phase : 2 - phase
                const eased = (1 - Math.cos(Math.PI * q)) / 2
                x = RAIL.minX + (RAIL.maxX - RAIL.minX) * eased
                const speed = Math.sin(Math.PI * q) * (phase < 1 ? 1 : -1)
                body.setAngle(-speed * 4)
            }
            sync()
        },
        setSweeping(on) {
            if (on && !sweeping) phaseFromX()
            sweeping = on
            if (!on) body.setAngle(0)
            paintBeam()
        },
        setAim(on) {
            if (aim === on) return
            aim = on
            paintBeam()
        },
        drop(targetY) {
            body.setAngle(0)
            const to = targetY - HOLD
            const dist = Math.abs(to - hookY)
            return tween({ hookY: to }, CLAW.dropMs * Math.max(0.4, dist / 380), 'Quad.easeIn')
        },
        async grab(view) {
            setPose('closed')
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: body,
                    scaleX: 0.9,
                    scaleY: 1.06,
                    duration: 90,
                    yoyo: true,
                    onComplete: () => resolve(),
                }),
            )
            if (view) {
                held = view
                view.container.setDepth(DEPTH.carried)
                sync()
            } else {
                setPose('open')
            }
        },
        rise() {
            const dist = Math.abs(CLAW.restY - hookY)
            return tween({ hookY: CLAW.restY }, CLAW.riseMs * Math.max(0.4, dist / 380), 'Quad.easeOut')
        },
        swing() {
            body.setAngle(0)
            const period = CLAW.swingPeriod
            const total = period * 2.25
            const state = { t: 0 }
            return new Promise<void>(resolve => {
                if (!alive) return resolve()
                scene.tweens.add({
                    targets: state,
                    t: total,
                    duration: total,
                    ease: 'Linear',
                    onUpdate: () => {
                        const grow = 0.35 + 0.65 * (state.t / total)
                        swingAngle = CLAW.swingMax * grow * Math.sin((2 * Math.PI * state.t) / period)
                        sync()
                    },
                    onComplete: () => {
                        swingAngle = CLAW.swingMax
                        sync()
                        resolve()
                    },
                })
            })
        },
        async home() {
            if (Math.abs(hookY - CLAW.restY) > 1) await tween({ hookY: CLAW.restY }, 280, 'Quad.easeOut')
            const tx = Phaser.Math.Clamp(x, RAIL.minX, RAIL.maxX)
            if (Math.abs(tx - x) > 1) await tween({ x: tx }, CLAW.carryMs)
        },
        give() {
            const view = held
            held = undefined
            setPose('open')
            if (swingAngle !== 0) {
                const state = { a: swingAngle }
                scene.tweens.add({
                    targets: state,
                    a: 0,
                    duration: 900,
                    ease: 'Elastic.easeOut',
                    easeParams: [0.6, 0.4],
                    onUpdate: () => {
                        swingAngle = state.a
                        sync()
                    },
                    onComplete: () => {
                        swingAngle = 0
                        sync()
                    },
                })
            }
            sync()
            return view
        },
        setSad(on) {
            sad = on
            setPose(on ? 'stuck' : 'open')
            scene.tweens.killTweensOf(body)
            if (on) {
                scene.tweens.add({ targets: body, angle: 10, y: 8, duration: 420, ease: 'Sine.easeOut' })
            } else {
                body.setAngle(0).setY(0)
            }
            paintBeam()
        },
        destroy() {
            alive = false
            scene.tweens.killTweensOf(body)
            container.destroy()
            trolleyBox.destroy()
            cable?.destroy()
            cableLine.destroy()
        },
    }
}
