import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { PIECE_CELL, PIECES } from '../data/files'
import { DEPTH, KID, LADDER, RUNG } from '../data/layout'
import { C } from '../data/theme'
import type { Art, Point } from '../types'
import { createArtView, type ArtView } from './board'

export interface Ladder {
    build(rungs: number): Promise<void>
    glow(rung: number): void
    fill(rung: number, art: Art): Promise<void>
    light(rung: number): void
    unlight(): void
    rungPoint(rung: number): Point
    stand(rung: number): Point
    foot(): Point
    rungRect(rung: number): GuideRect
    readonly rect: GuideRect
    destroy(): void
}

interface RungView {
    container: Phaser.GameObjects.Container
    glow: Phaser.GameObjects.Graphics
    hollow: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible
    plaque: Phaser.GameObjects.Container
    pic: ArtView
    y: number
}

const MID_Y = (LADDER.top + LADDER.bottom) / 2
const RAIL_H = LADDER.bottom - LADDER.top
const PLAQUE_SX = RUNG.w / RUNG.artW
const PLAQUE_SY = RUNG.h / RUNG.artH

function plaqueArt(scene: Phaser.Scene, cell: number, dashed: boolean): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
    if (scene.textures.exists(PIECES)) return scene.add.image(0, 0, PIECES, cell).setScale(PLAQUE_SX, PLAQUE_SY)
    const g = scene.add.graphics()
    const { w, h } = RUNG
    g.fillStyle(C.paperLight, dashed ? 0.6 : 1)
    g.fillRect(-w / 2, -h / 2, w, h)
    g.lineStyle(4, C.ink, 1)
    if (dashed) {
        for (let x = -w / 2; x < w / 2; x += 26) {
            g.lineBetween(x, -h / 2, Math.min(w / 2, x + 14), -h / 2)
            g.lineBetween(x, h / 2, Math.min(w / 2, x + 14), h / 2)
        }
    } else {
        g.lineBetween(-w / 2, -h / 2, w / 2, -h / 2)
        g.lineBetween(-w / 2, h / 2, w / 2, h / 2)
    }
    return g
}

export function createLadder(scene: Phaser.Scene): Ladder {
    let root: Phaser.GameObjects.Container | undefined
    let rungs: RungView[] = []
    let glowing: { view: RungView; tween: Phaser.Tweens.Tween } | undefined

    const paintGlow = (g: Phaser.GameObjects.Graphics, color: number | null) => {
        const { w, h } = RUNG
        g.clear()
        if (color === null) return
        g.fillStyle(color, 0.35)
        g.fillRoundedRect(-w / 2 - 22, -h / 2 + 2, w + 44, h - 4, 20)
        g.fillStyle(color, 0.9)
        g.fillRoundedRect(-w / 2 - 10, -h / 2 + 2, w + 20, h - 4, 14)
    }

    const stopGlow = () => {
        if (!glowing) return
        glowing.tween.remove()
        glowing.view.glow.setAlpha(1)
        paintGlow(glowing.view.glow, null)
        glowing = undefined
    }

    const makeRails = (): Phaser.GameObjects.GameObject => {
        if (scene.textures.exists(PIECES)) {
            const frame = scene.textures.getFrame(PIECES, PIECE_CELL.rails)
            return scene.add.image(0, 0, PIECES, PIECE_CELL.rails).setDisplaySize(frame.width, RAIL_H)
        }
        const g = scene.add.graphics()
        for (const side of [-1, 1]) {
            const x = (side * LADDER.railGap) / 2
            g.fillStyle(C.paperLight, 1)
            g.fillRoundedRect(x - 14, -RAIL_H / 2, 28, RAIL_H, 12)
            g.lineStyle(4, C.ink, 1)
            g.strokeRoundedRect(x - 14, -RAIL_H / 2, 28, RAIL_H, 12)
        }
        return g
    }

    const makeRung = (y: number): RungView => {
        const glow = scene.add.graphics()
        const hollow = plaqueArt(scene, PIECE_CELL.rungHollow, true)
        const pic = createArtView(scene, 0, 0, RUNG.art)
        const plaque = scene.add.container(0, 0, [plaqueArt(scene, PIECE_CELL.rung, false), pic.container]).setVisible(false)
        const container = scene.add.container(0, y - MID_Y, [glow, hollow, plaque])
        return { container, glow, hollow, plaque, pic, y }
    }

    const clear = () => {
        stopGlow()
        rungs.forEach(r => r.pic.destroy())
        rungs = []
        if (root) {
            FX.kill(scene, root)
            root.destroy()
        }
        root = undefined
    }

    return {
        async build(count) {
            clear()
            rungs = RUNG.ys.slice(0, count).map(makeRung)
            root = scene.add
                .container(LADDER.cx, MID_Y, [makeRails(), ...rungs.map(r => r.container)])
                .setDepth(DEPTH.ladder)
            await FX.all(
                FX.fadeIn(scene, root, 300),
                ...rungs.map((r, k) => FX.popIn(scene, r.container, { delay: 120 + k * 90 })),
            )
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
            view.plaque.setVisible(true)
            await FX.impact(scene, view.plaque, 0.16)
            void FX.sparks(scene, LADDER.cx, view.y, { color: C.gold, count: 10, spread: 110, depth: DEPTH.flying })
        },
        light(rung) {
            const view = rungs[rung]
            if (!view) return
            if (glowing?.view === view) stopGlow()
            scene.tweens.killTweensOf(view.glow)
            paintGlow(view.glow, C.gold)
            view.glow.setAlpha(1)
            void FX.to(scene, view.container, { scale: 1.06 }, { duration: 120, yoyo: true, ease: 'Sine.easeOut' })
            void FX.to(scene, view.glow, { alpha: 0 }, { duration: 420, delay: 160 }).then(() => {
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
            return { x: LADDER.cx, y: rungs[rung]?.y ?? RUNG.ys[0] }
        },
        stand(rung) {
            return { x: KID.railX, y: (rungs[rung]?.y ?? RUNG.ys[0]) + 12 }
        },
        foot() {
            return { x: KID.railX, y: KID.groundY }
        },
        rungRect(rung) {
            return { x: LADDER.cx, y: rungs[rung]?.y ?? RUNG.ys[0], w: RUNG.w + 20, h: RUNG.h + 16 }
        },
        rect: { x: LADDER.cx, y: MID_Y, w: LADDER.width, h: RAIL_H },
        destroy() {
            clear()
        },
    }
}
