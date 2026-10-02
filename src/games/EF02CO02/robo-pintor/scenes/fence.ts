import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { BOARD_CELL, FENCE as FENCE_KEY, PIECE, PIECES, PIECE_SIZE, PLANK } from '../data/files'
import { CAT, DEPTH, FENCE, plankX } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

export interface Fence {
    build(marks: number[] | null, boards: number): Promise<void>
    paintPlank(i: number, color: number): Promise<void>
    paintCat(color: number): Promise<void>
    paintGrass(i: number, color: number): Promise<void>
    purr(): Promise<void>
    shine(): Promise<void>
    flag(indices: number[]): Promise<void>
    popNumber(i: number, label?: number, color?: number): Promise<void>
    countHint(groups: { count: number; color: number }[]): Promise<void>
    wash(): Promise<void>
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
    let chalk: Phaser.GameObjects.Graphics | undefined

    const originY = BOARD_CELL.base / BOARD_CELL.h
    const all = (): (Piece | Phaser.GameObjects.Graphics)[] => [...planks, ...coats, ...(post ? [post] : []), ...(cat ? [cat] : []), ...(chalk ? [chalk] : []), ...extras]

    const wipe = () => {
        all().forEach(o => {
            scene.tweens.killTweensOf(o)
            o.destroy()
        })
        planks = []
        coats = []
        post = undefined
        cat = undefined
        chalk = undefined
        extras = []
    }

    const sleepCat = () => {
        if (!cat) return
        scene.tweens.killTweensOf(cat)
        cat.setFrame(PIECE.catSleep).setScale(CAT.scale).setY(CAT.foot)
        void FX.to(scene, cat, { scaleY: CAT.scale * 0.95 }, { duration: 900, yoyo: true, repeat: -1 })
    }

    const splat = (x: number, y: number, color: number, size: number, depth: number) => {
        const s = scene.add
            .image(x, y, PIECES, PIECE.splat)
            .setTint(color)
            .setDepth(depth)
            .setScale(0.05)
            .setAngle(Phaser.Math.Between(0, 360))
        extras.push(s)
        return FX.to(scene, s, { scale: size / PIECE_SIZE }, { duration: 200, ease: Ease.back(2) })
    }

    const numberAt = (i: number, label = i + 1, color: string = CSS.white) => {
        const t = scene.add
            .text(plankX(boards, i), FENCE.base - 110, String(label), {
                fontFamily: FONT.black,
                fontSize: '64px',
                color,
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
        async build(marks, n) {
            wipe()
            boards = n
            if (marks) {
                chalk = scene.add.graphics().setDepth(DEPTH.fence + 3)
                marks.forEach((color, i) => {
                    const x = plankX(n, i)
                    chalk?.fillStyle(C.white, 1)
                    chalk?.fillCircle(x, FENCE.base - 28, 15)
                    chalk?.fillStyle(color, 1)
                    chalk?.fillCircle(x, FENCE.base - 28, 11)
                })
            }
            for (let i = 0; i < n; i++) {
                const x = plankX(n, i)
                planks.push(plank(x, PLANK.raw, DEPTH.fence))
                coats.push(plank(x, PLANK.painted, DEPTH.fence + 1).setVisible(false))
            }
            post = plank(plankX(n, n), PLANK.post, DEPTH.fence)
            cat = scene.add.image(plankX(n, n), CAT.foot, PIECES, PIECE.catSleep).setOrigin(0.5, CAT.originY).setScale(CAT.scale).setDepth(DEPTH.cat)
            const group = all()
            group.forEach(o => {
                o.x += FENCE.enterDX
            })
            await FX.to(scene, group, { x: `-=${FENCE.enterDX}` }, { duration: 700, ease: Ease.smooth })
            sleepCat()
        },
        async paintPlank(i, color) {
            const coat = coats[i]
            if (!coat) return
            coat.setTint(color).setVisible(true).setAlpha(0)
            void splat(plankX(boards, i) + 22, FENCE.base - 90, color, 60, DEPTH.fence + 2)
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
                    FX.wait(scene, i * 90).then(() => FX.sparks(scene, c.x, FENCE.base - 110, { color: C.glow, count: 8, spread: 90 })),
                ),
            )
        },
        async flag(indices) {
            await Promise.all(indices.map(i => FX.ping(scene, plankX(boards, i), FENCE.base - 95, C.glow, { radius: 90, duration: 700, depth: DEPTH.fx })))
        },
        popNumber(i, label, color) {
            return numberAt(i, label, color === undefined ? CSS.white : hex(color))
        },
        async countHint(groups) {
            let i = 0
            for (const group of groups) {
                for (let k = 0; k < group.count; k++) {
                    await numberAt(i, k + 1, groups.length > 1 ? hex(group.color) : CSS.white)
                    await FX.wait(scene, 160)
                    i++
                }
            }
        },
        async wash() {
            const splats = extras
            extras = []
            await Promise.all([
                ...coats.filter(c => c.visible).map(c => FX.to(scene, c, { alpha: 0 }, { duration: 420 })),
                ...splats.map(s => FX.to(scene, s, { alpha: 0 }, { duration: 420 })),
            ])
            splats.forEach(s => s.destroy())
            coats.forEach(c => c.setVisible(false).setAlpha(1))
            sleepCat()
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
