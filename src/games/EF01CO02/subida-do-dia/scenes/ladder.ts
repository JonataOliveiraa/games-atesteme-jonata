import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_CELL, PIECES } from '../data/files'
import { DEPTH, KID, LADDER, RUNG, WORLD } from '../data/layout'
import { C } from '../data/theme'
import type { Art, Point, Rect } from '../types'
import { createArtView, type ArtView } from './art'

export interface Ladder {
    build(ys: number[], top: number): Promise<void>
    glow(rung: number): void
    fill(rung: number, art: Art): Promise<void>
    empty(rung: number): void
    reject(rung: number, art: Art): Promise<void>
    light(rung: number): void
    unlight(): void
    rungPoint(rung: number): Point
    stand(rung: number): Point
    foot(): Point
    rungRect(rung: number): Rect
    readonly rect: Rect
    destroy(): void
}

interface RungView {
    container: Phaser.GameObjects.Container
    glow: Phaser.GameObjects.Graphics
    hollow: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    plaque: Phaser.GameObjects.Container
    pic: ArtView
    y: number
}

const RAIL_FRAME = 'sdd-rail-mid'
const PLAQUE_SX = RUNG.w / RUNG.artW
const PLAQUE_SY = RUNG.h / RUNG.artH

function plaqueArt(scene: Phaser.Scene, cell: number, tint: number): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
    if (scene.textures.exists(PIECES)) return scene.add.image(0, 0, PIECES, cell).setScale(PLAQUE_SX, PLAQUE_SY).setTint(tint)
    const g = scene.add.graphics()
    const { w, h } = RUNG
    g.fillStyle(tint, 1)
    g.fillRect(-w / 2, -h / 2, w, h)
    g.lineStyle(4, C.ink, 1)
    g.lineBetween(-w / 2, -h / 2, w / 2, -h / 2)
    g.lineBetween(-w / 2, h / 2, w / 2, h / 2)
    return g
}

export function createLadder(scene: Phaser.Scene): Ladder {
    let root: Phaser.GameObjects.Container | undefined
    let rails: Phaser.GameObjects.GameObject | undefined
    let rungs: RungView[] = []
    let glowing: { view: RungView; tween: Phaser.Tweens.Tween } | undefined
    const falling = new Set<ArtView>()
    const rect: Rect = { x: WORLD.ladderX, y: 0, w: LADDER.hit, h: 0 }

    const paintGlow = (g: Phaser.GameObjects.Graphics, color: number | null) => {
        const { w, h } = RUNG
        g.clear()
        if (color === null) return
        g.fillStyle(color, 0.4)
        g.fillRoundedRect(-w / 2 - 24, -h / 2 - 6, w + 48, h + 12, 22)
        g.fillStyle(color, 0.95)
        g.fillRoundedRect(-w / 2 - 10, -h / 2 + 2, w + 20, h - 4, 14)
    }

    const stopGlow = () => {
        if (!glowing) return
        glowing.tween.remove()
        glowing.view.glow.setAlpha(1)
        paintGlow(glowing.view.glow, null)
        glowing = undefined
    }

    const makeRails = (top: number): Phaser.GameObjects.GameObject => {
        const h = WORLD.groundY - top
        if (scene.textures.exists(PIECES)) {
            const tex = scene.textures.get(PIECES)
            if (!tex.has(RAIL_FRAME)) {
                const cell = tex.get(PIECE_CELL.rails)
                tex.add(RAIL_FRAME, cell.sourceIndex, cell.cutX, cell.cutY + LADDER.railCap, cell.cutWidth, cell.cutHeight - LADDER.railCap)
            }
            return scene.add
                .tileSprite(WORLD.ladderX, top, LADDER.railW, h, PIECES, RAIL_FRAME)
                .setOrigin(0.5, 0)
                .setTint(C.woodTint)
                .setDepth(DEPTH.ladder)
        }
        const g = scene.add.graphics().setDepth(DEPTH.ladder)
        for (const side of [-1, 1]) {
            const x = WORLD.ladderX + (side * LADDER.railW * 0.75) / 2
            g.fillStyle(C.woodTint, 1)
            g.fillRoundedRect(x - 14, top, 28, h, 12)
            g.lineStyle(4, C.ink, 1)
            g.strokeRoundedRect(x - 14, top, 28, h, 12)
        }
        return g
    }

    const makeRung = (y: number): RungView => {
        const glow = scene.add.graphics()
        const hollow = plaqueArt(scene, PIECE_CELL.rungHollow, C.hollowTint).setAlpha(0.6)
        const pic = createArtView(scene, 0, 0, RUNG.art)
        const plaque = scene.add.container(0, 0, [plaqueArt(scene, PIECE_CELL.rung, C.woodTint), pic.container]).setVisible(false)
        const container = scene.add.container(WORLD.ladderX, y, [glow, hollow, plaque])
        return { container, glow, hollow, plaque, pic, y }
    }

    const clear = () => {
        stopGlow()
        rungs.forEach(r => {
            FX.kill(scene, r.container)
            r.pic.destroy()
        })
        rungs = []
        falling.forEach(v => v.destroy())
        falling.clear()
        if (root) {
            FX.kill(scene, root)
            root.destroy()
        }
        root = undefined
        rails?.destroy()
        rails = undefined
    }

    return {
        async build(ys, top) {
            clear()
            rails = makeRails(top)
            rungs = ys.map(makeRung)
            root = scene.add.container(0, 0, rungs.map(r => r.container)).setDepth(DEPTH.ladder + 1)
            rect.y = (top + WORLD.groundY) / 2
            rect.h = WORLD.groundY - top
            await FX.all(...rungs.map((r, k) => FX.popIn(scene, r.container, { from: 0.3, delay: 80 + k * 90 })))
        },
        glow(rung) {
            stopGlow()
            const view = rungs[rung]
            if (!view) return
            paintGlow(view.glow, C.gold)
            view.glow.setAlpha(0.35)
            const tween = scene.tweens.add({
                targets: view.glow,
                alpha: 1,
                duration: 560,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
            glowing = { view, tween }
        },
        async fill(rung, art) {
            const view = rungs[rung]
            if (!view) return
            if (glowing?.view === view) stopGlow()
            view.pic.set(art)
            view.hollow.setVisible(false)
            view.plaque.setVisible(true).setScale(1).setAngle(0).setAlpha(1).setPosition(0, 0)
            await FX.impact(scene, view.plaque, 0.16)
            void FX.sparks(scene, WORLD.ladderX, view.y, { color: C.gold, count: 10, spread: 120, depth: DEPTH.worldFx })
        },
        empty(rung) {
            const view = rungs[rung]
            if (!view) return
            FX.kill(scene, view.plaque)
            view.plaque.setVisible(false).setPosition(0, 0).setAngle(0).setAlpha(1).setScale(1)
            view.hollow.setVisible(true)
            scene.tweens.killTweensOf(view.glow)
            view.glow.setAlpha(1)
            paintGlow(view.glow, null)
        },
        async reject(rung, art) {
            const view = rungs[rung]
            if (!view) return
            if (glowing?.view === view) stopGlow()
            const ghost = createArtView(scene, WORLD.ladderX, view.y, RUNG.art)
            ghost.set(art)
            ghost.container.setDepth(DEPTH.flying)
            falling.add(ghost)
            await FX.to(scene, ghost.container, { x: WORLD.ladderX + 26, angle: 10 }, { duration: 90 })
            await FX.to(scene, ghost.container, { x: WORLD.ladderX - 26, angle: -10 }, { duration: 90 })
            await FX.to(scene, ghost.container, { x: WORLD.ladderX + 150, y: view.y - 50, angle: 30 }, { duration: 220, ease: 'Quad.easeOut' })
            await FX.to(scene, ghost.container, { y: WORLD.groundY + 60, angle: 160, alpha: 0 }, { duration: 560, ease: 'Quad.easeIn' })
            falling.delete(ghost)
            ghost.destroy()
        },
        light(rung) {
            const view = rungs[rung]
            if (!view) return
            if (glowing?.view === view) stopGlow()
            scene.tweens.killTweensOf(view.glow)
            paintGlow(view.glow, C.gold)
            view.glow.setAlpha(1)
            void FX.to(scene, view.container, { scale: 1.08 }, { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
            void FX.to(scene, view.glow, { alpha: 0 }, { duration: 420, delay: 180 }).then(() => {
                if (view.glow.active) paintGlow(view.glow, null)
            })
        },
        unlight() {
            stopGlow()
            rungs.forEach(r => {
                scene.tweens.killTweensOf(r.glow)
                r.glow.setAlpha(1)
                paintGlow(r.glow, null)
            })
        },
        rungPoint(rung) {
            return { x: WORLD.ladderX, y: rungs[rung]?.y ?? WORLD.groundY }
        },
        stand(rung) {
            return { x: KID.sideX, y: (rungs[rung]?.y ?? WORLD.groundY) + KID.feet }
        },
        foot() {
            return { x: KID.sideX, y: WORLD.groundY }
        },
        rungRect(rung) {
            return { x: WORLD.ladderX, y: rungs[rung]?.y ?? WORLD.groundY, w: RUNG.w + 30, h: RUNG.h + 20 }
        },
        rect,
        destroy() {
            clear()
        },
    }
}
