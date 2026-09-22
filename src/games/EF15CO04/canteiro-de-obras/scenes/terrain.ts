import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { chunksOf } from '../data/levels'
import { CUT, DEPTH, NEAR, PIECE, TERR } from '../data/layout'
import { A, C } from '../data/theme'
import type { Chunk, LotDef, SiteDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

interface LotView {
    def: LotDef
    x: number
    w: number
    holder: Phaser.GameObjects.Container
    ghosts: Map<string, Phaser.GameObjects.Sprite>
}

interface ChunkView {
    chunk: Chunk
    container: Phaser.GameObjects.Container
    plot: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    x: number
    w: number
    offset: number
}

export interface Box {
    x: number
    y: number
    w: number
    h: number
}

export interface Terrain {
    build(site: SiteDef): void
    showProject(): Promise<void>
    showCuts(): Promise<void>
    chunks(): Chunk[]
    pendingCuts(): string[]
    cutBox(lotId: string): Box | undefined
    chunkBox(index: number): Box
    setCutsEnabled(on: boolean): void
    setChunksEnabled(on: boolean): void
    pulseCuts(): void
    pulseChunks(): void
    calm(): void
    nudgeCuts(): Promise<void>
    cutAt(lotId: string): Promise<void>
    zoomTo(index: number): Promise<void>
    zoomOut(): Promise<void>
    ghostAt(pieceId: string): { x: number; y: number }
    ghostScale(): number
    place(pieceId: string, step: number): Promise<void>
    markBuilt(index: number): void
    blink(index: number): Promise<void>
    join(): Promise<void>
    sweep(): Promise<void>
    destroy(): void
}

export function createTerrain(
    scene: Phaser.Scene,
    opts: { onCut: (lotId: string) => void; onChunk: (index: number) => void },
): Terrain {
    const root = scene.add.container(0, 0).setDepth(DEPTH.terrain)
    const lineLayer = scene.add.graphics()
    root.add(lineLayer)

    let site: SiteDef | undefined
    let lots: LotView[] = []
    let views: ChunkView[] = []
    let cutters: Phaser.GameObjects.Container[] = []
    let cutZones: Phaser.GameObjects.Zone[] = []
    const done = new Set<string>()
    const placed = new Set<string>()
    const built = new Set<string>()
    let zoom = 1

    const keyOf = (chunk: Chunk) => chunk.map(l => l.id).join('+')
    const lotView = (lot: LotDef) => lots.find(v => v.def.id === lot.id)!

    const paintPlot = (g: Phaser.GameObjects.Graphics, x: number, w: number, ready: boolean) => {
        g.clear()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(x + 6, TERR.y + 10, w, TERR.h, TERR.radius)
        g.fillStyle(ready ? C.green : C.dirt, 1)
        g.fillRoundedRect(x, TERR.y, w, TERR.h, TERR.radius)
        g.fillStyle(ready ? C.greenDark : C.dirtDark, 0.45)
        g.fillRoundedRect(x, TERR.y + TERR.h - 26, w, 26, TERR.radius)
        g.lineStyle(6, ready ? C.greenDark : C.woodDark, 1)
        g.strokeRoundedRect(x, TERR.y, w, TERR.h, TERR.radius)
    }

    const clearChunks = () => {
        views.forEach(v => {
            v.container.removeAll(false)
            v.plot.destroy()
            v.zone.destroy()
            v.container.destroy()
        })
        views = []
    }

    const offsetOfLot = (lotId: string) =>
        views.find(v => v.chunk.some(l => l.id === lotId))?.offset ?? 0

    const paintLines = () => {
        lineLayer.clear()
        if (!site) return
        site.cuts
            .filter(cut => !done.has(cut.afterLot))
            .forEach(cut => {
                const lot = lots.find(v => v.def.id === cut.afterLot)
                if (!lot) return
                const x = lot.x + lot.w + offsetOfLot(cut.afterLot)
                lineLayer.lineStyle(7, cut.optional ? C.paperEdge : C.paper, 0.95)
                for (let y = TERR.y + 14; y < TERR.y + TERR.h - 10; y += 26) {
                    lineLayer.beginPath()
                    lineLayer.moveTo(x, y)
                    lineLayer.lineTo(x, Math.min(y + 15, TERR.y + TERR.h - 10))
                    lineLayer.strokePath()
                }
            })
    }

    const drawCutter = (g: Phaser.GameObjects.Graphics) => {
        g.clear()
        g.fillStyle(C.shadow, 0.18)
        g.fillCircle(3, 5, 46)
        g.fillStyle(C.white, 0.97)
        g.fillCircle(0, 0, 46)
        g.lineStyle(6, C.line, 1)
        g.strokeCircle(0, 0, 46)
        g.lineStyle(8, 0x8fa4b8, 1)
        g.beginPath()
        g.moveTo(-17, -26)
        g.lineTo(15, 15)
        g.strokePath()
        g.beginPath()
        g.moveTo(17, -26)
        g.lineTo(-15, 15)
        g.strokePath()
        g.lineStyle(7, C.amberDark, 1)
        g.strokeCircle(-17, 27, 11)
        g.strokeCircle(17, 27, 11)
    }

    const placeCutters = () => {
        if (!site) return
        site.cuts.forEach((cut, i) => {
            const holder = cutters[i]
            const zone = cutZones[i]
            const lot = lots.find(v => v.def.id === cut.afterLot)
            if (!holder || !zone || !lot) return
            const x = lot.x + lot.w + offsetOfLot(cut.afterLot)
            holder.setPosition(x, TERR.cy)
            zone.setPosition(x, TERR.cy)
            const gone = done.has(cut.afterLot)
            holder.setVisible(!gone)
            zone.setVisible(!gone)
            if (gone && zone.input) zone.input.enabled = false
        })
    }

    const rebuild = () => {
        if (!site) return
        clearChunks()
        const list = chunksOf(site, done)
        list.forEach((chunk, i) => {
            const first = lotView(chunk[0])
            const w = chunk.reduce((sum, lot) => sum + lotView(lot).w, 0)
            const offset = (i - (list.length - 1) / 2) * CUT.gap

            const container = scene.add.container(offset, 0)
            const plot = scene.add.graphics()
            paintPlot(plot, first.x, w, built.has(keyOf(chunk)))
            container.add(plot)
            chunk.forEach(lot => container.add(lotView(lot).holder))

            const zone = scene.add
                .zone(first.x + w / 2, TERR.cy, w, TERR.h)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
            zone.input!.enabled = false
            zone.on('pointerdown', () => opts.onChunk(i))
            container.add(zone)

            root.add(container)
            views.push({ chunk, container, plot, zone, x: first.x, w, offset })
        })

        root.bringToTop(lineLayer)
        cutters.forEach(c => root.bringToTop(c))
        paintLines()
        placeCutters()
    }

    const pulsing: FxTarget[] = []
    const calm = () => {
        pulsing.forEach(t => {
            FX.kill(scene, t)
            t.setScale(1)
        })
        pulsing.length = 0
    }

    return {
        build(next) {
            site = next
            done.clear()
            placed.clear()
            built.clear()
            zoom = 1
            root.setScale(1).setPosition(0, 0)

            lots.forEach(v => {
                v.ghosts.forEach(g => g.destroy())
                v.holder.destroy()
            })
            lots = []
            cutters.forEach(c => c.destroy())
            cutZones.forEach(z => z.destroy())
            cutters = []
            cutZones = []
            clearChunks()

            const lotW = TERR.w / next.lots.length
            next.lots.forEach((lot, i) => {
                const holder = scene.add.container(0, 0)
                const ghosts = new Map<string, Phaser.GameObjects.Sprite>()
                const x = TERR.x + i * lotW

                lot.pieces.forEach(piece => {
                    const gx = x + piece.spot[0] * lotW
                    const gy = TERR.y + piece.spot[1] * TERR.h
                    const mark = scene.add.graphics()
                    mark.fillStyle(C.dirtDark, 0.5)
                    mark.fillEllipse(gx, gy + 28, 96, 30)
                    holder.add(mark)

                    if (scene.textures.exists(next.sheet)) {
                        const ghost = scene.add
                            .sprite(gx, gy, next.sheet, piece.frame)
                            .setOrigin(0.5, 0.62)
                            .setScale(PIECE.ghost)
                            .setAlpha(0)
                        holder.add(ghost)
                        ghosts.set(piece.id, ghost)
                    } else {
                        const g = scene.add.graphics()
                        g.lineStyle(5, C.woodDark, 1)
                        g.strokeRoundedRect(gx - 40, gy - 46, 80, 80, 14)
                        g.setAlpha(0)
                        holder.add(g)
                    }
                })

                lots.push({ def: lot, x, w: lotW, holder, ghosts })
            })

            next.cuts.forEach(() => {
                const g = scene.add.graphics()
                drawCutter(g)
                const holder = scene.add.container(0, TERR.cy, [g]).setAlpha(0)
                const zone = scene.add
                    .zone(0, TERR.cy, CUT.hit, CUT.hit)
                    .setOrigin(0.5)
                    .setDepth(DEPTH.piece)
                    .setInteractive({ useHandCursor: true })
                zone.input!.enabled = false
                root.add(holder)
                cutters.push(holder)
                cutZones.push(zone)
            })

            next.cuts.forEach((cut, i) => {
                cutZones[i]?.on('pointerdown', () => opts.onCut(cut.afterLot))
            })

            rebuild()
        },

        async showProject() {
            const all: Phaser.GameObjects.Sprite[] = []
            lots.forEach(v => v.ghosts.forEach(g => all.push(g)))
            all.sort((a, b) => a.x - b.x)
            await Promise.all(
                all.map((g, i) =>
                    FX.to(scene, fx(g), { alpha: A.ghost }, { duration: 320, delay: i * 90 }),
                ),
            )
        },

        async showCuts() {
            lineLayer.setAlpha(0)
            await FX.to(scene, fx(lineLayer), { alpha: 1 }, { duration: 260 })
            await Promise.all(
                cutters.map((c, i) => {
                    c.setScale(0.6)
                    return FX.all(
                        FX.to(scene, fx(c), { alpha: 1 }, { duration: 220, delay: i * 120 }),
                        FX.to(scene, fx(c), { scale: 1 }, { duration: 320, delay: i * 120, ease: 'Back.easeOut' }),
                    )
                }),
            )
        },

        chunks: () => (site ? chunksOf(site, done) : []),

        pendingCuts: () => (site ? site.cuts.filter(c => !done.has(c.afterLot)).map(c => c.afterLot) : []),

        cutBox(lotId) {
            const lot = lots.find(v => v.def.id === lotId)
            if (!lot) return undefined
            return { x: lot.x + lot.w + offsetOfLot(lotId), y: TERR.cy, w: CUT.hit, h: CUT.hit }
        },

        chunkBox(index) {
            const v = views[index]
            if (!v) return { x: TERR.cx, y: TERR.cy, w: TERR.w, h: TERR.h }
            return {
                x: (v.x + v.w / 2 + v.offset) * zoom + root.x,
                y: TERR.cy * zoom + root.y,
                w: v.w * zoom,
                h: TERR.h * zoom,
            }
        },

        setCutsEnabled(on) {
            cutZones.forEach((z, i) => {
                const cut = site?.cuts[i]
                if (z.input) z.input.enabled = on && !!cut && !done.has(cut.afterLot)
            })
        },

        setChunksEnabled(on) {
            views.forEach(v => {
                if (v.zone.input) v.zone.input.enabled = on && !built.has(keyOf(v.chunk))
            })
        },

        pulseCuts() {
            calm()
            cutters.forEach((c, i) => {
                if (!c.visible) return
                pulsing.push(fx(c))
                FX.breathe(scene, fx(c), { grow: 1.1, duration: 760 + i * 40 })
            })
        },

        pulseChunks() {
            calm()
            views.forEach((v, i) => {
                if (built.has(keyOf(v.chunk))) return
                pulsing.push(fx(v.container))
                FX.breathe(scene, fx(v.container), { grow: 1.02, duration: 900 + i * 60 })
            })
        },

        calm,

        async nudgeCuts() {
            await FX.all(
                ...cutters
                    .filter(c => c.visible)
                    .map(c => FX.to(scene, fx(c), { scale: 1.22 }, { duration: 150, yoyo: true })),
            )
            await FX.to(scene, fx(lineLayer), { alpha: 0.35 }, { duration: 120, yoyo: true, repeat: 1 })
        },

        async cutAt(lotId) {
            calm()
            done.add(lotId)
            const index = site?.cuts.findIndex(c => c.afterLot === lotId) ?? -1
            const holder = cutters[index]
            if (holder) {
                await FX.to(scene, fx(holder), { scale: 1.3, angle: -12 }, { duration: 140 })
                await FX.to(scene, fx(holder), { alpha: 0, scale: 0.5 }, { duration: 200 })
            }
            rebuild()
            views.forEach(v => {
                v.container.setX(v.offset - Math.sign(v.offset || 1) * CUT.gap)
                void FX.to(scene, fx(v.container), { x: v.offset }, { duration: 300, ease: 'Back.easeOut' })
            })
            await FX.wait(scene, 320)
            paintLines()
            placeCutters()
        },

        async zoomTo(index) {
            const v = views[index]
            if (!v) return
            zoom = Math.min(NEAR.h / TERR.h, NEAR.wMax / v.w)
            const cx = v.offset + v.x + v.w / 2
            views.forEach((other, i) => {
                if (i !== index) void FX.to(scene, fx(other.container), { alpha: A.dimmed }, { duration: 300 })
            })
            await FX.to(
                scene,
                fx(root),
                { scale: zoom, x: NEAR.cx - cx * zoom, y: NEAR.cy - TERR.cy * zoom },
                { duration: 420, ease: 'Sine.easeInOut' },
            )
        },

        async zoomOut() {
            zoom = 1
            views.forEach(v => void FX.to(scene, fx(v.container), { alpha: 1 }, { duration: 260 }))
            await FX.to(scene, fx(root), { scale: 1, x: 0, y: 0 }, { duration: 420, ease: 'Sine.easeInOut' })
        },

        ghostAt(pieceId) {
            for (const lot of lots) {
                const ghost = lot.ghosts.get(pieceId)
                if (!ghost) continue
                const m = ghost.getWorldTransformMatrix()
                return { x: m.tx, y: m.ty }
            }
            return { x: NEAR.cx, y: NEAR.cy }
        },

        ghostScale: () => PIECE.ghost * zoom,

        async place(pieceId, step) {
            placed.add(pieceId)
            for (const lot of lots) {
                const ghost = lot.ghosts.get(pieceId)
                if (!ghost) continue
                ghost.setAlpha(1).setScale(PIECE.ghost * 1.18)
                await FX.to(scene, fx(ghost), { scale: PIECE.ghost }, { duration: 220, ease: 'Back.easeOut' })
                const m = ghost.getWorldTransformMatrix()
                void FX.ping(scene, m.tx, m.ty + 20 * zoom, C.dirtLight, {
                    radius: 54 * zoom,
                    duration: 420,
                    depth: DEPTH.fly,
                })
                return
            }
            void step
        },

        markBuilt(index) {
            const v = views[index]
            if (!v) return
            built.add(keyOf(v.chunk))
            paintPlot(v.plot, v.x, v.w, true)
            if (v.zone.input) v.zone.input.enabled = false
        },

        async blink(index) {
            const v = views[index]
            if (!v) return
            for (let i = 0; i < 2; i++) {
                await FX.to(scene, fx(v.container), { alpha: 1 }, { duration: 160 })
                await FX.to(scene, fx(v.container), { alpha: A.dimmed }, { duration: 200 })
            }
        },

        async join() {
            calm()
            await FX.all(
                ...views.map(v => FX.to(scene, fx(v.container), { x: 0, alpha: 1 }, { duration: 420, ease: 'Sine.easeInOut' })),
            )
        },

        async sweep() {
            for (const v of views) {
                await FX.to(scene, fx(v.container), { scale: 1.05 }, { duration: 200, yoyo: true })
            }
        },

        destroy() {
            calm()
            clearChunks()
            lots.forEach(v => {
                v.ghosts.forEach(g => g.destroy())
                v.holder.destroy()
            })
            lots = []
            cutZones.forEach(z => z.destroy())
            cutters.forEach(c => c.destroy())
            lineLayer.destroy()
            root.destroy()
        },
    }
}
