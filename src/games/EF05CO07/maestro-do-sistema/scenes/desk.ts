import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, DESK, H, W, deskSlots } from '../data/layout'
import { C } from '../data/theme'
import type { Piece } from '../types'
import { makePiece } from './pieceArt'

export interface Desk {
    slotPoint(piece: Piece): { x: number; y: number }
    send(piece: Piece, to: { x: number; y: number }): Promise<void>
    back(piece: Piece, from: { x: number; y: number }): Promise<void>
    setRing(piece: Piece, left: number): void
    flashBusy(piece: Piece): void
    pulse(piece: Piece): void
    enter(): Promise<void>
    destroy(): void
}

const CARD = 156

export function createDesk(scene: Phaser.Scene, pieces: Piece[], center = W / 2): Desk {
    const xs = deskSlots(pieces.length, center)
    const at = new Map<Piece, number>()
    pieces.forEach((p, i) => at.set(p, xs[i]))

    const root = scene.add.container(0, 0).setDepth(DEPTH.desk)

    const tall = H - DESK.top - 12
    const board = scene.add.graphics()
    board.fillStyle(C.ink, 0.3)
    board.fillRoundedRect(84, DESK.top + 8, W - 168, tall, 26)
    board.fillStyle(C.woodDark, 1)
    board.fillRoundedRect(80, DESK.top, W - 160, tall, 24)
    board.fillStyle(C.wood, 1)
    board.fillRoundedRect(88, DESK.top + 6, W - 176, tall - 14, 20)
    board.fillStyle(C.gold, 0.9)
    board.fillRoundedRect(88, DESK.top + 6, W - 176, 9, 5)
    root.add(board)

    const pockets = scene.add.graphics()
    xs.forEach(x => {
        pockets.fillStyle(C.ink, 0.22)
        pockets.fillRoundedRect(x - DESK.w / 2, DESK.cy - DESK.h / 2 + 6, DESK.w, DESK.h, 20)
        pockets.fillStyle(C.cream, 0.35)
        pockets.fillRoundedRect(x - DESK.w / 2, DESK.cy - DESK.h / 2, DESK.w, DESK.h, 20)
    })
    root.add(pockets)

    const rings = scene.add.graphics().setDepth(DEPTH.ring)
    const left = new Map<Piece, number>()

    const paintRings = () => {
        rings.clear()
        left.forEach((value, piece) => {
            const x = at.get(piece)!
            rings.lineStyle(10, C.ink, 0.22)
            rings.strokeCircle(x, DESK.cy, DESK.ringR)
            rings.lineStyle(10, value < 0.28 ? C.gold : C.teal, 0.95)
            rings.beginPath()
            rings.arc(x, DESK.cy, DESK.ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * value, false)
            rings.strokePath()
        })
    }

    /*
     * A ESCALA DE REPOUSO DE CADA PEÇA, GUARDADA.
     *
     * O sprite nasce de `setDisplaySize`, então o `scale` dele NÃO é 1 — é o
     * que couber na célula. Animar para `scale: 1` devolvia a peça ao tamanho
     * cheio da folha, e ela voltava ao atril maior do que saiu. Todo tween daqui
     * para baixo é relativo a `base`.
     */
    const cards = new Map<Piece, Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics>()
    const base = new Map<Piece, number>()
    pieces.forEach(piece => {
        const art = makePiece(scene, piece, CARD)
        art.setDepth(DEPTH.slot)
        art.setPosition(at.get(piece)!, DESK.cy)
        cards.set(piece, art)
        base.set(piece, art.scaleX)
    })
    const rest = (piece: Piece) => base.get(piece) ?? 1

    return {
        slotPoint: piece => ({ x: at.get(piece) ?? W / 2, y: DESK.cy }),

        send: async (piece, to) => {
            const card = cards.get(piece)
            if (!card) return
            card.setDepth(DEPTH.fly)
            left.set(piece, 1)
            paintRings()
            const r = rest(piece)
            // a peça pode ainda estar voltando de uma entrega anterior: parte
            // sempre do encaixe, não de onde o tween a tiver deixado
            FX.kill(scene, card)
            card.setPosition(at.get(piece)!, DESK.cy).setScale(r).setAngle(0).setAlpha(1).setVisible(true)
            void FX.ping(scene, at.get(piece)!, DESK.cy, C.gold, { radius: 78, depth: DEPTH.ring })
            await FX.to(scene, card, { scale: r * 1.16 }, { duration: 130, ease: 'Back.easeOut' })
            await FX.all(
                FX.arcTo(scene, card, to, { height: 190, duration: 520 }),
                FX.to(scene, card, { scale: r * 0.72, angle: 320 }, { duration: 520 }),
            )
            await FX.to(scene, card, { scale: 0, alpha: 0 }, { duration: 180, ease: 'Back.easeIn' })
            card.setVisible(false)
        },

        back: async (piece, from) => {
            const card = cards.get(piece)
            if (!card) return
            left.delete(piece)
            paintRings()
            const r = rest(piece)
            card.setPosition(from.x, from.y).setScale(0).setAlpha(1).setAngle(0).setVisible(true)
            await FX.to(scene, card, { scale: r * 0.72 }, { duration: 160, ease: 'Back.easeOut' })
            await FX.all(
                FX.arcTo(scene, card, { x: at.get(piece)!, y: DESK.cy }, { height: 170, duration: 520 }),
                FX.to(scene, card, { scale: r, angle: -360 }, { duration: 520 }),
            )
            card.setAngle(0)
            card.setDepth(DEPTH.slot)
            void FX.ping(scene, at.get(piece)!, DESK.cy, C.green, { radius: 86, depth: DEPTH.ring })
            await FX.to(scene, card, { scaleX: r * 1.16, scaleY: r * 0.86 }, { duration: 110 })
            await FX.to(scene, card, { scaleX: r, scaleY: r }, { duration: 280, ease: 'Back.easeOut' })
        },

        setRing: (piece, value) => {
            if (!left.has(piece)) return
            left.set(piece, Phaser.Math.Clamp(value, 0, 1))
            paintRings()
        },

        flashBusy: piece => {
            const x = at.get(piece)
            if (x === undefined) return
            void FX.ping(scene, x, DESK.cy, C.gold, { radius: 96, depth: DEPTH.ring })
        },

        pulse: piece => {
            const card = cards.get(piece)
            if (!card || !card.visible) return
            FX.kill(scene, card)
            void FX.to(scene, card, { scale: rest(piece) * 1.12 }, {
                duration: 260, yoyo: true, ease: 'Sine.easeInOut',
            })
        },

        enter: async () => {
            const drop = H - DESK.top + 40
            root.setY(drop)
            cards.forEach(card => card.setY(DESK.cy + drop))
            await FX.all(
                FX.to(scene, root, { y: 0 }, { duration: 620, ease: 'Back.easeOut' }),
                ...[...cards.values()].map((card, i) =>
                    FX.to(scene, card, { y: DESK.cy }, {
                        duration: 620, delay: 70 * i, ease: 'Back.easeOut',
                    })),
            )
        },

        destroy: () => {
            FX.kill(scene, root)
            cards.forEach(card => {
                FX.kill(scene, card)
                card.destroy()
            })
            rings.destroy()
            root.destroy(true)
        },
    }
}
