import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BLOCK_CELLS, BOX_CELL, BOX_SHEET, PIECE_CELL, PIECES_SHEET, cellKey } from '../data/files'
import { BELL, BOX, CAT, CELL, GHOST, MARBLE, RAMP, SD, TABLE, cellFor } from '../data/layout'
import { columns, expected, height, spot } from '../data/logic'
import { C, CSS, FONT } from '../data/theme'
import { dashedRoundRect } from './art'
import { TIMING } from '../data/timing'
import type { Path, PhaseDef, Piece, Rect, Vec } from '../types'
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
    cell(): number
    showGhost(): Promise<void>
    ghostRect(): Rect
    bellRect(c: number): Rect
    catSpot(c: number): Vec
    bottomOf(piece: Piece): Vec
    place(piece: Piece, from: From): Promise<void>
    fall(piece: Piece, from: From, land?: number): Promise<void>
    topple(piece: Piece): Promise<void>
    flash(piece: Piece): Promise<void>
    remove(piece: Piece, to: Vec): Promise<void>
    release(from: Vec, path: Path): Promise<void>
    roll(path: Path, cat?: Vec): Promise<void>
    spill(): Promise<void>
    stow(): void
    clear(): void
    showBox(open: boolean): Promise<void>
    boxTop(): Vec
    putAway(): Promise<void>
    destroy(): void
}

export const frameOf = (piece: Piece) =>
    piece.kind === 'ramp' ? (piece.left ? PIECE_CELL.rampLeft : PIECE_CELL.rampRight) : BLOCK_CELLS[piece.c % BLOCK_CELLS.length]

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

const ASK_KEY = 'cdb-ask'

export function askImage(scene: Phaser.Scene, width: number) {
    if (!scene.textures.exists(ASK_KEY)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(C.white, 0.7)
        g.fillRoundedRect(14, 14, 228, 228, 26)
        g.lineStyle(12, C.headerLine, 1)
        dashedRoundRect(g, 14, 14, 228, 228, 26, 30, 20)
        g.generateTexture(ASK_KEY, 256, 256)
        g.destroy()
    }
    const image = scene.add.image(0, 0, ASK_KEY).setOrigin(0.5, 1)
    image.setScale(width / image.width)
    return image
}

export function askMark(scene: Phaser.Scene, size: number) {
    return scene.add
        .text(0, 0, '?', { fontFamily: FONT.black, fontSize: `${Math.max(17, Math.round(size))}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
}

export const bellFlipped = (phase: PhaseDef, c: number) => expected(phase).some(p => p.c > c)

export function createBoard(scene: Phaser.Scene, stage: Stage, audio: Audio): Board {
    let phase: PhaseDef | undefined
    let x0 = 0
    let size = CELL
    const ghosts = new Map<string, Phaser.GameObjects.Image[]>()
    const marks: Phaser.GameObjects.Text[] = []
    const placed = new Map<string, Phaser.GameObjects.Image>()
    const loose: Phaser.GameObjects.Image[] = []
    const bells = new Map<number, Phaser.GameObjects.Image>()
    const marble = stage.add(
        scene.add.image(0, 0, PIECES_SHEET.key, cellKey(PIECE_CELL.marble)).setVisible(false),
        SD.marble,
    )
    const box = stage.add(
        scene.add.image(BOX.x, TABLE.top, BOX_SHEET.key, cellKey(BOX_CELL.closed)).setOrigin(0.5, 1).setVisible(false),
        SD.box,
    )
    box.setScale(BOX.w / box.width)

    const k = () => size / CELL
    const radius = () => MARBLE.r * k()
    const marbleScale = () => (radius() * 2) / marble.width

    const bottom = (c: number, r: number): Vec => ({ x: x0 + c * size + size / 2, y: TABLE.top - r * size })

    const dust = (at: Vec) => {
        const p = stage.toScreen(at.x, at.y)
        void FX.sparks(scene, p.x, p.y, { color: C.dust, count: 10, spread: 70, size: 9, duration: 420, depth: 80 })
    }

    const fly = async (piece: Piece, from: From, row = piece.r) => {
        const image = stage.add(pieceImage(scene, piece, from.w), SD.fx)
        image.setPosition(from.x, from.y)
        const to = bottom(piece.c, row)
        const full = size / image.width
        audio.whoosh()
        await FX.all(
            FX.arcTo(scene, image, to, { height: 130, duration: TIMING.piece }),
            FX.to(scene, image, { scale: full }, { duration: TIMING.piece }),
        )
        image.setDepth(SD.piece + row * 0.01)
        stage.root.sort('depth')
        return image
    }

    const tumble = async (image: Phaser.GameObjects.Image, away: number) => {
        audio.wobble()
        for (const a of [9, -8, 7]) await FX.to(scene, image, { angle: a }, { duration: TIMING.wobble, ease: 'Sine.easeInOut' })
        audio.tumble()
        image.setDepth(SD.fx)
        stage.root.sort('depth')
        await FX.all(
            FX.to(scene, image, { angle: 84 * away }, { duration: TIMING.fall * 0.45, ease: 'Quad.easeIn' }),
            FX.to(scene, image, { x: image.x + 70 * k() * away }, { duration: TIMING.fall, ease: 'Quad.easeOut' }),
            FX.to(scene, image, { y: TABLE.top - size * 0.46 }, { duration: TIMING.fall, ease: 'Bounce.easeOut' }),
        )
        dust({ x: image.x, y: image.y })
    }

    const rampRect = (piece: Piece) => {
        const image = placed.get(piece.id)
        const w = image ? image.displayWidth : size
        const h = image ? image.displayHeight : size * 0.86
        const b = bottom(piece.c, piece.r)
        return { left: b.x - w / 2, top: b.y - h, w, h }
    }

    const along = (piece: Piece, at: { x: number; y: number }): Vec => {
        const r = rampRect(piece)
        const x = piece.left ? 1 - at.x : at.x
        return { x: r.left + x * r.w, y: r.top + at.y * r.h - radius() * RAMP.sink }
    }

    const groove = (piece: Piece) => RAMP.groove.map(p => along(piece, p))

    const slide = (points: Vec[], ms: number, spin: number) =>
        new Promise<void>(resolve => {
            const lengths = points.slice(1).map((p, i) => Phaser.Math.Distance.Between(points[i].x, points[i].y, p.x, p.y))
            const total = lengths.reduce((a, b) => a + b, 0) || 1
            const a0 = marble.rotation
            const t = { v: 0 }
            scene.tweens.add({
                targets: t,
                v: 1,
                duration: ms,
                ease: 'Linear',
                onUpdate: () => {
                    let d = ROLL(t.v) * total
                    let i = 0
                    while (i < lengths.length - 1 && d > lengths[i]) d -= lengths[i++]
                    const k = Math.min(1, d / (lengths[i] || 1))
                    marble.setPosition(
                        Phaser.Math.Linear(points[i].x, points[i + 1].x, k),
                        Phaser.Math.Linear(points[i].y, points[i + 1].y, k),
                    )
                    marble.setRotation(a0 + spin * t.v)
                },
                onComplete: () => resolve(),
            })
        })

    const cup = (c: number): Vec => {
        const bell = bells.get(c)
        const b = bottom(c, 0)
        if (!bell) return b
        const side = bell.flipX ? -1 : 1
        return { x: bell.x + side * BELL.cup.x * bell.displayWidth, y: TABLE.top - BELL.cup.y * bell.displayHeight - radius() * 0.5 }
    }

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
                    const go = fall ? t.v : ROLL(t.v)
                    const down = fall ? FALL(t.v) : go
                    marble.setPosition(Phaser.Math.Linear(from.x, to.x, go), Phaser.Math.Linear(from.y, to.y, down))
                    marble.setRotation(from.a + spin * t.v)
                },
                onComplete: () => resolve(),
            })
        })

    const askAt = (piece: Piece) => !!phase?.choice && phase.choice.c === piece.c && phase.choice.r === piece.r

    const showAsk = (on: boolean) => {
        if (!phase?.choice) return
        const list = [...(ghosts.get(spot(phase.choice.c, phase.choice.r)) ?? []), ...marks]
        list.forEach(g => {
            scene.tweens.killTweensOf(g)
            g.setAlpha(on ? (g.getData('alpha') as number) : 0)
        })
    }

    const clearBells = () => {
        bells.forEach(b => {
            scene.tweens.killTweensOf(b)
            b.destroy()
        })
        bells.clear()
    }

    const board: Board = {
        setPhase(next) {
            phase = next
            board.clear()
            ghosts.forEach(list => list.forEach(g => g.destroy()))
            ghosts.clear()
            marks.forEach(m => m.destroy())
            marks.length = 0
            clearBells()
            size = cellFor(height(next))
            const width = columns(next) * size
            x0 = Math.max(TABLE.cx - width / 2, BOX.x + BOX.w / 2 + 16)
            marble.setScale(marbleScale())
            next.model.forEach(piece => {
                const at = bottom(piece.c, piece.r)
                const rim = stage.add(pieceImage(scene, piece, size + GHOST.rim * 2), SD.ghost)
                rim.setPosition(at.x, at.y + GHOST.rim).setTintFill(C.headerLine).setAlpha(0).setData('alpha', GHOST.rimAlpha)
                const fill = stage.add(pieceImage(scene, piece, size), SD.ghost)
                fill.setPosition(at.x, at.y).setTintFill(C.white).setAlpha(0).setData('alpha', GHOST.fillAlpha).setData('fill', true)
                ghosts.set(spot(piece.c, piece.r), [rim, fill])
            })
            if (next.choice) {
                const at = bottom(next.choice.c, next.choice.r)
                const ask = stage.add(askImage(scene, size), SD.ghost)
                ask.setPosition(at.x, at.y).setAlpha(0).setData('alpha', GHOST.choiceAlpha).setData('fill', true)
                ghosts.set(spot(next.choice.c, next.choice.r), [ask])
                const mark = stage.add(askMark(scene, size * (GHOST.ask / CELL)), SD.ghost)
                mark.setPosition(at.x, at.y - size / 2).setAlpha(0).setData('alpha', 1)
                marks.push(mark)
            }
            next.bells.forEach(c => {
                const b = bottom(c, 0)
                const bell = stage.add(bellImage(scene, BELL.h * k()), SD.bell)
                bell.setPosition(b.x, b.y).setFlipX(bellFlipped(next, c))
                bells.set(c, bell)
            })
        },
        cell: () => size,
        async showGhost() {
            audio.pop()
            const list: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Text> = [...[...ghosts.values()].flat(), ...marks]
            await FX.all(
                ...list.map((g, i) =>
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
            const w = columns(phase) * size
            const h = height(phase) * size
            return stage.toScreenRect({ x: x0 + w / 2, y: TABLE.top - h / 2, w: w + 20, h: h + 20 })
        },
        bellRect(c) {
            const b = bottom(c, 0)
            const h = BELL.h * k() + 20
            return stage.toScreenRect({ x: b.x, y: b.y - h / 2, w: size * 1.3, h: h + 10 })
        },
        catSpot(c) {
            const b = bottom(c, 0)
            const out = phase && bellFlipped(phase, c) ? -1 : 1
            return { x: b.x + out * CAT.out * size, y: b.y }
        },
        bottomOf: piece => bottom(piece.c, piece.r),
        async place(piece, from) {
            const image = await fly(piece, from)
            placed.set(piece.id, image)
            if (askAt(piece)) showAsk(false)
            audio.snap()
            dust(bottom(piece.c, piece.r))
            await FX.impact(scene, image, 0.12)
        },
        async fall(piece, from, land = piece.r) {
            const image = await fly(piece, from, land)
            loose.push(image)
            if (land !== piece.r) {
                audio.snap()
                await FX.impact(scene, image, 0.18)
            }
            await tumble(image, piece.left ? -1 : 1)
        },
        async topple(piece) {
            const image = placed.get(piece.id)
            if (!image) return
            placed.delete(piece.id)
            loose.push(image)
            await tumble(image, 1)
        },
        async flash(piece) {
            const list = ghosts.get(spot(piece.c, piece.r)) ?? []
            const fills = list.filter(g => g.getData('fill'))
            fills.forEach(g => g.setTintFill(C.butter))
            await FX.all(...fills.map(g => FX.to(scene, g, { alpha: 1 }, { duration: 220, yoyo: true, repeat: 2 })))
            fills.forEach(g => (g.texture.key === ASK_KEY ? g.clearTint() : g.setTintFill(C.white)).setAlpha(g.getData('alpha') as number))
        },
        async remove(piece, to) {
            const image = placed.get(piece.id)
            if (!image) return
            placed.delete(piece.id)
            if (askAt(piece)) showAsk(true)
            audio.whoosh()
            image.setDepth(SD.fx)
            stage.root.sort('depth')
            await FX.all(
                FX.arcTo(scene, image, to, { height: 90, duration: TIMING.swap }),
                FX.to(scene, image, { scale: image.scale * 0.4, alpha: 0 }, { duration: TIMING.swap, ease: 'Quad.easeIn' }),
            )
            image.destroy()
        },
        async release(from, path) {
            const start = groove(path.ramps[0])[0]
            scene.tweens.killTweensOf(marble)
            marble.setPosition(from.x, from.y).setVisible(true).setAlpha(1).setRotation(0)
            marble.setScale(marbleScale() * 0.4)
            await FX.to(scene, marble, { scale: marbleScale() }, { duration: 220, ease: 'Back.easeOut' })
            await FX.arcTo(scene, marble, start, { height: 60, duration: TIMING.hand })
        },
        async roll(path, cat) {
            for (const [i, ramp] of path.ramps.entries()) {
                const points = groove(ramp)
                const spin = ramp.left ? -1 : 1
                if (i > 0) {
                    const drop = Math.max(40, points[0].y - marble.y)
                    audio.drop()
                    await travel(points[0], TIMING.drop * Math.sqrt(drop / 100), true, 1.2 * spin)
                }
                const len = points.slice(1).reduce((sum, p, k) => sum + Phaser.Math.Distance.Between(points[k].x, points[k].y, p.x, p.y), 0)
                const ms = Math.max(TIMING.rollMin, len * TIMING.rollPerPx)
                audio.roll(ms)
                await slide(points, ms, (len / radius()) * spin)
            }
            audio.drop()
            if (cat) {
                await travel(cat, TIMING.drop * 1.1, true, 2)
                return
            }
            await travel(cup(path.bell), TIMING.drop * 1.2, true, 2)
            const bell = bells.get(path.bell)
            if (!bell) return
            audio.bell()
            const at = stage.toScreen(bell.x, bell.y - bell.displayHeight * 0.6)
            void FX.sparks(scene, at.x, at.y, { color: C.gold, count: 20, spread: 150, size: 11, depth: 80 })
            const bx = bell.x
            await FX.to(scene, bell, { x: bx + 5 }, { duration: 60, yoyo: true, repeat: 5 })
            bell.x = bx
        },
        async spill() {
            const away = marble.x > TABLE.cx ? 1 : -1
            audio.drop()
            await FX.arcTo(scene, marble, { x: marble.x + away * 90, y: TABLE.top - 30 }, { height: 70, duration: 360 })
            audio.tumble()
            await FX.all(
                FX.to(scene, marble, { x: marble.x + away * 60, rotation: marble.rotation + away * 6 }, { duration: 520, ease: 'Quad.easeOut' }),
                FX.to(scene, marble, { y: TABLE.top + 150 }, { duration: 520, ease: 'Bounce.easeOut' }),
            )
        },
        stow() {
            scene.tweens.killTweensOf(marble)
            marble.setVisible(false)
        },
        clear() {
            placed.forEach(image => image.destroy())
            placed.clear()
            loose.forEach(image => image.destroy())
            loose.length = 0
            board.stow()
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
            board.stow()
            showAsk(true)
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
            ghosts.forEach(list => list.forEach(g => g.destroy()))
            marks.forEach(m => m.destroy())
            clearBells()
            marble.destroy()
            box.destroy()
        },
    }
    return board
}
