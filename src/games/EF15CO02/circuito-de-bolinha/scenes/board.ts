import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BLOCK_CELLS, BOX_CELL, BOX_SHEET, PIECE_CELL, PIECES_SHEET, cellKey } from '../data/files'
import { BELL, BOX, CELL, GHOST, MARBLE, RAMP, SD, TABLE } from '../data/layout'
import { columns, ramps } from '../data/logic'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { PhaseDef, Piece, Rect, Vec } from '../types'
import type { Audio } from './audio'
import type { Stage } from './stage'

const FALL = Phaser.Math.Easing.Quadratic.In
const ROLL = (v: number) => v * (0.6 + 0.4 * v)

export interface From {
    x: number
    y: number
    w: number
}

export interface Board {
    setPhase(phase: PhaseDef): void
    showGhost(): Promise<void>
    ghostRect(): Rect
    bottomOf(piece: Piece): Vec
    place(piece: Piece, from: From): Promise<void>
    fall(piece: Piece, from: From): Promise<void>
    release(from: Vec): Promise<void>
    roll(): Promise<void>
    clear(): void
    showBox(open: boolean): Promise<void>
    boxTop(): Vec
    putAway(): Promise<void>
    destroy(): void
}

export const frameOf = (piece: Piece) =>
    piece.kind === 'ramp' ? PIECE_CELL.rampRight : BLOCK_CELLS[piece.c % BLOCK_CELLS.length]

export function pieceImage(scene: Phaser.Scene, piece: Piece, width: number) {
    const image = scene.add.image(0, 0, PIECES_SHEET.key, cellKey(frameOf(piece))).setOrigin(0.5, 1)
    image.setScale(width / image.width)
    return image
}

export function bellImage(scene: Phaser.Scene, height: number) {
    const image = scene.add.image(0, 0, PIECES_SHEET.key, cellKey(PIECE_CELL.bell)).setOrigin(0.5, 1)
    image.setScale(height / image.height)
    return image
}

export function createBoard(scene: Phaser.Scene, stage: Stage, audio: Audio): Board {
    let phase: PhaseDef | undefined
    let x0 = 0
    const ghosts: Phaser.GameObjects.Image[] = []
    const placed = new Map<string, Phaser.GameObjects.Image>()
    const loose: Phaser.GameObjects.Image[] = []
    const bell = stage.add(bellImage(scene, BELL.h).setVisible(false), SD.bell)
    const marble = stage.add(
        scene.add.image(0, 0, PIECES_SHEET.key, cellKey(PIECE_CELL.marble)).setVisible(false),
        SD.marble,
    )
    marble.setScale((MARBLE.r * 2) / marble.width)
    const box = stage.add(
        scene.add.image(BOX.x, TABLE.top, BOX_SHEET.key, cellKey(BOX_CELL.closed)).setOrigin(0.5, 1).setVisible(false),
        SD.box,
    )
    box.setScale(BOX.w / box.width)

    const bottom = (c: number, r: number): Vec => ({ x: x0 + c * CELL + CELL / 2, y: TABLE.top - r * CELL })

    const dust = (at: Vec) => {
        const p = stage.toScreen(at.x, at.y)
        void FX.sparks(scene, p.x, p.y, { color: C.dust, count: 10, spread: 70, size: 9, duration: 420, depth: 80 })
    }

    const fly = async (piece: Piece, from: From) => {
        const image = stage.add(pieceImage(scene, piece, from.w), SD.fx)
        image.setPosition(from.x, from.y)
        const to = bottom(piece.c, piece.r)
        const full = CELL / image.width
        audio.whoosh()
        await FX.all(
            FX.arcTo(scene, image, to, { height: 130, duration: TIMING.piece }),
            FX.to(scene, image, { scale: full }, { duration: TIMING.piece }),
        )
        image.setDepth(SD.piece + piece.r * 0.01)
        stage.root.sort('depth')
        return image
    }

    const rampRect = (piece: Piece) => {
        const image = placed.get(piece.id)
        const w = image ? image.displayWidth : CELL
        const h = image ? image.displayHeight : CELL * 0.86
        const b = bottom(piece.c, piece.r)
        return { left: b.x - w / 2, top: b.y - h, w, h }
    }

    const hi = (piece: Piece): Vec => {
        const r = rampRect(piece)
        return { x: r.left + RAMP.hi.x * r.w, y: r.top + RAMP.hi.y * r.h - MARBLE.r - 3 }
    }

    const lo = (piece: Piece): Vec => {
        const r = rampRect(piece)
        return { x: r.left + RAMP.lo.x * r.w, y: r.top + RAMP.lo.y * r.h - MARBLE.r - 3 }
    }

    const cup = (): Vec => ({
        x: bell.x + BELL.cup.x * bell.displayWidth,
        y: TABLE.top - BELL.cup.y * bell.displayHeight - MARBLE.r * 0.5,
    })

    const travel = (to: Vec, ms: number, fall: boolean, spin: number) =>
        new Promise<void>(resolve => {
            const from = { x: marble.x, y: marble.y, a: marble.rotation }
            const t = { v: 0 }
            scene.tweens.add({
                targets: t,
                v: 1,
                duration: ms,
                ease: 'Linear',
                onUpdate: () => {
                    const along = fall ? t.v : ROLL(t.v)
                    const down = fall ? FALL(t.v) : along
                    marble.setPosition(Phaser.Math.Linear(from.x, to.x, along), Phaser.Math.Linear(from.y, to.y, down))
                    marble.setRotation(from.a + spin * t.v)
                },
                onComplete: () => resolve(),
            })
        })

    const board: Board = {
        setPhase(next) {
            phase = next
            board.clear()
            ghosts.forEach(g => g.destroy())
            ghosts.length = 0
            x0 = TABLE.cx - (columns(next) * CELL) / 2
            next.pieces.forEach(piece => {
                const at = bottom(piece.c, piece.r)
                const rim = stage.add(pieceImage(scene, piece, CELL + GHOST.rim * 2), SD.ghost)
                rim.setPosition(at.x, at.y + GHOST.rim).setTintFill(C.headerLine).setAlpha(0).setData('alpha', GHOST.rimAlpha)
                const fill = stage.add(pieceImage(scene, piece, CELL), SD.ghost)
                fill.setPosition(at.x, at.y).setTintFill(C.white).setAlpha(0).setData('alpha', GHOST.fillAlpha)
                ghosts.push(rim, fill)
            })
            const b = bottom(next.bell, 0)
            bell.setPosition(b.x, b.y).setVisible(true).setAlpha(1).setScale(BELL.h / bell.height)
        },
        async showGhost() {
            audio.pop()
            await FX.all(
                ...ghosts.map((g, i) =>
                    FX.wait(scene, Math.floor(i / 2) * 90).then(() => {
                        const s = g.scale
                        g.setScale(s * 0.8)
                        return FX.to(scene, g, { alpha: g.getData('alpha') as number, scale: s }, { duration: TIMING.ghost, ease: 'Back.easeOut' })
                    }),
                ),
            )
        },
        ghostRect() {
            if (!phase) return { x: TABLE.cx, y: TABLE.top - CELL, w: CELL * 3, h: CELL * 2 }
            const cols = columns(phase)
            const rows = Math.max(...phase.pieces.map(p => p.r)) + 1
            const w = cols * CELL
            const h = rows * CELL
            return stage.toScreenRect({ x: x0 + w / 2, y: TABLE.top - h / 2, w: w + 20, h: h + 20 })
        },
        bottomOf: piece => bottom(piece.c, piece.r),
        async place(piece, from) {
            const image = await fly(piece, from)
            placed.set(piece.id, image)
            audio.snap()
            dust(bottom(piece.c, piece.r))
            await FX.impact(scene, image, 0.12)
        },
        async fall(piece, from) {
            const image = await fly(piece, from)
            loose.push(image)
            audio.wobble()
            for (const a of [9, -8, 7]) await FX.to(scene, image, { angle: a }, { duration: TIMING.wobble, ease: 'Sine.easeInOut' })
            audio.tumble()
            image.setDepth(SD.fx)
            stage.root.sort('depth')
            await FX.all(
                FX.to(scene, image, { angle: 84 }, { duration: TIMING.fall * 0.45, ease: 'Quad.easeIn' }),
                FX.to(scene, image, { x: image.x + 70 }, { duration: TIMING.fall, ease: 'Quad.easeOut' }),
                FX.to(scene, image, { y: TABLE.top - CELL * 0.46 }, { duration: TIMING.fall, ease: 'Bounce.easeOut' }),
            )
            dust({ x: image.x, y: image.y })
        },
        async release(from) {
            if (!phase) return
            const start = hi(ramps(phase)[0])
            marble.setPosition(from.x, from.y).setVisible(true).setAlpha(1).setRotation(0)
            marble.setScale(((MARBLE.r * 2) / marble.width) * 0.4)
            await FX.to(scene, marble, { scale: (MARBLE.r * 2) / marble.width }, { duration: 220, ease: 'Back.easeOut' })
            await FX.arcTo(scene, marble, start, { height: 60, duration: TIMING.hand })
        },
        async roll() {
            if (!phase) return
            const path = ramps(phase)
            for (const [i, ramp] of path.entries()) {
                const a = hi(ramp)
                const b = lo(ramp)
                if (i > 0) {
                    const drop = Math.max(40, a.y - marble.y)
                    audio.drop()
                    await travel(a, TIMING.drop * Math.sqrt(drop / 100), true, 1.2)
                }
                const len = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y)
                const ms = Math.max(TIMING.rollMin, len * TIMING.rollPerPx)
                audio.roll(ms)
                await travel(b, ms, false, len / MARBLE.r)
            }
            const end = cup()
            audio.drop()
            await travel(end, TIMING.drop * 1.2, true, 2)
            audio.bell()
            const at = stage.toScreen(bell.x, bell.y - bell.displayHeight * 0.6)
            void FX.sparks(scene, at.x, at.y, { color: C.gold, count: 20, spread: 150, size: 11, depth: 80 })
            const bx = bell.x
            await FX.to(scene, bell, { x: bx + 5 }, { duration: 60, yoyo: true, repeat: 5 })
            bell.x = bx
        },
        clear() {
            placed.forEach(image => image.destroy())
            placed.clear()
            loose.forEach(image => image.destroy())
            loose.length = 0
            scene.tweens.killTweensOf(marble)
            marble.setVisible(false)
        },
        async showBox(open) {
            box.setFrame(cellKey(open ? BOX_CELL.open : BOX_CELL.closed))
            if (box.visible) {
                if (open) audio.open()
                await FX.impact(scene, box, 0.1)
                return
            }
            box.setVisible(true).setAlpha(1)
            await FX.popIn(scene, box, { from: 0.6, duration: 320 })
        },
        boxTop: () => ({ x: box.x, y: box.y - box.displayHeight * 0.7 }),
        async putAway() {
            const top = board.boxTop()
            const images = [...placed.values(), ...loose]
            placed.clear()
            loose.length = 0
            await FX.all(
                ...images.map((image, i) =>
                    FX.wait(scene, i * 80).then(async () => {
                        image.setAngle(0)
                        await FX.all(
                            FX.arcTo(scene, image, top, { height: 90, duration: 480 }),
                            FX.to(scene, image, { scale: image.scale * 0.4, alpha: 0 }, { duration: 480, ease: 'Quad.easeIn' }),
                        )
                        image.destroy()
                    }),
                ),
            )
        },
        destroy() {
            board.clear()
            ghosts.forEach(g => g.destroy())
            bell.destroy()
            marble.destroy()
            box.destroy()
        },
    }
    return board
}
