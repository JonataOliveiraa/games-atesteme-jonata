import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellOf, magnetsOf, nicheDir } from '../data/levels'
import { cellCenter, DEPTH, GRID } from '../data/layout'
import { C, LINE } from '../data/theme'
import type { Dir, MazeDef, Spot } from '../types'
import { HEDGE_ART, HEDGE_CELL, HEDGES } from '../data/files'
import { bake, unbake } from './bake'

type G = Phaser.GameObjects.Graphics

const M = 2
const R = 16

const hash = (c: number, r: number) => {
    const s = Math.sin(c * 91.7 + r * 47.3) * 9631.13
    return s - Math.floor(s)
}

const isHedge = (maze: MazeDef, s: Spot) => {
    const k = cellOf(maze, s)
    return k === '#' || k === 'M'
}

function paintHedge(g: G, maze: MazeDef, s: Spot) {
    const { x, y } = cellCenter(s)
    const size = GRID.cell
    const half = size / 2
    const up = isHedge(maze, { c: s.c, r: s.r - 1 })
    const down = isHedge(maze, { c: s.c, r: s.r + 1 })
    const left = isHedge(maze, { c: s.c - 1, r: s.r })
    const right = isHedge(maze, { c: s.c + 1, r: s.r })
    const corner = {
        tl: !up && !left ? R : 0,
        tr: !up && !right ? R : 0,
        bl: !down && !left ? R : 0,
        br: !down && !right ? R : 0,
    }
    const l = x - half + (left ? 0 : M)
    const t = y - half + (up ? 0 : M)
    const w = size - (left ? 0 : M) - (right ? 0 : M)
    const h = size - (up ? 0 : M) - (down ? 0 : M)
    g.fillStyle(C.hedgeDark, 1)
    g.fillRoundedRect(l, t, w, h, corner)
    g.fillStyle(C.hedge, 1)
    g.fillRoundedRect(l, t, w, h - (down ? 0 : 12), { ...corner, bl: down ? 0 : corner.bl, br: down ? 0 : corner.br })
    g.fillStyle(C.hedgeTop, 1)
    for (let k = 0; k < 4; k++) {
        const bx = x - 26 + (k % 2) * 46 + hash(s.c, s.r + k) * 10
        const by = y - 24 + Math.floor(k / 2) * 38 + hash(s.r + k, s.c) * 8
        g.fillCircle(bx, by, 13)
    }
    g.fillStyle(C.hedgeLight, 1)
    g.fillCircle(x - 18, y - 20, 6)
    g.fillCircle(x + 22, y + 10, 5)

    g.lineStyle(LINE, C.ink, 0.85)
    const r = l + w
    const b = t + h
    if (!up) g.lineBetween(l + corner.tl, t, r - corner.tr, t)
    if (!down) g.lineBetween(l + corner.bl, b, r - corner.br, b)
    if (!left) g.lineBetween(l, t + corner.tl, l, b - corner.bl)
    if (!right) g.lineBetween(r, t + corner.tr, r, b - corner.br)
    const arc = (cx: number, cy: number, from: number) => {
        g.beginPath()
        g.arc(cx, cy, R, from, from + Math.PI / 2, false)
        g.strokePath()
    }
    if (corner.tl) arc(l + R, t + R, Math.PI)
    if (corner.tr) arc(r - R, t + R, -Math.PI / 2)
    if (corner.br) arc(r - R, b - R, 0)
    if (corner.bl) arc(l + R, b - R, Math.PI / 2)

    const pick = hash(s.c, s.r)
    if (pick > 0.55) {
        const petal = pick > 0.78 ? C.white : C.pink
        for (let k = 0; k < 3; k++) {
            const fx = x - 22 + k * 20 + hash(k, s.c) * 6
            const fy = y - 14 + hash(s.r, k) * 18
            g.fillStyle(petal, 1)
            g.fillCircle(fx, fy, 5)
            g.fillStyle(C.yellow, 1)
            g.fillCircle(fx, fy, 2)
        }
    }
}

const NICHE_OFFSET: Record<Dir, { x: number; y: number; w: number; h: number }> = {
    up: { x: 0, y: -8, w: 64, h: 60 },
    down: { x: 0, y: 8, w: 64, h: 60 },
    left: { x: -8, y: 0, w: 60, h: 64 },
    right: { x: 8, y: 0, w: 60, h: 64 },
}

function paintNiche(g: G, maze: MazeDef, s: Spot) {
    const { x, y } = cellCenter(s)
    const o = NICHE_OFFSET[nicheDir(maze, s)]
    g.fillStyle(C.niche, 1)
    g.fillRoundedRect(x + o.x - o.w / 2, y + o.y - o.h / 2, o.w, o.h, 24)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeRoundedRect(x + o.x - o.w / 2, y + o.y - o.h / 2, o.w, o.h, 24)
}

export interface MazeView {
    fadeIn(): Promise<void>
    fadeOut(): Promise<void>
    destroy(): void
}

const NICHE_ANGLE: Record<Dir, number> = { down: 0, left: 90, up: 180, right: -90 }
const HEDGE_PICK = [HEDGE_CELL.a, HEDGE_CELL.d, HEDGE_CELL.a, HEDGE_CELL.b, HEDGE_CELL.d, HEDGE_CELL.c, HEDGE_CELL.a]

function artHedges(scene: Phaser.Scene, maze: MazeDef): Phaser.GameObjects.Container {
    const scale = (GRID.cell + 6) / HEDGE_ART.w
    const originY = (HEDGE_ART.top + HEDGE_ART.bottom) / 2 / 256
    const blocks: Phaser.GameObjects.Image[] = []
    maze.rows.forEach((row, r) =>
        [...row].forEach((k, c) => {
            if (!isHedge(maze, { c, r })) return
            const { x, y } = cellCenter({ c, r })
            const niche = k === 'M'
            const frame = niche ? HEDGE_CELL.niche : HEDGE_PICK[Math.floor(hash(c, r) * HEDGE_PICK.length)]
            const block = scene.add.image(x, y, HEDGES, String(frame)).setOrigin(0.5, originY).setScale(scale)
            if (niche) block.setAngle(NICHE_ANGLE[nicheDir(maze, { c, r })])
            blocks.push(block)
        }),
    )
    return scene.add.container(0, 0, blocks)
}

export function createMazeView(scene: Phaser.Scene, maze: MazeDef): MazeView {
    const art = scene.textures.exists(HEDGES) ? artHedges(scene, maze).setDepth(DEPTH.hedge) : null
    const g =
        art ??
        bake(scene, `labirinto-sebes-${maze.id}`, paint => {
            maze.rows.forEach((row, r) =>
                [...row].forEach((_, c) => {
                    if (isHedge(maze, { c, r })) paintHedge(paint, maze, { c, r })
                }),
            )
            magnetsOf(maze).forEach(m => paintNiche(paint, maze, m))
        }).setDepth(DEPTH.hedge)

    return {
        fadeIn() {
            g.setAlpha(0)
            return FX.to(scene, g, { alpha: 1 }, { duration: 360 })
        },
        fadeOut() {
            return FX.to(scene, g, { alpha: 0 }, { duration: 320 })
        },
        destroy() {
            if (art) art.destroy()
            else unbake(scene, g as Phaser.GameObjects.Image)
        },
    }
}
