import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { fieldOf, fieldOwner, inField, openNeighbors, same } from '../data/levels'
import { cellCenter, DEPTH, GRID, MAGNET, spanRect } from '../data/layout'
import { A, C, LINE } from '../data/theme'
import type { MagnetPose, MazeDef, Point, Spot } from '../types'
import { MAGNET_ART, PIECES, type PieceFrame } from '../data/files'
import { createDatum, createIdCard, DATA, datumScale, type IdCard } from './card'

type G = Phaser.GameObjects.Graphics

const ART_FRAME: Record<MagnetPose, PieceFrame> = { awake: 'magnetAwake', pull: 'magnetPull', sleep: 'magnetSleep' }

function paintMagnet(g: G, pose: MagnetPose, belly: boolean) {
    g.clear()
    const r = 19
    const top = -22
    g.lineStyle(30, C.ink, 1)
    g.beginPath()
    g.arc(0, 4, r, 0, Math.PI, false)
    g.strokePath()
    g.lineBetween(-r, 4, -r, top)
    g.lineBetween(r, 4, r, top)
    g.lineStyle(24, C.lilac, 1)
    g.beginPath()
    g.arc(0, 4, r, 0, Math.PI, false)
    g.strokePath()
    g.lineBetween(-r, 4, -r, top)
    g.lineBetween(r, 4, r, top)
    g.lineStyle(LINE, C.ink, 1)
    g.fillStyle(C.silver, 1)
    ;[-r, r].forEach(x => {
        g.fillRoundedRect(x - 13, top - 14, 26, 14, 4)
        g.strokeRoundedRect(x - 13, top - 14, 26, 14, 4)
    })
    if (belly) {
        g.fillStyle(C.cream, 1)
        g.fillCircle(0, 0, 15)
        g.strokeCircle(0, 0, 15)
    }

    const ey = 20
    if (pose === 'sleep') {
        g.lineStyle(2.5, C.ink, 1)
        ;[-7, 7].forEach(x => {
            g.beginPath()
            g.arc(x, ey - 2, 4, 0.2, Math.PI - 0.2, false)
            g.strokePath()
        })
        return
    }
    if (pose === 'pull') {
        g.lineStyle(2.5, C.ink, 1)
        g.lineBetween(-10, ey - 3, -4, ey)
        g.lineBetween(-10, ey + 3, -4, ey)
        g.lineBetween(10, ey - 3, 4, ey)
        g.lineBetween(10, ey + 3, 4, ey)
        g.fillStyle(C.blush, 0.9)
        g.fillCircle(-16, ey + 4, 4)
        g.fillCircle(16, ey + 4, 4)
        return
    }
    g.fillStyle(C.white, 1)
    g.fillCircle(-7, ey, 5)
    g.fillCircle(7, ey, 5)
    g.lineStyle(2, C.ink, 1)
    g.strokeCircle(-7, ey, 5)
    g.strokeCircle(7, ey, 5)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-4.5, ey + 1, 2.4)
    g.fillCircle(4.5, ey + 1, 2.4)
    g.fillStyle(C.pinkDark, 1)
    g.fillEllipse(5, ey + 10, 7, 6)
}

export interface MagnetView {
    readonly spot: Spot
    readonly rect: GuideRect
    readonly center: Point
    setEdge(on: boolean): void
    pulse(): Promise<void>
    ghostPull(): Promise<void>
    steal(card: IdCard, from: Point, onPlim: () => void): Promise<void>
    sleep(): void
    update(delta: number): void
    destroy(): void
}

export function createMagnet(scene: Phaser.Scene, maze: MazeDef, spot: Spot): MagnetView {
    const center = cellCenter(spot)
    const field = fieldOf(maze).filter(f => {
        const owner = fieldOwner(maze, f)
        return owner && same(owner, spot)
    })
    const ghostFrom =
        field
            .flatMap(f => openNeighbors(maze, f).map(n => ({ f, n })))
            .find(({ n }) => !inField(maze, n)) ?? null
    const rect = spanRect([spot, ...field, ...(ghostFrom ? [ghostFrom.n] : [])], 4)

    const waves = scene.add.graphics().setDepth(DEPTH.field)
    const body = scene.add.graphics()
    const art = scene.textures.exists(PIECES) ? scene.add.image(0, 0, PIECES, ART_FRAME.awake).setScale(MAGNET.artH / MAGNET_ART.h) : null
    const figure = art ?? body
    const container = scene.add.container(center.x, center.y + (art ? MAGNET.artDY : 4), [figure]).setDepth(DEPTH.magnet)
    let pose: MagnetPose = 'awake'
    let belly = false
    const paint = () => {
        if (art) art.setFrame(ART_FRAME[pose])
        else paintMagnet(body, pose, belly)
    }
    paint()
    const idle = scene.tweens.add({ targets: figure, angle: { from: -4, to: 4 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    const power = { v: 0 }
    let edge = false
    let phase = 0
    let sleeping = false
    const leftovers: Phaser.GameObjects.GameObject[] = []

    const setPose = (next: MagnetPose) => {
        pose = next
        paint()
    }

    const paintWaves = () => {
        waves.clear()
        const quiet = sleeping ? 0.35 : 1
        field.forEach(f => {
            const c = cellCenter(f)
            const half = GRID.cell / 2 - 6
            waves.fillStyle(C.lilac, (A.field + (A.fieldEdge - A.field) * power.v) * quiet)
            waves.fillRoundedRect(c.x - half, c.y - half, half * 2, half * 2, 18)
            const angle = Math.atan2(c.y - center.y, c.x - center.x)
            for (let k = 0; k < 3; k++) {
                const span = GRID.cell
                const r = GRID.cell / 2 + ((phase + (k * span) / 3) % span)
                const fade = 1 - (r - GRID.cell / 2) / span
                const spread = 0.5 + power.v * 0.25
                waves.lineStyle(7 + power.v * 3, C.wave, Math.min(1, Math.max(0, fade) * 1.3) * quiet)
                waves.beginPath()
                waves.arc(center.x, center.y, r, angle - spread, angle + spread, false)
                waves.strokePath()
            }
        })
    }

    const toPower = (v: number, duration: number) => {
        scene.tweens.killTweensOf(power)
        return new Promise<void>(resolve =>
            scene.tweens.add({ targets: power, v, duration, ease: 'Sine.easeInOut', onComplete: () => resolve() }),
        )
    }

    return {
        spot,
        rect,
        center,
        setEdge(on) {
            if (on === edge) return
            edge = on
            void toPower(on ? 1 : 0, on ? 600 : 240)
            setPose(on ? 'pull' : 'awake')
        },
        async pulse() {
            await toPower(1, 320)
            await toPower(0, 420)
        },
        async ghostPull() {
            if (!ghostFrom) return
            const start = cellCenter(ghostFrom.n)
            const into = cellCenter(ghostFrom.f)
            const ghost = createIdCard(scene, start.x, start.y, 0.2)
            ghost.container.setAlpha(0).setDepth(DEPTH.flying)
            leftovers.push(ghost.container)
            await FX.to(scene, ghost.container, { alpha: 0.7 }, { duration: 220 })
            await FX.to(scene, ghost.container, { x: into.x, y: into.y }, { duration: 700, ease: 'Sine.easeInOut' })
            setPose('pull')
            void toPower(1, 200)
            await FX.to(scene, ghost.container, { x: center.x, y: center.y - 40, angle: 20 }, { duration: 320, ease: 'Quad.easeIn' })
            setPose('awake')
            void FX.impact(scene, container, 0.2)
            await FX.wait(scene, 700)
            void toPower(0, 300)
            await FX.to(scene, ghost.container, { alpha: 0 }, { duration: 260 })
            ghost.destroy()
        },
        async steal(card, from, onPlim) {
            idle.pause()
            figure.setAngle(0)
            setPose('pull')
            void toPower(1, 160)
            container.setDepth(DEPTH.flying - 1)
            const grow = FX.to(scene, container, { scale: MAGNET.caught }, { duration: 360, ease: 'Back.easeOut' })
            const stuck = { x: center.x + MAGNET.cardDX, y: Math.max(MAGNET.cardTop, center.y - 10) }
            card.container.setPosition(from.x, from.y)
            await Promise.all([
                grow,
                FX.to(scene, card.container, { x: stuck.x, y: stuck.y, scale: 0.3, angle: 360 }, { duration: 560, ease: 'Quad.easeIn' }),
            ])
            card.container.setAngle(0)
            void FX.impact(scene, container, 0.18)
            belly = true
            setPose('awake')
            const gapY = art ? MAGNET.gapY : 0
            const slots = [
                { x: -MAGNET.slot, y: gapY - MAGNET.slot },
                { x: MAGNET.slot, y: gapY - MAGNET.slot },
                { x: -MAGNET.slot, y: gapY + MAGNET.slot },
                { x: MAGNET.slot, y: gapY + MAGNET.slot },
            ]
            for (let i = 0; i < DATA.length; i++) {
                const kind = DATA[i]
                const at = card.datumWorld(kind)
                const copy = createDatum(scene, kind, 0.3)
                copy.setPosition(at.x, at.y).setDepth(DEPTH.flying + 1)
                leftovers.push(copy)
                const to = {
                    x: container.x + slots[i].x * MAGNET.caught,
                    y: container.y + slots[i].y * MAGNET.caught,
                }
                await FX.to(scene, copy, { x: to.x, y: to.y, scale: datumScale(kind, MAGNET.icon * MAGNET.caught) }, { duration: 300 })
                onPlim()
                void FX.ping(scene, to.x, to.y, C.lilac, { radius: 26, duration: 300, depth: DEPTH.flying + 2 })
            }
            void FX.to(scene, container, { angle: { from: -8, to: 8 } }, { duration: 160, yoyo: true, repeat: 3 })
        },
        sleep() {
            sleeping = true
            edge = false
            void toPower(0, 300)
            setPose('sleep')
            idle.pause()
            figure.setAngle(0)
            if (art) {
                scene.tweens.add({ targets: art, scaleY: art.scaleY * 1.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
                return
            }
            const bubble = scene.add
                .circle(center.x + 14, center.y + 20, 4, C.sky2, 0.9)
                .setStrokeStyle(2, C.ink, 0.8)
                .setDepth(DEPTH.magnet + 1)
            leftovers.push(bubble)
            scene.tweens.add({ targets: bubble, scale: 2.4, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        update(delta) {
            phase = (phase + delta * (0.05 + power.v * 0.06)) % GRID.cell
            paintWaves()
        },
        destroy() {
            idle.remove()
            scene.tweens.killTweensOf(power)
            leftovers.forEach(o => o.destroy())
            waves.destroy()
            container.destroy()
        },
    }
}
