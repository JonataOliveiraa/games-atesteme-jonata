import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { BOARD_CELL, FENCE as FENCE_KEY, PIECE, PIECES, PLANK } from '../data/files'
import { CAT, DEPTH, FENCE, plankX } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface Fence {
    build(boards: number): Promise<void>
    paintPlank(i: number, color: number): Promise<void>
    paintCat(color: number): Promise<void>
    paintGrass(i: number, color: number): Promise<void>
    purr(): Promise<void>
    shine(): Promise<void>
    shineRaw(from: number): Promise<void>
    popNumber(i: number): Promise<void>
    countHint(): Promise<void>
    clear(): Promise<void>
    destroy(): void
}

type Piece = Phaser.GameObjects.Image | Phaser.GameObjects.Text

export function createFence(scene: Phaser.Scene): Fence {
    let boards = 0
    let planks: Phaser.GameObjects.Image[] = []
    let coats: Phaser.GameObjects.Image[] = []
    let post: Phaser.GameObjects.Image | undefined
    let cat: Phaser.GameObjects.Image | undefined
    let extras: Piece[] = []

    const originY = BOARD_CELL.base / BOARD_CELL.h
    const all = (): Piece[] => [...planks, ...coats, ...(post ? [post] : []), ...(cat ? [cat] : []), ...extras]

    const wipe = () => {
        all().forEach(o => {
            scene.tweens.killTweensOf(o)
            o.destroy()
        })
        planks = []
        coats = []
        post = undefined
        cat = undefined
        extras = []
    }

    const splat = (x: number, y: number, color: number, size: number, depth: number) => {
        const s = scene.add
            .image(x, y, PIECES, PIECE.splat)
            .setTint(color)
            .setDepth(depth)
            .setScale(0.05)
            .setAngle(Phaser.Math.Between(0, 360))
        extras.push(s)
        return FX.to(scene, s, { scale: size / 256 }, { duration: 200, ease: Ease.back(2) })
    }

    const numberAt = (i: number) => {
        const t = scene.add
            .text(plankX(boards, i), FENCE.base - 150, String(i + 1), {
                fontFamily: FONT.black,
                fontSize: '64px',
                color: CSS.white,
                stroke: CSS.ink,
                strokeThickness: 10,
            })
            .setOrigin(0.5)
            .setResolution(2)
            .setDepth(DEPTH.hint)
            .setScale(0.2)
        extras.push(t)
        return FX.to(scene, t, { scale: 1 }, { duration: 260, ease: Ease.back(2.4) })
    }

    const plank = (x: number, frame: number, depth: number) =>
        scene.add.image(x, FENCE.base, FENCE_KEY, frame).setOrigin(0.5, originY).setScale(FENCE.scale).setDepth(depth)

    return {
        async build(n) {
            wipe()
            boards = n
            for (let i = 0; i < n; i++) {
                const x = plankX(n, i)
                planks.push(plank(x, PLANK.raw, DEPTH.fence))
                coats.push(plank(x, PLANK.painted, DEPTH.fence + 1).setVisible(false))
            }
            post = plank(plankX(n, n), PLANK.post, DEPTH.fence)
            cat = scene.add.image(plankX(n, n), CAT.foot, PIECES, PIECE.catSleep).setOrigin(0.5, 0.86).setScale(CAT.scale).setDepth(DEPTH.cat)
            const group = all()
            group.forEach(o => {
                o.x += FENCE.enterDX
            })
            await FX.to(scene, group, { x: `-=${FENCE.enterDX}` }, { duration: 700, ease: Ease.smooth })
            if (cat) void FX.to(scene, cat, { scaleY: CAT.scale * 0.95 }, { duration: 900, yoyo: true, repeat: -1 })
        },
        async paintPlank(i, color) {
            const coat = coats[i]
            if (!coat) return
            coat.setTint(color).setVisible(true).setAlpha(0)
            void splat(plankX(boards, i) + 22, FENCE.base - 120, color, 60, DEPTH.fx)
            await FX.to(scene, coat, { alpha: 1 }, { duration: 260 })
        },
        async paintCat(color) {
            if (!cat) return
            scene.tweens.killTweensOf(cat)
            cat.setFrame(PIECE.catJump).setScale(CAT.scale)
            const { x, y } = cat
            await Promise.all([
                FX.to(scene, cat, { y: y - 70 }, { duration: 220, yoyo: true, ease: Ease.smooth }),
                splat(x - 10, y - 90, color, 60, DEPTH.cat + 1),
                splat(x + 22, y - 50, color, 44, DEPTH.cat + 1),
                splat(x - 24, y - 26, color, 36, DEPTH.cat + 1),
            ])
        },
        async paintGrass(i, color) {
            await splat(plankX(boards, i), FENCE.base + 22, color, 110, DEPTH.fence - 1)
        },
        async purr() {
            if (!cat) return
            const x = cat.x
            const y = cat.y - 90
            await Promise.all(
                [0, 1, 2].map(k =>
                    FX.wait(scene, k * 180).then(() => {
                        const h = scene.add
                            .text(x + (k - 1) * 26, y, '♥', { fontFamily: FONT.black, fontSize: '36px', color: '#ff4b6e' })
                            .setOrigin(0.5)
                            .setResolution(2)
                            .setDepth(DEPTH.fx)
                        extras.push(h)
                        return FX.to(scene, h, { y: y - 70, alpha: 0 }, { duration: 900 })
                    }),
                ),
            )
        },
        async shine() {
            await Promise.all(
                coats.map((c, i) =>
                    FX.wait(scene, i * 90).then(() => FX.sparks(scene, c.x, FENCE.base - 150, { color: C.glow, count: 8, spread: 90 })),
                ),
            )
        },
        async shineRaw(from) {
            await Promise.all(planks.slice(from).map(p => FX.ping(scene, p.x, FENCE.base - 120, C.glow, { radius: 90, duration: 700, depth: DEPTH.fx })))
        },
        popNumber(i) {
            return numberAt(i)
        },
        async countHint() {
            for (let i = 0; i < boards; i++) {
                await numberAt(i)
                await FX.wait(scene, 160)
            }
        },
        async clear() {
            const group = all()
            group.forEach(o => scene.tweens.killTweensOf(o))
            await FX.to(scene, group, { x: `-=${FENCE.enterDX}`, alpha: 0 }, { duration: 500, ease: Ease.smooth })
            wipe()
        },
        destroy() {
            wipe()
        },
    }
}
