import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BEE_CELL, BEE_SHEET, FLOWER_SHEET, OBJECT_CELL, OBJECT_SHEET, cellKey, flowerCell, sheetData } from '../data/files'
import { BEE, DEPTH, GRID, PILE } from '../data/layout'
import { homeOf, sameCell } from '../data/logic'
import { C, TONE } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Cell, Flower, GridPhase, Rect, Vec } from '../types'

export interface Garden {
    build(phase: GridPhase): void
    hide(): void
    scatter(): Promise<void>
    bring(index: number): Promise<void>
    holding(): Flower | undefined
    activate(onCell: (cell: Cell) => void): void
    deactivate(): void
    plant(cell: Cell): Promise<void>
    bloom(cell: Cell): Promise<void>
    wilt(cell: Cell, rowBad: boolean, colBad: boolean): Promise<void>
    showCross(f: Flower): Promise<void>
    celebrate(): Promise<void>
    emptyCells(): Cell[]
    cellCenter(cell: Cell): Vec
    gridRect(): Rect
    rowsRect(): Rect
    colsRect(): Rect
    update(time: number): void
    destroy(): void
}

interface Plot {
    cell: Cell
    soil: Phaser.GameObjects.Image
    flower?: Phaser.GameObjects.Image
    def?: Flower
}

interface Stake {
    box: Phaser.GameObjects.Container
    baseY: number
}

export function createGarden(scene: Phaser.Scene): Garden {
    let phase: GridPhase | undefined
    let plots: Plot[] = []
    let rows: Stake[] = []
    let cols: Stake[] = []
    let pile: (Phaser.GameObjects.Image | undefined)[] = []
    let carried: Flower | undefined
    let flapping = true
    let glow: Phaser.GameObjects.Graphics | undefined
    const zones: Phaser.GameObjects.Zone[] = []
    const rings: Phaser.GameObjects.Graphics[] = []

    const beeSprite = scene.add.image(0, 0, BEE_SHEET.key, cellKey(BEE_CELL.up))
    beeSprite.setScale(BEE.w / (sheetData(scene, BEE_SHEET).maxW ?? 200))
    const hang = scene.add.image(0, BEE.hang, FLOWER_SHEET.key, cellKey(0)).setOrigin(0.5, 0.12).setVisible(false)
    const bee = scene.add.container(BEE.hold.x, BEE.hold.y, [hang, beeSprite]).setDepth(DEPTH.bee).setVisible(false)
    const flowerScale = () => GRID.flowerH / (sheetData(scene, FLOWER_SHEET).maxH ?? 230)
    hang.setScale((BEE.flowerH / GRID.flowerH) * flowerScale())

    const span = () => {
        const p = phase as GridPhase
        const w = p.cols.length * GRID.cell + (p.cols.length - 1) * GRID.gap
        const h = p.rows.length * GRID.cell + (p.rows.length - 1) * GRID.gap
        return { w, h, left: GRID.x - w / 2, top: GRID.y - h / 2 }
    }

    const cellCenter = (cell: Cell): Vec => {
        const { left, top } = span()
        return { x: left + cell.c * (GRID.cell + GRID.gap) + GRID.cell / 2, y: top + cell.r * (GRID.cell + GRID.gap) + GRID.cell / 2 }
    }

    const footOf = (cell: Cell): Vec => {
        const c = cellCenter(cell)
        return { x: c.x, y: c.y + GRID.cell * 0.3 }
    }

    const flowerImage = (f: Flower) =>
        scene.add.image(0, 0, FLOWER_SHEET.key, cellKey(flowerCell(f.kind, f.tone))).setOrigin(0.5, 1).setScale(flowerScale())

    const plotAt = (cell: Cell) => plots.find(p => sameCell(p.cell, cell)) as Plot

    const unhook = () => {
        zones.forEach(z => z.destroy())
        zones.length = 0
        rings.forEach(r => {
            scene.tweens.killTweensOf(r)
            r.destroy()
        })
        rings.length = 0
    }

    const clear = () => {
        unhook()
        glow?.destroy()
        glow = undefined
        plots.forEach(p => {
            p.soil.destroy()
            if (p.flower) scene.tweens.killTweensOf(p.flower)
            p.flower?.destroy()
        })
        ;[...rows, ...cols].forEach(s => {
            scene.tweens.killTweensOf(s.box)
            s.box.destroy()
        })
        pile.forEach(f => f?.destroy())
        plots = []
        rows = []
        cols = []
        pile = []
        carried = undefined
        hang.setVisible(false)
    }

    const makeRowStake = (r: number) => {
        const p = phase as GridPhase
        const { left } = span()
        const y = cellCenter({ r, c: 0 }).y
        const stake = scene.add.image(0, 0, OBJECT_SHEET.key, cellKey(OBJECT_CELL.signStake))
        stake.setScale(150 / stake.height)
        const icon = scene.add
            .image(0, -stake.displayHeight * 0.24, FLOWER_SHEET.key, cellKey(flowerCell(p.rows[r], 'amarela')))
            .setTintFill(C.silhouette)
        icon.setScale(GRID.icon / icon.height)
        const box = scene.add.container(left - GRID.rowStake, y + 14, [stake, icon]).setDepth(DEPTH.stake)
        return { box, baseY: box.y }
    }

    const makeColStake = (c: number) => {
        const p = phase as GridPhase
        const { top } = span()
        const x = cellCenter({ r: 0, c }).x
        const stake = scene.add.image(0, 0, OBJECT_SHEET.key, cellKey(OBJECT_CELL.stake)).setOrigin(0.5, 1)
        stake.setScale(118 / stake.height)
        const bow = scene.add
            .image(0, -stake.displayHeight + 10, OBJECT_SHEET.key, cellKey(OBJECT_CELL.bow))
            .setTint(TONE[p.cols[c]].fill)
        bow.setScale(86 / bow.width)
        const box = scene.add.container(x, top - 8, [stake, bow]).setDepth(DEPTH.stake)
        return { box, baseY: box.y }
    }

    const hop = (s: Stake) => FX.to(scene, s.box, { y: s.baseY - 18 }, { duration: TIMING.bounce / 2, yoyo: true, ease: 'Sine.easeOut' }).then(() => s.box.setY(s.baseY))

    const flyBee = (to: Vec, ms: number = TIMING.fly) => {
        bee.setScale(to.x < bee.x ? 1 : -1, 1)
        return FX.to(scene, bee, { x: to.x, y: to.y }, { duration: ms, ease: 'Sine.easeInOut' }).then(() => bee.setScale(1, 1))
    }

    const glowAt = (cell: Cell) => {
        glow?.destroy()
        const c = cellCenter(cell)
        const g = scene.add.graphics().setDepth(DEPTH.plot + 1).setPosition(c.x, c.y).setAlpha(0)
        const s = GRID.cell + 10
        g.fillStyle(C.butter, 0.55)
        g.fillRoundedRect(-s / 2, -s / 2, s, s, 26)
        g.lineStyle(6, C.ringYellow, 1)
        g.strokeRoundedRect(-s / 2, -s / 2, s, s, 26)
        glow = g
        return FX.to(scene, g, { alpha: 1 }, { duration: 260 })
    }

    const garden: Garden = {
        build(next) {
            clear()
            phase = next
            next.rows.forEach((_, r) =>
                next.cols.forEach((__, c) => {
                    const at = cellCenter({ r, c })
                    const soil = scene.add.image(at.x, at.y, OBJECT_SHEET.key, cellKey(OBJECT_CELL.plot)).setDepth(DEPTH.plot)
                    soil.setScale((GRID.cell + 12) / soil.width)
                    plots.push({ cell: { r, c }, soil })
                }),
            )
            next.bring.forEach(f => {
                const home = homeOf(next, f)
                const foot = footOf(home)
                const img = flowerImage(f).setPosition(foot.x, foot.y).setDepth(DEPTH.piece + home.r)
                const plot = plotAt(home)
                plot.flower = img
                plot.def = f
            })
            rows = next.rows.map((_, r) => makeRowStake(r))
            cols = next.cols.map((_, c) => makeColStake(c))
            bee.setPosition(BEE.hold.x, BEE.hold.y).setVisible(true).setScale(1)
            beeSprite.setFrame(cellKey(BEE_CELL.up))
            flapping = true
        },
        hide() {
            clear()
            phase = undefined
            bee.setVisible(false)
        },
        async scatter() {
            const p = phase as GridPhase
            beeSprite.setFrame(cellKey(BEE_CELL.startled))
            flapping = false
            void FX.to(scene, bee, { x: bee.x + 50, y: bee.y - 20 }, { duration: 500, yoyo: true, ease: 'Sine.easeOut' })
            pile = []
            const jobs = p.bring.map((f, i) => {
                const plot = plotAt(homeOf(p, f))
                const img = plot.flower as Phaser.GameObjects.Image
                plot.flower = undefined
                plot.def = undefined
                pile[i] = img
                const spot = PILE[i]
                const to = { x: BEE.pile.x + spot.dx, y: BEE.pile.y + spot.dy }
                return FX.wait(scene, i * 120).then(async () => {
                    img.setDepth(DEPTH.flying)
                    void FX.to(scene, img, { angle: 360 * 2 + spot.a }, { duration: TIMING.tumble, ease: 'Sine.easeOut' })
                    await FX.arcTo(scene, img, to, { height: 200, duration: TIMING.tumble })
                    img.setDepth(DEPTH.piece - 2 + i * 0.1)
                })
            })
            await FX.all(...jobs)
            beeSprite.setFrame(cellKey(BEE_CELL.up))
            flapping = true
        },
        async bring(index) {
            const p = phase as GridPhase
            const f = p.bring[index]
            const img = pile[index]
            if (!img) return
            const spot = { x: img.x, y: img.y - 90 }
            await flyBee(spot)
            beeSprite.setFrame(cellKey(BEE_CELL.carry))
            flapping = false
            img.destroy()
            pile[index] = undefined
            carried = f
            hang.setFrame(cellKey(flowerCell(f.kind, f.tone))).setVisible(true).setAngle(0)
            void FX.impact(scene, hang, 0.12)
            await FX.wait(scene, TIMING.pick)
            await flyBee(BEE.hold)
        },
        holding: () => carried,
        activate(onCell) {
            garden.deactivate()
            garden.emptyCells().forEach(cell => {
                const c = cellCenter(cell)
                const ring = scene.add.graphics().setDepth(DEPTH.ring).setPosition(c.x, c.y)
                const s = GRID.cell + 4
                ring.lineStyle(11, C.ringRim, 0.5)
                ring.strokeRoundedRect(-s / 2, -s / 2, s, s, 24)
                ring.lineStyle(6, C.ringYellow, 1)
                ring.strokeRoundedRect(-s / 2, -s / 2, s, s, 24)
                scene.tweens.add({ targets: ring, alpha: 0.35, scale: 1.04, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
                rings.push(ring)
                const zone = scene.add
                    .zone(c.x, c.y, GRID.cell + GRID.gap, GRID.cell + GRID.gap)
                    .setDepth(DEPTH.fx)
                    .setInteractive({ useHandCursor: true })
                const plot = plotAt(cell)
                const base = plot.soil.scale
                zone.on('pointerover', () => plot.soil.setScale(base * 1.04))
                zone.on('pointerout', () => plot.soil.setScale(base))
                zone.on('pointerdown', () => {
                    plot.soil.setScale(base)
                    onCell(cell)
                })
                zones.push(zone)
            })
        },
        deactivate: unhook,
        async plant(cell) {
            const f = carried as Flower
            const c = cellCenter(cell)
            await flyBee({ x: c.x, y: c.y - BEE.hang - 40 })
            await FX.to(scene, bee, { y: c.y - BEE.hang + 6 }, { duration: 220, ease: 'Sine.easeIn' })
            hang.setVisible(false)
            carried = undefined
            const foot = footOf(cell)
            const img = flowerImage(f).setPosition(foot.x, foot.y).setDepth(DEPTH.piece + cell.r)
            const s = img.scale
            img.setScale(s * 0.3, s * 0.1)
            const plot = plotAt(cell)
            plot.flower = img
            plot.def = f
            await FX.to(scene, img, { scaleX: s, scaleY: s }, { duration: TIMING.plant, ease: 'Back.easeOut' })
            beeSprite.setFrame(cellKey(BEE_CELL.up))
            flapping = true
        },
        async bloom(cell) {
            if (glow) {
                const g = glow
                glow = undefined
                void FX.to(scene, g, { alpha: 0 }, { duration: 240 }).then(() => g.destroy())
            }
            const c = cellCenter(cell)
            void FX.sparks(scene, c.x, c.y - 40, { color: C.butter, count: 14, spread: 90, size: 9, depth: DEPTH.fx })
            await FX.all(hop(rows[cell.r]), hop(cols[cell.c]))
            await flyBee(BEE.hold, TIMING.fly * 0.8)
        },
        async wilt(cell, rowBad, colBad) {
            const p = phase as GridPhase
            const img = plotAt(cell).flower
            beeSprite.setFrame(cellKey(BEE_CELL.startled))
            flapping = false
            if (img) {
                img.setTint(C.wilt)
                void FX.to(scene, img, { angle: 32, scaleY: img.scaleY * 0.82 }, { duration: 700, ease: 'Sine.easeIn' })
            }
            const c = cellCenter(cell)
            void flyBee({ x: c.x + 170, y: c.y - 120 }, 420)
            const shakes: Promise<void>[] = []
            if (rowBad) shakes.push(FX.shake(scene, rows[cell.r].box, { amount: 9, times: 4 }))
            if (colBad) shakes.push(FX.shake(scene, cols[cell.c].box, { amount: 9, times: 4 }))
            const planted = plotAt(cell).def
            if (planted) void glowAt(homeOf(p, planted))
            await FX.all(...shakes)
            await FX.wait(scene, 200)
            beeSprite.setFrame(cellKey(BEE_CELL.sad))
        },
        async showCross(f) {
            const p = phase as GridPhase
            const home = homeOf(p, f)
            await FX.all(hop(rows[home.r]), hop(cols[home.c]))
            await FX.all(hop(rows[home.r]), hop(cols[home.c]))
            await glowAt(home)
            await FX.wait(scene, 380)
        },
        async celebrate() {
            glow?.destroy()
            glow = undefined
            beeSprite.setFrame(cellKey(BEE_CELL.cheer))
            flapping = false
            plots.forEach((pl, i) => {
                if (!pl.flower) return
                void FX.wait(scene, i * 60).then(() => FX.to(scene, pl.flower as Phaser.GameObjects.Image, { angle: 8 }, { duration: 260, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' }))
            })
            const { left, top, w, h } = span()
            const cx = left + w / 2
            const cy = top + h / 2 - 40
            const path = [
                { x: cx + w / 2 + 40, y: cy },
                { x: cx, y: top - 60 },
                { x: cx - w / 2 - 40, y: cy },
                { x: cx, y: top + h + 20 },
            ]
            for (const at of path) await flyBee(at, 300)
            await flyBee(BEE.hold, 420)
            beeSprite.setFrame(cellKey(BEE_CELL.up))
            flapping = true
        },
        emptyCells: () => plots.filter(p => !p.flower).map(p => p.cell),
        cellCenter,
        gridRect() {
            const { left, top, w, h } = span()
            return { x: left + w / 2, y: top + h / 2, w: w + 30, h: h + 30 }
        },
        rowsRect() {
            const { left, top, h } = span()
            return { x: left - GRID.rowStake, y: top + h / 2 + 10, w: 170, h: h + 40 }
        },
        colsRect() {
            const { left, top, w } = span()
            return { x: left + w / 2, y: top - 66, w: w + 30, h: 140 }
        },
        update(time) {
            if (!bee.visible) return
            beeSprite.setY(Math.sin(time / 220) * BEE.bob)
            hang.setY(BEE.hang + Math.sin(time / 220) * BEE.bob)
            if (flapping) beeSprite.setFrame(cellKey(Math.floor(time / 90) % 2 === 0 ? BEE_CELL.up : BEE_CELL.down))
        },
        destroy() {
            clear()
            bee.destroy()
        },
    }

    return garden
}
