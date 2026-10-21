import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { QUEEN_SHEET, cellKey, orderIcon, queenCell, sheetScale } from '../data/files'
import { ITEMS, orderPoly, plateScale } from '../data/fruits'
import { ORDER, PLATE, QUEEN, WD } from '../data/layout'
import { C } from '../data/theme'
import type { OrderKind, QueenPose, Rect } from '../types'
import type { View } from './view'

/** A rainha, o balão do pedido (só o desenho da fruta) e o contorno tracejado no prato. */
export interface Queen {
    ask(kind: OrderKind): Promise<void>
    hush(): void
    setPose(p: QueenPose): void
    cheer(): Promise<void>
    outline(kind: OrderKind): void
    /** A cara de nojo (folha suja): pose calma com uma tremidinha. */
    yuck(): Promise<void>
    glow(): Promise<void>
    rect(): Rect
    plateRect(): Rect
    destroy(): void
}

const DASH = 12
const GAP = 9

export function createQueen(scene: Phaser.Scene, view: View): Queen {
    const k = sheetScale(scene, QUEEN_SHEET)
    const scale = (QUEEN.w / QUEEN_SHEET.cellW) * k
    const shadow = scene.add.ellipse(QUEEN.x, QUEEN.y - 4, QUEEN.w * 0.7, 22, C.shadow, 0.2)
    const sprite = scene.add
        .image(QUEEN.x, QUEEN.y, QUEEN_SHEET.key, cellKey(queenCell('calm')))
        .setOrigin(0.5, (QUEEN_SHEET.cellH - 10) / QUEEN_SHEET.cellH)
        .setScale(scale)
    view.add(shadow, WD.actor + QUEEN.y - 1)
    view.add(sprite, WD.actor + QUEEN.y)

    // o balão do pedido: um círculo branco com o desenho da fruta
    const bx = QUEEN.x + ORDER.dx
    const by = QUEEN.y + ORDER.dy
    const bubbleArt = scene.add.graphics()
    bubbleArt.fillStyle(C.shadow, 0.2)
    bubbleArt.fillCircle(3, 5, ORDER.r)
    bubbleArt.fillStyle(C.white, 1)
    bubbleArt.fillCircle(0, 0, ORDER.r)
    bubbleArt.lineStyle(4, C.line, 1)
    bubbleArt.strokeCircle(0, 0, ORDER.r)
    // o rabinho, apontando para a cabeça da rainha (embaixo, à esquerda)
    const tail = { a: { x: -28, y: ORDER.r - 22 }, tip: { x: -44, y: ORDER.r + 26 }, b: { x: -2, y: ORDER.r - 6 } }
    bubbleArt.fillStyle(C.white, 1)
    bubbleArt.fillTriangle(tail.a.x, tail.a.y, tail.tip.x, tail.tip.y, tail.b.x, tail.b.y)
    bubbleArt.lineBetween(tail.a.x, tail.a.y, tail.tip.x, tail.tip.y)
    bubbleArt.lineBetween(tail.b.x, tail.b.y, tail.tip.x, tail.tip.y)
    const icon = scene.add.image(0, 0, '__DEFAULT')
    const bubble = scene.add.container(bx, by, [bubbleArt, icon]).setVisible(false)
    view.add(bubble, WD.wind + 10)

    const line = scene.add.graphics()
    view.add(line, WD.outline)
    const halo = scene.add.graphics().setAlpha(0)
    view.add(halo, WD.placed - 1)

    const setPose = (p: QueenPose) => sprite.setFrame(cellKey(queenCell(p)))

    return {
        async ask(fruit) {
            setPose('ask')
            const art = orderIcon(scene, fruit, ORDER.r * 1.5)
            icon.setTexture(art.key, art.frame).setScale(art.scale)
            bubble.setVisible(true).setScale(1)
            await FX.popIn(scene, bubble, { from: 0.4, duration: 360 })
        },
        hush() {
            scene.tweens.killTweensOf(bubble)
            bubble.setVisible(false)
            setPose('calm')
        },
        setPose,
        async cheer() {
            setPose('happy')
            await FX.to(scene, sprite, { y: QUEEN.y - 22 }, { duration: 200, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
            sprite.setY(QUEEN.y)
        },
        outline(fruit) {
            line.clear()
            halo.clear().setAlpha(0)
            const ps = plateScale(fruit)
            const pts = orderPoly(fruit).map(p => ({ x: PLATE.x + p.x * ps, y: PLATE.y + p.y * ps }))
            const ink = fruit === 'gigante' || ITEMS[fruit].form === 'leaf' ? C.giantDark : ITEMS[fruit].pulpDark
            line.lineStyle(4, ink, 0.85)
            // tracejado: anda pelo contorno contando o comprimento
            let carry = 0
            let on = true
            for (let i = 0; i < pts.length; i++) {
                const a = pts[i]
                const b = pts[(i + 1) % pts.length]
                const len = Math.hypot(b.x - a.x, b.y - a.y)
                let t = 0
                while (t < len) {
                    const left = (on ? DASH : GAP) - carry
                    const step = Math.min(left, len - t)
                    if (on) {
                        const p0 = { x: a.x + ((b.x - a.x) * t) / len, y: a.y + ((b.y - a.y) * t) / len }
                        const p1 = { x: a.x + ((b.x - a.x) * (t + step)) / len, y: a.y + ((b.y - a.y) * (t + step)) / len }
                        line.lineBetween(p0.x, p0.y, p1.x, p1.y)
                    }
                    t += step
                    carry += step
                    if (carry >= (on ? DASH : GAP) - 0.001) {
                        carry = 0
                        on = !on
                    }
                }
            }
            halo.fillStyle(C.butter, 0.8)
            halo.fillPoints(
                pts.map(p => ({ x: PLATE.x + (p.x - PLATE.x) * 1.16, y: PLATE.y + (p.y - PLATE.y) * 1.16 })),
                true,
                true,
            )
        },
        async yuck() {
            setPose('calm')
            await FX.to(scene, sprite, { x: QUEEN.x + 6, angle: -4 }, { duration: 70, yoyo: true, repeat: 5 })
            sprite.setPosition(QUEEN.x, QUEEN.y).setAngle(0)
        },
        async glow() {
            line.clear()
            void FX.sparks(scene, PLATE.x, PLATE.y, { color: C.butter, count: 18, spread: 140, size: 10, depth: 80 })
            await FX.to(scene, halo, { alpha: 1 }, { duration: 260, yoyo: true, repeat: 1 })
            halo.setAlpha(0)
        },
        rect: () => ({ x: QUEEN.x, y: QUEEN.y - 80, w: QUEEN.w, h: 190 }),
        plateRect: () => ({ x: PLATE.x, y: PLATE.y, w: PLATE.r * 2 + 20, h: PLATE.r * 2 + 20 }),
        destroy() {
            scene.tweens.killTweensOf([sprite, bubble, halo])
            sprite.destroy()
            shadow.destroy()
            bubble.destroy()
            line.destroy()
            halo.destroy()
        },
    }
}
