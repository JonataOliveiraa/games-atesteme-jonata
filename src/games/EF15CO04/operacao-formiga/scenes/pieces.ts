import Phaser from 'phaser'
import { FRUIT_SHEET, cellKey } from '../data/files'
import { CRUMB, FRUITS, FRUIT_CELL, MAX_PIECES, fruitPoly } from '../data/fruits'
import { area, bounds, centroid, crosses, split } from '../data/geometry'
import { CUT, MAP, PLATE, WD } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import { FX } from '../../../../shared/effects/FX'
import type { FruitDef, FruitKind, Poly, Rect, Vec } from '../types'
import type { View } from './view'

/**
 * OS PEDAÇOS. Cada um guarda o polígono nas coordenadas da fruta INTEIRA (px
 * de arte, centro em 0, 0). É isso que faz ele cair, no prato, exatamente no
 * lugar de onde saiu. No mundo ele aparece a `MAP.scale`, com o centro de
 * massa em `pos`.
 */

export type PieceState = 'tree' | 'ground' | 'carried' | 'placed' | 'gone'

export interface Piece {
    id: number
    poly: Poly
    c: Vec
    area: number
    pos: Vec
    state: PieceState
    stuck: boolean
    img: Phaser.GameObjects.Image
    key: string
}

export type Cut =
    | { kind: 'cut'; made: Piece[]; pairs: { from: number; kids: Piece[] }[] }
    | { kind: 'crumb' }
    | { kind: 'full' }
    | { kind: 'miss' }

export interface Pieces {
    start(kind: FruitKind, at: Vec): void
    kind(): FruitKind
    def(): FruitDef
    whole(): number
    all(): Piece[]
    live(): Piece[]
    /** Corta com o traço `a`→`b` (no mundo) os pedaços da lista. */
    cut(targets: Piece[], a: Vec, b: Vec): Cut
    /** Os pedaços que saíram da mesma origem do corte (para o modo de corte da fresta). */
    raise(list: Piece[], on: boolean): void
    spread(list: Piece[], from: Vec): Promise<void>
    nearest(x: number, y: number): Piece | undefined
    carry(p: Piece): void
    follow(p: Piece, x: number, y: number, depth: number): void
    drop(p: Piece, at: Vec): Promise<void>
    place(p: Piece): Promise<void>
    blow(p: Piece): Promise<void>
    join(): Promise<void>
    worldOf(local: Vec): Vec
    rectOf(list: Piece[]): Rect
    hintFor(p: Piece): { a: Vec; b: Vec }
    sort(): void
    clear(): void
    destroy(): void
}

let serial = 0

export function createPieces(scene: Phaser.Scene, view: View): Pieces {
    let list: Piece[] = []
    let fruit: FruitKind = 'morango'
    let origin: Vec = { x: 0, y: 0 }
    let whole = 1
    let ghost: Phaser.GameObjects.Image | undefined
    let ghostKey = ''

    const s = MAP.scale

    /** Desenha a fruta recortada pelo polígono, com polpa nas bordas de corte. */
    const paint = (poly: Poly): { key: string; ox: number; oy: number } => {
        const def = FRUITS[fruit]
        const b = bounds(poly)
        const pad = 10
        const w = Math.ceil(b.w + pad * 2)
        const h = Math.ceil(b.h + pad * 2)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        const dx = pad - b.x
        const dy = pad - b.y
        if (ctx) {
            ctx.save()
            ctx.beginPath()
            poly.forEach((v, i) => (i ? ctx.lineTo(v.x + dx, v.y + dy) : ctx.moveTo(v.x + dx, v.y + dy)))
            ctx.closePath()
            ctx.clip()
            const tex = scene.textures.get(FRUIT_SHEET.key)
            const frame = tex.get(cellKey(FRUIT_CELL[fruit]))
            const src = tex.getSourceImage() as HTMLImageElement | HTMLCanvasElement
            const cw = FRUIT_SHEET.cellW
            ctx.drawImage(src, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, dx - cw / 2, dy - cw / 2, cw, cw)
            const edge = (width: number, color: number) => {
                ctx.lineWidth = width
                ctx.lineCap = 'round'
                ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`
                poly.forEach((v, i) => {
                    if (!v.cut) return
                    const n = poly[(i + 1) % poly.length]
                    ctx.beginPath()
                    ctx.moveTo(v.x + dx, v.y + dy)
                    ctx.lineTo(n.x + dx, n.y + dy)
                    ctx.stroke()
                })
            }
            edge(34, def.pulp)
            edge(12, def.pulpDark)
            edge(8, C.line)
            ctx.restore()
        }
        const key = `of-piece-${++serial}`
        scene.textures.addCanvas(key, canvas)
        return { key, ox: dx, oy: dy }
    }

    const make = (poly: Poly, pos: Vec, state: PieceState): Piece => {
        const c = centroid(poly)
        const art = paint(poly)
        const w = scene.textures.get(art.key).getSourceImage().width
        const h = scene.textures.get(art.key).getSourceImage().height
        const img = scene.add.image(pos.x, pos.y, art.key)
        img.setOrigin((c.x + art.ox) / w, (c.y + art.oy) / h).setScale(s)
        view.add(img, WD.actor + pos.y)
        const p: Piece = { id: ++serial, poly, c, area: area(poly), pos: { ...pos }, state, stuck: false, img, key: art.key }
        list.push(p)
        return p
    }

    const kill = (p: Piece) => {
        scene.tweens.killTweensOf(p.img)
        p.img.destroy()
        if (scene.textures.exists(p.key)) scene.textures.remove(p.key)
        p.state = 'gone'
    }

    const toLocal = (p: Piece, w: Vec): Vec => ({ x: p.c.x + (w.x - p.pos.x) / s, y: p.c.y + (w.y - p.pos.y) / s })

    const clearGhost = () => {
        ghost?.destroy()
        ghost = undefined
        if (ghostKey && scene.textures.exists(ghostKey)) scene.textures.remove(ghostKey)
        ghostKey = ''
    }

    const pieces: Pieces = {
        start(kind, at) {
            pieces.clear()
            fruit = kind
            origin = { ...at }
            const poly = fruitPoly(FRUITS[kind])
            whole = area(poly)
            const p = make(poly, { x: at.x, y: at.y }, 'tree')
            const c = p.c
            p.pos = { x: at.x + c.x * s, y: at.y + c.y * s }
            p.img.setPosition(p.pos.x, p.pos.y)
        },
        kind: () => fruit,
        def: () => FRUITS[fruit],
        whole: () => whole,
        all: () => list,
        live: () => list.filter(p => p.state !== 'gone'),
        cut(targets, a, b) {
            const made: Piece[] = []
            const pairs: { from: number; kids: Piece[] }[] = []
            let crumb = false
            let count = pieces.live().length
            let full = false
            for (const p of [...targets]) {
                if (p.state === 'gone') continue
                const la = toLocal(p, a)
                const lb = toLocal(p, b)
                if (!crosses(p.poly, la, lb)) continue
                const parts = split(p.poly, la, lb)
                if (!parts) continue
                if (area(parts[0]) < whole * CRUMB || area(parts[1]) < whole * CRUMB) {
                    crumb = true
                    continue
                }
                if (count + 1 > MAX_PIECES) {
                    full = true
                    continue
                }
                count += 1
                // a normal da reta, para afastar os dois lados
                const len = Math.hypot(lb.x - la.x, lb.y - la.y) || 1
                const nx = -(lb.y - la.y) / len
                const ny = (lb.x - la.x) / len
                const kids = parts.map(poly => {
                    const c = centroid(poly)
                    const side = (c.x - la.x) * nx + (c.y - la.y) * ny > 0 ? 1 : -1
                    const pos = { x: p.pos.x + (c.x - p.c.x) * s, y: p.pos.y + (c.y - p.c.y) * s }
                    const kid = make(poly, pos, p.state)
                    kid.stuck = p.stuck
                    kid.img.setDepth(p.img.depth)
                    const to = { x: pos.x + nx * side * CUT.part * s, y: pos.y + ny * side * CUT.part * s }
                    kid.pos = to
                    scene.tweens.add({ targets: kid.img, x: to.x, y: to.y, duration: TIMING.crunch, ease: 'Back.easeOut' })
                    return kid
                })
                kill(p)
                made.push(...kids)
                pairs.push({ from: p.id, kids })
            }
            list = list.filter(p => p.state !== 'gone')
            view.restack()
            if (made.length) return { kind: 'cut', made, pairs }
            if (full) return { kind: 'full' }
            return crumb ? { kind: 'crumb' } : { kind: 'miss' }
        },
        raise(targets, on) {
            targets.forEach(p => p.img.setDepth(on ? WD.cutting + p.pos.y * 0.01 : WD.actor + p.pos.y))
            view.restack()
        },
        async spread(targets, from) {
            const jobs = targets.map(p => {
                const dx = p.pos.x - from.x
                const dy = p.pos.y - from.y
                const len = Math.hypot(dx, dy)
                const ux = len > 1 ? dx / len : 0
                const uy = len > 1 ? dy / len : 1
                p.pos = { x: p.pos.x + ux * CUT.spread, y: p.pos.y + uy * CUT.spread }
                p.state = 'ground'
                return FX.to(scene, p.img, { x: p.pos.x, y: p.pos.y }, { duration: TIMING.spread, ease: 'Back.easeOut' })
            })
            await FX.all(...jobs)
            targets.forEach(p => p.img.setDepth(WD.actor + p.pos.y))
            view.restack()
        },
        nearest(x, y) {
            let best: Piece | undefined
            let bestD = Infinity
            list.forEach(p => {
                if (p.state !== 'ground') return
                const reach = 24 + Math.sqrt(p.area / Math.PI) * s * 0.8
                const d = Math.hypot(p.pos.x - x, p.pos.y - y)
                if (d < reach && d < bestD) {
                    best = p
                    bestD = d
                }
            })
            return best
        },
        carry(p) {
            p.state = 'carried'
            scene.tweens.killTweensOf(p.img)
        },
        follow(p, x, y, depth) {
            p.pos = { x, y }
            p.img.setPosition(x, y).setDepth(depth)
        },
        async drop(p, at) {
            p.state = 'ground'
            p.pos = { ...at }
            await FX.to(scene, p.img, { x: at.x, y: at.y }, { duration: 260, ease: 'Quad.easeOut' })
            p.img.setDepth(WD.actor + at.y)
            view.restack()
        },
        async place(p) {
            p.state = 'placed'
            const to = { x: PLATE.x + p.c.x * s, y: PLATE.y + p.c.y * s }
            p.pos = to
            p.img.setDepth(WD.placed)
            view.restack()
            await FX.arcTo(scene, p.img, to, { height: 90, duration: TIMING.fly })
            await FX.to(scene, p.img, { scale: s * 1.12 }, { duration: TIMING.snap / 2, yoyo: true })
            p.img.setScale(s)
        },
        async blow(p) {
            p.state = 'gone'
            const img = p.img
            await FX.to(scene, img, { x: img.x + 40, y: img.y + 520, angle: 540, scale: s * 0.6 }, { duration: TIMING.blow, ease: 'Quad.easeIn' })
            img.setVisible(false)
        },
        async join() {
            clearGhost()
            const poly = fruitPoly(FRUITS[fruit])
            const art = paint(poly)
            ghostKey = art.key
            const src = scene.textures.get(art.key).getSourceImage()
            const c = centroid(poly)
            ghost = scene.add.image(PLATE.x + c.x * s, PLATE.y + c.y * s, art.key)
            ghost.setOrigin((c.x + art.ox) / src.width, (c.y + art.oy) / src.height).setScale(s).setAlpha(0)
            view.add(ghost, WD.placed + 1)
            await FX.to(scene, ghost, { alpha: 1 }, { duration: TIMING.join, ease: 'Sine.easeInOut' })
            list.filter(p => p.state === 'placed').forEach(p => p.img.setVisible(false))
            await FX.to(scene, ghost, { scale: s * 1.18 }, { duration: 200, yoyo: true, ease: 'Sine.easeOut' })
            ghost.setScale(s)
        },
        worldOf: local => ({ x: origin.x + local.x * s, y: origin.y + local.y * s }),
        rectOf(targets) {
            let x0 = Infinity
            let y0 = Infinity
            let x1 = -Infinity
            let y1 = -Infinity
            targets.forEach(p => {
                const b = bounds(p.poly)
                x0 = Math.min(x0, p.pos.x + (b.x - p.c.x) * s)
                y0 = Math.min(y0, p.pos.y + (b.y - p.c.y) * s)
                x1 = Math.max(x1, p.pos.x + (b.x + b.w - p.c.x) * s)
                y1 = Math.max(y1, p.pos.y + (b.y + b.h - p.c.y) * s)
            })
            return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 }
        },
        hintFor(p) {
            // corta atravessado ao lado mais comprido, pelo centro
            const b = bounds(p.poly)
            const reach = (Math.max(b.w, b.h) / 2 + 40) * s
            if (b.w >= b.h) return { a: { x: p.pos.x, y: p.pos.y - reach }, b: { x: p.pos.x, y: p.pos.y + reach } }
            return { a: { x: p.pos.x - reach, y: p.pos.y }, b: { x: p.pos.x + reach, y: p.pos.y } }
        },
        sort() {
            view.restack()
        },
        clear() {
            list.forEach(kill)
            list = []
            clearGhost()
        },
        destroy() {
            pieces.clear()
        },
    }
    return pieces
}
