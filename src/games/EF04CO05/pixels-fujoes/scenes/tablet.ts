import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { TABLET_SHEET, UI, UI_SHEET, cellKey } from '../data/files'
import { LINE, fontKey, glyphKey, tileKey, type FontTone } from '../data/glyphs'
import { entryOf } from '../data/levels'
import { DEPTH, TABLET } from '../data/layout'
import { C } from '../data/theme'
import type { Cell, Entry, Kind, View } from '../types'
import type { Rect } from './guide'
import { toneOf } from './pixelart'

type Point = { x: number; y: number }
/** como uma casa aparece: a cor (pixel) e, na mensagem, a letra */
type Look = { color: number; glyph?: string }

/**
 * O tablet e a figura (ou a mensagem). A origem do mundo é o meio da tela do tablet; o zoom escala o mundo
 * inteiro (a arte é pixel art em NEAREST, então ampliar não borra). Quem pinta cada casa é o código guardado
 * nela, lido pelo tablet — nunca a cor de quem voltou.
 */
export interface Tablet {
    readonly zoomed: boolean
    show(rows: string[]): void
    zoom(play: boolean): Promise<void>
    setLook(x: number, y: number): void
    cellPos(cell: Cell): Point
    pictureRect(): Rect
    tabletRect(): Rect
    punch(cell: Cell): void
    /** o código entra na casa, fica um instante e o tablet mostra o que ele significa */
    read(cell: Cell, got: Entry, code: string): Promise<void>
    mark(cell: Cell): Promise<void>
    xray(on: boolean, onRow?: (row: number) => void): Promise<void>
    hop(): Promise<void>
    slideTo(rows: string[]): Promise<void>
    destroy(): void
}

const S = TABLET.cell
const BEVEL = 0.5
const smooth = (t: number) => t * t * (3 - 2 * t)

export function createTablet(scene: Phaser.Scene, kind: Kind, view: View, given: number): Tablet {
    const root = scene.add.container(TABLET.realX, TABLET.realY).setDepth(DEPTH.world)
    const device = scene.add.image(0, 0, TABLET_SHEET.key, cellKey(0))
    const k = device.frame.width / TABLET.w
    const sc = TABLET.screen
    device
        .setScale(TABLET.art / k)
        .setPosition((TABLET.w / 2 - (sc.x + sc.w / 2)) * TABLET.art, (TABLET.h / 2 - (sc.y + sc.h / 2)) * TABLET.art)

    const pic = scene.add.container(0, 0)
    const cells = scene.add.graphics()
    const letters = scene.add.container(0, 0)
    const grid = scene.add.graphics()
    const frame = scene.add.graphics()
    const holes = scene.add.container(0, 0)
    const marks = scene.add.graphics()
    const tiles = scene.add.container(0, 0)
    pic.add([cells, letters, grid, frame, holes, marks, tiles])
    root.add([device, pic])

    let shown: Array<Array<Look | null>> = []
    let rowsN = 1
    let colsN = 1
    let halfW = S / 2
    let halfH = S / 2
    const holeArt = new Map<string, Phaser.GameObjects.Image[]>()
    let progress = 0
    let scale = 1
    let lookX = 0
    let lookY = 0
    let zoomTween: Phaser.Tweens.Tween | undefined

    const local = ([r, c]: Cell): Point => ({ x: -halfW + (c + 0.5) * S, y: -halfH + (r + 0.5) * S })
    const keyOf = ([r, c]: Cell) => `${r},${c}`
    const lookOf = (e: Entry): Look => ({ color: e.color, glyph: e.glyph })

    const paint = () => {
        cells.clear()
        letters.removeAll(true)
        for (let r = 0; r < rowsN; r++)
            for (let c = 0; c < colsN; c++) {
                const look = shown[r]?.[c]
                if (!look) continue
                const x = -halfW + c * S
                const y = -halfH + r * S
                if (kind === 'ascii') {
                    cells.fillStyle(C.paper, 1)
                    cells.fillRect(x, y, S, S)
                    cells.fillStyle(C.paperShade, 1)
                    cells.fillRect(x, y + S - BEVEL, S, BEVEL)
                    if (look.glyph) {
                        const text = scene.add.bitmapText(x + S / 2, y + S / 2 + 0.4, fontKey('dark'), look.glyph, LINE * 0.8).setOrigin(0.5)
                        letters.add(text)
                    }
                    continue
                }
                const [light, shade] = toneOf(look.color)
                cells.fillStyle(look.color, 1)
                cells.fillRect(x, y, S, S)
                cells.fillStyle(light, 1)
                cells.fillRect(x + BEVEL, y + BEVEL, S - 2 * BEVEL, BEVEL)
                cells.fillRect(x + BEVEL, y + 2 * BEVEL, BEVEL, S - 3 * BEVEL)
                cells.fillStyle(shade, 1)
                cells.fillRect(x + BEVEL, y + S - 2 * BEVEL, S - 2 * BEVEL, BEVEL)
                cells.fillRect(x + S - 2 * BEVEL, y + 2 * BEVEL, BEVEL, S - 3 * BEVEL)
            }
    }

    const drawGrid = () => {
        grid.clear()
        grid.fillStyle(kind === 'ascii' ? C.paperShade : C.grid, 1)
        for (let i = 1; i < colsN; i++) grid.fillRect(-halfW + i * S - 0.25, -halfH, 0.5, S * rowsN)
        for (let i = 1; i < rowsN; i++) grid.fillRect(-halfW, -halfH + i * S - 0.25, S * colsN, 0.5)
        frame.clear()
        frame.lineStyle(1, kind === 'ascii' ? C.outline : C.rim, 1)
        frame.strokeRect(-halfW - 0.5, -halfH - 0.5, S * colsN + 1, S * rowsN + 1)
    }

    const apply = () => {
        root.setScale(scale)
        root.setPosition(TABLET.realX - lookX * progress, Phaser.Math.Linear(TABLET.realY, TABLET.playY, progress) - lookY * progress)
        grid.setAlpha(Phaser.Math.Clamp((scale - 1.6) / 2.4, 0, 1))
    }
    apply()

    const clearHole = (cell: Cell) => {
        holeArt.get(keyOf(cell))?.forEach(o => o.destroy())
        holeArt.delete(keyOf(cell))
    }

    /**
     * O código chegando: uma plaquinha em cima da casa, com os números (no RGB, cada um na cor da sua luz;
     * na letra, o começo dado apagado e separado do resto).
     */
    const codeLabel = (cell: Cell, code: string) => {
        const p = local(cell)
        const kText = code.length > 4 ? 0.34 : 0.45
        const step = 6 * kText
        const split = kind === 'ascii' && given > 0 ? step * 0.6 : 0
        const w = code.length * step + split + 2
        const h = LINE * kText + 1
        const box = scene.add.container(p.x, p.y - S / 2 - h / 2 - 0.5)
        const bg = scene.add.rectangle(0, 0, w, h, C.outline, 0.92)
        box.add(bg)
        ;[...code].forEach((d, i) => {
            const tone: FontTone =
                kind === 'rgb' ? (d === '1' ? (['red', 'green', 'blue'] as FontTone[])[i] : 'soft') : kind === 'ascii' && i < given ? 'soft' : 'white'
            const x = -w / 2 + 1 + step * (i + 0.5) + (i >= given ? split : 0)
            box.add(scene.add.bitmapText(x, 0.3, fontKey(tone), d, LINE * kText).setOrigin(0.5))
        })
        tiles.add(box)
        return box
    }

    const tablet: Tablet = {
        get zoomed() {
            return progress >= 1
        },
        show(rows) {
            holeArt.forEach(list => list.forEach(o => o.destroy()))
            holeArt.clear()
            marks.clear()
            tiles.removeAll(true)
            rowsN = rows.length
            colsN = rows[0]?.length ?? 1
            halfW = (S * colsN) / 2
            halfH = (S * rowsN) / 2
            shown = rows.map(row =>
                [...row].map(ch => {
                    const e = entryOf(kind, ch)
                    if (e) return lookOf(e)
                    return { color: C.paper, glyph: ch === ' ' ? undefined : ch }
                }),
            )
            drawGrid()
            paint()
        },
        zoom(play) {
            zoomTween?.stop()
            const from = progress
            const to = play ? 1 : 0
            const s = { t: 0 }
            return new Promise<void>(resolve => {
                zoomTween = scene.tweens.add({
                    targets: s,
                    t: 1,
                    duration: FX.ms(scene, TABLET.zoomMs),
                    onUpdate: () => {
                        progress = Phaser.Math.Linear(from, to, smooth(s.t))
                        scale = Math.pow(view.zoom, progress)
                        apply()
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
        },
        setLook(x, y) {
            lookX = x
            lookY = y
            apply()
        },
        cellPos(cell) {
            const p = local(cell)
            return { x: root.x + (p.x + pic.x) * scale, y: root.y + (p.y + pic.y) * scale }
        },
        pictureRect() {
            return { x: root.x + pic.x * scale, y: root.y + pic.y * scale, w: S * colsN * scale + 44, h: S * rowsN * scale + 44 }
        },
        tabletRect() {
            return { x: root.x, y: root.y, w: TABLET.w * TABLET.art * scale + 20, h: TABLET.h * TABLET.art * scale + 20 }
        },
        punch(cell) {
            const [r, c] = cell
            shown[r][c] = null
            paint()
            const p = local(cell)
            const slot = scene.add.image(p.x, p.y, UI_SHEET.key, cellKey(UI.hole))
            slot.setScale(S / slot.frame.width)
            const mark = scene.add.image(p.x, p.y, glyphKey('?', 'mark')).setScale((S * 0.6) / 7)
            holes.add([slot, mark])
            holeArt.set(keyOf(cell), [slot, mark])
        },
        async read(cell, got, code) {
            clearHole(cell)
            const [r, c] = cell
            if (code.length === 1) {
                const p = local(cell)
                const tile = scene.add.image(p.x, p.y, tileKey(code))
                const base = S / tile.width
                tile.setScale(base * 0.4)
                tiles.add(tile)
                await FX.to(scene, tile, { scale: base }, { duration: 140 })
                await FX.wait(scene, 260)
                await FX.to(scene, tile, { scaleX: 0 }, { duration: 90 })
                shown[r][c] = lookOf(got)
                paint()
                tile.destroy()
                return
            }
            const label = codeLabel(cell, code)
            label.setScale(0.4)
            await FX.to(scene, label, { scale: 1 }, { duration: 160 })
            await FX.wait(scene, 380)
            shown[r][c] = lookOf(got)
            paint()
            await FX.wait(scene, 380)
            await FX.to(scene, label, { alpha: 0 }, { duration: 200 })
            label.destroy()
        },
        async mark(cell) {
            const p = local(cell)
            marks.lineStyle(1, C.oops, 1)
            marks.strokeRect(p.x - S / 2 - 0.5, p.y - S / 2 - 0.5, S + 1, S + 1)
            const x0 = pic.x
            await FX.to(scene, pic, { x: x0 + 0.8 }, { duration: 50, yoyo: true, repeat: 3 })
            pic.x = x0
        },
        async xray(on, onRow) {
            if (on) {
                tiles.removeAll(true)
                const bar = scene.add.rectangle(0, -halfH, S * colsN + 2, 1.2, C.cyan, 0.9)
                tiles.add(bar)
                for (let r = 0; r < rowsN; r++) {
                    bar.y = -halfH + (r + 1) * S
                    onRow?.(r)
                    for (let c = 0; c < colsN; c++) {
                        const look = shown[r][c]
                        const p = local([r, c])
                        const tile = scene.add.image(p.x, p.y, tileKey(look ? (look.color === C.lit ? '1' : '0') : '?'))
                        const base = S / tile.width
                        tile.setScale(base, 0)
                        tiles.add(tile)
                        void FX.to(scene, tile, { scaleY: base }, { duration: 120 })
                    }
                    await FX.wait(scene, 75)
                }
                bar.destroy()
                await FX.wait(scene, 140)
                return
            }
            const list = tiles.list.slice() as Phaser.GameObjects.Image[]
            await FX.all(
                ...list.map(tile => {
                    const row = Math.round((tile.y + halfH - S / 2) / S)
                    return FX.to(scene, tile, { scaleY: 0 }, { duration: 110, delay: row * 55 }).then(() => tile.destroy())
                }),
            )
        },
        async hop() {
            await FX.to(scene, pic, { y: -1.6 }, { duration: 150, yoyo: true })
            pic.y = 0
        },
        async slideTo(rows) {
            await FX.to(scene, pic, { x: -40, alpha: 0 }, { duration: TABLET.slideMs / 2 })
            tablet.show(rows)
            pic.x = 40
            await FX.to(scene, pic, { x: 0, alpha: 1 }, { duration: TABLET.slideMs / 2 })
        },
        destroy() {
            zoomTween?.stop()
            root.destroy()
        },
    }
    return tablet
}
